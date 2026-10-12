# Neighbourhood Community Events Board

A responsive Next.js App Router app with public event browsing, visitor accounts, personalised feeds and event cards, plus a protected organiser dashboard.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and set a unique `JWT_SECRET`. Change the example admin password before sharing or deploying the app.
4. Run `npm run dev` and visit `http://localhost:3000`.

The default local admin credentials are `admin@communityboard.in` / `community123`. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local` to change them. Production requires all three environment variables: `JWT_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

## Persistence

The app seeds 15 example events on first run and stores changes and visitor accounts in `data/store.json`. This lightweight file-backed store suits a single Node.js server; it is not intended for multi-instance/serverless hosting. Keep `data/store.json` backed up if you need to preserve local event and account data.

## JSON API

- `GET /api/events` — upcoming active events; accepts `category`, `city`, `q`, `page` and `perPage`.
- `POST /api/auth/signup`, `POST /api/auth/login` — create a visitor account or log in. Both return a JWT and set an HttpOnly session cookie.
- `POST /api/auth/admin-login` — organiser login.
- `GET /api/feed`, `GET|PUT /api/favorites` — personal feed and saved categories.
- `GET|POST /api/reminders` — list or toggle a reminder for an event.
- `GET|PUT /api/card-design/:eventId` — load or save a visitor’s event card.
- `GET|POST /api/admin/events`, `PUT /api/admin/events/:id` — organiser-only event management.

Protected endpoints accept the session cookie or an `Authorization: Bearer <JWT>` header, so a separate client can use the same JSON API.
