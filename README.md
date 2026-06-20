# KrishiSetu (Agricultural B2B Marketplace) 🌾

KrishiSetu is a digital bridge connecting Farmers directly with commercial Traders, bypassing traditional middlemen. It provides a transparent, auction-style bidding marketplace for agricultural commodities, along with daily Mandi prices, government scheme discovery, and automated notifications.

This repository currently contains the **Backend API**, built with Node.js, Express, and MongoDB.

## 🚀 Features Built So Far (Stages 1–44)

### 🔐 Authentication & Roles (OTP-Based)
- **Farmers & Traders**: Passwordless login using Mobile OTPs (simulated via Redis).
- **Admins**: Secure Email/Password login using bcrypt.
- **Role-Based Access Control (RBAC)**: Strict middleware ensuring traders can't access farmer features, and vice-versa.
- **JWT Management**: Access and Refresh token generation with secure payloads.

### 🚜 Core Marketplace (Crop Listings & Bidding)
- **Crop Listings**: Farmers can create, read, update, and delete crop listings.
- **Bidding System**: 
  - Traders can place bids (with a hard minimum validation against the farmer's base price).
  - Traders can update or withdraw their pending bids.
  - Farmers can view all bids on their listings and Accept/Reject them.
  - Auto-state management (Accepting a bid automatically marks the crop as 'sold').

### 📈 External Data Services (Mandi Prices & Gov Schemes)
- **Mandi Prices**: 
  - Daily automated cron job that fetches mock prices from APMC markets across India.
  - Search APIs to filter prices by commodity, state, and district.
- **Government Schemes**:
  - Nightly automated cron job that scrapes agricultural schemes.
  - **Draft/Publish Workflow**: Scraped schemes are saved as hidden drafts. Admins must review and manually publish them before Farmers can see them.

### 🔔 Notification System
- **Polymorphic Architecture**: A single Notification model dynamically references either a `Farmer` or `Trader` using Mongoose `refPath`.
- **Event-Driven**: Background notifications trigger automatically when:
  - A Trader places a bid.
  - A Trader updates a bid.
  - A Farmer accepts/rejects a bid.
- **Endpoints**: Fetch all, Mark as Read, Mark All as Read (using optimized bulk MongoDB updates).

---

## 🛠 Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Caching**: Redis (for OTP temporary storage)
- **Task Scheduling**: node-cron

---

## 💻 How to Run Locally

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas URL)
- Redis Server (Running on default port 6379)

### 2. Environment Variables
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/krishisetu
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
NODE_ENV=development
```

### 3. Installation
```bash
cd backend
npm install
```

### 4. Start Server
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

---

## 📍 Up Next (Phase 1 Backend Wrap-up)
- **Stage 45-46**: Twilio SMS Integration.
- **Stage 47-49**: Insight Services (Mock Weather API & AI Crop Advisory).
- **Stage 50+**: Admin Moderation tools, search pagination, and system-wide rate-limiting.
