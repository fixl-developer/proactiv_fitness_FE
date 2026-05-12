'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { rbacManager } from '@/services/auth/rbac';
import { apiClient } from '@/services/api/client';
import { RegisterStep1 } from '@/components/auth/RegisterStep1';
import { RegisterStep2 } from '@/components/auth/RegisterStep2';
import { RegisterStep3 } from '@/components/auth/RegisterStep3';
import { RegisterStep4 } from '@/components/auth/RegisterStep4';
import { RegisterStep5 } from '@/components/auth/RegisterStep5';
import { RegisterStep6 } from '@/components/auth/RegisterStep6';
import { RegistrationProgress } from '@/components/auth/RegistrationProgress';
import type { RegisterStep1Data } from '@/lib/validations/auth';
import type { RegisterStep2Data } from '@/lib/validations/auth';
import type { RegisterStep3Data } from '@/lib/validations/auth';
import type { RegisterStep4Data } from '@/lib/validations/auth';
import type { RegisterStep5Data } from '@/lib/validations/auth';
import type { RegisterStep6Data } from '@/lib/validations/auth';

const REGISTRATION_STORAGE_KEY = 'proactiv:parent-registration:v1';

const initialFormData = {
    // Step 1: Account
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2: Personal
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    // Step 3: Address
    address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
    },
    // Step 4: Students
    students: [] as Array<{
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        gender: 'male' | 'female' | 'other';
        school?: string;
        medicalConditions?: string;
    }>,
    // Step 5: Guardians
    guardians: [] as Array<{
        firstName: string;
        lastName: string;
        relationship: string;
        phone: string;
        email: string;
        isEmergencyContact: boolean;
    }>,
    // Step 6: Terms
    acceptTerms: false,
    acceptPrivacy: false,
    marketingConsent: false,
};

type RegistrationFormState = typeof initialFormData;

export default function RegisterPage() {
    const router = useRouter();
    const { isAuthenticated, error, clearError } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [hydrated, setHydrated] = useState(false);

    const [formData, setFormData] = useState<RegistrationFormState>(initialFormData);

    // Restore in-progress registration from localStorage on mount (BUG_001)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const raw = window.localStorage.getItem(REGISTRATION_STORAGE_KEY);
            if (raw) {
                const saved = JSON.parse(raw);
                if (saved && typeof saved === 'object') {
                    if (saved.formData) {
                        setFormData((prev) => ({ ...prev, ...saved.formData }));
                    }
                    if (typeof saved.currentStep === 'number' && saved.currentStep >= 1 && saved.currentStep <= 6) {
                        // Password is never persisted; if user was past step 1, send them
                        // back to step 1 so they can re-enter it.
                        const restoredStep = saved.currentStep > 1 ? 1 : saved.currentStep;
                        setCurrentStep(restoredStep);
                    }
                }
            }
        } catch {
            // corrupt storage — ignore
        }
        setHydrated(true);
    }, []);

    // Persist on every change (skip the first render to avoid clobbering with defaults)
    useEffect(() => {
        if (!hydrated || typeof window === 'undefined') return;
        try {
            window.localStorage.setItem(
                REGISTRATION_STORAGE_KEY,
                JSON.stringify({
                    formData: { ...formData, password: '', confirmPassword: '' }, // never persist passwords
                    currentStep,
                })
            );
        } catch {
            // storage full / disabled — ignore
        }
    }, [formData, currentStep, hydrated]);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            const dashboard = rbacManager.getDashboard();
            router.push(dashboard || '/parent/dashboard');
        }
    }, [isAuthenticated, router]);

    // Sync auth context errors
    useEffect(() => {
        if (error) {
            setFormErrors({ general: error });
        }
    }, [error]);

    const handleStep1Complete = (data: RegisterStep1Data) => {
        setFormData(prev => ({
            ...prev,
            email: data.email,
            password: data.password,
            confirmPassword: data.confirmPassword
        }));
        setFormErrors({});
        setCurrentStep(2);
    };

    const handleStep2Complete = (data: RegisterStep2Data) => {
        setFormData(prev => ({
            ...prev,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender || ''
        }));
        setFormErrors({});
        setCurrentStep(3);
    };

    const handleStep3Complete = (data: RegisterStep3Data) => {
        setFormData(prev => ({
            ...prev,
            address: data.address
        }));
        setFormErrors({});
        setCurrentStep(4);
    };

    const handleStep4Complete = (data: RegisterStep4Data) => {
        setFormData(prev => ({
            ...prev,
            students: data.students || []
        }));
        setFormErrors({});
        setCurrentStep(5);
    };

    const handleStep5Complete = (data: RegisterStep5Data) => {
        setFormData(prev => ({
            ...prev,
            guardians: data.guardians || []
        }));
        setFormErrors({});
        setCurrentStep(6);
    };

    const handleStep6Complete = (data: RegisterStep6Data) => {
        setFormData(prev => ({
            ...prev,
            acceptTerms: data.acceptTerms,
            acceptPrivacy: data.acceptPrivacy,
            marketingConsent: data.marketingConsent || false,
        }));
        handleSubmit(data);
    };

    const handleSubmit = async (step6Data?: RegisterStep6Data) => {
        setIsLoading(true);
        setFormErrors({});
        clearError();

        try {
            // Build emergency contact from first guardian marked as emergency contact
            const emergencyGuardian = formData.guardians.find(g => g.isEmergencyContact) || formData.guardians[0];
            const emergencyContact = emergencyGuardian ? {
                name: `${emergencyGuardian.firstName} ${emergencyGuardian.lastName}`,
                relationship: emergencyGuardian.relationship,
                phone: emergencyGuardian.phone,
            } : {
                name: '',
                relationship: '',
                phone: '',
            };

            // Build children array
            const children = formData.students.map(s => ({
                firstName: s.firstName,
                lastName: s.lastName,
                dateOfBirth: s.dateOfBirth,
                gender: s.gender,
            }));

            // Call the parent registration endpoint with all 6 steps data
            const response = await apiClient.post('/auth/register/parent', {
                // Step 1
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                // Step 2
                parentFirstName: formData.firstName,
                parentLastName: formData.lastName,
                phone: formData.phone,
                // Step 3
                address: formData.address,
                // Step 4
                children,
                // Step 5
                emergencyContact,
                // Step 6
                preferences: {
                    newsletter: step6Data?.marketingConsent || formData.marketingConsent || false,
                    smsNotifications: true,
                    emailNotifications: true,
                },
            });

            setRegistrationSuccess(true);

            // Clear persisted draft on successful submission
            if (typeof window !== 'undefined') {
                try { window.localStorage.removeItem(REGISTRATION_STORAGE_KEY); } catch { /* noop */ }
            }

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Registration failed';
            setFormErrors({ general: errorMsg });
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    if (registrationSuccess) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
                    <p className="text-gray-600 mb-4">Your account has been created. Redirecting to login...</p>
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 2 }}
                            className="h-full bg-green-500"
                        />
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-auto">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        rotate: [0, 360],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        rotate: [360, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"
                />
            </div>

            <div className="relative flex items-center justify-center min-h-screen p-3 py-4">
                <div className="w-full max-w-xl">
                    {/* Back to Login */}
                    <button
                        id="auth-register-btn-back-login"
                        type="button"
                        onClick={() => router.push('/login')}
                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900 mb-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </button>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-3"
                    >
                        <div className="inline-flex items-center justify-center w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-2 shadow-lg">
                            <UserPlus className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 mb-0.5">
                            Create Your Account
                        </h1>
                        <p className="text-gray-600 text-xs">
                            Join us and start your journey today
                        </p>
                    </motion.div>

                    {/* Registration Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-white/80 backdrop-blur-xl rounded-xl shadow-2xl p-5 border border-white/20 relative"
                    >
                        {/* Decorative top bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-t-2xl"></div>

                        {/* Progress Bar */}
                        <RegistrationProgress currentStep={currentStep} totalSteps={6} />

                        {/* Error Message */}
                        {formErrors.general && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2 mb-6"
                            >
                                <span>⚠️</span>
                                {formErrors.general}
                            </motion.div>
                        )}

                        {/* Step Content */}
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {currentStep === 1 && (
                                <RegisterStep1
                                    onComplete={handleStep1Complete}
                                    initialData={{
                                        email: formData.email,
                                        password: formData.password,
                                        confirmPassword: formData.confirmPassword
                                    }}
                                />
                            )}
                            {currentStep === 2 && (
                                <RegisterStep2
                                    onComplete={handleStep2Complete}
                                    onBack={handleBack}
                                    initialData={{
                                        firstName: formData.firstName,
                                        lastName: formData.lastName,
                                        phone: formData.phone,
                                        dateOfBirth: formData.dateOfBirth,
                                        gender: (formData.gender || undefined) as 'male' | 'female' | 'other' | undefined
                                    }}
                                />
                            )}
                            {currentStep === 3 && (
                                <RegisterStep3
                                    onComplete={handleStep3Complete}
                                    onBack={handleBack}
                                    initialData={{
                                        address: formData.address
                                    }}
                                />
                            )}
                            {currentStep === 4 && (
                                <RegisterStep4
                                    onComplete={handleStep4Complete}
                                    onBack={handleBack}
                                    parentDateOfBirth={formData.dateOfBirth}
                                    initialData={{
                                        students: formData.students.length > 0 ? formData.students : undefined
                                    }}
                                />
                            )}
                            {currentStep === 5 && (
                                <RegisterStep5
                                    onComplete={handleStep5Complete}
                                    onBack={handleBack}
                                    initialData={{
                                        guardians: formData.guardians.length > 0 ? formData.guardians : undefined
                                    }}
                                />
                            )}
                            {currentStep === 6 && (
                                <RegisterStep6
                                    onComplete={handleStep6Complete}
                                    onBack={handleBack}
                                    initialData={{
                                        acceptTerms: formData.acceptTerms,
                                        acceptPrivacy: formData.acceptPrivacy,
                                        marketingConsent: formData.marketingConsent,
                                    }}
                                    isLoading={isLoading}
                                />
                            )}
                        </motion.div>

                        {/* Login Link */}
                        <div className="text-center mt-6">
                            <p className="text-gray-600 text-sm">
                                Already have an account?{' '}
                                <button id="auth-register-btn"
                                    onClick={() => router.push('/login')}
                                    className="text-blue-600 font-semibold hover:underline"
                                >
                                    Sign in
                                </button>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
