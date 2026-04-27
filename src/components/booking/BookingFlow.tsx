'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { toast } from 'sonner';
import StepIndicator from './StepIndicator';
import SelectProgram from './steps/SelectProgram';
import ChildDetails from './steps/ChildDetails';
import SelectLocation from './steps/SelectLocation';
import SelectDateTime from './steps/SelectDateTime';
import ParentDetails from './steps/ParentDetails';
import ReviewConfirm from './steps/ReviewConfirm';
import { useAuth } from '@/contexts/AuthContext';
import {
    validateName,
    validateSelect,
    validateEmail,
    validatePhone,
    validateRequired,
} from '@/utils/validation';

interface BookingFlowProps {
    onComplete: (data: any) => void;
    onBack: () => void;
}

type StepErrors = Record<string, string>;

export default function BookingFlow({ onComplete, onBack }: BookingFlowProps) {
    const { user, isAuthenticated } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [stepErrors, setStepErrors] = useState<StepErrors>({});
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

    // Auto-fill parent details from logged-in user
    useEffect(() => {
        if (isAuthenticated && user) {
            setBookingData(prev => ({
                ...prev,
                parentName: prev.parentName || user.name || '',
                parentEmail: prev.parentEmail || user.email || '',
            }));
        }
    }, [isAuthenticated, user]);

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
        // Clear errors for fields that were just updated
        if (Object.keys(stepErrors).length) {
            setStepErrors(prev => {
                const next = { ...prev };
                Object.keys(data).forEach(key => { delete next[key]; });
                return next;
            });
        }
    };

    /**
     * Validate the data for a specific step. Returns a map of fieldName -> errorMessage
     * (empty object means valid).
     */
    const validateStep = (step: number): StepErrors => {
        const errs: StepErrors = {};
        switch (step) {
            case 1: {
                const e = validateSelect(bookingData.program, 'program');
                if (e) errs.program = e;
                break;
            }
            case 2: {
                const nameErr = validateName(bookingData.childName, "Child's name");
                if (nameErr) errs.childName = nameErr;
                const ageErr = validateSelect(bookingData.childAge, "Child's age");
                if (ageErr) errs.childAge = ageErr;
                const genderErr = validateSelect(bookingData.childGender, 'Gender');
                if (genderErr) errs.childGender = genderErr;
                break;
            }
            case 3: {
                const e = validateSelect(bookingData.location, 'location');
                if (e) errs.location = e;
                break;
            }
            case 4: {
                const dateErr = validateRequired(bookingData.date, 'Date');
                if (dateErr) errs.date = dateErr;
                else {
                    const picked = new Date(bookingData.date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (picked < today) errs.date = 'Date cannot be in the past';
                }
                const timeErr = validateRequired(bookingData.timeSlot, 'Time slot');
                if (timeErr) errs.timeSlot = timeErr;
                break;
            }
            case 5: {
                const nameErr = validateName(bookingData.parentName, 'Parent name');
                if (nameErr) errs.parentName = nameErr;
                const emailErr = validateEmail(bookingData.parentEmail);
                if (emailErr) errs.parentEmail = emailErr;
                const phoneErr = validatePhone(bookingData.parentPhone, true);
                if (phoneErr) errs.parentPhone = phoneErr;
                break;
            }
            case 6:
                // Review step — re-run all to be safe
                return { ...validateStep(1), ...validateStep(2), ...validateStep(3), ...validateStep(4), ...validateStep(5) };
            default:
                break;
        }
        return errs;
    };

    const isStepValid = (step: number = currentStep): boolean => {
        return Object.keys(validateStep(step)).length === 0;
    };

    const nextStep = () => {
        const errs = validateStep(currentStep);
        if (Object.keys(errs).length) {
            setStepErrors(errs);
            const firstError = Object.values(errs)[0];
            toast.error(firstError || 'Please complete this step before continuing');
            return;
        }
        setStepErrors({});
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setStepErrors({});
            setCurrentStep(currentStep - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleComplete = () => {
        const errs = validateStep(6);
        if (Object.keys(errs).length) {
            setStepErrors(errs);
            const firstError = Object.values(errs)[0];
            toast.error(firstError || 'Please complete all required fields');
            return;
        }
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
                        errors={stepErrors}
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
                        errors={stepErrors}
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

    const stepValid = isStepValid();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <button id="booking-booking-flow-btn"
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
                    <button id="booking-booking-flow-btn-2"
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
                        <button id="booking-booking-flow-btn-next-step"
                            type="button"
                            onClick={nextStep}
                            className={`flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all ${stepValid
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                }`}
                        >
                            Next Step
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button id="booking-booking-flow-btn-3"
                            type="button"
                            onClick={handleComplete}
                            className={`flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all ${stepValid
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
                                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
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
