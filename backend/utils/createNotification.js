const Notification = require('../models/Notification');

const createNotification = async (recipientId, recipientModel, title, message) => {
  try {
    const notification = await Notification.create({
      recipientId,
      recipientModel,
      title,
      message
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error.message);
  }
};

module.exports = { createNotification };
