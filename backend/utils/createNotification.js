const Notification = require('../models/Notification');

const createNotification = async (recipientId, recipientModel, title, message) => {
  try {
    const notification = await Notification.create({
      recipientId,
      recipientModel,
      title,
      message
    });

    // Import io here to avoid circular dependency issues at the top of the file
    const { io } = require('../server');
    
    if (io) {
      io.to(recipientId.toString()).emit('new-notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error.message);
  }
};

module.exports = { createNotification };
