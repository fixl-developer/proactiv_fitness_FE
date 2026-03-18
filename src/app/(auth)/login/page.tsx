'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, LogIn, Users, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { rbacManager } from '@/services/auth/rbac';

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, login, logout, error, clearError, role } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({ email: '', password: '' });
    const justLoggedIn = useRef(false);
    const [savedSession, setSavedSession] = useState<any>(null);

    // Check for saved session on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('savedSession');
            if (saved) {
                const parsed = JSON.parse(saved);
                const userData = JSON.parse(parsed.user);
                setSavedSession(userData);
            }
        } catch { setSavedSession(null); }
    }, []);

    // Show success message if redirected from registration
    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setSuccessMessage('Account created successfully! Please sign in.');
        }
    }, [searchParams]);

    // Post-login redirect based on role
    useEffect(() => {
        if (isAuthenticated && justLoggedIn.current) {
            justLoggedIn.current = false;
            const userRole = role?.toUpperCase();
            console.log('[LOGIN] Role from auth:', role, '| Uppercase:', userRole);

            if (userRole === 'PARENT') {
                router.push('/parent/dashboard');
                return;
            }
            if (userRole === 'USER') {
                router.push('/user/dashboard');
                return;
            }
            if (!userRole) {
                router.push('/');
                return;
            }
            const dashboard = rbacManager.getDashboard();
            if (dashboard && dashboard !== '/login') {
                router.push(dashboard);
            } else {
                router.push('/');
            }
        }
    }, [isAuthenticated, router, role]);

    useEffect(() => {
        if (error) setFormErrors({ general: error });
    }, [error]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFormErrors({});
        setSuccessMessage('');
        clearError();
        try {
            if (!formData.email || !formData.password) {
                setFormErrors({ general: 'Please enter email and password' });
                setIsLoading(false);
                return;
            }
            justLoggedIn.current = true;
            await login(formData.email, formData.password);
        } catch (err: any) {
            setFormErrors({ general: err.response?.data?.message || err.message || 'Login failed. Please check your credentials.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-auto">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ rotate: [360, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"
                />
            </div>

            <div className="relative flex items-center justify-center min-h-screen p-6">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-8"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                        <p className="text-gray-600 text-lg">Sign in to your account</p>
                    </motion.div>

                    {/* Login Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 relative"
                    >
                        {/* Decorative top bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-2xl"></div>

                        {/* Already logged in */}
                        {isAuthenticated && !justLoggedIn.current && (
                            <div className="mb-5 p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-sm">
                                <p className="text-blue-800 font-medium mb-2.5">You&apos;re already signed in.</p>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => {
                                        const userRole = role?.toUpperCase();
                                        if (userRole === 'PARENT') router.push('/parent/dashboard');
                                        else if (userRole === 'USER') router.push('/user/dashboard');
                                        else if (!userRole) router.push('/');
                                        else router.push(rbacManager.getDashboard() || '/');
                                    }}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">
                                        Continue
                                    </button>
                                    <button type="button" onClick={() => logout()}
                                        className="flex-1 bg-white text-gray-700 py-2 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors border border-gray-200">
                                        Switch Account
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Saved Session - Continue to Dashboard */}
                        {!isAuthenticated && savedSession && (
                            <div className="mb-5 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {(() => {
                                            const fn = savedSession.firstName || '';
                                            const ln = savedSession.lastName || '';
                                            if (fn && ln) return (fn[0] + ln[0]).toUpperCase();
                                            const name = savedSession.name || savedSession.email || 'U';
                                            const parts = name.trim().split(' ');
                                            return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name[0].toUpperCase();
                                        })()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{savedSession.name || `${savedSession.firstName || ''} ${savedSession.lastName || ''}`.trim() || 'User'}</p>
                                        <p className="text-xs text-gray-500">{savedSession.email}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => {
                                        // Restore session and do full page navigation so AuthContext reinitializes
                                        try {
                                            const saved = JSON.parse(localStorage.getItem('savedSession') || '{}');
                                            localStorage.setItem('token', saved.token);
                                            if (saved.refreshToken) localStorage.setItem('refreshToken', saved.refreshToken);
                                            localStorage.setItem('user', saved.user);
                                            localStorage.removeItem('savedSession');
                                            // Full page redirect - AuthContext will pick up token from localStorage on mount
                                            const userRole = savedSession.role?.toUpperCase?.() || (typeof savedSession.role === 'object' ? savedSession.role?.name?.toUpperCase() : '');
                                            if (userRole === 'USER') window.location.href = '/user/dashboard';
                                            else if (userRole === 'PARENT') window.location.href = '/parent/dashboard';
                                            else window.location.href = '/';
                                        } catch { window.location.href = '/'; }
                                    }}
                                        className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors">
                                        Continue to Dashboard
                                    </button>
                                    <button type="button" onClick={() => {
                                        localStorage.removeItem('savedSession');
                                        setSavedSession(null);
                                    }}
                                        className="flex-1 bg-white text-gray-700 py-2.5 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors border border-gray-200">
                                        Switch Account
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Success Message */}
                        <AnimatePresence>
                            {successMessage && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    {successMessage}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Error Message */}
                            {formErrors.general && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2"
                                >
                                    {formErrors.general}
                                </motion.div>
                            )}

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 placeholder-gray-400"
                                        placeholder="your.email@example.com"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 placeholder-gray-400"
                                        placeholder="Enter your password"
                                        disabled={isLoading}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        disabled={isLoading}>
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Forgot Password */}
                            <div className="flex justify-end pt-2">
                                <button type="button" onClick={() => router.push('/forgot-password')}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                    Forgot password?
                                </button>
                            </div>

                            {/* Submit Button */}
                            <button type="submit" disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3.5 rounded-lg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6 hover:scale-105 active:scale-95">
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

                        {/* Create Account Section */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Don&apos;t have an account?</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Link
                                href="/register"
                                className="flex items-center justify-center gap-2 py-3 border-2 border-blue-500 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm"
                            >
                                <Users className="w-4 h-4" />
                                Parent Account
                            </Link>
                            <Link
                                href="/account/register"
                                className="flex items-center justify-center gap-2 py-3 border-2 border-emerald-500 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors text-sm"
                            >
                                <UserPlus className="w-4 h-4" />
                                User Account
                            </Link>
                        </div>
                    </motion.div>

                    {/* Staff Login Footer */}
                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                            Staff member?{' '}
                            <Link href="/login/staff" className="text-blue-600 font-medium hover:underline">
                                Staff Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
