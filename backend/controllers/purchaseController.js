const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/user");
const Order = require("../models/order");
const  sequelize  = require("../config/db");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
});


// ---------------- CREATE ORDER ----------------
exports.createOrder = async (req, res) => {
    try {
        const amount = 50000; // ₹500 in paise (make dynamic if needed)

        const options = {
            amount,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        await Order.create({
            orderId: order.id,
            status: "CREATED",
            amount,
            UserId: req.user.id,
        });

        return res.status(201).json({
            success: true,
            order,
            key_id: process.env.RAZORPAY_KEY_ID,
        });

    } catch (err) {
        console.error("Create Order Error:", err);
        return res.status(500).json({ message: "Order creation failed" });
    }
};


// ---------------- VERIFY PAYMENT ----------------
exports.verifyPayment = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        // Validate input
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            await t.rollback();
            return res.status(400).json({ message: "Missing payment details" });
        }

        // Create expected signature
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const isValidSignature = generatedSignature === razorpay_signature;

        // Find order
        const order = await Order.findOne({
            where: { orderId: razorpay_order_id },
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        if (!order) {
            await t.rollback();
            return res.status(404).json({ message: "Order not found" });
        }

        if (!isValidSignature) {
            await order.update(
                { status: "FAILED" },
                { transaction: t }
            );

            await t.commit();
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        // Update order as successful
        await order.update(
            {
                status: "SUCCESS",
                paymentId: razorpay_payment_id,
            },
            { transaction: t }
        );

        // Update user premium status safely
        await User.update(
            { isPremium: true },
            { where: { id: req.user.id }, transaction: t }
        );

        await t.commit();

        return res.json({
            success: true,
            message: "Payment verified successfully",
        });

    } catch (err) {
        await t.rollback();
        console.error("Verify Payment Error:", err);
        return res.status(500).json({ message: "Verification failed" });
    }
};