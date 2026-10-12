# Neighbourhood Community Events Board

A responsive Next.js App Router app with public event browsing, visitor accounts, personalised feeds and event cards, plus a protected organiser dashboard.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Start MySQL in XAMPP and import `database/migrations/001_initial_schema.sql` using phpMyAdmin or the MySQL command line.
4. Copy `.env.example` to `.env.local`; set a unique `JWT_SECRET` and your MySQL connection settings. For a default local XAMPP install, the included database settings use `root` with a blank password.
5. Run `npm run dev` and visit `http://localhost:3000`.

Open `/admin/login` (also linked in the site navigation) to sign in as the organizer. The local development demo credentials are `admin@communityboard.in` / `community123`; set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local` to change them. Production requires all three environment variables: `JWT_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

Only an authenticated admin can open `/admin`, create events, or change an event's Active/Inactive status. Visitors can browse and interact with active events, but cannot create events or change their status. Events are never deleted from the admin dashboard.

## MySQL persistence

The app uses MySQL via the `mysql2` driver. Apply `database/migrations/001_initial_schema.sql` once to create the `community_event_board` database, tables, indexes, and the write-lock row required by transactional updates. On first database access, the app inserts its 15 example events if the `events` table is empty. Existing data in the old `data/store.json` file is not imported automatically.

Set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `.env.local`. Never expose database credentials in client-side code or commit `.env.local`.

The API storage layer maps the current routes to these tables:

| API behavior | MySQL tables and operations |
| --- | --- |
| Public events, event detail, admin event list/create/status update | `events` (`SELECT`, `INSERT ... ON DUPLICATE KEY UPDATE`) |
| Signup and login | `users` (`INSERT`, `SELECT`) |
| Favorites and personalized feed | `user_favorites` joined in memory with `users` and `events` |
| Reminders | `user_reminders` associated with `users` and `events` |
| Saved card themes and stickers | `user_event_designs` |

All writes run in a MySQL transaction and take a row lock in `store_write_lock` so simultaneous changes to the same store are serialized across app instances.

Useful direct queries:

```sql
-- Upcoming active events
SELECT id, title, category, city, event_date, price, description, image_url
FROM events
WHERE active = TRUE AND event_date >= UTC_TIMESTAMP()
ORDER BY event_date;

-- One user's saved categories
SELECT category FROM user_favorites WHERE user_id = ?;

-- One user's reminders with event details
SELECT e.*
FROM user_reminders AS r
JOIN events AS e ON e.id = r.event_id
WHERE r.user_id = ?
ORDER BY e.event_date;

-- A user's saved card design for an event
SELECT theme, stickers
FROM user_event_designs
WHERE user_id = ? AND event_id = ?;
```

## JSON API

- `GET /api/events` — upcoming active events; accepts `category`, `city`, `q`, `page` and `perPage`.
- `POST /api/auth/signup`, `POST /api/auth/login` — create a visitor account or log in. Both return a JWT and set an HttpOnly session cookie.
- `POST /api/auth/admin-login` — organiser login.
- `GET /api/feed`, `GET|PUT /api/favorites` — personal feed and saved categories.
- `GET|POST /api/reminders` — list or toggle a reminder for an event.
- `GET|PUT /api/card-design/:eventId` — load or save a visitor’s event card.
- `GET|POST /api/admin/events`, `PUT /api/admin/events/:id` — organiser-only event management.

Protected endpoints accept the session cookie or an `Authorization: Bearer <JWT>` header, so a separate client can use the same JSON API.
