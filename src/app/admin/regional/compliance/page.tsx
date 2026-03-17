'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    CheckCircle, AlertTriangle, XCircle, Search, Filter,
    Calendar, FileText, TrendingUp, Shield, Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'

export default function RegionalCompliancePage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [isLoading, setIsLoading] = useState(true)
    const [complianceItems, setComplianceItems] = useState<any[]>([])

    useEffect(() => {
        fetchCompliance()
    }, [searchTerm, filterStatus])

    const fetchCompliance = async () => {
        try {
            setIsLoading(true)
            // Mock data
            setComplianceItems([
                {
                    id: '1',
                    name: 'Safety Certifications',
                    category: 'SAFETY',
                    status: 'COMPLIANT',
                    completionRate: 100,
                    dueDate: '2024-06-30',
                    lastAudit: '2024-03-01',
                    locations: 5,
                    details: 'All coaches have current CPR and First Aid certifications'
                },
                {
                    id: '2',
                    name: 'Background Checks',
                    category: 'PERSONNEL',
                    status: 'COMPLIANT',
                    completionRate: 100,
                    dueDate: '2024-12-31',
                    lastAudit: '2024-02-15',
                    locations: 5,
                    details: 'All staff members have passed background checks'
                },
                {
                    id: '3',
                    name: 'Facility Inspections',
                    category: 'FACILITY',
                    status: 'WARNING',
                    completionRate: 80,
                    dueDate: '2024-04-15',
                    lastAudit: '2024-01-20',
                    locations: 4,
                    details: 'New Haven location pending inspection'
                },
                {
                    id: '4',
                    name: 'Insurance Coverage',
                    category: 'INSURANCE',
                    status: 'COMPLIANT',
                    completionRate: 100,
                    dueDate: '2024-09-30',
                    lastAudit: '2024-03-05',
                    locations: 5,
                    details: 'All locations have active liability insurance'
                },
                {
                    id: '5',
                    name: 'Data Privacy Compliance',
                    category: 'DATA',
                    status: 'NON_COMPLIANT',
                    completionRate: 60,
                    dueDate: '2024-03-31',
                    lastAudit: '2024-02-01',
                    locations: 2,
                    details: 'GDPR compliance training needed for 2 locations'
                },
                {
                    id: '6',
                    name: 'Financial Audits',
                    category: 'FINANCIAL',
                    status: 'COMPLIANT',
                    completionRate: 100,
                    dueDate: '2024-05-31',
                    lastAudit: '2024-03-10',
                    locations: 5,
                    details: 'Q1 financial audit completed successfully'
                },
            ])
        } catch (err: any) {
            console.error('Error fetching compliance:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLIANT': return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' }
            case 'WARNING': return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' }
            case 'NON_COMPLIANT': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' }
            default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' }
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLIANT': return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'WARNING': return <AlertTriangle className="w-5 h-5 text-yellow-600" />
            case 'NON_COMPLIANT': return <XCircle className="w-5 h-5 text-red-600" />
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

    const compliant = complianceItems.filter(c => c.status === 'COMPLIANT').length
    const warning = complianceItems.filter(c => c.status === 'WARNING').length
    const nonCompliant = complianceItems.filter(c => c.status === 'NON_COMPLIANT').length
    const complianceRate = Math.round((compliant / complianceItems.length) * 100)

    const filteredItems = complianceItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === 'all' || item.status === filterStatus
        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Compliance & Audits</h1>
                <p className="text-gray-600 mt-1">Track regional compliance status and audit results</p>
            </div>

            {/* Compliance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Overall Compliance</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{complianceRate}%</p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <Shield className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <Progress value={complianceRate} className="mt-4 h-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Compliant</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{compliant}</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Warnings</p>
                                <p className="text-3xl font-bold text-yellow-600 mt-2">{warning}</p>
                            </div>
                            <div className="bg-yellow-50 p-3 rounded-lg">
                                <AlertTriangle className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Non-Compliant</p>
                                <p className="text-3xl font-bold text-red-600 mt-2">{nonCompliant}</p>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search compliance items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="COMPLIANT">Compliant</option>
                            <option value="WARNING">Warning</option>
                            <option value="NON_COMPLIANT">Non-Compliant</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Compliance Items */}
            <div className="space-y-4">
                {filteredItems.map((item, idx) => {
                    const colors = getStatusColor(item.status)
                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className={`border-2 ${colors.border} ${colors.bg}`}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(item.status)}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                                                <p className="text-sm text-gray-600">{item.details}</p>
                                            </div>
                                        </div>
                                        <Badge variant={item.status === 'COMPLIANT' ? 'default' : item.status === 'WARNING' ? 'secondary' : 'destructive'}>
                                            {item.status.replace('_', ' ')}
                                        </Badge>
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                                            <span className="text-sm font-bold text-gray-900">{item.completionRate}%</span>
                                        </div>
                                        <Progress value={item.completionRate} className="h-2" />
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Category</p>
                                            <p className="font-medium text-gray-900">{item.category}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Locations</p>
                                            <p className="font-medium text-gray-900">{item.locations}/5</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Last Audit</p>
                                            <p className="font-medium text-gray-900">{item.lastAudit}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Due Date</p>
                                            <p className="font-medium text-gray-900">{item.dueDate}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
