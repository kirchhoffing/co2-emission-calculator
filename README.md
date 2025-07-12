# CO2 Emission Calculator

A full-stack TypeScript web app for businesses to calculate and report CO2 emissions (Scope 1, 2, partial 3). Built with Next.js, tRPC, Kysely, Drizzle, and Tailwind CSS.

## Features
- User authentication (Auth.js, role-based access)
- CO2 emissions calculator (Scope 1, 2, 3)
- Dashboard with emission summaries
- PDF report generation (react-pdf)
- GDPR compliance (data export, deletion, audit logging)
- Responsive, accessible UI (WCAG 2.1 AA)
- Modular monorepo structure

## Tech Stack
- **Frontend:** Next.js (App Router), Tailwind CSS, TanStack Router, TanStack Form, TanStack Charts
- **Backend:** tRPC, Zod, node-cron
- **Database:** PostgreSQL, Kysely, Drizzle Kit
- **Auth:** Auth.js
- **Testing:** Vitest, Playwright
- **CI/CD:** GitHub Actions, Prettier, ESLint, Husky
- **Email:** Resend

## Folder Structure
- `apps/web` – Next.js frontend (main app)
- `packages/core` – Shared CO2 calculation logic
- `packages/ui` – Shared UI components
- `db` – Drizzle schema and migration files
- `scripts` – Helper scripts (e.g., emission factor importer)
- `tests` – Vitest and Playwright test files

## Main Application Routes
- `/` – Home (public landing page)
- `/login`, `/register` – Auth pages
- `/dashboard` – Main dashboard
- `/calculator` – Emissions calculator (Scope 1, 2, 3)
- `/reports` – Emission reports
- `/admin` – Admin dashboard
- `/privacy-center` – GDPR data management

## Current Status
- **Total Tasks:** 125
- **Completed:** 46 (37%)
- **Next Priorities:** Data import router, data validation middleware, testing integration, email system

See [`docs/TODO.md`](docs/TODO.md) for a detailed task tracker and [`docs/OVERVIEW.md`](docs/OVERVIEW.md) for architecture and rules.

## Getting Started

Install dependencies and run the development server:

```powershell
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Contributing
- Use only TypeScript
- Follow the folder structure and rules in `docs/OVERVIEW.md`
- Use pnpm for package management
- All code must be linted and tested

## License
MIT
