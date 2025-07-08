import React from 'react';

interface PublicLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  className?: string;
}

export function PublicLayout({ children, showNavbar = true, className = '' }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-900">
      {showNavbar && (
        <header className="bg-white dark:bg-neutral-800 border-b border-slate-100 dark:border-neutral-700">
          {/* Navbar will be imported from apps/web/components when integrated */}
          <nav className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img src="/co2-main-logo.png" alt="CO2 Calculator" className="w-8 h-8" />
                <span className="text-xl font-bold text-slate-800 dark:text-emerald-300">
                  CO₂ Calculator
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href="/calculator"
                  className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Calculator
                </a>
                <a
                  href="/login"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Sign In
                </a>
              </div>
            </div>
          </nav>
        </header>
      )}
      
      <main className={`flex-1 ${className}`}>
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
      
      <footer className="bg-slate-50 dark:bg-neutral-800 border-t border-slate-100 dark:border-neutral-700 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-slate-500 dark:text-slate-400 text-sm">
              &copy; {new Date().getFullYear()} CO₂ Emission Calculator. All rights reserved.
            </div>
            <nav className="flex items-center space-x-6 text-sm">
              <a
                href="/privacy"
                className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="/help"
                className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Help
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
} 