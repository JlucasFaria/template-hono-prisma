# template-hono-prisma

A production-ready REST API template built with **Hono**, **Prisma 7**, **Zod 4**, and **Bun**.

Features JWT authentication with refresh token rotation, OpenAPI/Swagger documentation, structured JSON logging, rate limiting, and a PostgreSQL database via Docker.

---

## Stack

| Layer      | Technology                                                  |
| ---------- | ----------------------------------------------------------- |
| Runtime    | [Bun](https://bun.sh)                                       |
| Framework  | [Hono](https://hono.dev) + `@hono/zod-openapi`              |
| ORM        | [Prisma 7](https://www.prisma.io) with `@prisma/adapter-pg` |
| Validation | [Zod 4](https://zod.dev)                                    |
| Database   | PostgreSQL 16 (Docker)                                      |
| Language   | TypeScript (strict mode)                                    |

---

## Requirements

- [Bun](https://bun.sh) >= 1.x
- [Docker](https://www.docker.com) (for PostgreSQL)

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd template-hono-prisma
bun install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Docker / PostgreSQL
DATABASE_DB="mydb"
DATABASE_USER="postgres"
DATABASE_PASSWORD="your_password_here"

# Prisma
DATABASE_URL="postgresql://postgres:your_password_here@localhost:5432/mydb"

# Auth
JWT_SECRET="replace_with_a_random_string_of_at_least_32_characters"

# Server
PORT="3000"
NODE_ENV="development"
CORS_ORIGIN="*"
```

### 3. Start the database and run migrations

```bash
bun run db:up       # Start PostgreSQL container
bun run db:migrate  # Run Prisma migrations
bun run db:seed     # (Optional) Seed with sample users
```

### 4. Start the server

```bash
bun run dev         # With hot reload
# or
bun run dev:all     # Start DB container + dev server in one command
```

The server will be available at `http://localhost:3000`.

---

## Environment Variables

| Variable            | Description                                            |
| ------------------- | ------------------------------------------------------ |
| `DATABASE_URL`      | PostgreSQL connection string (validated as URL)        |
| `JWT_SECRET`        | Signing key, minimum 32 characters                     |
| `PORT`              | Server port (default: `3000`)                          |
| `NODE_ENV`          | `development` \| `test` \| `production`                |
| `CORS_ORIGIN`       | Allowed CORS origin(s) — `"*"` or comma-separated URLs |
| `DATABASE_DB`       | Database name (used by Docker Compose)                 |
| `DATABASE_USER`     | Database user (used by Docker Compose)                 |
| `DATABASE_PASSWORD` | Database password (used by Docker Compose)             |

Validation is done at startup via Zod (`src/config/env.ts`). The app crashes immediately if any variable is invalid or missing.

---

## Commands

```bash
# Development
bun run dev              # Start server with hot reload (bun --watch)
bun run dev:all          # Start DB container + dev server
bun run start            # Start server without watch mode (production)

# Database
bun run db:up            # Start PostgreSQL container (docker compose up -d)
bun run db:stop          # Stop container (preserves data)
bun run db:down          # Stop and remove container
bun run db:migrate       # Run Prisma migrations (prisma migrate dev)
bun run db:migrate:prod  # Apply pending migrations non-interactively (prisma migrate deploy)
bun run db:generate      # Generate Prisma client to generated/prisma/
bun run db:seed          # Seed database with sample data
bun run db:studio        # Open Prisma Studio GUI
bun run db:reset         # Full reset: destroy volume, recreate, migrate, seed

# Testing
bun run test             # Run all tests
bun run test:watch       # Run tests in watch mode

# Code Quality
bun run lint             # ESLint check
bun run lint:fix         # ESLint auto-fix
bun run format           # Prettier format
bun run format:check     # Prettier check only (used in CI)
```

---

## API Reference

### Base URL

```
http://localhost:3000
```

### Special Endpoints

| Endpoint      | Description                          |
| ------------- | ------------------------------------ |
| `GET /`       | Health check (plain text)            |
| `GET /health` | Detailed health check with DB status |
| `GET /ui`     | Swagger UI                           |
| `GET /doc`    | OpenAPI JSON spec                    |

### Auth Endpoints

| Method | Path                | Auth            | Description                                   |
| ------ | ------------------- | --------------- | --------------------------------------------- |
| `POST` | `/api/auth/login`   | Public          | Login with email + password                   |
| `POST` | `/api/auth/refresh` | Public          | Rotate refresh token, get new token pair      |
| `POST` | `/api/auth/logout`  | Optional Bearer | Revoke refresh token + blacklist access token |

### User Endpoints

| Method | Path         | Auth       | Description                      |
| ------ | ------------ | ---------- | -------------------------------- |
| `POST` | `/api/users` | Public     | Create a new user (registration) |
| `GET`  | `/api/users` | Bearer JWT | List all users (paginated)       |

### Authentication Flow

```
POST /api/auth/login
  Body: { "email": "...", "password": "..." }
  Response: { "token": "<access_token>", "refreshToken": "<refresh_token>" }

# Use access token in protected requests:
Authorization: Bearer <access_token>

# When access token expires, rotate it:
POST /api/auth/refresh
  Body: { "refreshToken": "<refresh_token>" }
  Response: { "token": "<new_access_token>", "refreshToken": "<new_refresh_token>" }

# Logout:
POST /api/auth/logout
  Body: { "refreshToken": "<refresh_token>" }
  Headers: Authorization: Bearer <access_token>  (optional, blacklists access token)
```

**Token TTLs:**

- Access token: 1 hour
- Refresh token: 7 days (rotated on every use)

### Pagination

Paginated endpoints accept `?page=1&limit=10` query parameters.

- Default: page 1, limit 10
- Maximum limit: 100
- Non-numeric values fall back to defaults safely

### Response Format

All endpoints return a consistent JSON envelope:

```json
// Success
{ "success": true, "data": { ... }, "message": "Description" }

// Error
{ "success": false, "error": "Error message" }

// Validation error (400)
{ "success": false, "error": "Validation failed", "details": [ ... ] }
```

---

## Database

### Models

**User**

| Field       | Type       | Notes                                     |
| ----------- | ---------- | ----------------------------------------- |
| `id`        | `Int`      | Auto-increment primary key                |
| `email`     | `String`   | Unique                                    |
| `password`  | `String`   | Hashed with argon2id (via `Bun.password`) |
| `name`      | `String?`  | Optional                                  |
| `createdAt` | `DateTime` | Auto-set                                  |
| `updatedAt` | `DateTime` | Auto-updated                              |

**RefreshToken**

| Field        | Type        | Notes                      |
| ------------ | ----------- | -------------------------- |
| `id`         | `Int`       | Auto-increment primary key |
| `token`      | `String`    | Unique, 40 random bytes    |
| `userId`     | `Int`       | FK → User (cascade delete) |
| `expiresAt`  | `DateTime`  |                            |
| `createdAt`  | `DateTime`  | Auto-set                   |
| `lastUsedAt` | `DateTime?` | Updated on use             |

Password is never returned from any API endpoint (enforced via Prisma `select`).

### Seed Data

Run `bun run db:seed` to populate the database with 3 default users:

| Email                | Password    |
| -------------------- | ----------- |
| `admin@template.com` | `admin1234` |
| `alice@template.com` | `alice1234` |
| `bob@template.com`   | `bob12345`  |

The seed is idempotent (`upsert`) and can be run multiple times safely.

---

## Architecture

### Request Pipeline

```
Request
  → secureHeaders
  → requestIdMiddleware (X-Request-ID)
  → structuredLogger
  → cors
  → rateLimitMiddleware (/api/* only, 100 req/60s per IP)
  → bodyLimit (/api/* only, 1MB max)
  → Route handler
  → Response
       ↓
  errorHandler (onError)
```

### Directory Structure

```
src/
├── index.ts                        # Entry point: middleware registration, routes, OpenAPI config
├── config/
│   ├── env.ts                      # Zod-validated environment variables
│   └── constants.ts                # Tuneable values (rate limit, body limit, pagination, token TTLs)
├── db/
│   └── client.ts                   # Prisma client singleton (pg adapter, pool: max 10, idle 30s)
├── middlewares/
│   ├── auth.ts                     # JWT middleware, getAuthPayload(), in-memory token blacklist
│   ├── error-handler.ts            # Global error handler (Zod, HTTP, Prisma, unknown)
│   ├── rate-limit.ts               # In-memory IP-based rate limiter
│   ├── request-id.ts               # X-Request-ID response header
│   └── tests/
├── schemas/
│   ├── response.ts                 # successResponseSchema(), errorResponseSchema
│   └── pagination.ts               # paginationQuerySchema, paginationMetaSchema
├── utils/
│   ├── response.ts                 # successResponse(), errorResponse() helpers
│   ├── pagination.ts               # getPaginationParams(), createPaginationMeta()
│   └── logger.ts                   # Structured JSON logger middleware
└── api/
    ├── auth/
    │   ├── auth-schema.ts
    │   ├── auth-service.ts         # Refresh token CRUD
    │   ├── auth-routes.ts          # Factory: createAuthRoutes(userRepo)
    │   └── tests/
    ├── health/
    │   ├── health-routes.ts
    │   └── tests/
    └── user/
        ├── user-schema.ts
        ├── user-service.ts         # CRUD, password hashing
        ├── user-routes.ts          # Factory: createUserRoutes()
        └── tests/

prisma/
├── schema.prisma
└── seed.ts
```

### Key Design Decisions

**Dependency Injection via factory functions** — Routes are exported as factory functions (`createAuthRoutes`, `createUserRoutes`) rather than singletons. This allows injecting mock services in tests without monkey-patching globals.

**Auth decoupled from User** — `auth-routes.ts` depends on `IUserAuthRepository` (an interface with only `findByEmail` and `verifyPassword`), not on `UserService` directly. `UserService` satisfies the interface via structural typing. Wiring happens at the composition root (`index.ts`).

**Token blacklist** — On logout, access tokens are added to an in-memory set (keyed by token, TTL = token expiry). This makes logout immediate without a DB query on every request. Note: the blacklist is cleared on server restart — use Redis for persistent revocation across restarts/instances.

**Refresh token rotation** — Every `/refresh` call revokes the old token and issues a new one. Reusing a revoked token returns 401.

**Error handling** — A single global `onError` handler maps all error types to structured responses:

| Error type                         | Status          | Response                               |
| ---------------------------------- | --------------- | -------------------------------------- |
| `ZodError`                         | 400             | Field-level validation details         |
| `HTTPException`                    | Matching status | Error message                          |
| Prisma `P2002` (unique constraint) | 409             | `"<field> already in use"`             |
| Prisma `P2025` (not found)         | 404             | Not found message                      |
| Unknown errors                     | 500             | Generic message (hidden in production) |

---

## Testing

Tests run against a **real PostgreSQL database** (not mocks). Start the DB before running tests.

```bash
bun run db:up       # Ensure DB is running
bun run db:migrate  # Ensure schema is up to date
bun run test
```

### Test Coverage

| File                                          | Type        | What it covers                                                                              |
| --------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------- |
| `src/api/health/tests/health.test.ts`         | Integration | `GET /health` — 200 (DB up), 503 (DB down via DI)                                           |
| `src/api/auth/tests/auth-routes.test.ts`      | Integration | Login, refresh rotation, logout, token reuse prevention                                     |
| `src/api/auth/tests/auth-service.test.ts`     | Unit        | `generateRefreshToken`, `validateRefreshToken`, `revokeRefreshToken`, `revokeAllUserTokens` |
| `src/api/user/tests/user-routes.test.ts`      | Integration | User creation, duplicate detection, auth, pagination, body limit                            |
| `src/api/user/tests/user-service.test.ts`     | Unit        | `create`, `getAll`, `findByEmail`, `verifyPassword`                                         |
| `src/middlewares/tests/error-handler.test.ts` | Unit        | ZodError, HTTPException, P2002, P2025, generic                                              |
| `src/middlewares/tests/rate-limit.test.ts`    | Unit        | IP tracking, 429 after limit, independent buckets per IP                                    |
| `src/middlewares/tests/request-id.test.ts`    | Unit        | X-Request-ID presence, hex format, uniqueness                                               |

---

## CI/CD

Two GitHub Actions workflows run on every push/PR to `main`:

**`linting.yaml`** — Installs dependencies, generates Prisma client, runs `format:check` and ESLint.

**`tests.yaml`** — Spins up a PostgreSQL 16 service container, runs `prisma db push`, then `bun run test`.

---

## Security Notes

- `JWT_SECRET` must be at least 32 characters. Use a cryptographically random value in production.
- `CORS_ORIGIN` should be set to your actual domain in production. Never use `"*"` in production.
- Rate limiting uses `X-Forwarded-For` (first IP). Configure your reverse proxy to strip client-provided values in production to prevent spoofing.
- The token blacklist and rate limit store are in-memory. They reset on server restart. For multi-instance deployments, replace both with Redis.
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`) are applied globally via `hono/secure-headers`.
- Passwords are hashed with argon2id via `Bun.password.hash()` and are never returned from any endpoint.

---

## Logging

Every request emits a structured JSON line to stdout:

```json
{
  "requestId": "a3f1b2c4d5e6f7a8",
  "method": "POST",
  "path": "/api/auth/login",
  "statusCode": 200,
  "duration": 42,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Unexpected server errors are logged via `console.error` with the full stack trace and `requestId`. These structured logs integrate with log aggregation platforms (Datadog, CloudWatch, Grafana Loki).

---

## Graceful Shutdown

The server listens for `SIGINT` (Ctrl+C) and `SIGTERM` (Docker/Kubernetes). On shutdown:

1. Clears the rate limit cleanup interval
2. Clears the token blacklist cleanup interval
3. Disconnects the Prisma client
4. Exits cleanly
