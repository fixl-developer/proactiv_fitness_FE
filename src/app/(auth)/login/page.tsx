'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, LogIn, Briefcase, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { rbacManager } from '@/services/auth/rbac';
import { DEMO_ACCOUNTS } from '@/data/demoAccounts';

export default function LoginPage() {
    const router = useRouter();
    const { isAuthenticated, login, logout, error, clearError } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const justLoggedIn = useRef(false);

    // Only redirect AFTER a fresh login, not on page load with existing session
    useEffect(() => {
        if (isAuthenticated && justLoggedIn.current) {
            justLoggedIn.current = false;
            const dashboard = rbacManager.getDashboard();
            router.push(dashboard || '/staff/dashboard');
        }
    }, [isAuthenticated, router]);

    // Sync auth context errors
    useEffect(() => {
        if (error) {
            setFormErrors({ general: error });
        }
    }, [error]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFormErrors({});
        clearError();

        try {
            // Validate inputs
            if (!formData.email || !formData.password) {
                setFormErrors({ general: 'Please enter email and password' });
                setIsLoading(false);
                return
            }

            // Login staff member
            justLoggedIn.current = true;
            await login(formData.email, formData.password);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Login failed';
            setFormErrors({ general: errorMsg });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoAccountClick = (email: string, password: string) => {
        setFormData({ email, password });
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 overflow-auto" style={{ zoom: '0.75' }}>
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
                    className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full blur-3xl"
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
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-orange-200/20 to-red-200/20 rounded-full blur-3xl"
                />
            </div>

            <div className="relative flex items-center justify-center min-h-screen p-4 py-8">
                <div className="w-full max-w-4xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-8"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
                            <Briefcase className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Staff Portal
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Sign in to your staff account
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Demo Accounts - Left Side */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="lg:col-span-2"
                        >
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Demo Accounts</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {DEMO_ACCOUNTS.map((account) => {
                                        const Icon = account.icon;
                                        return (
                                            <motion.button
                                                key={account.email}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleDemoAccountClick(account.email, account.password)}
                                                className={`p-4 rounded-xl bg-gradient-to-br ${account.color} text-white shadow-lg hover:shadow-xl transition-all duration-300 text-left group`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <Icon className="w-6 h-6" />
                                                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <h3 className="font-semibold text-sm mb-1">{account.label}</h3>
                                                <p className="text-xs opacity-90 mb-2">{account.description}</p>
                                                <p className="text-xs opacity-75 truncate">{account.email}</p>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-gray-500 mt-6 text-center">
                                    Click any demo account to auto-fill credentials
                                </p>
                            </div>
                        </motion.div>

                        {/* Login Form - Right Side */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="lg:col-span-1 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 relative"
                        >
                            {/* Decorative top bar */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-t-2xl"></div>

                            {/* Already logged in banner */}
                            {isAuthenticated && (
                                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                                    <p className="text-amber-800 font-medium mb-2">You are already logged in.</p>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => { const d = rbacManager.getDashboard(); router.push(d || '/staff/dashboard'); }}
                                            className="flex-1 bg-amber-600 text-white py-1.5 rounded text-xs font-semibold"
                                        >
                                            Go to Dashboard
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => logout()}
                                            className="flex-1 bg-gray-200 text-gray-700 py-1.5 rounded text-xs font-semibold"
                                        >
                                            Switch Account
                                        </button>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Error Message */}
                                {formErrors.general && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2"
                                    >
                                        <span>⚠️</span>
                                        {formErrors.general}
                                    </motion.div>
                                )}

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300 placeholder-gray-400"
                                            placeholder="your.email@example.com"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300 placeholder-gray-400"
                                            placeholder="••••••••"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            disabled={isLoading}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Forgot Password */}
                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={() => router.push('/forgot-password')}
                                        className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white py-3.5 rounded-lg shadow-lg shadow-blue-400/25 hover:shadow-xl hover:shadow-blue-400/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6 hover:scale-105 active:scale-95"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span className="text-white font-bold text-base">Signing in...</span>
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="w-5 h-5 text-white" />
                                            <span className="text-white font-bold text-base">Sign In</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">
                                        Parent?
                                    </span>
                                </div>
                            </div>

                            {/* Parent Login Link */}
                            <button
                                type="button"
                                onClick={() => router.push('/login/parent')}
                                disabled={false}
                                className="block w-full text-center py-3 border-2 border-amber-600 rounded-lg hover:bg-amber-50 transition-colors pointer-events-auto cursor-pointer"
                            >
                                <span className="text-amber-600 font-bold text-base block">Parent Portal</span>
                            </button>

                            {/* Create Account Link */}
                            <div className="text-center mt-4">
                                <p className="text-gray-600 text-sm">
                                    Don't have an account?{' '}
                                    <button
                                        onClick={() => router.push('/register')}
                                        className="text-amber-600 font-semibold hover:underline"
                                    >
                                        Create Account
                                    </button>
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
