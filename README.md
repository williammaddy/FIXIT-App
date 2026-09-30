# FixIt — Local Service Marketplace

FixIt is a full-stack local service marketplace mobile app built with Node.js/Express/MongoDB on the backend and React Native with Expo Router on the mobile app. It operates on a Rapido-style model, allowing customers to manually choose nearby service professionals based on distance, ratings, pricing, and experience.

---

## Features

### Backend
- **Authentication & Roles:** JWT-based auth with `customer` and `worker` roles enforced strictly at the database level.
- **GeoJSON & Aggregation:** $geoNear spatial queries to find online service professionals within a configurable radius (~10 km) around latitude/longitude coordinates.
- **Booking Lifecycle:** Enforced transition map: `PENDING → ACCEPTED | REJECTED | CANCELLED`, `ACCEPTED → STARTED | CANCELLED`, `STARTED → COMPLETED`.
- **Reviews & Ratings:** Customers can review completed bookings (1-5 stars); worker rating and review counts recalculate automatically.
- **Notifications:** Automatic real-time status notifications generated for both customers and workers.
- **Storage Layer:** Abbreviated storage service pattern (`LocalStorageService`) serving static uploads.

### Mobile App (Expo / React Native)
- **Role-Based Tab Navigation:** Separate navigation flows and tab layouts for customers and workers with route guards.
- **Customer Experience:** Search categories, nearby professional cards with filter chips (Nearest, Top Rated, Price, Experience), manual/GPS location selector, date/time pickers, booking tracker timeline, and review forms.
- **Worker Dashboard:** Availability toggle (Online/Offline), stats overview (Pending, Today's Jobs, Completed, Rating), job management, service selection & pricing controls.

---

## Tech Stack

- **Backend:** Node 20 LTS, TypeScript, Express 4, Mongoose 8, Zod 3, jsonwebtoken, bcryptjs, Multer, CORS, dotenv.
- **Mobile:** React Native, Expo SDK 51, Expo Router, TypeScript, Axios, Zustand, React Hook Form, Zod 3, Expo Location, Expo Image Picker, Expo SecureStore.

---

## Project Structure

```
fixit/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── controllers/     # Express controllers (auth, worker, booking, review, notification, upload)
│   │   ├── middleware/      # auth, requireRole, validate (Zod), validateObjectId, errorHandler
│   │   ├── models/          # User, Service, WorkerProfile, Booking, Review, Notification
│   │   ├── routes/          # API route definitions
│   │   ├── seed/            # Seeding script with 14 services & Tiruppur demo data
│   │   ├── services/        # Business logic layer & storage abstraction
│   │   ├── utils/           # ApiError, asyncHandler, sendSuccess, generateToken
│   │   └── server.ts        # App bootstrap
│   ├── scripts/
│   │   └── smoke-test.ts    # End-to-end API verification suite
│   ├── .env.example
│   └── package.json
├── mobile/
│   ├── src/
│   │   ├── app/             # Expo Router pages (_layout, auth, customer tabs, worker tabs)
│   │   ├── components/      # Reusable UI components (Button, Input, WorkerCard, BookingCard, etc.)
│   │   ├── constants/       # App design tokens & colors
│   │   ├── services/        # Axios API client & domain API wrappers
│   │   ├── store/           # Zustand state management (authStore, locationStore, bookingStore, workerStore)
│   │   └── types/           # TypeScript interfaces & DTOs
│   ├── app.json
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Prerequisites

- **Node.js:** v20.x LTS or higher
- **npm:** v10.x or higher
- **MongoDB:** Local MongoDB instance running on `mongodb://127.0.0.1:27017/fixit` or MongoDB Atlas URI.

---

## Environment Setup

### 1. Backend Setup

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/fixit
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=*
```

Install dependencies & seed database:
```bash
cd backend
npm install
npm run seed
```

Start the backend server:
```bash
# Development (with auto-reload)
npm run dev

# Production build
npm run build
npm start
```

Run smoke tests:
```bash
npx tsx scripts/smoke-test.ts
```

### 2. Mobile Setup

Create `mobile/.env`:
```env
# For Android Emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000

# For Physical Device (replace with your Wi-Fi LAN IP)
# EXPO_PUBLIC_API_URL=http://192.168.1.100:5000
```

Install dependencies & start Expo:
```bash
cd mobile
npm install
npm start
```

---

## Demo Accounts

The seed script creates ready-to-use accounts centred around **Tiruppur, Tamil Nadu (lat: 11.1085, lng: 77.3411)**:

- **Customer:**
  - Email: `customer@fixit.demo`
  - Password: `Fixit@123`
- **Worker (AC Repair):**
  - Email: `worker@fixit.demo`
  - Password: `Fixit@123`
- Additional 12+ pre-seeded verified workers offering Plumbing, Electrical, Cleaning, Appliance Repair, and more.

---

## API Endpoints Summary

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register customer or worker |
| `POST` | `/api/auth/login` | Public | Sign in & get JWT |
| `GET` | `/api/auth/me` | Authenticated | Get current user profile |
| `GET` | `/api/services` | Public | List all active service categories |
| `GET` | `/api/workers/nearby` | Authenticated | GeoSpatial aggregation search for nearby workers |
| `GET` | `/api/workers/:id` | Public | Public worker profile & reviews |
| `GET` | `/api/workers/me/profile` | Worker | Worker's own profile |
| `PUT` | `/api/workers/me/profile` | Worker | Update services, pricing, radius, bio |
| `PATCH`| `/api/workers/me/availability` | Worker | Toggle Online/Offline status |
| `GET` | `/api/workers/me/stats` | Worker | Dashboard metrics |
| `POST` | `/api/bookings` | Authenticated | Create booking request |
| `GET` | `/api/bookings` | Authenticated | List bookings (role-aware, optional `?status=`) |
| `GET` | `/api/bookings/:id` | Authenticated | Detailed booking view |
| `PATCH`| `/api/bookings/:id/:action` | Authenticated | Action: `cancel`, `accept`, `reject`, `start`, `complete` |
| `POST` | `/api/reviews` | Customer | Submit review for COMPLETED booking |
| `GET` | `/api/notifications` | Authenticated | List user notifications |
| `PATCH`| `/api/notifications/:id/read` | Authenticated | Mark notification read |
| `POST` | `/api/upload` | Authenticated | Upload image |

---

## Troubleshooting

- **Network Error on Mobile Device:** Ensure your physical mobile device and backend host computer are connected to the exact same Wi-Fi network. Update `EXPO_PUBLIC_API_URL` to use your computer's LAN IP (e.g., `http://192.168.x.x:5000`) and ensure port 5000 is open in your OS firewall.
- **MongoDB GeoSpatial Error:** Ensure `2dsphere` index is created on `location` field (handled automatically by Mongoose models and seed script).
- **Expo Cache Issues:** Clear Expo bundler cache with `npx expo start -c`.
