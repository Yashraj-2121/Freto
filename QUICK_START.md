# FRETO Demo App - Quick Start (2 Minutes)

## Option 1: Run Everything (Recommended)

### Terminal 1 - Start Databases
```bash
cd infra/docker
docker-compose up -d
```

### Terminal 2 - Start Server
```bash
cd server
npm run dev
```
Expected output: `FRETO API listening on :4000`

### Terminal 3 - Start Client
```bash
cd client
npm run dev
```
Expected output: `Local: http://localhost:3000/`

## Option 2: Just Start (All in Docker)

```bash
docker-compose up -d
npm install
npm run dev:server &
npm run dev:client
```

---

## What Works Now ✅

- Phone OTP authentication
- Load posting
- Booking system
- Real-time tracking (Socket.io)
- Trip management
- Admin dashboard
- KYC submission
- Real-time notifications

## What Needs External Service

- 💰 Payments (Razorpay - optional, works in test mode with dummy keys)
- 📧 SMS/OTP (msg91 - optional, limited free SMS)
- 📁 Document upload (S3 - optional, currently skipped)

## Test Login

1. Go to http://localhost:3000
2. Enter phone: `+919876543210`
3. Enter any 4-6 digit OTP code
4. Select role: SHIPPER / TRANSPORTER / DRIVER
5. Start using the app!

## Useful Commands

```bash
# Check databases
docker-compose ps

# View logs
docker-compose logs -f postgres

# Stop everything
docker-compose down

# Run tests
npm test --workspace server

# Check API health
curl http://localhost:4000/api/v1/health
```

---

**That's it! Your full-stack freight marketplace is running! 🚀**
