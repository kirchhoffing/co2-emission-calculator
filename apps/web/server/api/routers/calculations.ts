import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { db } from '../../../../../db/connection';
import * as schema from '../../../../../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

/**
 * Calculations router handles CO2 emissions calculations
 * Provides full CRUD operations for emission calculations
 */
export const calculationsRouter = createTRPCRouter({
  // Get calculations by company
  getByCompany: publicProcedure
    .input(
      z.object({
        companyId: z.string().uuid(),
        scope: z.enum(['scope_1', 'scope_2', 'scope_3']).optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        const conditions = [eq(schema.emissionsCalculations.companyId, input.companyId)];
        
        if (input.scope) {
          conditions.push(eq(schema.emissionsCalculations.scope, input.scope));
        }

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
          })
          .from(schema.emissionsCalculations)
          .where(and(...conditions))
          .orderBy(desc(schema.emissionsCalculations.createdAt))
          .limit(input.limit);

        return calculations;
      } catch (error) {
        console.error('Error fetching calculations:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch calculations',
        });
      }
    }),

  // Get calculation by ID
  getById: publicProcedure
    .input(z.string().uuid())
    .query(async ({ input }) => {
      try {
        const [calculation] = await db
          .select()
          .from(schema.emissionsCalculations)
          .where(eq(schema.emissionsCalculations.id, input))
          .limit(1);

        if (!calculation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Calculation not found',
          });
        }

        return calculation;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error fetching calculation:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch calculation',
        });
      }
    }),

  // Create new calculation
  create: publicProcedure
    .input(
      z.object({
        companyId: z.string().uuid(),
        userId: z.string().uuid(),
        scope: z.enum(['scope_1', 'scope_2', 'scope_3']),
        category: z.string().min(1),
        subcategory: z.string().optional(),
        activityData: z.number().positive(),
        activityUnit: z.string().min(1),
        emissionFactorId: z.string().uuid().optional(),
        customEmissionFactor: z.number().positive().optional(),
        reportingPeriodStart: z.date(),
        reportingPeriodEnd: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Basic validation
        if (!input.emissionFactorId && !input.customEmissionFactor) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Either emissionFactorId or customEmissionFactor must be provided',
          });
        }

        let calculatedEmissions = 0;
        
        // Calculate emissions based on emission factor
        if (input.emissionFactorId) {
          const [emissionFactor] = await db
            .select()
            .from(schema.emissionFactors)
            .where(eq(schema.emissionFactors.id, input.emissionFactorId))
            .limit(1);

          if (!emissionFactor) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Emission factor not found',
            });
          }

          calculatedEmissions = Number(input.activityData) * Number(emissionFactor.factor);
        } else if (input.customEmissionFactor) {
          calculatedEmissions = Number(input.activityData) * Number(input.customEmissionFactor);
        }

        // Insert calculation
        const [calculation] = await db
          .insert(schema.emissionsCalculations)
          .values({
            companyId: input.companyId,
            userId: input.userId,
            scope: input.scope,
            category: input.category,
            subcategory: input.subcategory,
            activityData: input.activityData.toString(),
            activityUnit: input.activityUnit,
            emissionFactorId: input.emissionFactorId,
            customEmissionFactor: input.customEmissionFactor?.toString(),
            calculatedEmissions: calculatedEmissions.toString(),
            calculationDate: new Date(),
            reportingPeriodStart: input.reportingPeriodStart,
            reportingPeriodEnd: input.reportingPeriodEnd,
            status: 'completed',
          })
          .returning();

        return calculation;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error creating calculation:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create calculation',
        });
      }
    }),

  // Update calculation
  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        activityData: z.number().positive().optional(),
        activityUnit: z.string().min(1).optional(),
        customEmissionFactor: z.number().positive().optional(),
        status: z.enum(['pending', 'completed', 'error']).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, ...updateData } = input;

        // If activityData or customEmissionFactor is being updated, recalculate emissions
        if (updateData.activityData || updateData.customEmissionFactor) {
          const [existing] = await db
            .select()
            .from(schema.emissionsCalculations)
            .where(eq(schema.emissionsCalculations.id, id))
            .limit(1);

          if (!existing) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Calculation not found',
            });
          }

          const activityData = updateData.activityData || Number(existing.activityData);
          const emissionFactor = updateData.customEmissionFactor || Number(existing.customEmissionFactor);
          
          if (emissionFactor) {
            const calculatedEmissions = activityData * emissionFactor;
            (updateData as any).calculatedEmissions = calculatedEmissions.toString();
          }
        }

        // Convert number fields to strings for database storage
        const dbUpdateData = {
          ...updateData,
          activityData: updateData.activityData?.toString(),
          customEmissionFactor: updateData.customEmissionFactor?.toString(),
          updatedAt: new Date(),
        };

        const [calculation] = await db
          .update(schema.emissionsCalculations)
          .set(dbUpdateData)
          .where(eq(schema.emissionsCalculations.id, id))
          .returning();

        if (!calculation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Calculation not found',
          });
        }

        return calculation;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error updating calculation:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update calculation',
        });
      }
    }),

  // Delete calculation
  delete: publicProcedure
    .input(z.string().uuid())
    .mutation(async ({ input }) => {
      try {
        const [deleted] = await db
          .delete(schema.emissionsCalculations)
          .where(eq(schema.emissionsCalculations.id, input))
          .returning({ id: schema.emissionsCalculations.id });

        if (!deleted) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Calculation not found',
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error deleting calculation:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete calculation',
        });
      }
    }),
}); 