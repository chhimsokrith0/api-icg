const express = require('express');
const { body, validationResult } = require('express-validator');
const userController = require('../controllers/registerController');

const router = express.Router();

// Middleware for validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules for updating user details
const userValidationRules = [
  body('username').optional().notEmpty().withMessage('Username is required.'),
  body('email').optional().isEmail().withMessage('Valid email is required.'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
];

// Routes
router.post('/register', userValidationRules, validate, userController.register);   // Create (Register)
router.get('/', userController.getAllUsers);   // Read all users
router.get('/:id', userController.getUserById);   // Read a single user by ID
router.put('/:id', userValidationRules, validate, userController.updateUser);   // Update user details
router.delete('/:id', userController.deleteUser);   // Delete a user

module.exports = router;
