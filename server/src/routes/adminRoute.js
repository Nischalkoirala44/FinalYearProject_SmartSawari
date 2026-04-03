const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const adminAuth = require("../middleware/authMiddleware");

router.get("/stats", authMiddleware, adminAuth, getDashboardStats);

module.exports = router;