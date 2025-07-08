import React, { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

function SidebarLink({ href, icon, label, isActive = false }: SidebarLinkProps) {
  return (
    <a
      href={href}
      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-700'
      }`}
    >
      <span className="w-5 h-5">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </a>
  );
}

export function DashboardLayout({ children, title, className = '' }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-neutral-800 border-r border-slate-200 dark:border-neutral-700 transform transition-transform lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center space-x-3 px-6 py-4 border-b border-slate-200 dark:border-neutral-700">
            <img src="/co2-main-logo.png" alt="CO2 Calculator" className="w-8 h-8" />
            <span className="text-xl font-bold text-slate-800 dark:text-emerald-300">
              CO₂ Calculator
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <SidebarLink
              href="/dashboard"
              icon={<span>📊</span>}
              label="Dashboard"
              isActive={typeof window !== 'undefined' && window.location.pathname === '/dashboard'}
            />
            <SidebarLink
              href="/calculator"
              icon={<span>🧮</span>}
              label="Calculator"
              isActive={typeof window !== 'undefined' && window.location.pathname.startsWith('/calculator')}
            />
            <SidebarLink
              href="/reports"
              icon={<span>📄</span>}
              label="Reports"
              isActive={typeof window !== 'undefined' && window.location.pathname.startsWith('/reports')}
            />
            <SidebarLink
              href="/import"
              icon={<span>📁</span>}
              label="Data Import"
              isActive={typeof window !== 'undefined' && window.location.pathname.startsWith('/import')}
            />
            <SidebarLink
              href="/analytics"
              icon={<span>📈</span>}
              label="Analytics"
              isActive={typeof window !== 'undefined' && window.location.pathname.startsWith('/analytics')}
            />
            
            <div className="pt-4 border-t border-slate-200 dark:border-neutral-700">
              <SidebarLink
                href="/profile"
                icon={<span>👤</span>}
                label="Profile"
                isActive={typeof window !== 'undefined' && window.location.pathname === '/profile'}
              />
              <SidebarLink
                href="/privacy-center"
                icon={<span>🔒</span>}
                label="Privacy Center"
                isActive={typeof window !== 'undefined' && window.location.pathname === '/privacy-center'}
              />
            </div>
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-slate-200 dark:border-neutral-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                  User Name
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  user@company.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white dark:bg-neutral-800 border-b border-slate-200 dark:border-neutral-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-700"
              >
                <span className="w-5 h-5 block">☰</span>
              </button>
              {title && (
                <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                  {title}
                </h1>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-700">
                <span className="w-5 h-5 block text-slate-600 dark:text-slate-300">🔔</span>
              </button>
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-700">
                <span className="w-5 h-5 block text-slate-600 dark:text-slate-300">⚙️</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className={`p-6 ${className}`}>
          {children}
        </main>
      </div>
    </div>
  );
} 