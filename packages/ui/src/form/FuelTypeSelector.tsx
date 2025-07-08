import React, { useState, useEffect } from 'react';

export interface FuelType {
  id: string;
  name: string;
  category: 'stationary_combustion' | 'mobile_combustion' | 'process_emissions' | 'fugitive_emissions';
  subcategory: string;
  unit: string;
  description?: string;
  emissionFactor?: number; // kg CO2e per unit
}

interface FuelTypeSelectorProps {
  selectedFuelType?: FuelType;
  onSelectionChange: (fuelType: FuelType | null) => void;
  scope?: 'scope_1' | 'scope_2' | 'scope_3';
  className?: string;
}

// Sample fuel types data - in a real app, this would come from the database
const FUEL_TYPES: FuelType[] = [
  // Stationary Combustion
  { id: 'natural_gas', name: 'Natural Gas', category: 'stationary_combustion', subcategory: 'gaseous_fuels', unit: 'm³', description: 'Pipeline natural gas for heating and electricity generation' },
  { id: 'coal', name: 'Coal', category: 'stationary_combustion', subcategory: 'solid_fuels', unit: 'kg', description: 'Bituminous coal for electricity and heat production' },
  { id: 'fuel_oil', name: 'Fuel Oil', category: 'stationary_combustion', subcategory: 'liquid_fuels', unit: 'L', description: 'Heavy fuel oil for heating and electricity' },
  { id: 'diesel_stationary', name: 'Diesel (Stationary)', category: 'stationary_combustion', subcategory: 'liquid_fuels', unit: 'L', description: 'Diesel fuel for generators and heating' },
  
  // Mobile Combustion
  { id: 'gasoline', name: 'Gasoline', category: 'mobile_combustion', subcategory: 'road_transport', unit: 'L', description: 'Regular gasoline for cars and light vehicles' },
  { id: 'diesel_mobile', name: 'Diesel (Mobile)', category: 'mobile_combustion', subcategory: 'road_transport', unit: 'L', description: 'Diesel fuel for trucks and heavy vehicles' },
  { id: 'jet_fuel', name: 'Jet Fuel', category: 'mobile_combustion', subcategory: 'aviation', unit: 'L', description: 'Jet fuel for aircraft' },
  { id: 'marine_gas_oil', name: 'Marine Gas Oil', category: 'mobile_combustion', subcategory: 'marine', unit: 'L', description: 'Marine gas oil for ships and boats' },
  
  // Process Emissions
  { id: 'cement_production', name: 'Cement Production', category: 'process_emissions', subcategory: 'mineral_products', unit: 'tonnes', description: 'Process emissions from cement manufacturing' },
  { id: 'steel_production', name: 'Steel Production', category: 'process_emissions', subcategory: 'metals', unit: 'tonnes', description: 'Process emissions from steel manufacturing' },
  
  // Fugitive Emissions
  { id: 'refrigerant_r134a', name: 'Refrigerant R-134a', category: 'fugitive_emissions', subcategory: 'refrigeration', unit: 'kg', description: 'HFC refrigerant leakage' },
  { id: 'natural_gas_leakage', name: 'Natural Gas Leakage', category: 'fugitive_emissions', subcategory: 'gas_distribution', unit: 'm³', description: 'Fugitive emissions from gas distribution' },
];

const CATEGORY_LABELS = {
  stationary_combustion: 'Stationary Combustion',
  mobile_combustion: 'Mobile Combustion',
  process_emissions: 'Process Emissions',
  fugitive_emissions: 'Fugitive Emissions',
};

const CATEGORY_DESCRIPTIONS = {
  stationary_combustion: 'Emissions from fuel burned in stationary sources (boilers, furnaces, etc.)',
  mobile_combustion: 'Emissions from fuel burned in mobile sources (vehicles, aircraft, ships)',
  process_emissions: 'Emissions from industrial processes and chemical reactions',
  fugitive_emissions: 'Intentional or unintentional releases (equipment leaks, venting)',
};

export function FuelTypeSelector({ selectedFuelType, onSelectionChange, scope = 'scope_1', className = '' }: FuelTypeSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter fuel types based on scope (for scope 2, we'd show electricity types, etc.)
  const availableFuelTypes = FUEL_TYPES.filter(fuelType => {
    if (scope === 'scope_2') {
      // For scope 2, we'd typically show electricity, steam, heating, cooling
      return false; // Simplified for this example
    }
    return true; // For scope 1, show all fuel types
  });

  const filteredFuelTypes = availableFuelTypes.filter(fuelType => {
    const matchesCategory = !selectedCategory || fuelType.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      fuelType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fuelType.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = Array.from(new Set(availableFuelTypes.map(ft => ft.category)));

  useEffect(() => {
    // Reset category selection if it's not available in current scope
    if (selectedCategory && !categories.includes(selectedCategory as any)) {
      setSelectedCategory('');
    }
  }, [scope, selectedCategory, categories]);

  const handleFuelTypeSelect = (fuelType: FuelType) => {
    onSelectionChange(fuelType);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and filter controls */}
      <div className="space-y-4">
        <div>
          <label htmlFor="fuel-search" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Search Fuel Types
          </label>
          <input
            id="fuel-search"
            type="text"
            placeholder="Search by fuel name or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-neutral-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div>
          <label htmlFor="category-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Filter by Category
          </label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-neutral-800 text-slate-900 dark:text-slate-100"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category descriptions */}
      {selectedCategory && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
            {CATEGORY_LABELS[selectedCategory as keyof typeof CATEGORY_LABELS]}
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            {CATEGORY_DESCRIPTIONS[selectedCategory as keyof typeof CATEGORY_DESCRIPTIONS]}
          </p>
        </div>
      )}

      {/* Selected fuel type display */}
      {selectedFuelType && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-emerald-800 dark:text-emerald-300">
                Selected: {selectedFuelType.name}
              </h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                Unit: {selectedFuelType.unit} | Category: {CATEGORY_LABELS[selectedFuelType.category]}
              </p>
              {selectedFuelType.description && (
                <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">
                  {selectedFuelType.description}
                </p>
              )}
            </div>
            <button
              onClick={() => onSelectionChange(null)}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Fuel type grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFuelTypes.map(fuelType => (
          <button
            key={fuelType.id}
            onClick={() => handleFuelTypeSelect(fuelType)}
            className={`text-left p-4 border rounded-lg transition-colors ${
              selectedFuelType?.id === fuelType.id
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                : 'border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-slate-300 dark:hover:border-neutral-600'
            }`}
          >
            <div className="font-medium text-slate-800 dark:text-slate-200 mb-1">
              {fuelType.name}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              {CATEGORY_LABELS[fuelType.category]} • Unit: {fuelType.unit}
            </div>
            {fuelType.description && (
              <div className="text-xs text-slate-500 dark:text-slate-500">
                {fuelType.description}
              </div>
            )}
          </button>
        ))}
      </div>

      {filteredFuelTypes.length === 0 && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <p>No fuel types match your search criteria.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
            }}
            className="text-emerald-600 dark:text-emerald-400 hover:underline mt-2"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
} 