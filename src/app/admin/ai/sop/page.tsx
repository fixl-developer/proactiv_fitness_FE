'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    FileText, Plus, Edit, Eye, Download, Upload, Search,
    Filter, CheckCircle, Clock, AlertTriangle, Users, Shield,
    BookOpen, Settings, RefreshCw, Star, Calendar, Tag
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const SOPDocumentsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [selectedStatus, setSelectedStatus] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')

    // SOP Documents data
    const sopDocuments = [
        {
            id: 1,
            title: 'Emergency Response Procedures',
            category: 'Safety',
            status: 'active',
            version: '3.2',
            lastUpdated: '2024-01-20',
            updatedBy: 'Safety Manager',
            description: 'Comprehensive emergency response protocols for all locations',
            priority: 'critical',
            accessLevel: 'all_staff',
            fileSize: '2.4 MB',
            format: 'PDF',
            downloads: 156,
            views: 892,
            locations: ['All Locations'],
            roles: ['All Staff', 'Coaches', 'Managers'],
            tags: ['emergency', 'safety', 'protocols', 'first-aid'],
            approvalStatus: 'approved',
            approvedBy: 'Operations Director',
            nextReview: '2024-07-20'
        },
        {
            id: 2,
            title: 'GYMTOTS Class Structure & Safety Guidelines',
            category: 'Teaching',
            status: 'active',
            version: '2.8',
            lastUpdated: '2024-01-15',
            updatedBy: 'Head Coach',
            description: 'Detailed guidelines for conducting GYMTOTS classes safely and effectively',
            priority: 'high',
            accessLevel: 'coaches_only',
            fileSize: '1.8 MB',
            format: 'PDF',
            downloads: 89,
            views: 445,
            locations: ['All Locations'],
            roles: ['Coaches', 'Senior Coaches'],
            tags: ['gymtots', 'teaching', 'safety', 'age-3-4'],
            approvalStatus: 'approved',
            approvedBy: 'Head Coach',
            nextReview: '2024-04-15'
        },
        {
            id: 3,
            title: 'Customer Service Standards',
            category: 'Customer Service',
            status: 'active',
            version: '1.5',
            lastUpdated: '2024-01-10',
            updatedBy: 'Customer Service Manager',
            description: 'Standards and procedures for customer interactions and service quality',
            priority: 'medium',
            accessLevel: 'front_desk',
            fileSize: '956 KB',
            format: 'PDF',
            downloads: 67,
            views: 234,
            locations: ['All Locations'],
            roles: ['Front Desk', 'Managers', 'Customer Service'],
            tags: ['customer-service', 'communication', 'standards'],
            approvalStatus: 'approved',
            approvedBy: 'Operations Manager',
            nextReview: '2024-06-10'
        },
        {
            id: 4,
            title: 'Equipment Maintenance Checklist',
            category: 'Operations',
            status: 'active',
            version: '2.1',
            lastUpdated: '2024-01-08',
            updatedBy: 'Facilities Manager',
            description: 'Daily, weekly, and monthly equipment maintenance procedures',
            priority: 'high',
            accessLevel: 'maintenance_staff',
            fileSize: '1.2 MB',
            format: 'PDF',
            downloads: 45,
            views: 178,
            locations: ['All Locations'],
            roles: ['Maintenance', 'Managers', 'Coaches'],
            tags: ['equipment', 'maintenance', 'safety', 'checklist'],
            approvalStatus: 'approved',
            approvedBy: 'Facilities Director',
            nextReview: '2024-04-08'
        },
        {
            id: 5,
            title: 'New Coach Onboarding Process',
            category: 'HR',
            status: 'draft',
            version: '1.0',
            lastUpdated: '2024-01-22',
            updatedBy: 'HR Manager',
            description: 'Complete onboarding process for new coaching staff',
            priority: 'medium',
            accessLevel: 'hr_managers',
            fileSize: '3.1 MB',
            format: 'PDF',
            downloads: 12,
            views: 56,
            locations: ['All Locations'],
            roles: ['HR', 'Managers', 'Senior Coaches'],
            tags: ['onboarding', 'training', 'coaches', 'hr'],
            approvalStatus: 'pending',
            approvedBy: null,
            nextReview: '2024-02-22'
        },
        {
            id: 6,
            title: 'COVID-19 Health & Safety Protocols',
            category: 'Safety',
            status: 'archived',
            version: '4.2',
            lastUpdated: '2023-12-15',
            updatedBy: 'Health & Safety Officer',
            description: 'Health and safety protocols during pandemic conditions',
            priority: 'low',
            accessLevel: 'all_staff',
            fileSize: '2.8 MB',
            format: 'PDF',
            downloads: 234,
            views: 1245,
            locations: ['All Locations'],
            roles: ['All Staff'],
            tags: ['covid', 'health', 'safety', 'protocols', 'archived'],
            approvalStatus: 'approved',
            approvedBy: 'Operations Director',
            nextReview: 'N/A'
        }
    ]

    // SOP Statistics
    const sopStats = {
        totalDocuments: sopDocuments.length,
        activeDocuments: sopDocuments.filter(doc => doc.status === 'active').length,
        draftDocuments: sopDocuments.filter(doc => doc.status === 'draft').length,
        pendingApproval: sopDocuments.filter(doc => doc.approvalStatus === 'pending').length,
        totalDownloads: sopDocuments.reduce((sum, doc) => sum + doc.downloads, 0),
        totalViews: sopDocuments.reduce((sum, doc) => sum + doc.views, 0)
    }

    // Categories
    const categories = ['Safety', 'Teaching', 'Customer Service', 'Operations', 'HR', 'Finance', 'Marketing']

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'text-green-600 bg-green-50 border-green-200',
            draft: 'text-yellow-600 bg-yellow-50 border-yellow-200',
            archived: 'text-gray-600 bg-gray-50 border-gray-200',
            review: 'text-blue-600 bg-blue-50 border-blue-200'
        }
        return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200'
    }

    const getPriorityColor = (priority: string) => {
        const colors = {
            critical: 'text-red-600 bg-red-50',
            high: 'text-orange-600 bg-orange-50',
            medium: 'text-yellow-600 bg-yellow-50',
            low: 'text-green-600 bg-green-50'
        }
        return colors[priority as keyof typeof colors] || 'text-gray-600 bg-gray-50'
    }

    const getApprovalColor = (status: string) => {
        const colors = {
            approved: 'text-green-600 bg-green-50',
            pending: 'text-yellow-600 bg-yellow-50',
            rejected: 'text-red-600 bg-red-50'
        }
        return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50'
    }

    const filteredDocuments = sopDocuments.filter(doc => {
        const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
        const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus
        const matchesSearch = searchTerm === '' ||
            doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

        return matchesCategory && matchesStatus && matchesSearch
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">SOP Documents</h1>
                    <p className="text-gray-600 mt-2">Manage standard operating procedures and documentation</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create SOP
                    </Button>
                    <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Documents</CardTitle>
                        <FileText className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{sopStats.totalDocuments}</div>
                        <div className="text-sm text-blue-600 font-medium">All SOPs</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Active Documents</CardTitle>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{sopStats.activeDocuments}</div>
                        <div className="text-sm text-green-600 font-medium">Currently in use</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Pending Approval</CardTitle>
                        <Clock className="h-5 w-5 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{sopStats.pendingApproval}</div>
                        <div className="text-sm text-yellow-600 font-medium">Need review</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Downloads</CardTitle>
                        <Download className="h-5 w-5 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{sopStats.totalDownloads}</div>
                        <div className="text-sm text-purple-600 font-medium">This month</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search by title, description, or tags..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <select data-testid="select-admin-ai-sop-1"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                            <select data-testid="select-admin-ai-sop-2"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Documents List */}
            <Card>
                <CardHeader>
                    <CardTitle>SOP Documents</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredDocuments.map((document, index) => (
                            <motion.div
                                key={document.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 bg-gray-50 rounded-lg hover:shadow-md transition-all"
                            >
                                {/* Document Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{document.title}</h3>
                                            <p className="text-sm text-gray-600">{document.category} • v{document.version}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge className={getStatusColor(document.status)}>
                                                    {document.status}
                                                </Badge>
                                                <Badge className={getPriorityColor(document.priority)}>
                                                    {document.priority}
                                                </Badge>
                                                <Badge className={getApprovalColor(document.approvalStatus)}>
                                                    {document.approvalStatus}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm">
                                            <Eye className="w-4 h-4 mr-2" />
                                            View
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <Download className="w-4 h-4 mr-2" />
                                            Download
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                    </div>
                                </div>

                                {/* Document Details */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
                                    {/* Basic Information */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Document Information</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">File Size:</span>
                                                <span className="font-medium">{document.fileSize}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Format:</span>
                                                <span className="font-medium">{document.format}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Downloads:</span>
                                                <span className="font-medium">{document.downloads}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Views:</span>
                                                <span className="font-medium">{document.views}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Next Review:</span>
                                                <span className="font-medium">{document.nextReview}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Access & Permissions */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Access & Permissions</h4>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <span className="text-gray-600">Access Level:</span>
                                                <div className="font-medium mt-1">{document.accessLevel.replace('_', ' ')}</div>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Applicable Roles:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {document.roles.map((role, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-xs">
                                                            {role}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Locations:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {document.locations.map((location, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-xs">
                                                            {location}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Update History */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Update History</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Last Updated:</span>
                                                <span className="font-medium">{document.lastUpdated}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Updated By:</span>
                                                <span className="font-medium">{document.updatedBy}</span>
                                            </div>
                                            {document.approvedBy && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Approved By:</span>
                                                    <span className="font-medium">{document.approvedBy}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                                    <p className="text-sm text-gray-700">{document.description}</p>
                                </div>

                                {/* Tags */}
                                <div className="border-t border-gray-200 pt-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {document.tags.map((tag, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                <Tag className="w-3 h-3 mr-1" />
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>)
}

export default SOPDocumentsPage
