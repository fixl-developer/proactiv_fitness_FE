'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Users, Shield, UserCheck, Settings, Plus, Edit, Eye, MoreHorizontal,
    Search, Filter, Mail, Phone, MapPin, Calendar, Clock, Star,
    AlertCircle, CheckCircle, Activity, Award, Lock, Unlock,
    UserPlus, UserMinus, Key, Database, FileText
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const UsersRolesPage = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRole, setFilterRole] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [activeTab, setActiveTab] = useState('users')

    // Comprehensive user data with location-based permissions
    const users = [
        {
            id: 'admin-001',
            name: 'Sarah Chen',
            email: 'sarah.chen@proactivsports.net',
            phone: '+852 9123 4567',
            role: 'Super Admin',
            status: 'active',
            locations: ['All Locations'],
            permissions: ['all'],
            lastLogin: '2024-01-15 09:30',
            createdAt: '2019-03-01',
            avatar: '/avatars/sarah.jpg',
            department: 'Management',
            employeeId: 'EMP001',
            loginCount: 1247,
            failedLogins: 0,
            twoFactorEnabled: true,
            sessionActive: true
        },
        {
            id: 'admin-002',
            name: 'Monica Rossi',
            email: 'monica@proactivsports.net',
            phone: '+852 9234 5678',
            role: 'Business Owner',
            status: 'active',
            locations: ['All Locations'],
            permissions: ['business_analytics', 'financial_reports', 'staff_management'],
            lastLogin: '2024-01-15 08:15',
            createdAt: '2019-03-01',
            avatar: '/avatars/monica.jpg',
            department: 'Operations',
            employeeId: 'EMP002',
            loginCount: 892,
            failedLogins: 1,
            twoFactorEnabled: true,
            sessionActive: true
        },
        {
            id: 'manager-001',
            name: 'Lisa Zhang',
            email: 'lisa.zhang@proactivsports.net',
            phone: '+852 9345 6789',
            role: 'Location Manager',
            status: 'active',
            locations: ['ProGym Cyberport'],
            permissions: ['location_management', 'staff_scheduling', 'student_management'],
            lastLogin: '2024-01-15 07:45',
            createdAt: '2020-01-15',
            avatar: '/avatars/lisa.jpg',
            department: 'Operations',
            employeeId: 'EMP003',
            loginCount: 654,
            failedLogins: 0,
            twoFactorEnabled: false,
            sessionActive: true
        },
        {
            id: 'manager-002',
            name: 'Mike Wong',
            email: 'mike.wong@proactivsports.net',
            phone: '+852 9456 7890',
            role: 'Location Manager',
            status: 'active',
            locations: ['ProGym Wan Chai'],
            permissions: ['location_management', 'staff_scheduling', 'student_management'],
            lastLogin: '2024-01-14 18:30',
            createdAt: '2020-03-20',
            avatar: '/avatars/mike.jpg',
            department: 'Operations',
            employeeId: 'EMP004',
            loginCount: 432,
            failedLogins: 2,
            twoFactorEnabled: true,
            sessionActive: false
        },
        {
            id: 'coach-001',
            name: 'Juan Martinez',
            email: 'juan@proactivsports.net',
            phone: '+852 9567 8901',
            role: 'Coach',
            status: 'active',
            locations: ['ProGym Cyberport', 'ProGym Wan Chai'],
            permissions: ['class_management', 'student_progress'],
            lastLogin: '2024-01-15 06:00',
            createdAt: '2020-06-10',
            avatar: '/avatars/juan.jpg',
            department: 'Coaching',
            employeeId: 'EMP005',
            loginCount: 298,
            failedLogins: 0,
            twoFactorEnabled: false,
            sessionActive: true
        },
        {
            id: 'coach-002',
            name: 'Sami Al-Hassan',
            email: 'sami@proactivsports.net',
            phone: '+852 9678 9012',
            role: 'Coach',
            status: 'active',
            locations: ['International Montessori School'],
            permissions: ['class_management', 'student_progress'],
            lastLogin: '2024-01-15 08:00',
            createdAt: '2021-01-05',
            avatar: '/avatars/sami.jpg',
            department: 'Coaching',
            employeeId: 'EMP006',
            loginCount: 187,
            failedLogins: 1,
            twoFactorEnabled: false,
            sessionActive: true
        },
        {
            id: 'support-001',
            name: 'Joanna Lee',
            email: 'joanna@proactivsports.net',
            phone: '+852 9789 0123',
            role: 'Support Staff',
            status: 'active',
            locations: ['All Locations'],
            permissions: ['customer_support', 'booking_management'],
            lastLogin: '2024-01-15 09:00',
            createdAt: '2019-08-15',
            avatar: '/avatars/joanna.jpg',
            department: 'Customer Service',
            employeeId: 'EMP007',
            loginCount: 756,
            failedLogins: 0,
            twoFactorEnabled: true,
            sessionActive: true
        },
        {
            id: 'finance-001',
            name: 'David Kim',
            email: 'david.kim@proactivsports.net',
            phone: '+852 9890 1234',
            role: 'Finance',
            status: 'active',
            locations: ['All Locations'],
            permissions: ['financial_reports', 'payment_processing', 'invoice_management'],
            lastLogin: '2024-01-15 08:30',
            createdAt: '2020-11-01',
            avatar: '/avatars/david.jpg',
            department: 'Finance',
            employeeId: 'EMP008',
            loginCount: 423,
            failedLogins: 0,
            twoFactorEnabled: true,
            sessionActive: true
        }
    ]

    // Role definitions with permissions
    const roles = [
        {
            id: 'super-admin',
            name: 'Super Admin',
            description: 'Full system access across all locations and business units',
            userCount: 1,
            permissions: [
                'all_locations_access',
                'user_management',
                'role_management',
                'system_settings',
                'financial_reports',
                'business_analytics',
                'audit_logs',
                'ai_sop_management'
            ],
            locationAccess: 'All Locations',
            color: 'text-red-600 bg-red-50 border-red-200'
        },
        {
            id: 'business-owner',
            name: 'Business Owner',
            description: 'Business oversight and strategic management access',
            userCount: 1,
            permissions: [
                'all_locations_access',
                'business_analytics',
                'financial_reports',
                'staff_management',
                'performance_reports'
            ],
            locationAccess: 'All Locations',
            color: 'text-purple-600 bg-purple-50 border-purple-200'
        },
        {
            id: 'location-manager',
            name: 'Location Manager',
            description: 'Manage specific outlet operations and staff',
            userCount: 2,
            permissions: [
                'assigned_location_access',
                'staff_scheduling',
                'student_management',
                'location_reports',
                'class_management'
            ],
            locationAccess: 'Assigned Outlets Only',
            color: 'text-blue-600 bg-blue-50 border-blue-200'
        },
        {
            id: 'coach',
            name: 'Coach',
            description: 'Manage assigned classes and student progress',
            userCount: 2,
            permissions: [
                'assigned_classes_access',
                'student_progress',
                'class_management',
                'attendance_tracking'
            ],
            locationAccess: 'Assigned Classes Only',
            color: 'text-green-600 bg-green-50 border-green-200'
        },
        {
            id: 'support-staff',
            name: 'Support Staff',
            description: 'Customer service and booking management',
            userCount: 1,
            permissions: [
                'customer_support',
                'booking_management',
                'basic_reports',
                'communication_tools'
            ],
            locationAccess: 'All Locations (Limited)',
            color: 'text-orange-600 bg-orange-50 border-orange-200'
        },
        {
            id: 'finance',
            name: 'Finance',
            description: 'Financial operations and payment processing',
            userCount: 1,
            permissions: [
                'financial_reports',
                'payment_processing',
                'invoice_management',
                'revenue_analytics'
            ],
            locationAccess: 'All Locations (Finance Only)',
            color: 'text-teal-600 bg-teal-50 border-teal-200'
        }
    ]

    const getStatusColor = (status: string) => {
        const colors = {
            'active': 'text-green-600 bg-green-50 border-green-200',
            'inactive': 'text-gray-600 bg-gray-50 border-gray-200',
            'suspended': 'text-red-600 bg-red-50 border-red-200',
            'pending': 'text-yellow-600 bg-yellow-50 border-yellow-200'
        }
        return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200'
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />
            case 'inactive': return <Activity className="w-4 h-4 text-gray-600" />
            case 'suspended': return <AlertCircle className="w-4 h-4 text-red-600" />
            default: return <Clock className="w-4 h-4 text-yellow-600" />
        }
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = filterRole === 'all' || user.role === filterRole
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus
        return matchesSearch && matchesRole && matchesStatus
    })

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Users & Roles Management</h1>
                    <p className="text-gray-600 mt-1">
                        Manage user accounts, roles, and location-based permissions
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        Export Users
                    </Button>
                    <Button>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add User
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
                    <TabsTrigger value="security">Security & Audit</TabsTrigger>
                </TabsList>

                {/* Users Tab */}
                <TabsContent value="users" className="space-y-6">
                    {/* Filters */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            placeholder="Search users by name, email, or employee ID..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <Select value={filterRole} onValueChange={setFilterRole}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Filter by Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="Super Admin">Super Admin</SelectItem>
                                        <SelectItem value="Business Owner">Business Owner</SelectItem>
                                        <SelectItem value="Location Manager">Location Manager</SelectItem>
                                        <SelectItem value="Coach">Coach</SelectItem>
                                        <SelectItem value="Support Staff">Support Staff</SelectItem>
                                        <SelectItem value="Finance">Finance</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Filter by Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Users Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>User Accounts ({filteredUsers.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Locations</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Last Login</TableHead>
                                            <TableHead>Security</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.map((user, index) => (
                                            <motion.tr
                                                key={user.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="hover:bg-gray-50"
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                            {user.name.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{user.name}</p>
                                                            <p className="text-sm text-gray-500">{user.email}</p>
                                                            <p className="text-xs text-gray-400">{user.employeeId}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-medium">
                                                        {user.role}
                                                    </Badge>
                                                    <p className="text-xs text-gray-500 mt-1">{user.department}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        {user.locations.map((location, idx) => (
                                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                                {location}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={getStatusColor(user.status)}>
                                                            {getStatusIcon(user.status)}
                                                            <span className="ml-1">{user.status}</span>
                                                        </Badge>
                                                        {user.sessionActive && (
                                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Active Session" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <p className="text-sm">{user.lastLogin}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {user.loginCount} total logins
                                                    </p>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {user.twoFactorEnabled ? (
                                                            <Lock className="w-4 h-4 text-green-600" title="2FA Enabled" />
                                                        ) : (
                                                            <Unlock className="w-4 h-4 text-orange-600" title="2FA Disabled" />
                                                        )}
                                                        {user.failedLogins > 0 && (
                                                            <Badge variant="destructive" className="text-xs">
                                                                {user.failedLogins} failed
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuItem>
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View Profile
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                Edit User
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Key className="w-4 h-4 mr-2" />
                                                                Reset Password
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Settings className="w-4 h-4 mr-2" />
                                                                Permissions
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Roles Tab */}
                <TabsContent value="roles" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {roles.map((role, index) => (
                            <motion.div
                                key={role.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                                    <Shield className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base">{role.name}</CardTitle>
                                                    <p className="text-sm text-gray-600">{role.userCount} users</p>
                                                </div>
                                            </div>
                                            <Badge className={role.color}>
                                                {role.locationAccess}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600 mb-4">{role.description}</p>

                                        <div className="space-y-3">
                                            <h4 className="font-semibold text-gray-900">Permissions:</h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                {role.permissions.map((permission, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                                        <CheckCircle className="w-3 h-3 text-green-600" />
                                                        <span className="text-gray-700">
                                                            {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <Button variant="outline" size="sm">
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit Role
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    <Users className="w-4 h-4 mr-2" />
                                                    View Users
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Security Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Security Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-green-600" />
                                            <span className="text-sm font-medium">2FA Enabled</span>
                                        </div>
                                        <span className="text-sm font-bold text-green-600">
                                            {users.filter(u => u.twoFactorEnabled).length}/{users.length}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm font-medium">Active Sessions</span>
                                        </div>
                                        <span className="text-sm font-bold text-blue-600">
                                            {users.filter(u => u.sessionActive).length}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-orange-600" />
                                            <span className="text-sm font-medium">Failed Logins (24h)</span>
                                        </div>
                                        <span className="text-sm font-bold text-orange-600">
                                            {users.reduce((sum, u) => sum + u.failedLogins, 0)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Security Events</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[
                                        { type: 'login', user: 'Sarah Chen', time: '2 minutes ago', status: 'success' },
                                        { type: 'password_reset', user: 'Mike Wong', time: '1 hour ago', status: 'success' },
                                        { type: 'failed_login', user: 'Unknown', time: '3 hours ago', status: 'failed' },
                                        { type: '2fa_enabled', user: 'Lisa Zhang', time: '1 day ago', status: 'success' }
                                    ].map((event, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                {event.status === 'success' ? (
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {event.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{event.user}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500">{event.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default UsersRolesPage
