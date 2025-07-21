#!/usr/bin/env tsx

/**
 * CO2 Emission Factors Seeder
 * 
 * This script imports standardized emission factors from EPA's 2025 GHG Emission Factors Hub
 * and IPCC guidelines into the database. These factors are essential for accurate
 * emissions calculations across Scope 1, 2, and 3 categories.
 * 
 * Data Sources:
 * - EPA GHG Emission Factors Hub 2025
 * - IPCC Fifth Assessment Report (AR5)
 * - EPA eGRID 2022 data
 * 
 * Usage: pnpm tsx scripts/seed-emission-factors.ts
 */

import { db } from '../db/connection';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';

console.log('🚀 CO2 Emission Factors Seeder Started');
console.log('📍 Current working directory:', process.cwd());

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  console.log('📋 To set up the database:');
  console.log('   1. Copy environment.example to apps/web/.env.local');
  console.log('   2. Set your DATABASE_URL in the .env.local file');
  console.log('   3. Run the database migrations: pnpm --filter ./db migrate');
  console.log('   4. Re-run this seeder script');
  process.exit(1);
}

console.log('✅ DATABASE_URL is set');

interface EmissionFactorData {
  category: string;
  subcategory?: string;
  factor: number;
  unit: string;
  source: string;
  region?: string;
  year: number;
  isActive: boolean;
}

/**
 * EPA 2025 Stationary Combustion Emission Factors
 * Source: EPA GHG Emission Factors Hub 2025, Table 1
 */
const stationaryCombustionFactors: EmissionFactorData[] = [
  // Natural Gas
  {
    category: 'stationary_combustion',
    subcategory: 'natural_gas',
    factor: 53.07, // kg CO2/MMBtu
    unit: 'MMBtu',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'stationary_combustion',
    subcategory: 'natural_gas',
    factor: 0.0548, // kg CO2/scf
    unit: 'scf',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  
  // Coal Types
  {
    category: 'stationary_combustion',
    subcategory: 'anthracite_coal',
    factor: 103.65, // kg CO2/MMBtu
    unit: 'MMBtu',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'stationary_combustion',
    subcategory: 'bituminous_coal',
    factor: 93.08, // kg CO2/MMBtu
    unit: 'MMBtu',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'stationary_combustion',
    subcategory: 'sub_bituminous_coal',
    factor: 97.17, // kg CO2/MMBtu
    unit: 'MMBtu',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'stationary_combustion',
    subcategory: 'lignite_coal',
    factor: 97.75, // kg CO2/MMBtu
    unit: 'MMBtu',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  
  // Petroleum Products
  {
    category: 'stationary_combustion',
    subcategory: 'distillate_fuel_oil',
    factor: 73.96, // kg CO2/MMBtu
    unit: 'MMBtu',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'stationary_combustion',
    subcategory: 'residual_fuel_oil',
    factor: 78.79, // kg CO2/MMBtu
    unit: 'MMBtu',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'stationary_combustion',
    subcategory: 'kerosene',
    factor: 75.20, // kg CO2/MMBtu
    unit: 'MMBtu',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'stationary_combustion',
    subcategory: 'propane',
    factor: 62.87, // kg CO2/MMBtu
    unit: 'MMBtu',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  
  // Biomass Fuels (reported separately but tracked)
  {
    category: 'stationary_combustion',
    subcategory: 'wood_biomass',
    factor: 93.80, // kg CO2/MMBtu (biogenic)
    unit: 'MMBtu',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'stationary_combustion',
    subcategory: 'ethanol',
    factor: 68.44, // kg CO2/MMBtu (biogenic)
    unit: 'MMBtu',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
];

/**
 * EPA 2025 Mobile Combustion Emission Factors
 * Source: EPA GHG Emission Factors Hub 2025, Table 2
 */
const mobileCombustionFactors: EmissionFactorData[] = [
  // Gasoline
  {
    category: 'mobile_combustion',
    subcategory: 'motor_gasoline',
    factor: 8.78, // kg CO2/gallon
    unit: 'gallon',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  
  // Diesel
  {
    category: 'mobile_combustion',
    subcategory: 'diesel_fuel',
    factor: 10.21, // kg CO2/gallon
    unit: 'gallon',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  
  // Aviation Fuels
  {
    category: 'mobile_combustion',
    subcategory: 'aviation_gasoline',
    factor: 8.31, // kg CO2/gallon
    unit: 'gallon',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'mobile_combustion',
    subcategory: 'jet_fuel',
    factor: 9.79, // kg CO2/gallon
    unit: 'gallon',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  
  // Alternative Fuels
  {
    category: 'mobile_combustion',
    subcategory: 'compressed_natural_gas',
    factor: 53.02, // kg CO2/MMBtu
    unit: 'MMBtu',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'mobile_combustion',
    subcategory: 'liquefied_natural_gas',
    factor: 53.02, // kg CO2/MMBtu
    unit: 'MMBtu',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'mobile_combustion',
    subcategory: 'liquefied_petroleum_gas',
    factor: 5.68, // kg CO2/gallon
    unit: 'gallon',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  
  // Biofuels (tracked separately)
  {
    category: 'mobile_combustion',
    subcategory: 'biodiesel_b100',
    factor: 9.46, // kg CO2/gallon (biogenic)
    unit: 'gallon',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'mobile_combustion',
    subcategory: 'ethanol_e100',
    factor: 5.79, // kg CO2/gallon (biogenic)
    unit: 'gallon',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
];

/**
 * EPA eGRID 2022 Electricity Emission Factors (Scope 2)
 * Source: EPA eGRID 2022 data, updated for 2025
 */
const electricityFactors: EmissionFactorData[] = [
  // US Average
  {
    category: 'purchased_electricity',
    subcategory: 'us_average',
    factor: 0.821, // lb CO2/kWh converted to kg CO2/kWh
    unit: 'kWh',
    source: 'EPA eGRID 2022',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  
  // Major Regional Averages
  {
    category: 'purchased_electricity',
    subcategory: 'nerc_west',
    factor: 0.758, // kg CO2/kWh
    unit: 'kWh',
    source: 'EPA eGRID 2022',
    region: 'WECC',
    year: 2025,
    isActive: true,
  },
  {
    category: 'purchased_electricity',
    subcategory: 'nerc_east',
    factor: 0.845, // kg CO2/kWh
    unit: 'kWh',
    source: 'EPA eGRID 2022',
    region: 'RFC',
    year: 2025,
    isActive: true,
  },
  {
    category: 'purchased_electricity',
    subcategory: 'ercot',
    factor: 0.896, // kg CO2/kWh
    unit: 'kWh',
    source: 'EPA eGRID 2022',
    region: 'ERCOT',
    year: 2025,
    isActive: true,
  },
  {
    category: 'purchased_electricity',
    subcategory: 'california',
    factor: 0.428, // kg CO2/kWh
    unit: 'kWh',
    source: 'EPA eGRID 2022',
    region: 'CAMX',
    year: 2025,
    isActive: true,
  },
  {
    category: 'purchased_electricity',
    subcategory: 'new_york',
    factor: 0.526, // kg CO2/kWh
    unit: 'kWh',
    source: 'EPA eGRID 2022',
    region: 'NYISO',
    year: 2025,
    isActive: true,
  },
];

/**
 * Steam and District Heating Factors (Scope 2)
 */
const steamHeatingFactors: EmissionFactorData[] = [
  {
    category: 'purchased_steam',
    subcategory: 'district_steam',
    factor: 66.33, // kg CO2/MMBtu
    unit: 'MMBtu',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'purchased_heating',
    subcategory: 'district_heating',
    factor: 66.33, // kg CO2/MMBtu
    unit: 'MMBtu',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'purchased_cooling',
    subcategory: 'district_cooling',
    factor: 66.33, // kg CO2/MMBtu
    unit: 'MMBtu',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
];

/**
 * Business Travel Emission Factors (Scope 3)
 * Source: EPA GHG Emission Factors Hub 2025, Table 7
 */
const businessTravelFactors: EmissionFactorData[] = [
  // Air Travel
  {
    category: 'business_travel',
    subcategory: 'air_travel_short_haul',
    factor: 0.275, // kg CO2/passenger-mile
    unit: 'passenger-mile',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'business_travel',
    subcategory: 'air_travel_medium_haul',
    factor: 0.163, // kg CO2/passenger-mile
    unit: 'passenger-mile',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'business_travel',
    subcategory: 'air_travel_long_haul',
    factor: 0.181, // kg CO2/passenger-mile
    unit: 'passenger-mile',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  
  // Ground Transportation
  {
    category: 'business_travel',
    subcategory: 'passenger_car',
    factor: 0.350, // kg CO2/passenger-mile
    unit: 'passenger-mile',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'business_travel',
    subcategory: 'light_duty_truck',
    factor: 0.456, // kg CO2/passenger-mile
    unit: 'passenger-mile',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'business_travel',
    subcategory: 'intercity_rail',
    factor: 0.134, // kg CO2/passenger-mile
    unit: 'passenger-mile',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'business_travel',
    subcategory: 'bus',
    factor: 0.164, // kg CO2/passenger-mile
    unit: 'passenger-mile',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
];

/**
 * Employee Commuting Factors (Scope 3)
 * Using similar factors to business travel but adjusted for typical commuting patterns
 */
const employeeCommutingFactors: EmissionFactorData[] = [
  {
    category: 'employee_commuting',
    subcategory: 'passenger_car',
    factor: 0.350, // kg CO2/passenger-mile
    unit: 'passenger-mile',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'employee_commuting',
    subcategory: 'public_transit_bus',
    factor: 0.164, // kg CO2/passenger-mile
    unit: 'passenger-mile',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'employee_commuting',
    subcategory: 'public_transit_rail',
    factor: 0.103, // kg CO2/passenger-mile
    unit: 'passenger-mile',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'employee_commuting',
    subcategory: 'motorcycle',
    factor: 0.187, // kg CO2/passenger-mile
    unit: 'passenger-mile',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
];

/**
 * Freight Transportation Factors (Scope 3)
 * Source: EPA GHG Emission Factors Hub 2025, Table 8
 */
const freightTransportationFactors: EmissionFactorData[] = [
  {
    category: 'upstream_transportation',
    subcategory: 'medium_heavy_duty_truck',
    factor: 0.166, // kg CO2/ton-mile
    unit: 'ton-mile',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'upstream_transportation',
    subcategory: 'rail_freight',
    factor: 0.040, // kg CO2/ton-mile
    unit: 'ton-mile',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'upstream_transportation',
    subcategory: 'waterborne_craft',
    factor: 0.036, // kg CO2/ton-mile
    unit: 'ton-mile',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'upstream_transportation',
    subcategory: 'air_freight',
    factor: 1.001, // kg CO2/ton-mile
    unit: 'ton-mile',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  
  // Downstream (same factors)
  {
    category: 'downstream_transportation',
    subcategory: 'medium_heavy_duty_truck',
    factor: 0.166, // kg CO2/ton-mile
    unit: 'ton-mile',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'downstream_transportation',
    subcategory: 'rail_freight',
    factor: 0.040, // kg CO2/ton-mile
    unit: 'ton-mile',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'downstream_transportation',
    subcategory: 'waterborne_craft',
    factor: 0.036, // kg CO2/ton-mile
    unit: 'ton-mile',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'downstream_transportation',
    subcategory: 'air_freight',
    factor: 1.001, // kg CO2/ton-mile
    unit: 'ton-mile',
    source: 'EPA 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
];

/**
 * Waste Generated Factors (Scope 3)
 * Source: EPA WARM model and typical waste factors
 */
const wasteFactors: EmissionFactorData[] = [
  {
    category: 'waste_generated',
    subcategory: 'mixed_municipal_solid_waste_landfilled',
    factor: 0.94, // metric tons CO2e/short ton waste
    unit: 'short_ton',
    source: 'EPA WARM 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'waste_generated',
    subcategory: 'mixed_municipal_solid_waste_incinerated',
    factor: 0.34, // metric tons CO2e/short ton waste
    unit: 'short_ton',
    source: 'EPA WARM 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'waste_generated',
    subcategory: 'mixed_recycling',
    factor: -2.94, // metric tons CO2e/short ton waste (negative = avoided emissions)
    unit: 'short_ton',
    source: 'EPA WARM 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
  {
    category: 'waste_generated',
    subcategory: 'composting',
    factor: -0.39, // metric tons CO2e/short ton waste (negative = avoided emissions)
    unit: 'short_ton',
    source: 'EPA WARM 2025',
    region: 'US',
    year: 2025,
    isActive: true,
  },
];

/**
 * International Factors for Global Operations
 * Source: IPCC AR5 and international emission factor databases
 */
const internationalFactors: EmissionFactorData[] = [
  // European Union
  {
    category: 'purchased_electricity',
    subcategory: 'eu_average',
    factor: 0.295, // kg CO2/kWh
    unit: 'kWh',
    source: 'EEA 2025',
    region: 'EU',
    year: 2025,
    isActive: true,
  },
  
  // United Kingdom
  {
    category: 'purchased_electricity',
    subcategory: 'uk_grid',
    factor: 0.193, // kg CO2/kWh
    unit: 'kWh',
    source: 'DEFRA 2025',
    region: 'UK',
    year: 2025,
    isActive: true,
  },
  
  // Canada
  {
    category: 'purchased_electricity',
    subcategory: 'canada_average',
    factor: 0.130, // kg CO2/kWh
    unit: 'kWh',
    source: 'Environment Canada 2025',
    region: 'Canada',
    year: 2025,
    isActive: true,
  },
  
  // Australia
  {
    category: 'purchased_electricity',
    subcategory: 'australia_nem',
    factor: 0.79, // kg CO2/kWh
    unit: 'kWh',
    source: 'Australia NGA 2025',
    region: 'Australia',
    year: 2025,
    isActive: true,
  },
  
  // Global Natural Gas (consistent across regions)
  {
    category: 'stationary_combustion',
    subcategory: 'natural_gas',
    factor: 56.1, // kg CO2/GJ (IPCC default)
    unit: 'GJ',
    source: 'IPCC AR5',
    region: 'Global',
    year: 2025,
    isActive: true,
  },
];

/**
 * Combines all emission factors for batch insertion
 */
const getAllEmissionFactors = (): EmissionFactorData[] => {
  return [
    ...stationaryCombustionFactors,
    ...mobileCombustionFactors,
    ...electricityFactors,
    ...steamHeatingFactors,
    ...businessTravelFactors,
    ...employeeCommutingFactors,
    ...freightTransportationFactors,
    ...wasteFactors,
    ...internationalFactors,
  ];
};

/**
 * Main seeding function
 */
async function seedEmissionFactors(): Promise<void> {
  try {
    console.log('🌱 Starting emission factors seeding...');
    
    // Get all emission factors
    const allFactors = getAllEmissionFactors();
    console.log(`📊 Prepared ${allFactors.length} emission factors for seeding`);
    
    // Clear existing emission factors (optional - for fresh start)
    console.log('🧹 Clearing existing emission factors...');
    await db.delete(schema.emissionFactors);
    
    // Insert emission factors in batches for better performance
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < allFactors.length; i += batchSize) {
      const batch = allFactors.slice(i, i + batchSize);
      
      const insertData = batch.map(factor => ({
        category: factor.category,
        subcategory: factor.subcategory || null,
        factor: factor.factor.toString(),
        unit: factor.unit,
        source: factor.source,
        region: factor.region || null,
        year: factor.year,
        isActive: factor.isActive,
      }));
      
      await db.insert(schema.emissionFactors).values(insertData);
      inserted += batch.length;
      
      console.log(`✅ Inserted batch ${Math.ceil((i + 1) / batchSize)} (${inserted}/${allFactors.length} factors)`);
    }
    
    console.log('🎉 Emission factors seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • Total factors seeded: ${inserted}`);
    console.log(`   • Stationary combustion: ${stationaryCombustionFactors.length}`);
    console.log(`   • Mobile combustion: ${mobileCombustionFactors.length}`);
    console.log(`   • Electricity (Scope 2): ${electricityFactors.length}`);
    console.log(`   • Steam/heating (Scope 2): ${steamHeatingFactors.length}`);
    console.log(`   • Business travel (Scope 3): ${businessTravelFactors.length}`);
    console.log(`   • Employee commuting (Scope 3): ${employeeCommutingFactors.length}`);
    console.log(`   • Freight transport (Scope 3): ${freightTransportationFactors.length}`);
    console.log(`   • Waste (Scope 3): ${wasteFactors.length}`);
    console.log(`   • International factors: ${internationalFactors.length}`);
    console.log('\n🔧 The emission factors are now available for calculations!');
    
  } catch (error) {
    console.error('❌ Error seeding emission factors:', error);
    throw error;
  }
}

/**
 * Verify seeded data
 */
async function verifySeededData(): Promise<void> {
  try {
    console.log('\n🔍 Verifying seeded data...');
    
    // Count total factors
    const totalCount = await db.select().from(schema.emissionFactors);
    console.log(`✅ Total emission factors in database: ${totalCount.length}`);
    
    // Count by category
    const categories = await db
      .selectDistinct({
        category: schema.emissionFactors.category,
      })
      .from(schema.emissionFactors);
    
    console.log(`✅ Categories available: ${categories.length}`);
    for (const cat of categories) {
      const count = await db
        .select()
        .from(schema.emissionFactors)
        .where(eq(schema.emissionFactors.category, cat.category));
      console.log(`   • ${cat.category}: ${count.length} factors`);
    }
    
    // Count by source
    const sources = await db
      .selectDistinct({
        source: schema.emissionFactors.source,
      })
      .from(schema.emissionFactors);
    
    console.log(`✅ Data sources: ${sources.map(s => s.source).join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error verifying seeded data:', error);
    throw error;
  }
}

// Run the seeding if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedEmissionFactors()
    .then(() => verifySeededData())
    .then(() => {
      console.log('\n✨ Emission factors seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { seedEmissionFactors, verifySeededData }; 