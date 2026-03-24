'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, FileText, Shield, Mail } from 'lucide-react';
import Link from 'next/link';

import {
    registerStep6Schema,
    type RegisterStep6Data,
} from '@/lib/validations/auth';

interface RegisterStep6Props {
    onComplete: (data: RegisterStep6Data) => void;
    onBack: () => void;
    initialData?: Partial<RegisterStep6Data>;
    isLoading?: boolean;
}

export function RegisterStep6({
    onComplete,
    onBack,
    initialData,
    isLoading,
}: RegisterStep6Props) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterStep6Data>({
        resolver: zodResolver(registerStep6Schema),
        defaultValues: initialData,
    });

    return (
        <form id="form-components-auth-RegisterStep6" onSubmit={handleSubmit(onComplete)} className="space-y-6">
            <div className="text-center mb-6">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Almost Done!</h2>
                <p className="text-gray-600 mt-2">
                    Review and accept our terms to complete registration
                </p>
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start">
                        <input
                            type="checkbox"
                            {...register('acceptTerms')}
                            className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary mt-1"
                        />
                        <div className="ml-3">
                            <label className="text-sm font-medium text-gray-900">
                                I accept the Terms and Conditions
                            </label>
                            <p className="text-xs text-gray-600 mt-1">
                                By checking this box, you agree to our{' '}
                                <Link id="auth-register-step6-nav-terms"
                                    href="/terms"
                                    target="_blank"
                                    className="text-primary hover:underline"
                                >
                                    Terms of Service
                                </Link>
                                . Please read them carefully.
                            </p>
                        </div>
                    </div>
                    {errors.acceptTerms && (
                        <p className="mt-2 text-sm text-red-600 ml-8">
                            {errors.acceptTerms.message}
                        </p>
                    )}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start">
                        <input
                            type="checkbox"
                            {...register('acceptPrivacy')}
                            className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary mt-1"
                        />
                        <div className="ml-3">
                            <label className="text-sm font-medium text-gray-900">
                                I accept the Privacy Policy
                            </label>
                            <p className="text-xs text-gray-600 mt-1">
                                By checking this box, you agree to our{' '}
                                <Link id="auth-register-step6-nav-privacy"
                                    href="/privacy"
                                    target="_blank"
                                    className="text-primary hover:underline"
                                >
                                    Privacy Policy
                                </Link>
                                . We respect your privacy and protect your data.
                            </p>
                        </div>
                    </div>
                    {errors.acceptPrivacy && (
                        <p className="mt-2 text-sm text-red-600 ml-8">
                            {errors.acceptPrivacy.message}
                        </p>
                    )}
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start">
                        <input
                            type="checkbox"
                            {...register('marketingConsent')}
                            className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary mt-1"
                        />
                        <div className="ml-3">
                            <label className="text-sm font-medium text-gray-900">
                                Send me promotional emails (Optional)
                            </label>
                            <p className="text-xs text-gray-600 mt-1">
                                Receive updates about new programs, special offers, and fitness
                                tips. You can unsubscribe anytime.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Important Information */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-semibold text-yellow-900">
                            Email Verification Required
                        </h4>
                        <p className="text-xs text-yellow-800 mt-1">
                            After registration, we'll send a verification email. Please check
                            your inbox and verify your email to access all features.
                        </p>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                    What happens next?
                </h3>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                        <span className="text-sm text-gray-700">
                            Your account will be created instantly
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                        <span className="text-sm text-gray-700">
                            You'll receive a verification email
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                        <span className="text-sm text-gray-700">
                            You can start booking classes immediately
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                        <span className="text-sm text-gray-700">
                            Access your personalized dashboard
                        </span>
                    </li>
                </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
                <button id="auth-register-step6-btn-back"
                    type="button"
                    onClick={onBack}
                    disabled={isLoading}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Back
                </button>
                <button id="auth-register-step6-btn"
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Creating Account...
                        </>
                    ) : (
                        'Complete Registration'
                    )}
                </button>
            </div>
        </form>
    );
}
