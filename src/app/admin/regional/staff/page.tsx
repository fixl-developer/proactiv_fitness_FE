'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Edit2, Trash2, Eye, Users, Mail, Phone, MapPin, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default function RegionalStaffPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRole, setFilterRole] = useState('all')

    const staff = [
        {
            id: 1,
            name: 'Sarah Johnson',
            role: 'Location Manager',
            location: 'Boston Downtown',
            email: 'sarah.johnson@proactiv.com',
            phone: '+1 (617) 555-0101',
            status: 'active',
            joinDate: '2023-01-15',
            performance: 95
        },
        {
            id: 2,
            name: 'Michael Chen',
            role: 'Coach',
            location: 'Boston Suburbs',
            email: 'michael.chen@proactiv.com',
            phone: '+1 (617) 555-0102',
            status: 'active',
            joinDate: '2023-03-20',
            performance: 88
        },
        {
            id: 3,
            name: 'Emily Rodriguez',
            role: 'Location Manager',
            location: 'Providence',
            email: 'emily.rodriguez@proactiv.com',
            phone: '+1 (401) 555-0103',
            status: 'active',
            joinDate: '2023-02-10',
            performance: 92
        },
        {
            id: 4,
            name: 'David Williams',
            role: 'Coach',
            location: 'Hartford',
            email: 'david.williams@proactiv.com',
            phone: '+1 (860) 555-0104',
            status: 'active',
            joinDate: '2023-04-05',
            performance: 85
        },
        {
            id: 5,
            name: 'Jessica Lee',
            role: 'Support Staff',
            location: 'New Haven',
            email: 'jessica.lee@proactiv.com',
            phone: '+1 (203) 555-0105',
            status: 'active',
            joinDate: '2023-05-12',
            performance: 78
        },
        {
            id: 6,
            name: 'Robert Martinez',
            role: 'Coach',
            location: 'Boston Downtown',
            email: 'robert.martinez@proactiv.com',
            phone: '+1 (617) 555-0106',
            status: 'on-leave',
            joinDate: '2023-06-01',
            performance: 90
        },
    ]

    const filteredStaff = staff.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = filterRole === 'all' || member.role === filterRole
        return matchesSearch && matchesRole
    })

    const roles = ['all', ...new Set(staff.map(s => s.role))]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Regional Staff</h1>
                    <p className="text-gray-600 mt-1">Manage staff across all regional locations</p>
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
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Performance</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStaff.map((member, idx) => (
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
                                            <Badge variant="outline">{member.role}</Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm text-gray-600">{member.location}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-sm text-gray-600">
                                                <p className="flex items-center gap-1"><Mail className="w-3 h-3" />{member.email}</p>
                                                <p className="flex items-center gap-1"><Phone className="w-3 h-3" />{member.phone}</p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full"
                                                        style={{ width: `${member.performance}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{member.performance}%</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                                                {member.status}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-2">
                                                <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
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

            {filteredStaff.length === 0 && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No staff members found</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
