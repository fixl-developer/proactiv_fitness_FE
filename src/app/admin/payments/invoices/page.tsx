'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    CreditCard, Download, Eye, Edit, Mail, Phone, Search,
    Filter, Plus, RefreshCw, CheckCircle, XCircle, Clock,
    DollarSign, Calendar, User, FileText, AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const InvoicesRefundsPage = () => {
    const [selectedStatus, setSelectedStatus] = useState<string>('all')
    const [selectedType, setSelectedType] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')

    // Invoices and refunds data
    const transactions = [
        {
            id: 'INV-2024-001',
            type: 'invoice',
            customerName: 'Mrs. Sarah Chen',
            customerEmail: 'sarah.chen@email.com',
            customerPhone: '+852 9876 5432',
            amount: 1200,
            currency: 'HKD',
            status: 'paid',
            dueDate: '2024-01-15',
            paidDate: '2024-01-12',
            createdDate: '2024-01-01',
            description: 'Monthly gymnastics classes - Emma Chen',
            location: 'Cyberport',
            program: 'GYMTOTS',
            paymentMethod: 'Credit Card',
            items: [
                { description: 'GYMTOTS Classes (8 sessions)', quantity: 8, unitPrice: 150, total: 1200 }
            ],
            notes: 'Paid early, good customer'
        },
        {
            id: 'INV-2024-002',
            type: 'invoice',
            customerName: 'Mr. David Wong',
            customerEmail: 'david.wong@email.com',
            customerPhone: '+852 9123 4567',
            amount: 800,
            currency: 'HKD',
            status: 'overdue',
            dueDate: '2024-01-20',
            paidDate: null,
            createdDate: '2024-01-05',
            description: 'Beginner Gymnastics - Lucas Wong',
            location: 'Wan Chai',
            program: 'Beginner Gymnastics',
            paymentMethod: null,
            items: [
                { description: 'Beginner Gymnastics (4 sessions)', quantity: 4, unitPrice: 200, total: 800 }
            ],
            notes: 'Payment reminder sent 3 times',
            overdueBy: 5
        },
        {
            id: 'REF-2024-001',
            type: 'refund',
            customerName: 'Mrs. Lisa Li',
            customerEmail: 'lisa.li@email.com',
            customerPhone: '+852 9234 5678',
            amount: 600,
            currency: 'HKD',
            status: 'processed',
            requestDate: '2024-01-18',
            processedDate: '2024-01-20',
            createdDate: '2024-01-18',
            description: 'Refund for cancelled classes - Sophia Li',
            location: 'Sha Tin',
            program: 'Intermediate Gymnastics',
            refundMethod: 'Credit Card',
            originalInvoice: 'INV-2023-156',
            reason: 'Family relocation',
            items: [
                { description: 'Unused classes (3 sessions)', quantity: 3, unitPrice: 200, total: 600 }
            ],
            notes: 'Processed within 48 hours'
        },
        {
            id: 'INV-2024-003',
            type: 'invoice',
            customerName: 'Mr. James Kim',
            customerEmail: 'james.kim@email.com',
            customerPhone: '+852 9345 6789',
            amount: 200,
            currency: 'HKD',
            status: 'pending',
            dueDate: '2024-02-01',
            paidDate: null,
            createdDate: '2024-01-22',
            description: 'Trial class - Ryan Kim',
            location: 'Cyberport',
            program: 'GYMTOTS',
            paymentMethod: null,
            items: [
                { description: 'Trial Class', quantity: 1, unitPrice: 200, total: 200 }
            ],
            notes: 'New customer trial'
        },
        {
            id: 'REF-2024-002',
            type: 'refund',
            customerName: 'Mrs. Amy Zhang',
            customerEmail: 'amy.zhang@email.com',
            customerPhone: '+852 9456 7890',
            amount: 400,
            currency: 'HKD',
            status: 'pending',
            requestDate: '2024-01-23',
            processedDate: null,
            createdDate: '2024-01-23',
            description: 'Partial refund - Schedule conflict',
            location: 'Cyberport',
            program: 'Beginner Gymnastics',
            refundMethod: 'Bank Transfer',
            originalInvoice: 'INV-2024-004',
            reason: 'Schedule conflict with school',
            items: [
                { description: 'Unused classes (2 sessions)', quantity: 2, unitPrice: 200, total: 400 }
            ],
            notes: 'Awaiting approval'
        }
    ]

    // Transaction statistics
    const transactionStats = {
        totalInvoices: transactions.filter(t => t.type === 'invoice').length,
        totalRefunds: transactions.filter(t => t.type === 'refund').length,
        paidInvoices: transactions.filter(t => t.type === 'invoice' && t.status === 'paid').length,
        overdueInvoices: transactions.filter(t => t.type === 'invoice' && t.status === 'overdue').length,
        pendingRefunds: transactions.filter(t => t.type === 'refund' && t.status === 'pending').length,
        totalRevenue: transactions.filter(t => t.type === 'invoice' && t.status === 'paid').reduce((sum, t) => sum + t.amount, 0),
        totalRefunded: transactions.filter(t => t.type === 'refund' && t.status === 'processed').reduce((sum, t) => sum + t.amount, 0)
    }

    const getStatusColor = (status: string, type: string) => {
        if (type === 'invoice') {
            const colors = {
                paid: 'text-green-600 bg-green-50 border-green-200',
                pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
                overdue: 'text-red-600 bg-red-50 border-red-200',
                cancelled: 'text-gray-600 bg-gray-50 border-gray-200'
            }
            return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200'
        } else {
            const colors = {
                pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
                processed: 'text-green-600 bg-green-50 border-green-200',
                rejected: 'text-red-600 bg-red-50 border-red-200'
            }
            return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    const getTypeColor = (type: string) => {
        const colors = {
            invoice: 'text-blue-600 bg-blue-50',
            refund: 'text-purple-600 bg-purple-50'
        }
        return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-50'
    }

    const getStatusIcon = (status: string, type: string) => {
        if (type === 'invoice') {
            switch (status) {
                case 'paid': return <CheckCircle className="w-4 h-4" />
                case 'overdue': return <AlertTriangle className="w-4 h-4" />
                case 'pending': return <Clock className="w-4 h-4" />
                default: return <XCircle className="w-4 h-4" />
            }
        } else {
            switch (status) {
                case 'processed': return <CheckCircle className="w-4 h-4" />
                case 'pending': return <Clock className="w-4 h-4" />
                default: return <XCircle className="w-4 h-4" />
            }
        }
    }

    const filteredTransactions = transactions.filter(transaction => {
        const matchesStatus = selectedStatus === 'all' || transaction.status === selectedStatus
        const matchesType = selectedType === 'all' || transaction.type === selectedType
        const matchesSearch = searchTerm === '' ||
            transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.description.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesStatus && matchesType && matchesSearch
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Invoices & Refunds</h1>
                    <p className="text-gray-600 mt-2">Manage billing, payments, and refund requests</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Invoice
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                        <DollarSign className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">HK${transactionStats.totalRevenue.toLocaleString()}</div>
                        <div className="text-sm text-green-600 font-medium">From paid invoices</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Overdue Invoices</CardTitle>
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{transactionStats.overdueInvoices}</div>
                        <div className="text-sm text-red-600 font-medium">Need follow-up</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Pending Refunds</CardTitle>
                        <Clock className="h-5 w-5 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{transactionStats.pendingRefunds}</div>
                        <div className="text-sm text-yellow-600 font-medium">Awaiting processing</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Refunded</CardTitle>
                        <RefreshCw className="h-5 w-5 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">HK${transactionStats.totalRefunded.toLocaleString()}</div>
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
                                    placeholder="Search by customer name, invoice ID, or description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <select data-testid="select-admin-payments-invoices-1"
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="all">All Types</option>
                                <option value="invoice">Invoices</option>
                                <option value="refund">Refunds</option>
                            </select>
                            <select data-testid="select-admin-payments-invoices-2"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="overdue">Overdue</option>
                                <option value="processed">Processed</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Transactions List */}
            <Card>
                <CardHeader>
                    <CardTitle>Transaction Records</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredTransactions.map((transaction, index) => (
                            <motion.div
                                key={transaction.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 bg-gray-50 rounded-lg hover:shadow-md transition-all"
                            >
                                {/* Transaction Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTypeColor(transaction.type)}`}>
                                            {transaction.type === 'invoice' ? (
                                                <FileText className="w-6 h-6" />
                                            ) : (
                                                <RefreshCw className="w-6 h-6" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{transaction.id}</h3>
                                            <p className="text-sm text-gray-600">{transaction.customerName}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge className={getTypeColor(transaction.type)}>
                                                    {transaction.type}
                                                </Badge>
                                                <Badge className={getStatusColor(transaction.status, transaction.type)}>
                                                    {getStatusIcon(transaction.status, transaction.type)}
                                                    <span className="ml-1">{transaction.status}</span>
                                                </Badge>
                                                {transaction.type === 'invoice' && transaction.status === 'overdue' && transaction.overdueBy && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        {transaction.overdueBy} days overdue
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-gray-900">
                                                {transaction.currency} ${transaction.amount.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-gray-600">{transaction.location}</div>
                                        </div>
                                        <div className="flex flex-col gap-1 ml-4">
                                            <Button variant="ghost" size="sm">
                                                <Eye className="w-4 h-4 mr-2" />
                                                View
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <Download className="w-4 h-4 mr-2" />
                                                PDF
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Transaction Details */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                                    {/* Basic Information */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Transaction Details</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Description:</span>
                                                <span className="font-medium text-right">{transaction.description}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Program:</span>
                                                <span className="font-medium">{transaction.program}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Created:</span>
                                                <span className="font-medium">{transaction.createdDate}</span>
                                            </div>
                                            {transaction.type === 'invoice' && (
                                                <>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Due Date:</span>
                                                        <span className="font-medium">{transaction.dueDate}</span>
                                                    </div>
                                                    {transaction.paidDate && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Paid Date:</span>
                                                            <span className="font-medium text-green-600">{transaction.paidDate}</span>
                                                        </div>
                                                    )}
                                                    {transaction.paymentMethod && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Payment Method:</span>
                                                            <span className="font-medium">{transaction.paymentMethod}</span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            {transaction.type === 'refund' && (
                                                <>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Request Date:</span>
                                                        <span className="font-medium">{transaction.requestDate}</span>
                                                    </div>
                                                    {transaction.processedDate && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Processed Date:</span>
                                                            <span className="font-medium text-green-600">{transaction.processedDate}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Reason:</span>
                                                        <span className="font-medium text-right">{transaction.reason}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Original Invoice:</span>
                                                        <span className="font-medium">{transaction.originalInvoice}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Customer Contact */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Customer Contact</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span>{transaction.customerName}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <span>{transaction.customerEmail}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <span>{transaction.customerPhone}</span>
                                            </div>
                                            <div className="flex gap-2 mt-3">
                                                <Button variant="outline" size="sm">
                                                    <Phone className="w-4 h-4 mr-2" />
                                                    Call
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    <Mail className="w-4 h-4 mr-2" />
                                                    Email
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Line Items */}
                                <div className="border-t border-gray-200 pt-4 mb-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Line Items</h4>
                                    <div className="space-y-2">
                                        {transaction.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-2 bg-white rounded border">
                                                <div>
                                                    <span className="font-medium">{item.description}</span>
                                                    <span className="text-sm text-gray-600 ml-2">x{item.quantity}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium">HK${item.total.toLocaleString()}</div>
                                                    <div className="text-sm text-gray-600">@HK${item.unitPrice}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Notes */}
                                {transaction.notes && (
                                    <div className="border-t border-gray-200 pt-4">
                                        <h5 className="font-medium text-gray-900 mb-1">Notes</h5>
                                        <p className="text-sm text-gray-700">{transaction.notes}</p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>)
}

export default InvoicesRefundsPage
