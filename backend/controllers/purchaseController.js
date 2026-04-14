const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/user');
const Order = require('../models/order');
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET

})
exports.createOrder = async (req, res) => {
    try {
        const options = {
            amount: 50000, //500rupess(in paise)
            currency: "INR"
        };
        const order = await razorpay.orders.create(options);

        //save in db
        await Order.create({
            orderId: order.id,
            status: "PENDING",
            UserId: req.user.id
        });
        res.json({
            order,
            key_id: process.env.RAZORPAY_KEY_ID
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Order creation failed" });

    }
}
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(sign)
            .digest("hex");

        //  find order in DB
        const order = await Order.findOne({ where: { orderId: razorpay_order_id } });
        // If order is null,  app will crash //
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (expectedSign === razorpay_signature) {
            // SUCCESS
            order.status = "SUCCESSFUL";
            order.paymentId = razorpay_payment_id;
            await order.save();

            const user = await User.findByPk(req.user.id);
            user.isPremium = true;
            await user.save();

            return res.json({ success: true });

        } else {
            //  FAILED
            order.status = "FAILED";
            await order.save();

            return res.status(400).json({ success: false });
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Verification failed" });
    }
};
