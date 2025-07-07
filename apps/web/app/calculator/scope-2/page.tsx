// Purpose: /calculator/scope-2 page for indirect emissions (form placeholder)
// This will use FormWizard and stub inputs for electricity usage

export default function Scope2CalculatorPage() {
  return (
    <>
      <div className="max-w-xl mx-auto text-center my-12">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-emerald-300 mb-2">Scope 2 – Indirect Emissions</h1>
        <p className="mb-6 text-slate-600 dark:text-slate-300">Indirect emissions from the generation of purchased electricity, steam, heating, and cooling.</p>
      </div>
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-800 rounded-lg shadow p-8 border border-slate-100 dark:border-neutral-700 mx-auto mb-16">
        {/* TODO: Replace with FormWizard and real step components */}
        <div className="mb-4">
          {/* Step 1: Electricity Usage Input */}
          <div className="mb-2 text-lg font-semibold">Step 1: Enter Electricity Usage</div>
          {/* <FormWizard step={1} /> */}
          <div className="bg-emerald-50 dark:bg-neutral-700 rounded p-4 mb-4">[Electricity usage input goes here]</div>
        </div>
        <div className="mb-4">
          {/* Step 2: Date Range Picker */}
          <div className="mb-2 text-lg font-semibold">Step 2: Select Date Range</div>
          <div className="bg-emerald-50 dark:bg-neutral-700 rounded p-4 mb-4">[DateRangePicker goes here]</div>
        </div>
        <div className="mb-4">
          {/* Step 3: Review & Submit (FormWizard) */}
          <div className="mb-2 text-lg font-semibold">Step 3: Review & Submit</div>
          <div className="bg-emerald-50 dark:bg-neutral-700 rounded p-4">[FormWizard/Submit goes here]</div>
        </div>
      </div>
    </>
  );
} 