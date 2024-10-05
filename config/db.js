// Import the MySQL and dotenv modules
const mysql = require('mysql');
require('dotenv').config(); // Load environment variables from .env file

// Create a MySQL connection using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,      // MySQL server address from .env
  user: process.env.DB_USER,      // MySQL username from .env
  password: process.env.DB_PASSWORD, // MySQL password from .env
  database: process.env.DB_NAME   // MySQL database name from .env
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err); // Log connection errors
    throw err;
  }
  console.log('MySQL Connected...'); // Log success message when connected
});

// Export the connection for use in other parts of the application
module.exports = db;
