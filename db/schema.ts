import { pgTable, uuid, varchar, text, timestamp, decimal, integer, jsonb, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const emissionScopeEnum = pgEnum('emission_scope', ['scope_1', 'scope_2', 'scope_3']);
export const calculationStatusEnum = pgEnum('calculation_status', ['pending', 'completed', 'error']);
export const reportFormatEnum = pgEnum('report_format', ['pdf', 'json', 'csv']);
export const auditActionEnum = pgEnum('audit_action', ['create', 'update', 'delete', 'export', 'login', 'logout']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  emailVerified: timestamp('email_verified'),
  image: text('image'),
  passwordHash: text('password_hash'), // for credentials authentication
  companyId: uuid('company_id').references(() => companies.id),
  role: varchar('role', { length: 50 }).notNull().default('user'), // user, admin, company_admin
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  // GDPR fields
  gdprConsent: boolean('gdpr_consent').notNull().default(false),
  gdprConsentDate: timestamp('gdpr_consent_date'),
  dataRetentionOptOut: boolean('data_retention_opt_out').notNull().default(false),
});

// Auth.js required tables
export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: varchar('token_type', { length: 255 }),
  scope: varchar('scope', { length: 255 }),
  id_token: text('id_token'),
  session_state: varchar('session_state', { length: 255 }),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  expires: timestamp('expires').notNull(),
});

export const verificationTokens = pgTable('verification_tokens', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expires: timestamp('expires').notNull(),
});

// Companies table
export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  industryType: varchar('industry_type', { length: 100 }),
  country: varchar('country', { length: 100 }),
  employeeCount: integer('employee_count'),
  annualRevenue: decimal('annual_revenue', { precision: 15, scale: 2 }),
  reportingYear: integer('reporting_year'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Emission factors table (for standardized calculations)
export const emissionFactors = pgTable('emission_factors', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: varchar('category', { length: 100 }).notNull(), // fuel_type, electricity_grid, etc.
  subcategory: varchar('subcategory', { length: 100 }), // natural_gas, coal, solar, etc.
  factor: decimal('factor', { precision: 15, scale: 8 }).notNull(), // CO2e per unit
  unit: varchar('unit', { length: 50 }).notNull(), // kg, MWh, liters, etc.
  source: varchar('source', { length: 255 }).notNull(), // EPA, IPCC, etc.
  region: varchar('region', { length: 100 }), // US, EU, Global, etc.
  year: integer('year').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Emissions calculations table
export const emissionsCalculations = pgTable('emissions_calculations', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  scope: emissionScopeEnum('scope').notNull(),
  category: varchar('category', { length: 100 }).notNull(), // stationary_combustion, mobile_combustion, etc.
  subcategory: varchar('subcategory', { length: 100 }), // natural_gas, diesel, electricity, etc.
  activityData: decimal('activity_data', { precision: 15, scale: 4 }).notNull(), // consumption amount
  activityUnit: varchar('activity_unit', { length: 50 }).notNull(), // kWh, liters, kg, etc.
  emissionFactorId: uuid('emission_factor_id').references(() => emissionFactors.id),
  customEmissionFactor: decimal('custom_emission_factor', { precision: 15, scale: 8 }), // if using custom factor
  calculatedEmissions: decimal('calculated_emissions', { precision: 15, scale: 4 }).notNull(), // total CO2e
  calculationDate: timestamp('calculation_date').notNull(),
  reportingPeriodStart: timestamp('reporting_period_start').notNull(),
  reportingPeriodEnd: timestamp('reporting_period_end').notNull(),
  status: calculationStatusEnum('status').notNull().default('pending'),
  metadata: jsonb('metadata'), // additional calculation details, formulas used, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Reports table
export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  format: reportFormatEnum('format').notNull(),
  scope1Total: decimal('scope_1_total', { precision: 15, scale: 4 }),
  scope2Total: decimal('scope_2_total', { precision: 15, scale: 4 }),
  scope3Total: decimal('scope_3_total', { precision: 15, scale: 4 }),
  totalEmissions: decimal('total_emissions', { precision: 15, scale: 4 }).notNull(),
  reportingPeriodStart: timestamp('reporting_period_start').notNull(),
  reportingPeriodEnd: timestamp('reporting_period_end').notNull(),
  generatedAt: timestamp('generated_at').defaultNow().notNull(),
  filePath: text('file_path'), // for PDF/file storage
  reportData: jsonb('report_data'), // structured data for JSON exports
  isPublic: boolean('is_public').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Audit log table (for GDPR compliance and security)
export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: auditActionEnum('action').notNull(),
  resourceType: varchar('resource_type', { length: 100 }).notNull(), // user, company, calculation, report, etc.
  resourceId: uuid('resource_id'),
  details: jsonb('details'), // action-specific details
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Data import sessions (for CSV/Excel imports)
export const dataImports = pgTable('data_imports', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileSize: integer('file_size'),
  importType: varchar('import_type', { length: 100 }).notNull(), // energy_data, fuel_data, emission_factors
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, processing, completed, error
  recordsProcessed: integer('records_processed').default(0),
  recordsTotal: integer('records_total'),
  errors: jsonb('errors'), // validation and processing errors
  metadata: jsonb('metadata'), // import configuration, mappings, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  calculations: many(emissionsCalculations),
  reports: many(reports),
  dataImports: many(dataImports),
  auditLogs: many(auditLog),
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  calculations: many(emissionsCalculations),
  reports: many(reports),
  dataImports: many(dataImports),
}));

export const emissionFactorsRelations = relations(emissionFactors, ({ many }) => ({
  calculations: many(emissionsCalculations),
}));

export const emissionsCalculationsRelations = relations(emissionsCalculations, ({ one }) => ({
  company: one(companies, {
    fields: [emissionsCalculations.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [emissionsCalculations.userId],
    references: [users.id],
  }),
  emissionFactor: one(emissionFactors, {
    fields: [emissionsCalculations.emissionFactorId],
    references: [emissionFactors.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  company: one(companies, {
    fields: [reports.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
}));

export const dataImportsRelations = relations(dataImports, ({ one }) => ({
  company: one(companies, {
    fields: [dataImports.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [dataImports.userId],
    references: [users.id],
  }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(users, {
    fields: [auditLog.userId],
    references: [users.id],
  }),
}));

// Auth.js table relations
export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
})); 