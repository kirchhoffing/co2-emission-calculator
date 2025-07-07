// Purpose: /calculator/scope-3 page for other indirect emissions (minimal form placeholder)
// This will use a minimal form for business travel (distance, transport method)

export default function Scope3CalculatorPage() {
  return (
    <>
      <div className="max-w-xl mx-auto text-center my-12">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-emerald-300 mb-2">Scope 3 – Other Indirect Emissions</h1>
        <p className="mb-6 text-slate-600 dark:text-slate-300">Other indirect emissions (business travel, third-party transport, etc.)</p>
      </div>
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-800 rounded-lg shadow p-8 border border-slate-100 dark:border-neutral-700 mx-auto mb-16">
        {/* Minimal form for business travel */}
        <div className="mb-4">
          <div className="mb-2 text-lg font-semibold">Business Travel</div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-200 mb-1" htmlFor="distance">Distance Traveled (km)</label>
              <input id="distance" type="number" className="w-full rounded border border-slate-300 dark:border-neutral-600 p-2 bg-emerald-50 dark:bg-neutral-700 text-slate-800 dark:text-slate-100" placeholder="e.g. 1200" disabled />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-200 mb-1" htmlFor="transport">Transport Method</label>
              <select id="transport" className="w-full rounded border border-slate-300 dark:border-neutral-600 p-2 bg-emerald-50 dark:bg-neutral-700 text-slate-800 dark:text-slate-100" disabled>
                <option>Air</option>
                <option>Rail</option>
                <option>Car</option>
                <option>Bus</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button className="w-full bg-emerald-600 text-white font-semibold py-3 rounded shadow hover:bg-emerald-700 transition-colors" disabled>
            Calculate (Coming Soon)
          </button>
        </div>
      </div>
    </>
  );
} 