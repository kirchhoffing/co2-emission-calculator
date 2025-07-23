import { db } from '../../../../../db/connection';
import * as schema from '../../../../../db/schema';
import { TRPCError } from '@trpc/server';

/**
 * Audit Logging Utility for GDPR Compliance
 * 
 * Provides standardized audit logging for all system operations
 * Tracks all data changes, user actions, and security events
 */

export type AuditAction = 'create' | 'update' | 'delete' | 'export' | 'login' | 'logout';

export interface AuditLogEntry {
  userId?: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditContext {
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await db.insert(schema.auditLog).values({
      userId: entry.userId,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      details: entry.details,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to prevent audit logging from breaking main operations
  }
}

/**
 * Audit logger class for structured logging
 */
export class AuditLogger {
  private context: AuditContext;

  constructor(context: AuditContext) {
    this.context = context;
  }

  /**
   * Log user authentication events
   */
  async logAuth(action: 'login' | 'logout', details?: Record<string, any>): Promise<void> {
    await createAuditLog({
      userId: this.context.userId,
      action,
      resourceType: 'authentication',
      details: {
        ...details,
        timestamp: new Date().toISOString(),
      },
      ipAddress: this.context.ipAddress,
      userAgent: this.context.userAgent,
    });
  }

  /**
   * Log user registration
   */
  async logRegistration(userId: string, details?: Record<string, any>): Promise<void> {
    await createAuditLog({
      userId,
      action: 'create',
      resourceType: 'user',
      resourceId: userId,
      details: {
        ...details,
        event: 'user_registration',
        timestamp: new Date().toISOString(),
      },
      ipAddress: this.context.ipAddress,
      userAgent: this.context.userAgent,
    });
  }

  /**
   * Log CRUD operations on calculations
   */
  async logCalculation(
    action: 'create' | 'update' | 'delete',
    calculationId: string,
    details?: Record<string, any>
  ): Promise<void> {
    await createAuditLog({
      userId: this.context.userId,
      action,
      resourceType: 'calculation',
      resourceId: calculationId,
      details: {
        ...details,
        timestamp: new Date().toISOString(),
      },
      ipAddress: this.context.ipAddress,
      userAgent: this.context.userAgent,
    });
  }

  /**
   * Log CRUD operations on reports
   */
  async logReport(
    action: 'create' | 'update' | 'delete' | 'export',
    reportId: string,
    details?: Record<string, any>
  ): Promise<void> {
    await createAuditLog({
      userId: this.context.userId,
      action,
      resourceType: 'report',
      resourceId: reportId,
      details: {
        ...details,
        timestamp: new Date().toISOString(),
      },
      ipAddress: this.context.ipAddress,
      userAgent: this.context.userAgent,
    });
  }

  /**
   * Log CRUD operations on companies
   */
  async logCompany(
    action: 'create' | 'update' | 'delete',
    companyId: string,
    details?: Record<string, any>
  ): Promise<void> {
    await createAuditLog({
      userId: this.context.userId,
      action,
      resourceType: 'company',
      resourceId: companyId,
      details: {
        ...details,
        timestamp: new Date().toISOString(),
      },
      ipAddress: this.context.ipAddress,
      userAgent: this.context.userAgent,
    });
  }

  /**
   * Log user management operations
   */
  async logUser(
    action: 'create' | 'update' | 'delete',
    targetUserId: string,
    details?: Record<string, any>
  ): Promise<void> {
    await createAuditLog({
      userId: this.context.userId,
      action,
      resourceType: 'user',
      resourceId: targetUserId,
      details: {
        ...details,
        timestamp: new Date().toISOString(),
      },
      ipAddress: this.context.ipAddress,
      userAgent: this.context.userAgent,
    });
  }

  /**
   * Log data export operations
   */
  async logDataExport(
    resourceType: string,
    details?: Record<string, any>
  ): Promise<void> {
    await createAuditLog({
      userId: this.context.userId,
      action: 'export',
      resourceType,
      details: {
        ...details,
        event: 'data_export',
        timestamp: new Date().toISOString(),
      },
      ipAddress: this.context.ipAddress,
      userAgent: this.context.userAgent,
    });
  }

  /**
   * Log data import operations
   */
  async logDataImport(
    importId: string,
    importType: string,
    details?: Record<string, any>
  ): Promise<void> {
    await createAuditLog({
      userId: this.context.userId,
      action: 'create',
      resourceType: 'data_import',
      resourceId: importId,
      details: {
        ...details,
        importType,
        event: 'data_import',
        timestamp: new Date().toISOString(),
      },
      ipAddress: this.context.ipAddress,
      userAgent: this.context.userAgent,
    });
  }

  /**
   * Log emission factor changes
   */
  async logEmissionFactor(
    action: 'create' | 'update' | 'delete',
    factorId: string,
    details?: Record<string, any>
  ): Promise<void> {
    await createAuditLog({
      userId: this.context.userId,
      action,
      resourceType: 'emission_factor',
      resourceId: factorId,
      details: {
        ...details,
        timestamp: new Date().toISOString(),
      },
      ipAddress: this.context.ipAddress,
      userAgent: this.context.userAgent,
    });
  }

  /**
   * Log GDPR compliance actions
   */
  async logGDPRAction(
    action: string,
    targetUserId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    await createAuditLog({
      userId: this.context.userId,
      action: 'update',
      resourceType: 'gdpr_compliance',
      resourceId: targetUserId,
      details: {
        ...details,
        gdprAction: action,
        timestamp: new Date().toISOString(),
      },
      ipAddress: this.context.ipAddress,
      userAgent: this.context.userAgent,
    });
  }

  /**
   * Log administrative actions
   */
  async logAdminAction(
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    await createAuditLog({
      userId: this.context.userId,
      action: 'update',
      resourceType: `admin_${resourceType}`,
      resourceId,
      details: {
        ...details,
        adminAction: action,
        timestamp: new Date().toISOString(),
      },
      ipAddress: this.context.ipAddress,
      userAgent: this.context.userAgent,
    });
  }
}

/**
 * Create audit logger from tRPC context
 */
export function createAuditLogger(ctx: any): AuditLogger {
  return new AuditLogger({
    userId: ctx.session?.user?.id,
    ipAddress: ctx.req?.ip || ctx.req?.connection?.remoteAddress,
    userAgent: ctx.req?.headers?.['user-agent'],
  });
}

/**
 * Middleware for automatic audit logging
 */
export function withAuditLogging<T extends (...args: any[]) => any>(
  operation: T,
  auditConfig: {
    action: AuditAction;
    resourceType: string;
    getResourceId?: (args: Parameters<T>, result?: Awaited<ReturnType<T>>) => string;
    getDetails?: (args: Parameters<T>, result?: Awaited<ReturnType<T>>) => Record<string, any>;
  }
): T {
  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const ctx = args[0]?.ctx; // Assume first arg has ctx for tRPC procedures
    const result = await operation(...args);
    
    if (ctx) {
      const logger = createAuditLogger(ctx);
      const resourceId = auditConfig.getResourceId?.(args, result);
      const details = auditConfig.getDetails?.(args, result);
      
      await createAuditLog({
        userId: ctx.session?.user?.id,
        action: auditConfig.action,
        resourceType: auditConfig.resourceType,
        resourceId,
        details,
        ipAddress: ctx.req?.ip || ctx.req?.connection?.remoteAddress,
        userAgent: ctx.req?.headers?.['user-agent'],
      });
    }
    
    return result;
  }) as T;
} 