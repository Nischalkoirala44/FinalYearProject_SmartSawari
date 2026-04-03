const express = require("express");
const router = express.Router();
const { getDashboardStats, getAllUsers } = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const adminAuth = require("../middleware/authMiddleware");

router.get("/stats", authMiddleware, adminAuth, getDashboardStats);
router.get("/users", authMiddleware, adminAuth, getAllUsers);
module.exports = router;