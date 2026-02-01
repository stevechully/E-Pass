# Dynamic E-Pass Backend

Backend API for the Dynamic E-Pass system built with Node.js, Express, and Supabase.

## 🚀 Quick Start

### Prerequisites

- Node.js (LTS ≥ 20)
- npm or yarn
- Supabase project with credentials

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` and fill in your Supabase credentials:

```env
PORT=5000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

### Running the Server

**Development mode (with auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The server will start on `http://localhost:5000`

### Testing

**1. Health Check (Public):**

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{
  "status": "OK",
  "message": "Backend is running"
}
```

**2. Protected Route (Requires Auth):**

First, get a JWT token from Supabase Auth (via frontend login or Supabase Auth UI).

Then test the protected route:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:5000/health/protected
```

Expected response (with valid token):

```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  }
}
```

Expected response (without token):

```json
{
  "success": false,
  "message": "Missing or invalid Authorization header"
}
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js              # Express app configuration
│   ├── server.js           # Server bootstrap
│   ├── config/
│   │   ├── supabase.js     # Supabase client
│   │   └── env.js          # Environment validation
│   ├── middlewares/
│   │   ├── auth.middleware.js    # JWT authentication
│   │   ├── error.middleware.js   # Global error handler
│   │   └── rls.middleware.js     # Role-based access control
│   ├── routes/
│   │   └── health.routes.js      # Health check endpoint
│   ├── utils/
│   │   └── response.js           # Response helpers
│   └── constants/
│       └── roles.js              # Role definitions
├── .env                    # Environment variables (not committed)
├── .env.example            # Environment template
├── package.json
└── README.md
```

## 🔧 Tech Stack

- **Runtime**: Node.js (LTS ≥ 20)
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (JWT)
- **Validation**: Zod
- **Logging**: Morgan
- **Environment**: dotenv

## 🔐 Security Notes

- The backend uses Supabase **Service Role Key** which bypasses RLS (Row Level Security)
- Always use the service role key on the backend, never expose it to the frontend
- The frontend should use the **Anon Key** for client-side operations
- All sensitive routes should use the `requireAuth` middleware
- Admin-only routes should use `requireAdmin` middleware (after `requireAuth`)

## 📝 Phase 2 - Authentication (✅ COMPLETE)

1. ✅ Auth Middleware (Supabase JWT verification) - `requireAuth`
2. ✅ User Context & Role Handling - `req.user` attached
3. ✅ Admin Role Middleware - `requireAdmin` (queries profiles table)

## 📝 Next Steps - Phase 3

3. Entry Slots & E-Pass APIs
4. Food Slots & Food Booking APIs
5. Accommodation APIs
6. Eco-Fee & Plastic Declaration APIs
7. Cancellation & Refund APIs
8. Payments APIs
9. Notifications APIs
10. Analytics APIs

## 🐛 Troubleshooting

**Port already in use:**
- Change `PORT` in `.env` to a different port

**Supabase connection errors:**
- Verify your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check that your Supabase project is active

**Module not found errors:**
- Run `npm install` again
- Ensure you're using Node.js LTS ≥ 20
