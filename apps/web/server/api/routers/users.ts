import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { db } from '../../../../../db/connection';
import * as schema from '../../../../../db/schema';
import { eq, and, desc, ilike, count, isNull, isNotNull, or, ne } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';

/**
 * Users router handles user management operations
 * Provides CRUD operations for users with proper authorization
 */
export const usersRouter = createTRPCRouter({
  // Get all users with pagination and search
  getAll: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        role: z.enum(['user', 'admin', 'company_admin']).optional(),
        companyId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const conditions = [];
        
        if (input.search) {
          // Search in both name and email using OR logic
          conditions.push(
            or(
              ilike(schema.users.name, `%${input.search}%`),
              ilike(schema.users.email, `%${input.search}%`)
            )
          );
        }
        
        if (input.role) {
          conditions.push(eq(schema.users.role, input.role));
        }
        
        if (input.companyId) {
          conditions.push(eq(schema.users.companyId, input.companyId));
        }

        const users = await db
          .select({
            id: schema.users.id,
            email: schema.users.email,
            name: schema.users.name,
            role: schema.users.role,
            companyId: schema.users.companyId,
            emailVerified: schema.users.emailVerified,
            gdprConsent: schema.users.gdprConsent,
            gdprConsentDate: schema.users.gdprConsentDate,
            createdAt: schema.users.createdAt,
            // Include company name if exists
            companyName: schema.companies.name,
          })
          .from(schema.users)
          .leftJoin(schema.companies, eq(schema.users.companyId, schema.companies.id))
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(schema.users.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        // Get total count for pagination
        const [{ totalCount }] = await db
          .select({
            totalCount: count(schema.users.id),
          })
          .from(schema.users)
          .where(conditions.length > 0 ? and(...conditions) : undefined);

        return {
          users,
          totalCount,
          hasMore: input.offset + input.limit < totalCount,
        };
      } catch (error) {
        console.error('Error fetching users:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch users',
        });
      }
    }),

  // Get user by ID
  getById: publicProcedure
    .input(z.string().uuid())
    .query(async ({ input }) => {
      try {
        const [user] = await db
          .select({
            id: schema.users.id,
            email: schema.users.email,
            name: schema.users.name,
            emailVerified: schema.users.emailVerified,
            image: schema.users.image,
            companyId: schema.users.companyId,
            role: schema.users.role,
            gdprConsent: schema.users.gdprConsent,
            gdprConsentDate: schema.users.gdprConsentDate,
            dataRetentionOptOut: schema.users.dataRetentionOptOut,
            createdAt: schema.users.createdAt,
            updatedAt: schema.users.updatedAt,
            // Include company details
            companyName: schema.companies.name,
            companyIndustryType: schema.companies.industryType,
            companyCountry: schema.companies.country,
          })
          .from(schema.users)
          .leftJoin(schema.companies, eq(schema.users.companyId, schema.companies.id))
          .where(eq(schema.users.id, input))
          .limit(1);

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        return user;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error fetching user:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user',
        });
      }
    }),

  // Get user by email
  getByEmail: publicProcedure
    .input(z.string().email())
    .query(async ({ input }) => {
      try {
        const [user] = await db
          .select({
            id: schema.users.id,
            email: schema.users.email,
            name: schema.users.name,
            role: schema.users.role,
            companyId: schema.users.companyId,
            emailVerified: schema.users.emailVerified,
          })
          .from(schema.users)
          .where(eq(schema.users.email, input))
          .limit(1);

        return user || null;
      } catch (error) {
        console.error('Error fetching user by email:', error);
        return null;
      }
    }),

  // Update user profile
  updateProfile: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        image: z.string().url().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, ...updateData } = input;

                 // Check if email is being changed and if it's already taken
         if (updateData.email) {
           const [existingUser] = await db
             .select({ id: schema.users.id })
             .from(schema.users)
             .where(and(
               eq(schema.users.email, updateData.email),
               // Different user (not the current user)
               ne(schema.users.id, id)
             ))
             .limit(1);

           if (existingUser) {
             throw new TRPCError({
               code: 'CONFLICT',
               message: 'Email already in use',
             });
           }
         }

        const [user] = await db
          .update(schema.users)
          .set({
            ...updateData,
            updatedAt: new Date(),
          })
          .where(eq(schema.users.id, id))
          .returning({
            id: schema.users.id,
            email: schema.users.email,
            name: schema.users.name,
            image: schema.users.image,
            role: schema.users.role,
            companyId: schema.users.companyId,
          });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        return user;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error updating user profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user profile',
        });
      }
    }),

  // Change user password
  changePassword: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        currentPassword: z.string().min(6),
        newPassword: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, currentPassword, newPassword } = input;

        // Get current user with password hash
        const [user] = await db
          .select({
            id: schema.users.id,
            passwordHash: schema.users.passwordHash,
          })
          .from(schema.users)
          .where(eq(schema.users.id, id))
          .limit(1);

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        // Verify current password
        if (!user.passwordHash) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'User does not have a password set',
          });
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isCurrentPasswordValid) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Current password is incorrect',
          });
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 12);

        // Update password
        await db
          .update(schema.users)
          .set({
            passwordHash: newPasswordHash,
            updatedAt: new Date(),
          })
          .where(eq(schema.users.id, id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error changing password:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to change password',
        });
      }
    }),

  // Update user role (admin only)
  updateRole: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        role: z.enum(['user', 'admin', 'company_admin']),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, role } = input;

        const [user] = await db
          .update(schema.users)
          .set({
            role,
            updatedAt: new Date(),
          })
          .where(eq(schema.users.id, id))
          .returning({
            id: schema.users.id,
            email: schema.users.email,
            name: schema.users.name,
            role: schema.users.role,
          });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        return user;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error updating user role:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user role',
        });
      }
    }),

  // Delete user account
  delete: publicProcedure
    .input(z.string().uuid())
    .mutation(async ({ input }) => {
      try {
        // Check if user has associated data
        const [calculationCount] = await db
          .select({
            count: count(schema.emissionsCalculations.id),
          })
          .from(schema.emissionsCalculations)
          .where(eq(schema.emissionsCalculations.userId, input));

        const [reportCount] = await db
          .select({
            count: count(schema.reports.id),
          })
          .from(schema.reports)
          .where(eq(schema.reports.userId, input));

        if (calculationCount.count > 0 || reportCount.count > 0) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Cannot delete user with existing calculations or reports. Consider anonymizing the data instead.',
          });
        }

        const [deleted] = await db
          .delete(schema.users)
          .where(eq(schema.users.id, input))
          .returning({ id: schema.users.id });

        if (!deleted) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error deleting user:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete user',
        });
      }
    }),

  // Get user statistics
  getStatistics: publicProcedure
    .input(z.string().uuid())
    .query(async ({ input: userId }) => {
      try {
        // Get calculation statistics
        const [calculationStats] = await db
          .select({
            totalCalculations: count(schema.emissionsCalculations.id),
          })
          .from(schema.emissionsCalculations)
          .where(eq(schema.emissionsCalculations.userId, userId));

        // Get report statistics
        const [reportStats] = await db
          .select({
            totalReports: count(schema.reports.id),
          })
          .from(schema.reports)
          .where(eq(schema.reports.userId, userId));

        // Get latest activity
        const [latestCalculation] = await db
          .select({
            id: schema.emissionsCalculations.id,
            scope: schema.emissionsCalculations.scope,
            calculatedEmissions: schema.emissionsCalculations.calculatedEmissions,
            createdAt: schema.emissionsCalculations.createdAt,
          })
          .from(schema.emissionsCalculations)
          .where(eq(schema.emissionsCalculations.userId, userId))
          .orderBy(desc(schema.emissionsCalculations.createdAt))
          .limit(1);

        return {
          totalCalculations: calculationStats.totalCalculations,
          totalReports: reportStats.totalReports,
          latestCalculation: latestCalculation || null,
        };
      } catch (error) {
        console.error('Error fetching user statistics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user statistics',
        });
      }
    }),

  // Update GDPR consent
  updateGdprConsent: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        gdprConsent: z.boolean(),
        dataRetentionOptOut: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, gdprConsent, dataRetentionOptOut } = input;

        const updateData: any = {
          gdprConsent,
          updatedAt: new Date(),
        };

        if (gdprConsent) {
          updateData.gdprConsentDate = new Date();
        }

        if (dataRetentionOptOut !== undefined) {
          updateData.dataRetentionOptOut = dataRetentionOptOut;
        }

        const [user] = await db
          .update(schema.users)
          .set(updateData)
          .where(eq(schema.users.id, id))
          .returning({
            id: schema.users.id,
            gdprConsent: schema.users.gdprConsent,
            gdprConsentDate: schema.users.gdprConsentDate,
            dataRetentionOptOut: schema.users.dataRetentionOptOut,
          });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        return user;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error updating GDPR consent:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update GDPR consent',
        });
      }
    }),

  // Get users without companies (for admin management)
  getUnassignedUsers: publicProcedure
    .query(async () => {
      try {
        const users = await db
          .select({
            id: schema.users.id,
            email: schema.users.email,
            name: schema.users.name,
            role: schema.users.role,
            createdAt: schema.users.createdAt,
          })
          .from(schema.users)
          .where(isNull(schema.users.companyId))
          .orderBy(desc(schema.users.createdAt));

        return users;
      } catch (error) {
        console.error('Error fetching unassigned users:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch unassigned users',
        });
      }
    }),

  // Assign user to company
  assignToCompany: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        companyId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { userId, companyId } = input;

        // Verify company exists
        const [company] = await db
          .select({ id: schema.companies.id })
          .from(schema.companies)
          .where(eq(schema.companies.id, companyId))
          .limit(1);

        if (!company) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Company not found',
          });
        }

        const [user] = await db
          .update(schema.users)
          .set({
            companyId,
            updatedAt: new Date(),
          })
          .where(eq(schema.users.id, userId))
          .returning({
            id: schema.users.id,
            email: schema.users.email,
            name: schema.users.name,
            companyId: schema.users.companyId,
          });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        return user;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error assigning user to company:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to assign user to company',
        });
      }
    }),
}); 