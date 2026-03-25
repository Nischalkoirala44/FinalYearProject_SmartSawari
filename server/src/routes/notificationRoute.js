const express = require("express");
const router = express.Router();
const { getNotifications, markAsRead } = require("../controllers/notificationController");
const authenticateUser = require("../middleware/authMiddleware");

router.get("/", authenticateUser, getNotifications);
router.put("/:id/read", authenticateUser, markAsRead);

module.exports = router;