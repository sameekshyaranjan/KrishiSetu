const EventEmitter = require('events');
const AuditLog = require('../models/AuditLog');

class AuditEmitter extends EventEmitter {}
const auditEmitter = new AuditEmitter();

// Background listener for the 'log' event
auditEmitter.on('log', async (payload) => {
  try {
    const { action, performedBy, performedByModel, targetId, targetModel, details } = payload;
    
    await AuditLog.create({
      action,
      performedBy,
      performedByModel,
      targetId,
      targetModel,
      details
    });
    
  } catch (error) {
    console.error('Failed to save AuditLog in background:', error.message);
  }
});

module.exports = auditEmitter;
