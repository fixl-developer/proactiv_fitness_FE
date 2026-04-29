'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Calendar, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { authService } from '@/services/modules/auth.service';
import {
    validateFirstName,
    validateLastName,
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    validateDateOfBirth,
    filterFirstNameInput,
    filterLastNameInput,
    FORMAT_HINTS,
} from '@/utils/validation';
import { FormFieldHint } from '@/components/ui/FormFieldHint';
import { PhoneInput } from '@/components/ui/PhoneInput';

export default function UserRegisterPage() {
    return (
        <Suspense fallback={<div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>}>
            <UserRegisterContent />
        </Suspense>
    );
}

function UserRegisterContent() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [phoneValid, setPhoneValid] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        password: '',
        confirmPassword: ''
    });

    // Real-time field validation helper
    const handleFieldChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        const newErrors = { ...errors };
        let error: string | null = null;

        switch (field) {
            case 'firstName':
                error = validateFirstName(value, 'First name');
                break;
            case 'lastName':
                error = validateLastName(value, 'Last name');
                break;
            case 'email':
                error = validateEmail(value);
                break;
            case 'dateOfBirth':
                error = validateDateOfBirth(value, false);
                break;
            case 'password':
                error = validatePassword(value);
                // Also revalidate confirmPassword if it has a value
                if (formData.confirmPassword) {
                    const confirmErr = validateConfirmPassword(value, formData.confirmPassword);
                    if (confirmErr) {
                        newErrors.confirmPassword = confirmErr;
                    } else {
                        delete newErrors.confirmPassword;
                    }
                }
                break;
            case 'confirmPassword':
                error = validateConfirmPassword(formData.password, value);
                break;
        }

        if (error) {
            newErrors[field] = error;
        } else {
            delete newErrors[field];
        }

        setErrors(newErrors);
        setFormErrors(newErrors);
    };

    const handlePhoneChange = (value: string) => {
        setFormData((prev) => ({ ...prev, phone: value }));
        // Clear stale phone error — PhoneInput handles its own visual state via onValidityChange
        setErrors((prev) => {
            const next = { ...prev };
            delete next.phone;
            return next;
        });
        setFormErrors((prev) => {
            const next = { ...prev };
            delete next.phone;
            return next;
        });
    };

    const handlePhoneValidity = (isValid: boolean, error: string | null) => {
        setPhoneValid(isValid);
        // Surface phone error in formErrors only at submit time, not on every keystroke
        if (!isValid && error && formData.phone) {
            // keep silent until submit
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFormErrors({});
        setErrors({});

        // Validate ALL fields using shared validators
        const submitErrors: Record<string, string> = {};
        const firstNameErr = validateFirstName(formData.firstName, 'First name');
        if (firstNameErr) submitErrors.firstName = firstNameErr;
        const lastNameErr = validateLastName(formData.lastName, 'Last name');
        if (lastNameErr) submitErrors.lastName = lastNameErr;
        const emailErr = validateEmail(formData.email);
        if (emailErr) submitErrors.email = emailErr;
        if (formData.phone && !phoneValid) {
            submitErrors.phone = 'Please enter a valid phone number for the selected country';
        }
        const dobErr = validateDateOfBirth(formData.dateOfBirth, false);
        if (dobErr) submitErrors.dateOfBirth = dobErr;
        const passwordErr = validatePassword(formData.password);
        if (passwordErr) submitErrors.password = passwordErr;
        const confirmErr = validateConfirmPassword(formData.password, formData.confirmPassword);
        if (confirmErr) submitErrors.confirmPassword = confirmErr;

        if (Object.keys(submitErrors).length > 0) {
            setErrors(submitErrors);
            setFormErrors(submitErrors);
            setIsLoading(false);
            return;
        }

        try {
            const response = await authService.register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                phone: formData.phone ? formData.phone.replace(/\s/g, '') : undefined,
                role: 'USER'
            });

            if (response.success) {
                router.push('/login?registered=true');
            }
        } catch (err: any) {
            const backendErrors = err.response?.data?.errors;
            const backendMessage = err.response?.data?.message;
            if (backendErrors && Array.isArray(backendErrors)) {
                const fieldErrors: Record<string, string> = {};
                backendErrors.forEach((e: any) => {
                    const field = e.path || e.param || 'general';
                    fieldErrors[field] = e.msg || e.message;
                });
                setFormErrors(fieldErrors);
                setErrors(fieldErrors);
            } else {
                setFormErrors({ general: backendMessage || err.message || 'Registration failed. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 overflow-auto">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ rotate: [360, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-teal-200/20 to-cyan-200/20 rounded-full blur-3xl"
                />
            </div>

            <div className="relative flex items-center justify-center min-h-screen p-4 py-5">
                <div className="w-full max-w-2xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-4"
                    >
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl mb-2 shadow-lg">
                            <UserPlus className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create User Account</h1>
                        <p className="text-gray-600 text-sm">Join us and start your gymnastics journey</p>
                    </motion.div>

                    {/* Registration Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20 relative"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-t-2xl"></div>

                        <form id="form-account-register" onSubmit={handleSubmit} className="space-y-3">
                            {formErrors.general && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    {formErrors.general}
                                </div>
                            )}

                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-gray-700">First Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                                        <input id="input-text-account-register"
                                            type="text"
                                            value={formData.firstName}
                                            onKeyDown={filterFirstNameInput}
                                            onChange={(e) => handleFieldChange('firstName', e.target.value)}
                                            maxLength={50}
                                            className={`w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:ring-2 transition-all ${errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-200'}`}
                                            placeholder="John"
                                        />
                                    </div>
                                    <FormFieldHint hint={FORMAT_HINTS.firstName} error={errors.firstName} />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-gray-700">Last Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                                        <input id="input-text-account-register"
                                            type="text"
                                            value={formData.lastName}
                                            onKeyDown={filterLastNameInput}
                                            onChange={(e) => handleFieldChange('lastName', e.target.value)}
                                            maxLength={50}
                                            className={`w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:ring-2 transition-all ${errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-200'}`}
                                            placeholder="Doe"
                                        />
                                    </div>
                                    <FormFieldHint hint={FORMAT_HINTS.lastName} error={errors.lastName} />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-gray-700">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                                    <input id="input-email-account-register"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleFieldChange('email', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:ring-2 transition-all ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-200'}`}
                                        placeholder="john.doe@example.com"
                                    />
                                </div>
                                <FormFieldHint hint={FORMAT_HINTS.email} error={errors.email} />
                            </div>

                            {/* Phone & DOB */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-gray-700">Phone Number</label>
                                    <PhoneInput
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
                                        onValidityChange={handlePhoneValidity}
                                        error={errors.phone}
                                        placeholder="9876543210"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-gray-700">Date of Birth</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                                        <input id="input-date-account-register"
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                                            className={`w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:ring-2 transition-all ${errors.dateOfBirth ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-200'}`}
                                        />
                                    </div>
                                    <FormFieldHint hint={FORMAT_HINTS.dateOfBirth} error={errors.dateOfBirth} />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-gray-700">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => handleFieldChange('password', e.target.value)}
                                        className={`w-full pl-10 pr-12 py-2 border-2 rounded-lg focus:ring-2 transition-all ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-200'}`}
                                        placeholder="e.g. Test@1234"
                                    />
                                    <button id="btn-account-register-1" type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <FormFieldHint hint={FORMAT_HINTS.password} error={errors.password} />
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-gray-700">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                                        className={`w-full pl-10 pr-12 py-2 border-2 rounded-lg focus:ring-2 transition-all ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-200'}`}
                                        placeholder="Re-enter password"
                                    />
                                    <button id="btn-account-register-2" type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <FormFieldHint hint={FORMAT_HINTS.confirmPassword} error={errors.confirmPassword} />
                            </div>

                            {/* Submit */}
                            <button id="account-register-btn" type="submit" disabled={isLoading}
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 py-2.5 rounded-lg shadow-lg text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 mt-3 hover:scale-105 active:scale-95 transition-all text-sm">
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-5 h-5" />
                                        <span>Create Account</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Login Link */}
                        <div className="text-center mt-3">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link id="login" href="/login" className="text-emerald-600 font-medium hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
