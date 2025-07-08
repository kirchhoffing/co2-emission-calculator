'use client';

import React, { useState } from 'react';
import { PublicLayout, FormWizard, type FormStep, type FormStepProps, FuelTypeSelector, type FuelType } from 'ui';
import { EmissionCalculator, createEmissionCalculator, type CalculationInput, type EmissionFactor } from 'core';

// Sample emission factors - in a real app, these would come from the database
const SAMPLE_EMISSION_FACTORS: EmissionFactor[] = [
  {
    id: 'natural_gas_factor',
    category: 'stationary_combustion',
    subcategory: 'gaseous_fuels',
    factor: 1.9, // kg CO2e per m³
    unit: 'm³',
    source: 'EPA',
    year: 2023,
    isActive: true,
    description: 'Natural gas emission factor for stationary combustion',
  },
  {
    id: 'gasoline_factor',
    category: 'mobile_combustion',
    subcategory: 'road_transport',
    factor: 2.31, // kg CO2e per L
    unit: 'L',
    source: 'EPA',
    year: 2023,
    isActive: true,
    description: 'Gasoline emission factor for mobile combustion',
  },
  {
    id: 'diesel_factor',
    category: 'mobile_combustion',
    subcategory: 'road_transport',
    factor: 2.68, // kg CO2e per L
    unit: 'L',
    source: 'EPA',
    year: 2023,
    isActive: true,
    description: 'Diesel emission factor for mobile combustion',
  },
];

// Create calculator instance
const calculator = createEmissionCalculator(SAMPLE_EMISSION_FACTORS);

// Step 1: Fuel Type Selection
function FuelTypeStep({ onValidationChange, data, setData }: FormStepProps) {
  const [selectedFuelType, setSelectedFuelType] = useState<FuelType | null>(
    data.fuelType || null
  );

  const handleSelectionChange = (fuelType: FuelType | null) => {
    setSelectedFuelType(fuelType);
    setData({ ...data, fuelType });
    onValidationChange(!!fuelType);
  };

  return (
    <div className="space-y-6">
      <FuelTypeSelector
        selectedFuelType={selectedFuelType}
        onSelectionChange={handleSelectionChange}
        scope="scope_1"
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

  const fuelType = data.fuelType as FuelType;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
          Selected Fuel: {fuelType?.name}
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Enter the amount of {fuelType?.name.toLowerCase()} consumed in {fuelType?.unit}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="activity-amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Amount ({fuelType?.unit})
          </label>
          <input
            id="activity-amount"
            type="number"
            min="0"
            step="0.01"
            value={activityAmount}
            onChange={(e) => setActivityAmount(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-neutral-800 text-slate-900 dark:text-slate-100"
            placeholder={`Enter amount in ${fuelType?.unit}`}
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
            placeholder="e.g., Office heating for Q1"
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
      const fuelType = data.fuelType as FuelType;
      
      // Find matching emission factor
      const emissionFactor = SAMPLE_EMISSION_FACTORS.find(
        factor => factor.category === fuelType.category && factor.unit === fuelType.unit
      );

      if (!emissionFactor) {
        throw new Error('No matching emission factor found');
      }

      const calculationInput: CalculationInput = {
        scope: 'scope_1',
        category: fuelType.category as any,
        subcategory: fuelType.subcategory,
        activityData: {
          amount: data.activityAmount,
          unit: fuelType.unit,
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
      setCalculationResult({ error: error instanceof Error ? error.message : 'Calculation failed' });
    } finally {
      setIsCalculating(false);
    }
  };

  const fuelType = data.fuelType as FuelType;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-slate-50 dark:bg-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
          Calculation Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-600 dark:text-slate-400">Fuel Type:</span>
            <span className="ml-2 font-medium text-slate-800 dark:text-slate-200">
              {fuelType?.name}
            </span>
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-400">Amount:</span>
            <span className="ml-2 font-medium text-slate-800 dark:text-slate-200">
              {data.activityAmount} {fuelType?.unit}
            </span>
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-400">Period:</span>
            <span className="ml-2 font-medium text-slate-800 dark:text-slate-200">
              {data.startDate} to {data.endDate}
            </span>
          </div>
          {data.description && (
            <div>
              <span className="text-slate-600 dark:text-slate-400">Description:</span>
              <span className="ml-2 font-medium text-slate-800 dark:text-slate-200">
                {data.description}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {isCalculating && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
          <div className="text-blue-800 dark:text-blue-300">Calculating emissions...</div>
        </div>
      )}

      {calculationResult && !isCalculating && (
        <div className={`rounded-lg p-6 ${
          calculationResult.error
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            : 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
        }`}>
          {calculationResult.error ? (
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                Calculation Error
              </h3>
              <p className="text-red-700 dark:text-red-400">{calculationResult.error}</p>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300 mb-4">
                Calculation Results
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                    {calculationResult.calculatedEmissions.toLocaleString()}
                  </div>
                  <div className="text-sm text-emerald-600 dark:text-emerald-500">
                    kg CO₂e
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-semibold text-emerald-700 dark:text-emerald-400">
                    {(calculationResult.calculatedEmissions / 1000).toFixed(2)}
                  </div>
                  <div className="text-sm text-emerald-600 dark:text-emerald-500">
                    tonnes CO₂e
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-medium text-emerald-700 dark:text-emerald-400">
                    Scope 1
                  </div>
                  <div className="text-sm text-emerald-600 dark:text-emerald-500">
                    Direct Emissions
                  </div>
                </div>
              </div>

              {calculationResult.uncertaintyRange && (
                <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-800">
                  <div className="text-sm text-emerald-700 dark:text-emerald-400">
                    <strong>Uncertainty Range:</strong> {calculationResult.uncertaintyRange.min.toFixed(1)} - {calculationResult.uncertaintyRange.max.toFixed(1)} kg CO₂e
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Main component
export default function Scope1CalculatorPage() {
  const steps: FormStep[] = [
    {
      id: 'fuel-type',
      title: 'Fuel Type',
      description: 'Select the type of fuel or energy source',
      component: FuelTypeStep,
    },
    {
      id: 'activity-data',
      title: 'Activity Data',
      description: 'Enter consumption amounts and time period',
      component: ActivityDataStep,
    },
    {
      id: 'review',
      title: 'Review & Calculate',
      description: 'Review your data and calculate emissions',
      component: ReviewStep,
    },
  ];

  const handleComplete = (data: Record<string, any>) => {
    console.log('Calculation completed:', data);
    // Here you would typically save the calculation to the database
    // and redirect to a results page or dashboard
  };

  const handleCancel = () => {
    window.location.href = '/calculator';
  };

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-emerald-300 mb-2">
            Scope 1 – Direct Emissions Calculator
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Calculate direct emissions from owned or controlled sources
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