const express = require('express');
const { body, validationResult } = require('express-validator');
const registerController = require('../controllers/registerController');  // Renamed to userController
const loginController = require('../controllers/loginController');

const router = express.Router();

// Middleware for validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules for registration and login
const registerValidationRules = [
  body('username').notEmpty().withMessage('Username is required.'),
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
];

const loginValidationRules = [
  body('username').notEmpty().withMessage('Username is required.'),
  body('password').notEmpty().withMessage('Password is required.')
];

// Registration route
router.post('/register', registerValidationRules, validate, registerController.register);

// Login route
router.post('/login', loginValidationRules, validate, loginController.login);

module.exports = router;
