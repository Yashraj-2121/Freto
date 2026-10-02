# FRETO — Freight Made Simpler

> Modern Full-Stack Logistics, Freight Bidding & Truck Booking Platform.  
> Built with **Express.js, React 18, Node.js, Supabase (PostgreSQL & Auth)**, Tailwind CSS, and Leaflet OpenStreetMap.

---

## 🌟 Overview

**FRETO** is an enterprise-grade digital freight and commercial vehicle marketplace connecting **Cargo Shippers** (manufacturers, distributors, and enterprises) directly with **Commercial Fleet Transporters** and **Drivers**.

By eliminating informal middlemen and broker friction, FRETO introduces:
1. **Dynamic Freight Rate & Toll Calculator**: Instant distance, fuel, toll, and baseline freight estimation based on origin/destination cities and truck categories.
2. **Reverse Bidding Marketplace**: Shippers post cargo requirements; verified transporters submit competitive bids with assigned vehicles.
3. **Instant Booking & Tax Invoicing**: Transparent booking confirmations and auto-generated legal GST road transport invoices (SAC 996511).
4. **Live GPS Highway Telemetry**: Real-time Leaflet OpenStreetMap journey tracking powered by OSRM curved road mapping.
5. **Strict Role-Based Portals**: Dedicated workspaces and views for Shippers, Transporters, and Drivers (Owner-Operators).

---

## 👥 Role-Based Workspaces & Workflows

FRETO enforces strict role-based access control and user navigation:

| Role | Accessible Workspaces | Core Features |
|---|---|---|
| **Shipper** | • Book a Truck / Post Consignment<br>• My Loads & Transporter Quotes<br>• Bookings & Invoices<br>• Live GPS Tracking | Post cargo consignments, review competitive quotes from transporters, confirm bookings, generate GST tax invoices, track highway shipments in real time. |
| **Transporter / Driver** | • Freight Marketplace<br>• Fleet Management<br>• Active Bookings<br>• Live GPS Tracking | Register commercial fleet (Tippers, Containers, Open body), browse open freight consignments, place competitive quotations, and drive the load (Owner-Operator mode). |

---

## 🏗️ System Architecture

```text
                       ┌──────────────────────────────────────────────────────────┐
                       │               REACT 18 SINGLE PAGE APP                   │
                       │   (Tailwind CSS + Leaflet OpenStreetMap + Axios Client)  │
                       └────────────────────────────┬─────────────────────────────┘
                                                    │  HTTP / RESTful JSON + Supabase JWT
                                                    ▼
                       ┌──────────────────────────────────────────────────────────┐
                       │               NODE.JS + EXPRESS.JS SERVER                │
                       │   (Routes + Supabase Auth Middleware + OSRM Integration) │
                       └──────────────┬─────────────────────────────┬─────────────┘
                                      │                             │
                                      ▼                             ▼
                       ┌──────────────────────────────┐    ┌──────────────────────┐
                       │    SUPABASE POSTGRESQL       │    │     SUPABASE AUTH    │
                       │  (RLS Policies, Foreign Keys)│    │   (JWTs & Sessions)  │
                       └──────────────────────────────┘    └──────────────────────┘
```

| Layer | Technology | Role |
|---|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS | Responsive web portal with dynamic calculator, role-filtered dashboard, and Leaflet map |
| **Backend** | Node.js, Express.js, Supabase JS | REST API controllers, state transitions, authentication validation |
| **Database** | Supabase (PostgreSQL) | Fully relational storage with Row Level Security (RLS) and cascading deletes |
| **Mapping** | Leaflet & OSRM API | Highway coordinates and curved road polyline generation |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- A [Supabase](https://supabase.com/) Project

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Yashraj-2121/freto.git
cd freto
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Configure Supabase Environment
Create `.env` inside `/server`:
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

### 3. Start the Backend API Server
```bash
cd server
npm run dev
```

### 4. Start the Frontend Website
In a second terminal:
```bash
cd client
npm run dev
```

---

## 📁 Repository Structure

```text
freto/
├── server/                    # Node.js + Express REST API
│   ├── src/
│   │   ├── config/            # Supabase Client Initialization
│   │   ├── controllers/       # Business logic & state transitions
│   │   ├── middleware/        # Supabase JWT decoding & validation
│   │   ├── routes/            # REST API route declarations
│   │   ├── app.js             # Express application configuration
│   │   └── index.js           # Server bootstrap
│   └── package.json
├── client/                    # React (Vite) Single Page Application
│   ├── src/
│   │   ├── components/        # Navbar, Footer, FreightCalculator
│   │   ├── context/           # Supabase AuthContext
│   │   ├── pages/             # Home, BookTruck, Marketplace, Fleet,
│   │   │                      # Bookings, LiveTracking, Login
│   │   ├── api/client.js      # Axios HTTP client
│   │   ├── App.jsx            # Routing & Layout
│   │   └── index.css          # Tailwind CSS design system
│   ├── index.html             # HTML shell with Leaflet CDN
│   └── package.json
└── package.json               # Root workspace scripts
```

---

## 📄 License
MIT © 2026 FRETO — Freight made simpler.
