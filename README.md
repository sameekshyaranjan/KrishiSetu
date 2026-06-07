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
- **Database:** MongoDB, Mongoose (ODM)
- **Frontend:** React.js *(Upcoming)*
- **Authentication:** JWT, Twilio SMS *(Upcoming)*
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
1. `Admin` - Platform administrators (Email/Password Auth)
2. `Farmer` - Sellers listing crops (Mobile OTP Auth)
3. `Trader` - Verified buyers placing bids (Mobile OTP Auth)
4. `Crop` - Inventory listings linked to Farmers
5. `Bid` - Junction document recording negotiations between Traders and Farmers
6. `OTP` - Self-destructing secure tokens using MongoDB TTL
7. `Message` - Chat system using double polymorphic references
8. `Notification` - Event-driven inbox system
9. `Report` - Trust & Safety moderation workflow
10. `Review` - Reputation rating system preventing duplicate spam

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
