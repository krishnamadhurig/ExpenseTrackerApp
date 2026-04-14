const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const { downloadReport } = require("../controllers/reportController");

router.get("/download-report", authenticate, downloadReport);

module.exports = router;