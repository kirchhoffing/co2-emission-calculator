import * as React from 'react';

/**
 * Email templates for CO2 Emission Calculator
 * 
 * React components for professional email layouts
 * Compatible with Resend's React email rendering
 */

interface VerificationEmailTemplateProps {
  firstName: string;
  verificationUrl: string;
}

export function VerificationEmailTemplate({ firstName, verificationUrl }: VerificationEmailTemplateProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#059669', fontSize: '28px', marginBottom: '10px' }}>
          🌱 CO2 Emission Calculator
        </h1>
        <p style={{ color: '#666', fontSize: '16px', margin: '0' }}>
          Track your carbon footprint with precision
        </p>
      </div>

      <div style={{ backgroundColor: '#f9fafb', padding: '30px', borderRadius: '8px', marginBottom: '30px' }}>
        <h2 style={{ color: '#111827', fontSize: '24px', marginBottom: '20px' }}>
          Welcome, {firstName}! 👋
        </h2>
        
        <p style={{ color: '#374151', fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
          Thank you for signing up for CO2 Emission Calculator. To get started calculating your carbon footprint, 
          please verify your email address by clicking the button below.
        </p>
        
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a 
            href={verificationUrl}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '14px 28px',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'inline-block'
            }}
          >
            Verify Email Address
          </a>
        </div>
        
        <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.5', marginBottom: '0' }}>
          If the button doesn't work, copy and paste this link into your browser:<br />
          <a href={verificationUrl} style={{ color: '#10b981', wordBreak: 'break-all' }}>
            {verificationUrl}
          </a>
        </p>
      </div>

      <div style={{ backgroundColor: '#ecfdf5', padding: '20px', borderRadius: '6px', marginBottom: '20px' }}>
        <h3 style={{ color: '#059669', fontSize: '18px', marginBottom: '15px' }}>
          What you can do next:
        </h3>
        <ul style={{ color: '#065f46', fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px' }}>
          <li>Calculate Scope 1, 2, and 3 emissions</li>
          <li>Generate professional emission reports</li>
          <li>Track your carbon reduction progress</li>
          <li>Export data for compliance reporting</li>
        </ul>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '30px 0' }} />
      
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#9ca3af', fontSize: '12px', margin: '0' }}>
          This verification link will expire in 24 hours for security reasons.
        </p>
        <p style={{ color: '#9ca3af', fontSize: '12px', margin: '10px 0 0 0' }}>
          If you didn't create an account, please ignore this email.
        </p>
      </div>
    </div>
  );
}

interface WelcomeEmailTemplateProps {
  firstName: string;
}

export function WelcomeEmailTemplate({ firstName }: WelcomeEmailTemplateProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#059669', fontSize: '28px', marginBottom: '10px' }}>
          🎉 Welcome to CO2 Calculator!
        </h1>
        <p style={{ color: '#666', fontSize: '16px', margin: '0' }}>
          Your account is now verified and ready to use
        </p>
      </div>

      <div style={{ backgroundColor: '#f0f9ff', padding: '30px', borderRadius: '8px', marginBottom: '30px' }}>
        <h2 style={{ color: '#111827', fontSize: '22px', marginBottom: '20px' }}>
          Hello {firstName}! 🌍
        </h2>
        
        <p style={{ color: '#374151', fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
          Your email has been successfully verified! You can now access all features of our CO2 Emission Calculator 
          to start tracking and reducing your carbon footprint.
        </p>
        
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a 
            href={`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard`}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '14px 28px',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'inline-block'
            }}
          >
            Go to Dashboard
          </a>
        </div>
      </div>

      <div style={{ backgroundColor: '#fef3c7', padding: '20px', borderRadius: '6px', marginBottom: '20px' }}>
        <h3 style={{ color: '#92400e', fontSize: '18px', marginBottom: '15px' }}>
          🚀 Quick Start Guide:
        </h3>
        <ol style={{ color: '#78350f', fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px' }}>
          <li><strong>Start with Scope 1:</strong> Calculate direct emissions from owned sources</li>
          <li><strong>Add Scope 2:</strong> Include purchased electricity and energy</li>
          <li><strong>Explore Scope 3:</strong> Track business travel and supply chain emissions</li>
          <li><strong>Generate Reports:</strong> Create professional PDF reports for stakeholders</li>
        </ol>
      </div>

      <div style={{ backgroundColor: '#ecfdf5', padding: '20px', borderRadius: '6px', marginBottom: '20px' }}>
        <h3 style={{ color: '#059669', fontSize: '18px', marginBottom: '15px' }}>
          📊 Key Features:
        </h3>
        <ul style={{ color: '#065f46', fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px' }}>
          <li>EPA-certified emission factors database</li>
          <li>GDPR-compliant data management</li>
          <li>Multi-company support for enterprises</li>
          <li>Export data in multiple formats</li>
          <li>Audit trails for compliance</li>
        </ul>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '30px 0' }} />
      
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#374151', fontSize: '14px', margin: '0 0 10px 0' }}>
          Need help? Check out our{' '}
          <a href={`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/help`} style={{ color: '#10b981' }}>
            documentation
          </a>{' '}
          or contact support.
        </p>
        <p style={{ color: '#9ca3af', fontSize: '12px', margin: '0' }}>
          CO2 Emission Calculator - Making carbon accounting accessible
        </p>
      </div>
    </div>
  );
} 