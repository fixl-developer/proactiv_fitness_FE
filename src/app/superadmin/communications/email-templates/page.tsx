'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Mail, Plus, Edit2, Trash2, RefreshCw, Search, Filter,
    CheckCircle, AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { superAdminService } from '@/services/superAdminService'

export default function EmailTemplatesPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [templates, setTemplates] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        fetchTemplates()
    }, [])

    const fetchTemplates = async () => {
        try {
            setIsLoading(true)
            const data = await superAdminService.getEmailTemplates()
            setTemplates(data)
        } catch (error) {
            console.error('Error fetching templates:', error)
            // Fallback mock data
            const mockTemplates = [
                {
                    id: '1',
                    name: 'Welcome Email',
                    category: 'onboarding',
                    subject: 'Welcome to Proactiv Fitness',
                    status: 'active',
                    lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    usageCount: 1250
                },
                {
                    id: '2',
                    name: 'Password Reset',
                    category: 'security',
                    subject: 'Reset Your Password',
                    status: 'active',
                    lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    usageCount: 450
                },
                {
                    id: '3',
                    name: 'Booking Confirmation',
                    category: 'booking',
                    subject: 'Your Class is Confirmed',
                    status: 'active',
                    lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    usageCount: 3200
                },
                {
                    id: '4',
                    name: 'Payment Receipt',
                    category: 'transaction',
                    subject: 'Payment Received',
                    status: 'inactive',
                    lastModified: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                    usageCount: 0
                }
            ]
            setTemplates(mockTemplates)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchTemplates()
        setTimeout(() => setRefreshing(false), 1000)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800">Active</Badge>
            case 'inactive':
                return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getCategoryBadge = (category: string) => {
        const colors: { [key: string]: string } = {
            'onboarding': 'bg-blue-100 text-blue-800',
            'security': 'bg-red-100 text-red-800',
            'notification': 'bg-purple-100 text-purple-800',
            'transaction': 'bg-green-100 text-green-800',
            'booking': 'bg-orange-100 text-orange-800'
        }
        return <Badge className={colors[category] || 'bg-gray-100 text-gray-800'}>{category}</Badge>
    }

    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.subject.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter
        return matchesSearch && matchesCategory
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600">Loading Email Templates...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Mail className="w-8 h-8 mr-3 text-blue-600" />
                        Email Templates
                    </h1>
                    <p className="text-gray-600 mt-1">Manage email templates for communications</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        variant="outline"
                        className="flex items-center"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 flex items-center">
                        <Plus className="w-4 h-4 mr-2" />
                        New Template
                    </Button>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
                            <Mail className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{templates.length}</div>
                            <p className="text-xs text-muted-foreground">Email templates</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {templates.filter(t => t.status === 'active').length}
                            </div>
                            <p className="text-xs text-muted-foreground">In use</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-l-4 border-l-purple-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Sends</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">
                                {templates.reduce((sum, t) => sum + t.usageCount, 0).toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">All time</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Filters and Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search templates..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="Filter by category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="onboarding">Onboarding</SelectItem>
                                    <SelectItem value="security">Security</SelectItem>
                                    <SelectItem value="notification">Notification</SelectItem>
                                    <SelectItem value="transaction">Transaction</SelectItem>
                                    <SelectItem value="booking">Booking</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Templates Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Templates ({filteredTemplates.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Usage</TableHead>
                                        <TableHead>Last Modified</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTemplates.map((template) => (
                                        <TableRow key={template.id}>
                                            <TableCell className="font-medium">{template.name}</TableCell>
                                            <TableCell>{getCategoryBadge(template.category)}</TableCell>
                                            <TableCell className="text-sm">{template.subject}</TableCell>
                                            <TableCell>{getStatusBadge(template.status)}</TableCell>
                                            <TableCell>{template.usageCount.toLocaleString()}</TableCell>
                                            <TableCell className="text-sm">
                                                {new Date(template.lastModified).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Button variant="ghost" size="sm">
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
