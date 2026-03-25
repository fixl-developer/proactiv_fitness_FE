'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    LayoutDashboard, Users, Calendar, DollarSign,
    Building2, BarChart3, Settings, MessageSquare,
    UserCheck, Target, Bell, Shield, Database
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { responsiveClasses } from '@/lib/responsiveClasses'

const AdminHomePage = () => {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isAuthenticated = localStorage.getItem('isAuthenticated')
            if (!isAuthenticated) {
                window.location.href = '/login'
                return
            }
        }
        setTimeout(() => setIsLoading(false), 1000)
    }, [])

    // Admin Navigation Items
    const adminSections = [
        {
            title: 'Dashboard',
            description: 'Business overview and key metrics',
            icon: LayoutDashboard,
            href: '/admin/dashboard',
            color: 'bg-blue-500',
            stats: 'Live data'
        },
        {
            title: 'Users & Roles',
            description: 'Manage user accounts and permissions',
            icon: Users,
            href: '/admin/users',
            color: 'bg-green-500',
            stats: '156 users'
        },
        {
            title: 'Staff Management',
            description: 'Coach schedules and performance',
            icon: UserCheck,
            href: '/admin/staff',
            color: 'bg-purple-500',
            stats: '54 coaches'
        },
        {
            title: 'Customers',
            description: 'Student and parent management',
            icon: Target,
            href: '/admin/customers',
            color: 'bg-orange-500',
            stats: '3,420 students'
        },
        {
            title: 'Schedule',
            description: 'Class scheduling and management',
            icon: Calendar,
            href: '/admin/schedule',
            color: 'bg-red-500',
            stats: '89 classes'
        },
        {
            title: 'Bookings',
            description: 'Assessment and class bookings',
            icon: Bell,
            href: '/admin/bookings',
            color: 'bg-yellow-500',
            stats: '12 today'
        },
        {
            title: 'Payments',
            description: 'Financial transactions and billing',
            icon: DollarSign,
            href: '/admin/payments',
            color: 'bg-emerald-500',
            stats: 'HK$485K/month'
        },
        {
            title: 'Analytics',
            description: 'Business intelligence and reports',
            icon: BarChart3,
            href: '/admin/analytics',
            color: 'bg-indigo-500',
            stats: 'Real-time'
        },
        {
            title: 'Organization',
            description: 'Business units and locations',
            icon: Building2,
            href: '/admin/organization',
            color: 'bg-pink-500',
            stats: '16 outlets'
        },
        {
            title: 'Locations',
            description: 'Gym locations and facilities',
            icon: Building2,
            href: '/admin/locations',
            color: 'bg-cyan-500',
            stats: '8 gyms'
        },
        {
            title: 'AI Systems',
            description: 'Chatbot and automation tools',
            icon: MessageSquare,
            href: '/admin/ai',
            color: 'bg-violet-500',
            stats: '87% resolution'
        },
        {
            title: 'Students',
            description: 'Student profiles and progress',
            icon: Users,
            href: '/admin/students',
            color: 'bg-teal-500',
            stats: '3,420 active'
        }
    ]

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4 sm:space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
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
            <div className={responsiveClasses.headerContainer}>
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent animate-gradient-text"
                    >
                        Admin Center
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-600 mt-2"
                    >
                        Manage all aspects of your <span className="font-semibold text-violet-600">gymnastics business</span>
                    </motion.p>
                </div>
                <Button id="admin-go-to-dashboard-btn"
                    onClick={() => window.location.href = '/admin/dashboard'}
                    className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Go to Dashboard
                </Button>
            </div>

            {/* Admin Sections Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {adminSections.map((section, index) => (
                    <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="group"
                    >
                        <Card
                            id={`admin-section-${section.title.toLowerCase().replace(/\s+/g, '-')}-card`}
                            className="hover:shadow-2xl transition-all duration-500 cursor-pointer group border-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm admin-card-hover"
                            onClick={() => window.location.href = section.href}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-xl ${section.color} text-white group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                                        <section.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg group-hover:text-violet-600 transition-colors duration-300 font-bold">
                                            {section.title}
                                        </CardTitle>
                                        <p className="text-sm text-gray-600 mt-1 group-hover:text-gray-700 transition-colors">
                                            {section.description}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500 group-hover:text-violet-600 transition-colors">
                                        {section.stats}
                                    </span>
                                    <Button id={`admin-section-${section.title.toLowerCase().replace(/\s+/g, '-')}-open-btn`}
                                        variant="ghost"
                                        size="sm"
                                        className="group-hover:bg-gradient-to-r group-hover:from-violet-50 group-hover:to-purple-50 group-hover:text-violet-600 transition-all duration-300 transform group-hover:scale-105"
                                    >
                                        Open →
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardHeader>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                        System Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { value: '16', label: 'Total Locations', color: 'from-blue-500 to-cyan-500' },
                            { value: '3,420', label: 'Active Students', color: 'from-emerald-500 to-teal-500' },
                            { value: '156', label: 'Staff Members', color: 'from-purple-500 to-violet-500' },
                            { value: '89', label: 'Active Classes', color: 'from-orange-500 to-amber-500' }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 * index }}
                                className="text-center group"
                            >
                                <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}>
                                    {stat.value}
                                </div>
                                <div className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default AdminHomePage
