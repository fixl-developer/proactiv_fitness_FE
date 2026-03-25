'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useState } from 'react';

import {
    registerStep1Schema,
    type RegisterStep1Data,
} from '@/lib/validations/auth';

interface RegisterStep1Props {
    onComplete: (data: RegisterStep1Data) => void;
    initialData?: Partial<RegisterStep1Data>;
}

export function RegisterStep1({ onComplete, initialData }: RegisterStep1Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterStep1Data>({
        resolver: zodResolver(registerStep1Schema),
        defaultValues: initialData,
    });

    return (
        <form id="form-components-auth-RegisterStep1" onSubmit={handleSubmit(onComplete)} className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Account Details</h2>
                <p className="text-gray-600 mt-2">
                    Create your login credentials
                </p>
            </div>

            {/* Email */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="email"
                        {...register('email')}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="your.email@example.com"
                    />
                </div>
                {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
            </div>

            {/* Password */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="••••••••"
                    />
                    <button id="auth-register-step1-btn"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                </div>
                {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                    Must contain uppercase, lowercase, number and special character
                </p>
            </div>

            {/* Confirm Password */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...register('confirmPassword')}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="••••••••"
                    />
                    <button id="auth-register-step1-btn-2"
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
            <button id="auth-register-step1-btn-continue"
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
                Continue
            </button>
        </form>
    );
}
