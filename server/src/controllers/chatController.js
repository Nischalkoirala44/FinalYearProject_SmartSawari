const Chat = require("../models/Chat");

const getChatHistory = async (req, res) => {
  try {
    const { bookingId } = req.params;
    console.log("DEBUG: Fetching history for bookingId:", bookingId);
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

module.exports = { getChatHistory, saveMessageInternal };