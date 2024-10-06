// routes/projectDetailsRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const projectDetailsController = require('../controllers/projectDetailsController');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig');

const router = express.Router();

// Set up multer to use Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'project_details_images',
    allowed_formats: ['jpeg', 'png', 'jpg'],
  },
});

const upload = multer({ storage: storage });

// Validation rules for creating/updating project details
const projectDetailValidationRules = [
  body('detail_description').notEmpty().withMessage('Detail description is required.'),
  body('technologies_used').notEmpty().withMessage('Technologies used are required.'),
  body('github_url').optional().isURL().withMessage('A valid GitHub URL is required.'),
  body('documentation_url').optional().isURL().withMessage('A valid documentation URL is required.')
];

// Middleware for checking validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Routes for project detail CRUD operations
router.get('/', projectDetailsController.getAllProjectDetails);
router.get('/:id', projectDetailsController.getProjectDetailsById);
router.post('/', upload.single('projectImage'), projectDetailValidationRules, validate, projectDetailsController.createProjectDetail);
router.put('/:id', upload.single('projectImage'), projectDetailValidationRules, validate, projectDetailsController.updateProjectDetail);
router.delete('/:id', projectDetailsController.deleteProjectDetail);

module.exports = router;
