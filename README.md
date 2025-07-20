# CO2 Emission Calculator

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/kirchhoffing/co2-emission-calculator/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.3+-black.svg)](https://nextjs.org/)

A comprehensive full-stack TypeScript web application for businesses to calculate and report CO2 emissions across **Scope 1, 2, and Scope 3** categories. Built with modern technologies for accuracy, compliance, and scalability.

## 🌟 Features

- **Complete Emission Calculation**: Full support for Scope 1 (direct), Scope 2 (purchased energy), and Scope 3 (value chain) emissions
- **User Authentication**: Secure authentication with Auth.js and role-based access control
- **Multi-step Calculators**: Intuitive FormWizard interface for complex emission calculations
- **Professional Reports**: PDF report generation with comprehensive emission breakdowns
- **GDPR Compliance**: Complete data protection with export, deletion, and audit logging
- **Real-time Validation**: Input validation with immediate feedback and error handling
- **Responsive Design**: Mobile-first UI with dark/light theme support
- **Modular Architecture**: Monorepo structure with shared components and logic

## 🛠 Tech Stack

### Frontend
- **Next.js 15.3+** (App Router) - React framework with modern routing
- **TailwindCSS 4.x** - Utility-first CSS framework with custom design system
- **TanStack Form** - Type-safe form handling with validation
- **TanStack Charts** - Interactive data visualization
- **React PDF** - Professional PDF report generation

### Backend  
- **tRPC 11.x** - End-to-end type-safe API with React Query integration
- **Drizzle ORM** - Type-safe database operations and migrations
- **Zod** - Runtime type validation and schema parsing
- **Auth.js** - Secure authentication with multiple providers
- **Node-cron** - Scheduled tasks for data processing

### Database & Infrastructure
- **PostgreSQL** - Primary database with ACID compliance
- **Drizzle Kit** - Database migrations and schema management
- **pnpm** - Fast, space-efficient package manager
- **TypeScript 5.0+** - Strict type safety across the entire stack

### Development & Testing
- **Vitest** - Fast unit and integration testing
- **Playwright** - End-to-end testing framework
- **ESLint & Prettier** - Code quality and formatting
- **Husky** - Git hooks for quality assurance

### Email & File Handling
- **Resend** - Transactional email service
- **UploadThing** - File upload and processing
- **React Dropzone** - Drag-and-drop file handling

## 📁 Project Structure

```
co2-emission-calculator/
├── apps/web/                 # Next.js frontend application
│   ├── app/                  # App Router pages and API routes
│   ├── server/api/           # tRPC routers and middleware
│   └── middleware.ts         # Authentication middleware
├── packages/
│   ├── core/                 # Shared calculation logic and types
│   └── ui/                   # Reusable UI components
├── db/                       # Database schema and migrations
├── scripts/                  # Utility scripts (emission factor imports)
├── tests/                    # Test suites (Vitest & Playwright)
└── docs/                     # Documentation and task tracking
```

## 📊 Current Status

- **Total Tasks**: 125 identified
- **Completion**: 38% (48/125 completed)
- **Version**: 1.0.0 (Development)
- **Next Priorities**: Emission factors seeder, testing integration, email system

See [`docs/TODO.md`](docs/TODO.md) for detailed task tracking and [`docs/OVERVIEW.md`](docs/OVERVIEW.md) for architecture guidelines.

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+** and **pnpm 8+**
- **PostgreSQL 14+** database
- **Git** for version control

### Environment Setup

1. **Clone the repository**
   ```powershell
   git clone https://github.com/your-org/co2-emission-calculator.git
   cd co2-emission-calculator
   ```

2. **Install dependencies**
   ```powershell
   pnpm install
   ```

3. **Environment Configuration**
   
   Create a `.env.local` file in the `apps/web` directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/co2_calculator_dev"
   
   # Authentication
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Environment
   NODE_ENV="development"
   
   # Optional: Email service
   RESEND_API_KEY="your-resend-api-key"
   
   # Optional: File uploads
   UPLOADTHING_SECRET="your-uploadthing-secret"
   UPLOADTHING_APP_ID="your-uploadthing-app-id"
   ```

### Database Setup

1. **Create the database**
   ```powershell
   createdb co2_calculator_dev
   ```

2. **Run migrations**
   ```powershell
   cd db
   pnpm generate
   pnpm migrate
   ```

3. **Optional: Seed emission factors**
   ```powershell
   # Once implemented
   pnpm seed:emission-factors
   ```

### Development Server

```powershell
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🌐 Application Routes

### Public Routes
- `/` - Landing page with features overview
- `/login` - User authentication
- `/register` - User registration with GDPR consent
- `/privacy` - Privacy policy and GDPR information
- `/terms` - Terms of service

### Protected Routes  
- `/dashboard` - Main emission summary and recent activities
- `/calculator` - Scope selection interface
- `/calculator/scope-1` - Direct emissions calculator
- `/calculator/scope-2` - Purchased energy emissions calculator  
- `/calculator/scope-3` - Value chain emissions calculator
- `/reports` - Generated emission reports
- `/analytics` - Emission trends and comparisons
- `/profile` - User settings and preferences
- `/privacy-center` - GDPR data management

### Admin Routes
- `/admin` - System administration dashboard
- `/admin/users` - User management
- `/admin/audit-log` - System audit trail
- `/admin/emission-factors` - Emission factor database management

### Code Quality Standards

- **TypeScript**: Strict mode enabled, no `any` types
- **ESLint**: Next.js and TypeScript recommended rules
- **Prettier**: Automatic code formatting with Tailwind plugin
- **Husky**: Pre-commit hooks for linting and testing
- **Testing**: Minimum 80% code coverage for new features

### Pull Request Guidelines
- Use descriptive titles and clear descriptions
- Reference related issues with `Fixes #123`
- Include screenshots for UI changes
- Ensure all tests pass and maintain coverage
- Request review from at least one maintainer

## 🔒 Security & Compliance

- **GDPR Compliant**: Complete data protection implementation
- **Role-based Access**: User, company admin, and system admin roles
- **Audit Logging**: All data changes tracked with timestamps
- **Input Validation**: Comprehensive XSS and injection protection
- **Rate Limiting**: API protection against abuse
- **Secure Authentication**: bcrypt password hashing and secure sessions

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

**Built with ❤️ for sustainable business practices and environmental compliance.**
