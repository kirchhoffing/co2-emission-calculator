import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { db } from '../../../../../db/connection';
import * as schema from '../../../../../db/schema';
import { eq, and, desc, ilike, count, isNotNull } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { createAuditLogger } from '../utils/auditLogger';

/**
 * Companies router handles company management
 * Provides CRUD operations for companies and related data
 */
export const companiesRouter = createTRPCRouter({
  // Get all companies with pagination and search
  getAll: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        industryType: z.string().optional(),
        country: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const conditions = [];
        
        if (input.search) {
          conditions.push(ilike(schema.companies.name, `%${input.search}%`));
        }
        
        if (input.industryType) {
          conditions.push(eq(schema.companies.industryType, input.industryType));
        }
        
        if (input.country) {
          conditions.push(eq(schema.companies.country, input.country));
        }

        const companies = await db
          .select({
            id: schema.companies.id,
            name: schema.companies.name,
            industryType: schema.companies.industryType,
            country: schema.companies.country,
            employeeCount: schema.companies.employeeCount,
            reportingYear: schema.companies.reportingYear,
            createdAt: schema.companies.createdAt,
          })
          .from(schema.companies)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(schema.companies.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        // Get total count for pagination
        const [{ totalCount }] = await db
          .select({
            totalCount: count(schema.companies.id),
          })
          .from(schema.companies)
          .where(conditions.length > 0 ? and(...conditions) : undefined);

        return {
          companies,
          totalCount,
          hasMore: input.offset + input.limit < totalCount,
        };
      } catch (error) {
        console.error('Error fetching companies:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch companies',
        });
      }
    }),

  // Get company by ID
  getById: publicProcedure
    .input(z.string().uuid())
    .query(async ({ input }) => {
      try {
        const [company] = await db
          .select()
          .from(schema.companies)
          .where(eq(schema.companies.id, input))
          .limit(1);

        if (!company) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Company not found',
          });
        }

        return company;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error fetching company:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch company',
        });
      }
    }),

  // Create new company
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        industryType: z.string().optional(),
        country: z.string().optional(),
        employeeCount: z.number().int().positive().optional(),
        annualRevenue: z.number().positive().optional(),
        reportingYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const [company] = await db
          .insert(schema.companies)
          .values({
            name: input.name,
            industryType: input.industryType,
            country: input.country,
            employeeCount: input.employeeCount,
            annualRevenue: input.annualRevenue?.toString(),
            reportingYear: input.reportingYear || new Date().getFullYear(),
          })
          .returning();

        // Log company creation for audit
        const auditLogger = createAuditLogger(ctx);
        await auditLogger.logCompany('create', company.id, {
          name: company.name,
          industryType: company.industryType,
          country: company.country,
          employeeCount: company.employeeCount,
          annualRevenue: company.annualRevenue,
          reportingYear: company.reportingYear,
        });

        return company;
      } catch (error) {
        console.error('Error creating company:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create company',
        });
      }
    }),

  // Update company
  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        industryType: z.string().optional(),
        country: z.string().optional(),
        employeeCount: z.number().int().positive().optional(),
        annualRevenue: z.number().positive().optional(),
        reportingYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...updateData } = input;

        // Convert number fields to strings for database storage
        const dbUpdateData = {
          ...updateData,
          annualRevenue: updateData.annualRevenue?.toString(),
          updatedAt: new Date(),
        };

        const [company] = await db
          .update(schema.companies)
          .set(dbUpdateData)
          .where(eq(schema.companies.id, id))
          .returning();

        if (!company) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Company not found',
          });
        }

        // Log company update for audit
        const auditLogger = createAuditLogger(ctx);
        await auditLogger.logCompany('update', id, {
          changes: updateData,
          companyName: company.name,
        });

        return company;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error updating company:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update company',
        });
      }
    }),

  // Delete company
  delete: publicProcedure
    .input(z.string().uuid())
    .mutation(async ({ input, ctx }) => {
      try {
        // Get company details before deletion for audit logging
        const [companyToDelete] = await db
          .select({
            id: schema.companies.id,
            name: schema.companies.name,
            industryType: schema.companies.industryType,
            country: schema.companies.country,
          })
          .from(schema.companies)
          .where(eq(schema.companies.id, input))
          .limit(1);

        if (!companyToDelete) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Company not found',
          });
        }

        // Check if company has users or data
        const [userCount] = await db
          .select({
            count: count(schema.users.id),
          })
          .from(schema.users)
          .where(eq(schema.users.companyId, input));

        if (userCount.count > 0) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Cannot delete company with existing users',
          });
        }

        const [deleted] = await db
          .delete(schema.companies)
          .where(eq(schema.companies.id, input))
          .returning({ id: schema.companies.id });

        // Log company deletion for audit
        const auditLogger = createAuditLogger(ctx);
        await auditLogger.logCompany('delete', input, {
          name: companyToDelete.name,
          industryType: companyToDelete.industryType,
          country: companyToDelete.country,
          deletionType: 'hard_delete',
          hadUsers: userCount.count > 0,
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error deleting company:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete company',
        });
      }
    }),

  // Get company statistics
  getStatistics: publicProcedure
    .input(z.string().uuid())
    .query(async ({ input: companyId }) => {
      try {
        // Get user count
        const [userStats] = await db
          .select({
            totalUsers: count(schema.users.id),
          })
          .from(schema.users)
          .where(eq(schema.users.companyId, companyId));

        // Get calculation count
        const [calculationStats] = await db
          .select({
            totalCalculations: count(schema.emissionsCalculations.id),
            completedCalculations: count(schema.emissionsCalculations.id),
          })
          .from(schema.emissionsCalculations)
          .where(eq(schema.emissionsCalculations.companyId, companyId));

        // Get report count
        const [reportStats] = await db
          .select({
            totalReports: count(schema.reports.id),
          })
          .from(schema.reports)
          .where(eq(schema.reports.companyId, companyId));

        return {
          totalUsers: userStats.totalUsers,
          totalCalculations: calculationStats.totalCalculations,
          completedCalculations: calculationStats.completedCalculations,
          totalReports: reportStats.totalReports,
        };
      } catch (error) {
        console.error('Error fetching company statistics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch company statistics',
        });
      }
    }),

  // Get industry types for filtering
  getIndustryTypes: publicProcedure
    .query(async () => {
      try {
        const industryTypes = await db
          .selectDistinct({
            industryType: schema.companies.industryType,
          })
          .from(schema.companies)
          .where(isNotNull(schema.companies.industryType))
          .orderBy(schema.companies.industryType);

        return industryTypes.map(i => i.industryType).filter(Boolean);
      } catch (error) {
        console.error('Error fetching industry types:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch industry types',
        });
      }
    }),

  // Get countries for filtering
  getCountries: publicProcedure
    .query(async () => {
      try {
        const countries = await db
          .selectDistinct({
            country: schema.companies.country,
          })
          .from(schema.companies)
          .where(isNotNull(schema.companies.country))
          .orderBy(schema.companies.country);

        return countries.map(c => c.country).filter(Boolean);
      } catch (error) {
        console.error('Error fetching countries:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch countries',
        });
      }
    }),
}); 