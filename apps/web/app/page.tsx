// Home page for CO2 Emission Calculator
// Purpose: Welcomes users, explains value, and guides to sign up or start calculating
// Uses inline stub components for now; extract to packages/ui later

import React from 'react';

// --- Stub Components (move to packages/ui later) ---

// Button: Primary/Secondary variants
const Button = ({ as = 'button', href, variant = 'primary', children, ...props }) => {
  const base =
    'inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
    secondary: 'bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  const className = `${base} ${variants[variant]}`;
  if (as === 'a') {
    return <a href={href} className={className} {...props}>{children}</a>;
  }
  return <button className={className} {...props}>{children}</button>;
};

// FeatureCard: Icon, title, description
const FeatureCard = ({ icon, title, description }) => (
  <div className="flex flex-col items-center bg-white rounded-xl shadow-sm p-6 text-center border border-slate-100 h-full">
    <div className="text-3xl mb-3" aria-hidden>{icon}</div>
    <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600 text-base">{description}</p>
  </div>
);

// HowItWorksStep: Step number, icon, title, description
const HowItWorksStep = ({ step, icon, title, description }) => (
  <div className="flex flex-col items-center text-center max-w-xs mx-auto">
    <div className="w-12 h-12 flex items-center justify-center bg-emerald-100 rounded-full mb-3 text-2xl" aria-hidden>{icon}</div>
    <div className="text-emerald-700 font-bold text-lg mb-1">Step {step}</div>
    <div className="font-semibold text-slate-800 mb-1">{title}</div>
    <div className="text-slate-600 text-base">{description}</div>
  </div>
);

// Footer: Links
const Footer = () => (
  <footer className="mt-16 py-8 px-4 md:px-12 bg-slate-50 border-t border-slate-100 text-slate-500 text-sm flex flex-col md:flex-row items-center justify-between gap-2">
    <div>&copy; {new Date().getFullYear()} The Green Scope</div>
    <nav className="flex gap-4">
      <a href="/privacy" className="hover:text-emerald-600 underline focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded">Privacy</a>
      <a href="/terms" className="hover:text-emerald-600 underline focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded">Terms</a>
      <a href="/help" className="hover:text-emerald-600 underline focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded">Help</a>
      <a href="/accessibility" className="hover:text-emerald-600 underline focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded">Accessibility</a>
    </nav>
  </footer>
);

// --- Main Home Page ---

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-900 dark">
      {/* <Header /> */}

      {/* Hero Section - Centered Content */}
      <section className="flex flex-col items-center justify-center text-center gap-8 py-24 px-4 md:px-12 bg-emerald-50 dark:bg-neutral-800 border-b border-slate-100 dark:border-neutral-700">
        <div className="max-w-xl">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-800 dark:text-emerald-300 mb-6">
            Track and Report Your Business&apos;s CO2 Emissions
          </h1>
          <p className="text-lg md:text-2xl text-slate-600 dark:text-slate-300 mb-8">
            Simple, accurate, and compliant carbon accounting for modern organizations.
          </p>
          <Button as="a" href="/auth/signup" variant="primary" aria-label="Get Started">
            Get Started
          </Button>
        </div>
        {/* Logo and Globe Illustration */}
        <div className="flex flex-col items-center gap-4 mt-6">
          <img src="/co2-main-logo.png" alt="CO2 Emission Calculator Logo" className="w-20 h-20 rounded-full bg-white dark:bg-neutral-900 shadow" />
          <img src="/globe.svg" alt="Eco-friendly globe illustration" className="w-64 h-64 object-contain" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-12 bg-white dark:bg-neutral-900">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-emerald-200 text-center mb-12">Why Choose Us?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon="📊"
            title="Accurate Emission Tracking"
            description="Calculate Scope 1, 2, and partial 3 emissions with industry-standard factors."
          />
          <FeatureCard
            icon="🛡️"
            title="GDPR Compliant"
            description="Your data is encrypted and privacy is our top priority."
          />
          <FeatureCard
            icon="📄"
            title="Easy Reporting"
            description="Generate PDF and JSON reports for compliance and stakeholders."
          />
          <FeatureCard
            icon="💡"
            title="Business Insights"
            description="Visualize trends and identify reduction opportunities."
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 md:px-12 bg-slate-50 dark:bg-neutral-800 border-t border-slate-100 dark:border-neutral-700">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-emerald-200 text-center mb-12">How It Works</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 max-w-5xl mx-auto">
          <HowItWorksStep
            step={1}
            icon="⬆️"
            title="Import Data"
            description="Upload your energy and fuel usage data securely."
          />
          <div className="hidden md:block w-12 h-1 bg-emerald-200 dark:bg-emerald-900 rounded-full" aria-hidden></div>
          <HowItWorksStep
            step={2}
            icon="🧮"
            title="Calculate Emissions"
            description="Let our engine compute your carbon footprint instantly."
          />
          <div className="hidden md:block w-12 h-1 bg-emerald-200 dark:bg-emerald-900 rounded-full" aria-hidden></div>
          <HowItWorksStep
            step={3}
            icon="📑"
            title="Generate Reports"
            description="Download compliant reports and share with stakeholders."
          />
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 md:px-12 bg-emerald-50 dark:bg-neutral-800 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-emerald-200 mb-6">Ready to get started?</h2>
        <Button as="a" href="/auth/signup" variant="primary" aria-label="Get Started">
          Get Started
        </Button>
        <div className="mt-4">
          <a href="/help" className="text-emerald-700 dark:text-emerald-300 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded">Learn More</a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
