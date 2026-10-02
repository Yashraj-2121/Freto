# FRETO Demo App - Quick Start

## Setup Guide

### 1. Configure Supabase Environment

You need a Supabase project. Create `.env` inside `/server`:
```env
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Create `.env` inside `/client`:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:8000/api
```

### 2. Install Dependencies

```bash
# Install root dependencies (if any)
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Run Development Servers

**Terminal 1 - Start Server**
```bash
cd server
npm run dev
```
Expected output: `FRETO Freight & Truck Booking Server listening on port 8000`

**Terminal 2 - Start Client**
```bash
cd client
npm run dev
```
Expected output: `Local: http://localhost:5173/`

---

## What Works Now ✅

- **Supabase Authentication**: Secure email/password login and JWT management.
- **Role-Based Access**: Dedicated dashboards for Shippers and Transporters/Drivers (Owner-Operators).
- **Load Posting**: Shippers can post specific cargo requirements.
- **Reverse Bidding**: Transporters bid on open loads with specific trucks.
- **Booking & Invoicing**: Auto-generates GST transport invoices upon bid acceptance.
- **OSRM GPS Tracking**: Live highway journey tracking featuring OpenStreetMap and OSRM curved road generation.

## Test Login

1. Go to your local client URL (e.g. `http://localhost:5173`)
2. Click **Sign In** and create a new account
3. Select role: **SHIPPER** (to post loads) or **TRANSPORTER/DRIVER** (to add trucks and bid)
4. Start using the app!

---

**That's it! Your full-stack freight marketplace is running! 🚀**
