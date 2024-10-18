// Import the MySQL and dotenv modules
const mysql = require('mysql');
require('dotenv').config(); // Load environment variables from .env file

// Create a MySQL connection using environment variables
const db = mysql.createConnection({
  host: "sql12.freemysqlhosting.net",      // MySQL server address from .env
  user: "sql12738867",       // MySQL username from .env
  password: "k88JmI4p2V", // MySQL password from .env
  database: "sql12738867"   // MySQL database name from .env
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
