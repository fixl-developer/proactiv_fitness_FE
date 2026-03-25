'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Building2, MapPin, Users, TrendingUp,
    Settings, Plus, BarChart3, Target,
    ArrowRight, RefreshCw, Globe, Briefcase
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { responsiveClasses } from '@/lib/responsiveClasses'

const OrganizationManagementPage = () => {
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

    // Organization Metrics
    const orgMetrics = [
        {
            title: 'Business Units',
            value: '4',
            growth: 'Active',
            icon: Briefcase,
            color: 'text-blue-600',
            status: 'excellent'
        },
        {
            title: 'Total Outlets',
            value: '16',
            growth: '+2 this year',
            icon: Building2,
            color: 'text-green-600',
            status: 'excellent'
        },
        {
            title: 'Active Locations',
            value: '14',
            growth: '87.5% utilization',
            icon: MapPin,
            color: 'text-purple-600',
            status: 'excellent'
        },
        {
            title: 'Total Staff',
            value: '156',
            growth: '+12 this month',
            icon: Users,
            color: 'text-orange-600',
            status: 'excellent'
        }
    ]

    // Organization Structure
    const organizationStructure = [
        {
            name: 'Business Units',
            description: 'Manage business unit structure and hierarchy',
            count: 4,
            status: 'active',
            href: '/admin/organization/business-units'
        },
        {
            name: 'Outlets & Locations',
            description: 'Physical locations and outlet management',
            count: 16,
            status: 'active',
            href: '/admin/organization/outlets'
        }
    ]

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4 sm:space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
            <div className={responsiveClasses.headerContainer}>
                <div>
                    <h1 className={responsiveClasses.headerTitle}>Organization Management</h1>
                    <p className={responsiveClasses.headerSubtitle}>
                        Manage business units, outlets, and organizational structure
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Button id="admin-organization-btn" variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button id="admin-organization-btn-2">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Unit
                    </Button>
                </div>
            </div>

            {/* Organization Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {orgMetrics.map((metric, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}>
                        <Card className="relative overflow-hidden h-full hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">{metric.title}</CardTitle>
                                <metric.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${metric.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold text-gray-900">{metric.value}</div>
                                <div className="flex items-center mt-1">
                                    <TrendingUp className={`w-3 h-3 sm:w-4 sm:h-4 ${metric.color} mr-1`} />
                                    <span className={`text-xs sm:text-sm font-medium ${metric.color}`}>{metric.growth}</span>
                                </div>
                                <Progress value={85} className="mt-3 h-1 sm:h-2" />
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Organization Structure */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {organizationStructure.map((item, index) => (
                    <motion.div
                        key={item.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 * index }}
                    >
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = item.href}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Building2 className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{item.name}</CardTitle>
                                            <p className="text-sm text-gray-600">{item.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="default">
                                            {item.count} items
                                        </Badge>
                                        <ArrowRight className="w-4 h-4 text-gray-400" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <Button id="admin-organization-btn-3" variant="outline" size="sm">
                                        <BarChart3 className="w-4 h-4 mr-2" />
                                        View Details
                                    </Button>
                                    <Button id="admin-organization-btn-4" variant="outline" size="sm">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Configure
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Organization Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Organization Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <Globe className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <h3 className="font-semibold text-gray-900">Global Reach</h3>
                            <p className="text-sm text-gray-600">16 locations across Hong Kong</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <h3 className="font-semibold text-gray-900">Performance</h3>
                            <p className="text-sm text-gray-600">87.5% utilization rate</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                            <h3 className="font-semibold text-gray-900">Team Size</h3>
                            <p className="text-sm text-gray-600">156 staff members</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                            <h3 className="font-semibold text-gray-900">Growth</h3>
                            <p className="text-sm text-gray-600">18.5% year over year</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default OrganizationManagementPage
