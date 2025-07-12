import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { db } from '../../../../../db/connection';
import * as schema from '../../../../../db/schema';
import { eq, and, desc, gte, lte, count, isNotNull, ilike, or } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

/**
 * Audit Log router handles compliance tracking and security monitoring
 * Provides comprehensive audit trail for all system actions
 */
export const auditLogRouter = createTRPCRouter({
  // Get audit logs with filtering and pagination
  getAll: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid().optional(),
        action: z.enum(['create', 'update', 'delete', 'export', 'login', 'logout']).optional(),
        resourceType: z.string().optional(),
        resourceId: z.string().uuid().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const conditions = [];
        
        if (input.userId) {
          conditions.push(eq(schema.auditLog.userId, input.userId));
        }
        
        if (input.action) {
          conditions.push(eq(schema.auditLog.action, input.action));
        }
        
        if (input.resourceType) {
          conditions.push(ilike(schema.auditLog.resourceType, `%${input.resourceType}%`));
        }
        
        if (input.resourceId) {
          conditions.push(eq(schema.auditLog.resourceId, input.resourceId));
        }
        
        if (input.startDate) {
          conditions.push(gte(schema.auditLog.timestamp, input.startDate));
        }
        
        if (input.endDate) {
          conditions.push(lte(schema.auditLog.timestamp, input.endDate));
        }

        const auditLogs = await db
          .select({
            id: schema.auditLog.id,
            userId: schema.auditLog.userId,
            action: schema.auditLog.action,
            resourceType: schema.auditLog.resourceType,
            resourceId: schema.auditLog.resourceId,
            details: schema.auditLog.details,
            ipAddress: schema.auditLog.ipAddress,
            userAgent: schema.auditLog.userAgent,
            timestamp: schema.auditLog.timestamp,
            // Include user details if available
            userName: schema.users.name,
            userEmail: schema.users.email,
          })
          .from(schema.auditLog)
          .leftJoin(schema.users, eq(schema.auditLog.userId, schema.users.id))
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(schema.auditLog.timestamp))
          .limit(input.limit)
          .offset(input.offset);

        // Get total count for pagination
        const [{ totalCount }] = await db
          .select({
            totalCount: count(schema.auditLog.id),
          })
          .from(schema.auditLog)
          .where(conditions.length > 0 ? and(...conditions) : undefined);

        return {
          auditLogs,
          totalCount,
          hasMore: input.offset + input.limit < totalCount,
        };
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch audit logs',
        });
      }
    }),

  // Get audit log by ID
  getById: publicProcedure
    .input(z.string().uuid())
    .query(async ({ input }) => {
      try {
        const [auditLog] = await db
          .select({
            id: schema.auditLog.id,
            userId: schema.auditLog.userId,
            action: schema.auditLog.action,
            resourceType: schema.auditLog.resourceType,
            resourceId: schema.auditLog.resourceId,
            details: schema.auditLog.details,
            ipAddress: schema.auditLog.ipAddress,
            userAgent: schema.auditLog.userAgent,
            timestamp: schema.auditLog.timestamp,
            // Include user details
            userName: schema.users.name,
            userEmail: schema.users.email,
          })
          .from(schema.auditLog)
          .leftJoin(schema.users, eq(schema.auditLog.userId, schema.users.id))
          .where(eq(schema.auditLog.id, input))
          .limit(1);

        if (!auditLog) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Audit log entry not found',
          });
        }

        return auditLog;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error fetching audit log:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch audit log',
        });
      }
    }),

  // Create new audit log entry
  create: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid().optional(),
        action: z.enum(['create', 'update', 'delete', 'export', 'login', 'logout']),
        resourceType: z.string().min(1),
        resourceId: z.string().uuid().optional(),
        details: z.record(z.any()).optional(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const [auditLog] = await db
          .insert(schema.auditLog)
          .values({
            userId: input.userId,
            action: input.action,
            resourceType: input.resourceType,
            resourceId: input.resourceId,
            details: input.details,
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
            timestamp: new Date(),
          })
          .returning();

        return auditLog;
      } catch (error) {
        console.error('Error creating audit log:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create audit log',
        });
      }
    }),

  // Get audit statistics
  getStatistics: publicProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        companyId: z.string().uuid().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const conditions = [];
        
        if (input.startDate) {
          conditions.push(gte(schema.auditLog.timestamp, input.startDate));
        }
        
        if (input.endDate) {
          conditions.push(lte(schema.auditLog.timestamp, input.endDate));
        }
        
        // If companyId is provided, filter by users from that company
        if (input.companyId) {
          const companyUserIds = await db
            .select({ id: schema.users.id })
            .from(schema.users)
            .where(eq(schema.users.companyId, input.companyId));
          
          if (companyUserIds.length > 0) {
            conditions.push(eq(schema.auditLog.userId, companyUserIds[0].id));
          }
        }

        // Get action counts
        const actionCounts = await db
          .select({
            action: schema.auditLog.action,
            count: count(schema.auditLog.id),
          })
          .from(schema.auditLog)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .groupBy(schema.auditLog.action);

        // Get resource type counts
        const resourceTypeCounts = await db
          .select({
            resourceType: schema.auditLog.resourceType,
            count: count(schema.auditLog.id),
          })
          .from(schema.auditLog)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .groupBy(schema.auditLog.resourceType);

        // Get total count
        const [{ totalLogs }] = await db
          .select({
            totalLogs: count(schema.auditLog.id),
          })
          .from(schema.auditLog)
          .where(conditions.length > 0 ? and(...conditions) : undefined);

        // Get unique user count
        const [{ uniqueUsers }] = await db
          .select({
            uniqueUsers: count(schema.auditLog.userId),
          })
          .from(schema.auditLog)
          .where(and(
            isNotNull(schema.auditLog.userId),
            ...(conditions.length > 0 ? conditions : [])
          ));

        return {
          totalLogs,
          uniqueUsers,
          actionCounts: actionCounts.reduce((acc, item) => {
            acc[item.action] = item.count;
            return acc;
          }, {} as Record<string, number>),
          resourceTypeCounts: resourceTypeCounts.reduce((acc, item) => {
            acc[item.resourceType] = item.count;
            return acc;
          }, {} as Record<string, number>),
        };
      } catch (error) {
        console.error('Error fetching audit statistics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch audit statistics',
        });
      }
    }),

  // Get recent activity for a user
  getRecentActivity: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      try {
        const recentActivity = await db
          .select({
            id: schema.auditLog.id,
            action: schema.auditLog.action,
            resourceType: schema.auditLog.resourceType,
            resourceId: schema.auditLog.resourceId,
            timestamp: schema.auditLog.timestamp,
          })
          .from(schema.auditLog)
          .where(eq(schema.auditLog.userId, input.userId))
          .orderBy(desc(schema.auditLog.timestamp))
          .limit(input.limit);

        return recentActivity;
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch recent activity',
        });
      }
    }),

  // Get security events (login/logout activities)
  getSecurityEvents: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const conditions = [
          // Filter for security events (login/logout)
          eq(schema.auditLog.resourceType, 'authentication'),
          or(
            eq(schema.auditLog.action, 'login'),
            eq(schema.auditLog.action, 'logout')
          ),
        ];
        
        if (input.userId) {
          conditions.push(eq(schema.auditLog.userId, input.userId));
        }
        
        if (input.startDate) {
          conditions.push(gte(schema.auditLog.timestamp, input.startDate));
        }
        
        if (input.endDate) {
          conditions.push(lte(schema.auditLog.timestamp, input.endDate));
        }

        const securityEvents = await db
          .select({
            id: schema.auditLog.id,
            userId: schema.auditLog.userId,
            action: schema.auditLog.action,
            ipAddress: schema.auditLog.ipAddress,
            userAgent: schema.auditLog.userAgent,
            timestamp: schema.auditLog.timestamp,
            userName: schema.users.name,
            userEmail: schema.users.email,
          })
          .from(schema.auditLog)
          .leftJoin(schema.users, eq(schema.auditLog.userId, schema.users.id))
          .where(and(...conditions))
          .orderBy(desc(schema.auditLog.timestamp))
          .limit(input.limit)
          .offset(input.offset);

        return securityEvents;
      } catch (error) {
        console.error('Error fetching security events:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch security events',
        });
      }
    }),

  // Get audit trail for a specific resource
  getResourceAuditTrail: publicProcedure
    .input(
      z.object({
        resourceType: z.string().min(1),
        resourceId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        const auditTrail = await db
          .select({
            id: schema.auditLog.id,
            userId: schema.auditLog.userId,
            action: schema.auditLog.action,
            details: schema.auditLog.details,
            timestamp: schema.auditLog.timestamp,
            userName: schema.users.name,
            userEmail: schema.users.email,
          })
          .from(schema.auditLog)
          .leftJoin(schema.users, eq(schema.auditLog.userId, schema.users.id))
          .where(and(
            eq(schema.auditLog.resourceType, input.resourceType),
            eq(schema.auditLog.resourceId, input.resourceId)
          ))
          .orderBy(desc(schema.auditLog.timestamp))
          .limit(input.limit);

        return auditTrail;
      } catch (error) {
        console.error('Error fetching resource audit trail:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch resource audit trail',
        });
      }
    }),

  // Export audit logs (for compliance)
  exportAuditLogs: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        format: z.enum(['csv', 'json']).default('csv'),
        userId: z.string().uuid().optional(),
        companyId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const conditions = [
          gte(schema.auditLog.timestamp, input.startDate),
          lte(schema.auditLog.timestamp, input.endDate),
        ];
        
        if (input.userId) {
          conditions.push(eq(schema.auditLog.userId, input.userId));
        }
        
        if (input.companyId) {
          // Filter by users from the specified company
          const companyUserIds = await db
            .select({ id: schema.users.id })
            .from(schema.users)
            .where(eq(schema.users.companyId, input.companyId));
          
          if (companyUserIds.length > 0) {
            conditions.push(eq(schema.auditLog.userId, companyUserIds[0].id));
          }
        }

        const auditLogs = await db
          .select({
            id: schema.auditLog.id,
            userId: schema.auditLog.userId,
            action: schema.auditLog.action,
            resourceType: schema.auditLog.resourceType,
            resourceId: schema.auditLog.resourceId,
            details: schema.auditLog.details,
            ipAddress: schema.auditLog.ipAddress,
            userAgent: schema.auditLog.userAgent,
            timestamp: schema.auditLog.timestamp,
            userName: schema.users.name,
            userEmail: schema.users.email,
          })
          .from(schema.auditLog)
          .leftJoin(schema.users, eq(schema.auditLog.userId, schema.users.id))
          .where(and(...conditions))
          .orderBy(desc(schema.auditLog.timestamp));

        // Log the export action
        await db.insert(schema.auditLog).values({
          userId: input.userId,
          action: 'export',
          resourceType: 'audit_logs',
          details: {
            exportFormat: input.format,
            recordCount: auditLogs.length,
            dateRange: {
              start: input.startDate,
              end: input.endDate,
            },
          },
          timestamp: new Date(),
        });

        return {
          data: auditLogs,
          format: input.format,
          recordCount: auditLogs.length,
          exportedAt: new Date(),
        };
      } catch (error) {
        console.error('Error exporting audit logs:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to export audit logs',
        });
      }
    }),
}); 