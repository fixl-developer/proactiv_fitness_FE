'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, LogIn, ChevronRight, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { rbacManager } from '@/services/auth/rbac';
import { DEMO_ACCOUNTS } from '@/data/demoAccounts';

export default function LoginPage() {
    const router = useRouter();
    const { isAuthenticated, login, logout, error, clearError } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const justLoggedIn = useRef(false);

    useEffect(() => {
        if (isAuthenticated && justLoggedIn.current) {
            justLoggedIn.current = false;
            const dashboard = rbacManager.getDashboard();
            // Use demo account dashboard as fallback if rbac dashboard is /login
            let targetDashboard = dashboard;
            if (!targetDashboard || targetDashboard === '/login') {
                const demoAccount = DEMO_ACCOUNTS.find(a => a.email === formData.email);
                targetDashboard = demoAccount?.dashboard || '/staff/dashboard';
            }
            router.push(targetDashboard);
        }
    }, [isAuthenticated, router, formData.email]);

    useEffect(() => {
        if (error) setFormErrors({ general: error });
    }, [error]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFormErrors({});
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
            setFormErrors({ general: err.response?.data?.message || err.message || 'Login failed' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoAccountClick = (email: string, password: string) => {
        setFormData({ email, password });
        setSelectedDemo(email);
    };

    return (
        <div className="fixed inset-0 overflow-auto bg-[#f8fafc]">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.08),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.06),transparent_50%)]" />
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/5 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl" />
            </div>

            <div className="relative flex items-center justify-center min-h-screen px-4 py-10">
                <div className="w-full max-w-[920px]">

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl shadow-gray-200/60 overflow-hidden border border-gray-100/80">

                        {/* ===== LEFT: Login Form ===== */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="p-8 sm:p-10 flex flex-col justify-center"
                        >
                            {/* Brand */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                                        <Shield className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-lg font-bold text-gray-900 tracking-tight">ProActiv Fitness</span>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                                    Welcome back
                                </h1>
                                <p className="text-gray-500 mt-1 text-[15px]">
                                    Enter your credentials to access your account
                                </p>
                            </div>

                            {/* Already logged in */}
                            {isAuthenticated && (
                                <div className="mb-5 p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-sm">
                                    <p className="text-blue-800 font-medium mb-2.5">You&apos;re already signed in.</p>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => { router.push(rbacManager.getDashboard() || '/staff/dashboard'); }}
                                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">
                                            Go to Dashboard
                                        </button>
                                        <button type="button" onClick={() => logout()}
                                            className="flex-1 bg-white text-gray-700 py-2 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors border border-gray-200">
                                            Switch Account
                                        </button>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Error */}
                                <AnimatePresence>
                                    {formErrors.general && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm"
                                        >
                                            {formErrors.general}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm placeholder-gray-400 bg-gray-50/50 focus:bg-white outline-none"
                                            placeholder="name@company.com"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm placeholder-gray-400 bg-gray-50/50 focus:bg-white outline-none"
                                            placeholder="Enter your password"
                                            disabled={isLoading}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                                            disabled={isLoading}>
                                            {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember & Forgot */}
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                                        <div className="relative">
                                            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                                                className="peer sr-only" />
                                            <div className="w-[18px] h-[18px] border-2 border-gray-300 rounded peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all flex items-center justify-center">
                                                {rememberMe && (
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Remember me</span>
                                    </label>
                                    <button type="button" onClick={() => router.push('/forgot-password')}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                        Forgot password?
                                    </button>
                                </div>

                                {/* Submit */}
                                <button type="submit" disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold active:scale-[0.98]">
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="w-4 h-4" />
                                            Sign In
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Footer links */}
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">
                                        Parent?{' '}
                                        <button onClick={() => router.push('/login/parent')} className="text-blue-600 font-medium hover:underline">
                                            Parent Login
                                        </button>
                                    </span>
                                    <button onClick={() => router.push('/register')} className="text-blue-600 font-medium hover:underline">
                                        Create Account
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* ===== RIGHT: Demo Accounts ===== */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 sm:p-10 flex flex-col justify-center relative overflow-hidden"
                        >
                            {/* Decorative elements */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-60" />
                            </div>

                            <div className="relative z-10">
                                {/* Header */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Zap className="w-4 h-4 text-amber-400" />
                                        <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Quick Access</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-white leading-tight">
                                        Demo Accounts
                                    </h2>
                                    <p className="text-slate-400 text-sm mt-1">
                                        Select a role to auto-fill credentials
                                    </p>
                                </div>

                                {/* Account list */}
                                <div className="space-y-1.5">
                                    {DEMO_ACCOUNTS.map((account, index) => {
                                        const Icon = account.icon;
                                        const isSelected = selectedDemo === account.email;
                                        return (
                                            <motion.button
                                                key={account.email}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.25 + index * 0.04 }}
                                                onClick={() => handleDemoAccountClick(account.email, account.password)}
                                                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                                                    isSelected
                                                        ? 'bg-white/15 ring-1 ring-white/20'
                                                        : 'hover:bg-white/8'
                                                }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${account.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                                    <Icon className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-white">{account.label}</div>
                                                    <div className="text-xs text-slate-400">{account.description}</div>
                                                </div>
                                                <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-all duration-200 ${
                                                    isSelected ? 'text-white translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'
                                                }`} />
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Bottom hint */}
                                <div className="mt-6 pt-5 border-t border-white/10">
                                    <p className="text-xs text-slate-500 text-center">
                                        Click any role above, then press <span className="text-slate-300 font-medium">Sign In</span>
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </div>
        </div>
    );
}
