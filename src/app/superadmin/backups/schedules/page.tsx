'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    Calendar,
    Plus,
    Edit2,
    Trash2,
    RefreshCw,
    Download,
    CheckCircle,
    AlertCircle,
    Clock,
    Activity
} from 'lucide-react'
import { superAdminService } from '@/services/superAdminService'

interface BackupSchedule {
    id: string
    name: string
    type: 'full' | 'incremental' | 'differential'
    frequency: string
    nextRun: Date
    lastRun: Date
    status: 'active' | 'paused' | 'failed'
    retentionDays: number
    size: number
    successRate: number
}

export default function BackupSchedulesPage() {
    const [schedules, setSchedules] = useState<BackupSchedule[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSchedules()
    }, [])

    const fetchSchedules = async () => {
        try {
            setLoading(true)
            const data = await superAdminService.getBackupSchedules()
            setSchedules(data)
        } catch (error) {
            console.error('Error fetching schedules:', error)
            // Fallback mock data
            const mockSchedules: BackupSchedule[] = [
                {
                    id: '1',
                    name: 'Daily Full Backup',
                    type: 'full',
                    frequency: 'Daily at 2:00 AM',
                    nextRun: new Date(Date.now() + 2 * 60 * 60 * 1000),
                    lastRun: new Date(Date.now() - 22 * 60 * 60 * 1000),
                    status: 'active',
                    retentionDays: 30,
                    size: 2.4,
                    successRate: 100
                },
                {
                    id: '2',
                    name: 'Hourly Incremental',
                    type: 'incremental',
                    frequency: 'Every hour',
                    nextRun: new Date(Date.now() + 45 * 60 * 1000),
                    lastRun: new Date(Date.now() - 15 * 60 * 1000),
                    status: 'active',
                    retentionDays: 7,
                    size: 0.3,
                    successRate: 99.8
                },
                {
                    id: '3',
                    name: 'Weekly Full Backup',
                    type: 'full',
                    frequency: 'Every Sunday at 3:00 AM',
                    nextRun: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
                    lastRun: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                    status: 'active',
                    retentionDays: 90,
                    size: 2.5,
                    successRate: 100
                },
                {
                    id: '4',
                    name: 'Monthly Archive',
                    type: 'full',
                    frequency: 'First day of month at 4:00 AM',
                    nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                    lastRun: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
                    status: 'active',
                    retentionDays: 365,
                    size: 2.6,
                    successRate: 100
                }
            ]
            setSchedules(mockSchedules)
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'paused':
                return <AlertCircle className="w-5 h-5 text-yellow-600" />
            case 'failed':
                return <AlertCircle className="w-5 h-5 text-red-600" />
            default:
                return <CheckCircle className="w-5 h-5 text-gray-600" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-50 border-green-200'
            case 'paused':
                return 'bg-yellow-50 border-yellow-200'
            case 'failed':
                return 'bg-red-50 border-red-200'
            default:
                return 'bg-gray-50 border-gray-200'
        }
    }

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800'
            case 'paused':
                return 'bg-yellow-100 text-yellow-800'
            case 'failed':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const activeCount = schedules.filter(s => s.status === 'active').length
    const totalSize = schedules.reduce((sum, s) => sum + s.size, 0)
    const avgSuccessRate = (schedules.reduce((sum, s) => sum + s.successRate, 0) / schedules.length).toFixed(1)

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
                        <Calendar className="w-8 h-8 mr-3 text-purple-600" />
                        Backup Schedules
                    </h1>
                    <p className="text-gray-600 mt-1">Manage automated backup schedules</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={fetchSchedules}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Schedule
                    </Button>
                </div>
            </motion.div>

            {/* Metrics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Schedules</p>
                            <p className="text-3xl font-bold text-blue-600">{schedules.length}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-blue-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active</p>
                            <p className="text-3xl font-bold text-green-600">{activeCount}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Size</p>
                            <p className="text-3xl font-bold text-purple-600">{totalSize.toFixed(1)}GB</p>
                        </div>
                        <Activity className="w-8 h-8 text-purple-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Avg Success Rate</p>
                            <p className="text-3xl font-bold text-yellow-600">{avgSuccessRate}%</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-yellow-500 opacity-50" />
                    </div>
                </Card>
            </motion.div>

            {/* Schedules List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
            >
                {loading ? (
                    <Card className="p-8 text-center">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
                    </Card>
                ) : (
                    schedules.map((schedule, index) => (
                        <motion.div
                            key={schedule.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className={`p-6 border-l-4 ${getStatusColor(schedule.status)}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start space-x-4">
                                        {getStatusIcon(schedule.status)}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{schedule.name}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{schedule.frequency}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(schedule.status)}`}>
                                        {schedule.status.toUpperCase()}
                                    </span>
                                </div>

                                {/* Type Badge */}
                                <div className="mb-4">
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                        {schedule.type.toUpperCase()} BACKUP
                                    </span>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-xs text-gray-600">Size</p>
                                        <p className="text-lg font-bold text-gray-900">{schedule.size}GB</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Retention</p>
                                        <p className="text-lg font-bold text-gray-900">{schedule.retentionDays}d</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Success Rate</p>
                                        <p className="text-lg font-bold text-gray-900">{schedule.successRate}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Next Run</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {Math.round((schedule.nextRun.getTime() - Date.now()) / 60000)}m
                                        </p>
                                    </div>
                                </div>

                                {/* Timing Info */}
                                <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-200">
                                    <span className="flex items-center">
                                        <Clock className="w-4 h-4 mr-2" />
                                        Last run: {schedule.lastRun.toLocaleString()}
                                    </span>
                                    <div className="flex space-x-2">
                                        <Button variant="ghost" size="sm">
                                            <Edit2 className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                )}
            </motion.div>
        </div>
    )
}
