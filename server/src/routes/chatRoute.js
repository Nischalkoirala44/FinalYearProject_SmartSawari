const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController"); // Use the controller
const verifyToken = require("../middleware/authMiddleware");

// GET: Inbox list for sidebar
router.get("/inbox", verifyToken, async (req, res) => {
  try {
    const Chat = require("../models/Chat");
    const chats = await Chat.getInbox(req.user.id);
    res.json({ success: true, chats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Specific chat history
router.get("/history/:bookingId", verifyToken, chatController.getChatHistory);

// Chat partner info
router.get("/owner/:bookingId", verifyToken, async (req, res) => {
  try {
    const Chat = require("../models/Chat");
    const owner = await Chat.getOwnerByBookingId(req.params.bookingId, req.user.id);
    if (!owner) return res.status(404).json({ success: false, error: "Partner not found" });
    res.json({ success: true, owner });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT: Update a message (Edit or Delete)
router.put("/message/:messageId", verifyToken, chatController.updateMessage);

// POST: Mark messages in a booking as seen
router.post("/seen/:bookingId", verifyToken, chatController.markSeen);

// DELETE: Clear all messages in a specific chat
router.delete("/clear/:bookingId", verifyToken, chatController.deleteAllChat);

module.exports = router;