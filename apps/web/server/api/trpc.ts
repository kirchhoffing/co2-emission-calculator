import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { ZodError, z } from 'zod';
import superjson from 'superjson';
import { auth } from '../../auth';
import { db } from '../../../../db/connection';
import * as schema from '../../../../db/schema';
import { eq } from 'drizzle-orm';

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

interface CreateContextOptions {
  session: Awaited<ReturnType<typeof auth>> | null;
  db: typeof db;
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    db: opts.db,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  // Get the session from the auth function
  const session = await auth();
  
  return createInnerTRPCContext({
    session,
    db,
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Rate limiting store (in production, use Redis or database)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Enhanced validation middleware with comprehensive input validation
 */
const enhancedValidationMiddleware = t.middleware(async ({ ctx, next, input, path }) => {
  // Input sanitization - remove potential XSS, trim strings, normalize data
  const sanitizeInput = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      return obj
        .trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/on\w+\s*=/gi, ''); // Remove event handlers
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeInput);
    }
    
    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeInput(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  // Sanitize input
  const sanitizedInput = sanitizeInput(input);

  // Rate limiting (basic implementation - use Redis in production)
  const clientId = ctx.session?.user?.id || 'anonymous';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 100; // max requests per window
  
  const clientData = rateLimitStore.get(clientId);
  if (clientData) {
    if (now < clientData.resetTime) {
      if (clientData.count >= maxRequests) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Rate limit exceeded. Please try again later.',
        });
      }
      clientData.count++;
    } else {
      // Reset window
      rateLimitStore.set(clientId, { count: 1, resetTime: now + windowMs });
    }
  } else {
    rateLimitStore.set(clientId, { count: 1, resetTime: now + windowMs });
  }

  // Cleanup old entries periodically
  if (Math.random() < 0.01) { // 1% chance to cleanup
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }

  return next({
    ctx: {
      ...ctx,
      sanitizedInput,
    },
  });
});

/**
 * Authentication middleware - ensures user is logged in
 */
const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  // Verify user still exists in database and has valid role
  const user = await ctx.db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      role: schema.users.role,
      companyId: schema.users.companyId,
    })
    .from(schema.users)
    .where(eq(schema.users.id, ctx.session.user.id))
    .limit(1);

  if (!user[0]) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User account does not exist',
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: { ...ctx.session.user, ...user[0] } },
    },
  });
});

/**
 * Admin authentication middleware - ensures user is admin
 */
const enforceUserIsAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  // Get user role from database
  const user = await ctx.db
    .select({
      id: schema.users.id,
      role: schema.users.role,
    })
    .from(schema.users)
    .where(eq(schema.users.id, ctx.session.user.id))
    .limit(1);

  if (!user[0]) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User account does not exist',
    });
  }

  if (user[0].role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: { ...ctx.session.user, ...user[0] } },
    },
  });
});

/**
 * Company access middleware - ensures user can access company data
 */
const enforceCompanyAccess = (companyIdInput?: string) => 
  t.middleware(async ({ ctx, next, input }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access this resource',
      });
    }

    // Extract company ID from input or use user's company
    const targetCompanyId = companyIdInput || (input as any)?.companyId || ctx.session.user.companyId;

    if (!targetCompanyId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Company ID is required',
      });
    }

    // Get user with company info
    const user = await ctx.db
      .select({
        id: schema.users.id,
        role: schema.users.role,
        companyId: schema.users.companyId,
      })
      .from(schema.users)
      .where(eq(schema.users.id, ctx.session.user.id))
      .limit(1);

    if (!user[0]) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User account does not exist',
      });
    }

    // Admin can access any company, otherwise check company match
    if (user[0].role !== 'admin' && user[0].companyId !== targetCompanyId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have access to this company data',
      });
    }

    return next({
      ctx: {
        ...ctx,
        session: { ...ctx.session, user: { ...ctx.session.user, ...user[0] } },
        companyId: targetCompanyId,
      },
    });
  });

/**
 * Public (unauthenticated) procedure with enhanced validation
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(enhancedValidationMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 */
export const protectedProcedure = t.procedure
  .use(enhancedValidationMiddleware)
  .use(enforceUserIsAuthed);

/**
 * Admin procedure
 *
 * If you want a query or mutation to ONLY be accessible to admin users, use this.
 */
export const adminProcedure = t.procedure
  .use(enhancedValidationMiddleware)
  .use(enforceUserIsAdmin);

/**
 * Company procedure
 *
 * For operations that require company-level access control.
 */
export const companyProcedure = (companyIdInput?: string) => 
  t.procedure
    .use(enhancedValidationMiddleware)
    .use(enforceCompanyAccess(companyIdInput));

/**
 * Common validation schemas for reuse across routers
 */
export const commonSchemas = {
  // Pagination
  pagination: z.object({
    limit: z.number().min(1).max(100).default(50),
    offset: z.number().min(0).default(0),
  }),
  
  // ID validation
  id: z.string().uuid('Invalid ID format'),
  
  // Date range
  dateRange: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }).refine(data => data.startDate <= data.endDate, {
    message: 'Start date must be before end date',
  }),
  
  // Company access
  companyId: z.string().uuid('Invalid company ID format'),
  
  // Search and filters
  search: z.object({
    query: z.string().min(1).max(100).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
};

/**
 * Input validation helpers
 */
export const validateInput = <T extends z.ZodSchema>(schema: T, input: unknown): z.infer<T> => {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Validation failed',
        cause: error,
      });
    }
    throw error;
  }
}; 