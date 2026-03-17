'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Shield, Users, Settings, Plus, Search, Edit, Trash2, Eye,
    CheckCircle, XCircle, AlertTriangle, Crown, UserCheck, Lock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { responsiveClasses } from '@/lib/responsiveClasses'
const RolesPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 1000)
    }, [])

    // Mock roles data
    const roles = [
        {
            id: 1,
            name: 'Super Admin',
            description: 'Full system access with all permissions',
            userCount: 2,
            permissions: [
                'user_management', 'role_management', 'system_settings',
                'financial_data', 'audit_logs', 'location_management',
                'coach_management', 'student_management', 'payment_management'
            ],
            color: 'red',
            icon: Crown,
            createdDate: '2023-01-01',
            lastModified: '2024-01-15'
        },
        {
            id: 2,
            name: 'Business Owner',
            description: 'Business oversight with financial and operational access',
            userCount: 3,
            permissions: [
                'financial_data', 'location_management', 'coach_management',
                'student_management', 'payment_management', 'reports_analytics'
            ],
            color: 'purple',
            icon: Shield,
            createdDate: '2023-01-01',
            lastModified: '2024-01-10'
        },
        {
            id: 3,
            name: 'Location Manager',
            description: 'Single location management with operational control',
            userCount: 8,
            permissions: [
                'location_operations', 'coach_scheduling', 'student_management',
                'attendance_tracking', 'local_reports', 'customer_communication'
            ],
            color: 'blue',
            icon: UserCheck,
            createdDate: '2023-02-15',
            lastModified: '2024-01-08'
        },
        {
            id: 4,
            name: 'Coach',
            description: 'Class delivery and student interaction access',
            userCount: 24,
            permissions: [
                'class_management', 'attendance_marking', 'student_progress',
                'schedule_viewing', 'sop_access'
            ],
            color: 'green',
            icon: Users,
            createdDate: '2023-01-01',
            lastModified: '2023-12-20'
        },
        {
            id: 5,
            name: 'Finance Staff',
            description: 'Payment processing and financial reporting access',
            userCount: 4,
            permissions: [
                'payment_processing', 'invoice_management', 'financial_reports',
                'refund_processing', 'payment_gateway_access'
            ],
            color: 'yellow',
            icon: Lock,
            createdDate: '2023-03-01',
            lastModified: '2024-01-05'
        },
        {
            id: 6,
            name: 'Support Staff',
            description: 'Customer support and basic operational access',
            userCount: 6,
            permissions: [
                'customer_support', 'booking_assistance', 'basic_reports',
                'schedule_viewing', 'customer_communication'
            ],
            color: 'gray',
            icon: Settings,
            createdDate: '2023-04-01',
            lastModified: '2023-11-15'
        }
    ]

    // Permission categories and descriptions
    const permissionCategories = {
        'System Administration': [
            { key: 'user_management', name: 'User Management', description: 'Create, edit, delete users' },
            { key: 'role_management', name: 'Role Management', description: 'Manage roles and permissions' },
            { key: 'system_settings', name: 'System Settings', description: 'Configure system-wide settings' },
            { key: 'audit_logs', name: 'Audit Logs', description: 'View system audit trails' }
        ],
        'Business Operations': [
            { key: 'location_management', name: 'Location Management', description: 'Manage all locations' },
            { key: 'coach_management', name: 'Coach Management', description: 'Hire, manage coaches' },
            { key: 'student_management', name: 'Student Management', description: 'Manage student records' },
            { key: 'location_operations', name: 'Location Operations', description: 'Single location operations' }
        ],
        'Financial': [
            { key: 'financial_data', name: 'Financial Data', description: 'Access all financial information' },
            { key: 'payment_management', name: 'Payment Management', description: 'Process payments and refunds' },
            { key: 'payment_processing', name: 'Payment Processing', description: 'Handle payment transactions' },
            { key: 'invoice_management', name: 'Invoice Management', description: 'Create and manage invoices' }
        ],
        'Teaching & Classes': [
            { key: 'class_management', name: 'Class Management', description: 'Manage class schedules' },
            { key: 'attendance_marking', name: 'Attendance Marking', description: 'Mark student attendance' },
            { key: 'student_progress', name: 'Student Progress', description: 'Track student development' },
            { key: 'coach_scheduling', name: 'Coach Scheduling', description: 'Schedule coach assignments' }
        ],
        'Reports & Analytics': [
            { key: 'reports_analytics', name: 'Reports & Analytics', description: 'Access all reports' },
            { key: 'financial_reports', name: 'Financial Reports', description: 'View financial reports' },
            { key: 'local_reports', name: 'Local Reports', description: 'Location-specific reports' },
            { key: 'basic_reports', name: 'Basic Reports', description: 'Basic operational reports' }
        ],
        'Customer Service': [
            { key: 'customer_support', name: 'Customer Support', description: 'Handle customer inquiries' },
            { key: 'customer_communication', name: 'Customer Communication', description: 'Communicate with customers' },
            { key: 'booking_assistance', name: 'Booking Assistance', description: 'Help with bookings' }
        ],
        'General Access': [
            { key: 'schedule_viewing', name: 'Schedule Viewing', description: 'View schedules' },
            { key: 'sop_access', name: 'SOP Access', description: 'Access standard operating procedures' },
            { key: 'attendance_tracking', name: 'Attendance Tracking', description: 'Track attendance data' }
        ]
    }

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getColorClasses = (color: string) => {
        const colors = {
            red: 'bg-red-100 text-red-700 border-red-200',
            purple: 'bg-purple-100 text-purple-700 border-purple-200',
            blue: 'bg-blue-100 text-blue-700 border-blue-200',
            green: 'bg-green-100 text-green-700 border-green-200',
            yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            gray: 'bg-gray-100 text-gray-700 border-gray-200'
        }
        return colors[color as keyof typeof colors] || colors.gray
    }

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4 sm:space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
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
                    <h1 className={responsiveClasses.headerTitle}>Role Management</h1>
                    <p className={responsiveClasses.headerSubtitle}>Define roles and manage permissions across the system</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Role
                </Button>
            </div>

            {/* Summary Stats */}
            <div className={responsiveClasses.metricsGrid}>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Roles</p>
                                <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
                            </div>
                            <Shield className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {roles.reduce((sum, role) => sum + role.userCount, 0)}
                                </p>
                            </div>
                            <Users className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Admin Roles</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {roles.filter(r => r.name.includes('Admin') || r.name.includes('Owner')).length}
                                </p>
                            </div>
                            <Crown className="w-8 h-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Staff Roles</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {roles.filter(r => !r.name.includes('Admin') && !r.name.includes('Owner')).length}
                                </p>
                            </div>
                            <UserCheck className="w-8 h-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="p-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search roles by name or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRoles.map((role, index) => {
                    const IconComponent = role.icon
                    return (
                        <motion.div
                            key={role.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${getColorClasses(role.color)}`}>
                                                <IconComponent className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg font-semibold text-gray-900">
                                                    {role.name}
                                                </CardTitle>
                                                <Badge className={getColorClasses(role.color)}>
                                                    {role.userCount} users
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm">
                                            <Settings className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <p className="text-sm text-gray-600">{role.description}</p>

                                    {/* Permissions Preview */}
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-2">
                                            PERMISSIONS ({role.permissions.length})
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {role.permissions.slice(0, 4).map((permission) => (
                                                <Badge key={permission} variant="outline" className="text-xs">
                                                    {permission.replace('_', ' ')}
                                                </Badge>
                                            ))}
                                            {role.permissions.length > 4 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{role.permissions.length - 4} more
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Metadata */}
                                    <div className="text-xs text-gray-500 space-y-1">
                                        <p>Created: {role.createdDate}</p>
                                        <p>Modified: {role.lastModified}</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-2">
                                        <Button variant="outline" size="sm" className="flex-1">
                                            <Eye className="w-4 h-4 mr-2" />
                                            View
                                        </Button>
                                        <Button variant="outline" size="sm" className="flex-1">
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>

            {/* Permission Categories Reference */}
            <Card>
                <CardHeader>
                    <CardTitle>Permission Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(permissionCategories).map(([category, permissions]) => (
                            <div key={category} className="space-y-3">
                                <h4 className="font-semibold text-gray-900">{category}</h4>
                                <div className="space-y-2">
                                    {permissions.map((permission) => (
                                        <div key={permission.key} className="text-sm">
                                            <p className="font-medium text-gray-700">{permission.name}</p>
                                            <p className="text-gray-500 text-xs">{permission.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default RolesPage
