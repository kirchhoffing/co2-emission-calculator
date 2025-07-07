// Purpose: /calculator/scope-1 page for direct emissions (multi-step form placeholder)
// This will use FuelTypeSelector, EmissionInput, DateRangePicker, UnitConverter, and FormWizard components

export default function Scope1CalculatorPage() {
  return (
    <>
      <div className="max-w-xl mx-auto text-center my-12">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-emerald-300 mb-2">Scope 1 – Direct Emissions</h1>
        <p className="mb-6 text-slate-600 dark:text-slate-300">Direct emissions from owned or controlled sources (fuel combustion, company vehicles, manufacturing).</p>
      </div>
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-800 rounded-lg shadow p-8 border border-slate-100 dark:border-neutral-700 mx-auto mb-16">
        {/* TODO: Replace with FormWizard and step components */}
        <div className="mb-4">
          {/* Step 1: FuelTypeSelector */}
          <div className="mb-2 text-lg font-semibold">Step 1: Select Fuel Type</div>
          {/* <FuelTypeSelector /> */}
          <div className="bg-emerald-50 dark:bg-neutral-700 rounded p-4 mb-4">[FuelTypeSelector goes here]</div>
        </div>
        <div className="mb-4">
          {/* Step 2: EmissionInput */}
          <div className="mb-2 text-lg font-semibold">Step 2: Enter Emission Data</div>
          {/* <EmissionInput /> */}
          <div className="bg-emerald-50 dark:bg-neutral-700 rounded p-4 mb-4">[EmissionInput goes here]</div>
        </div>
        <div className="mb-4">
          {/* Step 3: DateRangePicker */}
          <div className="mb-2 text-lg font-semibold">Step 3: Select Date Range</div>
          {/* <DateRangePicker /> */}
          <div className="bg-emerald-50 dark:bg-neutral-700 rounded p-4 mb-4">[DateRangePicker goes here]</div>
        </div>
        <div className="mb-4">
          {/* Step 4: UnitConverter */}
          <div className="mb-2 text-lg font-semibold">Step 4: Convert Units (if needed)</div>
          {/* <UnitConverter /> */}
          <div className="bg-emerald-50 dark:bg-neutral-700 rounded p-4 mb-4">[UnitConverter goes here]</div>
        </div>
        <div className="mb-4">
          {/* Step 5: Review & Submit (FormWizard) */}
          <div className="mb-2 text-lg font-semibold">Step 5: Review & Submit</div>
          {/* <FormWizard /> */}
          <div className="bg-emerald-50 dark:bg-neutral-700 rounded p-4">[FormWizard/Submit goes here]</div>
        </div>
      </div>
    </>
  );
} 