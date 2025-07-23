import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, adminProcedure, companyProcedure, commonSchemas } from '../trpc';
import { db } from '../../../../../db/connection';
import * as schema from '../../../../../db/schema';
import { eq, and, desc, gte, lte, or, like, count } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { 
  ApiValidationSchemas, 
  EmissionScope, 
  EmissionCategory,
  CalculationStatus 
} from '../../../../../packages/core/src/types';
import { EmissionCalculator } from '../../../../../packages/core/src/calculator';
import { createAuditLogger } from '../utils/auditLogger';

/**
 * Calculations router handles CO2 emissions calculations
 * Provides full CRUD operations for emission calculations with enhanced validation and security
 */
export const calculationsRouter = createTRPCRouter({
  // Get calculations by company (protected - requires authentication)
  getByCompany: protectedProcedure
    .input(
      z.object({
        companyId: commonSchemas.companyId,
        filters: ApiValidationSchemas.paginationWithFilters.optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { companyId, filters = {} } = input;
      
      // Verify user has access to this company
      if (ctx.session.user.role !== 'admin' && ctx.session.user.companyId !== companyId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this company data',
        });
      }

      try {
        const conditions = [eq(schema.emissionsCalculations.companyId, companyId)];
        
        // Apply filters
        if (filters.scope) {
          conditions.push(eq(schema.emissionsCalculations.scope, filters.scope));
        }
        
        if (filters.category) {
          conditions.push(eq(schema.emissionsCalculations.category, filters.category));
        }
        
        if (filters.status) {
          conditions.push(eq(schema.emissionsCalculations.status, filters.status));
        }
        
        if (filters.startDate) {
          conditions.push(gte(schema.emissionsCalculations.reportingPeriodStart, filters.startDate));
        }
        
        if (filters.endDate) {
          conditions.push(lte(schema.emissionsCalculations.reportingPeriodEnd, filters.endDate));
        }
        
        if (filters.search) {
          conditions.push(
            or(
              like(schema.emissionsCalculations.subcategory, `%${filters.search}%`),
              like(schema.emissionsCalculations.category, `%${filters.search}%`)
            )
          );
        }

        // Get total count for pagination
        const [totalResult] = await db
          .select({ count: count() })
          .from(schema.emissionsCalculations)
          .where(and(...conditions));

        // Get calculations with pagination
        const calculations = await db
          .select({
            id: schema.emissionsCalculations.id,
            scope: schema.emissionsCalculations.scope,
            category: schema.emissionsCalculations.category,
            subcategory: schema.emissionsCalculations.subcategory,
            activityData: schema.emissionsCalculations.activityData,
            activityUnit: schema.emissionsCalculations.activityUnit,
            calculatedEmissions: schema.emissionsCalculations.calculatedEmissions,
            calculationDate: schema.emissionsCalculations.calculationDate,
            reportingPeriodStart: schema.emissionsCalculations.reportingPeriodStart,
            reportingPeriodEnd: schema.emissionsCalculations.reportingPeriodEnd,
            status: schema.emissionsCalculations.status,
            createdAt: schema.emissionsCalculations.createdAt,
            updatedAt: schema.emissionsCalculations.updatedAt,
          })
          .from(schema.emissionsCalculations)
          .where(and(...conditions))
          .orderBy(
            filters.sortOrder === 'asc' 
              ? schema.emissionsCalculations.createdAt
              : desc(schema.emissionsCalculations.createdAt)
          )
          .limit(filters.limit || 50)
          .offset(filters.offset || 0);

        return {
          calculations,
          total: totalResult?.count || 0,
          hasMore: (filters.offset || 0) + calculations.length < (totalResult?.count || 0),
        };
      } catch (error) {
        console.error('Error fetching calculations:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch calculations',
        });
      }
    }),

  // Get calculation by ID (protected)
  getById: protectedProcedure
    .input(z.object({ id: commonSchemas.id }))
    .query(async ({ input, ctx }) => {
      try {
        const calculation = await db
          .select()
          .from(schema.emissionsCalculations)
          .where(eq(schema.emissionsCalculations.id, input.id))
          .limit(1);

        if (!calculation[0]) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Calculation not found',
          });
        }

        // Verify user has access to this company's data
        if (ctx.session.user.role !== 'admin' && ctx.session.user.companyId !== calculation[0].companyId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have access to this calculation',
          });
        }

        return calculation[0];
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error fetching calculation:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch calculation',
        });
      }
    }),

  // Create new calculation (protected)
  create: protectedProcedure
    .input(ApiValidationSchemas.calculationCreate)
    .mutation(async ({ input, ctx }) => {
      // Verify user has access to create calculations for this company
      if (ctx.session.user.role !== 'admin' && ctx.session.user.companyId !== input.companyId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only create calculations for your own company',
        });
      }

      try {
        // Verify company exists
        const company = await db
          .select({ id: schema.companies.id })
          .from(schema.companies)
          .where(eq(schema.companies.id, input.companyId))
          .limit(1);

        if (!company[0]) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Company not found',
          });
        }

        // Get or validate emission factor
        let emissionFactor = null;
        let finalEmissionFactor = input.customEmissionFactor;

        if (input.emissionFactorId) {
          const factorResult = await db
            .select()
            .from(schema.emissionFactors)
            .where(
              and(
                eq(schema.emissionFactors.id, input.emissionFactorId),
                eq(schema.emissionFactors.isActive, true)
              )
            )
            .limit(1);

          if (!factorResult[0]) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Emission factor not found or inactive',
            });
          }

          emissionFactor = factorResult[0];
          finalEmissionFactor = Number(factorResult[0].factor);
        }

        if (!finalEmissionFactor) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Either emission factor ID or custom emission factor is required',
          });
        }

        // Calculate emissions using the core calculator
        const calculator = new EmissionCalculator();
        const calculationResult = await calculator.calculate({
          scope: input.scope as EmissionScope,
          category: input.category as EmissionCategory,
          subcategory: input.subcategory,
          activityData: {
            amount: input.activityData,
            unit: input.activityUnit,
            startDate: input.reportingPeriodStart,
            endDate: input.reportingPeriodEnd,
            description: input.description,
          },
          emissionFactorId: input.emissionFactorId,
          customEmissionFactor: input.customEmissionFactor,
        });

        // Insert calculation into database
        const [newCalculation] = await db
          .insert(schema.emissionsCalculations)
          .values({
            companyId: input.companyId,
            userId: ctx.session.user.id,
            scope: input.scope,
            category: input.category,
            subcategory: input.subcategory,
            activityData: input.activityData.toString(),
            activityUnit: input.activityUnit,
            emissionFactorId: input.emissionFactorId,
            customEmissionFactor: input.customEmissionFactor?.toString(),
            calculatedEmissions: calculationResult.calculatedEmissions.toString(),
            reportingPeriodStart: input.reportingPeriodStart,
            reportingPeriodEnd: input.reportingPeriodEnd,
            status: 'completed',
            calculationDate: new Date(),
            metadata: {
              calculationMethod: calculationResult.calculationMethod || 'standard',
              uncertaintyRange: calculationResult.uncertaintyRange,
            },
          })
          .returning();

        // Log the calculation creation for audit
        const auditLogger = createAuditLogger(ctx);
        await auditLogger.logCalculation('create', newCalculation.id, {
          companyId: input.companyId,
          scope: input.scope,
          category: input.category,
          subcategory: input.subcategory,
          activityData: input.activityData,
          activityUnit: input.activityUnit,
          calculatedEmissions: calculationResult.calculatedEmissions,
          emissionFactorUsed: input.emissionFactorId ? 'standard' : 'custom',
          reportingPeriod: {
            start: input.reportingPeriodStart,
            end: input.reportingPeriodEnd,
          },
        });

        return {
          ...newCalculation,
          calculationResult,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error creating calculation:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create calculation',
        });
      }
    }),

  // Update calculation (protected)
  update: protectedProcedure
    .input(
      z.object({
        id: commonSchemas.id,
        data: z.object({
          subcategory: z.string().optional(),
          activityData: z.number().optional(),
          activityUnit: z.string().optional(),
          customEmissionFactor: z.number().optional(),
          reportingPeriodStart: z.date().optional(),
          reportingPeriodEnd: z.date().optional(),
          status: z.enum(['pending', 'completed', 'error']).optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Get existing calculation
        const existing = await db
          .select()
          .from(schema.emissionsCalculations)
          .where(eq(schema.emissionsCalculations.id, input.id))
          .limit(1);

        if (!existing[0]) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Calculation not found',
          });
        }

        // Verify user has access
        if (ctx.session.user.role !== 'admin' && ctx.session.user.companyId !== existing[0].companyId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have access to update this calculation',
          });
        }

        // If calculation data is being updated, recalculate emissions
        let updatedEmissions = existing[0].calculatedEmissions;
        let calculationMethod = 'standard';

        if (input.data.activityData || input.data.customEmissionFactor) {
          const calculator = new EmissionCalculator();
          
          // Validate enum values from database
          const scope = existing[0].scope as EmissionScope;
          const category = existing[0].category as EmissionCategory;
          
          const calculationResult = await calculator.calculate({
            scope,
            category,
            subcategory: input.data.subcategory || existing[0].subcategory || '',
            activityData: {
              amount: input.data.activityData || Number(existing[0].activityData),
              unit: input.data.activityUnit || existing[0].activityUnit,
              startDate: input.data.reportingPeriodStart || existing[0].reportingPeriodStart,
              endDate: input.data.reportingPeriodEnd || existing[0].reportingPeriodEnd,
            },
            customEmissionFactor: input.data.customEmissionFactor || Number(existing[0].customEmissionFactor),
          });

          updatedEmissions = calculationResult.calculatedEmissions.toString();
          calculationMethod = calculationResult.calculationMethod || 'standard';
        }

        // Update calculation
        const updateData: any = {
          ...input.data,
          updatedAt: new Date(),
        };

        if (input.data.activityData) {
          updateData.activityData = input.data.activityData.toString();
        }
        if (input.data.customEmissionFactor) {
          updateData.customEmissionFactor = input.data.customEmissionFactor.toString();
        }
        if (updatedEmissions !== existing[0].calculatedEmissions) {
          updateData.calculatedEmissions = updatedEmissions;
          updateData.metadata = {
            calculationMethod,
            updatedAt: new Date(),
          };
        }

        const [updatedCalculation] = await db
          .update(schema.emissionsCalculations)
          .set(updateData)
          .where(eq(schema.emissionsCalculations.id, input.id))
          .returning();

        // Log the update for audit
        const auditLogger = createAuditLogger(ctx);
        await auditLogger.logCalculation('update', input.id, {
          changes: input.data,
          previousEmissions: existing[0].calculatedEmissions,
          newEmissions: updatedEmissions,
          companyId: existing[0].companyId,
          scope: existing[0].scope,
          category: existing[0].category,
          recalculated: updatedEmissions !== existing[0].calculatedEmissions,
        });

        return updatedCalculation;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error updating calculation:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update calculation',
        });
      }
    }),

  // Delete calculation (protected)
  delete: protectedProcedure
    .input(z.object({ id: commonSchemas.id }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Get existing calculation
        const existing = await db
          .select()
          .from(schema.emissionsCalculations)
          .where(eq(schema.emissionsCalculations.id, input.id))
          .limit(1);

        if (!existing[0]) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Calculation not found',
          });
        }

        // Verify user has access
        if (ctx.session.user.role !== 'admin' && ctx.session.user.companyId !== existing[0].companyId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have access to delete this calculation',
          });
        }

        // Soft delete by updating status
        await db
          .update(schema.emissionsCalculations)
          .set({
            status: 'error', // using 'error' as soft delete since 'deleted' is not in enum
            updatedAt: new Date(),
          })
          .where(eq(schema.emissionsCalculations.id, input.id));

        // Log the deletion for audit
        const auditLogger = createAuditLogger(ctx);
        await auditLogger.logCalculation('delete', input.id, {
          companyId: existing[0].companyId,
          scope: existing[0].scope,
          category: existing[0].category,
          subcategory: existing[0].subcategory,
          calculatedEmissions: existing[0].calculatedEmissions,
          deletionType: 'soft_delete',
          reportingPeriod: {
            start: existing[0].reportingPeriodStart,
            end: existing[0].reportingPeriodEnd,
          },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error deleting calculation:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete calculation',
        });
      }
    }),

  // Bulk calculate emissions (protected)
  bulkCalculate: protectedProcedure
    .input(
      z.object({
        companyId: commonSchemas.companyId,
        calculations: z.array(ApiValidationSchemas.calculationCreate).min(1).max(100),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify user has access
      if (ctx.session.user.role !== 'admin' && ctx.session.user.companyId !== input.companyId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only create calculations for your own company',
        });
      }

      try {
        const calculator = new EmissionCalculator();
        const results = [];
        const errors = [];

        for (const calculationInput of input.calculations) {
          try {
            const calculationResult = await calculator.calculate({
              scope: calculationInput.scope as EmissionScope,
              category: calculationInput.category as EmissionCategory,
              subcategory: calculationInput.subcategory,
              activityData: {
                amount: calculationInput.activityData,
                unit: calculationInput.activityUnit,
                startDate: calculationInput.reportingPeriodStart,
                endDate: calculationInput.reportingPeriodEnd,
                description: calculationInput.description,
              },
              emissionFactorId: calculationInput.emissionFactorId,
              customEmissionFactor: calculationInput.customEmissionFactor,
            });

            const [newCalculation] = await db
              .insert(schema.emissionsCalculations)
              .values({
                companyId: input.companyId,
                userId: ctx.session.user.id,
                scope: calculationInput.scope,
                category: calculationInput.category,
                subcategory: calculationInput.subcategory,
                activityData: calculationInput.activityData.toString(),
                activityUnit: calculationInput.activityUnit,
                emissionFactorId: calculationInput.emissionFactorId,
                customEmissionFactor: calculationInput.customEmissionFactor?.toString(),
                calculatedEmissions: calculationResult.calculatedEmissions.toString(),
                reportingPeriodStart: calculationInput.reportingPeriodStart,
                reportingPeriodEnd: calculationInput.reportingPeriodEnd,
                status: 'completed',
                calculationDate: new Date(),
                metadata: {
                  calculationMethod: calculationResult.calculationMethod || 'standard',
                  uncertaintyRange: calculationResult.uncertaintyRange,
                },
              })
              .returning();

            results.push(newCalculation);
          } catch (error) {
            errors.push({
              input: calculationInput,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }

        // Log bulk calculation for audit
        await db.insert(schema.auditLog).values({
          userId: ctx.session.user.id,
          action: 'create',
          resourceType: 'calculation',
          details: {
            type: 'bulk_create',
            companyId: input.companyId,
            successCount: results.length,
            errorCount: errors.length,
            totalAttempted: input.calculations.length,
          },
        });

        return {
          successes: results,
          errors,
          summary: {
            total: input.calculations.length,
            succeeded: results.length,
            failed: errors.length,
          },
        };
      } catch (error) {
        console.error('Error in bulk calculation:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process bulk calculations',
        });
      }
    }),

  // Get calculation statistics (admin only)
  getStatistics: adminProcedure
    .input(
      z.object({
        companyId: commonSchemas.companyId.optional(),
        dateRange: commonSchemas.dateRange.optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const conditions = [];
        
        if (input.companyId) {
          conditions.push(eq(schema.emissionsCalculations.companyId, input.companyId));
        }
        
        if (input.dateRange) {
          conditions.push(
            and(
              gte(schema.emissionsCalculations.reportingPeriodStart, input.dateRange.startDate),
              lte(schema.emissionsCalculations.reportingPeriodEnd, input.dateRange.endDate)
            )
          );
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const stats = await db
          .select({
            scope: schema.emissionsCalculations.scope,
            category: schema.emissionsCalculations.category,
            calculatedEmissions: schema.emissionsCalculations.calculatedEmissions,
            status: schema.emissionsCalculations.status,
          })
          .from(schema.emissionsCalculations)
          .where(whereClause);

        // Process statistics
        const summary = {
          totalCalculations: stats.length,
          totalEmissions: stats.reduce((sum, calc) => sum + Number(calc.calculatedEmissions || 0), 0),
          byScope: {
            scope_1: stats.filter(s => s.scope === 'scope_1').reduce((sum, calc) => sum + Number(calc.calculatedEmissions || 0), 0),
            scope_2: stats.filter(s => s.scope === 'scope_2').reduce((sum, calc) => sum + Number(calc.calculatedEmissions || 0), 0),
            scope_3: stats.filter(s => s.scope === 'scope_3').reduce((sum, calc) => sum + Number(calc.calculatedEmissions || 0), 0),
          },
          byStatus: {
            completed: stats.filter(s => s.status === 'completed').length,
            pending: stats.filter(s => s.status === 'pending').length,
            error: stats.filter(s => s.status === 'error').length,
          },
        };

        return summary;
      } catch (error) {
        console.error('Error fetching statistics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch calculation statistics',
        });
      }
    }),
}); 