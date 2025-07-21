# Project Task Tracker: CO2 Emission Calculator

Completed tasks have an "x" at the beginning.

## TASKS

### 🔐 Authentication & Authorization
- [x] **Implement Auth.js integration** - Set up authentication providers and session management ([apps/web/auth.ts](apps/web/auth.ts))
- [x] **Auth.js configuration** - Credentials provider with Drizzle adapter for PostgreSQL ([apps/web/auth.ts](apps/web/auth.ts))
- [x] **Authentication API routes** - NextAuth.js route handlers for all auth flows ([apps/web/app/api/auth/[...nextauth]/route.ts](apps/web/app/api/auth/[...nextauth]/route.ts))
- [x] **Authentication database schema** - Auth.js required tables (accounts, sessions, verification tokens) ([db/schema.ts](db/schema.ts))
- [x] **Password hashing** - Secure bcrypt password storage and verification ([apps/web/server/api/routers/auth.ts](apps/web/server/api/routers/auth.ts))
- [x] **GDPR compliance** - User consent tracking and data retention options ([db/schema.ts](db/schema.ts))
- [x] **Create auth middleware** - Protect dashboard and calculator routes ([apps/web/middleware.ts](apps/web/middleware.ts))
- [x] **Add role-based access control** - Implement user, admin, company_admin roles ([apps/web/middleware.ts](apps/web/middleware.ts))
- [x] **Session management** - Handle login/logout with proper token management ([apps/web/app/login/page.tsx](apps/web/app/login/page.tsx), [apps/web/app/register/page.tsx](apps/web/app/register/page.tsx))
- [ ] **Email verification flow** - Send verification emails for new registrations
- [ ] **Password reset functionality** - Implement forgot/reset password flow

### 🛢️ Database & Backend
- [x] **Set up database connection** - Configure PostgreSQL connection using Kysely ([db/connection.ts](db/connection.ts))
- [x] **Run initial migrations** - Execute Drizzle migrations to create tables ([db/migrations/0000_chief_venus.sql](db/migrations/0000_chief_venus.sql))
- [x] **Core tRPC routers** - Created essential API endpoints for calculations, emission factors, reports, and auth ([apps/web/server/api/routers/](apps/web/server/api/routers/))
  - [x] Authentication router - User registration, login, and profile management ([apps/web/server/api/routers/auth.ts](apps/web/server/api/routers/auth.ts))
  - [x] Calculations router - Emissions calculation operations ([apps/web/server/api/routers/calculations.ts](apps/web/server/api/routers/calculations.ts))
  - [x] Emission factors router - Standardized emission factors management ([apps/web/server/api/routers/emissionFactors.ts](apps/web/server/api/routers/emissionFactors.ts))
  - [x] Reports router - Report generation and management ([apps/web/server/api/routers/reports.ts](apps/web/server/api/routers/reports.ts))
- [x] **Add database integration to existing routers** - Connect calculations, emissionFactors, and reports routers to database ([apps/web/server/api/routers/calculations.ts](apps/web/server/api/routers/calculations.ts), [apps/web/server/api/routers/emissionFactors.ts](apps/web/server/api/routers/emissionFactors.ts), [apps/web/server/api/routers/reports.ts](apps/web/server/api/routers/reports.ts))
- [x] **Implement additional tRPC routers** - Create remaining API endpoints:
  - [x] Companies router (CRUD operations) ([apps/web/server/api/routers/companies.ts](apps/web/server/api/routers/companies.ts))
  - [x] Users router (user management) ([apps/web/server/api/routers/users.ts](apps/web/server/api/routers/users.ts))
  - [x] Audit log router (compliance tracking) ([apps/web/server/api/routers/auditLog.ts](apps/web/server/api/routers/auditLog.ts))
  - [x] Data import router (CSV/Excel processing) ([apps/web/server/api/routers/dataImport.ts](apps/web/server/api/routers/dataImport.ts))
- [x] **Add data validation middleware** - Implement Zod validation for all inputs ([apps/web/server/api/trpc.ts](apps/web/server/api/trpc.ts), [packages/core/src/types.ts](packages/core/src/types.ts))
- [x] **Create emission factors seeder** - Import standard emission factors from EPA/IPCC ([scripts/seed-emission-factors.ts](scripts/seed-emission-factors.ts))
- [ ] **Implement audit logging** - Track all data changes for GDPR compliance

### 📱 Core Application Pages
- [x] **Home page** - Landing page with features and call-to-action ([apps/web/app/page.tsx](apps/web/app/page.tsx))
- [x] **Login page** - User authentication form (UI only) ([apps/web/app/login/page.tsx](apps/web/app/login/page.tsx))
- [x] **Registration page** - User signup form (UI only) ([apps/web/app/register/page.tsx](apps/web/app/register/page.tsx))
- [x] **Calculator main page** - Scope selection interface ([apps/web/app/calculator/page.tsx](apps/web/app/calculator/page.tsx))
- [x] **Scope 1 calculator** - Complete multi-step calculator with validation ([apps/web/app/calculator/scope-1/page.tsx](apps/web/app/calculator/scope-1/page.tsx))
- [x] **Scope 2 calculator page** - Electricity, steam, heating/cooling calculator with FormWizard ([apps/web/app/calculator/scope-2/page.tsx](apps/web/app/calculator/scope-2/page.tsx))
- [x] **Scope 3 calculator page** - Business travel, commuting, waste, and transportation calculator with FormWizard ([apps/web/app/calculator/scope-3/page.tsx](apps/web/app/calculator/scope-3/page.tsx))
- [x] **Dashboard page** - Main overview with emission summaries, recent calculations, and quick actions ([apps/web/app/dashboard/page.tsx](apps/web/app/dashboard/page.tsx))
- [ ] **Reports listing page** (`/reports`) - Display all generated reports
- [ ] **Report detail page** (`/reports/[reportId]`) - View individual report with export options
- [ ] **Analytics page** (`/analytics`) - Trends, comparisons, and insights
- [ ] **Data import pages** (`/import`, `/import/energy`, `/import/fuel`) - CSV/Excel upload
- [ ] **Profile page** (`/profile`) - User settings and company information
- [ ] **Privacy center** (`/privacy-center`) - GDPR data management
- [ ] **Help page** (`/help`) - Documentation and FAQs
- [ ] **Admin dashboard** (`/admin`) - System administration
- [ ] **Admin audit log** (`/admin/audit-log`) - View all system changes
- [ ] **Admin users** (`/admin/users`) - User management
- [ ] **Admin emission factors** (`/admin/emission-factors`) - Factor management

### 🎨 UI Components (packages/ui)
- [x] **PublicLayout** - Layout for marketing and public pages ([packages/ui/src/layout/PublicLayout.tsx](packages/ui/src/layout/PublicLayout.tsx))
- [x] **DashboardLayout** - Layout for authenticated dashboard pages ([packages/ui/src/layout/DashboardLayout.tsx](packages/ui/src/layout/DashboardLayout.tsx))
- [x] **FormWizard** - Multi-step form component with validation ([packages/ui/src/form/FormWizard.tsx](packages/ui/src/form/FormWizard.tsx))
- [x] **FuelTypeSelector** - Comprehensive fuel selection component ([packages/ui/src/form/FuelTypeSelector.tsx](packages/ui/src/form/FuelTypeSelector.tsx))
- [x] **Responsive design** - Mobile-first approach with dark mode support ([apps/web/app/globals.css](apps/web/app/globals.css))
- [ ] **Form Components:**
  - [ ] EmissionInput - Standardized emission data input
  - [ ] DateRangePicker - Period selection for calculations
  - [ ] UnitConverter - Dynamic unit conversion widget
  - [ ] MultiStepForm - Enhanced form wizard for complex inputs
- [ ] **Display Components:**
  - [ ] EmissionCard - Display calculated emissions with context
  - [ ] DataTable - Sortable, filterable data tables
  - [ ] ChartContainer - Wrapper for TanStack Charts
  - [ ] AuditLogEntry - Display audit trail entries
  - [ ] ReportPreview - Preview reports before generation
- [ ] **Layout Components:**
  - [ ] AdminLayout - Layout for admin pages
  - [ ] Modal - Reusable modal dialog
  - [ ] Sidebar - Enhanced sidebar with dynamic navigation
  - [ ] Header - Responsive header with user actions
- [ ] **Utility Components:**
  - [ ] LoadingSpinner - Consistent loading indicators
  - [ ] ErrorBoundary - Error handling wrapper
  - [ ] ConfirmDialog - Confirmation dialogs for destructive actions
  - [ ] Tooltip - Accessible tooltips
  - [ ] LanguageToggle - Internationalization support

### 📊 Data Visualization & Analytics
- [ ] **Implement TanStack Charts** - Add charting library and components
- [ ] **Emissions overview charts** - Line charts for emission trends over time
- [ ] **Scope breakdown charts** - Pie/donut charts for scope distribution
- [ ] **Category comparison charts** - Bar charts comparing emission categories
- [ ] **Benchmark comparisons** - Compare against industry standards
- [ ] **Interactive dashboards** - Filterable, drilldown analytics

### 📄 Report Generation
- [x] **PDF report generation** - Implemented react-pdf for professional emission reports with comprehensive templates ([apps/web/app/reports/page.tsx](apps/web/app/reports/page.tsx), [apps/web/app/components/EmissionReportPDF.tsx](apps/web/app/components/EmissionReportPDF.tsx))
- [ ] **Report templates** - Create standardized report layouts
- [ ] **JSON export** - Structured data export for XBRL/APIs
- [ ] **CSV export** - Tabular data export for analysis
- [ ] **Email delivery** - Send reports via Resend integration
- [ ] **Report scheduling** - Automated report generation with node-cron

### 📁 Data Import/Export
- [ ] **CSV import processor** - Parse and validate energy/fuel data
- [ ] **Excel import support** - Handle .xlsx files with react-dropzone
- [ ] **Data mapping wizard** - Map imported columns to database fields
- [ ] **Import validation** - Real-time validation with error reporting
- [ ] **Bulk operations** - Import thousands of records efficiently
- [ ] **Data export tools** - Export user data for GDPR compliance

### 🔒 GDPR & Privacy Compliance
- [ ] **Consent management** - Track and manage user consent
- [ ] **Data anonymization** - Tools to anonymize sensitive data
- [ ] **Right to deletion** - Implement complete data removal
- [ ] **Data portability** - Export all user data in standard format
- [ ] **Privacy policy pages** - Detailed privacy and terms pages
- [ ] **Cookie consent** - GDPR-compliant cookie management
- [ ] **Data retention policies** - Automated data cleanup

### 🧪 Testing & Quality
- [ ] **Unit tests** - Test core calculation logic with Vitest
- [ ] **Integration tests** - Test API endpoints and database operations
- [ ] **E2E tests** - Test user flows with Playwright
- [ ] **Component tests** - Test React components in isolation
- [ ] **Load testing** - Ensure performance under high load
- [ ] **Accessibility testing** - WCAG 2.1 AA compliance validation

### 🚀 DevOps & Infrastructure
- [x] **ESLint configuration** - Code quality and consistency rules ([eslint.config.mjs](eslint.config.mjs))
- [x] **PostCSS setup** - CSS processing with Tailwind integration ([postcss.config.js](postcss.config.js))
- [x] **Package.json scripts** - Development, build, and start scripts ([apps/web/package.json](apps/web/package.json))
- [x] **Workspace configuration** - Proper monorepo package linking ([pnpm-workspace.yaml](pnpm-workspace.yaml))
- [ ] **GitHub Actions setup** - CI/CD pipeline configuration
- [ ] **Environment management** - Set up staging and production environments
- [ ] **Database migrations** - Automated migration pipeline
- [ ] **Code quality tools** - ESLint, Prettier, Husky integration
- [ ] **Security scanning** - Automated vulnerability scanning
- [ ] **Performance monitoring** - Application performance tracking
- [ ] **Error tracking** - Production error monitoring

### 📧 Email & Notifications
- [ ] **Resend integration** - Set up email service
- [ ] **Email templates** - HTML templates for various notifications
- [ ] **Welcome emails** - Onboarding email sequence
- [ ] **Report delivery** - Automated report email delivery
- [ ] **System notifications** - Important system alerts
- [ ] **Email preferences** - User-controlled notification settings

### 🌐 Accessibility & UX
- [ ] **Keyboard navigation** - Full keyboard accessibility
- [ ] **Screen reader support** - ARIA labels and semantic markup
- [ ] **High contrast mode** - Dark/light theme accessibility
- [ ] **Mobile optimization** - Touch-friendly 44px minimum targets
- [ ] **Progressive enhancement** - Works without JavaScript
- [ ] **Loading states** - Skeleton screens and progress indicators
- [ ] **Error handling** - User-friendly error messages
- [ ] **Form validation** - Real-time validation with clear feedback

### 🔧 Advanced Features
- [ ] **Emission factor auto-updates** - Sync latest factors from external sources
- [ ] **Multi-company support** - Enterprise features for multiple organizations
- [ ] **API integrations** - Connect with external accounting/ERP systems
- [ ] **Advanced calculations** - Uncertainty analysis and Monte Carlo simulations
- [ ] **Benchmarking** - Compare against industry peers
- [ ] **Carbon offset tracking** - Track offset purchases and retirements
- [ ] **Scope 3 expansion** - Full 15-category Scope 3 implementation

### 🏗️ Project Foundation
- [x] **Monorepo setup** - pnpm workspace with apps/web, packages/core, packages/ui ([pnpm-workspace.yaml](pnpm-workspace.yaml))
- [x] **TypeScript configuration** - Strict TypeScript setup across all packages ([tsconfig.json](tsconfig.json))
- [x] **Next.js App Router** - Modern React framework with app directory structure ([next.config.ts](next.config.ts))
- [x] **TailwindCSS setup** - Utility-first CSS framework configuration ([apps/web/tailwind.config.js](apps/web/tailwind.config.js))
- [x] **Package structure** - Proper separation of concerns between packages ([apps/](apps/))

### 🗄️ Database Schema
- [x] **Complete database schema** - All tables designed with Drizzle ORM ([db/schema.ts](db/schema.ts))
- [x] **User management tables** - Users, companies, roles with GDPR fields ([db/schema.ts](db/schema.ts))
- [x] **Emission calculation tables** - Calculations, factors, audit trails ([db/schema.ts](db/schema.ts))
- [x] **Report generation tables** - Reports with multiple format support ([db/schema.ts](db/schema.ts))
- [x] **Data import tables** - Import sessions and error tracking ([db/schema.ts](db/schema.ts))
- [x] **Audit logging table** - Complete audit trail for compliance ([db/schema.ts](db/schema.ts))
- [x] **Proper relationships** - Foreign keys and relations properly defined ([db/schema.ts](db/schema.ts))

### ⚙️ Core Calculation Engine
- [x] **EmissionCalculator class** - Full-featured calculation engine ([packages/core/src/calculator.ts](packages/core/src/calculator.ts))
- [x] **Scope 1, 2, 3 support** - All emission scopes implemented ([packages/core/src/calculator.ts](packages/core/src/calculator.ts))
- [x] **Emission factor management** - Factor loading and retrieval ([packages/core/src/calculator.ts](packages/core/src/calculator.ts))
- [x] **Unit conversion system** - Automatic unit conversion between compatible units ([packages/core/src/utils/unitConversion.ts](packages/core/src/utils/unitConversion.ts))
- [x] **Uncertainty calculations** - Range calculations for emission estimates ([packages/core/src/calculator.ts](packages/core/src/calculator.ts))
- [x] **Batch processing** - Calculate multiple inputs efficiently ([packages/core/src/calculator.ts](packages/core/src/calculator.ts))
- [x] **Error handling** - Robust error handling with detailed messages ([packages/core/src/calculator.ts](packages/core/src/calculator.ts))
- [x] **Validation system** - Input validation with Zod schemas ([packages/core/src/types.ts](packages/core/src/types.ts))

### 🔷 Type System & Validation
- [x] **Zod schemas** - Complete type definitions for all data structures ([packages/core/src/types.ts](packages/core/src/types.ts))
- [x] **TypeScript types** - Type-safe development across the entire codebase ([packages/core/src/types.ts](packages/core/src/types.ts))
- [x] **Validation helpers** - Reusable validation functions ([packages/core/src/types.ts](packages/core/src/types.ts))
- [x] **Enum definitions** - Proper enums for scopes, categories, statuses ([packages/core/src/types.ts](packages/core/src/types.ts))
- [x] **Unit type system** - Comprehensive unit conversion type definitions ([packages/core/src/types.ts](packages/core/src/types.ts))

### 🎨 Styling & Design System
- [x] **Dark mode support** - Complete dark/light theme implementation ([apps/web/app/globals.css](apps/web/app/globals.css))
- [x] **Consistent color palette** - Emerald-based theme with proper contrast ([apps/web/tailwind.config.js](apps/web/tailwind.config.js))
- [x] **Typography system** - Consistent text sizing and hierarchy ([apps/web/app/globals.css](apps/web/app/globals.css))
- [x] **Component styling** - Reusable styling patterns and utilities ([packages/ui/src/](packages/ui/src/))
- [x] **Responsive breakpoints** - Mobile, tablet, desktop breakpoints ([apps/web/tailwind.config.js](apps/web/tailwind.config.js))

### 🔗 tRPC Infrastructure
- [x] **tRPC setup** - Server and client configuration ([apps/web/server/api/trpc.ts](apps/web/server/api/trpc.ts))
- [x] **Router structure** - Organized API route structure ([apps/web/server/api/root.ts](apps/web/server/api/root.ts))
- [x] **Type safety** - End-to-end type safety between frontend and backend ([apps/web/server/api/](apps/web/server/api/))
- [x] **Superjson integration** - Serialization for complex data types ([apps/web/server/api/trpc.ts](apps/web/server/api/trpc.ts))

---

## Status Summary
- **Total Tasks Identified**: 125 tasks
- **Completion Percentage**: 39% (49/125 completed)
- **Next Priority**: Implement audit logging - Track all data changes for GDPR compliance
- **Critical Path**: Audit logging → Testing integration → Email system

## DONE - Recently Completed

### 🛢️ Database & Backend
- [x] **Create emission factors seeder** - Implemented comprehensive seeder script importing EPA 2025 GHG Emission Factors Hub and IPCC AR5 standard emission factors ([scripts/seed-emission-factors.ts](scripts/seed-emission-factors.ts))
  - ✅ EPA 2025 stationary combustion factors (natural gas, coal types, petroleum products)
  - ✅ EPA 2025 mobile combustion factors (gasoline, diesel, aviation fuels, alternative fuels)  
  - ✅ EPA eGRID 2022 electricity emission factors (US average and regional factors)
  - ✅ Steam and district heating factors for Scope 2 emissions
  - ✅ Business travel factors for Scope 3 (air travel, ground transportation)
  - ✅ Employee commuting factors for Scope 3 calculations
  - ✅ Freight transportation factors (truck, rail, waterborne, air freight)
  - ✅ Waste generation factors from EPA WARM model
  - ✅ International factors for global operations (EU, UK, Canada, Australia)
  - ✅ Batch insertion with progress tracking and comprehensive verification
  - ✅ Full TypeScript implementation with proper error handling
  - ✅ Ready-to-use script: `pnpm run seed-emission-factors`

- [x] **Add data validation middleware** - Implemented comprehensive Zod validation for all inputs with authentication middleware, rate limiting, input sanitization, and role-based access control ([apps/web/server/api/trpc.ts](apps/web/server/api/trpc.ts), [packages/core/src/types.ts](packages/core/src/types.ts))
  - ✅ Enhanced validation middleware with XSS protection and input sanitization
  - ✅ Rate limiting protection (100 requests per minute per user)
  - ✅ Authentication middleware with database user verification
  - ✅ Role-based access control (public, protected, admin, company procedures)
  - ✅ Company-level data access enforcement
  - ✅ Comprehensive API validation schemas for all major entities
  - ✅ Updated calculations router with enhanced security and validation
  - ✅ Audit logging integration for all sensitive operations

This task tracker should be updated regularly as features are completed and new requirements are identified. 