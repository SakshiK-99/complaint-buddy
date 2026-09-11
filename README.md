# CampusCare

Anonymous complaint management and mentor-assisted escalation for educational institutions.

**"Speak Freely. Be Heard. Get Resolved."**

## Problem Statement

Students can report infrastructure, academic, harassment, hostel, canteen, and
transport issues anonymously. CampusCare gives each complaint a unique tracking
ID and routes it through the appropriate authority while preserving the
student's identity in authority-facing views.

## Features

- Role-based auth (Student, CR, Mentor, HOD, Principal, Admin) with JWT
- Anonymous complaint submission with auto-generated complaint ID (`CC-2026-000123`)
- Complaint tracking by ID with a visual status timeline
- Automatic category → department routing (configurable)
- Priority system (Low/Medium/High/Urgent) with escalation rules
- CR → Mentor → HOD → Principal escalation chain, with full escalation history
- Evidence upload (JPG/PNG/PDF/MP4) stored locally
- Anonymous two-way discussion per complaint (student identity never shown)
- Authority dashboards with filters, search, and urgent-first sorting
- Admin analytics dashboard (Recharts): by category, priority, status, and over time
- Recurring-issue detection using simple keyword similarity (no AI APIs)
- Mentor weekly reports (draft/submit) viewable by HOD/Principal/Admin
- Admin user management (view users, change roles)
- Responsive design: collapsible sidebar and mobile-friendly tables

## Tech Stack

**Frontend:** React (Vite), Tailwind CSS, React Router, Axios, Lucide React, Recharts
**Backend:** Node.js, Express, JWT, bcryptjs, Multer
**Database:** MongoDB with Mongoose

## Project Structure

```
complaint-buddy/
├── backend/
│   ├── models/        # User, Complaint, WeeklyReport
│   ├── routes/        # auth, complaints, dashboard, reports, users
│   ├── middleware/     # auth, role authorization, upload, error handler
│   ├── utils/          # routing config, complaint ID generator, similarity detection
│   ├── uploads/         # uploaded evidence files (local storage)
│   ├── seed.js          # demo data seeding script
│   └── server.js
└── frontend/
    └── src/
        ├── pages/       # public, student, authority, admin pages
        ├── components/   # Navbar, Sidebar, ChatBox, badges, etc.
        ├── context/       # AuthContext, ToastContext
        └── api/            # axios instance
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- MongoDB running locally, or a MongoDB Atlas connection string

Check the installed Node.js version with:

```bash
node --version
```

### 1. MongoDB Setup

Install MongoDB Community Edition and start it locally, or create a MongoDB Atlas
cluster. The default local URI is:

```
mongodb://127.0.0.1:27017/campuscare
```

### 2. Configure the backend

```bash
cd backend
npm install
```

macOS/Linux:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

Edit `backend/.env` when your MongoDB URI, JWT secret, or frontend URL differ
from the defaults.

### 3. Configure the frontend

```bash
cd ../frontend
npm install
```

macOS/Linux:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

The frontend defaults to the backend at `http://localhost:5000/api`.

### 4. Seed demo data

From the repository root:

```bash
npm run seed
```

This resets the demo users and complaints before creating fresh records. Do not
run it against a database containing data you need to keep.

### 5. Run the application

From the repository root, start both services:

```bash
npm install
npm run dev
```

The API runs at `http://localhost:5000` and the frontend at
`http://localhost:5173`. Verify the API is running at
`http://localhost:5000/api/health`.

To run either service separately:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

The root `dev` script uses `concurrently` to start both services together, so
backend and frontend dependencies must be installed first.

## Environment Variables

`backend/.env`

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/campuscare
JWT_SECRET=change_this_secret
CLIENT_URL=http://localhost:5173
```

`frontend/.env`

```
VITE_API_URL=http://localhost:5000/api
```

## Demo Credentials

All demo accounts use the same password: **`Campus@123`**

| Role      | Email                     |
|-----------|----------------------------|
| Admin     | admin@campuscare.com       |
| Mentor    | mentor@campuscare.com      |
| HOD       | hod@campuscare.com         |
| Principal | principal@campuscare.com   |
| CR        | cr@campuscare.com          |
| Student   | student@campuscare.com     |

Demo complaints are created automatically by `npm run seed` and are clearly
demo data seeded for dashboard demonstration.

## Testing

Run the backend routing test from the `backend` directory:

```bash
node --test tests/mentorRouting.test.js
```

Build the frontend for a production check:

```bash
npm run build --prefix frontend
```

## API Overview

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/health

POST   /api/complaints                 (student, multipart/form-data with evidence)
GET    /api/complaints                 (role-filtered list, supports ?status ?priority ?category ?department ?search)
GET    /api/complaints/:id
GET    /api/complaints/track/:complaintId
PATCH  /api/complaints/:id/status      (authority)
POST   /api/complaints/:id/escalate    (authority)
POST   /api/complaints/:id/messages

GET    /api/dashboard/stats
GET    /api/dashboard/analytics        (admin/principal/hod)

POST   /api/reports/weekly             (mentor)
PATCH  /api/reports/weekly/:id
GET    /api/reports/weekly
GET    /api/reports/weekly/:id

GET    /api/users                      (admin)
PATCH  /api/users/:id/role             (admin)
PATCH  /api/users/:id/status           (admin)
```

All routes except register/login require a `Bearer` JWT token.

## Future Scope

- Push/email notifications on status changes and escalations
- Cloud file storage for evidence (S3-compatible) instead of local disk
- More advanced repeated-issue detection (e.g. embeddings-based similarity)
- Audit logs for admin actions
- Pagination for large complaint lists
- Broader automated test coverage (unit and integration)

## Known Limitations

- Repeated-issue detection uses simple keyword/Jaccard similarity — it is
  intentionally lightweight for this MVP and may miss semantically similar
  but differently-worded complaints.
- Evidence files are stored on local disk (`backend/uploads/`), which is fine
  for local/demo use but not suited for a multi-server production deployment.
- No pagination yet on complaint/user lists — fine for demo data volumes.

