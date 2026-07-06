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
const { initCronJobs } = require('./jobs/cronJobs');
require('./workers/cronWorker'); // Initialize BullMQ Worker
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const auditEmitter = require('./utils/auditEmitter');
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
  console.log('[Socket] Redis Adapter attached to Socket.io');
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
    console.log(`[Socket] Secure user connected and joined room: ${userId}`);
  }

  socket.on('disconnect', () => {
    console.log(`[Socket] Secure user disconnected: ${userId}`);
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/traders', traderRoutes);
app.use('/api/listings', cropListingRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'KrishiSetu API running' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { io };
