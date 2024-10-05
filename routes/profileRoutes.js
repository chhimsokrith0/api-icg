const express = require('express');
const { body, validationResult } = require('express-validator');
const profileController = require('../controllers/profileController');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));  // Directory to store images
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));  // Unique file name
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
router.get('/', profileController.getAllProfiles);
router.get('/:id', profileController.getProfileById);
router.post('/', upload.single('profileImage'), profileValidationRules, validate, profileController.createProfile);
router.put('/:id', upload.single('profileImage'), profileValidationRules, validate, profileController.updateProfile);
router.delete('/:id', profileController.deleteProfile);

module.exports = router;
