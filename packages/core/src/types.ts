import { z } from 'zod';

// Enums for emission categories
export const EmissionScope = z.enum(['scope_1', 'scope_2', 'scope_3']);
export const EmissionCategory = z.enum([
  'stationary_combustion',
  'mobile_combustion', 
  'process_emissions',
  'fugitive_emissions',
  'purchased_electricity',
  'purchased_steam',
  'purchased_heating',
  'purchased_cooling',
  'business_travel',
  'employee_commuting',
  'waste_generated',
  'upstream_transportation',
  'downstream_transportation'
]);

export const CalculationStatus = z.enum(['pending', 'completed', 'error']);
export const ReportFormat = z.enum(['pdf', 'json', 'csv']);

// Base emission factor schema
export const EmissionFactorSchema = z.object({
  id: z.string(),
  category: EmissionCategory,
  subcategory: z.string(),
  factor: z.number().positive(), // kg CO2e per unit
  unit: z.string(),
  source: z.string(), // EPA, IPCC, etc.
  region: z.string().optional(), // US, EU, Global, etc.
  year: z.number().int().min(2000).max(2030),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
});

// Activity data input schema
export const ActivityDataSchema = z.object({
  amount: z.number().positive(),
  unit: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  description: z.string().optional(),
});

// Calculation input schema
export const CalculationInputSchema = z.object({
  scope: EmissionScope,
  category: EmissionCategory,
  subcategory: z.string(),
  activityData: ActivityDataSchema,
  emissionFactorId: z.string().optional(),
  customEmissionFactor: z.number().positive().optional(),
  metadata: z.record(z.any()).optional(),
});

// Calculation result schema
export const CalculationResultSchema = z.object({
  id: z.string(),
  input: CalculationInputSchema,
  emissionFactor: EmissionFactorSchema.optional(),
  calculatedEmissions: z.number(), // total CO2e in kg
  calculationMethod: z.string(),
  uncertaintyRange: z.object({
    min: z.number(),
    max: z.number(),
  }).optional(),
  calculatedAt: z.date(),
  status: CalculationStatus,
  errors: z.array(z.string()).optional(),
});

// Report schema
export const ReportSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  companyId: z.string(),
  reportingPeriod: z.object({
    start: z.date(),
    end: z.date(),
  }),
  scope1Total: z.number().optional(),
  scope2Total: z.number().optional(), 
  scope3Total: z.number().optional(),
  totalEmissions: z.number(),
  calculations: z.array(CalculationResultSchema),
  format: ReportFormat,
  generatedAt: z.date(),
  metadata: z.record(z.any()).optional(),
});

// TypeScript types from Zod schemas
export type EmissionScope = z.infer<typeof EmissionScope>;
export type EmissionCategory = z.infer<typeof EmissionCategory>;
export type CalculationStatus = z.infer<typeof CalculationStatus>;
export type ReportFormat = z.infer<typeof ReportFormat>;
export type EmissionFactor = z.infer<typeof EmissionFactorSchema>;
export type ActivityData = z.infer<typeof ActivityDataSchema>;
export type CalculationInput = z.infer<typeof CalculationInputSchema>;
export type CalculationResult = z.infer<typeof CalculationResultSchema>;
export type Report = z.infer<typeof ReportSchema>;

// Unit conversion types
export const UnitConversionSchema = z.object({
  fromUnit: z.string(),
  toUnit: z.string(),
  factor: z.number().positive(),
});

export type UnitConversion = z.infer<typeof UnitConversionSchema>;

// Common unit mappings
export const COMMON_UNITS = {
  energy: ['kWh', 'MWh', 'GWh', 'GJ', 'MJ', 'BTU', 'therms'],
  volume: ['L', 'gal', 'm³', 'ft³'],
  mass: ['kg', 'tonnes', 'lbs', 'short_tons', 'long_tons'],
  distance: ['km', 'miles', 'nautical_miles'],
} as const;

// Enhanced API-specific validation schemas
export const ApiValidationSchemas = {
  // User authentication and registration
  userRegistration: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters')
      .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name contains invalid characters'),
    email: z.string()
      .email('Please enter a valid email address')
      .max(255, 'Email must be less than 255 characters')
      .toLowerCase(),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
             'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    companyName: z.string()
      .min(2, 'Company name must be at least 2 characters')
      .max(200, 'Company name must be less than 200 characters')
      .optional(),
    gdprConsent: z.boolean().refine(val => val === true, {
      message: 'GDPR consent is required to create an account'
    }),
  }),

  userLogin: z.object({
    email: z.string().email('Please enter a valid email address').toLowerCase(),
    password: z.string().min(1, 'Password is required'),
  }),

  // Company validation
  companyCreate: z.object({
    name: z.string()
      .min(2, 'Company name must be at least 2 characters')
      .max(200, 'Company name must be less than 200 characters'),
    industry: z.string()
      .min(2, 'Industry must be at least 2 characters')
      .max(100, 'Industry must be less than 100 characters')
      .optional(),
    country: z.string()
      .length(2, 'Country must be a 2-character ISO code')
      .toUpperCase()
      .optional(),
    employees: z.number()
      .int('Employee count must be a whole number')
      .min(1, 'Employee count must be at least 1')
      .max(1000000, 'Employee count must be reasonable')
      .optional(),
    website: z.string()
      .url('Please enter a valid website URL')
      .optional()
      .or(z.literal('')),
  }),

  // Calculation validation
  calculationCreate: z.object({
    companyId: z.string().uuid('Invalid company ID'),
    scope: EmissionScope,
    category: EmissionCategory,
    subcategory: z.string()
      .min(1, 'Subcategory is required')
      .max(100, 'Subcategory must be less than 100 characters'),
    activityData: z.number()
      .positive('Activity data must be positive')
      .finite('Activity data must be a valid number'),
    activityUnit: z.string()
      .min(1, 'Activity unit is required')
      .max(50, 'Activity unit must be less than 50 characters'),
    emissionFactorId: z.string().uuid('Invalid emission factor ID').optional(),
    customEmissionFactor: z.number()
      .positive('Custom emission factor must be positive')
      .finite('Custom emission factor must be a valid number')
      .optional(),
    reportingPeriodStart: z.date(),
    reportingPeriodEnd: z.date(),
    description: z.string()
      .max(500, 'Description must be less than 500 characters')
      .optional(),
  }).refine(
    (data) => data.reportingPeriodStart <= data.reportingPeriodEnd,
    {
      message: 'Reporting period start must be before end date',
      path: ['reportingPeriodEnd'],
    }
  ).refine(
    (data) => data.emissionFactorId || data.customEmissionFactor,
    {
      message: 'Either emission factor ID or custom emission factor is required',
      path: ['emissionFactorId'],
    }
  ),

  // Report validation
  reportCreate: z.object({
    companyId: z.string().uuid('Invalid company ID'),
    title: z.string()
      .min(1, 'Report title is required')
      .max(200, 'Report title must be less than 200 characters'),
    description: z.string()
      .max(1000, 'Report description must be less than 1000 characters')
      .optional(),
    reportingPeriodStart: z.date(),
    reportingPeriodEnd: z.date(),
    format: ReportFormat,
    includeScopes: z.object({
      scope1: z.boolean().default(true),
      scope2: z.boolean().default(true),
      scope3: z.boolean().default(true),
    }),
    calculationIds: z.array(z.string().uuid('Invalid calculation ID'))
      .min(1, 'At least one calculation must be included'),
  }).refine(
    (data) => data.reportingPeriodStart <= data.reportingPeriodEnd,
    {
      message: 'Reporting period start must be before end date',
      path: ['reportingPeriodEnd'],
    }
  ),

  // Emission factor validation
  emissionFactorCreate: z.object({
    category: EmissionCategory,
    subcategory: z.string()
      .min(1, 'Subcategory is required')
      .max(100, 'Subcategory must be less than 100 characters'),
    factor: z.number()
      .positive('Emission factor must be positive')
      .finite('Emission factor must be a valid number'),
    unit: z.string()
      .min(1, 'Unit is required')
      .max(50, 'Unit must be less than 50 characters'),
    source: z.string()
      .min(1, 'Source is required')
      .max(100, 'Source must be less than 100 characters'),
    region: z.string()
      .max(50, 'Region must be less than 50 characters')
      .optional(),
    year: z.number()
      .int('Year must be a whole number')
      .min(2000, 'Year must be 2000 or later')
      .max(new Date().getFullYear() + 2, 'Year cannot be more than 2 years in the future'),
    description: z.string()
      .max(500, 'Description must be less than 500 characters')
      .optional(),
  }),

  // Data import validation
  dataImportCreate: z.object({
    companyId: z.string().uuid('Invalid company ID'),
    importType: z.enum(['energy', 'fuel', 'travel', 'waste'], {
      errorMap: () => ({ message: 'Import type must be energy, fuel, travel, or waste' })
    }),
    fileName: z.string()
      .min(1, 'File name is required')
      .max(255, 'File name must be less than 255 characters'),
    fileSize: z.number()
      .int('File size must be a whole number')
      .min(1, 'File size must be at least 1 byte')
      .max(50 * 1024 * 1024, 'File size must be less than 50MB'), // 50MB limit
    mappingConfig: z.record(z.string(), z.string())
      .refine(config => Object.keys(config).length > 0, {
        message: 'At least one column mapping is required'
      }),
  }),

  // Pagination and filtering
  paginationWithFilters: z.object({
    limit: z.number().min(1).max(100).default(50),
    offset: z.number().min(0).default(0),
    sortBy: z.string().max(50).optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().max(100).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    scope: EmissionScope.optional(),
    category: EmissionCategory.optional(),
    status: CalculationStatus.optional(),
  }).refine(
    (data) => !data.startDate || !data.endDate || data.startDate <= data.endDate,
    {
      message: 'Start date must be before end date',
      path: ['endDate'],
    }
  ),

  // ID validation helpers
  uuid: z.string().uuid('Invalid ID format'),
  uuidArray: z.array(z.string().uuid('Invalid ID format')).min(1, 'At least one ID is required'),
};

// Validation helpers
export const validateCalculationInput = (input: unknown): CalculationInput => {
  return CalculationInputSchema.parse(input);
};

export const validateEmissionFactor = (factor: unknown): EmissionFactor => {
  return EmissionFactorSchema.parse(factor);
};

export const validateActivityData = (data: unknown): ActivityData => {
  return ActivityDataSchema.parse(data);
};

// API-specific validation helpers
export const validateApiInput = <T extends keyof typeof ApiValidationSchemas>(
  schema: T,
  input: unknown
): z.infer<typeof ApiValidationSchemas[T]> => {
  return ApiValidationSchemas[schema].parse(input);
};

// Sanitization helpers
export const sanitizeString = (str: string): string => {
  return str
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/[<>]/g, ''); // Remove angle brackets
};

export const sanitizeNumber = (num: unknown): number => {
  const parsed = Number(num);
  if (isNaN(parsed) || !isFinite(parsed)) {
    throw new Error('Invalid number format');
  }
  return parsed;
}; 