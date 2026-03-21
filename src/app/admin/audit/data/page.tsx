'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Database, Edit, Trash2, Plus, FileText, Users, Calendar,
    CreditCard, Clock, Activity, Search, Filter, Download,
    RefreshCw, Eye, ArrowUpDown, AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { responsiveClasses } from '@/lib/responsiveClasses'

const DataChangesPage = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedTable, setSelectedTable] = useState('all')
    const [selectedOperation, setSelectedOperation] = useState('all')

    // Database tables
    const databaseTables = [
        { id: 'all', name: 'All Tables', count: 456, color: 'bg-gray-100 text-gray-700' },
        { id: 'customers', name: 'Customers', count: 123, color: 'bg-blue-100 text-blue-700' },
        { id: 'bookings', name: 'Bookings', count: 89, color: 'bg-green-100 text-green-700' },
        { id: 'payments', name: 'Payments', count: 67, color: 'bg-yellow-100 text-yellow-700' },
        { id: 'users', name: 'Users', count: 45, color: 'bg-purple-100 text-purple-700' },
        { id: 'classes', name: 'Classes', count: 132, color: 'bg-pink-100 text-pink-700' }
    ]

    // Operation types
    const operationTypes = [
        { id: 'all', name: 'All Operations', count: 456 },
        { id: 'create', name: 'Create', count: 156 },
        { id: 'update', name: 'Update', count: 234 },
        { id: 'delete', name: 'Delete', count: 66 }
    ]

    // Data change statistics
    const dataStats = [
        {
            title: 'Total Changes Today',
            value: '456',
            change: '+23%',
            changeType: 'increase',
            icon: Database,
            color: 'text-blue-600'
        },
        {
            title: 'Records Created',
            value: '156',
            change: '+18%',
            changeType: 'increase',
            icon: Plus,
            color: 'text-green-600'
        },
        {
            title: 'Records Updated',
            value: '234',
            change: '+12%',
            changeType: 'increase',
            icon: Edit,
            color: 'text-yellow-600'
        },
        {
            title: 'Records Deleted',
            value: '66',
            change: '+45%',
            changeType: 'increase',
            icon: Trash2,
            color: 'text-red-600'
        }
    ]

    // Data change logs
    const dataChanges = [
        {
            id: 1,
            timestamp: '2024-01-25 15:30:22',
            table: 'customers',
            operation: 'update',
            recordId: 'CUST-12345',
            user: 'sarah.wilson@progym.hk',
            changes: {
                field: 'phone_number',
                oldValue: '+852 1234 5678',
                newValue: '+852 9876 5432'
            },
            reason: 'Customer requested phone number update'
        },
        {
            id: 2,
            timestamp: '2024-01-25 15:28:15',
            table: 'bookings',
            operation: 'create',
            recordId: 'BK-2024-001',
            user: 'john.doe@progym.hk',
            changes: {
                field: 'new_record',
                oldValue: null,
                newValue: 'Tennis lesson booking for Lisa Park'
            },
            reason: 'New booking created via admin panel'
        },
        {
            id: 3,
            timestamp: '2024-01-25 15:25:08',
            table: 'payments',
            operation: 'update',
            recordId: 'PAY-2024-089',
            user: 'system',
            changes: {
                field: 'status',
                oldValue: 'pending',
                newValue: 'completed'
            },
            reason: 'Payment gateway confirmation received'
        },
        {
            id: 4,
            timestamp: '2024-01-25 15:20:33',
            table: 'users',
            operation: 'create',
            recordId: 'USER-2024-045',
            user: 'mike.chen@progym.hk',
            changes: {
                field: 'new_record',
                oldValue: null,
                newValue: 'New coach account: alex.smith@progym.hk'
            },
            reason: 'New coach onboarding'
        },
        {
            id: 5,
            timestamp: '2024-01-25 15:15:44',
            table: 'classes',
            operation: 'delete',
            recordId: 'CLASS-2024-078',
            user: 'admin@progym.hk',
            changes: {
                field: 'record_deleted',
                oldValue: 'Advanced Tennis - Saturday 10:00 AM',
                newValue: null
            },
            reason: 'Class cancelled due to low enrollment'
        }
    ]

    const getOperationIcon = (operation: string) => {
        const icons = {
            create: Plus,
            update: Edit,
            delete: Trash2
        }
        return icons[operation as keyof typeof icons] || Activity
    }

    const getOperationColor = (operation: string) => {
        const colors = {
            create: 'text-green-600 bg-green-100',
            update: 'text-yellow-600 bg-yellow-100',
            delete: 'text-red-600 bg-red-100'
        }
        return colors[operation as keyof typeof colors] || 'text-gray-600 bg-gray-100'
    }

    const getTableIcon = (table: string) => {
        const icons = {
            customers: Users,
            bookings: Calendar,
            payments: CreditCard,
            users: Users,
            classes: FileText
        }
        return icons[table as keyof typeof icons] || Database
    }

    return (
        <div className={responsiveClasses.pageContainer}>
            {/* Header */}
            <div className={responsiveClasses.headerContainer}>
                <div>
                    <h1 className={responsiveClasses.headerTitle}>Data Changes</h1>
                    <p className={responsiveClasses.headerSubtitle}>
                        Track all database modifications and data integrity
                    </p>
                </div>
                <div className={responsiveClasses.buttonGroup}>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export Changes
                    </Button>
                    <Button>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Data Statistics */}
            <div className={responsiveClasses.metricsGrid}>
                {dataStats.map((stat, index) => {
                    const IconComponent = stat.icon
                    return (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className={responsiveClasses.card}>
                                <CardContent className={responsiveClasses.cardContent}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">
                                                {stat.title}
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                                {stat.value}
                                            </p>
                                            <p className={`text-sm mt-1 ${stat.changeType === 'increase' ? 'text-green-600' :
                                                    stat.changeType === 'decrease' ? 'text-red-600' :
                                                        'text-gray-600'
                                                }`}>
                                                {stat.change}
                                            </p>
                                        </div>
                                        <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                                            <IconComponent className="w-6 h-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>

            {/* Filters */}
            <Card className={responsiveClasses.card}>
                <CardContent className={responsiveClasses.cardContent}>
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search by record ID or user..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Table Filter */}
                        <select data-testid="select-admin-audit-data-1"
                            value={selectedTable}
                            onChange={(e) => setSelectedTable(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {databaseTables.map((table) => (
                                <option key={table.id} value={table.id}>
                                    {table.name} ({table.count})
                                </option>
                            ))}
                        </select>

                        {/* Operation Filter */}
                        <select data-testid="select-admin-audit-data-2"
                            value={selectedOperation}
                            onChange={(e) => setSelectedOperation(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {operationTypes.map((operation) => (
                                <option key={operation.id} value={operation.id}>
                                    {operation.name} ({operation.count})
                                </option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Data Changes Table */}
            <Card className={responsiveClasses.card}>
                <CardHeader className={responsiveClasses.cardHeader}>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Recent Data Changes
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left p-4 font-medium text-gray-900">Timestamp</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Table</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Operation</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Record ID</th>
                                    <th className="text-left p-4 font-medium text-gray-900">User</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Changes</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Reason</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {dataChanges.map((change) => {
                                    const OperationIcon = getOperationIcon(change.operation)
                                    const TableIcon = getTableIcon(change.table)
                                    return (
                                        <tr key={change.id} className="hover:bg-gray-50">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-900">
                                                        {change.timestamp}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <TableIcon className="w-4 h-4 text-gray-600" />
                                                    <span className="text-sm font-medium text-gray-900 capitalize">
                                                        {change.table}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge className={getOperationColor(change.operation)}>
                                                    <OperationIcon className="w-3 h-3 mr-1" />
                                                    {change.operation}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm font-mono text-gray-900">
                                                    {change.recordId}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm text-gray-600">
                                                    {change.user}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">
                                                        {change.changes.field}
                                                    </div>
                                                    {change.changes.oldValue && (
                                                        <div className="text-red-600 text-xs">
                                                            - {change.changes.oldValue}
                                                        </div>
                                                    )}
                                                    {change.changes.newValue && (
                                                        <div className="text-green-600 text-xs">
                                                            + {change.changes.newValue}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm text-gray-600 max-w-xs truncate">
                                                    {change.reason}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <ArrowUpDown className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default DataChangesPage
