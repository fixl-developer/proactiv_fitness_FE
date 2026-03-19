'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Shield, Users, Edit, Trash2, Plus, Search, Filter,
    CheckCircle, XCircle, Settings, Eye, Lock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function RolesManagementPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRole, setSelectedRole] = useState<string | null>(null)

    const roles = [
        {
            id: '1',
            name: 'ADMIN',
            displayName: 'Super Admin',
            description: 'Full system access with all permissions',
            userCount: 3,
            permissions: ['*'],
            color: 'bg-red-100 text-red-800',
            status: 'active'
        },
        {
            id: '2',
            name: 'REGIONAL_ADMIN',
            displayName: 'Regional Admin',
            description: 'Manage multiple franchises in a region',
            userCount: 8,
            permissions: ['region:read', 'region:write', 'location:read', 'reports:read'],
            color: 'bg-orange-100 text-orange-800',
            status: 'active'
        },
        {
            id: '3',
            name: 'FRANCHISE_OWNER',
            displayName: 'Franchise Owner',
            description: 'Manage franchise operations and staff',
            userCount: 15,
            permissions: ['franchise:read', 'franchise:write', 'staff:manage', 'revenue:read'],
            color: 'bg-purple-100 text-purple-800',
            status: 'active'
        },
        {
            id: '4',
            name: 'LOCATION_MANAGER',
            displayName: 'Location Manager',
            description: 'Manage single location operations',
            userCount: 25,
            permissions: ['location:read', 'location:write', 'staff:read', 'booking:read'],
            color: 'bg-blue-100 text-blue-800',
            status: 'active'
        },
        {
            id: '5',
            name: 'COACH',
            displayName: 'Coach',
            description: 'Manage classes and student attendance',
            userCount: 45,
            permissions: ['session:read', 'session:write', 'attendance:read', 'attendance:write'],
            color: 'bg-green-100 text-green-800',
            status: 'active'
        },
        {
            id: '6',
            name: 'SUPPORT_STAFF',
            displayName: 'Support Staff',
            description: 'Handle customer support and inquiries',
            userCount: 12,
            permissions: ['ticket:read', 'ticket:write', 'user:read', 'inquiry:read'],
            color: 'bg-yellow-100 text-yellow-800',
            status: 'active'
        },
        {
            id: '7',
            name: 'PARTNER_ADMIN',
            displayName: 'Partner Admin',
            description: 'Manage partner integrations and commissions',
            userCount: 5,
            permissions: ['partner:read', 'partner:write', 'integration:read', 'commission:read'],
            color: 'bg-pink-100 text-pink-800',
            status: 'active'
        },
        {
            id: '8',
            name: 'PARENT',
            displayName: 'Parent',
            description: 'Book classes and manage children',
            userCount: 234,
            permissions: ['booking:read', 'booking:write', 'payment:read', 'child:manage'],
            color: 'bg-indigo-100 text-indigo-800',
            status: 'active'
        },
        {
            id: '9',
            name: 'USER',
            displayName: 'General User',
            description: 'Browse and book classes',
            userCount: 567,
            permissions: ['booking:read', 'booking:write', 'profile:read', 'profile:write'],
            color: 'bg-gray-100 text-gray-800',
            status: 'active'
        }
    ]

    const filteredRoles = roles.filter(role =>
        role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
                    <p className="text-gray-600 mt-1">Manage user roles and permissions</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Role
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Roles</p>
                                <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
                            </div>
                            <Shield className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {roles.reduce((sum, role) => sum + role.userCount, 0)}
                                </p>
                            </div>
                            <Users className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Roles</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {roles.filter(r => r.status === 'active').length}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Custom Roles</p>
                                <p className="text-2xl font-bold text-gray-900">0</p>
                            </div>
                            <Settings className="w-8 h-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search roles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <Button variant="outline">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRoles.map((role, index) => (
                    <motion.div
                        key={role.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <Badge className={role.color}>{role.displayName}</Badge>
                                        <p className="text-sm text-gray-600 mt-2">{role.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Users</span>
                                        <span className="font-semibold">{role.userCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Permissions</span>
                                        <span className="font-semibold">{role.permissions.length}</span>
                                    </div>
                                    <div className="pt-4 border-t">
                                        <p className="text-xs text-gray-500 mb-2">Key Permissions:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {role.permissions.slice(0, 3).map((perm, idx) => (
                                                <Badge key={idx} variant="outline" className="text-xs">
                                                    {perm}
                                                </Badge>
                                            ))}
                                            {role.permissions.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{role.permissions.length - 3} more
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
