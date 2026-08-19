# Project Architecture, Authentication & Prisma Database Guide

This document provides a comprehensive overview of how authentication (Supabase Auth) and the database layer (Prisma v7 ORM + Supabase PostgreSQL) work together in this application, along with the complete project folder structure, file responsibilities, end-to-end workflows, and Prisma CLI command reference.

---

## 📐 High-Level Architecture Overview

The system uses a **decoupled hybrid model**:
1. **Supabase Auth** handles user identity, authentication, session tokens (JWTs), password resets, and OAuth (Google).
2. **Prisma v7 ORM** manages application-specific database models (like `Profile`) stored in Supabase PostgreSQL.
3. **Dual Connection Strategy**:
   - **CLI / Migrations**: Connects directly via `DIRECT_URL` (Port `5432`, bypassing PgBouncer) so schema DDL queries run without transaction pooling restrictions.
   - **Runtime App Queries**: Connects via `DATABASE_URL` (Port `6543`, with PgBouncer enabled) for efficient connection pooling under server load.

```
┌─────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│  Client (React) │ ────> │  Express Backend     │ ────> │  Supabase Services   │
└─────────────────┘       └──────────────────────┘       └──────────────────────┘
                                  │   │                             │
               JWT (Bearer Header)│   │ Prisma Client               │ Supabase Auth API
                                  ▼   ▼                             ▼
                           ┌──────────────────────────────────────────────┐
                           │            Supabase PostgreSQL               │
                           │  - auth.users (Managed by Supabase Auth)    │
                           │  - public.profiles (Managed by Prisma ORM)   │
                           └──────────────────────────────────────────────┘
```

---

## 📂 Complete Directory & File Structure

```
d:\My Projects\hcl_tech_project\
├── .gitignore                      # Root Git ignore rules (node_modules, secrets, IDE, agent files)
├── ARCHITECTURE.md                 # Complete Architecture & Developer Guide (This file)
├── README.md                       # Project overview documentation
└── server/
    ├── .env                        # Environment variables (Database URLs, API Keys, Ports)
    ├── .gitignore                  # Server-specific Git ignore rules
    ├── package.json                # Project dependencies and npm scripts
    ├── package-lock.json           # Locked dependency tree
    ├── prisma.config.ts            # Prisma v7 CLI configuration (DIRECT_URL setup)
    ├── server.js                   # Main Express application entry point
    │
    ├── configs/
    │   ├── prisma.js               # Instantiates and exports PrismaClient for runtime queries
    │   └── supabase.config.js      # Instantiates Supabase Client and Service Role Admin Client
    │
    ├── controllers/
    │   ├── auth.controller.js      # Request/Response handlers for Auth routes
    │   └── profile.controller.js   # Request/Response handlers for Profile routes
    │
    ├── services/
    │   ├── auth.service.js        # Core business logic for authentication & user provisioning
    │   └── profile.service.js     # Core business logic for profile CRUD operations
    │
    ├── middleware/
    │   └── auth.middleware.js     # Express middleware for JWT validation via Supabase
    │
    ├── routes/
    │   ├── auth.routes.js         # API endpoints definitions for `/api/auth`
    │   └── profile.routes.js      # API endpoints definitions for `/api/profile`
    │
    ├── prisma/
    │   ├── schema.prisma          # Prisma schema defining database models & PostgreSQL provider
    │   └── migrations/
    │       └── 0_init/
    │           └── migration.sql  # Initial baseline SQL migration file
    │
    └── generated/                 # Git-ignored generated Prisma Client code
        └── prisma/
```

---

## 📑 Detailed File Responsibilities

| File Path | Description & Responsibility |
| :--- | :--- |
| **`server.js`** | Entry point of the server. Initializes Express app, sets up JSON parsing, CORS middleware, mounts `/api/auth` and `/api/profile` routes, and starts listening on the configured `PORT`. |
| **`prisma.config.ts`** | Prisma v7 TypeScript configuration file. Configures CLI behavior and sets `datasource.url` to `DIRECT_URL` (Port 5432) so migration and schema inspection commands bypass connection pooling. |
| **`prisma/schema.prisma`** | Database schema definition file. Specifies the database provider (`postgresql`) and defines data models (e.g., `Profile` model mapping to `public.profiles` table). |
| **`configs/prisma.js`** | Creates and exports a single, reusable instance of `PrismaClient`. Configured with `datasourceUrl: process.env.DATABASE_URL` (Port 6543 with PgBouncer) for fast connection pooling at runtime. |
| **`configs/supabase.config.js`** | Configures and exports two Supabase SDK clients: <br>1. `supabase`: Public client using `SUPABASE_ANON_KEY` for standard operations.<br>2. `supabaseAdmin`: Service role client using `SUPABASE_SERVICE_ROLE_KEY` for privileged admin operations (e.g. password resets). |
| **`middleware/auth.middleware.js`** | Authentication protection middleware. Extracts the `Bearer <token>` from the HTTP `Authorization` header and validates it with `supabase.auth.getUser(token)`. Attaches `req.user` if valid; returns `401 Unauthorized` if invalid. |
| **`routes/auth.routes.js`** | Defines Express endpoints for `/api/auth`: `/register`, `/login`, `/google`, `/google/sync`, `/forgot-password`, `/reset-password`, and authenticated `/change-password`. |
| **`routes/profile.routes.js`** | Defines Express endpoints for `/api/profile`: `/me` (GET/PUT) protected by `authMiddleware`. |
| **`controllers/auth.controller.js`** | Parses request parameters/body for auth endpoints, calls appropriate functions in `auth.service.js`, and formats standard HTTP responses and error messages. |
| **`controllers/profile.controller.js`** | Parses request params for profile endpoints, delegates execution to `profile.service.js`, and returns response objects. |
| **`services/auth.service.js`** | Handles auth workflows: calls `supabase.auth.signUp()` / `signInWithPassword()`, creates/links the matching `Profile` record in PostgreSQL using Prisma, and executes password management routines. |
| **`services/profile.service.js`** | Handles profile database operations using Prisma: fetches profile by `userId` or `id`, updates full name, bio, avatar URL, etc. |

---

## 🔄 Complete Authentication & Database Workflows

### 1. User Registration Flow (`POST /api/auth/register`)

```
Client               auth.controller        auth.service            Supabase Auth         Prisma ORM (DB)
  │                        │                     │                        │                     │
  │─── POST /register ────>│                     │                        │                     │
  │   (email, password,    │─── registerUser() ─>│                        │                     │
  │    fullName)           │                     │─── signUp(email, pass)─>│                     │
  │                        │                     │<── { user, session } ──│                     │
  │                        │                     │                        │                     │
  │                        │                     │─── prisma.profile.create({                   │
  │                        │                     │      userId: user.id,                        │
  │                        │                     │      fullName: fullName                      │
  │                        │                     │    }) ──────────────────────────────────────>│
  │                        │                     │<── Created Profile ──────────────────────────│
  │                        │<── { user, token }──│                                              │
  │<── 201 Created ────────│                     │                                              │
```

1. Client submits registration details (`email`, `password`, `fullName`).
2. `auth.service.js` calls `supabase.auth.signUp()` to register the identity in Supabase `auth.users`.
3. Supabase returns a generated UUID (`user.id`).
4. `auth.service.js` uses Prisma to insert a record into `public.profiles` storing `userId: user.id` and `fullName`.
5. Service returns identity data and JWT access token back to the client.

---

### 2. User Login Flow (`POST /api/auth/login`)

1. Client sends `email` and `password`.
2. `auth.service.js` calls `supabase.auth.signInWithPassword()`.
3. Supabase validates credentials and returns a JWT access token and session metadata.
4. `auth.service.js` fetches the user's `Profile` from PostgreSQL via Prisma using `userId`.
5. Returns profile data and the access token to the client.

---

### 3. Protected Route Access Flow (e.g. `GET /api/profile/me`)

```
Client                  auth.middleware         profile.controller      Prisma ORM (DB)
  │                            │                        │                      │
  │── GET /api/profile/me ────>│                        │                      │
  │   Header: Authorization    │                        │                      │
  │   "Bearer <JWT>"           │── supabase.auth        │                      │
  │                            │   .getUser(token)      │                      │
  │                            │<── Valid User object   │                      │
  │                            │                        │                      │
  │                            │── req.user = user      │                      │
  │                            │── next() ─────────────>│                      │
  │                            │                        │── getProfileByUserId │
  │                            │                        │   (req.user.id) ────>│
  │                            │                        │<── Profile Data ─────│
  │<── 200 OK (Profile) ───────│                        │                      │
```

1. Client passes HTTP header: `Authorization: Bearer <access_token>`.
2. `auth.middleware.js` extracts the token and validates it against Supabase Auth.
3. If valid, attaches user payload to `req.user` and calls `next()`.
4. Route handler fetches profile data using Prisma (`userId = req.user.id`) and sends the response.

---

## ⚡ Prisma v7 Database Management & Commands Reference

In **Prisma v7**, connection URLs are moved out of `schema.prisma` into `prisma.config.ts`.

### Connection Configuration Summary
- **`prisma.config.ts`** uses `DIRECT_URL` (`port 5432`) for schema CLI operations.
- **`configs/prisma.js`** uses `DATABASE_URL` (`port 6543`) with `pgbouncer=true` for runtime queries.

---

### Essential Prisma Commands

| Command | Purpose | When to run |
| :--- | :--- | :--- |
| `npx prisma format` | Formats `schema.prisma` and checks for syntax errors. | Whenever you edit `schema.prisma`. |
| `npx prisma generate` | Generates TypeScript / JavaScript Prisma Client code into `server/generated/prisma`. | After modifying `schema.prisma` or pulling fresh code. |
| `npx prisma migrate status` | Checks migration sync status between local migration files and target database. | To check if database is in sync with migrations. |
| `npx prisma migrate dev --name <migration_name>` | Generates a new SQL migration file and applies it to the development database. | When you add or change database models/fields in `schema.prisma`. |
| `npx prisma migrate deploy` | Applies all pending migrations to production/staging database. | During deployment / CI/CD pipeline. |
| `npx prisma migrate resolve --applied "<migration_name>"` | Marks an unapplied migration as already applied (baselining). | When linking Prisma to an existing database with pre-created tables. |
| `npx prisma studio` | Launches interactive web GUI to view and edit database data. | For manual inspection/debugging of database records. |

---

## 💡 Troubleshooting & Best Practices

1. **Environment Variables**: Always ensure `.env` contains both:
   - `DATABASE_URL`: Transaction pooler URL (Port 6543, `?pgbouncer=true`)
   - `DIRECT_URL`: Direct PostgreSQL connection URL (Port 5432)
2. **Never Commit Secrets**: Ensure `.env` is listed in both root `.gitignore` and `server/.gitignore`.
3. **Regenerating Prisma Client**: If you get model type errors in your IDE, run `npx prisma generate` in the `server` directory.
