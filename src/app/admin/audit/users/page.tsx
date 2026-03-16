'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    User, Users, LogIn, LogOut, UserPlus, UserMinus, Settings,
    Shield, Clock, Activity, Search, Filter, Download, RefreshCw,
    Eye, MapPin, Smartphone, Monitor
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { responsiveClasses } from '@/lib/responsiveClasses'

const UserActivityLogsPage = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedActivity, setSelectedActivity] = useState('all')
    const [dateRange, setDateRange] = useState('7days')

    // Activity types
    const activityTypes = [
        { id: 'all', name: 'All Activities', count: 892, color: 'bg-gray-100 text-gray-700' },
        { id: 'login', name: 'Logins', count: 234, color: 'bg-green-100 text-green-700' },
        { id: 'logout', name: 'Logouts', count: 198, color: 'bg-blue-100 text-blue-700' },
        { id: 'profile', name: 'Profile Changes', count: 156, color: 'bg-yellow-100 text-yellow-700' },
        { id: 'permissions', name: 'Permission Changes', count: 89, color: 'bg-purple-100 text-purple-700' },
        { id: 'failed', name: 'Failed Attempts', count: 45, color: 'bg-red-100 text-red-700' }
    ]

    // User activity statistics
    const activityStats = [
        {
            title: 'Active Users Today',
            value: '156',
            change: '+8%',
            changeType: 'increase',
            icon: Users,
            color: 'text-green-600'
        },
        {
            title: 'Login Sessions',
            value: '234',
            change: '+12%',
            changeType: 'increase',
            icon: LogIn,
            color: 'text-blue-600'
        },
        {
            title: 'Failed Logins',
            value: '12',
            change: '-25%',
            changeType: 'decrease',
            icon: Shield,
            color: 'text-red-600'
        },
        {
            title: 'Avg Session Time',
            value: '2h 34m',
            change: '+5%',
            changeType: 'increase',
            icon: Clock,
            color: 'text-purple-600'
        }
    ]

    // User activity logs
    const userActivities = [
        {
            id: 1,
            timestamp: '2024-01-25 15:30:22',
            user: {
                name: 'John Doe',
                email: 'john.doe@progym.hk',
                role: 'Coach',
                avatar: 'JD'
            },
            activity: 'login',
            action: 'User Login',
            details: 'Successful login via web browser',
            ipAddress: '192.168.1.100',
            device: 'Chrome on Windows',
            location: 'Hong Kong, HK'
        },
        {
            id: 2,
            timestamp: '2024-01-25 15:28:15',
            user: {
                name: 'Sarah Wilson',
                email: 'sarah.wilson@progym.hk',
                role: 'Admin',
                avatar: 'SW'
            },
            activity: 'profile',
            action: 'Profile Updated',
            details: 'Changed phone number and address',
            ipAddress: '192.168.1.105',
            device: 'Safari on macOS',
            location: 'Hong Kong, HK'
        },
        {
            id: 3,
            timestamp: '2024-01-25 15:25:08',
            user: {
                name: 'Mike Chen',
                email: 'mike.chen@progym.hk',
                role: 'Manager',
                avatar: 'MC'
            },
            activity: 'permissions',
            action: 'Role Assignment',
            details: 'Assigned Coach role to new user',
            ipAddress: '192.168.1.110',
            device: 'Chrome on Android',
            location: 'Hong Kong, HK'
        },
        {
            id: 4,
            timestamp: '2024-01-25 15:20:33',
            user: {
                name: 'Unknown User',
                email: 'unknown@example.com',
                role: 'Guest',
                avatar: '??'
            },
            activity: 'failed',
            action: 'Failed Login',
            details: 'Invalid credentials provided',
            ipAddress: '203.104.45.67',
            device: 'Chrome on Windows',
            location: 'Unknown'
        },
        {
            id: 5,
            timestamp: '2024-01-25 15:15:44',
            user: {
                name: 'Lisa Park',
                email: 'lisa.park@progym.hk',
                role: 'Parent',
                avatar: 'LP'
            },
            activity: 'logout',
            action: 'User Logout',
            details: 'Session ended normally',
            ipAddress: '192.168.1.120',
            device: 'Mobile App on iOS',
            location: 'Hong Kong, HK'
        }
    ]

    const getActivityIcon = (activity: string) => {
        const icons = {
            login: LogIn,
            logout: LogOut,
            profile: User,
            permissions: Shield,
            failed: UserMinus
        }
        return icons[activity as keyof typeof icons] || Activity
    }

    const getActivityColor = (activity: string) => {
        const colors = {
            login: 'text-green-600',
            logout: 'text-blue-600',
            profile: 'text-yellow-600',
            permissions: 'text-purple-600',
            failed: 'text-red-600'
        }
        return colors[activity as keyof typeof colors] || 'text-gray-600'
    }

    const getRoleBadge = (role: string) => {
        const colors = {
            Admin: 'bg-red-100 text-red-700',
            Manager: 'bg-blue-100 text-blue-700',
            Coach: 'bg-green-100 text-green-700',
            Parent: 'bg-purple-100 text-purple-700',
            Guest: 'bg-gray-100 text-gray-700'
        }
        return colors[role as keyof typeof colors] || colors.Guest
    }

    return (
        <div className={responsiveClasses.pageContainer}>
            {/* Header */}
            <div className={responsiveClasses.headerContainer}>
                <div>
                    <h1 className={responsiveClasses.headerTitle}>User Activity</h1>
                    <p className={responsiveClasses.headerSubtitle}>
                        Track user actions and authentication events
                    </p>
                </div>
                <div className={responsiveClasses.buttonGroup}>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export Activity
                    </Button>
                    <Button>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Activity Statistics */}
            <div className={responsiveClasses.metricsGrid}>
                {activityStats.map((stat, index) => {
                    const IconComponent = stat.icon
                    return (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className={responsiveClasses.card}>
                                <CardContent className={responsiveClasses.cardContent}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">
                                                {stat.title}
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                                {stat.value}
                                            </p>
                                            <p className={`text-sm mt-1 ${stat.changeType === 'increase' ? 'text-green-600' :
                                                    stat.changeType === 'decrease' ? 'text-red-600' :
                                                        'text-gray-600'
                                                }`}>
                                                {stat.change}
                                            </p>
                                        </div>
                                        <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                                            <IconComponent className="w-6 h-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>

            {/* Filters */}
            <Card className={responsiveClasses.card}>
                <CardContent className={responsiveClasses.cardContent}>
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search by user name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Date Range */}
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="1day">Last 24 hours</option>
                            <option value="7days">Last 7 days</option>
                            <option value="30days">Last 30 days</option>
                        </select>

                        {/* Activity Filter */}
                        <div className="flex flex-wrap gap-2">
                            {activityTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedActivity(type.id)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedActivity === type.id
                                            ? 'bg-blue-600 text-white'
                                            : type.color
                                        }`}
                                >
                                    {type.name} ({type.count})
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* User Activity Table */}
            <Card className={responsiveClasses.card}>
                <CardHeader className={responsiveClasses.cardHeader}>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Recent User Activity
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left p-4 font-medium text-gray-900">User</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Activity</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Timestamp</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Device</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Location</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Details</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {userActivities.map((activity) => {
                                    const ActivityIcon = getActivityIcon(activity.activity)
                                    return (
                                        <tr key={activity.id} className="hover:bg-gray-50">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                        {activity.user.avatar}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {activity.user.name}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {activity.user.email}
                                                        </p>
                                                        <Badge className={getRoleBadge(activity.user.role)}>
                                                            {activity.user.role}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <ActivityIcon className={`w-4 h-4 ${getActivityColor(activity.activity)}`} />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {activity.action}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-900">
                                                        {activity.timestamp}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Monitor className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">
                                                        {activity.device}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">
                                                        {activity.location}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm text-gray-600 max-w-xs truncate">
                                                    {activity.details}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default UserActivityLogsPage