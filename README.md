# shrt

A production-grade URL shortener and click traffic analytics platform built on the MERN stack (MongoDB, Express, React, Node.js) with TypeScript.

shrt emphasizes direct redirection performance, non-cached live analytics aggregation, and a disciplined, borderless design system.

---

## 1. System Architecture

```text
Visitor / Account Holder
        │
        ├── HTTPS / Browser
        │       └── React Single Page Application (Vite + Tailwind CSS)
        │               └── JSON API requests with HttpOnly session cookies
        │
        └── Node.js + Express API
                ├── Authentication & Account Services
                ├── Link CRUD, QR Generation, & Validation
                ├── Direct HTTP 302 Redirection (/:code)
                ├── Asynchronous Click Event Capture (UA parsing, GeoIP, UTMs)
                ├── Real-time MongoDB Aggregation Engine
                └── MongoDB Database
                        ├── users (Argon2id hashes, unique normalized usernames)
                        ├── links (indexes on code and ownerId + createdAt)
                        ├── clickEvents (compound index on linkId + clickedAt)
                        └── sessions (TTL-indexed server sessions)
```

---

## 2. Core Technical Constraints

- **Strict No-Cache Policy**: API endpoints, dynamic HTML, and redirect routes return `Cache-Control: no-store, no-cache, must-revalidate`. Analytics are derived directly from persisted MongoDB events rather than cached snapshots or Redis counters.
- **Direct Redirection**: Link resolution executes in Express and issues a single HTTP 302 redirect directly to the target destination without intermediary hops or client-side redirect scripts.
- **Zero-Credential Logging & Privacy**: Raw IP addresses are not stored. Geolocation is resolved at ingestion to country and city granularity. Passwords and session secrets are never serialized in responses or logs.
- **Argon2id Hashing**: User authentication relies exclusively on username and password verified via Argon2id with recommended memory and time cost parameters.

---

## 3. Data Models and Indexes

### Users Collection (`users`)
- `_id`: ObjectId
- `username`: String (3-30 chars, alphanumeric, trimmed)
- `normalizedUsername`: String (unique index, lowercase, trimmed)
- `passwordHash`: String (Argon2id, select: false)
- `preferences`: Object (`theme`: "light" | "dark" | "system")
- `createdAt`, `updatedAt`: Timestamps

### Links Collection (`links`)
- `_id`: ObjectId
- `ownerId`: ObjectId (index on `{ ownerId: 1, createdAt: -1 }`)
- `code`: String (unique index, lowercase, alphanumeric and hyphens)
- `destinationUrl`: String (validated http/https scheme)
- `iosUrl`, `androidUrl`: Optional String (device-specific target overrides)
- `expiresAt`: Optional Date (automatic expiration gate)
- `maxClicks`: Optional Number (click cap enforcement)
- `passwordHash`: Optional String (Argon2id for password-protected links)
- `isActive`: Boolean (default: true)

### Click Events Collection (`clickEvents`)
- `_id`: ObjectId
- `linkId`: ObjectId (compound index on `{ linkId: 1, clickedAt: -1 }`)
- `clickedAt`: Date (timestamp of visit)
- `referrer`: String (hostname or "Direct")
- `referrerCategory`: String ("direct", "search", "social", "email", "other")
- `utmSource`, `utmMedium`, `utmCampaign`: Optional String (campaign tracking)
- `country`, `region`, `city`: String (coarse geo metadata)
- `browser`, `browserVersion`, `os`, `deviceType`: String (parsed from User-Agent)

---

## 4. API Endpoints

### Authentication
- `POST /api/v1/auth/register` — Register a username/password account
- `POST /api/v1/auth/login` — Authenticate and start an HttpOnly session
- `POST /api/v1/auth/logout` — Revoke session and clear cookies
- `GET /api/v1/auth/me` — Retrieve active user identity and preferences
- `PATCH /api/v1/users/me/password` — Change password (requires current password)
- `PATCH /api/v1/users/me/preferences` — Persist theme preferences

### Link Management
- `GET /api/v1/links` — Paginated list of owned links with live derived click counts
- `POST /api/v1/links` — Create short link with optional rules (code, devices, expiry, password)
- `GET /api/v1/links/:code` — Retrieve link metadata
- `PATCH /api/v1/links/:code` — Update destination, device routes, limits, or state
- `DELETE /api/v1/links/:code` — Permanently delete short link and associated click events
- `GET /api/v1/links/:code/qr` — Generate high-resolution PNG data URL and raw SVG QR code

### Analytics & Reporting
- `GET /api/v1/analytics` — Account-level aggregate traffic metrics and breakdowns
- `GET /api/v1/links/:code/analytics` — Link-specific metrics, time-series volume, and breakdowns
- `GET /api/v1/links/:code/analytics/events` — Paginated click stream rows
- `GET /api/v1/links/:code/analytics/export` — Filtered CSV or JSON export

### Redirection Handler
- `GET /:code` — Direct resolution, metadata extraction, event ingestion, and HTTP 302 redirect
- `POST /:code/unlock` — Password verification for protected links

---

## 5. Getting Started

### Prerequisites
- Node.js 20 or later
- MongoDB 7.0 or later (running locally on port 27017 or remote URI)

### Installation
Clone the repository and install all workspace dependencies:
```bash
git clone git@github.com:CharanMunur/shrt.git
cd shrt
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```env
PORT=4000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173,http://localhost:5174
BASE_URL=http://localhost:4000
MONGODB_URI=mongodb://127.0.0.1:27017/shrt
SESSION_SECRET=a-secure-random-secret-key-at-least-32-chars
```

### Running Locally
To launch both the server and client concurrently:
```bash
npm run dev
```

- Web Client: `http://localhost:5173`
- API and Redirect Host: `http://localhost:4000`

### Seeding Demonstration Data
To seed sample links and realistic click events:
```bash
npm run seed -w server
```
Default seeded credentials:
- Username: `demo`
- Password: `password123`

---

## 6. Testing and Verification

Run the end-to-end integration test suite:
```bash
npm test
```

The automated test suite verifies:
1. Health and database connectivity checks
2. Registration, session issuance, and duplicate rejection
3. Profile retrieval and Argon2id hash non-exposure
4. Custom code creation and reserved route collision blocking
5. HTTP 302 redirection with `Cache-Control: no-store`
6. Click event recording and time-series aggregation with continuous zero-day padding
7. CSV export headers and data integrity
8. QR code generation (SVG and PNG formats)

---

## 7. License

MIT License. Designed and maintained for production reliability.
