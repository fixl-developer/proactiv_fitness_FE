'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Edit2, Trash2, Eye, Users, Mail, Phone, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default function FranchiseStaffPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRole, setFilterRole] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [staff, setStaff] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        fetchStaff()
    }, [page, searchTerm, filterRole, filterStatus])

    const fetchStaff = async () => {
        try {
            setIsLoading(true)
            setError(null)
            // Mock data for development
            setStaff([
                {
                    id: '1',
                    name: 'Sarah Johnson',
                    email: 'sarah@franchise.com',
                    phone: '+1 (212) 555-0101',
                    role: 'COACH',
                    location: 'Main Location',
                    status: 'ACTIVE',
                    utilization: 85,
                    satisfaction: 4.7,
                    createdAt: '2024-01-15'
                },
                {
                    id: '2',
                    name: 'Mike Chen',
                    email: 'mike@franchise.com',
                    phone: '+1 (212) 555-0102',
                    role: 'COACH',
                    location: 'Main Location',
                    status: 'ACTIVE',
                    utilization: 78,
                    satisfaction: 4.5,
                    createdAt: '2024-02-20'
                },
                {
                    id: '3',
                    name: 'Emma Davis',
                    email: 'emma@franchise.com',
                    phone: '+1 (212) 555-0103',
                    role: 'MANAGER',
                    location: 'Main Location',
                    status: 'ACTIVE',
                    utilization: 90,
                    satisfaction: 4.6,
                    createdAt: '2024-03-10'
                },
                {
                    id: '4',
                    name: 'James Wilson',
                    email: 'james@franchise.com',
                    phone: '+1 (212) 555-0104',
                    role: 'SUPPORT_STAFF',
                    location: 'Main Location',
                    status: 'ACTIVE',
                    utilization: 72,
                    satisfaction: 4.2,
                    createdAt: '2024-01-05'
                },
            ])
            setTotalPages(1)
        } catch (err: any) {
            console.error('Error fetching staff:', err)
            setError(err.message || 'Failed to fetch staff')
        } finally {
            setIsLoading(false)
        }
    }

    const roles = ['all', ...new Set(staff.map(s => s.role))]

    const handleDeleteStaff = async (staffId: string) => {
        if (confirm('Are you sure you want to delete this staff member?')) {
            try {
                // API call would go here
                fetchStaff()
            } catch (err: any) {
                alert('Failed to delete staff: ' + err.message)
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
                    <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
                    <p className="text-gray-600 mt-1">Manage your franchise staff members</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    Add Staff
                </button>
            </div>

            {/* Search & Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search staff..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select data-testid="select-admin-franchise-staff-1"
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
                        <select data-testid="select-admin-franchise-staff-2"
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

            {/* Staff Table */}
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
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Utilization</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staff.map((member, idx) => (
                                    <motion.tr
                                        key={member.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-3 px-4">
                                            <p className="font-medium text-gray-900">{member.name}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm text-gray-600">{member.email}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant="outline">{member.role}</Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                {member.status === 'ACTIVE' ? (
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <AlertCircle className="w-4 h-4 text-gray-400" />
                                                )}
                                                <Badge variant={member.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                    {member.status}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-600"
                                                        style={{ width: `${member.utilization}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{member.utilization}%</span>
                                            </div>
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
                                                    onClick={() => handleDeleteStaff(member.id)}
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

            {staff.length === 0 && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No staff members found</p>
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
