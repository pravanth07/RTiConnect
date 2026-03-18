# 🇮🇳 Online RTI Management System
### Based on Right to Information Act, 2005 | MERN Stack

---

## 📁 Project Structure

```
rti-online-system/
├── backend/          ← Express + Node.js + MongoDB
└── frontend/         ← React + Vite + Tailwind CSS
```

---

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install

# Configure environment
cp .env .env.local
# Edit .env with your MongoDB URI, JWT secret, email, Cloudinary credentials

npm run dev     # Runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev     # Runs on http://localhost:5173
```

---

## 🔑 Portals & Roles

| Role | Portal | Access |
|------|--------|--------|
| `citizen` | `/citizen` | Submit RTI, track, appeal |
| `pio` | `/pio` | Respond to requests |
| `cio` | `/cio` | Assign PIOs, view all, reports |
| `appellate` | `/appellate` | Hear appeals, issue decisions |

> **Note:** Only citizens can self-register. PIO accounts are created by CIO.
> Create first CIO account directly in MongoDB or via a seed script.

---

## 🌱 Seed Initial Data (MongoDB)

Run this in MongoDB Compass or `mongosh` to create demo accounts:

```javascript
// Insert demo users (passwords are hashed — run seed script below)
```

```bash
# Create seed.js in backend/ and run:
node seed.js
```

```javascript
// backend/seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({ email: { $regex: '@demo.com' } });

  const password = await bcrypt.hash('demo123', 12);

  await User.insertMany([
    { name: 'Demo Citizen', email: 'citizen@demo.com', password, role: 'citizen', phone: '9876543210', isVerified: true },
    { name: 'PIO Officer', email: 'pio@demo.com', password, role: 'pio', phone: '9876543211', department: 'Education', designation: 'Public Information Officer', isVerified: true },
    { name: 'Chief Info Officer', email: 'cio@demo.com', password, role: 'cio', phone: '9876543212', department: 'Education', designation: 'Chief Information Officer', isVerified: true },
    { name: 'Appellate Authority', email: 'appellate@demo.com', password, role: 'appellate', phone: '9876543213', designation: 'Additional Secretary', isVerified: true },
  ]);

  console.log('✅ Demo accounts seeded!');
  process.exit(0);
};

seed();
```

---

## 📋 API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register citizen |
| POST | `/api/auth/login` | Public | Login all roles |
| GET | `/api/auth/me` | All | Get current user |
| POST | `/api/citizen/rti` | Citizen | Submit RTI |
| GET | `/api/citizen/rti` | Citizen | My requests |
| GET | `/api/citizen/rti/:id/track` | Citizen | Track request |
| POST | `/api/citizen/appeal` | Citizen | File appeal |
| GET | `/api/pio/requests` | PIO | Assigned requests |
| PUT | `/api/pio/requests/:id/respond` | PIO | Submit response |
| PUT | `/api/pio/requests/:id/reject` | PIO | Reject request |
| PUT | `/api/pio/requests/:id/transfer` | PIO | Transfer request |
| GET | `/api/cio/dashboard` | CIO | Stats overview |
| PUT | `/api/cio/assign/:requestId` | CIO | Assign to PIO |
| GET | `/api/cio/pio` | CIO | All PIOs |
| POST | `/api/cio/pio` | CIO | Create PIO |
| GET | `/api/appellate/appeals` | Appellate | All appeals |
| POST | `/api/appellate/hearing` | Appellate | Schedule hearing |
| PUT | `/api/appellate/appeals/:id/decision` | Appellate | Issue decision |

---

## ⚖️ RTI Act 2005 — Key Timelines Implemented

| Section | Rule | Implemented |
|---------|------|-------------|
| Section 6 | Citizen submits request with fee (₹10) | ✅ |
| Section 7(1) | PIO responds within 30 days | ✅ Deadline counter |
| Section 7(1) proviso | Life/liberty: 48 hours | ✅ |
| Section 5(2) | APIO adds 5 days to deadline | ✅ |
| Section 7(5) | BPL citizens: fee waived | ✅ |
| Section 7(6) | Free info if deadline missed | ✅ |
| Section 8 | 10 exemption categories | ✅ In PIO reject |
| Section 9 | Copyright rejection | ✅ |
| Section 19(1) | First appeal within 30 days | ✅ |
| Section 19(3) | Second appeal within 90 days | ✅ |
| Section 19(6) | Appeals disposed in 30–45 days | ✅ |
| Section 20 | Penalty ₹250/day, max ₹25,000 | ✅ Auto-calculated |

---

## 🛠️ Tech Stack

- **Frontend:** React 18, React Router v6, TanStack Query, Tailwind CSS, Recharts
- **Backend:** Node.js, Express.js, JWT Auth
- **Database:** MongoDB Atlas, Mongoose
- **Files:** Cloudinary
- **Notifications:** Nodemailer (email), Socket.io (real-time)
