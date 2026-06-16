# 🌱 KrishiSetu

KrishiSetu is a comprehensive MERN-stack Agri-Marketplace designed to directly connect farmers with verified traders. The platform aims to eliminate middlemen, provide real-time price intelligence, and facilitate secure negotiations for agricultural commodities.

*Note: This project is currently under active development. The backend database architecture is complete, and API endpoints are actively being built.*

## 🚀 Features (Planned & In-Progress)
- **Role-Based Workflows:** Separate dashboards for Farmers, Traders, and System Admins.
- **Direct Crop Bidding:** Real-time negotiation engine between farmers and buyers.
- **Trust & KYC System:** Verification statuses for traders and a dual-sided rating/review system.
- **Communication Hub:** Contextual in-app messaging and notification alerts.
- **Government Schemes:** Informational directory for farmers to access subsidies and resources.
- **Secure Authentication:** OTP-based login for rural accessibility, paired with JWT security.

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js
- **Database (Persistent):** MongoDB, Mongoose (ODM)
- **Database (In-Memory/Cache):** Redis (Upstash), ioredis
- **Authentication:** JWT (jsonwebtoken), bcryptjs, Twilio SMS *(Upcoming)*
- **Frontend:** React.js *(Upcoming)*
- **Real-Time:** Socket.io *(Upcoming)*

## 📂 Backend Architecture
The backend follows a strict MVC (Model-View-Controller) structure to separate business logic, routing, and database interactions.

```text
backend/
├── config/         # Database and third-party configuration
├── controllers/    # Request handlers and business logic
├── jobs/           # Automated cron jobs and background tasks
├── middleware/     # Custom Express middlewares (auth, error handling)
├── models/         # Mongoose database schemas
├── routes/         # Express API route definitions
├── services/       # External service integrations (Twilio, AWS, APIs)
├── utils/          # Helper functions and reusable utilities
└── server.js       # Main application entry point
```

## 🏗️ Database Models Built (Phase 1)
The application leverages advanced NoSQL concepts including **Polymorphic References (`refPath`)**, **TTL Indexes**, and **Compound Indexes** across the following models:

| Model | Purpose |
|---|---|
| `Admin` | Platform administrators (Email/Password Auth) |
| `Farmer` | Sellers listing crops (Mobile OTP Auth) |
| `Trader` | Verified buyers placing bids (Mobile OTP Auth) |
| `Crop` | Inventory listings linked to Farmers |
| `Bid` | Negotiation records between Traders and Farmers |
| `Transaction` | Payment tracking for completed deals |
| `MandiPrice` | Wholesale market prices from government APIs |
| `Message` | Chat system with double polymorphic references |
| `Notification` | Event-driven inbox system |
| `Report` | Trust & Safety moderation workflow |
| `Review` | Reputation rating system with compound index spam prevention |
| `Scheme` | Government scheme directory for farmer awareness |
| `AuditLog` | Platform activity logging for admin accountability |

## 🔐 Security & Middleware Architecture
- **Auth Middleware (`protect`):** Validates JWT Bearer tokens on protected routes, attaches the decoded user payload to `req.user`, and prevents unauthorized access.
- **RBAC Middleware (`authorize`):** Role-Based Access Control ensuring only specific roles (e.g., `admin`, `farmer`, `trader`) can access certain endpoints.
- **Dual-Token System:** Utilizes both short-lived Access Tokens (15m) and long-lived Refresh Tokens (7d) for optimal security without degrading UX.
- **In-Memory OTP Caching:** 6-digit OTPs are stored in Redis with millisecond-precision `EX` TTL to eliminate disk I/O overhead and prevent replay attacks.
- **Zero Trust Routing:** Endpoints like `/api/farmers/profile` strictly rely on the encrypted JWT payload for identity verification rather than trusting URL parameters, eliminating IDOR vulnerabilities.

## 💻 Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sameekshyaranjan/krishisetu.git
   cd krishisetu/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Copy the `.env.example` file to `.env` and fill in your details:
   ```bash
   cp .env.example .env
   ```
   *You will need a MongoDB Atlas connection string.*

4. **Run the server:**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:5000`.

---
*Developed by Sameekshya Ranjan*
