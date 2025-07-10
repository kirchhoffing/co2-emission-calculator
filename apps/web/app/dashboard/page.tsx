'use client';

import React from 'react';
import { DashboardLayout } from 'ui';
import Link from 'next/link';

// Mock data - in a real app, this would come from the database via tRPC
const MOCK_EMISSION_DATA = {
  scope1Total: 1245.67,
  scope2Total: 2834.21,
  scope3Total: 4567.89, // Now calculated
  totalEmissions: 8647.77,
  lastUpdated: new Date('2024-01-15'),
  calculationsThisMonth: 15,
  reportsGenerated: 3,
};

const MOCK_RECENT_CALCULATIONS = [
  {
    id: '1',
    scope: 'scope_3',
    category: 'Business Travel',
    amount: 2500,
    unit: 'km',
    emissions: 637.5,
    createdAt: new Date('2024-01-16T15:45:00Z'),
  },
  {
    id: '2',
    scope: 'scope_1',
    category: 'Mobile Combustion',
    amount: 1200,
    unit: 'L',
    emissions: 2784.0,
    createdAt: new Date('2024-01-15T10:30:00Z'),
  },
  {
    id: '3',
    scope: 'scope_2',
    category: 'Purchased Electricity',
    amount: 5000,
    unit: 'kWh',
    emissions: 2500.0,
    createdAt: new Date('2024-01-14T14:20:00Z'),
  },
];

// Summary card component
function EmissionSummaryCard({ 
  title, 
  value, 
  unit = 'kg CO₂e', 
  scope, 
  status = 'completed',
  trend,
  className = ''
}: {
  title: string;
  value: number;
  unit?: string;
  scope: 'scope_1' | 'scope_2' | 'scope_3' | 'total';
  status?: 'completed' | 'partial' | 'not_started';
  trend?: 'up' | 'down' | 'stable';
  className?: string;
}) {
  const getScopeColor = (scope: string, status: string) => {
    if (status === 'not_started') return 'border-slate-200 dark:border-neutral-700';
    if (status === 'partial') return 'border-yellow-200 dark:border-yellow-800';
    
    switch (scope) {
      case 'scope_1': return 'border-red-200 dark:border-red-800';
      case 'scope_2': return 'border-blue-200 dark:border-blue-800';
      case 'scope_3': return 'border-green-200 dark:border-green-800';
      case 'total': return 'border-emerald-200 dark:border-emerald-800';
      default: return 'border-slate-200 dark:border-neutral-700';
    }
  };

  const getScopeColorBg = (scope: string, status: string) => {
    if (status === 'not_started') return 'bg-slate-50 dark:bg-neutral-800';
    if (status === 'partial') return 'bg-yellow-50 dark:bg-yellow-900/20';
    
    switch (scope) {
      case 'scope_1': return 'bg-red-50 dark:bg-red-900/20';
      case 'scope_2': return 'bg-blue-50 dark:bg-blue-900/20';
      case 'scope_3': return 'bg-green-50 dark:bg-green-900/20';
      case 'total': return 'bg-emerald-50 dark:bg-emerald-900/20';
      default: return 'bg-slate-50 dark:bg-neutral-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'partial': return '⚠️';
      case 'not_started': return '⭕';
      default: return '📊';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '';
    }
  };

  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-lg border-2 ${getScopeColor(scope, status)} p-6 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</h3>
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon(status)}</span>
          {trend && <span className="text-sm">{getTrendIcon(trend)}</span>}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
          {status === 'not_started' ? '—' : value.toLocaleString()}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {unit}
        </div>
      </div>
      
      <div className={`mt-4 px-3 py-1 rounded-full text-xs font-medium ${getScopeColorBg(scope, status)}`}>
        <span className={`
          ${status === 'completed' ? 'text-emerald-700 dark:text-emerald-300' : ''}
          ${status === 'partial' ? 'text-yellow-700 dark:text-yellow-300' : ''}
          ${status === 'not_started' ? 'text-slate-600 dark:text-slate-400' : ''}
        `}>
          {status === 'completed' && 'Complete'}
          {status === 'partial' && 'In Progress'}
          {status === 'not_started' && 'Not Started'}
        </span>
      </div>
    </div>
  );
}

// Quick action card component
function QuickActionCard({ 
  title, 
  description, 
  href, 
  icon, 
  color = 'emerald' 
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
  color?: 'emerald' | 'blue' | 'purple' | 'orange';
}) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30';
      case 'purple': return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30';
      case 'orange': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30';
      default: return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30';
    }
  };

  return (
    <Link href={href}>
      <div className={`p-6 rounded-lg border-2 transition-colors cursor-pointer ${getColorClasses(color)}`}>
        <div className="flex items-center space-x-4">
          <div className="text-3xl">{icon}</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {description}
            </p>
          </div>
          <div className="text-slate-400 dark:text-slate-500">
            →
          </div>
        </div>
      </div>
    </Link>
  );
}

// Recent calculation item component
function RecentCalculationItem({ calculation }: { calculation: any }) {
  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'scope_1': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300';
      case 'scope_2': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300';
      case 'scope_3': return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300';
      default: return 'bg-slate-100 dark:bg-neutral-700 text-slate-700 dark:text-slate-300';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-neutral-700 rounded-lg">
      <div className="flex items-center space-x-4">
        <div className={`px-2 py-1 rounded text-xs font-medium ${getScopeColor(calculation.scope)}`}>
          {calculation.scope.replace('_', ' ').toUpperCase()}
        </div>
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-200">
            {calculation.category}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {calculation.amount.toLocaleString()} {calculation.unit}
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="font-semibold text-slate-800 dark:text-slate-200">
          {calculation.emissions.toFixed(1)} kg CO₂e
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(calculation.createdAt)}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome section */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome to CO₂ Calculator</h2>
          <p className="text-emerald-100 mb-4">
            Track, calculate, and report your organization's carbon emissions across all scopes.
          </p>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <span className="font-semibold">Last Updated:</span>
              <span>{MOCK_EMISSION_DATA.lastUpdated.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold">This Month:</span>
              <span>{MOCK_EMISSION_DATA.calculationsThisMonth} calculations</span>
            </div>
          </div>
        </div>

        {/* Emission summary cards */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Emission Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <EmissionSummaryCard
              title="Scope 1 (Direct)"
              value={MOCK_EMISSION_DATA.scope1Total}
              scope="scope_1"
              status="completed"
              trend="stable"
            />
            <EmissionSummaryCard
              title="Scope 2 (Indirect)"
              value={MOCK_EMISSION_DATA.scope2Total}
              scope="scope_2"
              status="completed"
              trend="down"
            />
            <EmissionSummaryCard
              title="Scope 3 (Value Chain)"
              value={MOCK_EMISSION_DATA.scope3Total}
              scope="scope_3"
              status="completed"
              trend="up"
            />
            <EmissionSummaryCard
              title="Total Emissions"
              value={MOCK_EMISSION_DATA.totalEmissions}
              scope="total"
              status="completed"
              trend="up"
              className="md:col-span-2 xl:col-span-1"
            />
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuickActionCard
              title="New Calculation"
              description="Start calculating emissions for Scope 1, 2, or 3"
              href="/calculator"
              icon="🧮"
              color="emerald"
            />
            <QuickActionCard
              title="Generate Report"
              description="Create PDF or CSV reports of your emissions"
              href="/reports"
              icon="📄"
              color="blue"
            />
            <QuickActionCard
              title="Import Data"
              description="Upload energy and fuel consumption data"
              href="/import"
              icon="📁"
              color="purple"
            />
            <QuickActionCard
              title="View Analytics"
              description="Analyze trends and benchmark performance"
              href="/analytics"
              icon="📈"
              color="orange"
            />
          </div>
        </div>

        {/* Recent activity and key metrics */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Recent calculations */}
          <div className="xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                Recent Calculations
              </h3>
              <Link href="/calculator" className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm">
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {MOCK_RECENT_CALCULATIONS.map((calculation) => (
                <RecentCalculationItem key={calculation.id} calculation={calculation} />
              ))}
            </div>
          </div>

          {/* Key metrics */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
              Key Metrics
            </h3>
            <div className="space-y-4">
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700 p-4">
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  {MOCK_EMISSION_DATA.calculationsThisMonth}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Calculations this month
                </div>
              </div>
              
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700 p-4">
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  {MOCK_EMISSION_DATA.reportsGenerated}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Reports generated
                </div>
              </div>
              
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700 p-4">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  100%
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Scope completion
                </div>
              </div>
              
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700 p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  -12%
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Change vs last month
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next steps */}
        <div className="bg-slate-50 dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
            Recommended Next Steps
          </h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-emerald-500">✅</span>
              <span className="text-slate-700 dark:text-slate-300">
                All emission scopes completed! Your carbon footprint calculation is comprehensive
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-blue-500">📊</span>
              <span className="text-slate-700 dark:text-slate-300">
                Set up regular data imports to automate emission tracking
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-emerald-500">📄</span>
              <span className="text-slate-700 dark:text-slate-300">
                Generate your first sustainability report for stakeholder communication
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 