'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Edit2, Trash2, Eye, Users, Mail, Phone, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { HQAdminService, SystemUser } from '@/services/hqAdminService'

export default function SystemUsersPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRole, setFilterRole] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [users, setUsers] = useState<SystemUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        fetchUsers()
    }, [page, searchTerm, filterRole, filterStatus])

    const fetchUsers = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await HQAdminService.getUsers(
                page,
                10,
                searchTerm || undefined,
                filterRole !== 'all' ? filterRole : undefined,
                filterStatus !== 'all' ? filterStatus : undefined
            )
            setUsers(response.data)
            setTotalPages(response.totalPages)
        } catch (err: any) {
            console.error('Error fetching users:', err)
            setError(err.message || 'Failed to fetch users')
            // Fallback to mock data for development
            setUsers([
                {
                    id: '1',
                    name: 'Admin User',
                    email: 'admin@proactiv.com',
                    phone: '+1 (212) 555-0101',
                    role: 'SUPER_ADMIN',
                    status: 'ACTIVE',
                    lastLogin: '2 hours ago',
                    createdAt: '2024-01-15'
                },
                {
                    id: '2',
                    name: 'NYC Manager',
                    email: 'manager@nyc.proactiv.com',
                    phone: '+1 (212) 555-0102',
                    role: 'FRANCHISE_MANAGER',
                    status: 'ACTIVE',
                    lastLogin: '30 min ago',
                    createdAt: '2024-02-20'
                },
                {
                    id: '3',
                    name: 'Boston Coach',
                    email: 'coach@boston.proactiv.com',
                    phone: '+1 (617) 555-0103',
                    role: 'COACH',
                    status: 'ACTIVE',
                    lastLogin: '1 hour ago',
                    createdAt: '2024-03-10'
                },
                {
                    id: '4',
                    name: 'Support Staff',
                    email: 'support@proactiv.com',
                    phone: '+1 (212) 555-0104',
                    role: 'SUPPORT_STAFF',
                    status: 'ACTIVE',
                    lastLogin: '5 min ago',
                    createdAt: '2024-01-05'
                },
                {
                    id: '5',
                    name: 'Partner Admin',
                    email: 'partner@proactiv.com',
                    phone: '+1 (212) 555-0105',
                    role: 'PARTNER_ADMIN',
                    status: 'INACTIVE',
                    lastLogin: '2 weeks ago',
                    createdAt: '2024-02-01'
                },
                {
                    id: '6',
                    name: 'Regional Manager',
                    email: 'regional@proactiv.com',
                    phone: '+1 (617) 555-0106',
                    role: 'REGIONAL_ADMIN',
                    status: 'ACTIVE',
                    lastLogin: '3 hours ago',
                    createdAt: '2024-03-01'
                },
            ])
        } finally {
            setIsLoading(false)
        }
    }

    const roles = ['all', ...new Set(users.map(u => u.role))]

    const handleDeleteUser = async (userId: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                await HQAdminService.deleteUser(userId)
                fetchUsers()
            } catch (err: any) {
                alert('Failed to delete user: ' + err.message)
            }
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">System Users</h1>
                    <p className="text-gray-600 mt-1">Manage all system users and permissions</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    Add User
                </button>
            </div>

            {/* Search & Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {roles.map(role => (
                                <option key={role} value={role}>
                                    {role === 'all' ? 'All Roles' : role}
                                </option>
                            ))}
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardContent className="pt-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Login</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, idx) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-3 px-4">
                                            <p className="font-medium text-gray-900">{user.name}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm text-gray-600">{user.email}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant="outline">{user.role}</Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                {user.status === 'ACTIVE' ? (
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <AlertCircle className="w-4 h-4 text-gray-400" />
                                                )}
                                                <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                    {user.status}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm text-gray-600">{user.lastLogin || 'Never'}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-2">
                                                <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {users.length === 0 && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No users found</p>
                    </CardContent>
                </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {error && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-4">
                        <p className="text-sm text-yellow-800">
                            ⚠️ {error} - Showing mock data for development
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
