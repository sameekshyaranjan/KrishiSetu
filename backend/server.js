const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const traderRoutes = require('./routes/traderRoutes');
const cropListingRoutes = require('./routes/cropListingRoutes');
const bidRoutes = require('./routes/bidRoutes');
const priceRoutes = require('./routes/priceRoutes');
const schemeRoutes = require('./routes/schemeRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const smsRoutes = require('./routes/smsRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const storageRoutes = require('./routes/storageRoutes');
const messageRoutes = require('./routes/messageRoutes');
const exportRoutes = require('./routes/exportRoutes');
const { initCronJobs } = require('./jobs/cronJobs');
const cronWorker = require('./workers/cronWorker'); // Initialize BullMQ Worker
const { cronQueue } = require('./config/bullmq');
const mongoose = require('mongoose');
const redisClient = require('./config/redis');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const auditEmitter = require('./utils/auditEmitter');
const logger = require('./utils/logger');
const { globalLimiter } = require('./middleware/rateLimiter');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

dotenv.config();

connectDB();

initCronJobs();

const app = express();

app.use(helmet());
app.use(globalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
});

const pubClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
  logger.info('[Socket] Redis Adapter attached to Socket.io');
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.user.id;
  
  if (userId) {
    socket.join(userId);
    logger.info(`[Socket] Secure user connected and joined room: ${userId}`);
  }

  socket.on('disconnect', () => {
    logger.info(`[Socket] Secure user disconnected: ${userId}`);
  });
});

const socketEmitter = require('./utils/socketEmitter');

socketEmitter.on('new-notification', (notification, recipientId) => {
  if (io && recipientId) {
    io.to(recipientId.toString()).emit('new-notification', notification);
  }
});

socketEmitter.on('newMessage', (message, receiverId) => {
  if (io && receiverId) {
    io.to(receiverId.toString()).emit('newMessage', message);
  }
});

// Middleware
app.use(cors());
app.use(morgan('dev'));

// Health Check Endpoint (Stage 70.6)
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  const redisClient = require('./config/redis');
  
  const isMongoConnected = mongoose.connection.readyState === 1;
  const isRedisConnected = redisClient.isReady;

  if (isMongoConnected && isRedisConnected) {
    return res.status(200).json({ 
      status: 'OK', 
      mongo: 'connected', 
      redis: 'connected',
      timestamp: new Date().toISOString()
    });
  }

  return res.status(503).json({ 
    status: 'Service Unavailable', 
    mongo: isMongoConnected ? 'connected' : 'disconnected', 
    redis: isRedisConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/farmers', farmerRoutes);
app.use('/api/v1/traders', traderRoutes);
app.use('/api/v1/listings', cropListingRoutes);
app.use('/api/v1/bids', bidRoutes);
app.use('/api/v1/prices', priceRoutes);
app.use('/api/v1/schemes', schemeRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/sms', smsRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/storage', storageRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/export', exportRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'KrishiSetu API running' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Graceful Shutdown (Stage 70.8)
const shutdown = async () => {
  logger.info('[System] SIGTERM/SIGINT received. Shutting down gracefully...');
  
  server.close(() => {
    logger.info('[System] HTTP server closed.');
  });

  try {
    if (cronWorker) await cronWorker.close();
    logger.info('[System] BullMQ Worker closed.');
    
    if (cronQueue) await cronQueue.close();
    logger.info('[System] BullMQ Queue closed.');

    await mongoose.connection.close();
    logger.info('[System] MongoDB connection closed.');

    if (redisClient.isReady) await redisClient.quit();
    logger.info('[System] Redis connection closed.');
    
    process.exit(0);
  } catch (error) {
    logger.error('[System] Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = { io };
