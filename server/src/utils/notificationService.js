const Notification = require("../models/Notification");

exports.sendNotification = async (userId, message) => {
  return await Notification.create({
    userId,
    message
  });
};
