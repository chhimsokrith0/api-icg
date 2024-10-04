
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const projectController = require('../controllers/projectController');
const multer = require('multer');
const path = require('path');

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');  // Directory to store images
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Give each file a unique name
  }
});

const upload = multer({ storage: storage });

// Validation rules
const projectValidationRules = [
  body('project_name').notEmpty().withMessage('Project name is required.'),
  body('description').notEmpty().withMessage('Description is required.'),
  body('profile_id').isInt({ gt: 0 }).withMessage('Valid profile_id is required.')
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
