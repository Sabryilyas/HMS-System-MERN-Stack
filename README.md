# 🏨 HotelHub — Hotel Management System

A full-stack hotel booking and operations app I built to learn the MERN stack end-to-end. It covers the whole flow: a guest browsing rooms, paying with Stripe, getting checked in, ordering room service, and the admin/staff side that keeps everything moving.

Frontend is React + Vite + Tailwind. Backend is Node, Express and MongoDB with Socket.IO for the live bits (notifications, room status, staff tasks).

---

## ✨ What it does

- 🛏️ **Browse rooms** with filters (type, price, occupancy) and per-room detail pages
- 📅 **Bookings** with date conflict checks, guest counts and a clean checkout flow
- 💳 **Stripe payments** (test mode) with invoice + a mock fallback when keys aren't set
- 👤 **Three roles**: guest, staff, admin — each with their own dashboard and protected routes
- 🧹 **Housekeeping & service requests** that staff can pick up and close out
- 🔔 **Real-time notifications** over Socket.IO (booking events, new tasks, etc.)
- 📊 **Admin analytics** (revenue, occupancy, recent bookings) using Recharts
- 🧾 **Final bill modal** with line items for stay + extras at checkout
- 📱 Works on mobile, tablet and desktop — Tailwind handles most of the layout

---

## 🧰 Tech stack

**Frontend**
- React 18 + React Router v6
- Vite for the dev server / build
- Tailwind CSS + shadcn-style primitives
- Axios for API calls
- Socket.IO client for live updates
- Stripe.js + `@stripe/react-stripe-js`
- Recharts for the dashboard graphs
- GSAP for a few small animations

**Backend**
- Node.js + Express 4
- MongoDB via Mongoose
- JWT auth (bcrypt for hashing)
- Socket.IO for realtime
- Stripe SDK for PaymentIntents
- helmet, cors, morgan, express-rate-limit
- express-validator for request validation

---

## 📁 Folder layout

```
react-hms/
├── backend/
│   ├── src/
│   │   ├── config/          # db connection
│   │   ├── controllers/     # route handlers (auth, rooms, bookings, payments, admin, staff, services...)
│   │   ├── middleware/      # JWT auth + role guards
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   └── utils/
│   ├── server.js            # entry point + socket.io setup
│   └── seeder.js            # seeds rooms / sample data
│
├── frontend/
│   ├── src/
│   │   ├── components/      # booking, payment, room, layout, common
│   │   ├── context/         # Auth, Booking, Socket providers
│   │   ├── pages/
│   │   │   ├── public/      # Home, Rooms, RoomDetail, Login, Register, Checkout, About, Contact
│   │   │   ├── user/        # UserDashboard, BookingHistory
│   │   │   ├── staff/       # StaffDashboard
│   │   │   └── admin/       # AdminDashboard, Rooms, Bookings, Staff, Services
│   │   ├── routes/          # PrivateRoute, AdminRoute, StaffRoute
│   │   ├── services/        # axios wrappers (auth, room, booking, notification, analytics)
│   │   ├── hooks/
│   │   └── utils/
│   └── vite.config.js
│
└── diagrams/                # PlantUML — use case, class, ER, sequence, activity, component
```

---

## 🚀 Getting started

### What you need
- Node.js 18+
- A MongoDB connection string (Atlas free tier works fine)
- A Stripe test account (only if you want real payment flow — there's a mock fallback)

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/react-hms.git
cd react-hms

# backend deps
cd backend
npm install

# frontend deps
cd ../frontend
npm install
```

### 2. Environment variables

Copy the example files and fill them in:

```bash
# from the repo root
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Then edit each one. You'll need:
- `MONGODB_URI` — your Atlas / local Mongo URI
- `JWT_SECRET` — any long random string
- `STRIPE_SECRET_KEY` + `VITE_STRIPE_PUBLIC_KEY` — from your Stripe test dashboard

### 3. Run it

Two terminals:

```bash
# terminal 1 — API on :5000
cd backend
npm run dev

# terminal 2 — frontend on :5173
cd frontend
npm run dev
```

Open `http://localhost:5173` and you're in.

### 4. Seed some data (optional)

```bash
cd backend
node seeder.js          # rooms + sample data
node create-admin.js    # creates an admin user
node create-test-user.js
node create-staff-user.js
```

---

## 🔐 Default test logins (after running the seeders)

| Role  | Email             | Password   |
|-------|-------------------|------------|
| Admin | admin@hotel.com   | admin123   |
| Staff | staff@hotel.com   | staff123   |
| Guest | john@example.com  | user123    |

> ⚠️ These are seeder credentials for local dev only. Change them before deploying anywhere public.

---

## 🛣️ API at a glance

All endpoints are prefixed with `/api`.

| Group         | Path                | What it covers                          |
|---------------|---------------------|------------------------------------------|
| Auth          | `/auth`             | register, login, profile                 |
| Rooms         | `/rooms`            | list, detail, availability, CRUD (admin) |
| Bookings      | `/bookings`         | create, list mine, cancel, check-in/out  |
| Payments      | `/payments`         | Stripe PaymentIntents + webhook          |
| Services      | `/services`         | room service / requests                  |
| Housekeeping  | `/housekeeping`     | room status updates                      |
| Staff         | `/staff`            | task list + status                       |
| Notifications | `/notifications`    | unread / read / mark-all                 |
| Admin         | `/admin`            | users, analytics, dashboard data         |
| Health        | `/health`           | uptime ping                              |

There's a `GET /` route on the API that lists them too if you forget.

---

## 🔌 Realtime events (Socket.IO)

The server emits to the user's own room (joined on connect with their userId). Common events:

- `booking:created`, `booking:updated`, `booking:cancelled`
- `service:new`, `service:updated`
- `task:assigned`, `task:completed`
- `notification:new`

Client picks these up in `SocketContext` and pushes them into the relevant context / toast.

---

## 🧪 Useful scripts

Backend (`backend/`):
- `npm run dev` — nodemon
- `npm start` — plain node
- `node seeder.js` — populate rooms
- `node create-admin.js` / `create-staff-user.js` / `create-test-user.js` — seed accounts
- `node verify-stripe.js` — sanity-check your Stripe key
- `node test-integration.js` — quick end-to-end auth + booking smoke

Frontend (`frontend/`):
- `npm run dev` — Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the build
- `npm run lint` — ESLint over `src/`

---

## 🗺️ UML / diagrams

The `diagrams/` folder has PlantUML sources I drew while planning the system:

- `01-use-case-diagram.puml`
- `02-class-diagram.puml`
- `03-sequence-diagram-booking.puml`
- `04-activity-diagram.puml`
- `05-er-diagram.puml`
- `06-component-diagram.puml`

Render them with the PlantUML CLI or any online viewer (e.g. `plantuml.com/plantuml`).

---

## 📐 Architecture

For a deeper walkthrough of how the pieces fit together — request lifecycle, auth flow, payment flow, data model, socket layer — see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 🛡️ Security notes

- Passwords are hashed with bcrypt (10 salt rounds), never returned by default
- JWTs are signed with `JWT_SECRET` and expire per `JWT_EXPIRE`
- `helmet`, `cors` (locked to `FRONTEND_URL`) and `express-rate-limit` are on
- Mongoose validators run on every write
- `.env` files are gitignored — only `.env.example` is committed
- Stripe secret key is read from env on the server, never shipped to the browser

If you find something off, please open an issue rather than a public PR.

---

## 🙌 Contributing

Pull requests are welcome — small, focused ones are easiest to review. For anything bigger, open an issue first so we can talk through the approach.

1. Fork the repo
2. Branch off `main`
3. Commit with a clear message
4. Open a PR

---

## 📜 License

MIT — do whatever you want with it, just don't blame me if it eats your data.
