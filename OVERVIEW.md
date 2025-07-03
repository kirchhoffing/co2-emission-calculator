# OVERVIEW: Internal Guide for AI Coding Assistants

Purpose of this file:
This file is not intended for humans or end users. It is meant to guide AI assistants and copilot tools working on this project — to prevent duplication, understand the current structure, and maintain consistency across the codebase.

------------------------------

PROJECT SUMMARY

- Project name: CO2 Emission Calculator
- Goal: A full-stack TypeScript web app that allows businesses to calculate and report CO2 emissions (Scope 1, 2, partial 3)
- Stack: 100% TypeScript (frontend, backend, database, testing, CI)
- Status: Project is in progress; base setup is complete

------------------------------

IMPORTANT NOTES FOR AI ASSISTANTS

* Use only TypeScript. Do not generate Python, Java, etc.
* The frontend uses Next.js App Router. It is already initialized.
* Do not create folders like "src", "api", or "shared"
* Use tRPC for API communication. No REST or GraphQL.
* Use Kysely for database access. Do not use Prisma.
* Use Drizzle Kit for migrations.
* Shared logic like CO2 calculation must go under "packages/core"
* Tailwind CSS is used for styling. Do not use styled-components or CSS modules.
* Use only next-i18next for localization.
* Use GitHub Actions for CI. Do not introduce new CI tools.
* Do not add or duplicate anything that already exists.

------------------------------

PROJECT FOLDER STRUCTURE

- apps/web : Next.js frontend
- packages/core : Shared CO2 calculation logic
- packages/ui : Optional shared UI components
- db : Drizzle schema and migration files
- scripts : Helper scripts (like emission factor importer)
- tests : Vitest and Playwright test files

All code must stay within these folders. Do not add new folder trees.

------------------------------

MODULE STATUS (AS OF NOW)

* CO2 calculation logic: In progress (use packages/core)
* CSV import (energy, fuel): Not implemented (planned under scripts)
* PDF report generation: Not implemented (should use react-pdf)
* JSON export for XBRL: Not implemented
* Emission factor importer: Implemented or planned already
* Auth: Not implemented (use Auth.js only)
* i18n: Partially implemented (next-i18next, de and en only)
* Charting: Partially implemented (use TanStack Charts only)
* Email sending (PDF reports): Not implemented (will use Resend)

------------------------------

APPROVED TOOLS AND LIBRARIES

* Frontend: Next.js, Tailwind CSS, TanStack Router, TanStack Form, TanStack Charts
* Backend: tRPC, Zod, node-cron
* Auth: Auth.js
* Database: PostgreSQL, Kysely, Drizzle Kit
* File upload: UploadThing or React Dropzone
* Testing: Vitest, Playwright
* CI/CD: GitHub Actions, Prettier, ESLint, Husky
* Email: Resend
* Env Management: Doppler

Do not install or use any libraries outside this list unless explicitly allowed.

------------------------------

PRIVACY AND COMPLIANCE

* All input data (energy, fuel) is sensitive
* GDPR compliance is required
* All changes must be audit-logged with timestamp and user ID
* Users must be able to delete and export their data
* AES-256 encryption should be used at rest

------------------------------

DO NOT DO THIS

* Do not use Prisma
* Do not use styled-components or CSS Modules
* Do not use other i18n frameworks
* Do not use non-TypeScript languages
* Do not create extra folder structures
* Do not create duplicate versions of existing logic

------------------------------

CONTINUE WORK LIKE THIS

* Reuse logic inside packages/core
* Add scripts to the scripts folder only
* Use Vitest and Playwright in tests folder
* Follow existing file layout strictly
* Use strict TypeScript typing
* Follow formatting and linting rules already defined

------------------------------

This file must be kept up to date as the project grows.
AI assistants must use this as the single source of truth.
