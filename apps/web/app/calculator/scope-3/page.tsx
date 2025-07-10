'use client';

import React, { useState } from 'react';
import { PublicLayout, FormWizard, type FormStep, type FormStepProps } from 'ui';
import { EmissionCalculator, createEmissionCalculator, type CalculationInput, type EmissionFactor } from 'core';

// Activity types for Scope 3 emissions
export interface ActivityType {
  id: string;
  name: string;
  category: 'business_travel' | 'employee_commuting' | 'waste_generated' | 'upstream_transportation' | 'downstream_transportation';
  subcategory: string;
  unit: string;
  description?: string;
  emissionFactor?: number;
}

const ACTIVITY_TYPES: ActivityType[] = [
  // Business Travel
  { 
    id: 'air_travel_domestic', 
    name: 'Air Travel (Domestic)', 
    category: 'business_travel', 
    subcategory: 'air_travel', 
    unit: 'km', 
    description: 'Domestic flights for business purposes' 
  },
  { 
    id: 'air_travel_international', 
    name: 'Air Travel (International)', 
    category: 'business_travel', 
    subcategory: 'air_travel', 
    unit: 'km', 
    description: 'International flights for business purposes' 
  },
  { 
    id: 'hotel_accommodation', 
    name: 'Hotel Accommodation', 
    category: 'business_travel', 
    subcategory: 'accommodation', 
    unit: 'nights', 
    description: 'Hotel stays during business trips' 
  },
  { 
    id: 'rental_car', 
    name: 'Rental Car', 
    category: 'business_travel', 
    subcategory: 'ground_transport', 
    unit: 'km', 
    description: 'Car rentals for business travel' 
  },
  
  // Employee Commuting
  { 
    id: 'employee_car_commute', 
    name: 'Employee Car Commuting', 
    category: 'employee_commuting', 
    subcategory: 'personal_vehicle', 
    unit: 'km', 
    description: 'Employee commuting in personal vehicles' 
  },
  { 
    id: 'public_transport_commute', 
    name: 'Public Transport Commuting', 
    category: 'employee_commuting', 
    subcategory: 'public_transport', 
    unit: 'km', 
    description: 'Employee commuting via public transportation' 
  },
  { 
    id: 'remote_work', 
    name: 'Remote Work (Avoided Commuting)', 
    category: 'employee_commuting', 
    subcategory: 'remote_work', 
    unit: 'days', 
    description: 'Remote work days reducing commuting emissions' 
  },
  
  // Waste Generated
  { 
    id: 'landfill_waste', 
    name: 'Landfilled Waste', 
    category: 'waste_generated', 
    subcategory: 'landfill', 
    unit: 'tonnes', 
    description: 'Waste sent to landfill facilities' 
  },
  { 
    id: 'recycled_waste', 
    name: 'Recycled Materials', 
    category: 'waste_generated', 
    subcategory: 'recycling', 
    unit: 'tonnes', 
    description: 'Materials sent for recycling' 
  },
  { 
    id: 'composted_waste', 
    name: 'Composted Organic Waste', 
    category: 'waste_generated', 
    subcategory: 'composting', 
    unit: 'tonnes', 
    description: 'Organic waste sent for composting' 
  },
  
  // Upstream Transportation
  { 
    id: 'supplier_transport', 
    name: 'Supplier Transportation', 
    category: 'upstream_transportation', 
    subcategory: 'supplier_delivery', 
    unit: 'tonne-km', 
    description: 'Transportation of goods from suppliers' 
  },
  { 
    id: 'raw_material_transport', 
    name: 'Raw Material Transport', 
    category: 'upstream_transportation', 
    subcategory: 'raw_materials', 
    unit: 'tonne-km', 
    description: 'Transportation of raw materials to facilities' 
  },
  
  // Downstream Transportation
  { 
    id: 'product_distribution', 
    name: 'Product Distribution', 
    category: 'downstream_transportation', 
    subcategory: 'distribution', 
    unit: 'tonne-km', 
    description: 'Distribution of products to customers' 
  },
  { 
    id: 'customer_travel', 
    name: 'Customer Travel to Store', 
    category: 'downstream_transportation', 
    subcategory: 'customer_travel', 
    unit: 'km', 
    description: 'Customer travel to retail locations' 
  },
];

// Sample emission factors for Scope 3 - in a real app, these would come from the database
const SAMPLE_EMISSION_FACTORS: EmissionFactor[] = [
  {
    id: 'air_travel_domestic_factor',
    category: 'business_travel',
    subcategory: 'air_travel',
    factor: 0.255, // kg CO2e per km
    unit: 'km',
    source: 'DEFRA',
    year: 2023,
    isActive: true,
    description: 'Domestic air travel emission factor',
  },
  {
    id: 'air_travel_international_factor',
    category: 'business_travel',
    subcategory: 'air_travel',
    factor: 0.195, // kg CO2e per km
    unit: 'km',
    source: 'DEFRA',
    year: 2023,
    isActive: true,
    description: 'International air travel emission factor',
  },
  {
    id: 'hotel_accommodation_factor',
    category: 'business_travel',
    subcategory: 'accommodation',
    factor: 29.3, // kg CO2e per night
    unit: 'nights',
    source: 'DEFRA',
    year: 2023,
    isActive: true,
    description: 'Hotel accommodation emission factor',
  },
  {
    id: 'rental_car_factor',
    category: 'business_travel',
    subcategory: 'ground_transport',
    factor: 0.171, // kg CO2e per km
    unit: 'km',
    source: 'DEFRA',
    year: 2023,
    isActive: true,
    description: 'Rental car emission factor',
  },
  {
    id: 'employee_car_commute_factor',
    category: 'employee_commuting',
    subcategory: 'personal_vehicle',
    factor: 0.171, // kg CO2e per km
    unit: 'km',
    source: 'DEFRA',
    year: 2023,
    isActive: true,
    description: 'Employee car commuting emission factor',
  },
  {
    id: 'public_transport_commute_factor',
    category: 'employee_commuting',
    subcategory: 'public_transport',
    factor: 0.063, // kg CO2e per km
    unit: 'km',
    source: 'DEFRA',
    year: 2023,
    isActive: true,
    description: 'Public transport commuting emission factor',
  },
  {
    id: 'landfill_waste_factor',
    category: 'waste_generated',
    subcategory: 'landfill',
    factor: 467.0, // kg CO2e per tonne
    unit: 'tonnes',
    source: 'EPA',
    year: 2023,
    isActive: true,
    description: 'Landfilled waste emission factor',
  },
  {
    id: 'recycled_waste_factor',
    category: 'waste_generated',
    subcategory: 'recycling',
    factor: -50.0, // kg CO2e per tonne (negative = avoided emissions)
    unit: 'tonnes',
    source: 'EPA',
    year: 2023,
    isActive: true,
    description: 'Recycled materials avoided emissions factor',
  },
  {
    id: 'supplier_transport_factor',
    category: 'upstream_transportation',
    subcategory: 'supplier_delivery',
    factor: 0.111, // kg CO2e per tonne-km
    unit: 'tonne-km',
    source: 'DEFRA',
    year: 2023,
    isActive: true,
    description: 'Supplier transportation emission factor',
  },
  {
    id: 'product_distribution_factor',
    category: 'downstream_transportation',
    subcategory: 'distribution',
    factor: 0.111, // kg CO2e per tonne-km
    unit: 'tonne-km',
    source: 'DEFRA',
    year: 2023,
    isActive: true,
    description: 'Product distribution emission factor',
  },
];

// Create calculator instance
const calculator = createEmissionCalculator(SAMPLE_EMISSION_FACTORS);

const CATEGORY_LABELS = {
  business_travel: 'Business Travel',
  employee_commuting: 'Employee Commuting',
  waste_generated: 'Waste Generated',
  upstream_transportation: 'Upstream Transportation',
  downstream_transportation: 'Downstream Transportation',
};

const CATEGORY_DESCRIPTIONS = {
  business_travel: 'Emissions from employee business travel including flights, hotels, and ground transport',
  employee_commuting: 'Emissions from employee commuting between home and workplace',
  waste_generated: 'Emissions from waste disposal including landfill, recycling, and composting',
  upstream_transportation: 'Emissions from transportation of purchased goods and services',
  downstream_transportation: 'Emissions from distribution of products and customer travel',
};

// Activity Type Selector Component
function ActivityTypeSelector({ 
  selectedActivityType, 
  onSelectionChange 
}: {
  selectedActivityType?: ActivityType;
  onSelectionChange: (activityType: ActivityType | null) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredActivityTypes = ACTIVITY_TYPES.filter(activityType => {
    const matchesCategory = !selectedCategory || activityType.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      activityType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activityType.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = Array.from(new Set(ACTIVITY_TYPES.map(at => at.category)));

  const handleActivityTypeSelect = (activityType: ActivityType) => {
    onSelectionChange(activityType);
  };

  return (
    <div className="space-y-6">
      {/* Search and filter controls */}
      <div className="space-y-4">
        <div>
          <label htmlFor="activity-search" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Search Activity Types
          </label>
          <input
            id="activity-search"
            type="text"
            placeholder="Search by activity type or category..."
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

      {/* Selected activity type display */}
      {selectedActivityType && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-emerald-800 dark:text-emerald-300">
                Selected: {selectedActivityType.name}
              </h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                Unit: {selectedActivityType.unit} | Category: {CATEGORY_LABELS[selectedActivityType.category]}
              </p>
              {selectedActivityType.description && (
                <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">
                  {selectedActivityType.description}
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

      {/* Activity type grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredActivityTypes.map(activityType => (
          <button
            key={activityType.id}
            onClick={() => handleActivityTypeSelect(activityType)}
            className={`text-left p-4 border rounded-lg transition-colors ${
              selectedActivityType?.id === activityType.id
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                : 'border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-slate-300 dark:hover:border-neutral-600'
            }`}
          >
            <div className="font-medium text-slate-800 dark:text-slate-200 mb-1">
              {activityType.name}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              {CATEGORY_LABELS[activityType.category]} • Unit: {activityType.unit}
            </div>
            {activityType.description && (
              <div className="text-xs text-slate-500 dark:text-slate-500">
                {activityType.description}
              </div>
            )}
          </button>
        ))}
      </div>

      {filteredActivityTypes.length === 0 && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <p>No activity types match your search criteria.</p>
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

// Step 1: Activity Type Selection
function ActivityTypeStep({ onValidationChange, data, setData }: FormStepProps) {
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType | null>(
    data.activityType || null
  );

  const handleSelectionChange = (activityType: ActivityType | null) => {
    setSelectedActivityType(activityType);
    setData({ ...data, activityType });
    onValidationChange(!!activityType);
  };

  return (
    <div className="space-y-6">
      <ActivityTypeSelector
        selectedActivityType={selectedActivityType}
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

  const activityType = data.activityType as ActivityType;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
          Selected Activity: {activityType?.name}
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Enter the amount for {activityType?.name.toLowerCase()} in {activityType?.unit}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="activity-amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Amount ({activityType?.unit})
          </label>
          <input
            id="activity-amount"
            type="number"
            min="0"
            step="0.01"
            value={activityAmount}
            onChange={(e) => setActivityAmount(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-neutral-800 text-slate-900 dark:text-slate-100"
            placeholder={`Enter amount in ${activityType?.unit}`}
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
            placeholder="e.g., Q1 business travel to London"
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
      const activityType = data.activityType as ActivityType;
      
      // Find matching emission factor
      const emissionFactor = SAMPLE_EMISSION_FACTORS.find(
        factor => factor.category === activityType.category && factor.unit === activityType.unit
      );

      if (!emissionFactor) {
        throw new Error('No matching emission factor found');
      }

      const calculationInput: CalculationInput = {
        scope: 'scope_3',
        category: activityType.category as any,
        subcategory: activityType.subcategory,
        activityData: {
          amount: data.activityAmount,
          unit: activityType.unit,
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

  const activityType = data.activityType as ActivityType;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-slate-50 dark:bg-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
          Calculation Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Activity Type</div>
            <div className="text-slate-800 dark:text-slate-200">{activityType?.name}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Category</div>
            <div className="text-slate-800 dark:text-slate-200">{CATEGORY_LABELS[activityType?.category]}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Amount</div>
            <div className="text-slate-800 dark:text-slate-200">{data.activityAmount} {activityType?.unit}</div>
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
          Scope 3 Emission Results
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
            {calculationResult.calculatedEmissions < 0 && (
              <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                📌 This activity resulted in avoided emissions (negative value), representing a reduction in overall carbon footprint.
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function Scope3CalculatorPage() {
  const steps: FormStep[] = [
    {
      id: 'activity-type',
      title: 'Select Activity Type',
      description: 'Choose the type of Scope 3 activity to calculate emissions for',
      component: ActivityTypeStep,
    },
    {
      id: 'activity-data',
      title: 'Enter Activity Data',
      description: 'Input the amount of activity and reporting period',
      component: ActivityDataStep,
    },
    {
      id: 'review',
      title: 'Review & Calculate',
      description: 'Review your inputs and calculate Scope 3 emissions',
      component: ReviewStep,
    },
  ];

  const handleComplete = (data: Record<string, any>) => {
    console.log('Scope 3 calculation completed:', data);
    // In a real app, this would save to the database
    alert('Scope 3 calculation completed! Check console for details.');
  };

  const handleCancel = () => {
    console.log('Scope 3 calculation cancelled');
    // Navigate back or reset form
  };

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-emerald-300 mb-2">
            Scope 3 – Value Chain Emissions
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Calculate indirect emissions from business travel, commuting, waste, and transportation
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