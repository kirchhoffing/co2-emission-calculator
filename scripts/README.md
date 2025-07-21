# Scripts Directory

This directory contains utility scripts for the CO2 Emission Calculator project.

## Emission Factors Seeder

### Overview

The `seed-emission-factors.ts` script imports standardized emission factors from EPA's 2025 GHG Emission Factors Hub and IPCC AR5 guidelines into the database. These factors are essential for accurate emissions calculations across Scope 1, 2, and 3 categories.

### Data Sources

- **EPA GHG Emission Factors Hub 2025** - Latest emission factors for stationary and mobile combustion
- **EPA eGRID 2022** - Electricity emission factors by region  
- **EPA WARM Model 2025** - Waste emission factors
- **IPCC AR5** - International emission factors for global operations

### Usage

1. **Prerequisites**
   ```bash
   # Ensure database is set up
   cp environment.example apps/web/.env.local
   # Edit apps/web/.env.local and set your DATABASE_URL
   
   # Run database migrations
   pnpm --filter ./db migrate
   ```

2. **Run the Seeder**
   ```bash
   pnpm run seed-emission-factors
   ```

3. **Verification**
   The script will automatically verify the seeded data and provide a summary.

### What Gets Seeded

The seeder imports **60+ emission factors** covering:

#### Scope 1 (Direct Emissions)
- **Stationary Combustion**: Natural gas, coal types, petroleum products, biomass fuels
- **Mobile Combustion**: Gasoline, diesel, aviation fuels, alternative fuels (CNG, LNG, LPG)

#### Scope 2 (Indirect Energy Emissions)  
- **Electricity**: US average and regional factors (WECC, RFC, ERCOT, CAMX, NYISO)
- **Steam/Heating**: District steam, heating, and cooling

#### Scope 3 (Other Indirect Emissions)
- **Business Travel**: Air travel (short/medium/long haul), ground transportation, rail
- **Employee Commuting**: Cars, public transit, motorcycles
- **Freight Transportation**: Truck, rail, waterborne, air freight
- **Waste Generated**: Landfill, incineration, recycling, composting

#### International Factors
- **Global Coverage**: EU, UK, Canada, Australia emission factors
- **IPCC Standards**: Global natural gas factors

### Output Example

```
🌱 Starting emission factors seeding...
📊 Prepared 61 emission factors for seeding
🧹 Clearing existing emission factors...
✅ Inserted batch 1 (50/61 factors)
✅ Inserted batch 2 (61/61 factors)
🎉 Emission factors seeding completed successfully!

📋 Summary:
   • Total factors seeded: 61
   • Stationary combustion: 12
   • Mobile combustion: 9
   • Electricity (Scope 2): 6
   • Steam/heating (Scope 2): 3
   • Business travel (Scope 3): 7
   • Employee commuting (Scope 3): 4
   • Freight transport (Scope 3): 8
   • Waste (Scope 3): 4
   • International factors: 5

🔧 The emission factors are now available for calculations!

🔍 Verifying seeded data...
✅ Total emission factors in database: 61
✅ Categories available: 9
   • stationary_combustion: 12 factors
   • mobile_combustion: 9 factors
   • purchased_electricity: 11 factors
   ...
✅ Data sources: EPA 2025, EPA eGRID 2022, EPA WARM 2025, EEA 2025, DEFRA 2025, Environment Canada 2025, Australia NGA 2025, IPCC AR5

✨ Emission factors seeding completed successfully!
```

### Features

- **Comprehensive Coverage**: All major emission categories for complete carbon accounting
- **Latest Data**: 2025 emission factors from authoritative sources
- **International Support**: Factors for global operations 
- **Batch Processing**: Efficient insertion with progress tracking
- **Verification**: Automatic data validation and summary
- **Error Handling**: Clear error messages and setup instructions
- **TypeScript**: Full type safety and validation

### Integration

Once seeded, these emission factors are available through:

- **tRPC API**: `emissionFactors.getAll()`, `emissionFactors.getById()`
- **Calculator Engine**: Automatic factor lookup in calculations
- **Admin Interface**: Management through `/admin/emission-factors`

### Maintenance

- **Updates**: Re-run the seeder when EPA releases new factors
- **Regions**: Add new regional factors as needed
- **Categories**: Extend with additional emission categories

The seeded emission factors provide the foundation for accurate, standardized CO2 emissions calculations across all business operations. 