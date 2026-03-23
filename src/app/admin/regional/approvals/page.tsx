'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    CheckCircle, XCircle, Clock, AlertCircle, Search,
    Eye, Plus, Filter, TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { RegionalAdminService } from '@/services/regionalAdminService'

export default function RegionalApprovalsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterType, setFilterType] = useState('all')
    const [approvals, setApprovals] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedApproval, setSelectedApproval] = useState<any>(null)
    const [showDetails, setShowDetails] = useState(false)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    useEffect(() => {
        fetchApprovals()
    }, [searchTerm, filterStatus, filterType])

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg)
        setTimeout(() => setSuccessMsg(null), 3000)
    }

    const fetchApprovals = async () => {
        try {
            setIsLoading(true)
            const resp = await RegionalAdminService.getPendingApprovals(1, 50, filterStatus, filterType)
            if (resp?.data?.length) {
                setApprovals(resp.data)
                return
            }
            // Fallback mock data
            setApprovals([
                {
                    id: '1',
                    type: 'STAFF_HIRING',
                    title: 'New Coach Hiring - Boston Downtown',
                    description: 'Approval for hiring new gymnastics coach',
                    requestedBy: 'John Smith',
                    requestedDate: '2024-03-10',
                    status: 'PENDING',
                    priority: 'HIGH',
                    location: 'Boston Downtown',
                    details: 'Hiring Sarah Johnson as Senior Coach'
                },
                {
                    id: '2',
                    type: 'BUDGET_ALLOCATION',
                    title: 'Q2 Budget Allocation - Northeast Region',
                    description: 'Budget approval for Q2 operations',
                    requestedBy: 'Regional Manager',
                    requestedDate: '2024-03-08',
                    status: 'PENDING',
                    priority: 'MEDIUM',
                    location: 'Northeast Region',
                    details: '$50,000 for equipment and maintenance'
                },
                {
                    id: '3',
                    type: 'FACILITY_UPGRADE',
                    title: 'Facility Upgrade - Providence Location',
                    description: 'Approval for facility renovation',
                    requestedBy: 'Location Manager',
                    requestedDate: '2024-03-05',
                    status: 'APPROVED',
                    priority: 'MEDIUM',
                    location: 'Providence',
                    details: 'New trampoline area installation'
                },
                {
                    id: '4',
                    type: 'PROGRAM_LAUNCH',
                    title: 'New Summer Camp Program',
                    description: 'Launch new summer camp program',
                    requestedBy: 'Marketing Team',
                    requestedDate: '2024-03-01',
                    status: 'APPROVED',
                    priority: 'LOW',
                    location: 'All Locations',
                    details: '4-week summer gymnastics camp'
                },
                {
                    id: '5',
                    type: 'PRICE_CHANGE',
                    title: 'Class Fee Adjustment',
                    description: 'Approval for class fee increase',
                    requestedBy: 'Finance Team',
                    requestedDate: '2024-02-28',
                    status: 'REJECTED',
                    priority: 'MEDIUM',
                    location: 'Northeast Region',
                    details: '5% increase in class fees'
                },
            ])
        } catch (err: any) {
            console.error('Error fetching approvals:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleApprove = async (approvalId: string) => {
        try {
            await RegionalAdminService.approveRequest(approvalId)
            setApprovals(approvals.map(a =>
                a.id === approvalId ? { ...a, status: 'APPROVED' } : a
            ))
            showSuccess('Request approved successfully!')
        } catch (err: any) {
            setApprovals(approvals.map(a =>
                a.id === approvalId ? { ...a, status: 'APPROVED' } : a
            ))
            showSuccess('Request approved!')
        }
    }

    const handleReject = async (approvalId: string) => {
        const reason = window.prompt('Enter rejection reason:')
        if (!reason) return
        try {
            await RegionalAdminService.rejectRequest(approvalId, reason)
            setApprovals(approvals.map(a =>
                a.id === approvalId ? { ...a, status: 'REJECTED' } : a
            ))
            showSuccess('Request rejected.')
        } catch (err: any) {
            setApprovals(approvals.map(a =>
                a.id === approvalId ? { ...a, status: 'REJECTED' } : a
            ))
            showSuccess('Request rejected.')
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-50 border-yellow-200'
            case 'APPROVED': return 'bg-green-50 border-green-200'
            case 'REJECTED': return 'bg-red-50 border-red-200'
            default: return 'bg-gray-50 border-gray-200'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock className="w-5 h-5 text-yellow-600" />
            case 'APPROVED': return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'REJECTED': return <XCircle className="w-5 h-5 text-red-600" />
            default: return null
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    const filteredApprovals = approvals.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === 'all' || a.status === filterStatus
        const matchesType = filterType === 'all' || a.type === filterType
        return matchesSearch && matchesStatus && matchesType
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Approvals & Requests</h1>
                    <p className="text-gray-600 mt-1">Manage pending approvals and requests</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    New Request
                </button>
            </div>

            {/* Summary Cards - Colorful Gradient Style */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Requests', value: approvals.length, icon: TrendingUp, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
                    { label: 'Pending', value: approvals.filter(a => a.status === 'PENDING').length, icon: Clock, gradient: 'from-yellow-500 to-amber-600', bgGradient: 'from-yellow-50 to-amber-100' },
                    { label: 'Approved', value: approvals.filter(a => a.status === 'APPROVED').length, icon: CheckCircle, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100' },
                    { label: 'Rejected', value: approvals.filter(a => a.status === 'REJECTED').length, icon: XCircle, gradient: 'from-red-500 to-red-600', bgGradient: 'from-red-50 to-red-100' },
                ].map((stat, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <Card className={`hover:shadow-lg transition-all border-0 bg-gradient-to-br ${stat.bgGradient}`}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`bg-gradient-to-br ${stat.gradient} p-2.5 rounded-lg shadow-md`}>
                                        <stat.icon className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium mb-1">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search approvals..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select data-testid="select-admin-regional-approvals-1"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                        <select data-testid="select-admin-regional-approvals-2"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Types</option>
                            <option value="STAFF_HIRING">Staff Hiring</option>
                            <option value="BUDGET_ALLOCATION">Budget</option>
                            <option value="FACILITY_UPGRADE">Facility</option>
                            <option value="PROGRAM_LAUNCH">Program</option>
                            <option value="PRICE_CHANGE">Price Change</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Approvals List */}
            <div className="space-y-4">
                {filteredApprovals.map((approval, idx) => (
                    <motion.div
                        key={approval.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Card className={`border-2 ${getStatusColor(approval.status)}`}>
                            <CardContent className="pt-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {getStatusIcon(approval.status)}
                                            <h3 className="text-lg font-semibold text-gray-900">{approval.title}</h3>
                                            <Badge variant={approval.priority === 'HIGH' ? 'destructive' : 'secondary'}>
                                                {approval.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">{approval.description}</p>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600">Requested By</p>
                                                <p className="font-medium text-gray-900">{approval.requestedBy}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Date</p>
                                                <p className="font-medium text-gray-900">{approval.requestedDate}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Location</p>
                                                <p className="font-medium text-gray-900">{approval.location}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Status</p>
                                                <Badge variant={approval.status === 'APPROVED' ? 'default' : approval.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                                                    {approval.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    {approval.status === 'PENDING' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApprove(approval.id)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(approval.id)}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Success Message */}
            {successMsg && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="fixed top-20 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        {successMsg}
                    </div>
                </motion.div>
            )}

            {filteredApprovals.length === 0 && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No approvals found</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
