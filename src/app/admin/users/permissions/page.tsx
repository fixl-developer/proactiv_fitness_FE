'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Shield, Lock, Key, Users, Settings, Search, Filter,
    CheckCircle, XCircle, AlertTriangle, Eye, Edit, Plus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { responsiveClasses } from '@/lib/responsiveClasses'

const PermissionsPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedRole, setSelectedRole] = useState('all')

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 1000)
    }, [])

    // Permission matrix data
    const permissions = [
        {
            id: 1,
            name: 'User Management',
            key: 'user_management',
            category: 'System Administration',
            description: 'Create, edit, delete, and manage user accounts',
            riskLevel: 'high',
            roles: ['Super Admin', 'Business Owner'],
            actions: ['create', 'read', 'update', 'delete'],
            resources: ['users', 'profiles', 'authentication']
        },
        {
            id: 2,
            name: 'Role Management',
            key: 'role_management',
            category: 'System Administration',
            description: 'Manage roles and assign permissions',
            riskLevel: 'critical',
            roles: ['Super Admin'],
            actions: ['create', 'read', 'update', 'delete'],
            resources: ['roles', 'permissions']
        },
        {
            id: 3,
            name: 'Financial Data Access',
            key: 'financial_data',
            category: 'Financial',
            description: 'Access all financial information and reports',
            riskLevel: 'high',
            roles: ['Super Admin', 'Business Owner', 'Finance Staff'],
            actions: ['read', 'export'],
            resources: ['revenue', 'payments', 'invoices', 'refunds']
        },
        {
            id: 4,
            name: 'Location Management',
            key: 'location_management',
            category: 'Business Operations',
            description: 'Manage all locations and their settings',
            riskLevel: 'medium',
            roles: ['Super Admin', 'Business Owner'],
            actions: ['create', 'read', 'update', 'delete'],
            resources: ['locations', 'outlets', 'facilities']
        },
        {
            id: 5,
            name: 'Coach Management',
            key: 'coach_management',
            category: 'Business Operations',
            description: 'Hire, manage, and schedule coaches',
            riskLevel: 'medium',
            roles: ['Super Admin', 'Business Owner', 'Location Manager'],
            actions: ['create', 'read', 'update', 'schedule'],
            resources: ['coaches', 'schedules', 'assignments']
        },
        {
            id: 6,
            name: 'Student Management',
            key: 'student_management',
            category: 'Business Operations',
            description: 'Manage student records and progress',
            riskLevel: 'medium',
            roles: ['Super Admin', 'Business Owner', 'Location Manager', 'Coach'],
            actions: ['create', 'read', 'update'],
            resources: ['students', 'progress', 'assessments']
        },
        {
            id: 7,
            name: 'Payment Processing',
            key: 'payment_processing',
            category: 'Financial',
            description: 'Process payments and handle refunds',
            riskLevel: 'high',
            roles: ['Super Admin', 'Finance Staff'],
            actions: ['process', 'refund', 'void'],
            resources: ['payments', 'transactions', 'gateways']
        },
        {
            id: 8,
            name: 'Class Management',
            key: 'class_management',
            category: 'Teaching & Classes',
            description: 'Create and manage class schedules',
            riskLevel: 'low',
            roles: ['Super Admin', 'Location Manager', 'Coach'],
            actions: ['create', 'read', 'update', 'cancel'],
            resources: ['classes', 'schedules', 'bookings']
        },
        {
            id: 9,
            name: 'Attendance Marking',
            key: 'attendance_marking',
            category: 'Teaching & Classes',
            description: 'Mark and track student attendance',
            riskLevel: 'low',
            roles: ['Location Manager', 'Coach'],
            actions: ['mark', 'update', 'view'],
            resources: ['attendance', 'records']
        },
        {
            id: 10,
            name: 'System Settings',
            key: 'system_settings',
            category: 'System Administration',
            description: 'Configure system-wide settings and preferences',
            riskLevel: 'critical',
            roles: ['Super Admin'],
            actions: ['read', 'update', 'configure'],
            resources: ['settings', 'configurations', 'integrations']
        },
        {
            id: 11,
            name: 'Audit Logs',
            key: 'audit_logs',
            category: 'System Administration',
            description: 'View system audit trails and security logs',
            riskLevel: 'medium',
            roles: ['Super Admin', 'Business Owner'],
            actions: ['read', 'export'],
            resources: ['logs', 'audit_trail', 'security_events']
        },
        {
            id: 12,
            name: 'Customer Support',
            key: 'customer_support',
            category: 'Customer Service',
            description: 'Handle customer inquiries and support tickets',
            riskLevel: 'low',
            roles: ['Support Staff', 'Location Manager'],
            actions: ['read', 'respond', 'escalate'],
            resources: ['tickets', 'communications', 'customer_data']
        }
    ]

    const categories = ['all', 'System Administration', 'Business Operations', 'Financial', 'Teaching & Classes', 'Customer Service']
    const roles = ['all', 'Super Admin', 'Business Owner', 'Location Manager', 'Coach', 'Finance Staff', 'Support Staff']

    const filteredPermissions = permissions.filter(permission => {
        const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            permission.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || permission.category === selectedCategory
        const matchesRole = selectedRole === 'all' || permission.roles.includes(selectedRole)
        return matchesSearch && matchesCategory && matchesRole
    })

    const getRiskColor = (riskLevel: string) => {
        const colors = {
            critical: 'bg-red-100 text-red-700 border-red-200',
            high: 'bg-orange-100 text-orange-700 border-orange-200',
            medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            low: 'bg-green-100 text-green-700 border-green-200'
        }
        return colors[riskLevel as keyof typeof colors] || colors.low
    }

    const getRiskIcon = (riskLevel: string) => {
        switch (riskLevel) {
            case 'critical': return <AlertTriangle className="w-4 h-4" />
            case 'high': return <XCircle className="w-4 h-4" />
            case 'medium': return <Eye className="w-4 h-4" />
            case 'low': return <CheckCircle className="w-4 h-4" />
            default: return <CheckCircle className="w-4 h-4" />
        }
    }

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4 sm:space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={responsiveClasses.pageContainer}>
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Permission Management</h1>
                    <p className="text-gray-600 mt-2">Manage system permissions and access control</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Permission
                </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Permissions</p>
                                <p className="text-2xl font-bold text-gray-900">{permissions.length}</p>
                            </div>
                            <Key className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Critical Risk</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {permissions.filter(p => p.riskLevel === 'critical').length}
                                </p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">High Risk</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {permissions.filter(p => p.riskLevel === 'high').length}
                                </p>
                            </div>
                            <XCircle className="w-8 h-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Categories</p>
                                <p className="text-2xl font-bold text-gray-900">{categories.length - 1}</p>
                            </div>
                            <Shield className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search permissions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category === 'all' ? 'All Categories' : category}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {roles.map(role => (
                                    <option key={role} value={role}>
                                        {role === 'all' ? 'All Roles' : role}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Permissions List */}
            <div className="space-y-4">
                {filteredPermissions.map((permission, index) => (
                    <motion.div
                        key={permission.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Lock className="w-5 h-5 text-gray-600" />
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {permission.name}
                                            </h3>
                                            <Badge className={getRiskColor(permission.riskLevel)}>
                                                <div className="flex items-center gap-1">
                                                    {getRiskIcon(permission.riskLevel)}
                                                    {permission.riskLevel}
                                                </div>
                                            </Badge>
                                            <Badge variant="outline">
                                                {permission.category}
                                            </Badge>
                                        </div>

                                        <p className="text-gray-600 mb-4">{permission.description}</p>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Assigned Roles */}
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 mb-2">ASSIGNED ROLES</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {permission.roles.map(role => (
                                                        <Badge key={role} variant="secondary" className="text-xs">
                                                            {role}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 mb-2">ACTIONS</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {permission.actions.map(action => (
                                                        <Badge key={action} variant="outline" className="text-xs">
                                                            {action}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Resources */}
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 mb-2">RESOURCES</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {permission.resources.slice(0, 3).map(resource => (
                                                        <Badge key={resource} variant="outline" className="text-xs">
                                                            {resource}
                                                        </Badge>
                                                    ))}
                                                    {permission.resources.length > 3 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{permission.resources.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        <Button variant="outline" size="sm">
                                            <Eye className="w-4 h-4 mr-2" />
                                            View
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* No Results */}
            {filteredPermissions.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No permissions found</h3>
                        <p className="text-gray-600 mb-4">
                            Try adjusting your search criteria or create a new permission.
                        </p>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Permission
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default PermissionsPage
