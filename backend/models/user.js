
// Import the Sequelize connection you created in config/db
// This is the same database connection used across the project
const sequelize = require('../config/db');

// Import DataTypes (used to define column types like STRING, INTEGER, BOOLEAN, etc.)
const { DataTypes } = require('sequelize');

// Define a model named "User"
// This will create a "Users" table in the database (Sequelize pluralizes it by default)
const User = sequelize.define('User', {

    // Column: name
    name: {
        type: DataTypes.STRING // stores text (like "John")
    },

    // Column: email
    email: {
        type: DataTypes.STRING, // stores text (email address)
        unique: true            // ensures no two users can have same email
    },

    // Column: password
    password: {
        type: DataTypes.STRING // stores password (usually hashed)
    },

    // Column: totalAmount
    totalAmount: {
        type: DataTypes.FLOAT,   // stores decimal numbers (like 10.5, 100.75)
        defaultValue: 0          // if not given, default is 0
    },

    // Column: isPremium
    isPremium: {
        type: DataTypes.BOOLEAN, // true or false
        defaultValue: false      // default is false (not premium user)
    }

});

// Export the User model so other files (routes/controllers) can use it
module.exports = User;