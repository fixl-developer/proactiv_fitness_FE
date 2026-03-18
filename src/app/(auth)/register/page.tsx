'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { rbacManager } from '@/services/auth/rbac';
import { RegisterStep1 } from '@/components/auth/RegisterStep1';
import { RegisterStep2 } from '@/components/auth/RegisterStep2';
import { RegisterStep3 } from '@/components/auth/RegisterStep3';
import { RegistrationProgress } from '@/components/auth/RegistrationProgress';
import type { RegisterStep1Data } from '@/lib/validations/auth';
import type { RegisterStep2Data } from '@/lib/validations/auth';
import type { RegisterStep3Data } from '@/lib/validations/auth';

export default function RegisterPage() {
    const router = useRouter();
    const { isAuthenticated, register, error, clearError } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        dateOfBirth: '',
        gender: '' as 'male' | 'female' | 'other' | '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        }
    });

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
        setCurrentStep(2);
    };

    const handleStep2Complete = (data: RegisterStep2Data) => {
        setFormData(prev => ({
            ...prev,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender
        }));
        setCurrentStep(3);
    };

    const handleStep3Complete = (data: RegisterStep3Data) => {
        setFormData(prev => ({
            ...prev,
            address: data.address
        }));
        handleSubmit();
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setFormErrors({});
        clearError();

        try {
            const fullName = `${formData.firstName} ${formData.lastName}`;
            await register(formData.email, formData.password, fullName);
            setRegistrationSuccess(true);

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Registration failed';
            setFormErrors({ general: errorMsg });
            setCurrentStep(1);
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

            <div className="relative flex items-center justify-center min-h-screen p-4 py-8">
                <div className="w-full max-w-2xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-8"
                    >
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-3 shadow-lg">
                            <UserPlus className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">
                            Create Your Account
                        </h1>
                        <p className="text-gray-600 text-base">
                            Join us and start your journey today
                        </p>
                    </motion.div>

                    {/* Registration Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 relative"
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
                        </motion.div>

                        {/* Login Link */}
                        <div className="text-center mt-6">
                            <p className="text-gray-600 text-sm">
                                Already have an account?{' '}
                                <button
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
