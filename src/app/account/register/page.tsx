'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { authService } from '@/services/modules/auth.service';

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
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        password: '',
        confirmPassword: ''
    });

    // Real-time field validation on blur
    const validateField = (field: string, value: string) => {
        const newErrors = { ...formErrors };
        delete newErrors[field]; // clear previous error

        switch (field) {
            case 'firstName':
                if (!value.trim()) newErrors.firstName = 'First name is required';
                break;
            case 'lastName':
                if (!value.trim()) newErrors.lastName = 'Last name is required';
                break;
            case 'email':
                if (!value.trim()) {
                    newErrors.email = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    newErrors.email = 'Format: john.doe@example.com';
                }
                break;
            case 'phone':
                if (value && !/^\+?[1-9]\d{1,14}$/.test(value.replace(/\s/g, ''))) {
                    newErrors.phone = 'Format: +919876543210 (country code + number, no spaces)';
                }
                break;
            case 'password':
                if (!value) {
                    newErrors.password = 'Password is required';
                } else if (value.length < 8) {
                    newErrors.password = 'Minimum 8 characters required';
                } else if (!/(?=.*[a-z])/.test(value)) {
                    newErrors.password = 'Must include a lowercase letter (a-z)';
                } else if (!/(?=.*[A-Z])/.test(value)) {
                    newErrors.password = 'Must include an uppercase letter (A-Z)';
                } else if (!/(?=.*\d)/.test(value)) {
                    newErrors.password = 'Must include a number (0-9)';
                } else if (!/(?=.*[@$!%*?&])/.test(value)) {
                    newErrors.password = 'Must include a special character (@$!%*?&)';
                }
                // Also revalidate confirmPassword if it has value
                if (formData.confirmPassword && value !== formData.confirmPassword) {
                    newErrors.confirmPassword = 'Passwords do not match';
                } else {
                    delete newErrors.confirmPassword;
                }
                break;
            case 'confirmPassword':
                if (!value) {
                    newErrors.confirmPassword = 'Please confirm your password';
                } else if (value !== formData.password) {
                    newErrors.confirmPassword = 'Passwords do not match';
                }
                break;
        }
        setFormErrors(newErrors);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFormErrors({});

        // Validation
        const errors: Record<string, string> = {};
        if (!formData.firstName) errors.firstName = 'First name is required';
        if (!formData.lastName) errors.lastName = 'Last name is required';
        if (!formData.email) errors.email = 'Email is required';
        if (formData.phone && !/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/\s/g, ''))) {
            errors.phone = 'Phone must be in format: +852XXXXXXXX (no spaces)';
        }
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
            errors.password = 'Password needs uppercase, lowercase, number & special char (@$!%*?&)';
        }
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
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

                        <form onSubmit={handleSubmit} className="space-y-3">
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
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            onBlur={(e) => validateField('firstName', e.target.value)}
                                            className={`w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:ring-2 transition-all ${formErrors.firstName ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-200'}`}
                                            placeholder="John"
                                        />
                                    </div>
                                    {formErrors.firstName && <p className="text-xs text-red-600 mt-1">{formErrors.firstName}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-gray-700">Last Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            onBlur={(e) => validateField('lastName', e.target.value)}
                                            className={`w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:ring-2 transition-all ${formErrors.lastName ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-200'}`}
                                            placeholder="Doe"
                                        />
                                    </div>
                                    {formErrors.lastName && <p className="text-xs text-red-600 mt-1">{formErrors.lastName}</p>}
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-gray-700">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        onBlur={(e) => validateField('email', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:ring-2 transition-all ${formErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-200'}`}
                                        placeholder="john.doe@example.com"
                                    />
                                </div>
                                {formErrors.email ? <p className="text-xs text-red-600 mt-1">{formErrors.email}</p> : <p className="text-xs text-gray-400 mt-1">e.g. john.doe@example.com</p>}
                            </div>

                            {/* Phone & DOB */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-gray-700">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            onBlur={(e) => validateField('phone', e.target.value)}
                                            className={`w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:ring-2 transition-all ${formErrors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-200'}`}
                                            placeholder="+919876543210"
                                        />
                                    </div>
                                    {formErrors.phone ? <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p> : <p className="text-xs text-gray-400 mt-1">Format: +919876543210 (no spaces)</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-gray-700">Date of Birth</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                                        <input
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                                        />
                                    </div>
                                    {formErrors.dateOfBirth && <p className="text-xs text-red-600">{formErrors.dateOfBirth}</p>}
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
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        onBlur={(e) => validateField('password', e.target.value)}
                                        className={`w-full pl-10 pr-12 py-2 border-2 rounded-lg focus:ring-2 transition-all ${formErrors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-200'}`}
                                        placeholder="e.g. Test@1234"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {formErrors.password ? (
                                    <p className="text-xs text-red-600 mt-1">{formErrors.password}</p>
                                ) : (
                                    <p className="text-xs text-gray-400 mt-1">Min 8 chars: uppercase (A-Z) + lowercase (a-z) + number (0-9) + special (@$!%*?&)</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-gray-700">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        onBlur={(e) => validateField('confirmPassword', e.target.value)}
                                        className={`w-full pl-10 pr-12 py-2 border-2 rounded-lg focus:ring-2 transition-all ${formErrors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-200'}`}
                                        placeholder="Re-enter password"
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {formErrors.confirmPassword ? (
                                    <p className="text-xs text-red-600 mt-1">{formErrors.confirmPassword}</p>
                                ) : (
                                    <p className="text-xs text-gray-400 mt-1">Must match the password above</p>
                                )}
                            </div>

                            {/* Submit */}
                            <button type="submit" disabled={isLoading}
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
                                <Link href="/login" className="text-emerald-600 font-medium hover:underline">
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
