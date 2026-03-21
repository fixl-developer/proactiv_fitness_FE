'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users, Search, Filter, Plus, Eye, Edit, Phone, Mail, MapPin,
    Calendar, Star, TrendingUp, Baby, User, Crown, MoreHorizontal,
    ArrowUpDown, Download, RefreshCw, UserPlus, Target, Award,
    Clock, CheckCircle, AlertCircle, Trash2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { responsiveClasses } from '@/lib/responsiveClasses'
import { familyService, FamilyProfile, FamilyStatistics, FamilyStatus } from '@/services/crmService'

interface CustomerDisplay {
    id: string
    name: string
    email: string
    phone: string
    children: number
    childrenNames: string[]
    joinDate: string
    status: string
    type: string
    location: string
    totalSpent: string
    lastActivity: string
    rating: number
}

const formatRelativeTime = (date: Date | string | undefined): string => {
    if (!date) return 'N/A'
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffMonths = Math.floor(diffDays / 30)

    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 30) return `${diffDays} days ago`
    return `${diffMonths} months ago`
}

const mapFamilyToCustomer = (family: FamilyProfile): CustomerDisplay => {
    const statusMap: Record<string, string> = {
        active: 'Active',
        inactive: 'Inactive',
        suspended: 'Suspended',
        archived: 'Inactive'
    }

    const type = family.accountBalance > 10000 ? 'Premium' :
        family.status === FamilyStatus.ACTIVE ? 'Standard' : 'Trial'

    return {
        id: family._id,
        name: family.familyName,
        email: family.primaryEmail,
        phone: family.primaryPhone,
        children: family.children?.length || 0,
        childrenNames: family.children?.map((c: any) =>
            typeof c === 'string' ? c : `${c.firstName || ''} ${c.lastName || ''}`.trim()
        ) || [],
        joinDate: family.firstEnrollmentDate
            ? new Date(family.firstEnrollmentDate).toISOString().split('T')[0]
            : new Date(family.createdAt).toISOString().split('T')[0],
        status: statusMap[family.status] || 'Active',
        type,
        location: family.addresses?.[0]?.city || 'N/A',
        totalSpent: `HK$${Math.abs(family.accountBalance || 0).toLocaleString()}`,
        lastActivity: formatRelativeTime(family.lastActivityDate),
        rating: 0
    }
}

const AdminCustomersPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterType, setFilterType] = useState('all')
    const [sortBy, setSortBy] = useState('name')
    const [customers, setCustomers] = useState<CustomerDisplay[]>([])
    const [customerMetrics, setCustomerMetrics] = useState([
        {
            title: 'Total Customers',
            value: '0',
            growth: '--',
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Active Students',
            value: '0',
            growth: '--',
            icon: Target,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'New This Month',
            value: '0',
            growth: '--',
            icon: UserPlus,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            title: 'Retention Rate',
            value: '0%',
            growth: '--',
            icon: Award,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        }
    ])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isAuthenticated = localStorage.getItem('isAuthenticated')
            if (!isAuthenticated) {
                window.location.href = '/login'
                return
            }
        }

        const fetchData = async () => {
            try {
                const [familiesResponse, stats] = await Promise.all([
                    familyService.getFamilies(),
                    familyService.getFamilyStatistics()
                ])

                const families = familiesResponse.data || []
                const mappedCustomers = families.map(mapFamilyToCustomer)
                setCustomers(mappedCustomers)

                if (stats) {
                    const retentionRate = stats.totalFamilies > 0
                        ? ((stats.activeFamilies / stats.totalFamilies) * 100).toFixed(1)
                        : '0'

                    setCustomerMetrics([
                        {
                            title: 'Total Customers',
                            value: stats.totalFamilies.toLocaleString(),
                            growth: '--',
                            icon: Users,
                            color: 'text-blue-600',
                            bgColor: 'bg-blue-50'
                        },
                        {
                            title: 'Active Students',
                            value: stats.activeChildren.toLocaleString(),
                            growth: '--',
                            icon: Target,
                            color: 'text-green-600',
                            bgColor: 'bg-green-50'
                        },
                        {
                            title: 'New This Month',
                            value: stats.newFamiliesThisMonth.toLocaleString(),
                            growth: '--',
                            icon: UserPlus,
                            color: 'text-purple-600',
                            bgColor: 'bg-purple-50'
                        },
                        {
                            title: 'Retention Rate',
                            value: `${retentionRate}%`,
                            growth: '--',
                            icon: Award,
                            color: 'text-orange-600',
                            bgColor: 'bg-orange-50'
                        }
                    ])
                }
            } catch (error) {
                console.error('Failed to fetch customer data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    // Filter customers based on search and filters
    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.childrenNames.some(child => child.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesStatus = filterStatus === 'all' || customer.status.toLowerCase() === filterStatus.toLowerCase()
        const matchesType = filterType === 'all' || customer.type.toLowerCase() === filterType.toLowerCase()

        return matchesSearch && matchesStatus && matchesType
    })

    const getStatusColor = (status: string) => {
        const colors = {
            'Active': 'bg-green-100 text-green-800',
            'Trial': 'bg-blue-100 text-blue-800',
            'Inactive': 'bg-gray-100 text-gray-800',
            'Suspended': 'bg-red-100 text-red-800'
        }
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    }

    const getTypeColor = (type: string) => {
        const colors = {
            'Premium': 'bg-purple-100 text-purple-800',
            'Standard': 'bg-blue-100 text-blue-800',
            'Trial': 'bg-orange-100 text-orange-800'
        }
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Premium': return Crown
            case 'Standard': return User
            case 'Trial': return Clock
            default: return User
        }
    }

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
                    <div className="h-96 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        )
    }

    return (
        <div className={responsiveClasses.pageContainer}>
            {/* Header */}
            <div className={responsiveClasses.headerContainer}>
                <div>
                    <h1 className={responsiveClasses.headerTitle}>Customer Management</h1>
                    <p className={responsiveClasses.headerSubtitle}>
                        Manage customer accounts, students, and family information
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Customer
                    </Button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {customerMetrics.map((metric, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                        <div className="flex items-center mt-1">
                                            <TrendingUp className={`w-4 h-4 ${metric.color} mr-1`} />
                                            <span className={`text-sm font-medium ${metric.color}`}>{metric.growth}</span>
                                        </div>
                                    </div>
                                    <div className={`p-3 ${metric.bgColor} rounded-lg`}>
                                        <metric.icon className={`w-6 h-6 ${metric.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Filters and Search */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search customers, children, or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="trial">Trial</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="premium">Premium</SelectItem>
                                    <SelectItem value="standard">Standard</SelectItem>
                                    <SelectItem value="trial">Trial</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm">
                                <Filter className="w-4 h-4 mr-2" />
                                More Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Customers Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                                <ArrowUpDown className="w-4 h-4 mr-2" />
                                Sort
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Children</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Total Spent</TableHead>
                                    <TableHead>Last Activity</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCustomers.map((customer, index) => {
                                    const TypeIcon = getTypeIcon(customer.type)
                                    return (
                                        <motion.tr
                                            key={customer.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                            className="hover:bg-gray-50"
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                        {customer.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{customer.name}</div>
                                                        <div className="text-sm text-gray-500">{customer.email}</div>
                                                        <div className="text-sm text-gray-500">{customer.phone}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Baby className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm font-medium">{customer.children} children</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {customer.childrenNames.join(', ')}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(customer.status)}>
                                                    {customer.status === 'Active' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                    {customer.status === 'Inactive' && <AlertCircle className="w-3 h-3 mr-1" />}
                                                    {customer.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getTypeColor(customer.type)}>
                                                    <TypeIcon className="w-3 h-3 mr-1" />
                                                    {customer.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm">{customer.location}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-green-600">{customer.totalSpent}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-gray-600">{customer.lastActivity}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                    <span className="text-sm font-medium">{customer.rating}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Edit Customer
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Phone className="w-4 h-4 mr-2" />
                                                            Call Customer
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Mail className="w-4 h-4 mr-2" />
                                                            Send Email
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600">
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </motion.tr>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button data-testid="btn-window-admin-customers" variant="outline" className="h-16 flex-col gap-2" onClick={() => window.location.href = '/admin/customers/parents'}>
                    <Users className="w-5 h-5" />
                    <span className="text-sm">Manage Parents</span>
                </Button>
                <Button data-testid="btn-window-admin-customers" variant="outline" className="h-16 flex-col gap-2" onClick={() => window.location.href = '/admin/customers/assessments'}>
                    <Target className="w-5 h-5" />
                    <span className="text-sm">View Assessments</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col gap-2">
                    <Mail className="w-5 h-5" />
                    <span className="text-sm">Send Newsletter</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col gap-2">
                    <Download className="w-5 h-5" />
                    <span className="text-sm">Export Data</span>
                </Button>
            </div>
        </div>
    )
}

export default AdminCustomersPage
