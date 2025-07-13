import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { db } from '../../../../../db/connection';
import * as schema from '../../../../../db/schema';
import { eq, and, desc, asc, count, gte, lte } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

/**
 * Data Import router handles CSV/Excel file processing for emission data
 * Provides CRUD operations for data import sessions and file processing
 */
export const dataImportRouter = createTRPCRouter({
  // Get all data imports with pagination and filtering
  getAll: publicProcedure
    .input(
      z.object({
        companyId: z.string().uuid().optional(),
        userId: z.string().uuid().optional(),
        importType: z.enum(['energy_data', 'fuel_data', 'emission_factors']).optional(),
        status: z.enum(['pending', 'processing', 'completed', 'error']).optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const conditions = [];
        
        if (input.companyId) {
          conditions.push(eq(schema.dataImports.companyId, input.companyId));
        }
        
        if (input.userId) {
          conditions.push(eq(schema.dataImports.userId, input.userId));
        }
        
        if (input.importType) {
          conditions.push(eq(schema.dataImports.importType, input.importType));
        }
        
        if (input.status) {
          conditions.push(eq(schema.dataImports.status, input.status));
        }
        
        if (input.dateFrom) {
          conditions.push(gte(schema.dataImports.createdAt, input.dateFrom));
        }
        
        if (input.dateTo) {
          conditions.push(lte(schema.dataImports.createdAt, input.dateTo));
        }

        const [dataImports, totalCount] = await Promise.all([
          db
            .select({
              id: schema.dataImports.id,
              companyId: schema.dataImports.companyId,
              userId: schema.dataImports.userId,
              fileName: schema.dataImports.fileName,
              fileSize: schema.dataImports.fileSize,
              importType: schema.dataImports.importType,
              status: schema.dataImports.status,
              recordsProcessed: schema.dataImports.recordsProcessed,
              recordsTotal: schema.dataImports.recordsTotal,
              createdAt: schema.dataImports.createdAt,
              updatedAt: schema.dataImports.updatedAt,
            })
            .from(schema.dataImports)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(schema.dataImports.createdAt))
            .limit(input.limit)
            .offset(input.offset),
          
          db
            .select({ count: count() })
            .from(schema.dataImports)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .then((result) => result[0]?.count || 0),
        ]);

        return {
          dataImports,
          totalCount,
          hasMore: input.offset + input.limit < totalCount,
        };
      } catch (error) {
        console.error('Error fetching data imports:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch data imports',
        });
      }
    }),

  // Get data import by ID
  getById: publicProcedure
    .input(z.string().uuid())
    .query(async ({ input }) => {
      try {
        const [dataImport] = await db
          .select()
          .from(schema.dataImports)
          .where(eq(schema.dataImports.id, input))
          .limit(1);

        if (!dataImport) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Data import not found',
          });
        }

        return dataImport;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error fetching data import:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch data import',
        });
      }
    }),

  // Create new data import session
  create: publicProcedure
    .input(
      z.object({
        companyId: z.string().uuid(),
        userId: z.string().uuid(),
        fileName: z.string().min(1),
        fileSize: z.number().positive().optional(),
        importType: z.enum(['energy_data', 'fuel_data', 'emission_factors']),
        recordsTotal: z.number().positive().optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Verify company exists
        const [company] = await db
          .select({ id: schema.companies.id })
          .from(schema.companies)
          .where(eq(schema.companies.id, input.companyId))
          .limit(1);

        if (!company) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Company not found',
          });
        }

        // Verify user exists
        const [user] = await db
          .select({ id: schema.users.id })
          .from(schema.users)
          .where(eq(schema.users.id, input.userId))
          .limit(1);

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        const [dataImport] = await db
          .insert(schema.dataImports)
          .values({
            companyId: input.companyId,
            userId: input.userId,
            fileName: input.fileName,
            fileSize: input.fileSize,
            importType: input.importType,
            status: 'pending',
            recordsTotal: input.recordsTotal,
            recordsProcessed: 0,
            metadata: input.metadata,
          })
          .returning();

        return dataImport;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error creating data import:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create data import',
        });
      }
    }),

  // Update data import status and progress
  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(['pending', 'processing', 'completed', 'error']),
        recordsProcessed: z.number().min(0).optional(),
        recordsTotal: z.number().min(0).optional(),
        errors: z.array(z.record(z.any())).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const updateData: any = {
          status: input.status,
          updatedAt: new Date(),
        };

        if (input.recordsProcessed !== undefined) {
          updateData.recordsProcessed = input.recordsProcessed;
        }

        if (input.recordsTotal !== undefined) {
          updateData.recordsTotal = input.recordsTotal;
        }

        if (input.errors !== undefined) {
          updateData.errors = input.errors;
        }

        const [dataImport] = await db
          .update(schema.dataImports)
          .set(updateData)
          .where(eq(schema.dataImports.id, input.id))
          .returning();

        if (!dataImport) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Data import not found',
          });
        }

        return dataImport;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error updating data import:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update data import',
        });
      }
    }),

  // Process CSV/Excel data (placeholder for actual file processing)
  processFile: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        fileData: z.array(z.record(z.any())), // Parsed CSV/Excel data
        columnMappings: z.record(z.string()).optional(), // Map file columns to database fields
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Get data import record
        const [dataImport] = await db
          .select()
          .from(schema.dataImports)
          .where(eq(schema.dataImports.id, input.id))
          .limit(1);

        if (!dataImport) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Data import not found',
          });
        }

        // Update status to processing
        await db
          .update(schema.dataImports)
          .set({
            status: 'processing',
            recordsTotal: input.fileData.length,
            updatedAt: new Date(),
          })
          .where(eq(schema.dataImports.id, input.id));

        // Process data based on import type
        const errors: any[] = [];
        let processedCount = 0;

        try {
          for (const [index, row] of input.fileData.entries()) {
            try {
              // TODO: Implement actual data processing logic based on importType
              // This is a placeholder for the actual processing logic
              
              if (dataImport.importType === 'energy_data') {
                // Process energy data
                // Validate required fields and create emission calculations
              } else if (dataImport.importType === 'fuel_data') {
                // Process fuel data
                // Validate required fields and create emission calculations
              } else if (dataImport.importType === 'emission_factors') {
                // Process emission factors
                // Validate and update emission factors table
              }

              processedCount++;
            } catch (rowError) {
              errors.push({
                row: index + 1,
                data: row,
                error: rowError instanceof Error ? rowError.message : 'Unknown error',
              });
            }
          }

          // Update final status
          await db
            .update(schema.dataImports)
            .set({
              status: errors.length > 0 ? 'error' : 'completed',
              recordsProcessed: processedCount,
              errors: errors.length > 0 ? errors : null,
              updatedAt: new Date(),
            })
            .where(eq(schema.dataImports.id, input.id));

          return {
            success: true,
            processedCount,
            errorCount: errors.length,
            errors: errors.slice(0, 10), // Return first 10 errors
          };
        } catch (processingError) {
          // Update status to error
          await db
            .update(schema.dataImports)
            .set({
              status: 'error',
              recordsProcessed: processedCount,
              errors: [
                {
                  error: processingError instanceof Error ? processingError.message : 'Processing failed',
                }
              ],
              updatedAt: new Date(),
            })
            .where(eq(schema.dataImports.id, input.id));

          throw processingError;
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error processing file:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process file',
        });
      }
    }),

  // Get import statistics
  getStatistics: publicProcedure
    .input(
      z.object({
        companyId: z.string().uuid().optional(),
        userId: z.string().uuid().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const conditions = [];
        
        if (input.companyId) {
          conditions.push(eq(schema.dataImports.companyId, input.companyId));
        }
        
        if (input.userId) {
          conditions.push(eq(schema.dataImports.userId, input.userId));
        }
        
        if (input.dateFrom) {
          conditions.push(gte(schema.dataImports.createdAt, input.dateFrom));
        }
        
        if (input.dateTo) {
          conditions.push(lte(schema.dataImports.createdAt, input.dateTo));
        }

        const imports = await db
          .select({
            status: schema.dataImports.status,
            importType: schema.dataImports.importType,
            recordsProcessed: schema.dataImports.recordsProcessed,
            recordsTotal: schema.dataImports.recordsTotal,
          })
          .from(schema.dataImports)
          .where(conditions.length > 0 ? and(...conditions) : undefined);

        const statistics = {
          totalImports: imports.length,
          completedImports: imports.filter(i => i.status === 'completed').length,
          errorImports: imports.filter(i => i.status === 'error').length,
          processingImports: imports.filter(i => i.status === 'processing').length,
          pendingImports: imports.filter(i => i.status === 'pending').length,
          totalRecordsProcessed: imports.reduce((sum, i) => sum + (i.recordsProcessed || 0), 0),
          totalRecordsExpected: imports.reduce((sum, i) => sum + (i.recordsTotal || 0), 0),
          byImportType: {
            energy_data: imports.filter(i => i.importType === 'energy_data').length,
            fuel_data: imports.filter(i => i.importType === 'fuel_data').length,
            emission_factors: imports.filter(i => i.importType === 'emission_factors').length,
          },
        };

        return statistics;
      } catch (error) {
        console.error('Error fetching import statistics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch import statistics',
        });
      }
    }),

  // Delete data import
  delete: publicProcedure
    .input(z.string().uuid())
    .mutation(async ({ input }) => {
      try {
        const [dataImport] = await db
          .delete(schema.dataImports)
          .where(eq(schema.dataImports.id, input))
          .returning();

        if (!dataImport) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Data import not found',
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error deleting data import:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete data import',
        });
      }
    }),
}); 