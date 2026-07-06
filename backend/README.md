# KrishiSetu Backend API

KrishiSetu is an event-driven MERN stack application connecting Farmers directly with Traders, eliminating middlemen. 

This repository houses the Express/Node.js backend, powered by MongoDB, Redis for caching, BullMQ for background job processing, and Socket.IO for real-time messaging.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Setup & Installation](#setup--installation)
4. [Running the Application](#running-the-application)
5. [Architecture Highlights](#architecture-highlights)
6. [API Endpoints Overview](#api-endpoints-overview)

---

## Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Local or MongoDB Atlas)
- Redis Server (Required for BullMQ & Caching)

## Environment Variables
Create a `.env` file in the `backend` directory with the following keys:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/krishisetu
JWT_SECRET=your_super_secret_jwt_key
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

## Setup & Installation

1. Install all dependencies:
   ```bash
   npm install
   ```
2. Ensure your local Redis server is running (e.g., `redis-server` on Linux/Mac, or via WSL/Docker on Windows).

## Running the Application

**Development Mode (Nodemon):**
```bash
npm run dev
```

The server will start on port 5000 and connect to MongoDB and Redis.
*Note: The background worker (`workers/cronWorker.js`) automatically initializes when the server boots.*

---

## Architecture Highlights
- **Role-Based Access:** Dual collections (`Farmers` and `Traders`) protected via robust JWT middlewares.
- **Two-Tier Realtime Messaging:** Polymorphic `Conversation` and `Message` models integrated with WebSockets (`Socket.IO`).
- **Background Processing:** Heavy tasks (SMS, Harvest Reminders, Price Alerts) offloaded to `BullMQ` + `Redis`.
- **Geospatial Queries:** MongoDB `2dsphere` indexes allow users to query nearby Cold Storage facilities by radius.
- **Centralized Pagination:** The custom `paginate.js` utility standardizes offset pagination for admin dashboards and marketplace feeds.

---

## API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /farmer/register` - Register a new farmer
- `POST /trader/register` - Register a new trader
- `POST /login` - Login (works for both roles)
- `GET /me` - Get current logged-in user profile

### Farmers (`/api/farmers`)
- `GET /profile` - Get farmer profile
- `PUT /profile` - Update farmer profile

### Traders (`/api/traders`)
- `GET /profile` - Get trader profile
- `PUT /profile` - Update trader profile

### Crop Listings (`/api/listings`)
- `POST /` - Create a new crop listing (Farmers only)
- `GET /` - Browse available crops (Paginated)
- `GET /my-listings` - Get logged-in farmer's listings
- `GET /:id` - Get single listing details
- `PUT /:id` - Update a listing
- `DELETE /:id` - Soft delete a listing
- `GET /:id/lot-sheet` - Generate unified Lot Sheet for a listing

### Bids / Negotiations (`/api/bids`)
- `POST /` - Place a bid on a crop (Traders only)
- `GET /my-bids` - Get trader's bid history
- `GET /listing/:listingId` - Get all bids for a specific crop
- `PUT /:id/status` - Accept or reject a bid (Farmers only)

### Transactions (`/api/transactions`)
- `POST /` - Create a new transaction (Escrow)
- `PUT /:id/status` - Update transaction status

### Storage & Logistics (`/api/storage`)
- `GET /` - List all cold storage facilities
- `GET /nearby` - Find storage within geographic radius

### Real-time Messaging (`/api/messages`)
- `POST /` - Send a message (Auto-creates Conversation room)
- `GET /conversations` - Fetch Inbox (Sorted by recent)
- `GET /conversations/:id` - Fetch chat history

### Government Schemes (`/api/schemes`)
- `GET /` - Fetch all published agricultural schemes

### Admin Panel (`/api/admin`)
- `GET /dashboard/stats` - Fetch core platform metrics (Redis Cached)
- `GET /farmers` - Paginated farmer list
- `GET /traders` - Paginated trader list
- `GET /audit-logs` - Paginated system audit logs

---
*Maintained by the KrishiSetu Engineering Team.*
