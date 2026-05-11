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
    validatePhone10,
    validateRequired,
    validateAge,
} from '@/utils/validation';

const STORAGE_KEY = 'proactiv:bookAssessmentDraft'

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
        childDOB: '',
        location: '',
        date: '',
        timeSlot: '',
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        emergencyContact: '',
        agreeToReceive: false,
    });

    // Restore form draft from sessionStorage (survives a tab refresh)
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            if (raw) {
                const saved = JSON.parse(raw);
                if (saved?.bookingData) setBookingData(prev => ({ ...prev, ...saved.bookingData }));
                if (typeof saved?.currentStep === 'number') setCurrentStep(saved.currentStep);
            }
        } catch { /* ignore parse errors */ }
        setHydrated(true);
    }, []);

    // Persist draft on every change once we've hydrated
    useEffect(() => {
        if (!hydrated) return;
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ bookingData, currentStep }));
        } catch { /* ignore quota errors */ }
    }, [bookingData, currentStep, hydrated]);

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
                const ageErr = bookingData.childAge ? validateAge(bookingData.childAge, 3, 18) : validateSelect(bookingData.childAge, "Child's age");
                if (ageErr) errs.childAge = ageErr;
                const genderErr = validateSelect(bookingData.childGender, 'Gender');
                if (genderErr) errs.childGender = genderErr;
                // Optional DOB but if present, must be valid + match age
                if (bookingData.childDOB) {
                    const dob = new Date(bookingData.childDOB);
                    if (isNaN(dob.getTime())) errs.childDOB = 'Please enter a valid date of birth';
                    else {
                        const today = new Date();
                        today.setHours(23, 59, 59, 999);
                        if (dob > today) errs.childDOB = 'Date of birth cannot be in the future';
                        else if (bookingData.childAge) {
                            let computedAge = today.getFullYear() - dob.getFullYear();
                            const m = today.getMonth() - dob.getMonth();
                            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) computedAge--;
                            const entered = parseInt(bookingData.childAge, 10);
                            if (!isNaN(entered) && Math.abs(computedAge - entered) > 1) {
                                errs.childDOB = `Age (${entered}) does not match Date of Birth (~${computedAge} years)`;
                            }
                        }
                    }
                }
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
                // If selecting today, also reject past times
                else if (bookingData.date && bookingData.timeSlot) {
                    const today = new Date();
                    const picked = new Date(bookingData.date);
                    if (picked.toDateString() === today.toDateString()) {
                        const [hh] = bookingData.timeSlot.split(':');
                        const slotHour = parseInt(hh, 10);
                        if (!isNaN(slotHour) && slotHour <= today.getHours()) {
                            errs.timeSlot = 'Time slot has already passed';
                        }
                    }
                }
                break;
            }
            case 5: {
                const nameErr = validateName(bookingData.parentName, 'Parent name');
                if (nameErr) errs.parentName = nameErr;
                const emailErr = validateEmail(bookingData.parentEmail);
                if (emailErr) errs.parentEmail = emailErr;
                const phoneErr = validatePhone10(bookingData.parentPhone, true, 'Phone number');
                if (phoneErr) errs.parentPhone = phoneErr;
                if (bookingData.emergencyContact) {
                    const emErr = validatePhone10(bookingData.emergencyContact, false, 'Emergency contact');
                    if (emErr) errs.emergencyContact = emErr;
                }
                if (!bookingData.agreeToReceive) {
                    errs.agreeToReceive = 'Please agree to receive booking confirmations to continue';
                }
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
        // Clear draft once we successfully submit (handled by parent)
        try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
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
                        childDOB={bookingData.childDOB}
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
                        emergencyContact={bookingData.emergencyContact}
                        agreeToReceive={bookingData.agreeToReceive}
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
