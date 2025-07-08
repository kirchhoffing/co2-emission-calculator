import { UnitConversion } from '../types';

// Conversion factors to base units (metric)
const CONVERSION_FACTORS: Record<string, Record<string, number>> = {
  // Energy conversions (base: kWh)
  energy: {
    'kWh': 1,
    'MWh': 1000,
    'GWh': 1000000,
    'GJ': 277.778, // 1 GJ = 277.778 kWh
    'MJ': 0.277778,
    'BTU': 0.000293071, // 1 BTU = 0.000293071 kWh
    'therms': 29.3001, // 1 therm = 29.3001 kWh
  },
  
  // Volume conversions (base: L)
  volume: {
    'L': 1,
    'gal': 3.78541, // US gallon
    'm³': 1000,
    'ft³': 28.3168,
  },
  
  // Mass conversions (base: kg)
  mass: {
    'kg': 1,
    'tonnes': 1000,
    'lbs': 0.453592,
    'short_tons': 907.185, // US ton
    'long_tons': 1016.05, // UK ton
  },
  
  // Distance conversions (base: km)
  distance: {
    'km': 1,
    'miles': 1.60934,
    'nautical_miles': 1.852,
  },
};

// Unit categories mapping
const UNIT_CATEGORIES: Record<string, string> = {
  // Energy
  'kWh': 'energy', 'MWh': 'energy', 'GWh': 'energy',
  'GJ': 'energy', 'MJ': 'energy', 'BTU': 'energy', 'therms': 'energy',
  
  // Volume
  'L': 'volume', 'gal': 'volume', 'm³': 'volume', 'ft³': 'volume',
  
  // Mass
  'kg': 'mass', 'tonnes': 'mass', 'lbs': 'mass', 
  'short_tons': 'mass', 'long_tons': 'mass',
  
  // Distance
  'km': 'distance', 'miles': 'distance', 'nautical_miles': 'distance',
};

/**
 * Get the category of a unit
 */
export function getUnitCategory(unit: string): string | null {
  return UNIT_CATEGORIES[unit] || null;
}

/**
 * Check if two units are compatible for conversion
 */
export function areUnitsCompatible(fromUnit: string, toUnit: string): boolean {
  const fromCategory = getUnitCategory(fromUnit);
  const toCategory = getUnitCategory(toUnit);
  
  return fromCategory !== null && fromCategory === toCategory;
}

/**
 * Convert a value from one unit to another
 */
export function convertUnit(value: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) {
    return value;
  }
  
  if (!areUnitsCompatible(fromUnit, toUnit)) {
    throw new Error(`Cannot convert from ${fromUnit} to ${toUnit}: incompatible unit types`);
  }
  
  const category = getUnitCategory(fromUnit)!;
  const conversions = CONVERSION_FACTORS[category];
  
  if (!conversions[fromUnit] || !conversions[toUnit]) {
    throw new Error(`Unsupported unit conversion: ${fromUnit} to ${toUnit}`);
  }
  
  // Convert to base unit, then to target unit
  const baseValue = value * conversions[fromUnit];
  const convertedValue = baseValue / conversions[toUnit];
  
  return Number(convertedValue.toFixed(10)); // Avoid floating point errors
}

/**
 * Get all available units for a category
 */
export function getUnitsForCategory(category: string): string[] {
  const conversions = CONVERSION_FACTORS[category];
  return conversions ? Object.keys(conversions) : [];
}

/**
 * Get conversion factor between two units (fromUnit per toUnit)
 */
export function getConversionFactor(fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) {
    return 1;
  }
  
  if (!areUnitsCompatible(fromUnit, toUnit)) {
    throw new Error(`Cannot get conversion factor from ${fromUnit} to ${toUnit}: incompatible unit types`);
  }
  
  const category = getUnitCategory(fromUnit)!;
  const conversions = CONVERSION_FACTORS[category];
  
  return conversions[fromUnit] / conversions[toUnit];
}

/**
 * Format a unit value with appropriate precision
 */
export function formatUnitValue(value: number, unit: string, precision: number = 2): string {
  const formattedValue = value.toLocaleString(undefined, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
  
  return `${formattedValue} ${unit}`;
}

/**
 * Get human-readable unit name
 */
export function getUnitDisplayName(unit: string): string {
  const displayNames: Record<string, string> = {
    // Energy
    'kWh': 'Kilowatt-hours',
    'MWh': 'Megawatt-hours',
    'GWh': 'Gigawatt-hours',
    'GJ': 'Gigajoules',
    'MJ': 'Megajoules',
    'BTU': 'British Thermal Units',
    'therms': 'Therms',
    
    // Volume
    'L': 'Liters',
    'gal': 'Gallons (US)',
    'm³': 'Cubic meters',
    'ft³': 'Cubic feet',
    
    // Mass
    'kg': 'Kilograms',
    'tonnes': 'Metric tons',
    'lbs': 'Pounds',
    'short_tons': 'Short tons (US)',
    'long_tons': 'Long tons (UK)',
    
    // Distance
    'km': 'Kilometers',
    'miles': 'Miles',
    'nautical_miles': 'Nautical miles',
  };
  
  return displayNames[unit] || unit;
}

/**
 * Validate and create a unit conversion object
 */
export function createUnitConversion(fromUnit: string, toUnit: string): UnitConversion {
  if (!areUnitsCompatible(fromUnit, toUnit)) {
    throw new Error(`Cannot create conversion from ${fromUnit} to ${toUnit}: incompatible unit types`);
  }
  
  return {
    fromUnit,
    toUnit,
    factor: getConversionFactor(fromUnit, toUnit),
  };
}

/**
 * Get suggested conversion targets for a unit
 */
export function getSuggestedConversions(unit: string): string[] {
  const category = getUnitCategory(unit);
  if (!category) return [];
  
  const allUnits = getUnitsForCategory(category);
  return allUnits.filter(u => u !== unit);
} 