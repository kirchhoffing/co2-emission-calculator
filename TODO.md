# Project Task Tracker: CO2 Emission Calculator

## TODO

### 🔐 Authentication & Authorization
- [ ] **Implement Auth.js integration** - Set up authentication providers and session management
- [ ] **Create auth middleware** - Protect dashboard and calculator routes
- [ ] **Add role-based access control** - Implement user, admin, company_admin roles
- [ ] **Email verification flow** - Send verification emails for new registrations
- [ ] **Password reset functionality** - Implement forgot/reset password flow
- [ ] **Session management** - Handle login/logout with proper token management

### 🛢️ Database & Backend
- [ ] **Set up database connection** - Configure PostgreSQL connection using Kysely
- [ ] **Run initial migrations** - Execute Drizzle migrations to create tables
- [ ] **Implement tRPC routers** - Create missing API endpoints:
  - [ ] Authentication router (login, register, profile)
  - [ ] Companies router (CRUD operations)
  - [ ] Users router (user management)
  - [ ] Audit log router (compliance tracking)
  - [ ] Data import router (CSV/Excel processing)
- [ ] **Add data validation middleware** - Implement Zod validation for all inputs
- [ ] **Create emission factors seeder** - Import standard emission factors from EPA/IPCC
- [ ] **Implement audit logging** - Track all data changes for GDPR compliance

### 📱 Core Application Pages
- [ ] **Dashboard page** (`/dashboard`) - Main overview with charts and recent calculations
- [ ] **Scope 2 calculator page** (`/calculator/scope-2`) - Electricity, steam, heating/cooling
- [ ] **Scope 3 calculator page** (`/calculator/scope-3`) - Business travel, commuting, waste
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
- [ ] **PDF report generation** - Implement react-pdf for PDF creation
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

## DONE

### ✅ Project Foundation
- [x] **Monorepo setup** - pnpm workspace with apps/web, packages/core, packages/ui ([pnpm-workspace.yaml](pnpm-workspace.yaml))
- [x] **TypeScript configuration** - Strict TypeScript setup across all packages ([tsconfig.json](tsconfig.json))
- [x] **Next.js App Router** - Modern React framework with app directory structure ([next.config.ts](next.config.ts))
- [x] **TailwindCSS setup** - Utility-first CSS framework configuration ([apps/web/tailwind.config.js](apps/web/tailwind.config.js))
- [x] **Package structure** - Proper separation of concerns between packages ([apps/](apps/))

### ✅ Database Schema
- [x] **Complete database schema** - All tables designed with Drizzle ORM ([db/schema.ts](db/schema.ts))
- [x] **User management tables** - Users, companies, roles with GDPR fields ([db/schema.ts](db/schema.ts))
- [x] **Emission calculation tables** - Calculations, factors, audit trails ([db/schema.ts](db/schema.ts))
- [x] **Report generation tables** - Reports with multiple format support ([db/schema.ts](db/schema.ts))
- [x] **Data import tables** - Import sessions and error tracking ([db/schema.ts](db/schema.ts))
- [x] **Audit logging table** - Complete audit trail for compliance ([db/schema.ts](db/schema.ts))
- [x] **Proper relationships** - Foreign keys and relations properly defined ([db/schema.ts](db/schema.ts))

### ✅ Core Calculation Engine
- [x] **EmissionCalculator class** - Full-featured calculation engine ([packages/core/src/calculator.ts](packages/core/src/calculator.ts))
- [x] **Scope 1, 2, 3 support** - All emission scopes implemented ([packages/core/src/calculator.ts](packages/core/src/calculator.ts))
- [x] **Emission factor management** - Factor loading and retrieval ([packages/core/src/calculator.ts](packages/core/src/calculator.ts))
- [x] **Unit conversion system** - Automatic unit conversion between compatible units ([packages/core/src/utils/unitConversion.ts](packages/core/src/utils/unitConversion.ts))
- [x] **Uncertainty calculations** - Range calculations for emission estimates ([packages/core/src/calculator.ts](packages/core/src/calculator.ts))
- [x] **Batch processing** - Calculate multiple inputs efficiently ([packages/core/src/calculator.ts](packages/core/src/calculator.ts))
- [x] **Error handling** - Robust error handling with detailed messages ([packages/core/src/calculator.ts](packages/core/src/calculator.ts))
- [x] **Validation system** - Input validation with Zod schemas ([packages/core/src/types.ts](packages/core/src/types.ts))

### ✅ Type System & Validation
- [x] **Zod schemas** - Complete type definitions for all data structures ([packages/core/src/types.ts](packages/core/src/types.ts))
- [x] **TypeScript types** - Type-safe development across the entire codebase ([packages/core/src/types.ts](packages/core/src/types.ts))
- [x] **Validation helpers** - Reusable validation functions ([packages/core/src/types.ts](packages/core/src/types.ts))
- [x] **Enum definitions** - Proper enums for scopes, categories, statuses ([packages/core/src/types.ts](packages/core/src/types.ts))
- [x] **Unit type system** - Comprehensive unit conversion type definitions ([packages/core/src/types.ts](packages/core/src/types.ts))

### ✅ UI Component Foundation
- [x] **PublicLayout** - Layout for marketing and public pages ([packages/ui/src/layout/PublicLayout.tsx](packages/ui/src/layout/PublicLayout.tsx))
- [x] **DashboardLayout** - Layout for authenticated dashboard pages ([packages/ui/src/layout/DashboardLayout.tsx](packages/ui/src/layout/DashboardLayout.tsx))
- [x] **FormWizard** - Multi-step form component with validation ([packages/ui/src/form/FormWizard.tsx](packages/ui/src/form/FormWizard.tsx))
- [x] **FuelTypeSelector** - Comprehensive fuel selection component ([packages/ui/src/form/FuelTypeSelector.tsx](packages/ui/src/form/FuelTypeSelector.tsx))
- [x] **Responsive design** - Mobile-first approach with dark mode support ([apps/web/app/globals.css](apps/web/app/globals.css))

### ✅ Basic Application Pages
- [x] **Home page** - Landing page with features and call-to-action ([apps/web/app/page.tsx](apps/web/app/page.tsx))
- [x] **Login page** - User authentication form (UI only) ([apps/web/app/login/page.tsx](apps/web/app/login/page.tsx))
- [x] **Registration page** - User signup form (UI only) ([apps/web/app/register/page.tsx](apps/web/app/register/page.tsx))
- [x] **Calculator main page** - Scope selection interface ([apps/web/app/calculator/page.tsx](apps/web/app/calculator/page.tsx))
- [x] **Scope 1 calculator** - Complete multi-step calculator with validation ([apps/web/app/calculator/scope-1/page.tsx](apps/web/app/calculator/scope-1/page.tsx))

### ✅ Styling & Design System
- [x] **Dark mode support** - Complete dark/light theme implementation ([apps/web/app/globals.css](apps/web/app/globals.css))
- [x] **Consistent color palette** - Emerald-based theme with proper contrast ([apps/web/tailwind.config.js](apps/web/tailwind.config.js))
- [x] **Typography system** - Consistent text sizing and hierarchy ([apps/web/app/globals.css](apps/web/app/globals.css))
- [x] **Component styling** - Reusable styling patterns and utilities ([packages/ui/src/](packages/ui/src/))
- [x] **Responsive breakpoints** - Mobile, tablet, desktop breakpoints ([apps/web/tailwind.config.js](apps/web/tailwind.config.js))

### ✅ tRPC Infrastructure
- [x] **tRPC setup** - Server and client configuration ([apps/web/server/api/trpc.ts](apps/web/server/api/trpc.ts))
- [x] **Router structure** - Organized API route structure ([apps/web/server/api/root.ts](apps/web/server/api/root.ts))
- [x] **Type safety** - End-to-end type safety between frontend and backend ([apps/web/server/api/](apps/web/server/api/))
- [x] **Superjson integration** - Serialization for complex data types ([apps/web/server/api/trpc.ts](apps/web/server/api/trpc.ts))

### ✅ Development Tools
- [x] **ESLint configuration** - Code quality and consistency rules ([eslint.config.mjs](eslint.config.mjs))
- [x] **PostCSS setup** - CSS processing with Tailwind integration ([postcss.config.js](postcss.config.js))
- [x] **Package.json scripts** - Development, build, and start scripts ([apps/web/package.json](apps/web/package.json))
- [x] **Workspace configuration** - Proper monorepo package linking ([pnpm-workspace.yaml](pnpm-workspace.yaml))

---

## Status Summary
- **Total Tasks Identified**: 89 TODO + 32 DONE = 121 tasks
- **Completion Percentage**: 26% (32/121)
- **Next Priority**: Authentication system and database connection
- **Critical Path**: Auth → Database → API routes → Dashboard → Reports

This task tracker should be updated regularly as features are completed and new requirements are identified. 