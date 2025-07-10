'use client';

import React, { useState } from 'react';
import { PublicLayout, FormWizard, type FormStep, type FormStepProps } from 'ui';
import { EmissionCalculator, createEmissionCalculator, type CalculationInput, type EmissionFactor } from 'core';

// Energy types for Scope 2 emissions
export interface EnergyType {
  id: string;
  name: string;
  category: 'purchased_electricity' | 'purchased_steam' | 'purchased_heating' | 'purchased_cooling';
  subcategory: string;
  unit: string;
  description?: string;
  emissionFactor?: number;
}

const ENERGY_TYPES: EnergyType[] = [
  // Purchased Electricity
  { 
    id: 'grid_electricity', 
    name: 'Grid Electricity', 
    category: 'purchased_electricity', 
    subcategory: 'grid_mix', 
    unit: 'kWh', 
    description: 'Electricity purchased from the regional grid' 
  },
  { 
    id: 'renewable_electricity', 
    name: 'Renewable Electricity', 
    category: 'purchased_electricity', 
    subcategory: 'renewable', 
    unit: 'kWh', 
    description: 'Electricity from certified renewable sources' 
  },
  
  // Purchased Steam
  { 
    id: 'district_steam', 
    name: 'District Steam', 
    category: 'purchased_steam', 
    subcategory: 'district_heating', 
    unit: 'GJ', 
    description: 'Steam purchased from district heating systems' 
  },
  { 
    id: 'industrial_steam', 
    name: 'Industrial Steam', 
    category: 'purchased_steam', 
    subcategory: 'industrial', 
    unit: 'tonnes', 
    description: 'Steam for industrial processes' 
  },
  
  // Purchased Heating
  { 
    id: 'district_heating', 
    name: 'District Heating', 
    category: 'purchased_heating', 
    subcategory: 'district_system', 
    unit: 'GJ', 
    description: 'Hot water or steam from district heating networks' 
  },
  { 
    id: 'biomass_heating', 
    name: 'Biomass Heating', 
    category: 'purchased_heating', 
    subcategory: 'biomass', 
    unit: 'GJ', 
    description: 'Heating from purchased biomass sources' 
  },
  
  // Purchased Cooling
  { 
    id: 'district_cooling', 
    name: 'District Cooling', 
    category: 'purchased_cooling', 
    subcategory: 'district_system', 
    unit: 'GJ', 
    description: 'Chilled water from district cooling systems' 
  },
  { 
    id: 'purchased_chilled_water', 
    name: 'Purchased Chilled Water', 
    category: 'purchased_cooling', 
    subcategory: 'chilled_water', 
    unit: 'GJ', 
    description: 'Chilled water for air conditioning' 
  },
];

// Sample emission factors for Scope 2 - in a real app, these would come from the database
const SAMPLE_EMISSION_FACTORS: EmissionFactor[] = [
  {
    id: 'grid_electricity_factor',
    category: 'purchased_electricity',
    subcategory: 'grid_mix',
    factor: 0.5, // kg CO2e per kWh (example US average)
    unit: 'kWh',
    source: 'EPA eGRID',
    year: 2023,
    isActive: true,
    description: 'Grid electricity emission factor for purchased electricity',
  },
  {
    id: 'renewable_electricity_factor',
    category: 'purchased_electricity',
    subcategory: 'renewable',
    factor: 0.0, // kg CO2e per kWh (zero emissions)
    unit: 'kWh',
    source: 'EPA',
    year: 2023,
    isActive: true,
    description: 'Renewable electricity emission factor',
  },
  {
    id: 'district_steam_factor',
    category: 'purchased_steam',
    subcategory: 'district_heating',
    factor: 70.0, // kg CO2e per GJ
    unit: 'GJ',
    source: 'IPCC',
    year: 2023,
    isActive: true,
    description: 'District steam emission factor',
  },
  {
    id: 'district_heating_factor',
    category: 'purchased_heating',
    subcategory: 'district_system',
    factor: 65.0, // kg CO2e per GJ
    unit: 'GJ',
    source: 'IPCC',
    year: 2023,
    isActive: true,
    description: 'District heating emission factor',
  },
  {
    id: 'district_cooling_factor',
    category: 'purchased_cooling',
    subcategory: 'district_system',
    factor: 75.0, // kg CO2e per GJ
    unit: 'GJ',
    source: 'IPCC',
    year: 2023,
    isActive: true,
    description: 'District cooling emission factor',
  },
];

// Create calculator instance
const calculator = createEmissionCalculator(SAMPLE_EMISSION_FACTORS);

const CATEGORY_LABELS = {
  purchased_electricity: 'Purchased Electricity',
  purchased_steam: 'Purchased Steam',
  purchased_heating: 'Purchased Heating',
  purchased_cooling: 'Purchased Cooling',
};

const CATEGORY_DESCRIPTIONS = {
  purchased_electricity: 'Indirect emissions from purchased electricity consumption',
  purchased_steam: 'Indirect emissions from purchased steam for heating and processes',
  purchased_heating: 'Indirect emissions from purchased heat (hot water, district heating)',
  purchased_cooling: 'Indirect emissions from purchased cooling (chilled water, district cooling)',
};

// Energy Type Selector Component
function EnergyTypeSelector({ 
  selectedEnergyType, 
  onSelectionChange 
}: {
  selectedEnergyType?: EnergyType;
  onSelectionChange: (energyType: EnergyType | null) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEnergyTypes = ENERGY_TYPES.filter(energyType => {
    const matchesCategory = !selectedCategory || energyType.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      energyType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      energyType.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = Array.from(new Set(ENERGY_TYPES.map(et => et.category)));

  const handleEnergyTypeSelect = (energyType: EnergyType) => {
    onSelectionChange(energyType);
  };

  return (
    <div className="space-y-6">
      {/* Search and filter controls */}
      <div className="space-y-4">
        <div>
          <label htmlFor="energy-search" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Search Energy Types
          </label>
          <input
            id="energy-search"
            type="text"
            placeholder="Search by energy type or category..."
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

      {/* Selected energy type display */}
      {selectedEnergyType && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-emerald-800 dark:text-emerald-300">
                Selected: {selectedEnergyType.name}
              </h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                Unit: {selectedEnergyType.unit} | Category: {CATEGORY_LABELS[selectedEnergyType.category]}
              </p>
              {selectedEnergyType.description && (
                <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">
                  {selectedEnergyType.description}
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

      {/* Energy type grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEnergyTypes.map(energyType => (
          <button
            key={energyType.id}
            onClick={() => handleEnergyTypeSelect(energyType)}
            className={`text-left p-4 border rounded-lg transition-colors ${
              selectedEnergyType?.id === energyType.id
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                : 'border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-slate-300 dark:hover:border-neutral-600'
            }`}
          >
            <div className="font-medium text-slate-800 dark:text-slate-200 mb-1">
              {energyType.name}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              {CATEGORY_LABELS[energyType.category]} • Unit: {energyType.unit}
            </div>
            {energyType.description && (
              <div className="text-xs text-slate-500 dark:text-slate-500">
                {energyType.description}
              </div>
            )}
          </button>
        ))}
      </div>

      {filteredEnergyTypes.length === 0 && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <p>No energy types match your search criteria.</p>
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

// Step 1: Energy Type Selection
function EnergyTypeStep({ onValidationChange, data, setData }: FormStepProps) {
  const [selectedEnergyType, setSelectedEnergyType] = useState<EnergyType | null>(
    data.energyType || null
  );

  const handleSelectionChange = (energyType: EnergyType | null) => {
    setSelectedEnergyType(energyType);
    setData({ ...data, energyType });
    onValidationChange(!!energyType);
  };

  return (
    <div className="space-y-6">
      <EnergyTypeSelector
        selectedEnergyType={selectedEnergyType}
        onSelectionChange={handleSelectionChange}
      />
    </div>
  );
}

// Step 2: Activity Data Entry
function ActivityDataStep({ onValidationChange, data, setData }: FormStepProps) {
  const [activityAmount, setActivityAmount] = useState(data.activityAmount || '');
  const [description, setDescription] = useState(data.description || '');
  const [startDate, setStartDate] = useState(data.startDate || '');
  const [endDate, setEndDate] = useState(data.endDate || '');

  const validateData = () => {
    const amount = parseFloat(activityAmount);
    const isValid = amount > 0 && startDate && endDate && new Date(startDate) <= new Date(endDate);
    onValidationChange(isValid);
  };

  React.useEffect(() => {
    setData({
      ...data,
      activityAmount: parseFloat(activityAmount) || 0,
      description,
      startDate,
      endDate,
    });
    validateData();
  }, [activityAmount, description, startDate, endDate]);

  const energyType = data.energyType as EnergyType;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
          Selected Energy: {energyType?.name}
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Enter the amount of {energyType?.name.toLowerCase()} consumed in {energyType?.unit}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="activity-amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Amount ({energyType?.unit})
          </label>
          <input
            id="activity-amount"
            type="number"
            min="0"
            step="0.01"
            value={activityAmount}
            onChange={(e) => setActivityAmount(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-neutral-800 text-slate-900 dark:text-slate-100"
            placeholder={`Enter amount in ${energyType?.unit}`}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Description (Optional)
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-neutral-800 text-slate-900 dark:text-slate-100"
            placeholder="e.g., Office electricity for Q1"
          />
        </div>

        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Start Date
          </label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-neutral-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            End Date
          </label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-neutral-800 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>
    </div>
  );
}

// Step 3: Review and Calculate
function ReviewStep({ onValidationChange, data, setData }: FormStepProps) {
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  React.useEffect(() => {
    onValidationChange(true); // Review step is always valid
    performCalculation();
  }, []);

  const performCalculation = async () => {
    setIsCalculating(true);
    
    try {
      const energyType = data.energyType as EnergyType;
      
      // Find matching emission factor
      const emissionFactor = SAMPLE_EMISSION_FACTORS.find(
        factor => factor.category === energyType.category && factor.unit === energyType.unit
      );

      if (!emissionFactor) {
        throw new Error('No matching emission factor found');
      }

      const calculationInput: CalculationInput = {
        scope: 'scope_2',
        category: energyType.category as any,
        subcategory: energyType.subcategory,
        activityData: {
          amount: data.activityAmount,
          unit: energyType.unit,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          description: data.description,
        },
        emissionFactorId: emissionFactor.id,
      };

      const result = await calculator.calculate(calculationInput);
      setCalculationResult(result);
      setData({ ...data, calculationResult: result });
    } catch (error) {
      console.error('Calculation error:', error);
      setCalculationResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsCalculating(false);
    }
  };

  const energyType = data.energyType as EnergyType;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-slate-50 dark:bg-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
          Calculation Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Energy Type</div>
            <div className="text-slate-800 dark:text-slate-200">{energyType?.name}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Category</div>
            <div className="text-slate-800 dark:text-slate-200">{CATEGORY_LABELS[energyType?.category]}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Amount</div>
            <div className="text-slate-800 dark:text-slate-200">{data.activityAmount} {energyType?.unit}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Period</div>
            <div className="text-slate-800 dark:text-slate-200">{data.startDate} to {data.endDate}</div>
          </div>
        </div>

        {data.description && (
          <div className="mb-6">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Description</div>
            <div className="text-slate-800 dark:text-slate-200">{data.description}</div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300 mb-4">
          Scope 2 Emission Results
        </h3>
        
        {isCalculating ? (
          <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-700 dark:border-emerald-400"></div>
            <span>Calculating emissions...</span>
          </div>
        ) : calculationResult?.error ? (
          <div className="text-red-600 dark:text-red-400">
            Error: {calculationResult.error}
          </div>
        ) : calculationResult ? (
          <div className="space-y-3">
            <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">
              {calculationResult.calculatedEmissions.toFixed(2)} kg CO₂e
            </div>
            <div className="text-sm text-emerald-700 dark:text-emerald-400">
              Calculation method: {calculationResult.calculationMethod}
            </div>
            {calculationResult.uncertaintyRange && (
              <div className="text-sm text-emerald-600 dark:text-emerald-500">
                Uncertainty range: {calculationResult.uncertaintyRange.min.toFixed(2)} - {calculationResult.uncertaintyRange.max.toFixed(2)} kg CO₂e
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function Scope2CalculatorPage() {
  const steps: FormStep[] = [
    {
      id: 'energy-type',
      title: 'Select Energy Type',
      description: 'Choose the type of purchased energy for Scope 2 emissions',
      component: EnergyTypeStep,
    },
    {
      id: 'activity-data',
      title: 'Enter Consumption Data',
      description: 'Input the amount of energy consumed and reporting period',
      component: ActivityDataStep,
    },
    {
      id: 'review',
      title: 'Review & Calculate',
      description: 'Review your inputs and calculate Scope 2 emissions',
      component: ReviewStep,
    },
  ];

  const handleComplete = (data: Record<string, any>) => {
    console.log('Scope 2 calculation completed:', data);
    // In a real app, this would save to the database
    alert('Scope 2 calculation completed! Check console for details.');
  };

  const handleCancel = () => {
    console.log('Scope 2 calculation cancelled');
    // Navigate back or reset form
  };

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-emerald-300 mb-2">
            Scope 2 – Indirect Emissions
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Calculate indirect emissions from purchased electricity, steam, heating, and cooling
          </p>
        </div>

        <FormWizard
          steps={steps}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      </div>
    </PublicLayout>
  );
} 