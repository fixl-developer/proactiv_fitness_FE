'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

import {
    resetPasswordSchema,
    type ResetPasswordData,
} from '@/lib/validations/auth';
import { authApi } from '@/lib/api/auth';

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (!tokenParam) {
            toast.error('Invalid or missing reset token');
            router.push('/forgot-password');
        } else {
            setToken(tokenParam);
        }
    }, [searchParams, router]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordData) => {
        if (!token) return;

        setIsLoading(true);

        try {
            await authApi.resetPassword(token, data.password);
            toast.success('Password reset successful! You can now login.');
            router.push('/login');
        } catch (error: any) {
            toast.error(
                error.message || 'Failed to reset password. The link may have expired.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Reset Password
                    </h1>
                    <p className="text-gray-600">Enter your new password below</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password')}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    disabled={isLoading}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.password.message}
                                </p>
                            )}
                            <p className="mt-2 text-xs text-gray-500">
                                Must contain uppercase, lowercase, number and special character
                            </p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    {...register('confirmPassword')}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    disabled={isLoading}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Resetting...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    Reset Password
                                </>
                            )}
                        </button>
                    </form>

                    {/* Back to Login */}
                    <div className="mt-6 text-center">
                        <Link href="/login" className="text-primary hover:underline">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
