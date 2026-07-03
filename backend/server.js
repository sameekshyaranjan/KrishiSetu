const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
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
const { initCronJobs } = require('./jobs/cronJobs');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

connectDB();

initCronJobs();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.join(userId);
    console.log(`[Socket] User connected and joined room: ${userId}`);
  } else {
    console.log(`[Socket] Anonymous user connected: ${socket.id}`);
  }

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${userId || socket.id}`);
  });
});

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/traders', traderRoutes);
app.use('/api/listings', cropListingRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/notifications', notificationRoutes);

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
