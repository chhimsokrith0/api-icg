const db = require('../config/db');
const cloudinary = require('../config/cloudinaryConfig');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Set up Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    if (file.fieldname === 'project_image') {
      return { folder: 'project_images', allowed_formats: ['jpg', 'png', 'jpeg'] };
    } else if (file.fieldname.startsWith('detail_image')) {
      return { folder: 'detail_images', allowed_formats: ['jpg', 'png', 'jpeg'] };
    } else if (file.fieldname.startsWith('detail_file')) {
      return { folder: 'detail_files', allowed_formats: ['pdf'] };
    }
  }
});

// Multer configuration for handling image and file uploads
const upload = multer({ storage: storage }).fields([
  { name: 'project_image', maxCount: 1 },
  { name: 'detail_image', maxCount: 10 }, // Multiple detail images
  { name: 'detail_file', maxCount: 10 } // Multiple detail documentation files
]);


// Get all projects with associated profile details
exports.getAllProjects = (req, res) => {
  const query = `
    SELECT * FROM project_details
    INNER JOIN projects
    ON project_details.project_id = projects.id
    INNER JOIN profiles
    ON profiles.id = projects.profile_id
    INNER JOIN categories
    ON categories.id = project_details.category_id
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
    SELECT * FROM project_details
    INNER JOIN projects
    ON project_details.project_id = projects.id
    INNER JOIN profiles
    ON profiles.id = projects.profile_id
    INNER JOIN categories
    ON categories.id = project_details.category_id
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
      console.error('Multer Error:', err.message);
      return res.status(500).json({ error: 'File upload error: ' + err.message });
    }

    const { project_name, description, start_date, end_date, details, categories, profile_id } = req.body;
    let projectImage = null;

    try {
      // Upload main project image if exists
      if (req.files && req.files['project_image']) {
        const uploadedImage = await cloudinary.uploader.upload(req.files['project_image'][0].path);
        projectImage = uploadedImage.secure_url;
      }

      // Insert the project data into the projects table
      const projectQuery = `
        INSERT INTO projects (project_name, description, image_url, start_date, end_date, profile_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const projectValues = [project_name, description, projectImage, start_date, end_date, profile_id || 1];
      const projectResult = await new Promise((resolve, reject) => {
        db.query(projectQuery, projectValues, (err, result) => {
          if (err) {
            console.error('Database Insert Error:', err.message);
            reject(err);
          } else resolve(result);
        });
      });

      const projectId = projectResult.insertId;

      // Insert project details into the project_details table
      if (details && details.length > 0) {
        for (let index = 0; index < details.length; index++) {
          const detail = details[index];
          let detailImageUrl = null;
          let detailFileUrl = null;

          // Upload detail image if exists
          if (req.files && req.files['detail_image'] && req.files['detail_image'][index]) {
            const uploadedDetailImage = await cloudinary.uploader.upload(req.files['detail_image'][index].path);
            detailImageUrl = uploadedDetailImage.secure_url;
          }

          // Upload detail documentation file if exists
          if (req.files && req.files['detail_file'] && req.files['detail_file'][index]) {
            const uploadedDetailFile = await cloudinary.uploader.upload(req.files['detail_file'][index].path, {
              resource_type: "raw"
            });
            detailFileUrl = uploadedDetailFile.secure_url;
          }

          const detailQuery = `
            INSERT INTO project_details (project_id, detail_description, technologies_used, image_url, documentation_url, category_id)
            VALUES (?, ?, ?, ?, ?, ?)
          `;
          const detailValues = [projectId, detail.description, detail.technologies_used, detailImageUrl, detailFileUrl, detail.category_id];
          await new Promise((resolve, reject) => {
            db.query(detailQuery, detailValues, (err, result) => {
              if (err) {
                console.error('Database Detail Insert Error:', err.message);
                reject(err);
              } else resolve(result);
            });
          });
        }
      }

      res.status(201).json({ message: 'Project, details, and categories created successfully!' });
    } catch (error) {
      console.error('Error in createProject:', error.message);
      res.status(500).json({ error: `Failed to create project: ${error.message}` });
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
