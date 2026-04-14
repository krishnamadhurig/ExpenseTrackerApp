
// Import DataTypes (used to define column types like UUID, BOOLEAN, etc.)
const { DataTypes } = require("sequelize");

// Import our database connection (Sequelize instance)
const sequelize = require("../config/db");

// Define a model named "ForgotPasswordRequest"
// This creates a table in DB called "ForgotPasswordRequests"
const ForgotPasswordRequest = sequelize.define("ForgotPasswordRequest", {

    // Column: id (primary key)
    id: {
        type: DataTypes.UUID,              // UUID = globally unique ID (random long string)
        defaultValue: DataTypes.UUIDV4,    // automatically generate UUID v4
        primaryKey: true                   // this is the unique identifier for each row
    },

    // Column: isActive
    isActive: {
        type: DataTypes.BOOLEAN,           // true or false
        defaultValue: true                 // request is active by default
    },
    userId: {
    type: DataTypes.INTEGER,
    allowNull: false
}

});

// Export the model so other files (controllers/routes) can use it
module.exports = ForgotPasswordRequest;