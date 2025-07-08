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