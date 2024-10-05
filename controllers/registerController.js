const bcrypt = require('bcryptjs');
const db = require('../config/db'); // MySQL connection

// User login controller (without JWT)
exports.login = (req, res) => {
  const { username, password } = req.body;

  // Find the user by username
  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = results[0];

    // Compare password with hashed password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Login successful, return user details without token
    res.json({ message: 'Login successful', user: { id: user.id, username: user.username, email: user.email } });
  });
};

// User registration controller (Create)
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    const userCheckQuery = 'SELECT * FROM users WHERE email = ? OR username = ?';
    db.query(userCheckQuery, [email, username], async (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error during registration' });
      }
      if (result.length > 0) {
        return res.status(400).json({ message: 'User already exists with this email or username' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into the database
      const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      db.query(query, [username, email, hashedPassword], (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Error registering user' });
        }
        res.status(201).json({ message: 'User registered successfully!' });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Read - Get all users
exports.getAllUsers = (req, res) => {
  const query = 'SELECT id, username, email FROM users'; // Fetch only necessary fields
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error during fetching users' });
    }
    res.json(results);
  });
};

// Read - Get a single user by ID
exports.getUserById = (req, res) => {
  const query = 'SELECT id, username, email FROM users WHERE id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error during fetching the user' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(results[0]);
  });
};

// Update user details (username, email, password)
exports.updateUser = async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

  // Only update fields that are provided
  const query = `
    UPDATE users
    SET
      username = COALESCE(?, username),
      email = COALESCE(?, email),
      password = COALESCE(?, password)
    WHERE id = ?`;

  db.query(query, [username, email, hashedPassword, req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error during updating the user' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User updated successfully!' });
  });
};

// Delete a user by ID
exports.deleteUser = (req, res) => {
  const query = 'DELETE FROM users WHERE id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error during deleting the user' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully!' });
  });
};
