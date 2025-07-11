import { createTRPCRouter } from './trpc';
import { calculationsRouter } from './routers/calculations';
import { emissionFactorsRouter } from './routers/emissionFactors';
import { reportsRouter } from './routers/reports';
import { authRouter } from './routers/auth';

/**
 * This is the primary router for the tRPC server.
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  calculations: calculationsRouter,
  emissionFactors: emissionFactorsRouter,
  reports: reportsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter; 