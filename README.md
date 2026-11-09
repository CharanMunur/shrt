<p align="center">
  <img src="client/public/short-white.svg" alt="Shrtn logo" width="420" />
</p>

<p align="center">
  A full-stack URL shortener and traffic analytics platform built with React, TypeScript, Express, and MongoDB.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white" alt="Express 5" />
  <img src="https://img.shields.io/badge/MongoDB-8-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
</p>

---

## Overview

Shrtn makes it easy to create and manage short links while understanding how people use them. The React dashboard handles link management, QR codes, and traffic reports. An Express API manages accounts and link data, records click metadata, and redirects visitors directly to their destinations.

The app is organized as an npm workspaces monorepo with a Vite client and a TypeScript server.

## Architecture & Directory Layout

| Component | Path | Description |
|---|---|---|
| **Client** | [`/client`](./client) | React 19, TypeScript, Vite, Tailwind CSS v4, Recharts dashboard |
| **Server** | [`/server`](./server) | Express 5 API, TypeScript, Mongoose, session authentication, link redirects and analytics |
| **Database** | MongoDB | Users, links, click events, counters, and server sessions |

```text
Visitor / Account Holder
        ├── React SPA (Vite)
        │      └── JSON API requests with HttpOnly session cookies
        └── Express API
               ├── Authentication and account settings
               ├── Link management and QR generation
               ├── Direct HTTP 302 redirects
               ├── Click metadata capture
               └── MongoDB analytics aggregations
```

## Core Capabilities

### Link management and redirects

- Create links with generated or custom short codes.
- Set optional iOS and Android destinations, expiration dates, click limits, and password protection.
- Disable, edit, and delete links from the dashboard.
- Resolve active links with a direct HTTP 302 redirect.
- Generate QR codes for short links.

### Traffic analytics

- View account-level and per-link click totals and trends.
- Explore time-series data and a weekly traffic heatmap.
- Break down visits by referrer, country, region, city, browser, operating system, device, and UTM campaign fields.
- Browse recent click events and export reports as CSV or JSON.

### Accounts and security

- Register and sign in with username and password.
- Store passwords using Argon2id and authenticate with server-side sessions in HttpOnly cookies.
- Persist sessions in MongoDB and allow users to update their password and theme preference.
- Apply request validation, rate limits, security headers, and no-cache response headers.

## Data Model

- **Users**: Normalized unique username, Argon2id password hash, theme preference, and timestamps.
- **Links**: Owner, unique code, destination and device routes, optional expiration and click limit, password hash, and active state.
- **Click events**: Link, timestamp, referrer and category, UTM fields, coarse location, browser, operating system, and device type. Raw IP addresses are not stored.
- **Sessions**: Express session records with MongoDB TTL cleanup.

## API Overview

Authenticated endpoints use the `HttpOnly` session cookie.

| Area | Routes | Purpose |
|---|---|---|
| Health | `GET /api/health` | API and database status |
| Auth | `/api/v1/auth/register`, `/login`, `/logout`, `/me` | Account registration and session management |
| User | `PATCH /api/v1/users/me/password`, `/preferences` | Update password or preferences |
| Links | `/api/v1/links` | List, create, read, update, and delete owned links; generate QR codes |
| Analytics | `/api/v1/analytics` and `/api/v1/links/:code/analytics` | Aggregate traffic, inspect events, and export reports |
| Redirect | `GET /:code`, `POST /:code/unlock` | Resolve a short link or unlock a protected link |

## Development Setup

### Prerequisites

- Node.js 20 or later and npm
- MongoDB for persistent local data (optional for development; the server can start an in-memory MongoDB instance)

### Install

```bash
git clone https://github.com/CharanMunur/shrtn.git
cd shrtn
npm install
```

### Configure the server

Copy the example environment file:

```bash
cp server/.env.example server/.env
```

Set `MONGODB_URI` to use a persistent MongoDB database. If it is left empty, or the configured database cannot be reached, the server attempts to use an in-memory MongoDB instance. Configure these values for a local setup:

```env
PORT=4000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
BASE_URL=http://localhost:4000
MONGODB_URI=mongodb://127.0.0.1:27017/shrtn
SESSION_SECRET=replace-with-a-random-secret-of-at-least-32-characters
```

Use a unique secret outside local development. `CLIENT_ORIGIN` accepts a comma-separated list of allowed frontend origins.

### Run the app

Start both services from the repository root:

```bash
npm run dev
```

- Client: `http://localhost:5173`
- API and short-link redirects: `http://localhost:4000`
- Health endpoint: `http://localhost:4000/api/health`

The Vite development server proxies `/api` requests to the local Express server.

To run services separately:

```bash
npm run dev -w server
npm run dev -w client
```

### Seed demo data

```bash
npm run seed -w server
```

The seed script creates sample links and click events. Its default demo login is `demo` / `password123`; use it only with local development data.

## Build and Run

Build both workspaces:

```bash
npm run build
```

Start the compiled server:

```bash
npm start
```

Build or preview the frontend independently with `npm run build -w client` or `npm run preview -w client`.

## Tests

Run the server end-to-end test suite:

```bash
npm test
```

The suite covers health and database connectivity, authentication, link validation and redirects, analytics aggregation, exports, and QR code generation.

## License

MIT. See [LICENSE](./LICENSE) for details.
