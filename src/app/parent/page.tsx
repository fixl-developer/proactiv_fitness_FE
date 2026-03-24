'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    LayoutDashboard, Calendar, Users, CreditCard,
    User, Heart, Star, Trophy,
    ArrowRight, Clock, Target, Award
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { responsiveClasses } from '@/lib/responsiveClasses'

const ParentHomePage = () => {
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

    // Parent Navigation Items
    const parentSections = [
        {
            title: 'Dashboard',
            description: 'Overview of your children\'s progress',
            icon: LayoutDashboard,
            href: '/parent/dashboard',
            color: 'bg-blue-500',
            stats: 'Latest updates',
            priority: 'high'
        },
        {
            title: 'Children',
            description: 'Manage your children\'s profiles',
            icon: Users,
            href: '/parent/children',
            color: 'bg-green-500',
            stats: '2 children',
            priority: 'high'
        },
        {
            title: 'Bookings',
            description: 'View and manage class bookings',
            icon: Calendar,
            href: '/parent/bookings',
            color: 'bg-purple-500',
            stats: '3 upcoming',
            priority: 'medium'
        },
        {
            title: 'Payments',
            description: 'Payment history and billing',
            icon: CreditCard,
            href: '/parent/payments',
            color: 'bg-orange-500',
            stats: 'Up to date',
            priority: 'medium'
        },
        {
            title: 'Profile',
            description: 'Manage your account settings',
            icon: User,
            href: '/parent/profile',
            color: 'bg-pink-500',
            stats: 'Complete',
            priority: 'low'
        }
    ]

    // Quick Stats
    const quickStats = [
        {
            label: 'Children Enrolled',
            value: '2',
            icon: Users,
            color: 'text-blue-600'
        },
        {
            label: 'Classes This Week',
            value: '6',
            icon: Calendar,
            color: 'text-green-600'
        },
        {
            label: 'Hours Practiced',
            value: '12',
            icon: Clock,
            color: 'text-purple-600'
        },
        {
            label: 'Achievements',
            value: '5',
            icon: Trophy,
            color: 'text-yellow-600'
        }
    ]

    // Children Overview (Sample Data)
    const children = [
        {
            name: 'Emma',
            age: 7,
            level: 'Beginner 2',
            nextClass: 'Today 4:00 PM',
            progress: 85,
            achievements: 3
        },
        {
            name: 'Liam',
            age: 5,
            level: 'Beginner 1',
            nextClass: 'Tomorrow 3:00 PM',
            progress: 72,
            achievements: 2
        }
    ]

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4 sm:space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[1, 2, 3, 4, 5].map((i) => (
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
                    <h1 className={responsiveClasses.headerTitle}>Parent Portal</h1>
                    <p className={responsiveClasses.headerSubtitle}>
                        Track your children's gymnastics journey
                    </p>
                </div>
                <Button id="parent-goto-dashboard-btn" onClick={() => window.location.href = '/parent/dashboard'}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Go to Dashboard
                </Button>
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
                                <div className="flex items-center gap-3">
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    <div>
                                        <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                                        <div className="text-xs text-gray-600">{stat.label}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Children Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {children.map((child, index) => (
                    <motion.div
                        key={child.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + 0.1 * index }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-pink-400 to-purple-500 text-white rounded-lg">
                                            <Heart className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{child.name}</CardTitle>
                                            <p className="text-sm text-gray-600">{child.age} years old • {child.level}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                        {child.achievements} achievements
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Progress</span>
                                            <span className="text-sm font-bold">{child.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${child.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">Next class: {child.nextClass}</span>
                                        </div>
                                        <Button id={`parent-child-${child.name.toLowerCase()}-view-btn`} variant="outline" size="sm">
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Parent Sections Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {parentSections.map((section, index) => (
                    <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + 0.1 * index }}
                    >
                        <Card
                            id={`parent-section-${section.title.toLowerCase()}-card`}
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
                                                    Important
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
                                    <Button id={`parent-section-${section.title.toLowerCase()}-open-btn`} variant="ghost" size="sm" className="group-hover:bg-blue-50">
                                        Open <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { icon: Calendar, label: 'Book Class', href: '/book-now' },
                            { icon: CreditCard, label: 'Make Payment', href: '/parent/payments' },
                            { icon: Star, label: 'View Progress', href: '/parent/children' },
                            { icon: Target, label: 'Set Goals', href: '/parent/dashboard' }
                        ].map((action, index) => (
                            <Button id={`parent-quick-${action.label.toLowerCase().replace(/\s+/g, '-')}-btn`}
                                key={index}
                                className="h-16 flex-col gap-2"
                                variant="outline"
                                onClick={() => window.location.href = action.href}
                            >
                                <action.icon className="w-5 h-5" />
                                <span className="text-sm">{action.label}</span>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ParentHomePage
