import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { db } from '../../../../../db/connection';
import * as schema from '../../../../../db/schema';
import { eq, and, desc, sum } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { createAuditLogger } from '../utils/auditLogger';

/**
 * Reports router handles CO2 emission report generation and management
 * Provides CRUD operations for reports and report generation
 */
export const reportsRouter = createTRPCRouter({
  // Get reports by company
  getByCompany: publicProcedure
    .input(
      z.object({
        companyId: z.string().uuid(),
        format: z.enum(['pdf', 'json', 'csv']).optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        const conditions = [eq(schema.reports.companyId, input.companyId)];
        
        if (input.format) {
          conditions.push(eq(schema.reports.format, input.format));
        }

        const reports = await db
          .select({
            id: schema.reports.id,
            title: schema.reports.title,
            description: schema.reports.description,
            format: schema.reports.format,
            scope1Total: schema.reports.scope1Total,
            scope2Total: schema.reports.scope2Total,
            scope3Total: schema.reports.scope3Total,
            totalEmissions: schema.reports.totalEmissions,
            reportingPeriodStart: schema.reports.reportingPeriodStart,
            reportingPeriodEnd: schema.reports.reportingPeriodEnd,
            generatedAt: schema.reports.generatedAt,
            isPublic: schema.reports.isPublic,
            createdAt: schema.reports.createdAt,
          })
          .from(schema.reports)
          .where(and(...conditions))
          .orderBy(desc(schema.reports.generatedAt))
          .limit(input.limit);

        return reports;
      } catch (error) {
        console.error('Error fetching reports:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch reports',
        });
      }
    }),

  // Get report by ID
  getById: publicProcedure
    .input(z.string().uuid())
    .query(async ({ input }) => {
      try {
        const [report] = await db
          .select()
          .from(schema.reports)
          .where(eq(schema.reports.id, input))
          .limit(1);

        if (!report) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Report not found',
          });
        }

        return report;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error fetching report:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch report',
        });
      }
    }),

  // Create new report
  create: publicProcedure
    .input(
      z.object({
        companyId: z.string().uuid(),
        userId: z.string().uuid(),
        title: z.string().min(1),
        description: z.string().optional(),
        format: z.enum(['pdf', 'json', 'csv']),
        reportingPeriodStart: z.date(),
        reportingPeriodEnd: z.date(),
        isPublic: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Calculate totals from existing calculations for the reporting period
        const calculationsInPeriod = await db
          .select({
            scope: schema.emissionsCalculations.scope,
            calculatedEmissions: schema.emissionsCalculations.calculatedEmissions,
          })
          .from(schema.emissionsCalculations)
          .where(and(
            eq(schema.emissionsCalculations.companyId, input.companyId),
            eq(schema.emissionsCalculations.status, 'completed')
          ));

        let scope1Total = 0;
        let scope2Total = 0;
        let scope3Total = 0;

        calculationsInPeriod.forEach(calc => {
          const emissions = Number(calc.calculatedEmissions);
          switch (calc.scope) {
            case 'scope_1':
              scope1Total += emissions;
              break;
            case 'scope_2':
              scope2Total += emissions;
              break;
            case 'scope_3':
              scope3Total += emissions;
              break;
          }
        });

        const totalEmissions = scope1Total + scope2Total + scope3Total;

        // Create report with calculated totals
        const [report] = await db
          .insert(schema.reports)
          .values({
            companyId: input.companyId,
            userId: input.userId,
            title: input.title,
            description: input.description,
            format: input.format,
            scope1Total: scope1Total > 0 ? scope1Total.toString() : null,
            scope2Total: scope2Total > 0 ? scope2Total.toString() : null,
            scope3Total: scope3Total > 0 ? scope3Total.toString() : null,
            totalEmissions: totalEmissions.toString(),
            reportingPeriodStart: input.reportingPeriodStart,
            reportingPeriodEnd: input.reportingPeriodEnd,
            isPublic: input.isPublic,
            reportData: {
              calculationsCount: calculationsInPeriod.length,
              generatedAt: new Date().toISOString(),
            },
          })
          .returning();

        // Log report creation for audit
        const auditLogger = createAuditLogger(ctx);
        await auditLogger.logReport('create', report.id, {
          companyId: input.companyId,
          title: input.title,
          format: input.format,
          totalEmissions: totalEmissions,
          scope1Total,
          scope2Total,
          scope3Total,
          calculationsIncluded: calculationsInPeriod.length,
          reportingPeriod: {
            start: input.reportingPeriodStart,
            end: input.reportingPeriodEnd,
          },
          isPublic: input.isPublic,
        });

        return report;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error creating report:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create report',
        });
      }
    }),

  // Update report
  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...updateData } = input;

        const [report] = await db
          .update(schema.reports)
          .set({
            ...updateData,
            updatedAt: new Date(),
          })
          .where(eq(schema.reports.id, id))
          .returning();

        if (!report) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Report not found',
          });
        }

        // Log report update for audit
        const auditLogger = createAuditLogger(ctx);
        await auditLogger.logReport('update', id, {
          changes: updateData,
          reportTitle: report.title,
          companyId: report.companyId,
        });

        return report;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error updating report:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update report',
        });
      }
    }),

  // Delete report
  delete: publicProcedure
    .input(z.string().uuid())
    .mutation(async ({ input, ctx }) => {
      try {
        // Get report details before deletion for audit logging
        const [reportToDelete] = await db
          .select({
            id: schema.reports.id,
            title: schema.reports.title,
            companyId: schema.reports.companyId,
            format: schema.reports.format,
            totalEmissions: schema.reports.totalEmissions,
          })
          .from(schema.reports)
          .where(eq(schema.reports.id, input))
          .limit(1);

        if (!reportToDelete) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Report not found',
          });
        }

        const [deleted] = await db
          .delete(schema.reports)
          .where(eq(schema.reports.id, input))
          .returning({ id: schema.reports.id });

        // Log report deletion for audit
        const auditLogger = createAuditLogger(ctx);
        await auditLogger.logReport('delete', input, {
          title: reportToDelete.title,
          companyId: reportToDelete.companyId,
          format: reportToDelete.format,
          totalEmissions: reportToDelete.totalEmissions,
          deletionType: 'hard_delete',
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error deleting report:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete report',
        });
      }
    }),

  // Get public reports
  getPublicReports: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      try {
        const reports = await db
          .select({
            id: schema.reports.id,
            title: schema.reports.title,
            description: schema.reports.description,
            format: schema.reports.format,
            totalEmissions: schema.reports.totalEmissions,
            reportingPeriodStart: schema.reports.reportingPeriodStart,
            reportingPeriodEnd: schema.reports.reportingPeriodEnd,
            generatedAt: schema.reports.generatedAt,
            // Include company name for public reports
            companyName: schema.companies.name,
          })
          .from(schema.reports)
          .innerJoin(schema.companies, eq(schema.reports.companyId, schema.companies.id))
          .where(eq(schema.reports.isPublic, true))
          .orderBy(desc(schema.reports.generatedAt))
          .limit(input.limit);

        return reports;
      } catch (error) {
        console.error('Error fetching public reports:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch public reports',
        });
      }
    }),

  // Get report statistics for a company
  getStatistics: publicProcedure
    .input(z.string().uuid())
    .query(async ({ input: companyId }) => {
      try {
        const [stats] = await db
          .select({
            totalReports: sum(schema.reports.id).as('totalReports'),
            publicReports: sum(schema.reports.isPublic).as('publicReports'),
          })
          .from(schema.reports)
          .where(eq(schema.reports.companyId, companyId));

        // Get latest report
        const [latestReport] = await db
          .select({
            id: schema.reports.id,
            title: schema.reports.title,
            totalEmissions: schema.reports.totalEmissions,
            generatedAt: schema.reports.generatedAt,
          })
          .from(schema.reports)
          .where(eq(schema.reports.companyId, companyId))
          .orderBy(desc(schema.reports.generatedAt))
          .limit(1);

        return {
          totalReports: Number(stats?.totalReports || 0),
          publicReports: Number(stats?.publicReports || 0),
          latestReport: latestReport || null,
        };
      } catch (error) {
        console.error('Error fetching report statistics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch report statistics',
        });
      }
    }),
}); 