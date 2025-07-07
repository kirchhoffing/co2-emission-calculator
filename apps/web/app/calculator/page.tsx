// Purpose: /calculator landing page with navigation to Scope 1, 2, 3 calculators
import Link from 'next/link';

// Card component styled to match global theme
function CalculatorCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-slate-100 dark:border-neutral-700 p-6 text-center hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
    >
      <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-emerald-200 mb-2">{title}</h2>
      <p className="text-slate-600 dark:text-slate-300 text-base">{description}</p>
    </Link>
  );
}

export default function CalculatorPage() {
  return (
    <>
      <div className="max-w-xl mx-auto text-center my-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-emerald-300 mb-6">
          CO₂ Emission Calculator
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8">
          Select a scope to begin calculating your organization&apos;s emissions.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto mb-16">
        <CalculatorCard
          title="Scope 1"
          description="Direct emissions from owned or controlled sources (fuel combustion, company vehicles, manufacturing)."
          href="/calculator/scope-1"
        />
        <CalculatorCard
          title="Scope 2"
          description="Indirect emissions from the generation of purchased electricity, steam, heating, and cooling."
          href="/calculator/scope-2"
        />
        <CalculatorCard
          title="Scope 3"
          description="Other indirect emissions (business travel, third-party transport, etc.)."
          href="/calculator/scope-3"
        />
      </div>
    </>
  );
} 