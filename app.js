const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const profileRoutes = require('./routes/profileRoutes');
const projectRoutes = require('./routes/projectRoutes');
const path = require('path');
const db = require('./config/db');  // Use require for database config
require('dotenv').config();  // Load environment variables from .env

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());  // Enable CORS for all routes

// Routes
app.use('/api/profiles', profileRoutes);
app.use('/api/projects', projectRoutes);

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
