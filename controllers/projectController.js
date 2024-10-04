const db = require('../config/db');

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

// Create a new project with profile_id and image upload
exports.createProject = (req, res) => {
  const { project_name, description, profile_id } = req.body;
  const projectImage = req.file ? `uploads/${req.file.filename}` : null;

  const query = 'INSERT INTO projects (project_name, description, profile_id, image_url) VALUES (?, ?, ?, ?)';
  db.query(query, [project_name, description, profile_id, projectImage], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: results.insertId, project_name, description, profile_id, image_url: projectImage });
  });
};

// Update a project by ID with profile_id and image upload
exports.updateProject = (req, res) => {
  const { project_name, description, profile_id } = req.body;
  const projectImage = req.file ? `uploads/${req.file.filename}` : req.body.existingImage;

  const query = 'UPDATE projects SET project_name = ?, description = ?, profile_id = ?, image_url = ? WHERE id = ?';
  db.query(query, [project_name, description, profile_id, projectImage, req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Project updated successfully!', image_url: projectImage });
  });
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
