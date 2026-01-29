# JanArogya

Community health and water-safety platform built with Next.js 14 App Router. It provides OTP-backed authentication, role-based access, dashboards for health and water-quality reporting, and alerting tools for rural communities.

## Features
- Email/OTP signup with JWT session cookies, password hashing, and role checks (community, health-worker, admin)
- Profile management, secure login/logout, and resend/verify OTP flows
- Health reports, water quality reports, and alert tracking persisted in Postgres/Neon via serverless SQL
- Rich UI kit (Radix UI + Tailwind) with reusable dashboard layout and charts
- Optional Prisma schema and services ready for type-safe data access alongside the raw SQL layer

## Stack
- Next.js 14 (App Router), React 18, TypeScript
- Tailwind CSS 4, Radix UI primitives, Recharts, next-themes
- Postgres on Neon with serverless driver; JWT + bcrypt for auth
- Nodemailer for transactional email (OTP + welcome)

## Prerequisites
- Node.js 18+
- pnpm (preferred) or npm
- Postgres connection string (Neon recommended)
- SMTP credentials for sending OTP and welcome emails

## Environment
Create `.env.local` with these keys (use strong, unique secrets in every environment):

```env
DATABASE_URL=postgres://user:password@host:port/db
JWT_SECRET=replace-with-a-long-random-string
EMAIL_HOST=smtp.yourprovider.com
EMAIL_PORT=587
EMAIL_USER=you@example.com
EMAIL_PASS=replace-with-an-app-password
```

## Quick Start
1) Install deps: `pnpm install`
2) Run dev server: `pnpm dev` (defaults to http://localhost:8080)
3) Initialize schema: open http://localhost:8080/api/init-db once to create tables
4) Signup flow: register, check email for OTP, verify, then log in with chosen role

## Scripts
- `pnpm dev` – start dev server on port 8080
- `pnpm build` – production build
- `pnpm start` – start built app
- `pnpm lint` – run Next.js lint

## API Surface (selected)
- POST /api/auth/signup – create account and send OTP
- POST /api/auth/verify-otp – confirm code, mark user verified, send welcome email
- POST /api/auth/login – role-checked login, sets httpOnly JWT cookie
- POST /api/auth/logout – clear session cookie
- POST /api/auth/resend-otp – resend verification code
- GET /api/auth/me – current user from cookie
- PUT /api/auth/update-profile – update name/phone/role with uniqueness checks
- GET /api/init-db – create baseline tables (users, otp_codes, health_reports, water_quality_reports, alerts)

## Data Model
Core schema lives in [lib/db.ts](lib/db.ts) (raw SQL) and [prisma/schema.prisma](prisma/schema.prisma) (type-safe option). Tables: users, otp_codes, health_reports, water_quality_reports, alerts with status/severity enums and basic auditing columns.

## Emails
Transactional templates live in [lib/email.ts](lib/email.ts). Configure SMTP via `EMAIL_*` vars; OTP codes expire after 10 minutes and welcome email is sent on verification.

## Optional: Prisma Path
A full Prisma layer is scaffolded in [prisma/schema.prisma](prisma/schema.prisma) with services in [lib/db-prisma.ts](lib/db-prisma.ts). To adopt it: `pnpm dlx prisma generate` then `pnpm dlx prisma db push`, and swap imports from `lib/db` to `lib/db-prisma` where desired.

## Development Notes
- Auth token stored in `auth-token` httpOnly cookie with 24h TTL; rotate `JWT_SECRET` per deployment
- `app/api/init-db` is idempotent; rerun safely during setup
- Keep SMTP secrets out of commits; rotate credentials if leaked

## Troubleshooting
- "DATABASE_URL must be set": ensure `.env.local` is loaded and server restarted
- OTP email not sent: verify SMTP host/port/user/pass; check spam folder
- Login blocked: account must be verified and role must match selected role

## Project Structure (high level)
- app/ – routes, pages, layouts
- app/api/ – route handlers (auth, init-db, predict-water-risk)
- components/ – UI primitives, layout, charts
- hooks/ – shared React hooks
- lib/ – auth, db, prisma, email utilities
- prisma/ – Prisma schema
- public/ – static assets

## Deploy
- Build: `pnpm build`
- Run: `pnpm start` (ensure `DATABASE_URL`, `JWT_SECRET`, and SMTP vars set)
- Recommended: deploy on Vercel with Neon for Postgres; set environment variables in dashboard

## License
Proprietary – all rights reserved unless otherwise stated.
