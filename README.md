# Next.js Scheduler — Google Calendar Integration (Buyer / Seller)

This project is a minimal implementation of the hiring challenge:
- Buyers and Sellers sign in with Google.
- Sellers expose calendar availability (via Google Calendar).
- Buyers can book available slots; booking creates events on calendars.

Spec source: see the project brief. :contentReference[oaicite:1]{index=1}

## Features
- Next.js (pages directory) + serverless API routes.
- MongoDB (Atlas) for persistence (users, encrypted refresh tokens, appointments).
- Google OAuth2 (manual flow) with `googleapis`.
- AES-256-GCM encryption of refresh tokens (server-side).
- Create events (with Google Meet) and read freebusy to compute availability.

---

## Prerequisites

1. Node 18+ and npm/yarn
2. A Google Cloud OAuth 2.0 Client:
   - Go to Google Cloud Console → APIs & Services → OAuth consent screen and configure it.
   - Create OAuth credentials (OAuth client ID).
   - Add Authorized redirect URI: `https://<your-domain>/api/auth/callback` for production (Vercel) and `http://localhost:3000/api/auth/callback` for local development.
   - Enable the Google Calendar API for the project.
   - Copy CLIENT ID and CLIENT SECRET.

3. MongoDB Atlas (or any MongoDB connection string):
   - Create a cluster and get the connection string for `MONGODB_URI`.

4. Environment variables (example in `.env.example`):
   - `NEXT_PUBLIC_BASE_URL` — e.g. `http://localhost:3000`
   - `MONGODB_URI` — your MongoDB connection string
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - `ENCRYPTION_KEY` — a 32 byte key (hex 64 chars or base64). Example generate command:
     - Node: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `JWT_SECRET` — a long random secret.
   - `SESSION_COOKIE_NAME` — optional, default `token`.

---

## Local development

1. Clone repo
2. `cp .env.example .env.local` and fill values
3. `npm install`
4. `npm run dev`
5. Open `http://localhost:3000`

Sign in as Seller (click "Sign in as Seller") — this will ask for calendar scopes and offline access (refresh token). Then go to `/seller/dashboard` to view events. Sign in as Buyer and book seller slots at `/buyer`.

---

## Deployment (Vercel)

1. Push code to GitHub repository.
2. Connect repository to Vercel.
3. Add environment variables in Vercel Dashboard (same as `.env.local`) including `NEXT_PUBLIC_BASE_URL` pointing to your Vercel URL (e.g. `https://my-app.vercel.app`).
4. In Google Cloud Console, add Vercel callback URL to OAuth credentials: `https://<your-vercel-url>/api/auth/callback`.
5. Deploy.

Include your live URL in the submission (the challenge requires Vercel deployment).

---

## Notes, caveats, and improvements

- Refresh tokens: we store encrypted refresh tokens in MongoDB (AES-256-GCM). Keep `ENCRYPTION_KEY` safe.
- Google only returns a refresh_token on first consent (or if `prompt=consent` is used). The code uses `prompt=consent` and `access_type=offline` to try to obtain refresh tokens each sign-in.
- Calendar meeting link: the code requests `conferenceData` creation when creating the event on seller calendar. Attendees are added so invitations are sent. The code also attempts to write a mirrored event into buyer calendar if the buyer has a stored refresh token.
- Time zones: the example uses UTC for simplification. For production, detect/timezone conversion is recommended.
- Availability editor (seller-side) is optional/bonus — not implemented here. The code computes available slots by splitting business hours and excluding busy periods returned by freebusy.

---

## Files overview
(see project root tree in the repository)

---

If you want, I can:
- Add a proper UI (Tailwind) and a nicer calendar UI.
- Add seller availability editor (explicit "working hours" + recurring rules).
- Add timezone-aware booking, email notifications, and test scripts.

