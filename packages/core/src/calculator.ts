import { 
  CalculationInput, 
  CalculationResult, 
  EmissionFactor, 
  ActivityData,
  CalculationStatus,
  validateCalculationInput 
} from './types';
import { convertUnit, areUnitsCompatible } from './utils/unitConversion';

export class EmissionCalculator {
  private emissionFactors: Map<string, EmissionFactor> = new Map();

  constructor(emissionFactors: EmissionFactor[] = []) {
    this.loadEmissionFactors(emissionFactors);
  }

  /**
   * Load emission factors into the calculator
   */
  loadEmissionFactors(factors: EmissionFactor[]): void {
    factors.forEach(factor => {
      this.emissionFactors.set(factor.id, factor);
    });
  }

  /**
   * Get an emission factor by ID
   */
  getEmissionFactor(id: string): EmissionFactor | undefined {
    return this.emissionFactors.get(id);
  }

  /**
   * Calculate CO2 emissions for a given input
   */
  async calculate(input: CalculationInput): Promise<CalculationResult> {
    try {
      // Validate input
      const validatedInput = validateCalculationInput(input);

      // Generate unique calculation ID
      const calculationId = this.generateCalculationId();

      // Determine emission factor
      let emissionFactor: EmissionFactor | undefined;
      let factorValue: number;

      if (validatedInput.emissionFactorId) {
        emissionFactor = this.getEmissionFactor(validatedInput.emissionFactorId);
        if (!emissionFactor) {
          throw new Error(`Emission factor not found: ${validatedInput.emissionFactorId}`);
        }
        factorValue = emissionFactor.factor;
      } else if (validatedInput.customEmissionFactor) {
        factorValue = validatedInput.customEmissionFactor;
      } else {
        throw new Error('No emission factor provided');
      }

      // Perform unit conversion if necessary
      const activityAmount = await this.convertActivityDataUnits(
        validatedInput.activityData,
        emissionFactor
      );

      // Calculate emissions based on scope and category
      const calculatedEmissions = await this.performCalculation(
        validatedInput,
        activityAmount,
        factorValue
      );

      // Create calculation result
      const result: CalculationResult = {
        id: calculationId,
        input: validatedInput,
        emissionFactor,
        calculatedEmissions,
        calculationMethod: this.getCalculationMethod(validatedInput),
        uncertaintyRange: this.calculateUncertaintyRange(calculatedEmissions, emissionFactor),
        calculatedAt: new Date(),
        status: 'completed' as CalculationStatus,
      };

      return result;

    } catch (error) {
      const calculationId = this.generateCalculationId();
      
      return {
        id: calculationId,
        input,
        calculatedEmissions: 0,
        calculationMethod: 'error',
        calculatedAt: new Date(),
        status: 'error' as CalculationStatus,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
      };
    }
  }

  /**
   * Convert activity data units to match emission factor units
   */
  private async convertActivityDataUnits(
    activityData: ActivityData,
    emissionFactor?: EmissionFactor
  ): Promise<number> {
    if (!emissionFactor) {
      return activityData.amount;
    }

    const fromUnit = activityData.unit;
    const toUnit = emissionFactor.unit;

    if (fromUnit === toUnit) {
      return activityData.amount;
    }

    if (!areUnitsCompatible(fromUnit, toUnit)) {
      throw new Error(
        `Incompatible units: activity data in ${fromUnit}, emission factor in ${toUnit}`
      );
    }

    try {
      return convertUnit(activityData.amount, fromUnit, toUnit);
    } catch (error) {
      throw new Error(`Unit conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Perform the actual emissions calculation
   */
  private async performCalculation(
    input: CalculationInput,
    activityAmount: number,
    emissionFactor: number
  ): Promise<number> {
    switch (input.scope) {
      case 'scope_1':
        return this.calculateScope1Emissions(input, activityAmount, emissionFactor);
      
      case 'scope_2':
        return this.calculateScope2Emissions(input, activityAmount, emissionFactor);
      
      case 'scope_3':
        return this.calculateScope3Emissions(input, activityAmount, emissionFactor);
      
      default:
        throw new Error(`Unsupported emission scope: ${input.scope}`);
    }
  }

  /**
   * Calculate Scope 1 (direct) emissions
   */
  private calculateScope1Emissions(
    input: CalculationInput,
    activityAmount: number,
    emissionFactor: number
  ): number {
    // Basic calculation: Activity Data × Emission Factor = CO2 Emissions
    const baseEmissions = activityAmount * emissionFactor;

    // Apply any category-specific adjustments
    switch (input.category) {
      case 'stationary_combustion':
        return this.adjustForStationaryCombustion(baseEmissions, input);
      
      case 'mobile_combustion':
        return this.adjustForMobileCombustion(baseEmissions, input);
      
      case 'process_emissions':
        return this.adjustForProcessEmissions(baseEmissions, input);
      
      case 'fugitive_emissions':
        return this.adjustForFugitiveEmissions(baseEmissions, input);
      
      default:
        return baseEmissions;
    }
  }

  /**
   * Calculate Scope 2 (indirect energy) emissions
   */
  private calculateScope2Emissions(
    input: CalculationInput,
    activityAmount: number,
    emissionFactor: number
  ): number {
    // For scope 2, we typically use grid emission factors
    const baseEmissions = activityAmount * emissionFactor;

    // Apply location-based or market-based method adjustments
    return this.adjustForScope2Method(baseEmissions, input);
  }

  /**
   * Calculate Scope 3 (other indirect) emissions
   */
  private calculateScope3Emissions(
    input: CalculationInput,
    activityAmount: number,
    emissionFactor: number
  ): number {
    const baseEmissions = activityAmount * emissionFactor;

    // Scope 3 may require different calculation methods based on category
    switch (input.category) {
      case 'business_travel':
        return this.adjustForBusinessTravel(baseEmissions, input);
      
      case 'employee_commuting':
        return this.adjustForEmployeeCommuting(baseEmissions, input);
      
      default:
        return baseEmissions;
    }
  }

  /**
   * Category-specific adjustment methods
   */
  private adjustForStationaryCombustion(emissions: number, input: CalculationInput): number {
    // Could apply adjustments for equipment efficiency, fuel quality, etc.
    return emissions;
  }

  private adjustForMobileCombustion(emissions: number, input: CalculationInput): number {
    // Could apply adjustments for vehicle efficiency, load factors, etc.
    return emissions;
  }

  private adjustForProcessEmissions(emissions: number, input: CalculationInput): number {
    // Could apply adjustments for process efficiency, operating conditions, etc.
    return emissions;
  }

  private adjustForFugitiveEmissions(emissions: number, input: CalculationInput): number {
    // Could apply adjustments for leak rates, equipment condition, etc.
    return emissions;
  }

  private adjustForScope2Method(emissions: number, input: CalculationInput): number {
    // Could switch between location-based and market-based methods
    const method = input.metadata?.calculationMethod || 'location_based';
    
    if (method === 'market_based') {
      // Apply market-based adjustments (renewable energy certificates, etc.)
      const renewablePercentage = input.metadata?.renewablePercentage || 0;
      return emissions * (1 - renewablePercentage / 100);
    }
    
    return emissions;
  }

  private adjustForBusinessTravel(emissions: number, input: CalculationInput): number {
    // Could apply adjustments for travel class, occupancy rates, etc.
    return emissions;
  }

  private adjustForEmployeeCommuting(emissions: number, input: CalculationInput): number {
    // Could apply adjustments for commute patterns, remote work, etc.
    return emissions;
  }

  /**
   * Calculate uncertainty range for the emissions calculation
   */
  private calculateUncertaintyRange(
    emissions: number, 
    emissionFactor?: EmissionFactor
  ): { min: number; max: number } | undefined {
    if (!emissionFactor) return undefined;

    // Apply typical uncertainty ranges based on data quality
    // These could be sourced from the emission factor metadata
    const uncertaintyPercentage = 0.1; // 10% default uncertainty
    
    return {
      min: emissions * (1 - uncertaintyPercentage),
      max: emissions * (1 + uncertaintyPercentage),
    };
  }

  /**
   * Get human-readable calculation method description
   */
  private getCalculationMethod(input: CalculationInput): string {
    const baseMethod = `${input.scope.toUpperCase()} ${input.category}`;
    
    if (input.customEmissionFactor) {
      return `${baseMethod} (custom emission factor)`;
    }
    
    return `${baseMethod} (standard emission factor)`;
  }

  /**
   * Generate unique calculation ID
   */
  private generateCalculationId(): string {
    return `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Batch calculate multiple emissions
   */
  async batchCalculate(inputs: CalculationInput[]): Promise<CalculationResult[]> {
    const results: CalculationResult[] = [];
    
    for (const input of inputs) {
      const result = await this.calculate(input);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Get summary statistics for multiple calculations
   */
  getSummaryStatistics(results: CalculationResult[]): {
    totalEmissions: number;
    scope1Total: number;
    scope2Total: number;
    scope3Total: number;
    calculationCount: number;
    errorCount: number;
  } {
    const completedResults = results.filter(r => r.status === 'completed');
    const errorCount = results.filter(r => r.status === 'error').length;
    
    const totals = completedResults.reduce(
      (acc, result) => {
        acc.total += result.calculatedEmissions;
        
        switch (result.input.scope) {
          case 'scope_1':
            acc.scope1 += result.calculatedEmissions;
            break;
          case 'scope_2':
            acc.scope2 += result.calculatedEmissions;
            break;
          case 'scope_3':
            acc.scope3 += result.calculatedEmissions;
            break;
        }
        
        return acc;
      },
      { total: 0, scope1: 0, scope2: 0, scope3: 0 }
    );

    return {
      totalEmissions: totals.total,
      scope1Total: totals.scope1,
      scope2Total: totals.scope2,
      scope3Total: totals.scope3,
      calculationCount: completedResults.length,
      errorCount,
    };
  }
}

// Factory function to create calculator instance
export function createEmissionCalculator(emissionFactors: EmissionFactor[] = []): EmissionCalculator {
  return new EmissionCalculator(emissionFactors);
} 