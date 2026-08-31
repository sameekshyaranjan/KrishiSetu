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
const walletRoutes = require('./routes/walletRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { initCronJobs } = require('./jobs/cronJobs');
const cronWorker = require('./workers/cronWorker');
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

// Global handler to catch any unhandled network drops gracefully
process.on('unhandledRejection', (reason) => {
  const msg = reason?.message || String(reason);
  if (msg.includes('ENOTFOUND') || msg.includes('ECONNREFUSED') || msg.includes('ETIMEDOUT')) {
    logger.warn(`[Network] Cloud service notice: ${msg}`);
  } else {
    logger.error(`[Process] Unhandled Rejection: ${msg}`);
  }
});

connectDB().catch(() => {});

initCronJobs().catch(() => {});

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(globalLimiter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
});

// Attach Socket.io Redis adapter only if real cloud Redis is explicitly enabled
if (redisClient.isRealRedis && process.env.REDIS_URL) {
  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();

  pubClient.on('error', () => {});
  subClient.on('error', () => {});

  Promise.allSettled([pubClient.connect(), subClient.connect()]).then((results) => {
    if (results.every(r => r.status === 'fulfilled')) {
      io.adapter(createAdapter(pubClient, subClient));
      logger.info('[Socket] Redis Adapter attached to Socket.io');
    }
  });
}

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

  socket.on('join_conversation', (conversationId) => {
    if (conversationId) {
      socket.join(conversationId.toString());
    }
  });

  socket.on('leave_conversation', (conversationId) => {
    if (conversationId) {
      socket.leave(conversationId.toString());
    }
  });

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

socketEmitter.on('newMessage', (message, receiverId, conversationId) => {
  if (io) {
    if (receiverId) {
      io.to(receiverId.toString()).emit('newMessage', message);
    }
    if (conversationId) {
      io.to(conversationId.toString()).emit('newMessage', message);
    }
  }
});

// CORS Configuration with Credentials Support
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in dev to prevent browser blocking
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(morgan('dev'));

// Swagger Documentation UI (Stage 70.14)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check Endpoint (Stage 70.6)
app.get('/health', (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  const isRedisActive = redisClient.isRealRedis ? redisClient.status === 'ready' : true;

  if (isMongoConnected) {
    return res.status(200).json({ 
      status: 'OK', 
      mongo: 'connected', 
      redis: redisClient.isRealRedis ? (redisClient.status === 'ready' ? 'connected' : 'disconnected') : 'in-memory-active',
      timestamp: new Date().toISOString()
    });
  }

  return res.status(503).json({ 
    status: 'Degraded', 
    mongo: isMongoConnected ? 'connected' : 'disconnected', 
    redis: redisClient.isRealRedis ? (redisClient.status === 'ready' ? 'connected' : 'disconnected') : 'in-memory-active',
    timestamp: new Date().toISOString()
  });
});

// Routes (Dual support for both /api and /api/v1 prefixes)
const registerRoutes = (prefix) => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/farmers`, farmerRoutes);
  app.use(`${prefix}/traders`, traderRoutes);
  app.use(`${prefix}/listings`, cropListingRoutes);
  app.use(`${prefix}/crops`, cropListingRoutes);
  app.use(`${prefix}/bids`, bidRoutes);
  app.use(`${prefix}/prices`, priceRoutes);
  app.use(`${prefix}/mandi`, priceRoutes);
  app.use(`${prefix}/schemes`, schemeRoutes);
  app.use(`${prefix}/notifications`, notificationRoutes);
  app.use(`${prefix}/admin`, adminRoutes);
  app.use(`${prefix}/sms`, smsRoutes);
  app.use(`${prefix}/transactions`, transactionRoutes);
  app.use(`${prefix}/storage`, storageRoutes);
  app.use(`${prefix}/messages`, messageRoutes);
  app.use(`${prefix}/export`, exportRoutes);
  app.use(`${prefix}/wallet`, walletRoutes);
};

registerRoutes('/api/v1');
registerRoutes('/api');

app.get('/', (req, res) => {
  res.json({ message: 'KrishiSetu API running. View docs at /api-docs' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});

// Graceful Shutdown (Stage 70.8)
const shutdown = async () => {
  logger.info('[System] SIGTERM/SIGINT received. Shutting down gracefully...');
  
  server.close(() => {
    logger.info('[System] HTTP server closed.');
  });

  try {
    if (cronWorker && cronWorker.close) await cronWorker.close();
    if (cronQueue && cronQueue.close) await cronQueue.close();
    await mongoose.connection.close();
    if (redisClient.isRealRedis && redisClient.status === 'ready') await redisClient.quit();
    process.exit(0);
  } catch (error) {
    logger.error('[System] Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = { app, server };
