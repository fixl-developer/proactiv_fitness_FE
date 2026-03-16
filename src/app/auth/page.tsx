'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    LogIn, UserPlus, Shield, Key,
    ArrowRight, Users, Lock, Mail
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { responsiveClasses } from '@/lib/responsiveClasses'

const AuthHomePage = () => {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 1000)
    }, [])

    // Auth Options
    const authOptions = [
        {
            title: 'Sign In',
            description: 'Access your existing account',
            icon: LogIn,
            href: '/auth/signin',
            color: 'bg-blue-500',
            primary: true
        },
        {
            title: 'Sign Up',
            description: 'Create a new account',
            icon: UserPlus,
            href: '/auth/signup',
            color: 'bg-green-500',
            primary: false
        },
        {
            title: 'Login (Alternative)',
            description: 'Alternative login page',
            icon: Key,
            href: '/auth/login',
            color: 'bg-purple-500',
            primary: false
        },
        {
            title: 'Sign Out',
            description: 'Logout from your account',
            icon: Shield,
            href: '/auth/signout',
            color: 'bg-red-500',
            primary: false
        }
    ]

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4 sm:space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={responsiveClasses.pageContainer}>
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                    Authentication Center
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Secure access to ProGym management system
                </p>
            </div>

            {/* Auth Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {authOptions.map((option, index) => (
                    <motion.div
                        key={option.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                    >
                        <Card
                            className={`hover:shadow-lg transition-all cursor-pointer group ${option.primary ? 'ring-2 ring-blue-200' : ''
                                }`}
                            onClick={() => window.location.href = option.href}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${option.color} text-white group-hover:scale-110 transition-transform`}>
                                        <option.icon className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                                            {option.title}
                                        </CardTitle>
                                        <p className="text-gray-600 mt-1">
                                            {option.description}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-500">Secure</span>
                                    </div>
                                    <Button
                                        variant={option.primary ? "default" : "ghost"}
                                        size="sm"
                                        className="group-hover:bg-blue-50"
                                    >
                                        Access <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Security Features */}
            <Card className="max-w-4xl mx-auto mt-8">
                <CardHeader>
                    <CardTitle className="text-center">Security Features</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-3">
                                <Lock className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Encrypted</h3>
                            <p className="text-sm text-gray-600">
                                All data is encrypted in transit and at rest
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-3">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Role-Based</h3>
                            <p className="text-sm text-gray-600">
                                Access control based on user roles and permissions
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-3">
                                <Mail className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Verified</h3>
                            <p className="text-sm text-gray-600">
                                Email verification for account security
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default AuthHomePage