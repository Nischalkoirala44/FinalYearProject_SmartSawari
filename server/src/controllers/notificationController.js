const { Notification } = require("../models");

exports.getNotifications = async (req, res) => {
  try {
    // Automatically gets the ID from the logged-in user's token
    const notifications = await Notification.findAll({
      where: { userId: req.user.id }, 
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add this so the frontend can clear the red dot!
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.update({ isRead: true }, { where: { id, userId: req.user.id } });
    res.json({ success: true, message: "Notification read" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};