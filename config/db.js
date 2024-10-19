// Import the MySQL and dotenv modules
const mysql = require('mysql');
require('dotenv').config(); // Load environment variables from .env file

// Create a MySQL connection using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,      // MySQL server address from .env
  user: process.env.DB_USER,       // MySQL username from .env
  password: process.env.DB_PASSWORD, // MySQL password from .env
  database: process.env.DB_NAME   // MySQL database name from .env
});

// const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
//   ssl: {
//     rejectUnauthorized: false,
//   }
// });

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the MySQL database');
});

// Export the connection for use in other parts of the application
module.exports = db;
