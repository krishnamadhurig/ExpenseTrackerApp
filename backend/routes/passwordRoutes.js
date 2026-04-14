const express = require("express");
const { forgotPassword,getResetPassword,updatePassword } = require("../controllers/passwordController");

const router = express.Router();

// POST /password/forgotpassword
router.post("/forgotpassword", forgotPassword);
router.get("/resetpassword/:id", getResetPassword);
router.post("/updatepassword/:id", updatePassword);

module.exports = router;