# FRETO — Freight Made Simpler

> Modern Full-Stack MERN Logistics, Freight Bidding & Truck Booking Platform.  
> Built with **MongoDB, Express.js, React 18, Node.js**, Tailwind CSS, and Leaflet OpenStreetMap.

---

## 🌟 Overview

**FRETO** is an enterprise-grade digital freight and commercial vehicle marketplace connecting **Cargo Shippers** (manufacturers, distributors, and enterprises) directly with **Commercial Fleet Transporters** and **Drivers**.

By eliminating informal middlemen and broker friction, FRETO introduces:
1. **Dynamic Freight Rate & Toll Calculator**: Instant distance, fuel, toll, and baseline freight estimation based on origin/destination cities and truck categories.
2. **Reverse Bidding Marketplace**: Shippers post cargo requirements; verified transporters submit competitive bids with assigned vehicles.
3. **Instant Booking & Tax Invoicing**: Transparent booking confirmations and auto-generated legal GST road transport invoices (SAC 996511).
4. **Live GPS Highway Telemetry**: Real-time Leaflet OpenStreetMap journey tracking with speed, progress, waypoints, and simulation.
5. **Strict Role-Based Portals**: Dedicated workspaces and views for Shippers, Transporters, and Drivers ensuring complete data privacy and streamlined operations.

---

## 👥 Role-Based Workspaces & Workflows

FRETO enforces strict role-based access control and user navigation:

| Role | Accessible Workspaces | Core Features |
|---|---|---|
| **Shipper** | • Book a Truck / Post Consignment<br>• My Loads & Transporter Quotes<br>• Bookings & Invoices<br>• Live GPS Tracking | Post cargo consignments, review competitive quotes from transporters, confirm bookings, generate GST tax invoices, track highway shipments in real time. |
| **Transporter** | • Freight Marketplace<br>• Fleet Management<br>• Active Bookings<br>• Live GPS Tracking | Register commercial fleet (Tippers, Containers, Open body), browse open freight consignments, place competitive quotations, view accepted loads. |
| **Driver** | • Assigned Trip & Highway Navigation | Access assigned highway consignments, view pickup and delivery coordinates, update transit status. |

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
| **Frontend** | React 18, Vite, Tailwind CSS | Responsive web portal with dynamic calculator, role-filtered dashboard, and Leaflet map |
| **Backend** | Node.js, Express.js | REST API controllers, state transitions, authentication, and pricing engine |
| **Database** | MongoDB (Mongoose ODM) | Document persistence for Users, Trucks, Loads, Bids, Bookings, and Trips |
| **Real-time** | Socket.io & GPS Telemetry | Highway coordinates streaming and progress simulation |

---

## 🗄️ Database Models

1. **`User`**: Account authentication with secure password hashing (`bcrypt`) and Role-Based Access Control (`SHIPPER`, `TRANSPORTER`, `DRIVER`).
2. **`Truck`**: Vehicle fleet registration (Truck Number, Model, Capacity in Tons, Driver Name & Phone, Base Rate/km, Operational Status).
3. **`Load`**: Cargo consignment posted by Shipper (Origin City, Destination City, Distance, Cargo Category, Weight, Target Budget, Status).
4. **`Bid`**: Transporter quotation submitted on an open load linking the specific assigned truck and quoted fare.
5. **`Booking`**: Confirmed shipping agreement created when a bid is accepted, generating a unique GST Tax Invoice.
6. **`Trip`**: Live highway journey tracking current GPS coordinates `[lat, lng]`, speed, route history, and estimated arrival time.

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) running locally (default: `mongodb://127.0.0.1:27017/freto_freight`)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Yashraj-2121/freto.git
cd freto
npm install
```

### 2. Seed Initial Demo Data
Populate sample users, verified trucks, active loads, bids, and a live tracking journey:
```bash
npm run seed
```

### 3. Start the Backend API Server
```bash
npm run dev:server
```
*API runs on `http://localhost:8000` (Health Check: `http://localhost:8000/api/health`)*

### 4. Start the Frontend Website
In a second terminal:
```bash
npm run dev:client
```
*Website runs on `http://localhost:3000`*

---

## 🔑 Pre-Configured Test Accounts

| Role | Email | Password | Primary Use Case |
|---|---|---|---|
| **Shipper** | `shipper@freto.in` | `freto123` | Post cargo loads, review bids, accept quotes, print tax invoices |
| **Transporter** | `transporter@freto.in` | `freto123` | Register trucks, browse freight marketplace, submit quotes |
| **Truck Driver** | `driver@freto.in` | `freto123` | Monitor assigned highway trips and update live GPS status |

---

## 📁 Repository Structure

```
freto/
├── server/                    # Node.js + Express REST API
│   ├── src/
│   │   ├── config/db.js       # MongoDB Mongoose Connection
│   │   ├── models/            # User, Truck, Load, Bid, Booking, Trip
│   │   ├── controllers/       # Business logic & state transitions
│   │   ├── middleware/        # JWT auth & RBAC route guards
│   │   ├── routes/            # REST API route declarations
│   │   ├── seeds/seed.js      # Database seeder
│   │   ├── app.js             # Express application configuration
│   │   └── index.js           # Server bootstrap & Socket.io
│   └── package.json
├── client/                    # React (Vite) Single Page Application
│   ├── src/
│   │   ├── components/        # Navbar, Footer, FreightCalculator
│   │   ├── context/           # AuthContext with role-based state
│   │   ├── pages/             # Home, BookTruck, Marketplace, Fleet,
│   │   │                      # Bookings, LiveTracking, Login
│   │   ├── api/client.js      # Axios HTTP client with interceptors
│   │   ├── App.jsx            # Routing & Layout
│   │   └── index.css          # Tailwind CSS design system
│   ├── index.html             # HTML shell with Leaflet CDN
│   └── package.json
└── package.json               # Root workspace scripts
```

---

## 📄 License
MIT © 2026 FRETO — Freight made simpler.
