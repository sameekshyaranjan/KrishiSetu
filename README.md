# KrishiSetu (Agricultural B2B Marketplace) 🌾

KrishiSetu is a digital bridge connecting Farmers directly with commercial Traders, bypassing traditional middlemen. It provides a transparent, auction-style bidding marketplace for agricultural commodities, along with real-time API integrations for Mandi prices, government schemes, financial transactions, and weather alerts.

**Current Build Status:** Backend Phase 2 (Completed up to Stage 60 / 107)

---

## 🚀 Key Architectural Features

### 1. The "Karnataka Pivot" (Hyper-Local Architecture)
Unlike generic platforms, KrishiSetu is currently heavily optimized for the state of Karnataka. 
- All MongoDB schemas (`Farmer`, `Trader`, `ColdStorage`) strictly validate against a hardcoded array of Karnataka's 13 primary agricultural districts.
- Prevents out-of-state data pollution and ensures logistics remain highly localized.

### 2. Hybrid Transaction Engine
KrishiSetu facilitates the financial closure of accepted bids via a dual-engine:
- **Online:** Integrated with Razorpay SDK. Includes backend cryptographic HMAC-SHA256 signature verification to prevent frontend payment spoofing.
- **Offline:** A secure Manual Payment tracking endpoint (`/api/transactions/manual`) to log cash or direct UPI transfers.

### 3. Geospatial Cold Storage Locator
Built using **GeoJSON** data structures and MongoDB `2dsphere` indexes. The backend uses the `$near` geospatial operator to calculate the exact distance between a farmer's GPS coordinates and nearby cold storage facilities, returning results sorted by proximity in milliseconds.

### 4. Enterprise Security & Architecture
- **Authentication:** Decoupled registration endpoints (`/api/auth/register/farmer` & `/trader`) with robust Email/Password bcrypt hashing.
- **Protection:** Helmet.js for HTTP header sanitization, Express-Validator for strict payload formatting, and Redis-backed Rate Limiting to prevent brute-force and DDoS attacks.
- **Real-Time Engine:** Socket.io WebSockets push live notifications to clients the millisecond a bid is placed or accepted.
- **Audit Logging:** An Event-Driven Node.js `EventEmitter` asynchronously tracks all critical system mutations (Bids, Auth, Admin actions) without blocking the main HTTP request thread.

---

## 🔌 Third-Party API Integrations (With Dev Mocks)

To optimize development speed and completely eliminate API costs during local testing, KrishiSetu implements sophisticated **Development Mocks** for all 3rd-party services.

1. **Twilio SMS/Voice:** 
   - Intercepts farmer missed-calls, queries live prices, and generates multi-language (i18n) SMS templates in Kannada, Hindi, and English. 
   - *Mock:* Logs the translated SMS directly to the backend terminal.
2. **Agmarknet (Govt API):** 
   - Daily cron jobs fetch official Mandi prices.
3. **Razorpay:** 
   - *Mock:* Simulates Order IDs and validates dummy frontend signatures.
4. **OpenWeatherMap:** 
   - Custom Agricultural Risk Engine (`weatherService.js`) evaluates wind speed (>60km/h) and rainfall intensity.
   - *Mock:* Injects randomized severe weather scenarios to safely test cron-job warning triggers.

---

## 💻 Tech Stack
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ORM)
- **Caching & Rate Limiting:** Redis (Upstash)
- **Real-Time:** Socket.io
- **Security:** bcryptjs, jsonwebtoken (JWT), Helmet.js
- **Job Scheduling:** node-cron

---

## 🛠️ How to Run Locally

### 1. Environment Variables
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/krishisetu
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
NODE_ENV=development
REDIS_URL=rediss://default:your_redis_token@your-upstash-url.io:6379
```

### 2. Installation & Startup
```bash
cd backend
npm install
npm run dev
```

---

## ⏭️ Up Next (Backend Finalization)
- **Stages 61-62:** Automated Cron Jobs (Price drop alerts & Harvest reminders).
- **Stages 64-66:** Lot Sheet PDF Generators & API Pagination.
- **Stages 67-68:** In-App Direct Messaging between Farmers & Traders.
