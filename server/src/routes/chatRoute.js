// routes/chatRoute.js
const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat"); // Import the DAO we just updated
const verifyToken = require("../middleware/authMiddleware");

// GET: Inbox list for sidebar
router.get("/inbox", verifyToken, async (req, res) => {
  try {
    const chats = await Chat.getInbox(req.user.id);
    res.json({ success: true, chats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET: Specific chat history
router.get("/history/:bookingId", verifyToken, async (req, res) => {
  try {
    const messages = await Chat.findByBookingId(req.params.bookingId);
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;