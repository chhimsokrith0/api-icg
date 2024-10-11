// projectDetailsController.js
const db = require('../config/db');

// Get all project details
exports.getAllProjectDetails = (req, res) => {
  const query = 'SELECT * FROM project_details';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Get project details by ID
exports.getProjectDetailsById = (req, res) => {
  const query = 'SELECT * FROM project_details WHERE id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0]);
  });
};

// Create new project detail with image upload to Cloudinary
exports.createProjectDetail = (req, res) => {
  const { project_id, detail_description, technologies_used, documentation_url, category_id } = req.body;
  const projectImage = req.file ? req.file.path : null; // Cloudinary URL for the image

  const query = `
    INSERT INTO project_details (project_id, detail_description, technologies_used, documentation_url, category_id, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [project_id, detail_description, technologies_used, documentation_url, category_id, projectImage], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: results.insertId, ...req.body, project_image_url: projectImage });
  });
};

// Update project detail by ID with image upload to Cloudinary
exports.updateProjectDetail = (req, res) => {
  const { detail_description, technologies_used, documentation_url, category_id } = req.body;
  const projectImage = req.file ? req.file.path : req.body.existingImage; // Use Cloudinary URL if available

  const query = `
    UPDATE project_details
    SET detail_description = ?, technologies_used = ?, documentation_url = ?, category_id = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  db.query(query, [detail_description, technologies_used, documentation_url, category_id, projectImage, req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Project details updated successfully!', project_image_url: projectImage });
  });
};

// Delete project detail by ID
exports.deleteProjectDetail = (req, res) => {
  const query = 'DELETE FROM project_details WHERE id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Project detail deleted successfully!' });
  });
};
