
// Import Sequelize database connection (our shared DB setup)
const sequelize = require('../config/db');

// Import DataTypes (used to define column types like STRING, INTEGER, etc.)
const { DataTypes } = require('sequelize');

// Define a model named "Order"
// This creates an "Orders" table in our database
const Order = sequelize.define('Order', {

    // Column: orderId
    orderId: {
        type: DataTypes.STRING // stores order ID from payment gateway (like Razorpay/Stripe)
    },

    // Column: paymentId
    paymentId: {
        type: DataTypes.STRING // stores payment transaction ID after payment is done
    },

    // Column: status
    status: {
        type: DataTypes.STRING // stores payment status
        // Example values: PENDING, SUCCESSFUL, FAILED
    }

});

// Export the Order model so other files (routes/controllers) can use it
module.exports = Order;