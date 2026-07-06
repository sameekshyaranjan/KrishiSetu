const Notification = require('../models/Notification');

const createNotification = async (recipientId, recipientModel, title, message) => {
  try {
    const notification = await Notification.create({
      recipientId,
      recipientModel,
      title,
      message
    });

    const socketEmitter = require('./socketEmitter');
    socketEmitter.emit('new-notification', notification, recipientId);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error.message);
  }
};

module.exports = { createNotification };
