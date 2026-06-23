# KrishiSetu — AI Agent Build Guide

> **Purpose:** This document is a step-by-step workflow guide for an AI agent (Cursor, Windsurf, Antigravity, etc.) to build the KrishiSetu platform from scratch. Each stage is intentionally small and focused. Complete every stage in order. Do not skip stages.
>
> **Stack:** React.js + Vite, Node.js + Express, MongoDB + Mongoose, Tailwind CSS, Shadcn UI, JavaScript
>
> **Rule:** Build only what the current stage says. No stage should touch files outside its defined scope.

---

## PROJECT STRUCTURE OVERVIEW

```
krishiconnect/
├── frontend/         # React + Vite + Tailwind + Shadcn
└── backend/          # Node + Express + MongoDB
```

---

## PHASE 1 — BACKEND FOUNDATION

---

### Stage 1 — Initialise the backend project

- Create a folder called `backend` at the project root.
- Inside `backend`, run `npm init -y` to generate `package.json`.
- Install core dependencies: `express`, `mongoose`, `dotenv`, `cors`, `morgan`.
- Install dev dependencies: `nodemon`.
- Add a `start` script: `node server.js` and a `dev` script: `nodemon server.js` to `package.json`.
- Tech: Node.js, npm

---

### Stage 2 — Create the entry point server file

- Create `backend/server.js`.
- Import `express`, `dotenv`, `cors`, `morgan`.
- Initialise the Express app.
- Call `dotenv.config()`.
- Add `cors()` and `morgan('dev')` as middleware.
- Add `express.json()` middleware.
- Add a root GET route `/` that returns `{ message: "KrishiSetu API running" }`.
- Listen on `process.env.PORT` or `5000`.
- Tech: Express.js

---

### Stage 3 — Set up the environment file

- Create `backend/.env`.
- Add variables: `PORT=5000`, `MONGO_URI=your_mongo_atlas_uri`, `JWT_SECRET=your_jwt_secret`, `JWT_REFRESH_SECRET=your_refresh_secret`, `NODE_ENV=development`.
- Create `backend/.env.example` with the same keys but empty values.
- Add `.env` to `.gitignore`.
- Tech: dotenv

---

### Stage 4 — Set up MongoDB connection

- Create `backend/config/db.js`.
- Write an async `connectDB` function using `mongoose.connect(process.env.MONGO_URI)`.
- Log a success message on connection and an error message on failure.
- Call `connectDB()` inside `server.js` before the app starts listening.
- Tech: Mongoose, MongoDB Atlas

---

### Stage 5 — Create the folder structure for backend

- Create the following empty folders inside `backend/`:
  - `models/`
  - `routes/`
  - `controllers/`
  - `middleware/`
  - `services/`
  - `jobs/`
  - `utils/`
- Add a `.gitkeep` file inside each empty folder so Git tracks them.
- Tech: Project structure

---

### Stage 6 — Create the Farmer Mongoose model

- Create `backend/models/Farmer.js`.
- Define a Mongoose schema with fields: `name` (String, required), `mobile` (String, required, unique), `village` (String), `district` (String), `state` (String), `cropsGrown` (Array of Strings), `landArea` (Number), `sowingSeason` (String), `isActive` (Boolean, default true), `language` (String, default `"en"`), `createdAt` (Date, default Date.now).
- Export the model.
- Tech: Mongoose

---

### Stage 7 — Create the Trader Mongoose model

- Create `backend/models/Trader.js`.
- Define a Mongoose schema with fields: `name` (String, required), `mobile` (String, required, unique), `companyName` (String), `licenseNumber` (String), `apmcAffiliation` (String), `operatingLocations` (Array of Strings), `verificationStatus` (String, enum: `["pending", "approved", "rejected"]`, default `"pending"`), `documents` (Array of Strings — file URLs), `isActive` (Boolean, default true), `createdAt` (Date, default Date.now).
- Export the model.
- Tech: Mongoose

---

### Stage 8 — Create the Admin Mongoose model

- Create `backend/models/Admin.js`.
- Define a Mongoose schema with fields: `name` (String, required), `email` (String, required, unique), `password` (String, required), `role` (String, default `"admin"`), `createdAt` (Date, default Date.now).
- Export the model.
- Tech: Mongoose

---

### Stage 9 — Create the OTP Mongoose model

- Create `backend/models/OTP.js`.
- Define a Mongoose schema with fields: `mobile` (String, required), `otp` (String, required), `expiresAt` (Date, required), `isUsed` (Boolean, default false), `createdAt` (Date, default Date.now).
- Add a TTL index on `expiresAt` so MongoDB auto-deletes expired OTPs: `OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })`.
- Export the model.
- Tech: Mongoose, MongoDB TTL index

---

### Stage 10 — Create the Crop Listing Mongoose model

- Create `backend/models/CropListing.js`.
- Define a Mongoose schema with fields: `farmer` (ObjectId ref `"Farmer"`, required), `cropName` (String, required), `variety` (String), `estimatedQuantity` (Number), `unit` (String, default `"kg"`), `grade` (String), `expectedHarvestDate` (Date), `sowingDate` (Date), `storageStatus` (String, enum: `["field-ready", "stored", "must-sell-today"]`, default `"field-ready"`), `saleType` (String, enum: `["immediate", "scheduled", "pre-harvest"]`), `askingPrice` (Number), `images` (Array of Strings), `moisture` (Number), `weight` (Number), `notes` (String), `isActive` (Boolean, default true), `createdAt` (Date, default Date.now).
- Export the model.
- Tech: Mongoose

---

### Stage 11 — Create the Bid Mongoose model

- Create `backend/models/Bid.js`.
- Define a Mongoose schema with fields: `trader` (ObjectId ref `"Trader"`, required), `cropListing` (ObjectId ref `"CropListing"`, required), `bidAmount` (Number, required), `quantity` (Number), `status` (String, enum: `["active", "accepted", "rejected", "withdrawn"]`, default `"active"`), `message` (String), `createdAt` (Date, default Date.now), `updatedAt` (Date, default Date.now).
- Export the model.
- Tech: Mongoose

---

### Stage 12 — Create the Transaction Mongoose model

- Create `backend/models/Transaction.js`.
- Define a Mongoose schema with fields: `farmer` (ObjectId ref `"Farmer"`), `trader` (ObjectId ref `"Trader"`), `cropListing` (ObjectId ref `"CropListing"`), `bid` (ObjectId ref `"Bid"`), `amount` (Number, required), `paymentStatus` (String, enum: `["pending", "initiated", "completed", "failed"]`, default `"pending"`), `paymentGatewayId` (String), `receiptUrl` (String), `transactionDate` (Date, default Date.now).
- Export the model.
- Tech: Mongoose

---

### Stage 13 — Create the MandiPrice Mongoose model

- Create `backend/models/MandiPrice.js`.
- Define a Mongoose schema with fields: `commodity` (String, required), `market` (String, required), `district` (String), `state` (String), `minPrice` (Number), `maxPrice` (Number), `modalPrice` (Number), `arrivalDate` (Date), `unit` (String, default `"Quintal"`), `fetchedAt` (Date, default Date.now).
- Add a compound index on `commodity`, `market`, and `arrivalDate`.
- Export the model.
- Tech: Mongoose

---

### Stage 14 — Create the GovernmentScheme Mongoose model

- Create `backend/models/GovernmentScheme.js`.
- Define a Mongoose schema with fields: `name` (String, required), `purpose` (String), `eligibility` (String), `benefits` (String), `deadline` (Date), `officialLink` (String), `isPublished` (Boolean, default false), `eligibleCrops` (Array of Strings), `eligibleStates` (Array of Strings), `lastUpdated` (Date, default Date.now), `source` (String — name of scrape source), `createdAt` (Date, default Date.now).
- Export the model.
- Tech: Mongoose

---

### Stage 15 — Create the Notification Mongoose model

- Create `backend/models/Notification.js`.
- Define a Mongoose schema with fields: `recipient` (ObjectId, required), `recipientModel` (String, enum: `["Farmer", "Trader", "Admin"]`), `type` (String — e.g. `"price_alert"`, `"bid_received"`, `"scheme_update"`), `message` (String, required), `isRead` (Boolean, default false), `createdAt` (Date, default Date.now).
- Export the model.
- Tech: Mongoose

---

### Stage 16 — Create the AuditLog Mongoose model

- Create `backend/models/AuditLog.js`.
- Define a Mongoose schema with fields: `action` (String, required), `performedBy` (ObjectId), `performedByModel` (String — `"Admin"`, `"Farmer"`, `"Trader"`), `targetId` (ObjectId), `targetModel` (String), `details` (Object), `createdAt` (Date, default Date.now).
- Export the model.
- Tech: Mongoose

---

### Stage 17 — Create the auth middleware

- Create `backend/middleware/authMiddleware.js`.
- Write a `protect` function that reads the `Authorization` header, extracts the Bearer token, verifies it using `jsonwebtoken` and `JWT_SECRET` from `.env`.
- If valid, attach the decoded payload to `req.user`.
- If invalid or missing, respond with `401 Unauthorized`.
- Install `jsonwebtoken`: `npm install jsonwebtoken`.
- Export `protect`.
- Tech: JWT, Express middleware

---

### Stage 18 — Create the role-based access middleware

- Inside `backend/middleware/authMiddleware.js`, add a `authorize` function.
- It accepts a list of allowed roles (e.g. `authorize("admin", "trader")`).
- It checks `req.user.role` against the allowed list.
- If not allowed, respond with `403 Forbidden`.
- Export `authorize`.
- Tech: RBAC, Express middleware

---

### Stage 19 — Create the error handling middleware

- Create `backend/middleware/errorMiddleware.js`.
- Write a `notFound` middleware that sets status 404 and passes an error forward.
- Write an `errorHandler` middleware that formats all errors as `{ message, stack }` (hide stack in production).
- Register both in `server.js` at the bottom, after all routes.
- Tech: Express error handling

---

### Stage 20 — Create the OTP utility function

- Create `backend/utils/generateOTP.js`.
- Write a function that generates a random 6-digit numeric OTP string.
- Export the function.
- Tech: Node.js crypto / Math.random

---

### Stage 21 — Create the JWT utility functions

- Create `backend/utils/generateToken.js`.
- Write a `generateAccessToken(payload)` function that signs a JWT with `JWT_SECRET` and 15-minute expiry.
- Write a `generateRefreshToken(payload)` function that signs a JWT with `JWT_REFRESH_SECRET` and 7-day expiry.
- Export both.
- Tech: jsonwebtoken

---

### Stage 22 — Build the farmer OTP send endpoint

- Create `backend/controllers/authController.js`.
- Write a `sendFarmerOTP` async function.
- It accepts `mobile` from `req.body`.
- Validate that mobile is a 10-digit number.
- Generate an OTP using the utility from Stage 20.
- Save the OTP to MongoDB via the OTP model (set expiry to 5 minutes from now).
- For now, log the OTP to the console (Twilio will be added later).
- Return `{ message: "OTP sent", mobile }`.
- Create `backend/routes/authRoutes.js` and add `POST /send-otp` route.
- Mount the route in `server.js` at `/api/auth`.
- Tech: Express, Mongoose, OTP model

---

### Stage 23 — Build the farmer OTP verify endpoint

- In `authController.js`, write a `verifyFarmerOTP` async function.
- Accept `mobile` and `otp` from `req.body`.
- Find the latest unused, unexpired OTP for that mobile.
- If OTP matches: mark it as used, find or create the Farmer document, generate access + refresh tokens.
- Return `{ accessToken, refreshToken, farmer, isNewUser }`.
- If OTP is wrong or expired, return `400 Bad Request`.
- Add `POST /verify-otp` to `authRoutes.js`.
- Tech: JWT, Mongoose

---

### Stage 24 — Build the trader OTP send and verify endpoints

- In `authController.js`, write `sendTraderOTP` and `verifyTraderOTP` functions.
- Same logic as farmer OTP flow but look up/create Trader documents.
- Add `POST /trader/send-otp` and `POST /trader/verify-otp` routes to `authRoutes.js`.
- Tech: Express, Mongoose

---

### Stage 25 — Build the admin login endpoint

- In `authController.js`, write an `adminLogin` function.
- Accept `email` and `password` from `req.body`.
- Install `bcryptjs`: `npm install bcryptjs`.
- Find the admin by email, compare passwords using `bcrypt.compare`.
- If valid, return access + refresh tokens.
- If invalid, return `401`.
- Add `POST /admin/login` to `authRoutes.js`.
- Create a one-time seed script `backend/utils/seedAdmin.js` that creates the first admin user (hashed password). Run it once manually.
- Tech: bcryptjs, JWT, Mongoose

---

### Stage 26 — Build the refresh token endpoint

- In `authController.js`, write a `refreshToken` function.
- Accept `refreshToken` from `req.body`.
- Verify the refresh token using `JWT_REFRESH_SECRET`.
- If valid, generate and return a new access token.
- If invalid, return `401`.
- Add `POST /refresh-token` to `authRoutes.js`.
- Tech: JWT

---

### Stage 27 — Build farmer CRUD — Create farmer profile

- Create `backend/controllers/farmerController.js`.
- Write a `getFarmerProfile` function that returns the logged-in farmer's full profile from MongoDB using `req.user.id`.
- Write a `updateFarmerProfile` function that updates allowed fields (name, village, district, state, cropsGrown, landArea, sowingSeason, language).
- Create `backend/routes/farmerRoutes.js` with `GET /profile` and `PUT /profile` routes, both protected by `protect` middleware.
- Mount at `/api/farmers` in `server.js`.
- Tech: Express, Mongoose, JWT middleware

---

### Stage 27.5 — Migrate OTP system from MongoDB to Redis (Bonus)

- Install `ioredis` in the backend: `npm install ioredis`.
- Set up an Upstash Redis database and add `REDIS_URL` to `.env`.
- Create `backend/config/redis.js` to connect to Redis.
- Delete `backend/models/OTP.js`.
- Refactor `sendFarmerOTP` and `sendTraderOTP` in `authController.js` to save OTP to Redis with a 300s expiration (`setex`).
- Refactor `verifyFarmerOTP` and `verifyTraderOTP` to check Redis (`get`) and delete it (`del`).
- Tech: Redis, ioredis, Upstash

---

### Stage 28 — Build farmer registration (admin creates farmer)

- In `farmerController.js`, write a `registerFarmerByAdmin` function that creates a new Farmer document from `req.body`.
- This route should be protected and restricted to admins only: use `protect` + `authorize("admin")`.
- Add `POST /register` to `farmerRoutes.js`.
- Tech: Express, RBAC middleware

---

### Stage 29 — Build trader profile endpoints

- Create `backend/controllers/traderController.js`.
- Write `getTraderProfile` and `updateTraderProfile` functions (same pattern as farmer).
- Create `backend/routes/traderRoutes.js` with `GET /profile` and `PUT /profile`.
- Mount at `/api/traders` in `server.js`.
- Tech: Express, Mongoose

---

### Stage 30 — Build trader verification endpoints (admin)

- In `traderController.js`, write an `updateTraderVerification` function.
- Accept `traderId` and `status` (`approved` / `rejected`) from `req.body`.
- Update the trader's `verificationStatus` in MongoDB.
- Protect with `protect` + `authorize("admin")`.
- Add `PUT /verify/:traderId` to `traderRoutes.js`.
- Tech: Express, Mongoose, RBAC

---

### Stage 31 — Build the crop listing create endpoint

- Create `backend/controllers/cropListingController.js`.
- Write a `createCropListing` function.
- Accept all crop listing fields from `req.body`.
- Set `farmer` to `req.user.id`.
- Save to MongoDB.
- Return the created listing.
- Create `backend/routes/cropListingRoutes.js` with `POST /` protected by `protect`.
- Mount at `/api/listings` in `server.js`.
- Tech: Express, Mongoose

---

### Stage 32 — Build the crop listing read endpoints

- In `cropListingController.js`, write:
  - `getMyListings` — returns all listings for the logged-in farmer.
  - `getAllListings` — returns all active listings (for traders to browse), with optional query params for `crop`, `district`, `grade`, `storageStatus`.
  - `getListingById` — returns a single listing by ID.
- Add corresponding GET routes to `cropListingRoutes.js`.
- Tech: Express, Mongoose, query filtering

---

### Stage 33 — Build the crop listing update and delete endpoints

- In `cropListingController.js`, write:
  - `updateCropListing` — allows a farmer to update their own listing (check ownership).
  - `deleteCropListing` — soft delete by setting `isActive: false`.
- Add `PUT /:id` and `DELETE /:id` routes to `cropListingRoutes.js`.
- Tech: Express, Mongoose

---

### Stage 34 — Build the bid create endpoint

- Create `backend/controllers/bidController.js`.
- Write a `placeBid` function.
- Accept `cropListingId`, `bidAmount`, `quantity`, `message` from `req.body`.
- Set `trader` to `req.user.id`.
- Save the bid to MongoDB.
- Create `backend/routes/bidRoutes.js` with `POST /` protected by `protect` + `authorize("trader")`.
- Mount at `/api/bids` in `server.js`.
- Tech: Express, Mongoose

---

### Stage 35 — Build the bid read endpoints

- In `bidController.js`, write:
  - `getBidsForListing` — returns all bids for a specific crop listing (for farmer to view).
  - `getMyBids` — returns all bids placed by the logged-in trader.
- Add corresponding GET routes to `bidRoutes.js`.
- Tech: Express, Mongoose

---

### Stage 36 — Build bid update and withdraw endpoints

- In `bidController.js`, write:
  - `updateBid` — trader can update `bidAmount` or `quantity` while status is `active`.
  - `withdrawBid` — trader sets bid status to `withdrawn`.
  - `respondToBid` — farmer accepts or rejects a bid (set status to `accepted` or `rejected`).
- Add routes: `PUT /:id`, `PUT /:id/withdraw`, `PUT /:id/respond`.
- Tech: Express, Mongoose, ownership checks

---

### Stage 37 — Build the MandiPrice fetch service (mock)

- Create `backend/services/priceService.js`.
- Write a `fetchMockMandiPrices` function that returns a hardcoded array of mandi price objects (commodity, market, district, minPrice, maxPrice, modalPrice).
- Write a `savePricesToDB` function that upserts these prices into the MandiPrice model.
- This mock will be replaced with the real Agmarknet API later.
- Tech: Mongoose, JavaScript

---

### Stage 38 — Build the MandiPrice API endpoints

- Create `backend/controllers/priceController.js`.
- Write:
  - `getPrices` — returns prices from MongoDB with optional filters: `commodity`, `district`, `market`.
  - `getPricesByCommodity` — returns price history for a single commodity, sorted by date.
- Create `backend/routes/priceRoutes.js` with `GET /` and `GET /:commodity`.
- Mount at `/api/prices` in `server.js`.
- Tech: Express, Mongoose

---

### Stage 39 — Set up node-cron for daily price refresh

- Install `node-cron`: `npm install node-cron`.
- Create `backend/jobs/cronJobs.js`.
- Write a cron job that runs every day at 6:00 AM and calls `fetchMockMandiPrices` then `savePricesToDB`.
- Import and call `initCronJobs()` inside `server.js`.
- Tech: node-cron

---

### Stage 40 — Build the GovernmentScheme endpoints

- Create `backend/controllers/schemeController.js`.
- Write:
  - `getPublishedSchemes` — returns all schemes where `isPublished: true`.
  - `getAllSchemes` — admin only, returns all schemes.
  - `createScheme` — admin only, creates a new scheme.
  - `updateScheme` — admin only, updates a scheme.
  - `publishScheme` — admin only, sets `isPublished: true`.
- Create `backend/routes/schemeRoutes.js`.
- Mount at `/api/schemes` in `server.js`.
- Tech: Express, Mongoose, RBAC

---

### Stage 41 — Build the scheme scraper service (mock)

- Create `backend/services/schemeService.js`.
- Install `axios` and `cheerio`: `npm install axios cheerio`.
- Write a `fetchSchemesFromGov` function that returns a hardcoded array of scheme objects (name, purpose, eligibility, benefits, officialLink).
- Write a `saveSchemesToDB` function that upserts these into the GovernmentScheme model with `isPublished: false` (pending admin review).
- Add a daily cron job in `cronJobs.js` at midnight to run this.
- Tech: axios, cheerio, node-cron

---

### Stage 42 — Build the Notification create utility

- Create `backend/utils/createNotification.js`.
- Write a `createNotification(recipientId, recipientModel, type, message)` async function.
- It saves a new Notification document to MongoDB.
- Export it for use in other controllers.
- Tech: Mongoose

---

### Stage 43 — Build the Notification endpoints

- Create `backend/controllers/notificationController.js`.
- Write:
  - `getMyNotifications` — returns all notifications for the logged-in user, sorted newest first.
  - `markAsRead` — marks a specific notification as read.
  - `markAllAsRead` — marks all of the user's notifications as read.
- Create `backend/routes/notificationRoutes.js`.
- Mount at `/api/notifications` in `server.js`.
- Tech: Express, Mongoose

---

### Stage 44 — Hook notifications into the bid flow

- In `bidController.js`, after a bid is placed, call `createNotification` to notify the farmer.
- After a farmer accepts a bid, call `createNotification` to notify the trader.
- After a farmer rejects a bid, call `createNotification` to notify the trader.
- Tech: Notification utility, Mongoose

---

### Stage 44.5 — Set up Socket.io for real-time communication

- Install `socket.io`: `npm install socket.io`.
- In `server.js`, replace `app.listen()` with Node's `http.createServer(app)` and attach Socket.io to it.
- Configure CORS on the Socket.io instance to allow the frontend origin.
- On `connection`, read the user's `userId` from the handshake query and join them to a private room named after their user ID.
- Log socket connections and disconnections to the console.
- Export the `io` instance so other files can use it.
- Tech: Socket.io, Node.js http module

---

### Stage 44.6 — Emit real-time notifications via Socket.io

- In `utils/createNotification.js`, import the `io` instance from `server.js`.
- After successfully saving a notification to MongoDB, emit a `new-notification` event to the recipient's private room (using `io.to(recipientId).emit(...)`).
- The emitted payload should include the full notification object (title, message, isRead, createdAt).
- This means any connected user will receive instant, real-time push notifications in their browser without polling.
- Tech: Socket.io, Notification utility

---

### Stage 45 — Build the AuditLog utility

- Create `backend/utils/createAuditLog.js`.
- Write a `logAction(action, performedBy, performedByModel, targetId, targetModel, details)` async function.
- It saves a new AuditLog document to MongoDB.
- Export it.
- Tech: Mongoose

---

### Stage 46 — Hook audit logs into admin actions

- In `traderController.js`, after `updateTraderVerification`, call `logAction`.
- In `schemeController.js`, after `publishScheme`, call `logAction`.
- In `farmerController.js`, after `registerFarmerByAdmin`, call `logAction`.
- Tech: AuditLog utility

---

### Stage 47 — Build the admin dashboard stats endpoint

- Create `backend/controllers/adminController.js`.
- Write a `getDashboardStats` function.
- Use `Promise.all` to count: total farmers, total traders, pending trader verifications, active crop listings, total bids, total transactions, published schemes.
- Return all counts in one response object.
- Create `backend/routes/adminRoutes.js` with `GET /dashboard`.
- Mount at `/api/admin` in `server.js`, protected by `protect` + `authorize("admin")`.
- Tech: Mongoose, Promise.all

---

### Stage 48 — Build the admin user management endpoints

- In `adminController.js`, write:
  - `getAllFarmers` — returns paginated farmer list with optional search by name or district.
  - `getAllTraders` — returns paginated trader list with optional filter by verification status.
  - `getFarmerById` — returns single farmer details.
  - `getTraderById` — returns single trader details.
- Add routes to `adminRoutes.js`.
- Tech: Express, Mongoose, pagination

---

### Stage 49 — Add rate limiting to the API

- Install `express-rate-limit`: `npm install express-rate-limit`.
- Create `backend/middleware/rateLimiter.js`.
- Create a general limiter: 100 requests per 15 minutes per IP.
- Create a strict OTP limiter: 5 requests per 15 minutes per IP.
- Apply the general limiter globally in `server.js`.
- Apply the OTP limiter specifically to `/api/auth/send-otp` and `/api/auth/trader/send-otp`.
- Tech: express-rate-limit

---

### Stage 50 — Add Helmet and security headers

- Install `helmet`: `npm install helmet`.
- Import and use `helmet()` in `server.js` before all other middleware.
- Install `express-mongo-sanitize`: `npm install express-mongo-sanitize`.
- Add `mongoSanitize()` middleware in `server.js` to prevent NoSQL injection.
- Tech: helmet, express-mongo-sanitize

---

### Stage 51 — Add input validation middleware

- Install `express-validator`: `npm install express-validator`.
- Create `backend/middleware/validators/authValidators.js`.
- Write validation rules for `sendOTP`: mobile must be 10 digits.
- Write validation rules for `verifyOTP`: mobile and otp both required.
- Write a `validate` middleware that checks `validationResult` and returns `400` if errors exist.
- Apply validators to the auth routes.
- Tech: express-validator

---

### Stage 52 — Integrate Twilio for SMS sending

- Install `twilio`: `npm install twilio`.
- Add Twilio env vars to `.env`: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`.
- Create `backend/services/twilioService.js`.
- Write a `sendSMS(to, message)` function using the Twilio SDK.
- Update `sendFarmerOTP` and `sendTraderOTP` in `authController.js` to call `sendSMS` with the real OTP message.
- Tech: Twilio SDK

---

### Stage 53 — Build the missed-call SMS webhook

- In `twilioService.js`, write a `sendPricesSMS(mobile, language)` function.
  - Fetch the farmer's registered crops from MongoDB.
  - Fetch today's mandi prices for those crops from MandiPrice model.
  - Format the message in the farmer's preferred language (English for now, others later).
  - Send the SMS via Twilio.
- Create `backend/controllers/smsController.js`.
- Write a `handleMissedCall` function that Twilio hits as a webhook.
  - Accept `From` (farmer's phone number) from the request body.
  - Strip country code to get 10-digit mobile.
  - Call `sendPricesSMS`.
  - Return a TwiML `<Response/>` to Twilio.
- Create `backend/routes/smsRoutes.js` with `POST /missed-call`.
- Mount at `/api/sms` in `server.js`.
- Tech: Twilio, Express

---

### Stage 54 — Add language-aware SMS templates

- Create `backend/utils/smsTemplates.js`.
- Write a `getPriceMessage(crop, price, language)` function.
- Support `en` (English), `kn` (Kannada), `hi` (Hindi) templates.
- English example: `"Today's price for Tomato in Bengaluru: ₹2400/Quintal"`.
- Export the function.
- Call this from `sendPricesSMS` in `twilioService.js`.
- Tech: JavaScript, i18n templates

---

### Stage 55 — Integrate real Agmarknet price data

- In `priceService.js`, write a `fetchAgmarknetPrices(commodity, state)` function.
- Use `axios` to call the `data.gov.in` API with the Agmarknet resource ID and an API key.
- Add `AGMARKNET_API_KEY` and `AGMARKNET_RESOURCE_ID` to `.env`.
- Map the API response fields to the MandiPrice schema.
- Call `savePricesToDB` after mapping.
- Replace the mock call in `cronJobs.js` with the real fetch.
- Tech: axios, data.gov.in API

---

### Stage 56 — Build the Transaction endpoints

- Create `backend/controllers/transactionController.js`.
- Write:
  - `createTransaction` — called after a bid is accepted; creates a transaction record.
  - `getMyTransactions` — returns transaction history for the logged-in user (farmer or trader).
  - `getTransactionById` — returns a single transaction.
- Create `backend/routes/transactionRoutes.js`.
- Mount at `/api/transactions` in `server.js`.
- Tech: Express, Mongoose

---

### Stage 58 — Build the cold storage locator data model and endpoint

- Create `backend/models/ColdStorage.js`.
- Define fields: `name`, `address`, `district`, `state`, `latitude`, `longitude`, `capacity`, `costPerDay`, `contactNumber`, `isGovernmentOwned` (Boolean).
- Create `backend/controllers/storageController.js`.
- Write `getAllStorage` with optional filter by `district`.
- Write `getNearbyStorage` that filters by `latitude`, `longitude`, and a radius.
- Create routes and mount at `/api/storage`.
- Tech: Mongoose, geospatial filtering

---

### Stage 59 — Add MongoDB geospatial index to ColdStorage

- Update `ColdStorage.js` schema to store location as a GeoJSON Point: `location: { type: { type: String, default: "Point" }, coordinates: [Number] }`.
- Add `ColdStorageSchema.index({ location: "2dsphere" })`.
- Update `getNearbyStorage` to use `$near` or `$geoWithin` query.
- Tech: MongoDB 2dsphere index

---

### Stage 60 — Build the weather alert service (stub)

- Create `backend/services/weatherService.js`.
- Install `axios` (already installed).
- Add `OPENWEATHER_API_KEY` to `.env`.
- Write a `getWeatherAlert(district)` function that calls the OpenWeatherMap API and returns risk level (normal / watch / warning) based on wind speed and rainfall.
- This is a stub that will be wired to notifications in a later stage.
- Tech: axios, OpenWeatherMap API

---

### Stage 61 — Build the price alert notification job

- In `cronJobs.js`, add a daily cron job that:
  - Fetches all crop listings.
  - Compares today's mandi price to yesterday's price.
  - If price changed by more than 10%, calls `createNotification` for the relevant farmers.
- Tech: node-cron, Mongoose, Notification utility

---

### Stage 62 — Build the harvest reminder notification job

- In `cronJobs.js`, add a cron job that runs every morning.
- It finds all crop listings with `expectedHarvestDate` within the next 7 days.
- It calls `createNotification` for each farmer with a harvest reminder message.
- Tech: node-cron, Mongoose, Notification utility

---

### Stage 63 — Build the admin audit log endpoint

- In `adminController.js`, write a `getAuditLogs` function.
- Return paginated audit logs sorted by newest first.
- Optional filter by `performedByModel` or `action`.
- Add route `GET /audit-logs` to `adminRoutes.js`.
- Tech: Express, Mongoose, pagination

---

### Stage 64 — Build the lot sheet generator utility

- Create `backend/utils/generateLotSheet.js`.
- Write a `generateLotSheet(listing, farmer)` function.
- Return a plain object with: crop, variety, quantity, unit, grade, moisture, expectedHarvestDate, storageStatus, village, district, farmerName, farmerMobile.
- This object will be used by the frontend to display and by a future PDF download feature.
- Export the function.
- Tech: JavaScript utility

---

### Stage 65 — Build the lot sheet endpoint

- In `cropListingController.js`, write a `getLotSheet` function.
- Accept a listing ID, populate the farmer details, call `generateLotSheet`.
- Return the lot sheet object.
- Add `GET /:id/lot-sheet` to `cropListingRoutes.js`.
- Tech: Express, Mongoose, populate

---

### Stage 66 — Add pagination utility

- Create `backend/utils/paginate.js`.
- Write a `paginate(model, query, page, limit, populateFields)` async function that returns `{ data, total, page, totalPages }`.
- Use this utility in `getAllListings`, `getAllFarmers`, `getAllTraders`, `getAuditLogs`.
- Tech: Mongoose, JavaScript utility

---

### Stage 67 — Build the in-app messaging model

- Create `backend/models/Message.js`.
- Define fields: `sender` (ObjectId), `senderModel` (String — `"Farmer"` / `"Trader"`), `receiver` (ObjectId), `receiverModel` (String), `cropListing` (ObjectId ref `"CropListing"`), `content` (String, required), `isRead` (Boolean, default false), `createdAt` (Date, default Date.now).
- Export the model.
- Tech: Mongoose

---

### Stage 68 — Build the messaging endpoints

- Create `backend/controllers/messageController.js`.
- Write:
  - `sendMessage` — creates a message between farmer and trader.
  - `getConversation` — returns all messages between two users for a specific crop listing, sorted by date.
  - `markMessageRead` — marks a message as read.
- Create `backend/routes/messageRoutes.js` and mount at `/api/messages`.
- Tech: Express, Mongoose

---

### Stage 69 — Test all backend endpoints with Postman

- Create a Postman collection file `backend/postman_collection.json`.
- Document all API endpoints built so far with sample request bodies and expected responses.
- Manually test: OTP send/verify, crop listing CRUD, bid CRUD, price fetch, scheme fetch.
- Fix any bugs found during testing.
- Tech: Postman, manual testing

---

### Stage 70 — Write a backend README

- Create `backend/README.md`.
- Document: setup steps, environment variables needed, how to run dev server, all API endpoint routes with method and description.
- Tech: Markdown

---

## PHASE 2 — FRONTEND FOUNDATION

---

### Stage 71 — Initialise the frontend project

- Create a `frontend` folder at the project root.
- Run `npm create vite@latest . -- --template react` inside `frontend`.
- Choose JavaScript (not TypeScript).
- Install dependencies with `npm install`.
- Tech: Vite, React

---

### Stage 72 — Install and configure Tailwind CSS

- Inside `frontend`, run: `npm install -D tailwindcss postcss autoprefixer`.
- Run `npx tailwindcss init -p`.
- Configure `tailwind.config.js` content paths to include `./src/**/*.{js,jsx}`.
- Add Tailwind directives to `src/index.css`.
- Tech: Tailwind CSS

---

### Stage 73 — Install and configure Shadcn UI

- Run `npx shadcn@latest init` inside `frontend`.
- When prompted, choose **JavaScript**, **Default** style, and **Slate** as the base colour.
- Accept all default paths.
- This creates `components.json`, updates `tailwind.config.js`, and creates `src/lib/utils.js`.
- Tech: Shadcn UI

---

### Stage 74 — Install frontend dependencies

- Install: `react-router-dom`, `axios`, `react-hook-form`, `recharts`, `react-hot-toast`, `lucide-react`, `socket.io-client`.
- Tech: npm

---

### Stage 75 — Set up the frontend environment file

- Create `frontend/.env`.
- Add: `VITE_API_URL=http://localhost:5000/api`.
- Create `frontend/.env.example` with the same key and an empty value.
- Add `.env` to `.gitignore`.
- Tech: Vite env variables

---

### Stage 76 — Set up the Axios instance

- Create `frontend/src/utils/axiosInstance.js`.
- Create an Axios instance with `baseURL: import.meta.env.VITE_API_URL`.
- Add a request interceptor that attaches the JWT access token from `localStorage` to the `Authorization` header.
- Add a response interceptor that handles `401` errors by clearing tokens and redirecting to login.
- Export the instance.
- Tech: Axios, JWT

---

### Stage 76.5 — Set up the Socket.io client utility

- Create `frontend/src/utils/socket.js`.
- Import `io` from `socket.io-client`.
- Write a `connectSocket(userId)` function that creates a socket connection to the backend with the userId in the handshake query.
- Write a `disconnectSocket()` function to cleanly close the connection.
- Write a `getSocket()` function that returns the current socket instance.
- Export all three functions.
- Tech: Socket.io-client

---

### Stage 77 — Set up React Router with portal-based routing

- In `frontend/src/App.jsx`, set up `BrowserRouter` with routes:
  - `/` → Landing page (placeholder).
  - `/farmer/login` → Farmer login page (placeholder).
  - `/farmer/*` → Farmer portal routes (protected).
  - `/trader/login` → Trader login page (placeholder).
  - `/trader/*` → Trader portal routes (protected).
  - `/admin/login` → Admin login page (placeholder).
  - `/admin/*` → Admin portal routes (protected).
- Tech: React Router DOM v6

---

### Stage 78 — Create the Auth Context

- Create `frontend/src/context/AuthContext.jsx`.
- Use `createContext` and `useReducer`.
- State: `{ user, role, accessToken, isAuthenticated, loading }`.
- Actions: `LOGIN`, `LOGOUT`, `REFRESH_TOKEN`.
- On mount, read token from `localStorage` and restore auth state.
- Export `AuthContext` and `AuthProvider`.
- Wrap `App.jsx` with `AuthProvider`.
- Tech: React Context, useReducer

---

### Stage 79 — Create the ProtectedRoute component

- Create `frontend/src/components/ProtectedRoute.jsx`.
- It accepts a `role` prop.
- If not authenticated, redirect to the relevant login page.
- If authenticated but wrong role, redirect to home.
- If authenticated and correct role, render `<Outlet />`.
- Use it in `App.jsx` to wrap portal routes.
- Tech: React Router, Auth Context

---

### Stage 80 — Install core Shadcn components

- Run the following to add components:
  - `npx shadcn@latest add button`
  - `npx shadcn@latest add input`
  - `npx shadcn@latest add card`
  - `npx shadcn@latest add badge`
  - `npx shadcn@latest add dialog`
  - `npx shadcn@latest add toast`
  - `npx shadcn@latest add table`
  - `npx shadcn@latest add skeleton`
  - `npx shadcn@latest add separator`
  - `npx shadcn@latest add avatar`
- Each command generates the component in `frontend/src/components/ui/`.
- Tech: Shadcn UI

---

### Stage 81 — Create the shared Navbar component

- Create `frontend/src/components/shared/Navbar.jsx`.
- Show the KrishiSetu logo/name on the left.
- Show navigation links based on the current portal (farmer / trader / admin).
- Show a logout button if authenticated.
- On logout, clear `localStorage` and dispatch `LOGOUT` action.
- Use Tailwind for styling.
- Tech: React, Tailwind, Auth Context

---

### Stage 82 — Create the shared Sidebar component

- Create `frontend/src/components/shared/Sidebar.jsx`.
- Accept a `links` prop (array of `{ label, path, icon }`).
- Render navigation items using Lucide icons and Tailwind.
- Highlight the active link using React Router's `useLocation`.
- Tech: React Router, Lucide React, Tailwind

---

### Stage 83 — Create the shared Layout component

- Create `frontend/src/components/shared/Layout.jsx`.
- Render `<Navbar />`, `<Sidebar />`, and a main content area side by side.
- Accept `sidebarLinks` as a prop.
- Use `<Outlet />` for nested route content.
- Tech: React Router, Tailwind

---

### Stage 84 — Create the Landing Page

- Create `frontend/src/pages/LandingPage.jsx`.
- Show a hero section with KrishiSetu name and tagline: "Empowering Farmers with Real-Time Mandi Prices."
- Show three cards: "I am a Farmer", "I am a Trader", "I am an Admin" — each linking to the relevant login page.
- Style with Tailwind CSS.
- Tech: React, Tailwind, React Router

---

## PHASE 3 — FARMER PORTAL

---

### Stage 85 — Build the Farmer Login page

- Create `frontend/src/pages/farmer/FarmerLogin.jsx`.
- Step 1: Show a mobile number input and a "Send OTP" button.
- On submit, call `POST /api/auth/send-otp` via axiosInstance.
- Step 2: On success, show an OTP input field and a "Verify OTP" button.
- On submit, call `POST /api/auth/verify-otp`.
- On success, store tokens in `localStorage`, dispatch `LOGIN` to context, redirect to `/farmer/dashboard`.
- Show loading states and error messages.
- Use Shadcn `Input`, `Button`, `Card`.
- Tech: React Hook Form, Axios, Shadcn

---

### Stage 86 — Build the Farmer Dashboard page

- Create `frontend/src/pages/farmer/FarmerDashboard.jsx`.
- Fetch farmer profile on mount.
- Show a welcome message with the farmer's name.
- Show 4 summary cards: total crops listed, active bids received, unread notifications, today's avg price for top crop.
- Show a recent alerts section (last 5 notifications).
- Use Shadcn `Card`, `Badge`, `Skeleton` for loading.
- Tech: React, Axios, Shadcn

---

### Stage 87 — Build the Farmer Profile page

- Create `frontend/src/pages/farmer/FarmerProfile.jsx`.
- Fetch and display the farmer's profile.
- Allow editing: name, village, district, state, cropsGrown, landArea, sowingSeason, language preference.
- On save, call `PUT /api/farmers/profile`.
- Show a success toast on update.
- Use React Hook Form, Shadcn `Input`, `Button`.
- Tech: React Hook Form, Axios, Shadcn

---

### Stage 88 — Build the Crop Listing form (create)

- Create `frontend/src/pages/farmer/AddCropListing.jsx`.
- Form fields: cropName, variety, estimatedQuantity, unit, grade, expectedHarvestDate, sowingDate, storageStatus, saleType, askingPrice, notes.
- On submit, call `POST /api/listings`.
- Redirect to my listings on success.
- Use React Hook Form, Shadcn `Input`, `Button`, native `select` elements styled with Tailwind.
- Tech: React Hook Form, Axios, Shadcn

---

### Stage 89 — Build the My Crop Listings page

- Create `frontend/src/pages/farmer/MyCropListings.jsx`.
- Fetch and display the farmer's own listings in a card grid.
- Each card shows: cropName, estimatedQuantity, storageStatus, expectedHarvestDate, saleType, a badge for status.
- Add Edit and Delete buttons on each card.
- Clicking Delete calls `DELETE /api/listings/:id` with a confirmation dialog.
- Tech: React, Axios, Shadcn `Card`, `Badge`, `Dialog`

---

### Stage 90 — Build the Edit Crop Listing page

- Create `frontend/src/pages/farmer/EditCropListing.jsx`.
- Pre-fill a form with existing listing data (fetched by ID).
- On submit, call `PUT /api/listings/:id`.
- Redirect to my listings on success.
- Reuse the same form fields as AddCropListing.
- Tech: React Hook Form, Axios, Shadcn

---

### Stage 91 — Build the Price Dashboard page

- Create `frontend/src/pages/farmer/PriceDashboard.jsx`.
- Show a dropdown to select a crop.
- Fetch today's mandi prices for the selected crop via `GET /api/prices?commodity=...`.
- Show a table of results: market, district, minPrice, maxPrice, modalPrice.
- Fetch historical prices via `GET /api/prices/:commodity`.
- Show a Recharts `LineChart` with modalPrice over the last 30 days.
- Use Shadcn `Card`, `Skeleton`.
- Tech: React, Recharts, Axios, Shadcn

---

### Stage 92 — Build the Bids Received page (Farmer)

- Create `frontend/src/pages/farmer/BidsReceived.jsx`.
- List all the farmer's crop listings.
- For each listing, show its bids: trader name, bidAmount, quantity, status.
- Add "Accept" and "Reject" buttons for each active bid.
- On action, call `PUT /api/bids/:id/respond`.
- Show a confirmation dialog before accepting.
- Tech: React, Axios, Shadcn `Dialog`, `Badge`

---

### Stage 93 — Build the Government Schemes page (Farmer)

- Create `frontend/src/pages/farmer/GovernmentSchemes.jsx`.
- Fetch all published schemes via `GET /api/schemes`.
- Display each scheme in a Shadcn `Card` with: name, purpose, eligibility, benefits, deadline, and a link to the official site.
- Add a badge showing if the deadline is upcoming or passed.
- Tech: React, Axios, Shadcn

---

### Stage 94 — Build the Notifications page (Farmer)

- Create `frontend/src/pages/farmer/FarmerNotifications.jsx`.
- Fetch all notifications via `GET /api/notifications`.
- Display each notification in a list with timestamp and type badge.
- Add a "Mark all as read" button.
- Unread notifications should have a highlighted background.
- Connect to the Socket.io server on mount using the farmer's userId.
- Listen for the `new-notification` event and prepend new notifications to the list in real-time (no page refresh needed).
- Disconnect the socket on unmount to prevent memory leaks.
- Tech: React, Axios, Socket.io-client, Shadcn `Badge`

---

### Stage 95 — Build the Trader Discovery page (Farmer)

- Create `frontend/src/pages/farmer/TraderDiscovery.jsx`.
- Fetch all approved traders via `GET /api/traders`.
- Show each trader in a card: name, company, APMC affiliation, operating locations, verification badge.
- Add a "Message" button that opens a dialog with a message input.
- On send, call `POST /api/messages`.
- Tech: React, Axios, Shadcn `Card`, `Dialog`

---

### Stage 96 — Build the Transaction History page (Farmer)

- Create `frontend/src/pages/farmer/FarmerTransactions.jsx`.
- Fetch the farmer's transaction history.
- Show each transaction: cropName, trader name, amount, date, payment status badge.
- Tech: React, Axios, Shadcn `Table`, `Badge`

---

### Stage 97 — Wire up the Farmer Portal routes and Sidebar

- In `App.jsx`, nest all farmer pages under `/farmer/*` inside the `ProtectedRoute` for role `"farmer"`.
- Create the farmer sidebar links array: Dashboard, My Listings, Price Dashboard, Bids, Schemes, Traders, Messages, Transactions, Notifications, Profile.
- Pass the links to the shared `Layout` component.
- Tech: React Router, Layout component

---

## PHASE 4 — TRADER PORTAL

---

### Stage 98 — Build the Trader Login page

- Create `frontend/src/pages/trader/TraderLogin.jsx`.
- Same OTP flow as Farmer Login but calls `/api/auth/trader/send-otp` and `/api/auth/trader/verify-otp`.
- On success, redirect to `/trader/dashboard`.
- Tech: React Hook Form, Axios, Shadcn

---

### Stage 99 — Build the Trader Dashboard page

- Create `frontend/src/pages/trader/TraderDashboard.jsx`.
- Show summary cards: active listings available, bids placed, accepted bids, total spend.
- Show a map placeholder (to be replaced with real map later).
- Show recent listings added in the last 24 hours.
- Tech: React, Axios, Shadcn `Card`, `Skeleton`

---

### Stage 100 — Build the Browse Crop Listings page (Trader)

- Create `frontend/src/pages/trader/BrowseListings.jsx`.
- Fetch all active listings via `GET /api/listings`.
- Add filters: crop name, district, grade, storageStatus, harvest window.
- Show results in a card grid: farmer village, crop, quantity, grade, expectedHarvestDate, storageStatus, askingPrice.
- Add a "Place Bid" button on each card.
- Tech: React, Axios, Shadcn `Card`, `Badge`, filter inputs

---

### Stage 101 — Build the Place Bid dialog (Trader)

- Create `frontend/src/components/trader/PlaceBidDialog.jsx`.
- A Shadcn `Dialog` that opens from the "Place Bid" button.
- Fields: bidAmount, quantity, message.
- On submit, call `POST /api/bids`.
- Show a success toast on success.
- Tech: React Hook Form, Axios, Shadcn `Dialog`

---

### Stage 102 — Build the My Bids page (Trader)

- Create `frontend/src/pages/trader/MyBids.jsx`.
- Fetch all bids placed by the trader via `GET /api/bids/my`.
- Show each bid: crop name, farmer village, bidAmount, status badge, date.
- Add "Update" and "Withdraw" buttons for active bids.
- Tech: React, Axios, Shadcn `Table`, `Badge`, `Dialog`

---

### Stage 103 — Build the Trader Profile page

- Create `frontend/src/pages/trader/TraderProfile.jsx`.
- Fetch and display the trader's profile.
- Allow updating: name, companyName, licenseNumber, apmcAffiliation, operatingLocations.
- Show verification status badge (pending / approved / rejected).
- Use React Hook Form, Shadcn `Input`, `Badge`.
- Tech: React Hook Form, Axios, Shadcn

---

### Stage 104 — Build the Trader Procurement History page

- Create `frontend/src/pages/trader/ProcurementHistory.jsx`.
- Fetch accepted bids and completed transactions for the trader.
- Show: crop, farmer, quantity, price, date, payment status.
- Tech: React, Axios, Shadcn `Table`

---

### Stage 105 — Build the Trader Messages page

- Create `frontend/src/pages/trader/TraderMessages.jsx`.
- Show a list of conversations (grouped by crop listing and farmer).
- Clicking a conversation loads all messages.
- Show a text input to send a reply.
- Call `GET /api/messages/conversation` and `POST /api/messages`.
- Tech: React, Axios, Tailwind

---

### Stage 105.5 — Build the Trader Notifications page

- Create `frontend/src/pages/trader/TraderNotifications.jsx`.
- Fetch all notifications via `GET /api/notifications`.
- Display each notification in a list with timestamp and type badge.
- Add a "Mark all as read" button.
- Unread notifications should have a highlighted background.
- Connect to the Socket.io server on mount using the trader's userId.
- Listen for the `new-notification` event and prepend new notifications to the list in real-time.
- Disconnect the socket on unmount to prevent memory leaks.
- Tech: React, Axios, Socket.io-client, Shadcn `Badge`

---

### Stage 106 — Wire up the Trader Portal routes and Sidebar

- In `App.jsx`, nest all trader pages under `/trader/*` inside the `ProtectedRoute` for role `"trader"`.
- Trader sidebar links: Dashboard, Browse Listings, My Bids, Procurement History, Messages, Notifications, Profile.
- Tech: React Router, Layout component

---

## PHASE 5 — ADMIN PORTAL

---

### Stage 107 — Build the Admin Login page

- Create `frontend/src/pages/admin/AdminLogin.jsx`.
- Email + password form (no OTP).
- On submit, call `POST /api/auth/admin/login`.
- On success, store token and redirect to `/admin/dashboard`.
- Tech: React Hook Form, Axios, Shadcn

---

### Stage 108 — Build the Admin Dashboard page

- Create `frontend/src/pages/admin/AdminDashboard.jsx`.
- Fetch dashboard stats via `GET /api/admin/dashboard`.
- Show stat cards: total farmers, total traders, pending verifications, active listings, total bids, published schemes.
- Tech: React, Axios, Shadcn `Card`

---

### Stage 109 — Build the Farmer Management page (Admin)

- Create `frontend/src/pages/admin/FarmerManagement.jsx`.
- Fetch paginated farmer list.
- Show a searchable, paginated table: name, mobile, district, state, crops, registered date.
- Clicking a row opens a detail view.
- Add a "Register New Farmer" button that opens a form dialog.
- Tech: React, Axios, Shadcn `Table`, `Dialog`

---

### Stage 110 — Build the Trader Verification page (Admin)

- Create `frontend/src/pages/admin/TraderVerification.jsx`.
- Fetch all traders, filtered by `verificationStatus=pending` by default.
- Show: name, company, APMC, license number, submitted documents (links).
- "Approve" and "Reject" buttons that call `PUT /api/traders/verify/:traderId`.
- Show approved/rejected with status badge.
- Tech: React, Axios, Shadcn `Badge`, `Dialog`

---

### Stage 111 — Build the Scheme Management page (Admin)

- Create `frontend/src/pages/admin/SchemeManagement.jsx`.
- Fetch all schemes (published and unpublished).
- Show each scheme with a "Publish" / "Unpublish" toggle.
- Add a "Create Scheme" button that opens a form dialog with all scheme fields.
- On submit, call `POST /api/schemes`.
- Tech: React, Axios, Shadcn `Dialog`, `Switch`

---

### Stage 112 — Build the Audit Log page (Admin)

- Create `frontend/src/pages/admin/AuditLogs.jsx`.
- Fetch audit logs with pagination.
- Show: action, performed by, target, timestamp.
- Add filter by action type.
- Tech: React, Axios, Shadcn `Table`

---

### Stage 113 — Build the Admin Notification Manager page

- Create `frontend/src/pages/admin/NotificationManager.jsx`.
- Show a form to send a manual SMS/notification to all farmers or traders.
- Fields: recipient type (all farmers / all traders / specific user), message, language.
- On submit, call a new admin endpoint `POST /api/admin/broadcast`.
- Build the `broadcast` controller in `adminController.js` that creates notifications for all matching users.
- Tech: React Hook Form, Axios, Shadcn

---

### Stage 114 — Wire up the Admin Portal routes and Sidebar

- In `App.jsx`, nest all admin pages under `/admin/*` inside `ProtectedRoute` for role `"admin"`.
- Admin sidebar links: Dashboard, Farmers, Trader Verification, Schemes, Audit Logs, Notifications.
- Tech: React Router, Layout component

---

## PHASE 6 — MAPS AND LOCATION FEATURES

---

### Stage 115 — Install Leaflet.js for maps

- Inside `frontend`, install `leaflet` and `react-leaflet`.
- Import Leaflet CSS in `main.jsx`: `import "leaflet/dist/leaflet.css"`.
- Fix the default marker icon issue in Leaflet with React (import and set icon manually).
- Tech: Leaflet.js, React Leaflet

---

### Stage 116 — Build the Cold Storage Map page (Farmer)

- Create `frontend/src/pages/farmer/ColdStorageMap.jsx`.
- Show a Leaflet `MapContainer` centred on India.
- Fetch cold storage facilities via `GET /api/storage`.
- Drop a `Marker` for each facility.
- Clicking a marker shows a `Popup` with: name, address, capacity, costPerDay, contactNumber.
- Add this page to the Farmer sidebar.
- Tech: React Leaflet, Axios

---

### Stage 117 — Add nearby mandi discovery to the Price Dashboard

- In `PriceDashboard.jsx`, add a "Nearby Mandis" section.
- Use the browser `Geolocation API` to get the user's coordinates (with permission).
- Show a small Leaflet map with markers for mandis that have price data in the current district.
- Tech: Geolocation API, React Leaflet

---

### Stage 118 — Build the Trader Map view

- Create `frontend/src/pages/trader/FarmerMap.jsx`.
- Fetch all active farmer listings with their village/district.
- Show markers on a Leaflet map grouped by district.
- Clicking a marker shows farmer village, crop name, quantity, and a "View Listing" link.
- Add this page to the Trader sidebar.
- Tech: React Leaflet, Axios

---

## PHASE 7 — MULTI-LANGUAGE SUPPORT

---

### Stage 119 — Set up i18next for multi-language support

- Install: `i18next`, `react-i18next`.
- Create `frontend/src/i18n/index.js`.
- Set up i18next with languages: `en`, `kn` (Kannada), `hi` (Hindi).
- Create translation files:
  - `frontend/src/i18n/locales/en.json`
  - `frontend/src/i18n/locales/kn.json`
  - `frontend/src/i18n/locales/hi.json`
- Import and initialise i18next in `main.jsx`.
- Tech: i18next, react-i18next

---

### Stage 120 — Add translation keys for the Farmer Portal

- In `en.json`, `kn.json`, `hi.json`, add translations for:
  - Navigation labels (Dashboard, Listings, Prices, etc.).
  - Common buttons (Submit, Cancel, Save, Logout).
  - Farmer dashboard headings.
  - OTP login page labels.
- Use the `useTranslation` hook in Farmer pages to replace hardcoded English strings.
- Tech: react-i18next

---

### Stage 121 — Add a Language Switcher component

- Create `frontend/src/components/shared/LanguageSwitcher.jsx`.
- Show a dropdown with: English, ಕನ್ನಡ (Kannada), हिन्दी (Hindi).
- On change, call `i18n.changeLanguage(lang)` and save the preference to `localStorage`.
- Add the switcher to the Navbar.
- Tech: react-i18next

---

## PHASE 8 — PWA AND PERFORMANCE

---

### Stage 122 — Convert the frontend to a PWA

- Install `vite-plugin-pwa`: `npm install -D vite-plugin-pwa`.
- Configure the plugin in `vite.config.js` with a basic manifest: name, short_name, icons, theme_color, start_url.
- Add a `public/manifest.json` with app icons.
- The service worker will be auto-generated by the plugin.
- Tech: Vite PWA plugin

---

### Stage 123 — Add offline fallback page

- Create `frontend/src/pages/Offline.jsx`.
- Show a friendly message: "You are offline. Last known prices are shown below."
- Display the last-fetched mandi prices from `localStorage` (cache them on every successful fetch in `PriceDashboard.jsx`).
- Register a service worker route for offline fallback to this page.
- Tech: Service Worker, localStorage

---

### Stage 124 — Add Redis caching for mandi prices (backend)

- Install `redis` and `ioredis` in the backend: `npm install ioredis`.
- Add `REDIS_URL` to `.env`.
- Create `backend/config/redis.js` to initialise the Redis client.
- In `priceController.js → getPrices`, check Redis cache first before hitting MongoDB.
- Cache the result for 1 hour with `client.setex`.
- In the cron job that refreshes prices, invalidate the cache after saving new prices.
- Tech: Redis, ioredis

---

### Stage 125 — Add Mongoose indexes for performance

- In `CropListing.js`, add indexes on `cropName`, `district`, `storageStatus`, `isActive`.
- In `MandiPrice.js`, confirm the compound index on `commodity + market + arrivalDate` is set.
- In `Bid.js`, add an index on `trader` and `cropListing`.
- In `Notification.js`, add an index on `recipient + isRead`.
- Tech: Mongoose index

---

## PHASE 9 — SECURITY AND PRODUCTION HARDENING

---

### Stage 126 — Add HTTPS redirect and trust proxy settings

- In `server.js`, set `app.set("trust proxy", 1)` for proper IP detection behind a reverse proxy.
- Add middleware to redirect HTTP to HTTPS in production (check `req.secure`).
- Tech: Express

---

### Stage 127 — Add request logging with Winston

- Install `winston`: `npm install winston`.
- Create `backend/utils/logger.js`.
- Configure Winston to log `info` and `error` levels to the console in dev and to log files in production.
- Replace `console.log` and `console.error` in key files (`server.js`, `cronJobs.js`, `priceService.js`) with the Winston logger.
- Tech: Winston

---

### Stage 128 — Set up Sentry for error tracking (backend)

- Install `@sentry/node`: `npm install @sentry/node`.
- Add `SENTRY_DSN` to `.env`.
- Initialise Sentry in `server.js` before all other middleware.
- Add Sentry error handler after the `errorHandler` middleware.
- Tech: Sentry

---

### Stage 129 — Set up Sentry for error tracking (frontend)

- Install `@sentry/react`: `npm install @sentry/react`.
- Initialise Sentry in `frontend/src/main.jsx` with the DSN and the current environment.
- Wrap the app in a `Sentry.ErrorBoundary` component.
- Tech: Sentry React SDK

---

### Stage 130 — Add DPDP consent flag to Farmer model

- Update `backend/models/Farmer.js` to add a `consentGiven` (Boolean, default false) field.
- Add a `consentDate` (Date) field.
- Update `verifyFarmerOTP` in `authController.js`: if it's a new user, set `consentGiven: false`.
- Add a `POST /api/farmers/consent` endpoint that sets `consentGiven: true` and `consentDate`.
- On first login in the Farmer Portal, show a consent dialog before proceeding to the dashboard.
- Tech: Mongoose, React, Shadcn `Dialog`

---

### Stage 131 — Add data export for admin (CSV download)

- Install `json2csv` in the backend: `npm install json2csv`.
- In `adminController.js`, write a `exportFarmersCSV` function.
- Query all farmers, convert to CSV using `json2csv`, set `Content-Type: text/csv` header, and stream the file.
- Add `GET /admin/export/farmers` route.
- In the Admin Farmer Management page, add a "Download CSV" button.
- Tech: json2csv, Express response streaming

---

### Stage 132 — Add bulk farmer import via CSV (admin)

- Install `multer` and `csv-parser` in the backend: `npm install multer csv-parser`.
- Create `backend/middleware/upload.js` using Multer for memory storage.
- In `adminController.js`, write an `importFarmersCSV` function.
  - Parse the uploaded CSV.
  - Validate each row.
  - Bulk insert using `Farmer.insertMany`.
  - Return a summary: inserted count, skipped count, errors.
- Add `POST /admin/import/farmers` route.
- In the Admin page, add a file upload input.
- Tech: Multer, csv-parser, Mongoose bulk insert

---

## PHASE 10 — ADVISORY AND ALERTS UI

---

### Stage 135 — Build the Weather Alerts widget

- Create `frontend/src/components/farmer/WeatherAlertWidget.jsx`.
- Fetch weather data for the farmer's district on mount.
- Show a coloured alert card: green (normal), yellow (watch), red (warning).
- Include wind speed, expected rainfall, and a risk message.
- Embed this widget in the `FarmerDashboard.jsx`.
- Tech: React, Axios, Tailwind

---

### Stage 136 — Build the Price Intelligence panel

- Create `frontend/src/components/farmer/PriceIntelligencePanel.jsx`.
- For the farmer's top crop, show:
  - Local mandi price (from MandiPrice).
  - Nearest trader bid (from Bids for this farmer's listing).
  - Historical average (calculated from MandiPrice history).
  - A simple recommendation: "Sell now", "Wait 3 days", or "Accept trader bid".
- Logic: if current price > 30-day average, recommend selling now; if a trader bid is above mandi price, recommend accepting.
- Embed in `FarmerDashboard.jsx`.
- Tech: React, Axios

---

### Stage 137 — Build the Demand Spike Alert badge

- In `BrowseListings.jsx` (Trader portal), add a "High Demand" badge on listings where more than 3 active bids exist.
- In `PriceDashboard.jsx` (Farmer portal), show a "Demand Spike" badge on crops that have more than 5 bids platform-wide today.
- Tech: React, conditional Shadcn `Badge`

---

## PHASE 11 — FINAL INTEGRATION AND POLISH

---

### Stage 138 — Add Toast notifications throughout the app

- Ensure `react-hot-toast`'s `<Toaster />` component is in `App.jsx`.
- Add success and error toasts to every form submission, API action, and OTP flow across all portals.
- Use consistent toast messages: `"Listing created successfully"`, `"OTP sent to your mobile"`, `"Bid placed successfully"`, etc.
- Tech: react-hot-toast

---

### Stage 139 — Add Skeleton loading states throughout the app

- Replace all plain loading spinners with Shadcn `Skeleton` components.
- Apply skeletons in: FarmerDashboard, BrowseListings, PriceDashboard, AdminDashboard, GovernmentSchemes, BidsReceived.
- Tech: Shadcn Skeleton

---

### Stage 140 — Add empty state illustrations

- Create `frontend/src/components/shared/EmptyState.jsx`.
- Accept `title` and `description` props.
- Show a simple SVG illustration and helpful text.
- Use it when there are: no crop listings, no bids, no notifications, no schemes, no transactions.
- Tech: React, SVG, Tailwind

---

### Stage 141 — Add error boundary component

- Create `frontend/src/components/shared/ErrorBoundary.jsx` as a React class component.
- Show a friendly error screen with a "Refresh page" button.
- Wrap the `<App />` in `main.jsx` with this component.
- Tech: React Error Boundary

---

### Stage 142 — Make all tables responsive

- Review every Shadcn `Table` in the app.
- On mobile screens (< 768px), replace tables with stacked card views.
- Use Tailwind's `hidden md:table` and `md:hidden` utilities.
- Tech: Tailwind responsive utilities

---

### Stage 143 — Add a global search bar (Admin)

- Create `frontend/src/components/admin/GlobalSearch.jsx`.
- A search input in the Admin Navbar.
- On typing, debounce the input (300ms) and call a new backend endpoint `GET /api/admin/search?q=...`.
- The backend endpoint searches across Farmers (by name/mobile) and Traders (by name/company).
- Show results in a dropdown below the search bar.
- Tech: React, Axios, debounce (lodash or custom)

---

### Stage 144 — Add the Lot Sheet viewer (Farmer)

- In `MyCropListings.jsx`, add a "View Lot Sheet" button on each listing card.
- Clicking it opens a Shadcn `Dialog` showing the formatted lot sheet data (from `GET /api/listings/:id/lot-sheet`).
- Add a "Print" button inside the dialog.
- Tech: React, Axios, Shadcn `Dialog`

---

### Stage 145 — Add pagination controls to all list pages

- Create `frontend/src/components/shared/Pagination.jsx`.
- Accept `currentPage`, `totalPages`, `onPageChange` props.
- Show Previous / Next buttons and page number indicators.
- Apply to: FarmerManagement, BrowseListings, AuditLogs, MyBids, MandiPrice history.
- Tech: React, Tailwind

---

### Stage 146 — Write frontend API service files

- Create individual API service files in `frontend/src/services/`:
  - `authService.js` — sendOTP, verifyOTP, adminLogin, refreshToken.
  - `farmerService.js` — getProfile, updateProfile, getListings, createListing.
  - `traderService.js` — getProfile, updateProfile, getListings, placeBid, getMyBids.
  - `priceService.js` — getPrices, getPriceHistory.
  - `schemeService.js` — getSchemes.
  - `adminService.js` — getDashboard, getFarmers, getTraders, verifyTrader.
- Move all `axiosInstance` calls from pages into these service files.
- Tech: Axios, JavaScript modules

---

### Stage 147 — Write the full project README

- Create `README.md` at the project root.
- Include:
  - Project overview and problem statement.
  - Full tech stack list.
  - Prerequisites (Node.js, MongoDB, Redis, Twilio account).
  - Step-by-step local setup: clone, install dependencies, configure `.env` files, seed admin, run backend, run frontend.
  - API documentation summary (link to `backend/README.md`).
  - Project folder structure diagram.
  - Future scope section.
- Tech: Markdown

---

## BONUS STAGES (Optional Enhancements)

---

### Stage 151 — Add WhatsApp messaging via Twilio WhatsApp API

- In `twilioService.js`, write a `sendWhatsAppMessage(to, message)` function using `whatsapp:` prefix in the Twilio `to` field.
- Add a farmer preference field `preferWhatsApp` (Boolean) to the Farmer model.
- In the missed-call handler and price alerts, check the preference and route to WhatsApp or SMS accordingly.
- Tech: Twilio WhatsApp API

---

### Stage 152 — Add crop price prediction (simple moving average)

- Create `backend/services/predictionService.js`.
- Write a `predictPrice(commodity, market)` function.
- Fetch the last 30 days of `MandiPrice` data for the commodity.
- Calculate the 7-day and 30-day moving averages.
- Return a prediction object: `{ predictedPrice, trend, confidence }`.
- Add `GET /api/prices/:commodity/predict` endpoint.
- Show the prediction in a card on the Farmer `PriceDashboard.jsx`.
- Tech: Mongoose, basic statistics

---

### Stage 153 — Add a Farmer crop image upload feature

- Install `multer` (already installed) and configure it for disk storage in `uploads/` folder.
- Create `backend/middleware/uploadImage.js`.
- Add `POST /api/listings/:id/images` endpoint that accepts up to 5 images, saves to disk, and updates the listing's `images` array with file paths.
- In `AddCropListing.jsx` and `EditCropListing.jsx`, add an image upload input.
- Show thumbnail previews of uploaded images.
- Tech: Multer, React file input

---

### Stage 154 — Add an SMS daily price digest job

- In `cronJobs.js`, add a 7:00 AM cron job.
- It fetches all farmers with `language` preferences.
- For each farmer, it fetches prices for their registered crops.
- It calls `sendSMS` to send a morning digest message in their preferred language.
- Only send to farmers who have `receiveDailyDigest: true` (add this field to Farmer model).
- Tech: node-cron, Twilio SMS, SMS templates

---

### Stage 155 — Performance audit and final cleanup

- Run `npm run build` in the frontend and check the bundle size output.
- Split large pages into lazy-loaded routes using `React.lazy` and `Suspense`.
- Add `loading="lazy"` to any images.
- Remove all `console.log` statements from both backend and frontend.
- Run ESLint across both projects and fix all warnings.
- Do a final end-to-end test: register farmer → create listing → trader places bid → farmer accepts bid.
- Tech: React lazy loading, ESLint, Vite build optimisation

---

*End of KrishiSetu Build Guide — 149 Stages*
