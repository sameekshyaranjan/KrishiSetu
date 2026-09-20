# 🌾 KrishiSetu (ಕೃಷಿಸೇತು)

> **Karnataka's Direct Farmer-to-Trader Agricultural Marketplace with Escrow Settlement & APMC Intelligence**

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-v4.8-010101?logo=socketdotio&logoColor=white)](https://socket.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Overview

KrishiSetu is a full-stack agritech platform that connects Karnataka's smallholder farmers directly with licensed APMC traders — eliminating middlemen, guaranteeing payments through escrow, and providing real-time mandi market intelligence.

**Live Demo:** [http://13.61.35.96](http://13.61.35.96) *(Deployed on AWS EC2)*

---

## Key Features

| Module | Description |
|---|---|
| **Crop Marketplace** | Farmers list crops with photos, quality grades, reserve prices. Traders browse, filter by district/category, and place bids. |
| **Real-Time Bidding** | WebSocket-powered live bidding rooms with counter-offers, 15-min undo window, and 48-hour auto-expiry. |
| **Escrow Wallet** | Full-value capital lock on bid acceptance. Double-entry ledger ensures zero payment defaults. |
| **6-Digit Delivery OTP** | Cryptographic handshake at delivery — funds release only after farmer confirms receipt. |
| **Dispute Arbitration** | Admin quasi-judicial docket with photo evidence. Rulings: 100% refund, 85/15 split, or full payout. |
| **Mandi Prices** | Live Agmarknet data across Karnataka APMCs with automated price threshold alerts. |
| **Cold Storage Locator** | 46 Karnataka cold storage facilities with geospatial search and interactive map. |
| **Government Schemes** | 9 central & state agricultural welfare schemes with eligibility info and application links. |
| **Chat System** | Real-time farmer-trader messaging via Socket.io. |
| **Admin Analytics** | Platform GMV, trade volume, dispute metrics, Excel/PDF export for APMC auditing. |

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, React Router 7, Tailwind CSS, Lucide Icons, Socket.io Client |
| **Backend** | Node.js 20+, Express 5, Mongoose 9, Socket.io, BullMQ |
| **Database** | MongoDB Atlas (2dsphere geo-indexing, double-entry ledger) |
| **Cache/Queue** | Redis / ioredis-mock fallback, BullMQ distributed workers |
| **Services** | SendGrid (email/OTP), Cloudinary (media CDN), Data.gov.in (mandi prices) |
| **Auth** | JWT (access + refresh tokens), bcrypt password hashing, role-based access control |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  React 19 SPA (Vite)  ←→  Socket.io Client          │
└──────────────────────────┬──────────────────────────┘
                           │ HTTPS / WSS
┌──────────────────────────▼──────────────────────────┐
│  Express 5 API + Socket.io Gateway                   │
│  JWT Auth · RBAC · Rate Limiting · Helmet            │
└───────┬──────────────┬──────────────┬───────────────┘
        │              │              │
   MongoDB Atlas    Redis/BullMQ    External APIs
   (Users, Crops,   (Cache, Jobs,   (SendGrid,
    Wallet Ledger,   Price Alerts,   Cloudinary,
    Cold Storage)    Bid Expiry)     Agmarknet)
```

**Workflow:** Farmer lists crop → Trader bids → Farmer accepts → Escrow locks funds → Transporter assigned → Farmer dispatches + gets OTP → Trader delivers + submits OTP → Escrow releases to farmer.

---

## Local Setup

### Prerequisites
- Node.js v20+ · MongoDB Atlas URI or local MongoDB · Git

### Installation

```bash
# Clone
git clone https://github.com/sameekshyaranjan/KrishiSetu.git
cd KrishiSetu

# Backend
cd backend
npm install
cp .env.example .env   # Configure MONGO_URI, JWT_SECRET, etc.
npm run dev             # → http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev             # → http://localhost:5173
```

### Environment Variables (backend/.env)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
JWT_REFRESH_SECRET=<your_refresh_secret>
REDIS_URL=<optional_redis_url>
SENDGRID_API_KEY=<your_sendgrid_key>
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
```

### Seed Data

```bash
cd backend
node scripts/seedMockUsers.js         # 10 Farmers + 10 Traders + Wallets
```

---

## Demo Login Credentials

The login page has a **⚡ Demo** tab for instant 1-click sign-in.

### 🛡️ Admin Accounts

| Name | Email | Password |
|---|---|---|
| Super Admin | `admin@krishisetu.com` | `password123` |
| State APMC Officer | `admin@krishisetu.in` | `password123` |

---

### 🌾 Farmer Accounts (10)

All passwords: **`Password@123`**

| # | Name | Email | District | Crops |
|---|---|---|---|---|
| **★** | **Mallikarjun Gowda (Demo Farmer)** | `demo.farmer@krishisetu.com` | Mandya | Paddy, Sugarcane, Ragi |
| 2 | Suresh Patil | `suresh.patil@krishisetu.com` | Belagavi | Soybean, Cotton, Maize |
| 3 | Ningappa Biradar | `ningappa.biradar@krishisetu.com` | Vijayapura | Grapes, Pomegranate, Onion |
| 4 | Manjunath Hegde | `manjunath.hegde@krishisetu.com` | Uttara Kannada | Arecanut, Black Pepper, Cardamom |
| 5 | Chennappa Kumbar | `chennappa.kumbar@krishisetu.com` | Bagalkote | Sugarcane, Jowar, Sunflower |
| 6 | Ranganath Swamy | `ranganath.swamy@krishisetu.com` | Hassan | Coffee, Potato, Ginger |
| 7 | Devendrappa Pujari | `devendrappa.pujari@krishisetu.com` | Ballari | Paddy, Chilli, Groundnut |
| 8 | Sharanappa Nayak | `sharanappa.nayak@krishisetu.com` | Raichur | Sona Masoori Paddy, Cotton |
| 9 | Venkataramana Bhat | `venkataramana.bhat@krishisetu.com` | Dakshina Kannada | Arecanut, Coconut, Cocoa |
| 10 | Girish Kulkarni | `girish.kulkarni@krishisetu.com` | Dharwad | Bengal Gram, Wheat, Onion |

---

### 💼 Trader Accounts (10)

All passwords: **`Password@123`**

| # | Name (Company) | Email | District / APMC | Wallet Balance |
|---|---|---|---|---|
| **★** | **Basavaraj APMC Traders (Demo Trader)** | `demo.trader@krishisetu.com` | Bengaluru Urban / Yeshwanthpur APMC | ₹5,00,000 |
| 2 | Anand Kumar (Kaveri Agro Trading Co) | `anand.kaveri@krishisetu.com` | Mysuru / Bandipalya APMC | ₹2,50,000 |
| 3 | Raghavendra Rao (Krishna Grain Merchants) | `raghavendra.krishna@krishisetu.com` | Ballari / Ballari APMC | ₹2,00,000 |
| 4 | Mallikarjun Deshmukh (Kalyan Karnataka Agro) | `mallikarjun.deshmukh@krishisetu.com` | Kalaburagi / Nehru Gunj APMC | ₹3,50,000 |
| 5 | Vinayak Shenoy (Malnad Organic Spices) | `vinayak.malnad@krishisetu.com` | Shivamogga / Shivamogga APMC | ₹1,80,000 |
| 6 | Praveen Sangolli (Deccan Pulse Trading) | `praveen.deccan@krishisetu.com` | Dharwad / Amargol Hubballi APMC | ₹2,80,000 |
| 7 | Jagadish Patil (Kittur Rani Channamma Agro) | `jagadish.kittur@krishisetu.com` | Belagavi / Belagavi APMC | ₹2,20,000 |
| 8 | Pradeep Shetty (Cauvery Basin Commodities) | `pradeep.cauvery@krishisetu.com` | Mandya / Mandya APMC | ₹1,90,000 |
| 9 | Gopalakrishna Reddy (Chitradurga Oilseeds) | `gopalakrishna.oilseeds@krishisetu.com` | Chitradurga / Chitradurga APMC | ₹2,00,000 |
| 10 | Naveen Poojary (Sahyadri Coastal Produce) | `naveen.sahyadri@krishisetu.com` | Udupi / Adi Udupi APMC | ₹2,40,000 |

> **★** = Primary demo accounts available via 1-click login on the login page.

---

## API Endpoints

Base paths: `/api/*` and `/api/v1/*` · Swagger UI: `http://localhost:5000/api-docs`

| Module | Method | Endpoint | Access |
|---|---|---|---|
| Auth | `POST` | `/auth/login` | Public |
| Auth | `POST` | `/auth/register/farmer` | Public |
| Auth | `POST` | `/auth/register/trader` | Public |
| Crops | `GET` | `/crops` | Public |
| Crops | `POST` | `/crops` | Farmer |
| Bids | `POST` | `/bids` | Trader |
| Bids | `PUT` | `/bids/:id/accept` | Farmer |
| Wallet | `GET` | `/wallet/overview` | Trader |
| Wallet | `POST` | `/wallet/topup` | Trader |
| Orders | `GET` | `/transactions/my-orders` | Authenticated |
| Orders | `PUT` | `/transactions/:id/delivery` | Trader |
| Disputes | `GET` | `/admin/disputes` | Admin |
| Mandi | `GET` | `/prices` | Public |
| Storage | `GET` | `/storage` | Public |
| Schemes | `GET` | `/schemes` | Public |

---

## Project Structure

```
KrishiSetu/
├── backend/
│   ├── config/          # DB, Redis, Swagger config
│   ├── controllers/     # Business logic (auth, crops, bids, wallet, etc.)
│   ├── middleware/       # JWT auth, RBAC, rate limiting, validation
│   ├── models/          # Mongoose schemas (Farmer, Trader, Crop, Bid, Wallet, etc.)
│   ├── routes/          # Express route definitions
│   ├── jobs/            # BullMQ workers (bid expiry, price alerts)
│   ├── scripts/         # Seed & utility scripts
│   └── server.js        # App entry point + Socket.io
├── frontend/
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── context/     # Auth & Socket providers
│       ├── pages/       # Route views (dashboards, marketplace, wallet, etc.)
│       ├── services/    # API & socket service layer
│       └── App.jsx      # Router & layout
└── README.md
```

---

## License

MIT License · See [LICENSE](LICENSE) for details.

---

**Built by [Sameekshya Ranjan](https://github.com/sameekshyaranjan)**
*© 2026 KrishiSetu — Bridging Indian Agriculture with Modern Technology.*
