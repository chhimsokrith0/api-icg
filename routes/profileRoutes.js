const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const profileController = require('../controllers/profileController');
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

// Validation rules for creating/updating profiles
const profileValidationRules = [
  body('name').notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('A valid email is required.'),
  body('title').notEmpty().withMessage('Title is required.'),
  body('bio').notEmpty().withMessage('Bio is required.')
];

// Middleware for checking validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Routes for profile CRUD operations
router.get('/', profileController.getAllProfiles); // Get all profiles
router.get('/:id', profileController.getProfileById); // Get profile by ID
router.post('/', upload.single('profileImage'), profileValidationRules, validate, profileController.createProfile); // Create a new profile with image upload and validation
router.put('/:id', upload.single('profileImage'), profileValidationRules, validate, profileController.updateProfile); // Update profile by ID with image upload and validation
router.delete('/:id', profileController.deleteProfile); // Delete profile by ID

module.exports = router;
