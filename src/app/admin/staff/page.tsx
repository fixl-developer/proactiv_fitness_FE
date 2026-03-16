'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    UserCheck,
    Search,
    Plus,
    Edit,
    Trash2,
    Mail,
    Phone,
    Shield,
    Award
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface StaffMember {
    id: string
    name: string
    email: string
    phone: string
    role: 'ADMIN' | 'MANAGER' | 'COACH'
    location: string
    joinDate: string
    status: 'active' | 'inactive'
    specialization?: string
}

const StaffPage = () => {
    const [staff, setStaff] = useState<StaffMember[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRole, setFilterRole] = useState<'all' | 'ADMIN' | 'MANAGER' | 'COACH'>('all')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setTimeout(() => {
            setStaff([
                {
                    id: '1',
                    name: 'System Administrator',
                    email: 'admin@proactivsports.net',
                    phone: '+852 9999 1001',
                    role: 'ADMIN',
                    location: 'All Locations',
                    joinDate: '2023-01-01',
                    status: 'active'
                },
                {
                    id: '2',
                    name: 'Operations Manager',
                    email: 'manager@proactivsports.net',
                    phone: '+852 9999 1002',
                    role: 'MANAGER',
                    location: 'Cyberport',
                    joinDate: '2023-03-15',
                    status: 'active'
                },
                {
                    id: '3',
                    name: 'Senior Coach',
                    email: 'coach@proactivsports.net',
                    phone: '+852 9999 1003',
                    role: 'COACH',
                    location: 'Wan Chai',
                    joinDate: '2023-06-01',
                    status: 'active',
                    specialization: 'Gymnastics'
                }
            ])
            setIsLoading(false)
        }, 1000)
    }, [])

    const filteredStaff = staff.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = filterRole === 'all' || member.role === filterRole
        return matchesSearch && matchesFilter
    })

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-red-100 text-red-800'
            case 'MANAGER':
                return 'bg-purple-100 text-purple-800'
            case 'COACH':
                return 'bg-green-100 text-green-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return <Shield className="w-4 h-4" />
            case 'MANAGER':
                return <UserCheck className="w-4 h-4" />
            case 'COACH':
                return <Award className="w-4 h-4" />
            default:
                return <UserCheck className="w-4 h-4" />
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
                    <p className="text-gray-600">Manage coaches, managers, and administrators</p>
                </div>
                <Button className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Staff Member
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search staff members..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {['all', 'ADMIN', 'MANAGER', 'COACH'].map((role) => (
                                <Button
                                    key={role}
                                    variant={filterRole === role ? 'default' : 'outline'}
                                    onClick={() => setFilterRole(role as any)}
                                    className="capitalize"
                                >
                                    {role === 'all' ? 'All' : role}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Staff List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStaff.map((member, index) => (
                    <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {/* Avatar and Role */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-semibold text-lg">
                                                    {member.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">{member.name}</h3>
                                                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                                                    {getRoleIcon(member.role)}
                                                    <span>{member.role}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center space-x-2 text-gray-600">
                                            <Mail className="w-4 h-4" />
                                            <span className="truncate">{member.email}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-gray-600">
                                            <Phone className="w-4 h-4" />
                                            <span>{member.phone}</span>
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div className="pt-3 border-t border-gray-200 space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Location:</span>
                                            <span className="font-medium">{member.location}</span>
                                        </div>
                                        {member.specialization && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Specialization:</span>
                                                <span className="font-medium">{member.specialization}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Join Date:</span>
                                            <span className="font-medium">{new Date(member.joinDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex space-x-2 pt-2">
                                        <Button variant="outline" size="sm" className="flex-1">
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {filteredStaff.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
                        <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default StaffPage