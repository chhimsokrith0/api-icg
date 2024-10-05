const db = require('../config/db');

// Get all profiles
exports.getAllProfiles = (req, res) => {
  const query = 'SELECT * FROM profiles';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Get a profile by ID
exports.getProfileById = (req, res) => {
  const query = 'SELECT * FROM profiles WHERE id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0]);
  });
};

// Create a new profile with image upload to Cloudinary
exports.createProfile = (req, res) => {
  const { name, title, bio, linkedin_url, github_url, email } = req.body;
  const profileImage = req.file ? req.file.path : null; // Cloudinary URL is in req.file.path

  const query = 'INSERT INTO profiles (name, title, bio, linkedin_url, github_url, email, profile_image_url) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [name, title, bio, linkedin_url, github_url, email, profileImage], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: results.insertId, ...req.body, profile_image_url: profileImage });
  });
};

// Update a profile by ID with image upload to Cloudinary
exports.updateProfile = (req, res) => {
  const { name, title, bio, linkedin_url, github_url, email } = req.body;
  const profileImage = req.file ? req.file.path : req.body.existingImage; // Use Cloudinary URL

  const query = 'UPDATE profiles SET name = ?, title = ?, bio = ?, linkedin_url = ?, github_url = ?, email = ?, profile_image_url = ? WHERE id = ?';
  db.query(query, [name, title, bio, linkedin_url, github_url, email, profileImage, req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Profile updated successfully!', profile_image_url: profileImage });
  });
};

// Delete a profile by ID
exports.deleteProfile = (req, res) => {
  const query = 'DELETE FROM profiles WHERE id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Profile deleted successfully!' });
  });
};
