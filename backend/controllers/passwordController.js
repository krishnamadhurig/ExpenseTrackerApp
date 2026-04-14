const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const ForgotPasswordRequest = require("../models/ForgotPasswordRequest");
const sendMail = require("../utils/email");

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const requestId = uuidv4();

        // store request
        await ForgotPasswordRequest.create({
            id: requestId,
            UserId: user.id,
            isActive: true
        });

        const resetLink = `http://localhost:3000/api/resetpassword/${requestId}`;
        console.log("RESET LINK:", resetLink);

        await sendMail(
            email,
            "Reset Password",
            `Click here to reset your password: ${resetLink}`
        );

        res.status(200).json({ message: "Reset link sent" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error sending email" });
    }
};
//getresetpassword
exports.getResetPassword = async (req, res) => {
    const { id } = req.params;

    const request = await ForgotPasswordRequest.findOne({ where: { id } });

    if (!request || !request.isActive) {
        return res.send("Invalid or expired link");
    }

    // send simple HTML form
    res.send(`
        <form action="/password/updatepassword/${id}" method="POST">
            <input type="password" name="newPassword" placeholder="Enter new password" required />
            <button type="submit">Reset Password</button>
        </form>
    `);
};

//update password

exports.updatePassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    console.log("BODY:", req.body);
    console.log("PARAM ID:", req.params.id);

    try {
        const request = await ForgotPasswordRequest.findOne({ where: { id } });

        if (!request || !request.isActive) {
            return res.send("Invalid or expired link");
        }

        const user = await User.findByPk(request.UserId);

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        // deactivate link
        request.isActive = false;
        await request.save();

        res.send("Password updated successfully");

    } catch (err) {
        console.log(err);
        res.send("Error updating password");
    }
};