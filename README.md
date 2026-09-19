# FRETO FreightFlow — Full-Stack Freight & Truck Booking Platform

> **Academic Full-Stack Web Development Project**  
> Built with the **MERN Stack** (MongoDB + Express.js + React.js + Node.js) with Tailwind CSS and Leaflet OpenStreetMap.

---

## 🌟 Project Abstract

**FRETO FreightFlow** is an end-to-end full-stack web platform that digitizes road freight logistics. It directly bridges the gap between **Cargo Shippers** (manufacturers, distributors, traders) and **Commercial Truck Transporters** (fleet owners and truck operators).

Instead of relying on unorganized middleman brokers who charge 15–20% commissions with zero visibility, FRETO provides:
1. **Interactive Freight Rate & Toll Calculator**: Instant distance, fuel, toll, and fair freight estimation.
2. **Transparent Bidding Marketplace**: Shippers post cargo requirements; transporters place direct competitive quotes with their registered trucks.
3. **Instant Booking & Tax Invoicing**: 1-click bid acceptance auto-generates legal GST road transport invoices (SAC 996511).
4. **Live GPS Highway Telemetry**: Interactive Leaflet / OpenStreetMap route tracking with speed, progress, waypoints, and simulation.
5. **Administrative Analytics**: Executive dashboard with Gross Merchandise Value (GMV), platform fee calculations, and fleet capacity.
6. **🎓 Built-in Teacher Viva & Architecture Guide**: Accessible at `/presentation-guide` directly on the website for easy project defense.

---

## 🏗️ System Architecture (MERN Stack)

```
                       ┌──────────────────────────────────────────────────────────┐
                       │               REACT 18 SINGLE PAGE APP                   │
                       │   (Tailwind CSS + Leaflet OpenStreetMap + Axios Client)  │
                       └────────────────────────────┬─────────────────────────────┘
                                                    │  HTTP / RESTful JSON + JWT
                                                    ▼
                       ┌──────────────────────────────────────────────────────────┐
                       │               NODE.JS + EXPRESS.JS SERVER                │
                       │   (Routes + RBAC Middleware + Telemetry Controllers)     │
                       └──────────────┬─────────────────────────────┬─────────────┘
                                      │                             │
                                      ▼                             ▼
                       ┌──────────────────────────────┐    ┌──────────────────────┐
                       │       MONGODB DATABASE       │    │      SOCKET.IO       │
                       │   (Mongoose Schemas & State) │    │  (Real-Time GPS Fix) │
                       └──────────────────────────────┘    └──────────────────────┘
```

| Layer | Technology | Role |
|---|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS | Responsive web portal with dynamic calculator, fleet showcase, and Leaflet map |
| **Backend** | Node.js, Express.js | REST API controllers, state transitions, authentication, and pricing engine |
| **Database** | MongoDB (Mongoose ODM) | Document persistence for Users, Trucks, Loads, Bids, Bookings, and Trips |
| **Real-time** | Socket.io & GPS Telemetry | Highway coordinates streaming and progress simulation |

---

## 🗄️ Database Schemas & Data Flow

1. **`User`**: Account identity with Role-Based Access Control (`SHIPPER`, `TRANSPORTER`, `DRIVER`, `ADMIN`).
2. **`Truck`**: Vehicle fleet registration (Truck Number, Model, Capacity in Tons, Driver Name & Phone, Base Rate/km, Status).
3. **`Load`**: Cargo consignment posted by Shipper (Origin City, Destination City, Distance, Cargo Category, Weight, Target Budget).
4. **`Bid`**: Transporter quotation submitted on an open load linking the specific assigned truck and quoted fare.
5. **`Booking`**: Confirmed shipping agreement created when a bid is accepted, generating a unique GST Tax Invoice.
6. **`Trip`**: Live highway journey tracking current GPS coordinates `[lat, lng]`, speed, route history, and estimated arrival time.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally (default: `mongodb://127.0.0.1:27017/freto_freight`)

### 1. Seed Initial Demo Data
To populate sample users, verified trucks, active loads, bids, and a live tracking journey:
```bash
npm run seed
```

### 2. Start the Backend API Server
```bash
npm run dev:server
```
*API will run on [http://localhost:8000](http://localhost:8000) (Health Check: `http://localhost:8000/api/health`)*

### 3. Start the Frontend Website
In a second terminal:
```bash
npm run dev:client
```
*Website will open on [http://localhost:3000](http://localhost:3000)*

---

## 🔑 Pre-Configured Demo Accounts

For your teacher presentation, the website includes a **1-Click Demo Bar** at the top of every page. You can also sign in with these credentials:

| Role | Email | Password | Primary Capabilities |
|---|---|---|---|
| **Shipper** | `shipper@freto.in` | `freto123` | Post cargo loads, calculate freight costs, accept bids, print tax invoices |
| **Transporter** | `transporter@freto.in` | `freto123` | Register trucks, browse open loads, place competitive quotes |
| **Admin** | `admin@freto.in` | `freto123` | View GMV revenue, active fleet capacity, user accounts, and platform analytics |
| **Truck Driver** | `driver@freto.in` | `freto123` | Monitor assigned highway trips and update live GPS status |

---

## 🎓 5-Step Teacher Demonstration Script

When demonstrating this project to your teacher or evaluator:

1. **Homepage & Rate Calculator**:
   - Open `http://localhost:3000`.
   - Show the **Freight Rate Calculator**: Select *Mumbai to Delhi*, choose *14ft Open Body*, click *Calculate*. Show how distance, fuel, tolls, and 5% GST are automatically broken down.
2. **Post a Cargo Consignment (Shipper)**:
   - Click the **"📦 Shipper"** button in the top demo banner.
   - Navigate to **"Book a Truck"** and click **"Post Freight Load Now"**. Explain that this creates a document in MongoDB with status `POSTED`.
3. **Submit a Quotation (Transporter)**:
   - Click the **"🚚 Transporter"** button in the top demo banner.
   - Go to **"Freight Marketplace"**, locate the load, and click **"Quote / Bid Now"**. Select a truck from the fleet, enter the price, and submit.
4. **Accept Bid & Generate GST Tax Invoice**:
   - Switch back to **"📦 Shipper"**, open **"My Loads"**, and click **"Accept & Confirm Booking"**.
   - Go to **"Bookings & Invoices"** and click **"📄 Tax Invoice"** to show the professional, printable GST invoice with consignor/consignee details and SAC 996511 codes.
5. **Live GPS Map Simulation**:
   - Open **"Live GPS Map"** (`/tracking`). Show the truck moving along the highway on OpenStreetMap.
   - Click **"🚀 Simulate Truck Movement"** to watch the truck icon progress, speed update, and waypoints log until delivery is complete!

---

## 🎯 Common Viva Questions & Answers

**Q: Why is MongoDB suited for this freight platform?**  
*A: Freight data has variable specifications (different truck dimensions, varying cargo categories, dynamic route waypoints). MongoDB's flexible BSON document model allows nesting waypoints and vehicle attributes cleanly without complex multi-table SQL joins.*

**Q: How is security handled?**  
*A: Passwords are encrypted with `bcrypt` (10 salt rounds). Authentication is stateless using signed JSON Web Tokens (JWT) passed in `Authorization: Bearer` headers. Role-Based Access Control (RBAC) middleware protects privileged routes.*

**Q: How does the live tracking work without real hardware?**  
*A: The system implements an interpolation engine that simulates real-world highway transit between origin and destination coordinates, dynamically updating speed, passed waypoints, and ETA upon telemetry triggers.*

---

## 📁 Repository Structure

```
freto-mern/
├── server/                    # Node.js + Express REST API
│   ├── src/
│   │   ├── config/db.js       # MongoDB Mongoose Connection
│   │   ├── models/            # User, Truck, Load, Bid, Booking, Trip
│   │   ├── controllers/       # Business logic & state transitions
│   │   ├── middleware/        # JWT auth & RBAC route guards
│   │   ├── routes/            # REST API route declarations
│   │   ├── seeds/seed.js      # Realistic database seeder
│   │   ├── app.js             # Express application configuration
│   │   └── index.js           # Server bootstrap & Socket.io
│   └── package.json
├── client/                    # React (Vite) Single Page Application
│   ├── src/
│   │   ├── components/        # Navbar, Footer, FreightCalculator
│   │   ├── context/           # AuthContext with 1-click demo switcher
│   │   ├── pages/             # Home, BookTruck, Marketplace, Fleet,
│   │   │                      # Bookings, LiveTracking, Admin, PresentationGuide, Login
│   │   ├── api/client.js      # Axios HTTP client with interceptors
│   │   ├── App.jsx            # Routing & Layout
│   │   └── index.css          # Tailwind CSS design system
│   ├── index.html             # HTML shell with Leaflet CDN
│   └── package.json
└── package.json               # Root workspace scripts
```

© 2026 FRETO FreightFlow — Built for Full-Stack Web Development Academic Evaluation.
