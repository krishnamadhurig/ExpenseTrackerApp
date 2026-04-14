
// Import database connection (Sequelize instance from config/db)
const sequelize = require('../config/db');

// Import DataTypes (used to define column types like INTEGER, STRING, ENUM, etc.)
const { DataTypes } = require('sequelize');

// Define a model named "Expense"
// This will create an "Expenses" table in the database (pluralized by Sequelize)
const Expense = sequelize.define('Expense', {

    // Column: amount
    amount: {
        type: DataTypes.INTEGER // stores whole numbers (example: 100, 500)
    },

    // Column: description
    description: {
        type: DataTypes.STRING // stores text (example: "lunch", "bus ticket")
    },

    // Column: category
    category: {
        type: DataTypes.ENUM(
            'food', 'salary', 'shopping', 'vacation', 'fuel', 'other'
        ),
        // Only allows these fixed values (no random category allowed)
        defaultValue: 'other' // if not provided, default is "other"
    },

    // Column: UserId (foreign key reference to User table)
    UserId: {
        type: DataTypes.INTEGER, // stores user id
        allowNull: false         // means every expense MUST belong to a user
    }

});

// Export Expense model so other files can use it (routes/controllers)
module.exports = Expense;