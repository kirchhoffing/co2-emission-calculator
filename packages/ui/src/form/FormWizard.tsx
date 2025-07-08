import React, { useState } from 'react';

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<FormStepProps>;
  isValid?: boolean;
}

export interface FormStepProps {
  onNext: () => void;
  onPrevious: () => void;
  onValidationChange: (isValid: boolean) => void;
  data: Record<string, any>;
  setData: (data: Record<string, any>) => void;
}

interface FormWizardProps {
  steps: FormStep[];
  onComplete: (data: Record<string, any>) => void;
  onCancel?: () => void;
  className?: string;
}

export function FormWizard({ steps, onComplete, onCancel, className = '' }: FormWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [stepValidation, setStepValidation] = useState<Record<string, boolean>>({});

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const isCurrentStepValid = stepValidation[currentStep.id] ?? false;

  const handleNext = () => {
    if (isLastStep) {
      onComplete(formData);
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleValidationChange = (isValid: boolean) => {
    setStepValidation(prev => ({
      ...prev,
      [currentStep.id]: isValid
    }));
  };

  const handleStepClick = (stepIndex: number) => {
    // Only allow navigation to previous steps or next step if current is valid
    if (stepIndex < currentStepIndex || (stepIndex === currentStepIndex + 1 && isCurrentStepValid)) {
      setCurrentStepIndex(stepIndex);
    }
  };

  const StepComponent = currentStep.component;

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex || (index === currentStepIndex && isCurrentStepValid);
            const isAccessible = index <= currentStepIndex || (index === currentStepIndex + 1 && isCurrentStepValid);
            
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => handleStepClick(index)}
                    disabled={!isAccessible}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400'
                        : isAccessible
                        ? 'bg-slate-100 dark:bg-neutral-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-600'
                        : 'bg-slate-50 dark:bg-neutral-800 text-slate-300 dark:text-neutral-600 cursor-not-allowed'
                    }`}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </button>
                  <div className="mt-2 text-center max-w-24">
                    <div className={`text-xs font-medium ${
                      isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    index < currentStepIndex ? 'bg-emerald-200 dark:bg-emerald-800' : 'bg-slate-200 dark:bg-neutral-700'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Current step content */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow border border-slate-200 dark:border-neutral-700 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            {currentStep.title}
          </h2>
          {currentStep.description && (
            <p className="text-slate-600 dark:text-slate-300">
              {currentStep.description}
            </p>
          )}
        </div>

        <StepComponent
          onNext={handleNext}
          onPrevious={handlePrevious}
          onValidationChange={handleValidationChange}
          data={formData}
          setData={setFormData}
        />
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex space-x-3">
          {!isFirstStep && (
            <button
              onClick={handlePrevious}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-600 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-700 transition-colors"
            >
              Previous
            </button>
          )}
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-red-600 dark:text-red-400 bg-white dark:bg-neutral-800 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={!isCurrentStepValid}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isCurrentStepValid
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-slate-300 dark:bg-neutral-600 text-slate-500 dark:text-neutral-400 cursor-not-allowed'
          }`}
        >
          {isLastStep ? 'Complete' : 'Next'}
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span>Step {currentStepIndex + 1} of {steps.length}</span>
          <span>{Math.round(((currentStepIndex + 1) / steps.length) * 100)}% complete</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-neutral-700 rounded-full h-2">
          <div
            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
} 