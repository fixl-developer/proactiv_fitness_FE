'use client';

import { useState } from 'react';

interface Package {
    id: string;
    name: string;
    sessions: number;
    price: number;
    validityDays: number;
    discount?: number;
    popular?: boolean;
}

interface BookingStep2Props {
    onNext: (packageId: string) => void;
    onBack: () => void;
}

export default function BookingStep2({ onNext, onBack }: BookingStep2Props) {
    const [selectedPackage, setSelectedPackage] = useState<string>('');

    // Mock packages - replace with API call
    const packages: Package[] = [
        {
            id: '1',
            name: 'Single Session',
            sessions: 1,
            price: 50,
            validityDays: 7,
        },
        {
            id: '2',
            name: '4 Sessions',
            sessions: 4,
            price: 180,
            validityDays: 30,
            discount: 10,
        },
        {
            id: '3',
            name: '8 Sessions',
            sessions: 8,
            price: 320,
            validityDays: 60,
            discount: 20,
            popular: true,
        },
        {
            id: '4',
            name: '12 Sessions',
            sessions: 12,
            price: 420,
            validityDays: 90,
            discount: 30,
        },
    ];

    const handleNext = () => {
        if (selectedPackage) {
            onNext(selectedPackage);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Select Package</h2>
                <p className="mt-2 text-gray-600">
                    Choose a package that fits your needs
                </p>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages.map((pkg) => (
                    <div id={`booking-step2-package-${pkg.id}-btn`}
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg.id)}
                        className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all ${selectedPackage === pkg.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        {/* Popular Badge */}
                        {pkg.popular && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                    MOST POPULAR
                                </span>
                            </div>
                        )}

                        {/* Discount Badge */}
                        {pkg.discount && (
                            <div className="absolute top-4 right-4">
                                <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                                    {pkg.discount}% OFF
                                </span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {pkg.name}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {pkg.sessions} {pkg.sessions === 1 ? 'Session' : 'Sessions'}
                                </p>
                            </div>

                            <div className="flex items-baseline">
                                <span className="text-3xl font-bold text-gray-900">
                                    ${pkg.price}
                                </span>
                                {pkg.discount && (
                                    <span className="ml-2 text-lg text-gray-500 line-through">
                                        ${Math.round(pkg.price / (1 - pkg.discount / 100))}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <svg
                                        className="w-4 h-4 mr-2 text-green-500"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    Valid for {pkg.validityDays} days
                                </div>
                                <div className="flex items-center">
                                    <svg
                                        className="w-4 h-4 mr-2 text-green-500"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    ${(pkg.price / pkg.sessions).toFixed(2)} per session
                                </div>
                                <div className="flex items-center">
                                    <svg
                                        className="w-4 h-4 mr-2 text-green-500"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    Flexible scheduling
                                </div>
                            </div>

                            {/* Selection Indicator */}
                            <div className="flex justify-center pt-2">
                                <div
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPackage === pkg.id
                                            ? 'border-blue-500 bg-blue-500'
                                            : 'border-gray-300'
                                        }`}
                                >
                                    {selectedPackage === pkg.id && (
                                        <svg
                                            className="w-4 h-4 text-white"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
                <button id="booking-step2-back-btn"
                    onClick={onBack}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Back
                </button>
                <button id="booking-step2-continue-btn"
                    onClick={handleNext}
                    disabled={!selectedPackage}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    Continue to Payment
                </button>
            </div>
        </div>
    );
}
