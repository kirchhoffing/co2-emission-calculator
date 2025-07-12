import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { db } from '../../../../../db/connection';
import * as schema from '../../../../../db/schema';
import { eq, and, desc, ilike, isNotNull } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

/**
 * Emission Factors router handles standardized CO2 emission factors
 * Provides CRUD operations for emission factors management
 */
export const emissionFactorsRouter = createTRPCRouter({
  // Get all emission factors
  getAll: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        subcategory: z.string().optional(),
        region: z.string().optional(),
        year: z.number().int().optional(),
        isActive: z.boolean().optional().default(true),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        const conditions = [];
        
        if (input.category) {
          conditions.push(ilike(schema.emissionFactors.category, `%${input.category}%`));
        }
        
        if (input.subcategory) {
          conditions.push(ilike(schema.emissionFactors.subcategory, `%${input.subcategory}%`));
        }
        
        if (input.region) {
          conditions.push(ilike(schema.emissionFactors.region, `%${input.region}%`));
        }
        
        if (input.year) {
          conditions.push(eq(schema.emissionFactors.year, input.year));
        }
        
        if (input.isActive !== undefined) {
          conditions.push(eq(schema.emissionFactors.isActive, input.isActive));
        }

        const emissionFactors = await db
          .select({
            id: schema.emissionFactors.id,
            category: schema.emissionFactors.category,
            subcategory: schema.emissionFactors.subcategory,
            factor: schema.emissionFactors.factor,
            unit: schema.emissionFactors.unit,
            source: schema.emissionFactors.source,
            region: schema.emissionFactors.region,
            year: schema.emissionFactors.year,
            isActive: schema.emissionFactors.isActive,
            createdAt: schema.emissionFactors.createdAt,
          })
          .from(schema.emissionFactors)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(schema.emissionFactors.year), schema.emissionFactors.category)
          .limit(input.limit);

        return emissionFactors;
      } catch (error) {
        console.error('Error fetching emission factors:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch emission factors',
        });
      }
    }),

  // Get emission factor by ID
  getById: publicProcedure
    .input(z.string().uuid())
    .query(async ({ input }) => {
      try {
        const [emissionFactor] = await db
          .select()
          .from(schema.emissionFactors)
          .where(eq(schema.emissionFactors.id, input))
          .limit(1);

        if (!emissionFactor) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Emission factor not found',
          });
        }

        return emissionFactor;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error fetching emission factor:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch emission factor',
        });
      }
    }),

  // Create new emission factor
  create: publicProcedure
    .input(
      z.object({
        category: z.string().min(1),
        subcategory: z.string().optional(),
        factor: z.number().positive(),
        unit: z.string().min(1),
        source: z.string().min(1),
        region: z.string().optional(),
        year: z.number().int().min(1900).max(new Date().getFullYear()),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const [emissionFactor] = await db
          .insert(schema.emissionFactors)
          .values({
            category: input.category,
            subcategory: input.subcategory,
            factor: input.factor.toString(),
            unit: input.unit,
            source: input.source,
            region: input.region,
            year: input.year,
            isActive: input.isActive,
          })
          .returning();

        return emissionFactor;
      } catch (error) {
        console.error('Error creating emission factor:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create emission factor',
        });
      }
    }),

  // Update emission factor
  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        category: z.string().min(1).optional(),
        subcategory: z.string().optional(),
        factor: z.number().positive().optional(),
        unit: z.string().min(1).optional(),
        source: z.string().min(1).optional(),
        region: z.string().optional(),
        year: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, ...updateData } = input;

        // Convert number fields to strings for database storage
        const dbUpdateData = {
          ...updateData,
          factor: updateData.factor?.toString(),
          updatedAt: new Date(),
        };

        const [emissionFactor] = await db
          .update(schema.emissionFactors)
          .set(dbUpdateData)
          .where(eq(schema.emissionFactors.id, id))
          .returning();

        if (!emissionFactor) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Emission factor not found',
          });
        }

        return emissionFactor;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error updating emission factor:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update emission factor',
        });
      }
    }),

  // Delete emission factor
  delete: publicProcedure
    .input(z.string().uuid())
    .mutation(async ({ input }) => {
      try {
        const [deleted] = await db
          .delete(schema.emissionFactors)
          .where(eq(schema.emissionFactors.id, input))
          .returning({ id: schema.emissionFactors.id });

        if (!deleted) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Emission factor not found',
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error deleting emission factor:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete emission factor',
        });
      }
    }),

  // Get categories for filtering
  getCategories: publicProcedure
    .query(async () => {
      try {
        const categories = await db
          .selectDistinct({
            category: schema.emissionFactors.category,
          })
          .from(schema.emissionFactors)
          .where(eq(schema.emissionFactors.isActive, true))
          .orderBy(schema.emissionFactors.category);

        return categories.map(c => c.category);
      } catch (error) {
        console.error('Error fetching categories:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch categories',
        });
      }
    }),

  // Get subcategories for a specific category
  getSubcategories: publicProcedure
    .input(z.string().min(1))
    .query(async ({ input }) => {
      try {
        const subcategories = await db
          .selectDistinct({
            subcategory: schema.emissionFactors.subcategory,
          })
          .from(schema.emissionFactors)
          .where(and(
            eq(schema.emissionFactors.category, input),
            eq(schema.emissionFactors.isActive, true),
            isNotNull(schema.emissionFactors.subcategory)
          ))
          .orderBy(schema.emissionFactors.subcategory);

        return subcategories.map(s => s.subcategory).filter(Boolean);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch subcategories',
        });
      }
    }),

  // Get regions for filtering
  getRegions: publicProcedure
    .query(async () => {
      try {
        const regions = await db
          .selectDistinct({
            region: schema.emissionFactors.region,
          })
          .from(schema.emissionFactors)
          .where(and(
            eq(schema.emissionFactors.isActive, true),
            isNotNull(schema.emissionFactors.region)
          ))
          .orderBy(schema.emissionFactors.region);

        return regions.map(r => r.region).filter(Boolean);
      } catch (error) {
        console.error('Error fetching regions:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch regions',
        });
      }
    }),
}); 