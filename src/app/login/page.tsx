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
    CheckCircle,
    AlertCircle,
    Sparkles
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import BookingHeader from '@/components/layout/BookingHeader'

// Declare Google window type
declare global {
    interface Window {
        google?: any
    }
}

const LoginPage = () => {
    const router = useRouter()
    const [isLogin, setIsLogin] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    })

    const [signupData, setSignupData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    })

    // Check URL params on mount to set initial tab
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const tab = params.get('tab')
        if (tab === 'signup') {
            setIsLogin(false)
        } else {
            setIsLogin(true)
        }
    }, [])

    // Load Google SDK on component mount
    useEffect(() => {
        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        document.head.appendChild(script)

        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script)
            }
        }
    }, [])

    // Handle tab change with URL update
    const handleTabChange = (isLoginTab: boolean) => {
        setIsLogin(isLoginTab)
        setErrors({})

        // Update URL without page reload
        if (isLoginTab) {
            router.push('/login', { scroll: false })
        } else {
            router.push('/login?tab=signup', { scroll: false })
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

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
                localStorage.setItem('authToken', result.token)
                localStorage.setItem('userRole', result.data.role.name)
                localStorage.setItem('userEmail', result.data.email)
                localStorage.setItem('userName', result.data.name)
                localStorage.setItem('isAuthenticated', 'true')

                const dashboards: Record<string, string> = {
                    PARENT: '/parent/dashboard',
                    COACH: '/coach/dashboard',
                    ADMIN: '/admin/dashboard',
                    MANAGER: '/manager/dashboard'
                }

                router.push(dashboards[result.data.role.name] || '/parent/dashboard')
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

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setErrors({})

        if (signupData.password !== signupData.confirmPassword) {
            setErrors({ general: 'Passwords do not match' })
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: signupData.firstName,
                    lastName: signupData.lastName,
                    email: signupData.email,
                    password: signupData.password,
                    phone: signupData.phone
                })
            })

            const result = await response.json()

            if (result.success) {
                localStorage.setItem('authToken', result.token)
                localStorage.setItem('userRole', result.data.role.name)
                localStorage.setItem('userEmail', result.data.email)
                localStorage.setItem('userName', result.data.name)
                localStorage.setItem('isAuthenticated', 'true')

                router.push('/parent/dashboard')
            } else {
                setErrors({ general: result.message || 'Registration failed' })
            }
        } catch (error) {
            console.error('Registration error:', error)
            setErrors({ general: 'Network error. Please try again.' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setIsLoading(true)
        try {
            // Initialize Google Sign-In if not already done
            if (!window.google) {
                setErrors({ general: 'Google Sign-In not loaded. Please refresh the page.' })
                setIsLoading(false)
                return
            }

            // Use Google's One Tap Sign-In
            window.google.accounts.id.initialize({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                callback: handleGoogleSignInResponse
            })

            // Trigger the One Tap UI
            window.google.accounts.id.prompt((notification: any) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    // If One Tap is not displayed, show the standard button
                    window.google.accounts.id.renderButton(
                        document.getElementById('google-signin-button'),
                        { theme: 'outline', size: 'large' }
                    )
                }
            })

        } catch (error) {
            console.error('Google login error:', error)
            setErrors({ general: 'Google login failed. Please try again.' })
            setIsLoading(false)
        }
    }

    const handleGoogleSignInResponse = async (response: any) => {
        setIsLoading(true)
        try {
            if (!response.credential) {
                setErrors({ general: 'Google sign-in failed. Please try again.' })
                setIsLoading(false)
                return
            }

            // Send the ID token to the backend
            const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idToken: response.credential
                })
            })

            const result = await backendResponse.json()

            if (result.success) {
                localStorage.setItem('authToken', result.token)
                localStorage.setItem('userRole', result.data.role.name)
                localStorage.setItem('userEmail', result.data.email)
                localStorage.setItem('userName', result.data.name)
                localStorage.setItem('isAuthenticated', 'true')

                router.push('/parent/dashboard')
            } else {
                setErrors({ general: result.message || 'Google login failed' })
            }
        } catch (error) {
            console.error('Google sign-in response error:', error)
            setErrors({ general: 'Network error. Please try again.' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleForgotPassword = () => {
        console.log('Forgot password clicked')
    }

    return (
        <>
            <BookingHeader />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            rotate: [0, 360],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{
                            rotate: [360, 0],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"
                    />
                </div>

                <div className="relative flex items-center justify-center min-h-screen p-2 pt-18 pb-1">
                    <div className="w-full max-w-sm">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-4"
                        >
                            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-2 shadow-lg">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-1">
                                Welcome Back
                            </h1>
                            <p className="text-xs text-gray-600">
                                {isLogin ? 'Sign in to continue' : 'Join our community'}
                            </p>
                        </motion.div>

                        {/* Main Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Card className="backdrop-blur-xl bg-white/70 border-2 border-white/50 shadow-2xl shadow-blue-500/10 rounded-2xl overflow-hidden ring-1 ring-gray-200/50">
                                <CardHeader className="pb-2">
                                    {/* Toggle Buttons */}
                                    <div className="flex items-center justify-center p-1 bg-gray-100/80 rounded-lg backdrop-blur-sm border border-gray-200/50">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleTabChange(true)}
                                            className={`flex-1 px-3 py-2 rounded-md font-medium transition-all duration-300 text-sm border ${isLogin
                                                ? 'bg-white text-blue-600 shadow-md shadow-blue-500/20 border-blue-200'
                                                : 'text-gray-600 hover:text-gray-800 border-transparent'
                                                }`}
                                        >
                                            Sign In
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleTabChange(false)}
                                            className={`flex-1 px-3 py-2 rounded-md font-medium transition-all duration-300 text-sm border ${!isLogin
                                                ? 'bg-white text-blue-600 shadow-md shadow-blue-500/20 border-blue-200'
                                                : 'text-gray-600 hover:text-gray-800 border-transparent'
                                                }`}
                                        >
                                            Sign Up
                                        </motion.button>
                                    </div>
                                </CardHeader>

                                <CardContent className="px-5 pb-5">
                                    {isLogin ? (
                                        <motion.div
                                            key="login"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.4 }}
                                            className="space-y-3"
                                        >
                                            <form onSubmit={handleLogin} className="space-y-3">
                                                {/* Email Field */}
                                                <div className="space-y-1">
                                                    <label className="block text-xs font-semibold text-gray-700">Email Address</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <Mail className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                        <input
                                                            type="email"
                                                            value={loginData.email}
                                                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                                            className="w-full pl-9 pr-4 py-2.5 bg-white/50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all duration-300 placeholder-gray-400 text-sm hover:border-gray-300 shadow-sm"
                                                            placeholder="Enter your email"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                {/* Password Field */}
                                                <div className="space-y-1">
                                                    <label className="block text-xs font-semibold text-gray-700">Password</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <Lock className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                        <input
                                                            type={showPassword ? 'text' : 'password'}
                                                            value={loginData.password}
                                                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                                            className="w-full pl-9 pr-9 py-2.5 bg-white/50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all duration-300 placeholder-gray-400 text-sm hover:border-gray-300 shadow-sm"
                                                            placeholder="Enter your password"
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                                        >
                                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Forgot Password */}
                                                <div className="flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={handleForgotPassword}
                                                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                                                    >
                                                        Forgot Password?
                                                    </button>
                                                </div>

                                                {/* Error Message */}
                                                {errors.general && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2"
                                                    >
                                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                        {errors.general}
                                                    </motion.div>
                                                )}

                                                {/* Submit Button */}
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                                >
                                                    {isLoading ? (
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <span>Sign In</span>
                                                            <ArrowRight className="w-4 h-4" />
                                                        </>
                                                    )}
                                                </motion.button>
                                            </form>

                                            {/* Divider */}
                                            <div className="relative my-4">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t-2 border-gray-300" />
                                                </div>
                                                <div className="relative flex justify-center text-xs">
                                                    <span className="px-3 bg-white/70 text-gray-500 font-medium">Or continue with</span>
                                                </div>
                                            </div>

                                            {/* Google Login */}
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="button"
                                                onClick={handleGoogleLogin}
                                                disabled={isLoading}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-300 group shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                </svg>
                                                <span className="font-medium text-gray-700 text-sm group-hover:text-gray-900">
                                                    {isLoading ? 'Signing in...' : 'Continue with Google'}
                                                </span>
                                            </motion.button>

                                            {/* Sign Up Link */}
                                            <div className="text-center">
                                                <p className="text-xs text-gray-600">
                                                    Don't have an account?{' '}
                                                    <button
                                                        onClick={() => handleTabChange(false)}
                                                        className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                                                    >
                                                        Sign up here
                                                    </button>
                                                </p>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="signup"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.4 }}
                                            className="space-y-2"
                                        >
                                            <form onSubmit={handleSignup} className="space-y-2">
                                                {/* Name Fields */}
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <label className="block text-xs font-semibold text-gray-700">First Name</label>
                                                        <input
                                                            type="text"
                                                            value={signupData.firstName}
                                                            onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                                                            className="w-full px-3 py-2 bg-white/50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all duration-300 placeholder-gray-400 text-xs hover:border-gray-300 shadow-sm"
                                                            placeholder="John"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="block text-xs font-semibold text-gray-700">Last Name</label>
                                                        <input
                                                            type="text"
                                                            value={signupData.lastName}
                                                            onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                                                            className="w-full px-3 py-2 bg-white/50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all duration-300 placeholder-gray-400 text-xs hover:border-gray-300 shadow-sm"
                                                            placeholder="Doe"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                {/* Email & Phone */}
                                                <div className="space-y-2">
                                                    <div className="space-y-1">
                                                        <label className="block text-xs font-semibold text-gray-700">Email Address</label>
                                                        <input
                                                            type="email"
                                                            value={signupData.email}
                                                            onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                                                            className="w-full px-3 py-2 bg-white/50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all duration-300 placeholder-gray-400 text-xs hover:border-gray-300 shadow-sm"
                                                            placeholder="john@example.com"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="block text-xs font-semibold text-gray-700">Phone Number</label>
                                                        <input
                                                            type="tel"
                                                            value={signupData.phone}
                                                            onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                                                            className="w-full px-3 py-2 bg-white/50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all duration-300 placeholder-gray-400 text-xs hover:border-gray-300 shadow-sm"
                                                            placeholder="+852 1234 5678"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                {/* Password Fields */}
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <label className="block text-xs font-semibold text-gray-700">Password</label>
                                                        <input
                                                            type="password"
                                                            value={signupData.password}
                                                            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                                            className="w-full px-3 py-2 bg-white/50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all duration-300 placeholder-gray-400 text-xs hover:border-gray-300 shadow-sm"
                                                            placeholder="Password123"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="block text-xs font-semibold text-gray-700">Confirm</label>
                                                        <input
                                                            type="password"
                                                            value={signupData.confirmPassword}
                                                            onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                                                            className="w-full px-3 py-2 bg-white/50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all duration-300 placeholder-gray-400 text-xs hover:border-gray-300 shadow-sm"
                                                            placeholder="Confirm password"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                {/* Error Message */}
                                                {errors.general && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2"
                                                    >
                                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                        {errors.general}
                                                    </motion.div>
                                                )}

                                                {/* Submit Button */}
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                                >
                                                    {isLoading ? (
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <span>Create Account</span>
                                                            <CheckCircle className="w-4 h-4" />
                                                        </>
                                                    )}
                                                </motion.button>
                                            </form>

                                            {/* Sign In Link */}
                                            <div className="text-center mt-3">
                                                <p className="text-xs text-gray-600">
                                                    Already have an account?{' '}
                                                    <button
                                                        onClick={() => handleTabChange(true)}
                                                        className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                                                    >
                                                        Sign in here
                                                    </button>
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LoginPage