import { createTRPCRouter } from './trpc';
import { authRouter } from './routers/auth';
import { calculationsRouter } from './routers/calculations';
import { emissionFactorsRouter } from './routers/emissionFactors';
import { reportsRouter } from './routers/reports';
import { companiesRouter } from './routers/companies';
import { usersRouter } from './routers/users';
import { auditLogRouter } from './routers/auditLog';

/**
 * This is the primary router for your server.
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  calculations: calculationsRouter,
  emissionFactors: emissionFactorsRouter,
  reports: reportsRouter,
  companies: companiesRouter,
  users: usersRouter,
  auditLog: auditLogRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter; 