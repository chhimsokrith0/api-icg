// categoryController.js
const db = require('../config/db');

// Get all categories
exports.getAllCategories = (req, res) => {
  db.query('SELECT * FROM categories', (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
};

// Get category by ID
exports.getCategoryById = (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM categories WHERE id = ?', [id], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results[0]);
    }
  });
};

// Create new category
exports.createCategory = (req, res) => {
  const { category_name } = req.body;
  const query = 'INSERT INTO categories (category_name) VALUES (?)';
  db.query(query, [category_name], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json({ id: results.insertId, category_name });
    }
  });
};

// Update a category
exports.updateCategory = (req, res) => {
  const id = req.params.id;
  const { category_name } = req.body;
  const query = 'UPDATE categories SET category_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  db.query(query, [category_name, id], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json({ message: 'Category updated successfully' });
    }
  });
};

// Delete a category
exports.deleteCategory = (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM categories WHERE id = ?', [id], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json({ message: 'Category deleted successfully' });
    }
  });
};
