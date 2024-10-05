const db = require('../config/db');
const cloudinary = require('../config/cloudinaryConfig');

// Get all projects with associated profile details
exports.getAllProjects = (req, res) => {
  const query = `
    SELECT * FROM projects
    INNER JOIN profiles
    ON projects.profile_id = profiles.id
  `;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Get a project by ID with associated profile details
exports.getProjectById = (req, res) => {
  const query = `
    SELECT * FROM projects
    INNER JOIN profiles
    ON projects.profile_id = profiles.id
    WHERE projects.id = ?
  `;
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0]);
  });
};

// Create a new project with profile_id and image upload to Cloudinary
exports.createProject = async (req, res) => {
  const { project_name, description, profile_id } = req.body;

  try {
    // Upload image to Cloudinary if file is provided
    let projectImage = null;
    if (req.file) {
      const uploadedImage = await cloudinary.uploader.upload(req.file.path);
      projectImage = uploadedImage.secure_url; // Get the secure URL from Cloudinary
    }

    const query = 'INSERT INTO projects (project_name, description, profile_id, image_url) VALUES (?, ?, ?, ?)';
    db.query(query, [project_name, description, profile_id, projectImage], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: results.insertId, project_name, description, profile_id, image_url: projectImage });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a project by ID with profile_id and image upload to Cloudinary
exports.updateProject = async (req, res) => {
  const { project_name, description, profile_id } = req.body;

  try {
    // If a new file is provided, upload it to Cloudinary, otherwise use the existing image
    let projectImage = req.body.existingImage;
    if (req.file) {
      const uploadedImage = await cloudinary.uploader.upload(req.file.path);
      projectImage = uploadedImage.secure_url; // Get the secure URL from Cloudinary
    }

    const query = 'UPDATE projects SET project_name = ?, description = ?, profile_id = ?, image_url = ? WHERE id = ?';
    db.query(query, [project_name, description, profile_id, projectImage, req.params.id], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Project updated successfully!', image_url: projectImage });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a project by ID
exports.deleteProject = (req, res) => {
  const query = 'DELETE FROM projects WHERE id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Project deleted successfully!' });
  });
};
