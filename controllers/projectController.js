const db = require('../config/db');
const cloudinary = require('../config/cloudinaryConfig');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Set up Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'project_images', // Cloudinary folder name
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});
const upload = multer({ storage: storage }).fields([
  { name: 'project_image', maxCount: 1 },
  { name: 'detail_image', maxCount: 10 }, // Multiple detail images
]);
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
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: 'File upload error' });
    }

    const { project_name, description, start_date, end_date, details, categories } = req.body;
    let projectImage = null;

    try {
      // Upload main project image if exists
      if (req.files['project_image']) {
        const uploadedImage = await cloudinary.uploader.upload(req.files['project_image'][0].path);
        projectImage = uploadedImage.secure_url;
      }

      // Insert the project data into the projects table
      const projectQuery = `
        INSERT INTO projects (project_name, description, image_url, start_date, end_date, profile_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const projectValues = [project_name, description, projectImage, start_date, end_date, 1]; // Assuming profile_id is 1 for now
      const projectResult = await new Promise((resolve, reject) => {
        db.query(projectQuery, projectValues, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      const projectId = projectResult.insertId;

      // Insert categories into the categories table
      if (categories && categories.length > 0) {
        const categoryQuery = `INSERT INTO categories (category_name) VALUES ?`;
        const categoryValues = categories.map((category) => [category]);
        await new Promise((resolve, reject) => {
          db.query(categoryQuery, [categoryValues], (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
      }

      // Insert project details into the project_details table
      if (details && details.length > 0) {
        const detailQuery = `
          INSERT INTO project_details (project_id, detail_description, technologies_used, image_url, category_id)
          VALUES ?
        `;

        const detailValues = details.map((detail, index) => {
          const detailImage = req.files[`detail_image[${index}]`] ? req.files[`detail_image[${index}]`][0].path : null;
          return [projectId, detail.description, detail.technologies_used, detailImage, detail.category_id];
        });

        await new Promise((resolve, reject) => {
          db.query(detailQuery, [detailValues], (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
      }

      res.status(201).json({ message: 'Project, details, and categories created successfully!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create project with details and categories' });
    }
  });
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
