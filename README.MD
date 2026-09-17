# Mini Job Queue Management Dashboard

A small full-stack Job Queue Management Dashboard built for the React + NestJS Intern Assignment. Backend is **NestJS + TypeORM + PostgreSQL**; frontend is **React (Vite + TypeScript + Tailwind CSS)**.

- **Live frontend:** `https://job-queue-dashboard-green.vercel.app/`
- **Live backend / API:** `https://job-queue-backend-q1ed.onrender.com`
- **Repository:** `https://github.com/rishikesh1005/job-queue-dashboard`

## Stack

| Layer    | Technology                                          |
|----------|-------------------------------------------------------|
| Backend  | NestJS 10, TypeORM 0.3, PostgreSQL, class-validator    |
| Frontend | React, Vite, TypeScript, Tailwind CSS, lucide-react    |
| Testing  | Jest (backend unit tests)                              |

## Project Structure

```
job-queue/
├── backend/            # NestJS API
│   └── src/
│       ├── jobs/       # Controller, service, entity, DTOs
│       ├── common/     # Global exception filter
│       ├── app.module.ts
│       └── main.ts
└── frontend/           # React SPA
    └── src/
        ├── components/ # JobTable, JobRow, CreateJobModal, MetricsCards, StatusFilter, ...
        ├── hooks/       # useJobs — fetching, polling, mutation state
        ├── services/    # api.ts — typed fetch wrapper
        └── types/       # Shared TypeScript types
```

## Prerequisites

- Node.js 18+
- PostgreSQL 13+ (local instance or a connection string to a hosted one)

## Setup Instructions

### 1. Database

```bash
createdb job_queue
```

(Or point `DATABASE_URL` at any Postgres instance you already have — see below.)

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # adjust DATABASE_URL / PORT / FRONTEND_URL as needed
npm run start:dev
```

Runs on `http://localhost:4000`. The `jobs` table is created automatically on startup (see [Schema management](#schema-management) below).

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # set VITE_API_URL to your backend URL
npm run dev
```

Runs on `http://localhost:5173` and polls the backend every 5 seconds for updates.

### 4. Run tests

```bash
cd backend
npm test
```

## Environment Variables

**backend/.env**
| Variable       | Default                                                    | Purpose                        |
|----------------|-------------------------------------------------------------|----------------------------------|
| `PORT`         | `4000`                                                       | API port                        |
| `NODE_ENV`     | `development`                                                | Enables Postgres SSL in prod    |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/job_queue`   | Postgres connection string      |
| `FRONTEND_URL` | `http://localhost:5173`                                      | Allowed CORS origin             |

**frontend/.env**
| Variable       | Default                    | Purpose                |
|----------------|-----------------------------|--------------------------|
| `VITE_API_URL` | `http://localhost:4000`    | Base URL the SPA calls  |

## API

Each job has: `id` (uuid), `title`, `type`, `status`, `createdAt`.
Allowed statuses: `pending`, `running`, `completed`, `failed`.

| Method | Endpoint            | Description                                            |
|--------|----------------------|----------------------------------------------------------|
| POST   | `/jobs`              | Create a job. Body: `{ title, type }`. Always starts `pending`. |
| GET    | `/jobs`              | List all jobs, newest first. Optional `?status=` filter.  |
| PATCH  | `/jobs/:id/status`   | Update job status. Body: `{ status }`.                    |
| DELETE | `/jobs/:id`          | Delete a job.                                             |

Validation (via `class-validator`): `title`/`type` are required, trimmed, non-empty strings up to 255/100 chars; `status` must be one of the four enum values; `:id` must be a valid UUID. Invalid input returns `400`, an unknown job returns `404`, all errors are shaped consistently as `{ statusCode, message, timestamp }` by a global exception filter.

## The Concurrency Problem

The assignment's core scenario: two browser tabs both see a job as `pending` and both try to move it to `running` at nearly the same time. Here's how each part of that problem was addressed:

**Where should the rule be enforced?**
Entirely on the backend, in `JobsService`, not in the React UI. The UI disables buttons for invalid transitions as a convenience, but that's just UX — it is not the source of truth and cannot be trusted, since it's trivial to bypass.

**What if someone bypasses the frontend and calls the API directly?**
The backend re-validates every transition against a fixed table:

```
pending   → running
running   → completed | failed
completed → (none)
failed    → (none)
```

Any request for a transition not in this table — `pending → completed`, `completed → running`, the same status again, etc. — is rejected with `400 Bad Request` before touching the database. So a direct `curl`/Postman call gets exactly the same guarantees as the UI.

**What happens when two requests arrive at nearly the same time?**
This is the part a simple "read current status, check it's valid, then update" approach doesn't actually solve — both requests can read `pending` before either writes, and both would then be allowed to write `running`. To close that gap, the status update is done as a single **conditional SQL update**:

```sql
UPDATE jobs
SET status = :targetStatus
WHERE id = :id AND status = :expectedCurrentStatus
```

Both concurrent requests include the status they *expect* to be overwriting. Whichever request's `UPDATE` executes first wins and flips the row. The second request's `WHERE` clause no longer matches (the status has already changed), so it updates zero rows. The backend checks `affected === 0` and responds with `409 Conflict` instead of silently double-applying the transition or overwriting the winner. This uses Postgres's own row-level atomicity, so no extra locking, version column, or queueing infrastructure is needed for a system this size.

**How is invalid/inconsistent state prevented overall?**
Three layers, each independent of the others so bypassing one doesn't compromise the guarantee:
1. DTO validation — malformed payloads never reach business logic.
2. State-machine check — only legal transitions are attempted.
3. Conditional update at the database — only one concurrent writer can actually succeed on a given transition, verified at the SQL level rather than trusted from application memory.

## Other Notable Decisions

- **Frontend polling, not WebSockets.** `useJobs` polls `GET /jobs` every 5 seconds. For a dashboard where "close to real-time" is enough, this is far simpler to build and deploy than a socket layer, and it naturally reconciles any `409`s — a client with a stale view just corrects itself on the next poll. Background polls don't toggle the loading spinner, so the table doesn't flicker.
- **No optimistic local updates.** After any create/update/delete, the frontend re-fetches from the server rather than mutating local state first. Slightly less snappy, but it means the UI is never confidently wrong, which matters most exactly when a `409` happens.
- **UUIDs for job IDs**, validated at the controller with `ParseUUIDPipe`, instead of auto-increment integers — avoids ID collisions and doesn't leak record counts.

## Assumptions

- A job's `title` and `type` are free-text strings (no fixed enum of job types was specified).
- Filtering is by a single status at a time; no multi-select or date-range filtering was required.
- No auth/user concept was specified, so all endpoints are open — anyone with the API URL can manage all jobs.

## Trade-offs

- `synchronize: true` (TypeORM) is used so the schema is created automatically on boot — convenient for an assignment/demo, but not something to run against a production database, since it can make unintended, destructive schema changes. A real deployment should switch to explicit TypeORM migrations.
- Polling over WebSockets trades true real-time updates for much lower implementation and operational complexity, which seemed the right trade-off at this scope.
- No pagination on `GET /jobs` — acceptable for demo-scale data, but would need to be added before this could handle a large job history.

## Bonus: Production-Readiness Improvement

**Chosen improvement: the optimistic-concurrency conditional update described above (`WHERE id = :id AND status = :expectedStatus`, returning `409` on conflict).**

I chose this over other candidates (e.g., adding auth, or adding a message-queue/worker system) because it directly targets the specific correctness problem the assignment calls out — concurrent status changes — rather than adding breadth elsewhere. It's also a pattern that scales past this assignment: it needs no extra infrastructure (no locks, no external queue), degrades safely (a losing request gets a clear, actionable `409` rather than a silent overwrite or a hang), and is the same technique (compare-and-swap on a version/state column) used in real production systems to avoid lost updates without pessimistic locking.

## With More Time, I Would Add

- Authentication/authorization and per-user job ownership.
- TypeORM migrations in place of `synchronize: true`, plus a locked-down CORS origin list for production.
- Pagination and sorting on `GET /jobs`.
- Real-time updates (SSE or WebSockets) instead of fixed-interval polling.
- Integration/e2e tests covering the concurrency scenario itself (two near-simultaneous `PATCH` requests), not just unit tests of the service logic.