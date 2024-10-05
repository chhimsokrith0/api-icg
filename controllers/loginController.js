const bcrypt = require('bcryptjs');

const db = require('../config/db'); // Your MySQL connection

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
