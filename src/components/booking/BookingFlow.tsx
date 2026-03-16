'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import StepIndicator from './StepIndicator';
import SelectProgram from './steps/SelectProgram';
import ChildDetails from './steps/ChildDetails';
import SelectLocation from './steps/SelectLocation';
import SelectDateTime from './steps/SelectDateTime';
import ParentDetails from './steps/ParentDetails';
import ReviewConfirm from './steps/ReviewConfirm';

interface BookingFlowProps {
    onComplete: (data: any) => void;
    onBack: () => void;
}

export default function BookingFlow({ onComplete, onBack }: BookingFlowProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [bookingData, setBookingData] = useState({
        program: '',
        childName: '',
        childAge: '',
        childGender: '',
        location: '',
        date: '',
        timeSlot: '',
        parentName: '',
        parentEmail: '',
        parentPhone: ''
    });

    const totalSteps = 6;
    const stepTitles = [
        'Select Program',
        'Child Details',
        'Select Location',
        'Date & Time',
        'Parent Details',
        'Review & Confirm'
    ];

    const updateBookingData = (data: Partial<typeof bookingData>) => {
        setBookingData(prev => ({ ...prev, ...data }));
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = () => {
        onComplete(bookingData);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <SelectProgram
                        selectedProgram={bookingData.program}
                        onSelect={(program) => updateBookingData({ program })}
                    />
                );
            case 2:
                return (
                    <ChildDetails
                        childName={bookingData.childName}
                        childAge={bookingData.childAge}
                        childGender={bookingData.childGender}
                        onUpdate={updateBookingData}
                    />
                );
            case 3:
                return (
                    <SelectLocation
                        selectedLocation={bookingData.location}
                        onSelect={(location) => updateBookingData({ location })}
                    />
                );
            case 4:
                return (
                    <SelectDateTime
                        selectedDate={bookingData.date}
                        selectedTime={bookingData.timeSlot}
                        onSelect={(date, timeSlot) => updateBookingData({ date, timeSlot })}
                    />
                );
            case 5:
                return (
                    <ParentDetails
                        parentName={bookingData.parentName}
                        parentEmail={bookingData.parentEmail}
                        parentPhone={bookingData.parentPhone}
                        onUpdate={updateBookingData}
                    />
                );
            case 6:
                return (
                    <ReviewConfirm
                        bookingData={bookingData}
                        onConfirm={handleComplete}
                    />
                );
            default:
                return null;
        }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1: return bookingData.program !== '';
            case 2: return bookingData.childName !== '' && bookingData.childAge !== '';
            case 3: return bookingData.location !== '';
            case 4: return bookingData.date !== '' && bookingData.timeSlot !== '';
            case 5: return bookingData.parentName !== '' && bookingData.parentEmail !== '' && bookingData.parentPhone !== '';
            case 6: return true;
            default: return false;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Assessment Info
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Book Your Assessment
                    </h1>
                    <p className="text-gray-600">
                        Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}
                    </p>
                </div>

                {/* Progress Indicator */}
                <StepIndicator
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    stepTitles={stepTitles}
                />

                {/* Step Content */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    {renderStep()}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${currentStep === 1
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                    </button>

                    {currentStep < totalSteps ? (
                        <button
                            onClick={nextStep}
                            disabled={!isStepValid()}
                            className={`flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all ${isStepValid()
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Next Step
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleComplete}
                            disabled={!isStepValid()}
                            className={`flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all ${isStepValid()
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <Check className="w-4 h-4" />
                            Confirm Booking
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
