import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../../db/connection';
import * as schema from '../../../../../../db/schema';
import { eq } from 'drizzle-orm';
import { emailService } from '../../../../lib/email';

/**
 * Email verification endpoint
 * 
 * Handles GET requests from email verification links
 * Verifies the token and updates user status
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(
      new URL('/login?error=missing-token', request.url)
    );
  }

  try {
    // Find verification token
    const [verificationRecord] = await db
      .select()
      .from(schema.verificationTokens)
      .where(eq(schema.verificationTokens.token, token))
      .limit(1);

    if (!verificationRecord) {
      return NextResponse.redirect(
        new URL('/login?error=invalid-token', request.url)
      );
    }

    // Check if token has expired
    if (verificationRecord.expires < new Date()) {
      // Delete expired token
      await db
        .delete(schema.verificationTokens)
        .where(eq(schema.verificationTokens.token, token));
        
      return NextResponse.redirect(
        new URL('/login?error=expired-token', request.url)
      );
    }

    // Find user by email
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, verificationRecord.identifier))
      .limit(1);

    if (!user) {
      return NextResponse.redirect(
        new URL('/login?error=user-not-found', request.url)
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.redirect(
        new URL('/login?success=already-verified', request.url)
      );
    }

    // Update user as verified
    await db
      .update(schema.users)
      .set({
        emailVerified: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, user.id));

    // Delete used verification token
    await db
      .delete(schema.verificationTokens)
      .where(eq(schema.verificationTokens.token, token));

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail({
        email: user.email,
        name: user.name,
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue even if welcome email fails
    }

    // Redirect to login with success message
    return NextResponse.redirect(
      new URL('/login?success=email-verified', request.url)
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(
      new URL('/login?error=verification-failed', request.url)
    );
  }
} 