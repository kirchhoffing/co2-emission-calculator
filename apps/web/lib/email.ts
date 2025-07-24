import { Resend } from 'resend';
import { VerificationEmailTemplate, WelcomeEmailTemplate } from './email-templates';

/**
 * Email service for CO2 Emission Calculator
 * 
 * Handles:
 * - Email verification for new registrations
 * - Welcome emails after verification
 * - Password reset emails
 * - System notifications
 */

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendVerificationEmailParams {
  email: string;
  name: string;
  token: string;
  baseUrl: string;
}

export interface SendWelcomeEmailParams {
  email: string;
  name: string;
}

export class EmailService {
  private static instance: EmailService;

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private constructor() {}

  /**
   * Send email verification email to new users
   */
  async sendVerificationEmail({ email, name, token, baseUrl }: SendVerificationEmailParams) {
    const verificationUrl = `${baseUrl}/api/auth/verify?token=${token}`;

    try {
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'CO2 Calculator <onboarding@resend.dev>',
        to: [email],
        subject: 'Verify your CO2 Calculator account',
        react: VerificationEmailTemplate({ 
          firstName: name, 
          verificationUrl 
        }),
        headers: {
          'X-Entity-Ref-ID': `verification-${Date.now()}`,
        },
      });

      if (error) {
        console.error('Email verification send error:', error);
        throw new Error(`Failed to send verification email: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Email service error:', error);
      throw error;
    }
  }

  /**
   * Send welcome email after successful verification
   */
  async sendWelcomeEmail({ email, name }: SendWelcomeEmailParams) {
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'CO2 Calculator <hello@resend.dev>',
        to: [email],
        subject: 'Welcome to CO2 Emission Calculator!',
        react: WelcomeEmailTemplate({ firstName: name }),
        headers: {
          'X-Entity-Ref-ID': `welcome-${Date.now()}`,
        },
      });

      if (error) {
        console.error('Welcome email send error:', error);
        throw new Error(`Failed to send welcome email: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Welcome email service error:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, name: string, resetToken: string, baseUrl: string) {
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    try {
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'CO2 Calculator <security@resend.dev>',
        to: [email],
        subject: 'Reset your CO2 Calculator password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>Hello ${name},</p>
            <p>You requested to reset your password for your CO2 Emission Calculator account.</p>
            <p>Click the link below to reset your password:</p>
            <p><a href="${resetUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a></p>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">CO2 Emission Calculator - Track your carbon footprint</p>
          </div>
        `,
        headers: {
          'X-Entity-Ref-ID': `password-reset-${Date.now()}`,
        },
      });

      if (error) {
        console.error('Password reset email error:', error);
        throw new Error(`Failed to send password reset email: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Password reset email service error:', error);
      throw error;
    }
  }

  /**
   * Validate email service configuration
   */
  static validateConfig(): boolean {
    return !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
  }
}

export const emailService = EmailService.getInstance(); 