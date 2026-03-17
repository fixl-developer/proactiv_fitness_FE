'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    CheckSquare,
    AlertCircle,
    Clock,
    Download,
    RefreshCw,
    CheckCircle,
    XCircle,
    TrendingUp,
    Calendar,
    FileText
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { superAdminService } from '@/services/superAdminService'

interface ComplianceItem {
    id: string
    name: string
    category: string
    status: 'compliant' | 'non-compliant' | 'pending' | 'warning'
    lastChecked: Date
    nextCheck: Date
    score: number
    requirements: string[]
    actions?: string[]
}

interface ComplianceMetric {
    date: string
    score: number
    compliant: number
    nonCompliant: number
}

export default function ComplianceStatusPage() {
    const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([])
    const [metrics, setMetrics] = useState<ComplianceMetric[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [selectedStatus, setSelectedStatus] = useState<string>('all')

    useEffect(() => {
        fetchComplianceData()
    }, [])

    const fetchComplianceData = async () => {
        try {
            setLoading(true)
            const data = await superAdminService.getComplianceStatus()
            setComplianceItems(data)
        } catch (error) {
            console.error('Error fetching compliance data:', error)
            // Fallback mock data
            const mockItems: ComplianceItem[] = [
                {
                    id: '1',
                    name: 'GDPR Compliance',
                    category: 'Data Protection',
                    status: 'compliant',
                    lastChecked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                    nextCheck: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
                    score: 98,
                    requirements: [
                        'Data processing agreements in place',
                        'Privacy policy updated',
                        'User consent mechanisms implemented',
                        'Data retention policies defined'
                    ]
                },
                {
                    id: '2',
                    name: 'CCPA Compliance',
                    category: 'Data Protection',
                    status: 'compliant',
                    lastChecked: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                    nextCheck: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
                    score: 95,
                    requirements: [
                        'Consumer rights implemented',
                        'Opt-out mechanisms available',
                        'Data sale disclosures',
                        'Privacy policy compliant'
                    ]
                },
                {
                    id: '3',
                    name: 'SOC 2 Type II',
                    category: 'Security',
                    status: 'compliant',
                    lastChecked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                    nextCheck: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
                    score: 92,
                    requirements: [
                        'Security controls documented',
                        'Access controls implemented',
                        'Encryption enabled',
                        'Audit logs maintained'
                    ]
                },
                {
                    id: '4',
                    name: 'PCI DSS',
                    category: 'Payment',
                    status: 'warning',
                    lastChecked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                    nextCheck: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
                    score: 88,
                    requirements: [
                        'Secure network architecture',
                        'Cardholder data protection',
                        'Vulnerability management',
                        'Access control measures'
                    ],
                    actions: ['Update firewall rules', 'Conduct security assessment']
                },
                {
                    id: '5',
                    name: 'HIPAA Compliance',
                    category: 'Healthcare',
                    status: 'pending',
                    lastChecked: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    nextCheck: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
                    score: 85,
                    requirements: [
                        'PHI protection measures',
                        'Audit controls',
                        'Integrity controls',
                        'Transmission security'
                    ],
                    actions: ['Complete risk assessment', 'Implement missing controls']
                },
                {
                    id: '6',
                    name: 'ISO 27001',
                    category: 'Security',
                    status: 'compliant',
                    lastChecked: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
                    nextCheck: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000),
                    score: 94,
                    requirements: [
                        'Information security policy',
                        'Risk assessment process',
                        'Access control policy',
                        'Incident management'
                    ]
                }
            ]

            const mockMetrics: ComplianceMetric[] = [
                { date: '2024-03-01', score: 88, compliant: 4, nonCompliant: 2 },
                { date: '2024-03-05', score: 89, compliant: 5, nonCompliant: 1 },
                { date: '2024-03-10', score: 91, compliant: 5, nonCompliant: 1 },
                { date: '2024-03-15', score: 92, compliant: 6, nonCompliant: 0 }
            ]

            setComplianceItems(mockItems)
            setMetrics(mockMetrics)
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'compliant':
                return <CheckCircle className="w-5 h-5 text-green-500" />
            case 'non-compliant':
                return <XCircle className="w-5 h-5 text-red-500" />
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-500" />
            case 'pending':
                return <Clock className="w-5 h-5 text-blue-500" />
            default:
                return <CheckSquare className="w-5 h-5 text-gray-500" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'compliant':
                return 'bg-green-50 border-green-200'
            case 'non-compliant':
                return 'bg-red-50 border-red-200'
            case 'warning':
                return 'bg-yellow-50 border-yellow-200'
            case 'pending':
                return 'bg-blue-50 border-blue-200'
            default:
                return 'bg-gray-50 border-gray-200'
        }
    }

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'compliant':
                return 'bg-green-100 text-green-800'
            case 'non-compliant':
                return 'bg-red-100 text-red-800'
            case 'warning':
                return 'bg-yellow-100 text-yellow-800'
            case 'pending':
                return 'bg-blue-100 text-blue-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const filteredItems = complianceItems.filter(item => {
        const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory
        const statusMatch = selectedStatus === 'all' || item.status === selectedStatus
        return categoryMatch && statusMatch
    })

    const categories = ['all', ...new Set(complianceItems.map(item => item.category))]
    const statuses = ['all', 'compliant', 'warning', 'pending', 'non-compliant']

    const compliantCount = complianceItems.filter(i => i.status === 'compliant').length
    const warningCount = complianceItems.filter(i => i.status === 'warning').length
    const pendingCount = complianceItems.filter(i => i.status === 'pending').length
    const nonCompliantCount = complianceItems.filter(i => i.status === 'non-compliant').length
    const averageScore = Math.round(complianceItems.reduce((sum, i) => sum + i.score, 0) / complianceItems.length)

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <CheckSquare className="w-8 h-8 mr-3 text-purple-600" />
                        Compliance Status
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Monitor regulatory compliance and audit requirements
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </motion.div>

            {/* Key Metrics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-5 gap-4"
            >
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Average Score</p>
                            <p className="text-3xl font-bold text-blue-600">{averageScore}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Compliant</p>
                            <p className="text-3xl font-bold text-green-600">{compliantCount}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Warnings</p>
                            <p className="text-3xl font-bold text-yellow-600">{warningCount}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-yellow-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending</p>
                            <p className="text-3xl font-bold text-blue-600">{pendingCount}</p>
                        </div>
                        <Clock className="w-8 h-8 text-blue-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Non-Compliant</p>
                            <p className="text-3xl font-bold text-red-600">{nonCompliantCount}</p>
                        </div>
                        <XCircle className="w-8 h-8 text-red-500 opacity-50" />
                    </div>
                </Card>
            </motion.div>

            {/* Compliance Trend Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={metrics}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="score"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                name="Compliance Score"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat === 'all' ? 'All Categories' : cat}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        {statuses.map(status => (
                            <option key={status} value={status}>
                                {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </motion.div>

            {/* Compliance Items */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
            >
                {loading ? (
                    <Card className="p-8 text-center">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
                    </Card>
                ) : filteredItems.length === 0 ? (
                    <Card className="p-8 text-center">
                        <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No compliance items found</p>
                    </Card>
                ) : (
                    filteredItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className={`p-6 border-l-4 ${getStatusColor(item.status)}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start space-x-4">
                                        {getStatusIcon(item.status)}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{item.category}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(item.status)}`}>
                                        {item.status.toUpperCase()}
                                    </span>
                                </div>

                                {/* Score Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">Compliance Score</span>
                                        <span className="font-medium">{item.score}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${item.score >= 90 ? 'bg-green-600' : item.score >= 75 ? 'bg-yellow-600' : 'bg-red-600'}`}
                                            style={{ width: `${item.score}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Requirements */}
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-gray-900 mb-2">Requirements:</p>
                                    <ul className="space-y-1">
                                        {item.requirements.map((req, i) => (
                                            <li key={i} className="text-sm text-gray-700 flex items-start">
                                                <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Actions if needed */}
                                {item.actions && item.actions.length > 0 && (
                                    <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <p className="text-sm font-medium text-yellow-900 mb-2">Required Actions:</p>
                                        <ul className="space-y-1">
                                            {item.actions.map((action, i) => (
                                                <li key={i} className="text-sm text-yellow-800 flex items-start">
                                                    <span className="mr-2">•</span>
                                                    {action}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Dates */}
                                <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-200">
                                    <span className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Last checked: {item.lastChecked.toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Next check: {item.nextCheck.toLocaleDateString()}
                                    </span>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                )}
            </motion.div>
        </div>
    )
}
