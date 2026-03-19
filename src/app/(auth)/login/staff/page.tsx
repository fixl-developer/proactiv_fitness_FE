'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, LogIn, ChevronRight, Shield, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { rbacManager } from '@/services/auth/rbac';
import { DEMO_ACCOUNTS } from '@/data/demoAccounts';

export default function StaffLoginPage() {
    const router = useRouter();
    const { isAuthenticated, login, logout, error, clearError } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const justLoggedIn = useRef(false);
    const [savedSession, setSavedSession] = useState<any>(null);

    // Check for saved session (15 minute expiry)
    useEffect(() => {
        try {
            const saved = localStorage.getItem('savedSession');
            if (saved) {
                const parsed = JSON.parse(saved);
                const SAVED_SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
                if (parsed.savedAt && (Date.now() - parsed.savedAt) > SAVED_SESSION_TIMEOUT) {
                    localStorage.removeItem('savedSession');
                    setSavedSession(null);
                    return;
                }
                const userData = JSON.parse(parsed.user);
                setSavedSession(userData);
            }
        } catch { setSavedSession(null); }
    }, []);

    useEffect(() => {
        if (isAuthenticated && justLoggedIn.current) {
            justLoggedIn.current = false;
            const dashboard = rbacManager.getDashboard();
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

            {/* Back to Login - fixed top-left */}
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-4 left-4 z-10"
            >
                <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                </Link>
            </motion.div>

            <div className="relative flex items-center justify-center min-h-screen px-4 py-4">
                <div className="w-full max-w-[880px]">
                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl shadow-gray-200/60 overflow-hidden border-2 border-slate-300">

                        {/* ===== LEFT: Login Form ===== */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="p-6 sm:p-8 flex flex-col justify-center"
                        >
                            {/* Brand */}
                            <div className="mb-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                                        <Shield className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-base font-bold text-gray-900 tracking-tight">Staff Portal</span>
                                </div>
                                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                                    Staff Login
                                </h1>
                                <p className="text-gray-500 mt-1 text-sm">
                                    Sign in to access your staff dashboard
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

                            {/* Saved Session - Continue to Dashboard */}
                            {!isAuthenticated && savedSession && (
                                <div className="mb-5 p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
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
                                            <p className="text-sm font-semibold text-gray-900">{savedSession.name || `${savedSession.firstName || ''} ${savedSession.lastName || ''}`.trim() || 'Staff'}</p>
                                            <p className="text-xs text-gray-500">{savedSession.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => {
                                            try {
                                                const saved = JSON.parse(localStorage.getItem('savedSession') || '{}');
                                                localStorage.setItem('token', saved.token);
                                                if (saved.refreshToken) localStorage.setItem('refreshToken', saved.refreshToken);
                                                localStorage.setItem('user', saved.user);
                                                const userData = JSON.parse(saved.user);
                                                const roleName = typeof userData.role === 'object' ? userData.role?.name : userData.role;
                                                localStorage.setItem('auth-storage', JSON.stringify({
                                                    state: { user: { userId: userData.id || '', email: userData.email || '', firstName: userData.firstName || '', lastName: userData.lastName || '', role: roleName || '', permissions: [] }, accessToken: saved.token, refreshToken: saved.refreshToken || null, isAuthenticated: true }, version: 0
                                                }));
                                                localStorage.removeItem('savedSession');
                                                localStorage.setItem('lastActivity', Date.now().toString());

                                                // Map role to correct dashboard
                                                const roleUpper = roleName?.toUpperCase() || '';
                                                const roleDashboardMap: Record<string, string> = {
                                                    'ADMIN': '/admin/dashboard',
                                                    'REGIONAL_ADMIN': '/admin/regional/dashboard',
                                                    'FRANCHISE_OWNER': '/admin/franchise/dashboard',
                                                    'LOCATION_MANAGER': '/manager/dashboard',
                                                    'MANAGER': '/manager/dashboard',
                                                    'COACH': '/coach/dashboard',
                                                    'PARTNER_ADMIN': '/partner/dashboard',
                                                    'SUPPORT_STAFF': '/staff/dashboard',
                                                };
                                                // Try role mapping first, then demo accounts, then fallback
                                                const dashboard = roleDashboardMap[roleUpper]
                                                    || DEMO_ACCOUNTS.find(a => a.email === userData.email)?.dashboard
                                                    || '/staff/dashboard';
                                                window.location.href = dashboard;
                                            } catch { window.location.href = '/staff/dashboard'; }
                                        }}
                                            className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors">
                                            Continue to Dashboard
                                        </button>
                                        <button type="button" onClick={() => { localStorage.removeItem('savedSession'); setSavedSession(null); }}
                                            className="flex-1 bg-white text-gray-700 py-2 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors border border-gray-200">
                                            Switch Account
                                        </button>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                            placeholder="staff@proactiv.com"
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
                        </motion.div>

                        {/* ===== RIGHT: Demo Accounts ===== */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-5 sm:p-7 flex flex-col justify-center relative overflow-hidden"
                        >
                            {/* Decorative elements */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-60" />
                            </div>

                            <div className="relative z-10">
                                {/* Header */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                                        <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest">Quick Access</span>
                                    </div>
                                    <h2 className="text-lg font-bold text-white leading-tight">
                                        Demo Accounts
                                    </h2>
                                    <p className="text-slate-400 text-xs mt-0.5">
                                        Select a role to auto-fill credentials
                                    </p>
                                </div>

                                {/* Account list */}
                                <div className="space-y-1">
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
                                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-200 group ${isSelected
                                                        ? 'bg-white/15 ring-1 ring-white/20'
                                                        : 'hover:bg-white/8'
                                                    }`}
                                            >
                                                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${account.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                                    <Icon className="w-3.5 h-3.5 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-medium text-white">{account.label}</div>
                                                    <div className="text-[10px] text-slate-400">{account.description}</div>
                                                </div>
                                                <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-all duration-200 ${isSelected ? 'text-white translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'
                                                    }`} />
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Bottom hint */}
                                <div className="mt-4 pt-3 border-t border-white/10">
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
