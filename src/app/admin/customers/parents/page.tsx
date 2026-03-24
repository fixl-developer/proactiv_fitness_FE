'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Users, Phone, Mail, MapPin, Calendar, Star, CreditCard,
    Filter, Download, Eye, Plus, Search, MessageSquare,
    User, Baby, TrendingUp, AlertTriangle, CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const ParentAccountsPage = () => {
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive' | 'vip'>('all')
    const [selectedLocation, setSelectedLocation] = useState<string>('all')

    // Parent statistics
    const parentStats = {
        totalParents: 1247,
        activeParents: 1089,
        newThisMonth: 89,
        vipParents: 156,
        averageChildren: 1.4,
        satisfactionScore: 4.6,
        retentionRate: 89.3,
        averageSpend: 3280
    }

    // Parent accounts data
    const parentAccounts = [
        {
            id: 'PAR-001',
            name: 'Mrs. Sarah Chen',
            email: 'sarah.chen@email.com',
            phone: '+852 9123 4567',
            location: 'Cyberport',
            joinDate: '2023-08-15',
            status: 'active',
            tier: 'vip',
            children: [
                { name: 'Emma Chen', age: 4, program: 'GYMTOTS' },
                { name: 'Lucas Chen', age: 6, program: 'Beginner Gymnastics' }
            ],
            totalSpend: 14400,
            lastPayment: '2024-01-15',
            satisfactionScore: 4.8,
            referrals: 3,
            notes: 'Very engaged parent, excellent feedback'
        },
        {
            id: 'PAR-002',
            name: 'Mr. David Wong',
            email: 'david.wong@email.com',
            phone: '+852 9234 5678',
            location: 'Wan Chai',
            joinDate: '2023-06-20',
            status: 'active',
            tier: 'premium',
            children: [
                { name: 'Alex Wong', age: 7, program: 'Beginner Gymnastics' },
                { name: 'Sophie Wong', age: 9, program: 'Intermediate Gymnastics' }
            ],
            totalSpend: 12600,
            lastPayment: '2024-01-10',
            satisfactionScore: 4.6,
            referrals: 2,
            notes: 'Regular attendee, pays on time'
        },
        {
            id: 'PAR-003',
            name: 'Mrs. Lisa Li',
            email: 'lisa.li@email.com',
            phone: '+852 9345 6789',
            location: 'Sha Tin',
            joinDate: '2023-09-10',
            status: 'active',
            tier: 'standard',
            children: [
                { name: 'Sophie Li', age: 10, program: 'Intermediate Gymnastics' }
            ],
            totalSpend: 8400,
            lastPayment: '2024-01-08',
            satisfactionScore: 4.7,
            referrals: 1,
            notes: 'Interested in advanced programs'
        },
        {
            id: 'PAR-004',
            name: 'Mr. James Kim',
            email: 'james.kim@email.com',
            phone: '+852 9456 7890',
            location: 'Cyberport',
            joinDate: '2023-11-05',
            status: 'inactive',
            tier: 'standard',
            children: [
                { name: 'Ryan Kim', age: 4, program: 'GYMTOTS' }
            ],
            totalSpend: 2400,
            lastPayment: '2023-12-15',
            satisfactionScore: 4.2,
            referrals: 0,
            notes: 'Missed last 3 payments, follow up needed'
        }
    ]

    // Parent engagement metrics
    const engagementMetrics = [
        {
            location: 'Cyberport',
            totalParents: 389,
            activeParents: 356,
            vipParents: 67,
            avgSatisfaction: 4.8,
            avgSpend: 3450,
            retentionRate: 92.1
        },
        {
            location: 'Wan Chai',
            totalParents: 312,
            activeParents: 289,
            vipParents: 45,
            avgSatisfaction: 4.6,
            avgSpend: 3180,
            retentionRate: 88.7
        },
        {
            location: 'Sha Tin',
            totalParents: 298,
            activeParents: 271,
            vipParents: 32,
            avgSatisfaction: 4.7,
            avgSpend: 3020,
            retentionRate: 87.9
        },
        {
            location: 'Tsim Sha Tsui',
            totalParents: 248,
            activeParents: 173,
            vipParents: 12,
            avgSatisfaction: 4.5,
            avgSpend: 2890,
            retentionRate: 84.2
        }
    ]

    // Parent communication preferences
    const communicationPrefs = {
        email: 78,
        sms: 65,
        whatsapp: 89,
        phone: 34,
        inApp: 92
    }

    // Recent parent activities
    const recentActivities = [
        {
            parentName: 'Mrs. Sarah Chen',
            activity: 'Enrolled Emma in Advanced GYMTOTS',
            timestamp: '2 hours ago',
            type: 'enrollment'
        },
        {
            parentName: 'Mr. David Wong',
            activity: 'Payment received - HK$2,400',
            timestamp: '4 hours ago',
            type: 'payment'
        },
        {
            parentName: 'Mrs. Lisa Li',
            activity: 'Left 5-star review',
            timestamp: '6 hours ago',
            type: 'feedback'
        },
        {
            parentName: 'Mrs. Amy Zhang',
            activity: 'Referred new family',
            timestamp: '1 day ago',
            type: 'referral'
        }
    ]

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'text-green-600 bg-green-50',
            inactive: 'text-red-600 bg-red-50',
            pending: 'text-yellow-600 bg-yellow-50'
        }
        return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50'
    }

    const getTierColor = (tier: string) => {
        const colors = {
            vip: 'text-purple-600 bg-purple-50',
            premium: 'text-blue-600 bg-blue-50',
            standard: 'text-gray-600 bg-gray-50'
        }
        return colors[tier as keyof typeof colors] || 'text-gray-600 bg-gray-50'
    }

    const getActivityIcon = (type: string) => {
        const icons = {
            enrollment: <Users className="w-4 h-4 text-blue-600" />,
            payment: <CreditCard className="w-4 h-4 text-green-600" />,
            feedback: <Star className="w-4 h-4 text-yellow-600" />,
            referral: <TrendingUp className="w-4 h-4 text-purple-600" />
        }
        return icons[type as keyof typeof icons] || <User className="w-4 h-4 text-gray-600" />
    }

    const filteredParents = parentAccounts.filter(parent => {
        if (selectedFilter === 'all') return true
        if (selectedFilter === 'vip') return parent.tier === 'vip'
        return parent.status === selectedFilter
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Parent Accounts</h1>
                    <p className="text-gray-600 mt-2">Manage parent profiles and family relationships</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button id="admin-parents-filter-btn" variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                    <Button id="admin-parents-export-btn" variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button id="admin-parents-add-btn" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Parent
                    </Button>
                </div>
            </div>

            {/* Parent Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Parents</CardTitle>
                        <Users className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{parentStats.totalParents}</div>
                        <div className="text-sm text-blue-600 font-medium">{parentStats.activeParents} active</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">VIP Parents</CardTitle>
                        <Star className="h-5 w-5 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{parentStats.vipParents}</div>
                        <div className="text-sm text-purple-600 font-medium">Premium tier</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Satisfaction Score</CardTitle>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{parentStats.satisfactionScore}/5.0</div>
                        <div className="text-sm text-green-600 font-medium">Average rating</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Avg Spend</CardTitle>
                        <CreditCard className="h-5 w-5 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">HK${parentStats.averageSpend}</div>
                        <div className="text-sm text-orange-600 font-medium">Per parent</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <div className="flex items-center gap-4">
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                    {['all', 'active', 'inactive', 'vip'].map((filter) => (
                        <button id={`admin-parents-filter-${filter}-btn`}
                            key={filter}
                            onClick={() => setSelectedFilter(filter as any)}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${selectedFilter === filter
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                        id="admin-parents-search-input"
                        type="text"
                        placeholder="Search parents..."
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Parent Accounts List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        Parent Accounts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredParents.map((parent, index) => (
                            <motion.div
                                key={parent.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {parent.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{parent.name}</h4>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail className="w-4 h-4" />
                                                {parent.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone className="w-4 h-4" />
                                                {parent.phone}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={getStatusColor(parent.status)}>
                                            {parent.status}
                                        </Badge>
                                        <Badge className={getTierColor(parent.tier)}>
                                            {parent.tier}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="p-3 bg-white rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Baby className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm font-medium text-gray-900">Children</span>
                                        </div>
                                        <div className="space-y-1">
                                            {parent.children.map((child, idx) => (
                                                <div key={idx} className="text-sm">
                                                    <span className="font-medium">{child.name}</span>
                                                    <span className="text-gray-600"> ({child.age}y) - {child.program}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-3 bg-white rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CreditCard className="w-4 h-4 text-green-600" />
                                            <span className="text-sm font-medium text-gray-900">Financial</span>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <div>Total Spend: <span className="font-medium">HK${parent.totalSpend.toLocaleString()}</span></div>
                                            <div>Last Payment: <span className="font-medium">{parent.lastPayment}</span></div>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-white rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Star className="w-4 h-4 text-yellow-600" />
                                            <span className="text-sm font-medium text-gray-900">Engagement</span>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <div>Satisfaction: <span className="font-medium">{parent.satisfactionScore}/5.0</span></div>
                                            <div>Referrals: <span className="font-medium">{parent.referrals}</span></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4" />
                                        {parent.location}
                                        <Calendar className="w-4 h-4 ml-2" />
                                        Joined {parent.joinDate}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button id={`admin-parents-message-${parent.id}-btn`} variant="outline" size="sm">
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Message
                                        </Button>
                                        <Button id={`admin-parents-view-${parent.id}-btn`} variant="outline" size="sm">
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Profile
                                        </Button>
                                    </div>
                                </div>

                                {parent.notes && (
                                    <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                                        <span className="font-medium text-blue-900">Notes: </span>
                                        <span className="text-blue-700">{parent.notes}</span>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Engagement Metrics & Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Engagement by Location */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-green-600" />
                            Parent Engagement by Location
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {engagementMetrics.map((location, index) => (
                                <motion.div
                                    key={location.location}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-gray-900">{location.location}</h4>
                                        <div className="text-sm text-gray-600">
                                            {location.activeParents}/{location.totalParents} active
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-600">VIP:</span>
                                            <span className="ml-1 font-medium">{location.vipParents}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Satisfaction:</span>
                                            <span className="ml-1 font-medium">{location.avgSatisfaction}/5</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Avg Spend:</span>
                                            <span className="ml-1 font-medium">HK${location.avgSpend}</span>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">Retention Rate:</span>
                                            <span className="font-medium">{location.retentionRate}%</span>
                                        </div>
                                        <Progress value={location.retentionRate} className="h-2" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activities */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                            Recent Parent Activities
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentActivities.map((activity, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">{activity.parentName}</div>
                                        <div className="text-sm text-gray-600">{activity.activity}</div>
                                    </div>
                                    <div className="text-xs text-gray-500">{activity.timestamp}</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Communication Preferences */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-3">Communication Preferences</h4>
                            <div className="space-y-2">
                                {Object.entries(communicationPrefs).map(([method, percentage]) => (
                                    <div key={method} className="flex items-center justify-between">
                                        <span className="text-sm text-blue-700 capitalize">{method}</span>
                                        <div className="flex items-center gap-2">
                                            <Progress value={percentage} className="w-20 h-2" />
                                            <span className="text-sm font-medium text-blue-900">{percentage}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>)
}

export default ParentAccountsPage
