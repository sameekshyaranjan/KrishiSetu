const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const traderRoutes = require('./routes/traderRoutes');
const cropListingRoutes = require('./routes/cropListingRoutes');
const bidRoutes = require('./routes/bidRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

connectDB();

const app = express();

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

app.get('/', (req, res) => {
  res.json({ message: 'KrishiSetu API running' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
