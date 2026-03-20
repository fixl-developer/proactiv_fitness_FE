'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, Plus, RefreshCw, Download, Filter, Send, Clock, Mail, Smartphone, MessageSquare, MonitorSmartphone, Eye, MoreVertical, CheckCircle, Trash2, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

interface Notification {
    id: number | string
    title: string
    type: string
    typeColor: string
    recipients: number | null
    sentDate: string | null
    status: string
    statusColor: string
    openRate: number | null
    read?: boolean
    message?: string
}

function getTypeColor(type: string): string {
    const map: Record<string, string> = {
        EMAIL: 'bg-blue-100 text-blue-700',
        SMS: 'bg-orange-100 text-orange-700',
        PUSH: 'bg-purple-100 text-purple-700',
        IN_APP: 'bg-teal-100 text-teal-700',
    }
    return map[type] || 'bg-gray-100 text-gray-700'
}

function getTypeLabel(type: string): string {
    const map: Record<string, string> = {
        EMAIL: 'Email',
        SMS: 'SMS',
        PUSH: 'Push',
        IN_APP: 'In-App',
    }
    return map[type] || type
}

function getStatusColor(status: string): string {
    const map: Record<string, string> = {
        SENT: 'bg-green-100 text-green-700',
        DELIVERED: 'bg-green-100 text-green-700',
        READ: 'bg-blue-100 text-blue-700',
        PENDING: 'bg-yellow-100 text-yellow-700',
        FAILED: 'bg-red-100 text-red-700',
        SCHEDULED: 'bg-yellow-100 text-yellow-700',
    }
    return map[status?.toUpperCase()] || 'bg-gray-100 text-gray-700'
}

const typeIcons: Record<string, React.ReactNode> = {
    EMAIL: <Mail className="w-3.5 h-3.5" />,
    SMS: <Smartphone className="w-3.5 h-3.5" />,
    PUSH: <MonitorSmartphone className="w-3.5 h-3.5" />,
    IN_APP: <MessageSquare className="w-3.5 h-3.5" />,
}

export default function NotificationsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<string>('All')
    const [filterStatus, setFilterStatus] = useState<string>('All')
    const [showSendModal, setShowSendModal] = useState(false)
    const [sendForm, setSendForm] = useState({ type: 'EMAIL', title: '', message: '', recipients: '' })
    const [sending, setSending] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | number | null>(null)

    const loadNotifications = useCallback(async () => {
        try {
            const data = await apiClient.get<any>('/notifications/user')
            const items = Array.isArray(data) ? data : (data?.data || data?.notifications || [])
            const mapped: Notification[] = items.map((n: any) => ({
                id: n.id || n._id,
                title: n.title || n.subject || 'Untitled',
                type: (n.type || 'EMAIL').toUpperCase(),
                typeColor: getTypeColor((n.type || 'EMAIL').toUpperCase()),
                recipients: n.recipients?.length || n.recipientCount || null,
                sentDate: n.sentDate || n.sentAt || n.createdAt || null,
                status: (n.status || 'SENT').toUpperCase(),
                statusColor: getStatusColor((n.status || 'SENT').toUpperCase()),
                openRate: n.openRate ?? null,
                read: n.read ?? n.isRead ?? false,
                message: n.message || n.body || '',
            }))
            setNotifications(mapped)
        } catch {
            setNotifications([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadNotifications()
    }, [loadNotifications])

    const handleSendNotification = async () => {
        if (!sendForm.title.trim() || !sendForm.message.trim()) {
            toast.error('Title and message are required')
            return
        }
        setSending(true)
        try {
            const recipientList = sendForm.recipients.split(',').map(r => r.trim()).filter(Boolean)
            if (recipientList.length > 1) {
                await apiClient.post('/notifications/send-bulk', {
                    type: sendForm.type,
                    title: sendForm.title,
                    message: sendForm.message,
                    recipients: recipientList,
                })
            } else {
                await apiClient.post('/notifications/send', {
                    type: sendForm.type,
                    title: sendForm.title,
                    message: sendForm.message,
                    recipients: recipientList,
                })
            }
            toast.success('Notification sent successfully')
            setShowSendModal(false)
            setSendForm({ type: 'EMAIL', title: '', message: '', recipients: '' })
            loadNotifications()
        } catch (err: any) {
            toast.error('Failed to send notification: ' + (err?.response?.data?.message || err?.message || 'Unknown error'))
        } finally {
            setSending(false)
        }
    }

    const handleMarkAsRead = async (id: number | string) => {
        try {
            await apiClient.put(`/notifications/${id}/read`)
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, status: 'READ', statusColor: getStatusColor('READ') } : n))
            toast.success('Marked as read')
        } catch (err: any) {
            toast.error('Failed to mark as read: ' + (err?.response?.data?.message || err?.message || 'Unknown error'))
        }
    }

    const handleDelete = async (id: number | string) => {
        try {
            await apiClient.delete(`/notifications/${id}`)
            setNotifications(prev => prev.filter(n => n.id !== id))
            toast.success('Notification deleted')
            setDeleteConfirm(null)
        } catch (err: any) {
            toast.error('Failed to delete: ' + (err?.response?.data?.message || err?.message || 'Unknown error'))
        }
    }

    const filtered = notifications.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = filterType === 'All' || n.type === filterType
        const matchesStatus = filterStatus === 'All' || n.status === filterStatus
        return matchesSearch && matchesType && matchesStatus
    })

    const totalCount = notifications.length
    const sentCount = notifications.filter(n => ['SENT', 'DELIVERED', 'READ'].includes(n.status)).length
    const readCount = notifications.filter(n => n.read || n.status === 'READ').length
    const openRate = totalCount > 0 ? ((readCount / totalCount) * 100).toFixed(1) : '0'
    const pendingCount = notifications.filter(n => ['PENDING', 'SCHEDULED'].includes(n.status)).length

    const stats = [
        { label: 'Sent (30d)', value: sentCount.toString(), icon: Send, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100', change: `${totalCount} total` },
        { label: 'Delivered', value: readCount.toString(), icon: CheckCircle, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100', change: sentCount > 0 ? `${((readCount / Math.max(sentCount, 1)) * 100).toFixed(1)}%` : '0%' },
        { label: 'Open Rate', value: `${openRate}%`, icon: Eye, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100', change: 'Read / Total' },
        { label: 'Pending', value: pendingCount.toString(), icon: Clock, gradient: 'from-orange-500 to-orange-600', bgGradient: 'from-orange-50 to-orange-100', change: 'Scheduled' },
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
                    <Button variant="outline" size="sm" onClick={() => { setIsLoading(true); loadNotifications() }}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowSendModal(true)}>
                        <Send className="w-4 h-4 mr-2" />
                        Send Notification
                    </Button>
                </motion.div>
            </div>

            {/* Send Notification Modal */}
            <AnimatePresence>
                {showSendModal && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <Card className="border-blue-200 shadow-lg">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Send className="w-5 h-5 text-blue-600" />
                                        Send New Notification
                                    </CardTitle>
                                    <Button variant="ghost" size="sm" onClick={() => setShowSendModal(false)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
                                        <select value={sendForm.type} onChange={e => setSendForm(f => ({ ...f, type: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none">
                                            <option value="EMAIL">Email</option>
                                            <option value="SMS">SMS</option>
                                            <option value="PUSH">Push</option>
                                            <option value="IN_APP">In-App</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Title</label>
                                        <input type="text" value={sendForm.title} onChange={e => setSendForm(f => ({ ...f, title: e.target.value }))} placeholder="Notification title" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Recipients (comma-separated user IDs)</label>
                                    <textarea value={sendForm.recipients} onChange={e => setSendForm(f => ({ ...f, recipients: e.target.value }))} placeholder="user-id-1, user-id-2, ..." rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none resize-none" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Message</label>
                                    <textarea value={sendForm.message} onChange={e => setSendForm(f => ({ ...f, message: e.target.value }))} placeholder="Write your notification message..." rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none resize-none" />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setShowSendModal(false)}>Cancel</Button>
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleSendNotification} disabled={sending}>
                                        {sending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                        {sending ? 'Sending...' : 'Send'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <div className={`rounded-lg border-0 bg-gradient-to-br ${stat.bgGradient} p-4 hover:shadow-lg transition-all`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className={`bg-gradient-to-br ${stat.gradient} p-2.5 rounded-lg shadow-md`}>
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 font-medium mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                        </div>
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
                                {['All', 'EMAIL', 'SMS', 'PUSH', 'IN_APP'].map(t => (
                                    <Button key={t} variant={filterType === t ? 'default' : 'outline'} size="sm" onClick={() => setFilterType(t)}>
                                        {t === 'All' ? 'All Types' : getTypeLabel(t)}
                                    </Button>
                                ))}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {['All', 'SENT', 'READ', 'PENDING', 'FAILED'].map(s => (
                                    <Button key={s} variant={filterStatus === s ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus(s)}>
                                        {s === 'All' ? 'All Status' : s.charAt(0) + s.slice(1).toLowerCase()}
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
                            <Badge variant="outline">{filtered.length} notifications</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filtered.length === 0 ? (
                            <div className="text-center py-12">
                                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-500 mb-1">No notifications found</h3>
                                <p className="text-sm text-gray-400">Send your first notification to get started</p>
                            </div>
                        ) : (
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
                                                        <span className={`font-medium ${n.read ? 'text-gray-500' : 'text-gray-900'}`}>{n.title}</span>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <Badge className={`${n.typeColor} gap-1`}>
                                                            {typeIcons[n.type]}
                                                            {getTypeLabel(n.type)}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-gray-600">
                                                        {n.recipients ? n.recipients.toLocaleString() : <span className="text-gray-400">-</span>}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-gray-600 text-sm">
                                                        {n.sentDate ? new Date(n.sentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : <span className="text-gray-400">-</span>}
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
                                                        <div className="flex items-center gap-1 justify-end">
                                                            {!n.read && (
                                                                <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(n.id)} title="Mark as read">
                                                                    <Eye className="w-4 h-4 text-blue-500" />
                                                                </Button>
                                                            )}
                                                            {deleteConfirm === n.id ? (
                                                                <div className="flex items-center gap-1">
                                                                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 text-xs" onClick={() => handleDelete(n.id)}>
                                                                        Confirm
                                                                    </Button>
                                                                    <Button variant="ghost" size="sm" className="text-gray-500 text-xs" onClick={() => setDeleteConfirm(null)}>
                                                                        Cancel
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(n.id)} title="Delete">
                                                                    <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
