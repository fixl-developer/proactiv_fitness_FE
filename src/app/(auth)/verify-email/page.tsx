'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';

import { authApi } from '@/lib/api/auth';

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token');

            if (!token) {
                setStatus('error');
                setMessage('Invalid or missing verification token');
                return;
            }

            try {
                const response = await authApi.verifyEmail(token);
                setStatus('success');
                setMessage(response.message || 'Email verified successfully!');
                toast.success('Email verified! You can now login.');

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } catch (error: any) {
                setStatus('error');
                setMessage(
                    error.message || 'Verification failed. The link may have expired.'
                );
                toast.error('Email verification failed');
            }
        };

        verifyEmail();
    }, [searchParams, router]);

    const handleResend = async () => {
        const email = prompt('Please enter your email address:');
        if (!email) return;

        try {
            await authApi.resendVerification(email);
            toast.success('Verification email sent! Please check your inbox.');
        } catch (error: any) {
            toast.error(error.message || 'Failed to resend verification email');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {/* Loading State */}
                    {status === 'loading' && (
                        <>
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Verifying Email
                            </h1>
                            <p className="text-gray-600">
                                Please wait while we verify your email address...
                            </p>
                        </>
                    )}

                    {/* Success State */}
                    {status === 'success' && (
                        <>
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Email Verified!
                            </h1>
                            <p className="text-gray-600 mb-6">{message}</p>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-green-900">
                                    Your account is now active. Redirecting to login...
                                </p>
                            </div>

                            <Link
                                href="/login"
                                className="inline-block w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                            >
                                Go to Login
                            </Link>
                        </>
                    )}

                    {/* Error State */}
                    {status === 'error' && (
                        <>
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                <XCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Verification Failed
                            </h1>
                            <p className="text-gray-600 mb-6">{message}</p>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-red-900">
                                    The verification link may have expired or is invalid. Please
                                    request a new verification email.
                                </p>
                            </div>

                            <button
                                onClick={handleResend}
                                className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors mb-4"
                            >
                                <Mail className="w-5 h-5 inline mr-2" />
                                Resend Verification Email
                            </button>

                            <Link
                                href="/login"
                                className="inline-block text-primary hover:underline"
                            >
                                Back to Login
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
