'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Building2, Users, TrendingUp, DollarSign,
    Plus, Edit, Eye, MoreHorizontal, Target,
    ArrowUp, ArrowDown, CheckCircle, AlertCircle,
    Activity, Award, Calendar, RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { responsiveClasses } from '@/lib/responsiveClasses'

const BusinessUnitsPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null)

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

    // Business Units Data
    const businessUnits = [
        {
            id: 'gym-locations',
            name: 'Gym Locations',
            type: 'Physical Fitness Centers',
            outlets: 8,
            activeTerms: 3,
            revenue: 1425000,
            monthlyRevenue: 237500,
            growth: 15.2,
            conversion: 72.5,
            utilization: 85,
            status: 'excellent',
            manager: 'Lisa Wong',
            established: '2018',
            kpis: {
                students: 1850,
                classes: 156,
                coaches: 24,
                avgRating: 4.8,
                retention: 89.2
            },
            outlets_list: [
                { name: 'ProGym Cyberport', students: 310, revenue: 52000, status: 'excellent' },
                { name: 'ProGym Wan Chai', students: 280, revenue: 48000, status: 'excellent' },
                { name: 'ProGym Causeway Bay', students: 265, revenue: 45000, status: 'good' },
                { name: 'ProGym Tsim Sha Tsui', students: 245, revenue: 42000, status: 'good' }
            ]
        },
        {
            id: 'school-programs',
            name: 'School Programs',
            type: 'Educational Partnerships',
            outlets: 12,
            activeTerms: 2,
            revenue: 998000,
            monthlyRevenue: 166300,
            growth: 22.8,
            conversion: 68.2,
            utilization: 92,
            status: 'excellent',
            manager: 'Lisa Zhang',
            established: '2020',
            kpis: {
                students: 1200,
                classes: 89,
                coaches: 18,
                avgRating: 4.9,
                retention: 94.5
            },
            outlets_list: [
                { name: 'International Montessori School', students: 180, revenue: 28000, status: 'excellent' },
                { name: 'Kellett School', students: 150, revenue: 24000, status: 'excellent' },
                { name: 'Canadian International School', students: 165, revenue: 26000, status: 'good' },
                { name: 'Shrewsbury International', students: 140, revenue: 22000, status: 'good' }
            ]
        },
        {
            id: 'partner-gyms',
            name: 'Partner Gyms',
            type: 'Strategic Partnerships',
            outlets: 6,
            activeTerms: 2,
            revenue: 327000,
            monthlyRevenue: 54500,
            growth: 8.5,
            conversion: 58.9,
            utilization: 76,
            status: 'good',
            manager: 'Mike Wong',
            established: '2021',
            kpis: {
                students: 280,
                classes: 32,
                coaches: 8,
                avgRating: 4.6,
                retention: 78.3
            },
            outlets_list: [
                { name: 'Montessori Pok Fu Lam', students: 85, revenue: 12000, status: 'good' },
                { name: 'Wycombe Abbey', students: 65, revenue: 9500, status: 'needs-attention' },
                { name: 'Malvern College', students: 70, revenue: 10500, status: 'good' }
            ]
        },
        {
            id: 'camps-events',
            name: 'Camps & Events',
            type: 'Seasonal Programs',
            outlets: 4,
            activeTerms: 1,
            revenue: 180000,
            monthlyRevenue: 30000,
            growth: -5.2,
            conversion: 45.3,
            utilization: 65,
            status: 'needs-attention',
            manager: 'Alex Johnson',
            established: '2018',
            kpis: {
                students: 120,
                classes: 18,
                coaches: 6,
                avgRating: 4.7,
                retention: 65.8
            },
            outlets_list: [
                { name: 'Summer Gymnastics Camp', students: 45, revenue: 8500, status: 'good' },
                { name: 'Holiday Multi-Activity Camp', students: 35, revenue: 6500, status: 'needs-attention' },
                { name: 'Birthday Party Programs', students: 25, revenue: 4500, status: 'needs-attention' }
            ]
        }
    ]

    const getStatusColor = (status: string) => {
        const colors = {
            'excellent': 'text-green-600 bg-green-50 border-green-200',
            'good': 'text-blue-600 bg-blue-50 border-blue-200',
            'needs-attention': 'text-orange-600 bg-orange-50 border-orange-200',
            'critical': 'text-red-600 bg-red-50 border-red-200'
        }
        return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200'
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'excellent': return <CheckCircle className="w-4 h-4 text-green-600" />
            case 'good': return <Activity className="w-4 h-4 text-blue-600" />
            case 'needs-attention': return <AlertCircle className="w-4 h-4 text-orange-600" />
            default: return <AlertCircle className="w-4 h-4 text-red-600" />
        }
    }

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4 sm:space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
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
                    <h1 className={responsiveClasses.headerTitle}>Business Units Management</h1>
                    <p className={responsiveClasses.headerSubtitle}>
                        Manage and monitor performance across all business units
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button id="admin-organization-business-units-btn" variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button id="admin-organization-business-units-btn-2" variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Reports
                    </Button>
                    <Button id="admin-organization-business-units-btn-3">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Business Unit
                    </Button>
                </div>
            </div>

            {/* Business Units Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {businessUnits.map((unit, index) => (
                    <motion.div
                        key={unit.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedUnit(unit.id)}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                            <Building2 className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{unit.name}</CardTitle>
                                            <p className="text-xs text-gray-500">{unit.type}</p>
                                        </div>
                                    </div>
                                    <Badge className={getStatusColor(unit.status)}>
                                        {getStatusIcon(unit.status)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-600">Revenue</p>
                                            <p className="text-sm font-bold text-green-600">
                                                HK${(unit.revenue / 1000).toFixed(0)}K
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Growth</p>
                                            <div className="flex items-center gap-1">
                                                {unit.growth > 0 ? (
                                                    <ArrowUp className="w-3 h-3 text-green-600" />
                                                ) : (
                                                    <ArrowDown className="w-3 h-3 text-red-600" />
                                                )}
                                                <p className={`text-sm font-bold ${unit.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {Math.abs(unit.growth)}%
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Students</p>
                                            <p className="text-sm font-bold">{unit.kpis.students}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Outlets</p>
                                            <p className="text-sm font-bold">{unit.outlets}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between text-xs mb-2">
                                            <span className="text-gray-600">Utilization</span>
                                            <span className="font-medium">{unit.utilization}%</span>
                                        </div>
                                        <Progress value={unit.utilization} className="h-2" />
                                    </div>

                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-600">Manager: {unit.manager}</span>
                                        <span className="text-gray-500">Est. {unit.established}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Detailed Business Unit Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Metrics */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Performance Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {businessUnits.map((unit, index) => (
                                <motion.div
                                    key={unit.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                <Building2 className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{unit.name}</h4>
                                                <p className="text-sm text-gray-600">{unit.outlets} outlets</p>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button id="admin-organization-business-units-btn-4" variant="ghost" size="sm">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem>
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit Unit
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="grid grid-cols-5 gap-4 mb-4">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-600">Revenue</p>
                                            <p className="text-sm font-bold text-green-600">
                                                HK${(unit.monthlyRevenue / 1000).toFixed(0)}K
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-600">Students</p>
                                            <p className="text-sm font-bold">{unit.kpis.students}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-600">Conversion</p>
                                            <p className="text-sm font-bold text-blue-600">{unit.conversion}%</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-600">Rating</p>
                                            <p className="text-sm font-bold text-yellow-600">{unit.kpis.avgRating}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-600">Retention</p>
                                            <p className="text-sm font-bold text-purple-600">{unit.kpis.retention}%</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs mb-2">
                                        <span className="text-gray-600">Utilization</span>
                                        <span className="font-medium">{unit.utilization}%</span>
                                    </div>
                                    <Progress value={unit.utilization} className="h-2" />
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Key Insights */}
                <Card>
                    <CardHeader>
                        <CardTitle>Key Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-900">Top Performer</span>
                                </div>
                                <p className="text-xs text-green-800">
                                    School Programs showing 22.8% growth with highest retention rate (94.5%)
                                </p>
                            </div>

                            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-4 h-4 text-orange-600" />
                                    <span className="text-sm font-medium text-orange-900">Needs Attention</span>
                                </div>
                                <p className="text-xs text-orange-800">
                                    Camps & Events showing -5.2% decline. Consider seasonal strategy review.
                                </p>
                            </div>

                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-900">Opportunity</span>
                                </div>
                                <p className="text-xs text-blue-800">
                                    Partner Gyms have room for growth. Current utilization at 76%.
                                </p>
                            </div>

                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Award className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm font-medium text-purple-900">Excellence</span>
                                </div>
                                <p className="text-xs text-purple-800">
                                    Gym Locations maintaining 85% utilization with strong revenue growth.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                            <div className="space-y-2">
                                <Button id="admin-organization-business-units-btn-5" variant="outline" size="sm" className="w-full justify-start">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add New Business Unit
                                </Button>
                                <Button id="admin-organization-business-units-btn-6" variant="outline" size="sm" className="w-full justify-start">
                                    <Eye className="w-4 h-4 mr-2" />
                                    Generate Performance Report
                                </Button>
                                <Button id="admin-organization-business-units-btn-7" variant="outline" size="sm" className="w-full justify-start">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Schedule Review Meeting
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Business Unit Summary Stats */}
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Business Unit Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">4</div>
                            <div className="text-sm text-gray-600">Business Units</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">30</div>
                            <div className="text-sm text-gray-600">Total Outlets</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">3,450</div>
                            <div className="text-sm text-gray-600">Total Students</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">HK$2.9M</div>
                            <div className="text-sm text-gray-600">Total Revenue</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default BusinessUnitsPage
