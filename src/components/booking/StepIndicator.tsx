'use client';

import { Check } from 'lucide-react';

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
    stepTitles: string[];
}

export default function StepIndicator({ currentStep, totalSteps, stepTitles }: StepIndicatorProps) {
    return (
        <div className="mb-8">
            {/* Desktop Version */}
            <div className="hidden md:flex items-center justify-between">
                {Array.from({ length: totalSteps }, (_, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;

                    return (
                        <div key={stepNumber} className="flex items-center">
                            {/* Step Circle */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all ${isCompleted
                                            ? 'bg-green-500 text-white'
                                            : isCurrent
                                                ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                                                : 'bg-gray-200 text-gray-500'
                                        }`}
                                >
                                    {isCompleted ? (
                                        <Check className="w-6 h-6" />
                                    ) : (
                                        stepNumber
                                    )}
                                </div>
                                <span
                                    className={`mt-2 text-sm font-medium ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                                        }`}
                                >
                                    {stepTitles[index]}
                                </span>
                            </div>

                            {/* Connector Line */}
                            {stepNumber < totalSteps && (
                                <div
                                    className={`flex-1 h-1 mx-4 rounded-full ${stepNumber < currentStep ? 'bg-green-500' : 'bg-gray-200'
                                        }`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Mobile Version */}
            <div className="md:hidden">
                <div className="flex items-center justify-center mb-4">
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${'bg-blue-600'
                            }`}
                    >
                        {currentStep}
                    </div>
                    <div className="ml-3">
                        <div className="text-sm text-gray-500">
                            Step {currentStep} of {totalSteps}
                        </div>
                        <div className="font-medium text-gray-900">
                            {stepTitles[currentStep - 1]}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
