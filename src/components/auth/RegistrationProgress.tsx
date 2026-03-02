'use client';

import { Check } from 'lucide-react';

interface Step {
    number: number;
    title: string;
    description: string;
}

interface RegistrationProgressProps {
    currentStep: number;
    totalSteps: number;
}

const steps: Step[] = [
    { number: 1, title: 'Account', description: 'Email & Password' },
    { number: 2, title: 'Personal', description: 'Your Information' },
    { number: 3, title: 'Address', description: 'Location Details' },
    { number: 4, title: 'Students', description: 'Student Information' },
    { number: 5, title: 'Guardians', description: 'Emergency Contacts' },
    { number: 6, title: 'Complete', description: 'Terms & Finish' },
];

export function RegistrationProgress({
    currentStep,
    totalSteps,
}: RegistrationProgressProps) {
    return (
        <div className="w-full py-8">
            {/* Progress Bar */}
            <div className="relative mb-8">
                <div className="absolute top-5 left-0 w-full h-1 bg-gray-200">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{
                            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
                        }}
                    />
                </div>

                {/* Steps */}
                <div className="relative flex justify-between">
                    {steps.map((step) => {
                        const isCompleted = step.number < currentStep;
                        const isCurrent = step.number === currentStep;
                        const isUpcoming = step.number > currentStep;

                        return (
                            <div key={step.number} className="flex flex-col items-center">
                                {/* Step Circle */}
                                <div
                                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    font-semibold text-sm transition-all duration-300
                    ${isCompleted
                                            ? 'bg-primary text-white'
                                            : isCurrent
                                                ? 'bg-primary text-white ring-4 ring-primary/20'
                                                : 'bg-gray-200 text-gray-500'
                                        }
                  `}
                                >
                                    {isCompleted ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        step.number
                                    )}
                                </div>

                                {/* Step Info */}
                                <div className="mt-2 text-center">
                                    <p
                                        className={`
                      text-sm font-medium
                      ${isCurrent
                                                ? 'text-primary'
                                                : isCompleted
                                                    ? 'text-gray-700'
                                                    : 'text-gray-400'
                                            }
                    `}
                                    >
                                        {step.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Current Step Info */}
            <div className="text-center">
                <p className="text-sm text-gray-600">
                    Step {currentStep} of {totalSteps}
                </p>
            </div>
        </div>
    );
}
