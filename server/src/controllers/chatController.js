const Chat = require("../models/Chat");

const getChatHistory = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const history = await Chat.findByBookingId(bookingId);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Error loading chat", error: err.message });
  }
};

const saveMessageInternal = async (bookingId, senderId, text) => {
  try {
    return await Chat.create(bookingId, senderId, text);
  } catch (err) {
    console.error("Socket Save Error:", err);
    return null;
  }
};

const updateMessage = async (req, res) => {
  const { messageId } = req.params;
  const { text, action } = req.body; 
  const userId = req.user.id; 

  try {
    let result;
    if (action === 'edit') {
      result = await Chat.editMessage(messageId, userId, text);
    } else if (action === 'delete') {
      result = await Chat.deleteMessage(messageId, userId);
    }

    // Optional: if (!result) return res.status(404).json({ message: "Unauthorized or not found" });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const markSeen = async (req, res) => {
  try {
    const { bookingId } = req.params;
    await Chat.markAsSeen(bookingId, req.user.id);
    res.json({ message: "Messages marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getChatHistory, saveMessageInternal, updateMessage, markSeen };