
// Import Sequelize (library used to connect Node.js with database using JS instead of SQL)
const { Sequelize } = require('sequelize');

// Load environment variables from .env file into process.env
// Example: DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, etc.
require('dotenv').config();

// Create a Sequelize instance (this is  database connection object)
const sequelize = new Sequelize(

    // Database name from .env file
    process.env.DB_NAME,

    // Database username from .env file
    process.env.DB_USER,

    // Database password from .env file
    process.env.DB_PASSWORD,

    {
        // Where our database is running (localhost or cloud server)
        host: process.env.DB_HOST,

        // Type of database (mysql / postgres / sqlite / mariadb etc.)
        dialect: process.env.DB_DIALECT
    }
);

// Test the database connection
// This checks if credentials and DB connection are correct

sequelize.authenticate()

    // If connection is successful
    .then(() => console.log("Database connected successfully"))

    // If connection fails, show error in console
    .catch((err) => console.error("Database connection failed:", err));

// Export the sequelize instance so other files can use same DB connection
module.exports = sequelize;