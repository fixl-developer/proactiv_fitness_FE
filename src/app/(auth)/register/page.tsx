'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { RegistrationProgress } from '@/components/auth/RegistrationProgress';
import { RegisterStep1 } from '@/components/auth/RegisterStep1';
import { RegisterStep2 } from '@/components/auth/RegisterStep2';
import { RegisterStep3 } from '@/components/auth/RegisterStep3';
import { RegisterStep4 } from '@/components/auth/RegisterStep4';
import { RegisterStep5 } from '@/components/auth/RegisterStep5';
import { RegisterStep6 } from '@/components/auth/RegisterStep6';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import type { RegisterRequest } from '@/types/auth';

const TOTAL_STEPS = 6;

export default function RegisterPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<RegisterRequest>>({});

    const handleStepComplete = (stepData: any) => {
        setFormData((prev) => ({ ...prev, ...stepData }));

        if (currentStep < TOTAL_STEPS) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleSubmit = async (finalStepData: any) => {
        setIsLoading(true);

        try {
            const completeData: RegisterRequest = {
                ...formData,
                ...finalStepData,
            } as RegisterRequest;

            const response = await authApi.register(completeData);

            // Save auth data
            setAuth(response.user, response.accessToken, response.refreshToken);

            toast.success('Registration successful! Welcome to ProActiv Fitness.');

            // Redirect based on role
            if (response.user.role === 'parent') {
                router.push('/dashboard/parent');
            } else {
                router.push('/dashboard');
            }
        } catch (error: any) {
            toast.error(error.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <RegisterStep1
                        onComplete={handleStepComplete}
                        initialData={formData}
                    />
                );
            case 2:
                return (
                    <RegisterStep2
                        onComplete={handleStepComplete}
                        onBack={handleBack}
                        initialData={formData}
                    />
                );
            case 3:
                return (
                    <RegisterStep3
                        onComplete={handleStepComplete}
                        onBack={handleBack}
                        initialData={formData}
                    />
                );
            case 4:
                return (
                    <RegisterStep4
                        onComplete={handleStepComplete}
                        onBack={handleBack}
                        initialData={formData}
                    />
                );
            case 5:
                return (
                    <RegisterStep5
                        onComplete={handleStepComplete}
                        onBack={handleBack}
                        initialData={formData}
                    />
                );
            case 6:
                return (
                    <RegisterStep6
                        onComplete={handleSubmit}
                        onBack={handleBack}
                        initialData={formData}
                        isLoading={isLoading}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Create Your Account
                    </h1>
                    <p className="text-gray-600">
                        Join ProActiv Fitness and start your journey today
                    </p>
                </div>

                {/* Registration Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Progress */}
                    <RegistrationProgress
                        currentStep={currentStep}
                        totalSteps={TOTAL_STEPS}
                    />

                    {/* Step Content */}
                    <div className="mt-8">{renderStep()}</div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="text-primary font-medium hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
