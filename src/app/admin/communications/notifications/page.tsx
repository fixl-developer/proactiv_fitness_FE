'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, Plus, RefreshCw, Download, Filter, Send, Clock, Mail, Smartphone, MessageSquare, MonitorSmartphone, Eye, MoreVertical, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const notifications = [
    { id: 1, title: 'Term Start Reminder', type: 'Email', typeColor: 'bg-blue-100 text-blue-700', recipients: 450, sentDate: 'Mar 15, 2026', status: 'Sent', statusColor: 'bg-green-100 text-green-700', openRate: 72 },
    { id: 2, title: 'Class Cancelled - Mar 20', type: 'Push', typeColor: 'bg-purple-100 text-purple-700', recipients: 25, sentDate: 'Mar 18, 2026', status: 'Sent', statusColor: 'bg-green-100 text-green-700', openRate: 95 },
    { id: 3, title: 'Payment Due Reminder', type: 'SMS', typeColor: 'bg-orange-100 text-orange-700', recipients: 38, sentDate: 'Mar 20, 2026', status: 'Scheduled', statusColor: 'bg-yellow-100 text-yellow-700', openRate: null },
    { id: 4, title: 'New Summer Camp', type: 'Email', typeColor: 'bg-blue-100 text-blue-700', recipients: null, sentDate: null, status: 'Draft', statusColor: 'bg-gray-100 text-gray-700', openRate: null },
    { id: 5, title: 'Coach Assignment Update', type: 'In-App', typeColor: 'bg-teal-100 text-teal-700', recipients: 5, sentDate: 'Mar 17, 2026', status: 'Sent', statusColor: 'bg-green-100 text-green-700', openRate: 100 },
]

const typeIcons: Record<string, React.ReactNode> = {
    Email: <Mail className="w-3.5 h-3.5" />,
    SMS: <Smartphone className="w-3.5 h-3.5" />,
    Push: <MonitorSmartphone className="w-3.5 h-3.5" />,
    'In-App': <MessageSquare className="w-3.5 h-3.5" />,
}

export default function NotificationsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<string>('All')

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600)
        return () => clearTimeout(timer)
    }, [])

    const filtered = notifications.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = filterType === 'All' || n.type === filterType
        return matchesSearch && matchesType
    })

    const stats = [
        { label: 'Sent (30d)', value: '1,245', icon: Send, color: 'text-blue-600', bg: 'bg-blue-50', change: '+12%' },
        { label: 'Delivered', value: '1,198', icon: Bell, color: 'text-green-600', bg: 'bg-green-50', change: '96.2%' },
        { label: 'Open Rate', value: '78.5%', icon: Eye, color: 'text-indigo-600', bg: 'bg-indigo-50', change: '+3.2%' },
        { label: 'Pending', value: '38', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', change: '2 scheduled' },
    ]

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-lg"></div>)}
                    </div>
                    <div className="h-96 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-3xl font-bold text-gray-900">Notifications Management</h1>
                    <p className="text-gray-600 mt-1">Send, schedule, and track all notifications across channels</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Send className="w-4 h-4 mr-2" />
                        Send Notification
                    </Button>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Card className="hover:shadow-lg transition-all duration-300 border-l-4" style={{ borderLeftColor: stat.color.includes('blue') ? '#2563eb' : stat.color.includes('green') ? '#16a34a' : stat.color.includes('indigo') ? '#4f46e5' : '#d97706' }}>
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                        <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                                        <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
                                    </div>
                                    <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search notifications..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {['All', 'Email', 'SMS', 'Push', 'In-App'].map(t => (
                                    <Button key={t} variant={filterType === t ? 'default' : 'outline'} size="sm" onClick={() => setFilterType(t)}>
                                        {t}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bell className="w-5 h-5 text-blue-600" />
                                <CardTitle>Recent Notifications</CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">{filtered.length} notifications</Badge>
                                <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Title</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Type</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Recipients</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Sent Date</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Open Rate</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {filtered.map((n, i) => (
                                            <motion.tr
                                                key={n.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                            >
                                                <td className="py-3.5 px-4">
                                                    <span className="font-medium text-gray-900">{n.title}</span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <Badge className={`${n.typeColor} gap-1`}>
                                                        {typeIcons[n.type]}
                                                        {n.type}
                                                    </Badge>
                                                </td>
                                                <td className="py-3.5 px-4 text-gray-600">
                                                    {n.recipients ? n.recipients.toLocaleString() : <span className="text-gray-400">-</span>}
                                                </td>
                                                <td className="py-3.5 px-4 text-gray-600">
                                                    {n.sentDate || <span className="text-gray-400">-</span>}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <Badge className={n.statusColor}>{n.status}</Badge>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {n.openRate !== null ? (
                                                        <div className="flex items-center gap-2">
                                                            <Progress value={n.openRate} className="w-16 h-2" />
                                                            <span className="text-sm font-medium text-gray-700">{n.openRate}%</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
