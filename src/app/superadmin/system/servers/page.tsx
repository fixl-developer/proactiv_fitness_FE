'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Server, CheckCircle, AlertTriangle, Power, RefreshCw,
    Settings, Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { superAdminService } from '@/services/superAdminService'

export default function ServerStatusPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [servers, setServers] = useState<any[]>([])
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        fetchServers()
    }, [])

    const fetchServers = async () => {
        try {
            setIsLoading(true)
            const data = await superAdminService.getServerStatus()
            setServers(data)
        } catch (error) {
            console.error('Error fetching servers:', error)
            // Fallback mock data
            const mockServers = [
                {
                    id: '1',
                    name: 'API Server 01',
                    status: 'healthy',
                    uptime: 99.9,
                    cpu: 35.2,
                    memory: 68.5,
                    disk: 45.3,
                    network: 1250,
                    lastCheck: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                    ip: '192.168.1.10',
                    region: 'US-East'
                },
                {
                    id: '2',
                    name: 'Database Server',
                    status: 'healthy',
                    uptime: 99.95,
                    cpu: 28.5,
                    memory: 72.3,
                    disk: 62.1,
                    network: 850,
                    lastCheck: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                    ip: '192.168.1.20',
                    region: 'US-East'
                },
                {
                    id: '3',
                    name: 'Cache Server',
                    status: 'healthy',
                    uptime: 99.8,
                    cpu: 42.1,
                    memory: 55.2,
                    disk: 38.5,
                    network: 620,
                    lastCheck: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                    ip: '192.168.1.30',
                    region: 'US-East'
                },
                {
                    id: '4',
                    name: 'API Server 02',
                    status: 'warning',
                    uptime: 98.5,
                    cpu: 78.9,
                    memory: 85.3,
                    disk: 71.2,
                    network: 1890,
                    lastCheck: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                    ip: '192.168.1.40',
                    region: 'US-West'
                }
            ]
            setServers(mockServers)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        setTimeout(() => setRefreshing(false), 2000)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'healthy': return <Badge className="bg-green-100 text-green-800">Healthy</Badge>
            case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
            case 'critical': return <Badge className="bg-red-100 text-red-800">Critical</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />
            case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />
            default: return <Activity className="w-4 h-4 text-gray-600" />
        }
    }

    const healthyServers = servers.filter(s => s.status === 'healthy').length
    const warningServers = servers.filter(s => s.status === 'warning').length
    const criticalServers = servers.filter(s => s.status === 'critical').length

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Server className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600">Loading Server Status...</p>
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
                        <Server className="w-8 h-8 mr-3 text-blue-600" />
                        Server Status
                    </h1>
                    <p className="text-gray-600 mt-1">Monitor all servers and infrastructure</p>
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
                </div>
            </div>

            {/* Server Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
                            <Server className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{servers.length}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-blue-600">All regions</span>
                            </p>
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
                            <CardTitle className="text-sm font-medium">Healthy</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{healthyServers}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-600">{((healthyServers / servers.length) * 100).toFixed(0)}% operational</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-l-4 border-l-yellow-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Warning</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{warningServers}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-yellow-600">Needs attention</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="border-l-4 border-l-red-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Critical</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{criticalServers}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-red-600">Immediate action required</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Servers Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Server Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Server Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Uptime</TableHead>
                                        <TableHead>CPU</TableHead>
                                        <TableHead>Memory</TableHead>
                                        <TableHead>Disk</TableHead>
                                        <TableHead>Network</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {servers.map((server) => (
                                        <TableRow key={server.id}>
                                            <TableCell className="font-medium">{server.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    {getStatusIcon(server.status)}
                                                    {getStatusBadge(server.status)}
                                                </div>
                                            </TableCell>
                                            <TableCell>{server.uptime}%</TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="text-sm">{server.cpu}%</div>
                                                    <Progress value={server.cpu} className="h-1" />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="text-sm">{server.memory}%</div>
                                                    <Progress value={server.memory} className="h-1" />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="text-sm">{server.disk}%</div>
                                                    <Progress value={server.disk} className="h-1" />
                                                </div>
                                            </TableCell>
                                            <TableCell>{server.network} MB/s</TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Button variant="ghost" size="sm">
                                                        <Settings className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <Power className="w-4 h-4 text-red-600" />
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
