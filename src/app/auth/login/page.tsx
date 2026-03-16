'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    AlertCircle,
    Shield,
    Users,
    Settings,
    Award
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

const StaffLoginPage = () => {
    const router = useRouter()
    const { login, isAuthenticated } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    })

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/admin/dashboard') // Default redirect for staff
        }
    }, [isAuthenticated, router])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setErrors({})

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: loginData.email,
                    password: loginData.password
                })
            })

            const result = await response.json()

            if (result.success) {
                // Check if user is staff (not parent)
                const userRole = result.data.role.name
                if (userRole === 'PARENT') {
                    setErrors({ general: 'Parents cannot access staff portal. Please use the main login page.' })
                    setIsLoading(false)
                    return
                }

                // Use auth context login method
                login(result.token, {
                    id: result.data.id || '1',
                    name: result.data.name,
                    email: result.data.email,
                    role: result.data.role.name
                })

                const dashboards: Record<string, string> = {
                    ADMIN: '/admin/dashboard',
                    COACH: '/coach/dashboard',
                    MANAGER: '/manager/dashboard'
                }

                router.push(dashboards[result.data.role.name] || '/admin/dashboard')
            } else {
                setErrors({ general: result.message || 'Login failed' })
            }
        } catch (error) {
            console.error('Login error:', error)
            setErrors({ general: 'Network error. Please try again.' })
        } finally {
            setIsLoading(false)
        }
    }

    const demoCredentials = [
        {
            email: 'admin@proactivsports.net',
            password: 'admin123',
            label: 'Admin',
            icon: Settings,
            color: 'from-red-500 to-pink-500',
            description: 'Full system access'
        },
        {
            email: 'manager@proactivsports.net',
            password: 'manager123',
            label: 'Manager',
            icon: Users,
            color: 'from-blue-500 to-indigo-500',
            description: 'Operations management'
        },
        {
            email: 'coach@proactivsports.net',
            password: 'coach123',
            label: 'Coach',
            icon: Award,
            color: 'from-green-500 to-emerald-500',
            description: 'Training & classes'
        }
    ]

    const fillDemoCredentials = (demo: { email: string; password: string }) => {
        setLoginData({ email: demo.email, password: demo.password })
        setErrors({})
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
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
                    className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"
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
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl"
                />
            </div>

            <div className="relative flex items-center justify-center min-h-screen p-2 py-4">
                <div className="w-full max-w-sm">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-3"
                    >
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-2 shadow-2xl">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-1">
                            Staff Portal
                        </h1>
                        <p className="text-blue-200 text-sm">
                            Admin, Manager & Coach Access
                        </p>
                    </motion.div>

                    {/* Main Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <Card className="backdrop-blur-xl bg-white/10 border-2 border-white/20 shadow-2xl shadow-blue-500/20 rounded-2xl overflow-hidden">
                            <CardHeader className="pb-2">
                                <h2 className="text-lg font-bold text-white text-center">
                                    Sign In to Dashboard
                                </h2>
                                <p className="text-blue-200 text-xs text-center">
                                    Enter your staff credentials
                                </p>
                            </CardHeader>

                            <CardContent className="px-5 pb-4">
                                <form onSubmit={handleLogin} className="space-y-3">
                                    {/* Email Field */}
                                    <div className="space-y-1">
                                        <label className="block text-xs font-semibold text-white">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="h-4 w-4 text-blue-300" />
                                            </div>
                                            <input
                                                type="email"
                                                value={loginData.email}
                                                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                                className="w-full pl-9 pr-4 py-2.5 bg-white/10 border-2 border-white/20 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 placeholder-blue-200 text-white backdrop-blur-sm text-sm"
                                                placeholder="Enter your staff email"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-1">
                                        <label className="block text-xs font-semibold text-white">Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-4 w-4 text-blue-300" />
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={loginData.password}
                                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                                className="w-full pl-9 pr-9 py-2.5 bg-white/10 border-2 border-white/20 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 placeholder-blue-200 text-white backdrop-blur-sm text-sm"
                                                placeholder="Enter your password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-300 hover:text-white transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Error Message */}
                                    {errors.general && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-2.5 bg-red-500/20 border border-red-400/30 rounded-lg text-red-200 text-xs flex items-center gap-2 backdrop-blur-sm"
                                        >
                                            <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                            {errors.general}
                                        </motion.div>
                                    )}

                                    {/* Submit Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        {isLoading ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <span>Access Dashboard</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </motion.button>
                                </form>

                                {/* Demo Credentials */}
                                <div className="mt-4 pt-4 border-t border-white/20">
                                    <p className="text-xs text-blue-200 mb-3 text-center font-medium">Demo Accounts</p>
                                    <div className="space-y-2">
                                        {demoCredentials.map((demo) => {
                                            const IconComponent = demo.icon
                                            return (
                                                <motion.button
                                                    key={demo.email}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => fillDemoCredentials(demo)}
                                                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`w-8 h-8 bg-gradient-to-r ${demo.color} rounded-lg flex items-center justify-center shadow-lg`}>
                                                            <IconComponent className="w-4 h-4 text-white" />
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <div className="font-semibold text-white group-hover:text-blue-200 transition-colors text-sm">
                                                                {demo.label}
                                                            </div>
                                                            <div className="text-xs text-blue-300">
                                                                {demo.description}
                                                            </div>
                                                        </div>
                                                        <ArrowRight className="w-3 h-3 text-blue-300 group-hover:text-white transition-colors" />
                                                    </div>
                                                </motion.button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Parent Login Link */}
                                <div className="mt-4 pt-3 border-t border-white/20 text-center">
                                    <p className="text-xs text-blue-200">
                                        Are you a parent?{' '}
                                        <button
                                            onClick={() => router.push('/login')}
                                            className="font-semibold text-blue-400 hover:text-white transition-colors underline"
                                        >
                                            Use Parent Login
                                        </button>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default StaffLoginPage