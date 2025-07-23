import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { db } from '../../../../../db/connection';
import * as schema from '../../../../../db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { createAuditLogger } from '../utils/auditLogger';

/**
 * Authentication router for CO2 Emission Calculator
 * 
 * Handles:
 * - User registration with password hashing
 * - Basic user operations
 * - GDPR compliance tracking
 * - Company association
 * 
 * TODO: Add protected procedures and authentication middleware
 */
export const authRouter = createTRPCRouter({
  // Register new user
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Please enter a valid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        companyName: z.string().optional(),
        gdprConsent: z.boolean().refine(val => val === true, {
          message: 'GDPR consent is required to create an account'
        }),
      })
    )
    .mutation(async ({ input }) => {
      const { name, email, password, companyName, gdprConsent } = input;

      try {
        // Check if user already exists
        const existingUser = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, email))
          .limit(1);

        if (existingUser.length > 0) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A user with this email already exists',
          });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create company if provided
        let companyId: string | null = null;
        if (companyName) {
          const [company] = await db
            .insert(schema.companies)
            .values({
              name: companyName,
              reportingYear: new Date().getFullYear(),
            })
            .returning({ id: schema.companies.id });
          
          companyId = company.id;
        }

        // Create user
        const [user] = await db
          .insert(schema.users)
          .values({
            name,
            email,
            passwordHash,
            companyId,
            gdprConsent,
            gdprConsentDate: new Date(),
            role: companyId ? 'company_admin' : 'user',
          })
          .returning({
            id: schema.users.id,
            name: schema.users.name,
            email: schema.users.email,
            role: schema.users.role,
            companyId: schema.users.companyId,
          });

        // Log user registration for audit trail
        const auditLogger = createAuditLogger({ userId: user.id });
        await auditLogger.logRegistration(user.id, {
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          gdprConsentGiven: gdprConsent,
          hasCompany: !!companyName,
        });

        // Log company creation if applicable
        if (companyId) {
          await auditLogger.logCompany('create', companyId, {
            name: companyName,
            createdByUser: user.id,
            reportingYear: new Date().getFullYear(),
          });
        }

        return {
          user,
          message: 'Account created successfully',
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error('Registration error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create account. Please try again.',
        });
      }
    }),

  // Verify user credentials for login (used by Auth.js)
  verifyCredentials: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;

      try {
        // Find user
        const [user] = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, email))
          .limit(1);

        const auditLogger = createAuditLogger(ctx);

        if (!user || !user.passwordHash) {
          // Log failed login attempt
          await auditLogger.logAuth('login', {
            email,
            success: false,
            reason: 'user_not_found',
          });
          
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid credentials',
          });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        
        if (!isValidPassword) {
          // Log failed login attempt
          await auditLogger.logAuth('login', {
            email,
            userId: user.id,
            success: false,
            reason: 'invalid_password',
          });
          
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid credentials',
          });
        }

        // Log successful login attempt
        const auditLoggerWithUser = createAuditLogger({ 
          ...ctx,
          userId: user.id 
        });
        await auditLoggerWithUser.logAuth('login', {
          email,
          userId: user.id,
          success: true,
        });

        // Return user data (without password hash)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          companyId: user.companyId,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error('Credential verification error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Authentication failed',
        });
      }
    }),

  // Get user by email (used internally by Auth.js)
  getUserByEmail: publicProcedure
    .input(z.string().email())
    .query(async ({ input: email }) => {
      try {
        const [user] = await db
          .select({
            id: schema.users.id,
            email: schema.users.email,
            name: schema.users.name,
            image: schema.users.image,
            role: schema.users.role,
            companyId: schema.users.companyId,
            emailVerified: schema.users.emailVerified,
          })
          .from(schema.users)
          .where(eq(schema.users.email, email))
          .limit(1);

        return user || null;
      } catch (error) {
        console.error('Get user by email error:', error);
        return null;
      }
    }),
}); 