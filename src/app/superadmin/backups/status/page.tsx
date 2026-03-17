'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Archive, Download, Upload, RefreshCw, AlertTriangle, CheckCircle,
    HardDrive, Zap, Trash2, Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { superAdminService } from '@/services/superAdminService'

export default function BackupStatusPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [backups, setBackups] = useState<any[]>([])
    const [isCreatingBackup, setIsCreatingBackup] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        const fetchBackups = async () => {
            try {
                // Mock data - in real app, fetch from backend
                const mockBackups = [
                    {
                        id: '1',
                        name: 'backup_2024_03_15_10_30',
                        size: 1.2,
                        status: 'completed',
                        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                        duration: '15 minutes',
                        type: 'full'
                    },
                    {
                        id: '2',
                        name: 'backup_2024_03_14_22_00',
                        size: 1.15,
                        status: 'completed',
                        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                        duration: '14 minutes',
                        type: 'full'
                    },
                    {
                        id: '3',
                        name: 'backup_2024_03_13_22_00',
                        size: 1.18,
                        status: 'completed',
                        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
                        duration: '16 minutes',
                        type: 'full'
                    },
                    {
                        id: '4',
                        name: 'backup_2024_03_12_22_00',
                        size: 1.1,
                        status: 'completed',
                        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
                        duration: '13 minutes',
                        type: 'full'
                    }
                ]
                setBackups(mockBackups)
            } catch (error) {
                console.error('Error fetching backups:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchBackups()
    }, [])

    const handleCreateBackup = async () => {
        setIsCreatingBackup(true)
        try {
            await superAdminService.createBackup()
            // Refresh backups list
            setTimeout(() => setIsCreatingBackup(false), 2000)
        } catch (error) {
            console.error('Error creating backup:', error)
            setIsCreatingBackup(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        setTimeout(() => setRefreshing(false), 2000)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <Badge className="bg-green-100 text-green-800">Completed</Badge>
            case 'in_progress': return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
            case 'failed': return <Badge className="bg-red-100 text-red-800">Failed</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Archive className="w-12 h-12 text-orange-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600">Loading Backup Status...</p>
                </div>
            </div>
        )
    }

    const totalBackupSize = backups.reduce((sum, b) => sum + b.size, 0)
    const completedBackups = backups.filter(b => b.status === 'completed').length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Archive className="w-8 h-8 mr-3 text-orange-600" />
                        Backup & Recovery
                    </h1>
                    <p className="text-gray-600 mt-1">Manage database backups and recovery</p>
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
                    <Button
                        onClick={handleCreateBackup}
                        disabled={isCreatingBackup}
                        className="bg-orange-600 hover:bg-orange-700 flex items-center"
                    >
                        <Zap className={`w-4 h-4 mr-2 ${isCreatingBackup ? 'animate-spin' : ''}`} />
                        Create Backup
                    </Button>
                </div>
            </div>

            {/* Backup Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-l-4 border-l-orange-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
                            <Archive className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{backups.length}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-600">{completedBackups} completed</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
                            <HardDrive className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{totalBackupSize.toFixed(2)} GB</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-blue-600">All backups combined</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
                            <Calendar className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold text-green-600">
                                {backups.length > 0 ? formatDate(backups[0].createdAt) : 'Never'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-600">2 hours ago</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="border-l-4 border-l-purple-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Backup Status</CardTitle>
                            <CheckCircle className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">Healthy</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-purple-600">All systems operational</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="backups" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="backups">Backups</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    <TabsTrigger value="recovery">Recovery</TabsTrigger>
                </TabsList>

                {/* Backups Tab */}
                <TabsContent value="backups">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Archive className="w-5 h-5 mr-2 text-orange-600" />
                                    Backup History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Backup Name</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Size</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Created</TableHead>
                                                <TableHead>Duration</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {backups.map((backup) => (
                                                <TableRow key={backup.id}>
                                                    <TableCell className="font-medium">{backup.name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{backup.type}</Badge>
                                                    </TableCell>
                                                    <TableCell>{backup.size} GB</TableCell>
                                                    <TableCell>{getStatusBadge(backup.status)}</TableCell>
                                                    <TableCell className="text-sm">
                                                        {formatDate(backup.createdAt)}
                                                    </TableCell>
                                                    <TableCell className="text-sm">{backup.duration}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            <Button variant="ghost" size="sm">
                                                                <Upload className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm">
                                                                <Download className="w-4 h-4" />
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
                </TabsContent>

                {/* Schedule Tab */}
                <TabsContent value="schedule">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                                    Backup Schedule
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-2">Daily Backup</p>
                                        <p className="text-lg font-semibold text-gray-900">10:00 PM</p>
                                        <Badge className="mt-2 bg-green-100 text-green-800">Enabled</Badge>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-2">Weekly Backup</p>
                                        <p className="text-lg font-semibold text-gray-900">Sunday 2:00 AM</p>
                                        <Badge className="mt-2 bg-green-100 text-green-800">Enabled</Badge>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-2">Monthly Backup</p>
                                        <p className="text-lg font-semibold text-gray-900">1st of Month 3:00 AM</p>
                                        <Badge className="mt-2 bg-green-100 text-green-800">Enabled</Badge>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-2">Retention Policy</p>
                                        <p className="text-lg font-semibold text-gray-900">30 Days</p>
                                        <Badge className="mt-2 bg-blue-100 text-blue-800">Active</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* Recovery Tab */}
                <TabsContent value="recovery">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Zap className="w-5 h-5 mr-2 text-red-600" />
                                    Disaster Recovery
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-start space-x-3">
                                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-red-900">Disaster Recovery Plan</p>
                                            <p className="text-sm text-red-700 mt-1">
                                                In case of system failure, use the recovery tools below to restore your database from the latest backup.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
                                        <Upload className="w-6 h-6 mb-2 text-blue-600" />
                                        <span className="text-sm">Restore from Backup</span>
                                    </Button>

                                    <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
                                        <Download className="w-6 h-6 mb-2 text-green-600" />
                                        <span className="text-sm">Export Database</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
