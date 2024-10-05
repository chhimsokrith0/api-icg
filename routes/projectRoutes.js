const express = require('express');
const { body, validationResult } = require('express-validator');
const projectController = require('../controllers/projectController');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig'); // Cloudinary config

const router = express.Router();

// Set up multer to use Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'project_images', // Folder in Cloudinary for project images
    allowed_formats: ['jpeg', 'png', 'jpg'],
  },
});

const upload = multer({ storage: storage });

// Validation rules for creating/updating projects
const projectValidationRules = [
  body('project_name').notEmpty().withMessage('Project name is required.'),
  body('description').notEmpty().withMessage('Description is required.'),
  body('profile_id').isInt({ gt: 0 }).withMessage('Valid profile_id is required.'),
];

// Middleware for checking validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Routes for project CRUD operations
router.get('/', projectController.getAllProjects); // Get all projects with profile details
router.get('/:id', projectController.getProjectById); // Get project by ID with profile details
router.post('/', upload.single('projectImage'), projectValidationRules, validate, projectController.createProject); // Create a new project with image upload and validation
router.put('/:id', upload.single('projectImage'), projectValidationRules, validate, projectController.updateProject); // Update project by ID with image upload and validation
router.delete('/:id', projectController.deleteProject); // Delete project by ID

module.exports = router;
