'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    LayoutDashboard, Calendar, Users, BarChart3,
    Settings, UserCheck, Target, Building2,
    ArrowRight, TrendingUp, Clock, Award
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { responsiveClasses } from '@/lib/responsiveClasses'

const ManagerHomePage = () => {
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

    // Manager Navigation Items
    const managerSections = [
        {
            title: 'Dashboard',
            description: 'Location overview and key metrics',
            icon: LayoutDashboard,
            href: '/manager/dashboard',
            color: 'bg-blue-500',
            stats: 'Live data',
            priority: 'high'
        },
        {
            title: 'Schedule',
            description: 'Manage class schedules and bookings',
            icon: Calendar,
            href: '/manager/schedule',
            color: 'bg-green-500',
            stats: '24 classes today',
            priority: 'high'
        },
        {
            title: 'Staff',
            description: 'Coach management and assignments',
            icon: UserCheck,
            href: '/manager/staff',
            color: 'bg-purple-500',
            stats: '12 coaches',
            priority: 'medium'
        },
        {
            title: 'Students',
            description: 'Student enrollment and progress',
            icon: Users,
            href: '/manager/students',
            color: 'bg-orange-500',
            stats: '180 students',
            priority: 'medium'
        },
        {
            title: 'Reports',
            description: 'Performance and financial reports',
            icon: BarChart3,
            href: '/manager/reports',
            color: 'bg-red-500',
            stats: 'Monthly report',
            priority: 'medium'
        },
        {
            title: 'Settings',
            description: 'Location settings and preferences',
            icon: Settings,
            href: '/manager/settings',
            color: 'bg-indigo-500',
            stats: 'Configure',
            priority: 'low'
        }
    ]

    // Quick Stats
    const quickStats = [
        {
            label: 'Today\'s Classes',
            value: '24',
            icon: Calendar,
            color: 'text-blue-600',
            change: '+3'
        },
        {
            label: 'Active Students',
            value: '180',
            icon: Users,
            color: 'text-green-600',
            change: '+8'
        },
        {
            label: 'Staff On Duty',
            value: '8',
            icon: UserCheck,
            color: 'text-purple-600',
            change: '100%'
        },
        {
            label: 'Utilization',
            value: '85%',
            icon: Target,
            color: 'text-orange-600',
            change: '+5%'
        }
    ]

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4 sm:space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
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
                    <h1 className={responsiveClasses.headerTitle}>Manager Portal</h1>
                    <p className={responsiveClasses.headerSubtitle}>
                        Manage your location operations and team
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                        <Building2 className="w-3 h-3 mr-1" />
                        Cyberport Location
                    </Badge>
                    <Button data-testid="btn-window-manager" onClick={() => window.location.href = '/manager/dashboard'}>
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {quickStats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                    >
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                        <div>
                                            <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                                            <div className="text-xs text-gray-600">{stat.label}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3 text-green-500" />
                                        <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Manager Sections Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {managerSections.map((section, index) => (
                    <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                    >
                        <Card
                            className={`hover:shadow-lg transition-all cursor-pointer group ${section.priority === 'high' ? 'ring-2 ring-blue-200' : ''
                                }`}
                            onClick={() => window.location.href = section.href}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${section.color} text-white group-hover:scale-110 transition-transform`}>
                                        <section.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                                                {section.title}
                                            </CardTitle>
                                            {section.priority === 'high' && (
                                                <Badge variant="default" className="text-xs">
                                                    Priority
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {section.description}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500">
                                        {section.stats}
                                    </span>
                                    <Button variant="ghost" size="sm" className="group-hover:bg-blue-50">
                                        Open <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Today's Overview */}
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Today's Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                            <Clock className="w-6 h-6 text-blue-600" />
                            <div>
                                <div className="font-semibold text-gray-900">Operating Hours</div>
                                <div className="text-sm text-gray-600">9:00 AM - 8:00 PM</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                            <Target className="w-6 h-6 text-green-600" />
                            <div>
                                <div className="font-semibold text-gray-900">Capacity</div>
                                <div className="text-sm text-gray-600">85% utilization</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
                            <Award className="w-6 h-6 text-yellow-600" />
                            <div>
                                <div className="font-semibold text-gray-900">Performance</div>
                                <div className="text-sm text-gray-600">Above target</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ManagerHomePage
