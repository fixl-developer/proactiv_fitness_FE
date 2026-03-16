'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { authService } from '@/services/modules/auth.service';

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setStatus('error');
                setMessage('No verification token provided');
                return;
            }

            try {
                const response = await authService.verifyEmail(token);

                if (response.success) {
                    setStatus('success');
                    setMessage('Your email has been verified successfully!');

                    // Redirect to login after 3 seconds
                    setTimeout(() => {
                        router.push('/login');
                    }, 3000);
                } else {
                    setStatus('error');
                    setMessage(response.message || 'Email verification failed');
                }
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.message || err.message || 'An error occurred during verification');
            }
        };

        verifyEmail();
    }, [token, router]);

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
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

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center"
            >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${status === 'loading' ? 'bg-blue-100' :
                    status === 'success' ? 'bg-green-100' :
                        'bg-red-100'
                    }`}>
                    {status === 'loading' && (
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    )}
                    {status === 'success' && (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    )}
                    {status === 'error' && (
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    )}
                </div>

                {/* Title */}
                <h2 className={`text-2xl font-bold mb-2 ${status === 'loading' ? 'text-gray-900' :
                    status === 'success' ? 'text-green-900' :
                        'text-red-900'
                    }`}>
                    {status === 'loading' && 'Verifying Email'}
                    {status === 'success' && 'Email Verified'}
                    {status === 'error' && 'Verification Failed'}
                </h2>

                {/* Message */}
                <p className="text-gray-600 mb-6">{message}</p>

                {/* Actions */}
                {status === 'success' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-3"
                    >
                        <p className="text-sm text-gray-500">Redirecting to login in 3 seconds...</p>
                        <Link
                            href="/login"
                            className="inline-block w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
                        >
                            Go to Login
                        </Link>
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-3"
                    >
                        <Link
                            href="/login"
                            className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                        >
                            Back to Login
                        </Link>
                        <Link
                            href="/register"
                            className="inline-block w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Create New Account
                        </Link>
                    </motion.div>
                )}

                {status === 'loading' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-gray-500"
                    >
                        Please wait while we verify your email address...
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
