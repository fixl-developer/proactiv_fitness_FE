'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useState } from 'react';

import {
    registerStep1Schema,
    type RegisterStep1Data,
} from '@/lib/validations/auth';
import {
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    FORMAT_HINTS,
} from '@/utils/validation';
import { FormFieldHint } from '@/components/ui/FormFieldHint';

interface RegisterStep1Props {
    onComplete: (data: RegisterStep1Data) => void;
    initialData?: Partial<RegisterStep1Data>;
}

export function RegisterStep1({ onComplete, initialData }: RegisterStep1Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterStep1Data>({
        resolver: zodResolver(registerStep1Schema),
        defaultValues: initialData,
    });

    const passwordValue = watch('password');

    const validateField = (field: string, value: string) => {
        let error: string | null = null;
        switch (field) {
            case 'email':
                error = validateEmail(value);
                break;
            case 'password':
                error = validatePassword(value);
                break;
            case 'confirmPassword':
                error = validateConfirmPassword(passwordValue || '', value);
                break;
        }
        setFieldErrors((prev) => {
            const next = { ...prev };
            if (error) {
                next[field] = error;
            } else {
                delete next[field];
            }
            return next;
        });
    };

    const handleFormSubmit = (data: RegisterStep1Data) => {
        const errs: Record<string, string> = {};
        const emailErr = validateEmail(data.email);
        if (emailErr) errs.email = emailErr;
        const passErr = validatePassword(data.password);
        if (passErr) errs.password = passErr;
        const confirmErr = validateConfirmPassword(data.password, data.confirmPassword);
        if (confirmErr) errs.confirmPassword = confirmErr;

        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs);
            return;
        }
        onComplete(data);
    };

    return (
        <form id="form-components-auth-RegisterStep1" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
            <div className="text-center mb-3">
                <h2 className="text-lg font-bold text-gray-900">Account Details</h2>
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
                        {...register('email', {
                            onChange: (e) => validateField('email', e.target.value),
                        })}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                            errors.email || fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="your.email@example.com"
                    />
                </div>
                {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
                <FormFieldHint hint={FORMAT_HINTS.email} error={fieldErrors.email} />
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
                        {...register('password', {
                            onChange: (e) => validateField('password', e.target.value),
                        })}
                        className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                            errors.password || fieldErrors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
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
                <FormFieldHint hint={FORMAT_HINTS.password} error={fieldErrors.password} />
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
                        {...register('confirmPassword', {
                            onChange: (e) => validateField('confirmPassword', e.target.value),
                        })}
                        className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                            errors.confirmPassword || fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
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
                <FormFieldHint hint={FORMAT_HINTS.confirmPassword} error={fieldErrors.confirmPassword} />
            </div>

            {/* Submit Button */}
            <button id="auth-register-step1-btn-continue"
                type="submit"
                className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
                Continue
            </button>
        </form>
    );
}
