'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Ticket, Plus, Search, Clock, User, MessageSquare, CheckCircle, AlertCircle, MoreVertical, UserPlus, Reply, X, RefreshCw, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

interface SupportTicket {
    id: string
    subject: string
    requester: string
    priority: string
    priorityColor: string
    status: string
    statusColor: string
    assignee: string
    created: string
    sla: string
    slaColor: string
    description: string
}

const fallbackTickets: SupportTicket[] = [
    { id: 'TK-001', subject: 'Cannot book class', requester: 'Sarah Johnson', priority: 'High', priorityColor: 'bg-orange-100 text-orange-700', status: 'Open', statusColor: 'bg-blue-100 text-blue-700', assignee: 'Unassigned', created: '2h ago', sla: 'Within SLA', slaColor: 'bg-green-100 text-green-700', description: 'Unable to book Gymnastics class for March 25th, getting error on payment step.' },
    { id: 'TK-002', subject: 'Payment failed', requester: 'Tom Chen', priority: 'Critical', priorityColor: 'bg-red-100 text-red-700', status: 'In Progress', statusColor: 'bg-amber-100 text-amber-700', assignee: 'David Lee', created: '4h ago', sla: 'At Risk', slaColor: 'bg-yellow-100 text-yellow-700', description: 'Credit card payment failed for term enrollment, card has sufficient funds.' },
    { id: 'TK-003', subject: 'Schedule conflict', requester: 'Coach Mike', priority: 'Medium', priorityColor: 'bg-blue-100 text-blue-700', status: 'Open', statusColor: 'bg-blue-100 text-blue-700', assignee: 'Unassigned', created: '1d ago', sla: 'Within SLA', slaColor: 'bg-green-100 text-green-700', description: 'Two classes assigned to the same time slot in Room 3 on March 22nd.' },
    { id: 'TK-004', subject: 'Account access issue', requester: 'Emily Park', priority: 'High', priorityColor: 'bg-orange-100 text-orange-700', status: 'Resolved', statusColor: 'bg-green-100 text-green-700', assignee: 'Anna Park', created: '2d ago', sla: 'Met SLA', slaColor: 'bg-green-100 text-green-700', description: 'Cannot login to parent portal after password reset, verification email not received.' },
]

function timeAgo(dateStr: string): string {
    const now = new Date()
    const date = new Date(dateStr)
    const diff = now.getTime() - date.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
}

function getPriorityColor(priority: string): string {
    const map: Record<string, string> = { Critical: 'bg-red-100 text-red-700', High: 'bg-orange-100 text-orange-700', Medium: 'bg-blue-100 text-blue-700', Low: 'bg-gray-100 text-gray-600' }
    return map[priority] || 'bg-gray-100 text-gray-700'
}

function getStatusColor(status: string): string {
    const map: Record<string, string> = { Open: 'bg-blue-100 text-blue-700', 'In Progress': 'bg-amber-100 text-amber-700', Resolved: 'bg-green-100 text-green-700', Closed: 'bg-gray-100 text-gray-600' }
    return map[status] || 'bg-gray-100 text-gray-700'
}

export default function SupportTicketsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [tickets, setTickets] = useState<SupportTicket[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<string>('All')
    const [usingFallback, setUsingFallback] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [createForm, setCreateForm] = useState({ subject: '', requester: '', priority: 'Medium', description: '' })
    const [creating, setCreating] = useState(false)

    const loadTickets = useCallback(async () => {
        try {
            const res: any = await apiClient.get<any>('/support/tickets')
            // Backend returns { success, data: { tickets: [...], total, pages } }
            const raw = res?.data?.tickets ?? res?.data ?? res?.tickets ?? res
            const items = Array.isArray(raw) ? raw : []

            const statusMap: Record<string, string> = {
                'open': 'Open', 'in-progress': 'In Progress', 'pending': 'Pending',
                'resolved': 'Resolved', 'closed': 'Closed',
            }
            const priorityMap: Record<string, string> = {
                'low': 'Low', 'medium': 'Medium', 'high': 'High', 'critical': 'Critical',
            }

            const mapped: SupportTicket[] = items.map((t: any, i: number) => {
                const status = statusMap[t.status] || t.status || 'Open'
                const priority = priorityMap[t.priority] || t.priority || 'Medium'
                const created = t.createdAt ? timeAgo(t.createdAt) : (t.created || 'N/A')
                return {
                    id: t.ticketId || t._id || t.id || `TK-${String(i + 1).padStart(3, '0')}`,
                    subject: t.subject || t.title || 'Untitled',
                    requester: t.customer?.name || t.requester || 'Unknown',
                    priority,
                    priorityColor: getPriorityColor(priority),
                    status,
                    statusColor: getStatusColor(status),
                    assignee: t.assignedTo || t.assignee || 'Unassigned',
                    created,
                    sla: t.sla || 'Within SLA',
                    slaColor: 'bg-green-100 text-green-700',
                    description: t.description || '',
                }
            })
            setTickets(mapped)
            setUsingFallback(false)
        } catch (err: any) {
            console.debug('[Tickets] API not available, using fallback data:', err?.message)
            setTickets(fallbackTickets)
            setUsingFallback(true)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadTickets()
    }, [loadTickets])

    const handleCreate = async () => {
        if (!createForm.subject.trim()) { toast.error('Subject is required'); return }
        setCreating(true)
        try {
            await apiClient.post('/support/tickets', createForm)
            toast.success('Ticket created successfully')
            setShowCreateModal(false)
            setCreateForm({ subject: '', requester: '', priority: 'Medium', description: '' })
            loadTickets()
        } catch {
            // Fallback: add locally
            const newTicket: SupportTicket = {
                id: `TK-${String(tickets.length + 1).padStart(3, '0')}`,
                subject: createForm.subject,
                requester: createForm.requester || 'Current User',
                priority: createForm.priority,
                priorityColor: getPriorityColor(createForm.priority),
                status: 'Open',
                statusColor: 'bg-blue-100 text-blue-700',
                assignee: 'Unassigned',
                created: 'Just now',
                sla: 'Within SLA',
                slaColor: 'bg-green-100 text-green-700',
                description: createForm.description,
            }
            setTickets(prev => [newTicket, ...prev])
            toast.success('Ticket created (local only)')
            setShowCreateModal(false)
            setCreateForm({ subject: '', requester: '', priority: 'Medium', description: '' })
        } finally {
            setCreating(false)
        }
    }

    const handleStatusChange = async (ticketId: string, newStatus: string) => {
        try {
            await apiClient.patch(`/support/tickets/${ticketId}`, { status: newStatus })
            toast.success(`Ticket ${newStatus.toLowerCase()}`)
        } catch {
            // Update locally
        }
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus, statusColor: getStatusColor(newStatus) } : t))
    }

    const filtered = tickets.filter(t => {
        const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.id.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = filterStatus === 'All' || t.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const openCount = tickets.filter(t => t.status === 'Open').length
    const inProgressCount = tickets.filter(t => t.status === 'In Progress').length
    const resolvedCount = tickets.filter(t => t.status === 'Resolved').length

    const stats = [
        { label: 'Open Tickets', value: openCount.toString(), icon: AlertCircle, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
        { label: 'In Progress', value: inProgressCount.toString(), icon: Clock, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100' },
        { label: 'Resolved', value: resolvedCount.toString(), icon: CheckCircle, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' },
        { label: 'Total', value: tickets.length.toString(), icon: Ticket, gradient: 'from-orange-500 to-orange-600', bgGradient: 'from-orange-50 to-orange-100' },
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
            {usingFallback && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
                    <p className="text-sm text-yellow-800">Backend endpoint not available - showing sample data</p>
                </motion.div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
                    <p className="text-gray-600 mt-1">Track, assign, and resolve support requests</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                    <Button id="btn-action-admin-support-tickets" variant="outline" size="sm" onClick={() => { setIsLoading(true); loadTickets() }}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                    <Button id={`btn-set-show-create-modal-admin-support-tickets-${i}`} size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowCreateModal(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Create Ticket
                    </Button>
                </motion.div>
            </div>

            {showCreateModal && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="border-blue-200 shadow-lg">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Create Support Ticket</CardTitle>
                                <Button id="btn-set-show-create-modal-admin-support-tickets" variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}><X className="w-4 h-4" /></Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Subject</label>
                                    <input id="input-text-admin-support-tickets" type="text" value={createForm.subject} onChange={e => setCreateForm(f => ({ ...f, subject: e.target.value }))} placeholder="Brief description of the issue" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Priority</label>
                                    <select id="select-admin-support-tickets-12" value={createForm.priority} onChange={e => setCreateForm(f => ({ ...f, priority: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none">
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Requester</label>
                                <input id="input-text-admin-support-tickets" type="text" value={createForm.requester} onChange={e => setCreateForm(f => ({ ...f, requester: e.target.value }))} placeholder="Requester name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                                <textarea value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} placeholder="Detailed description..." rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none resize-none" />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button id="btn-set-show-create-modal-admin-support-tickets" variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                                <Button id="btn-create-admin-support-tickets" size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleCreate} disabled={creating}>{creating ? 'Creating...' : 'Create Ticket'}</Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

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
                        </div>
                    </motion.div>
                ))}
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input id={`input-text-admin-support-tickets-${i}`} type="text" placeholder="Search tickets by ID, subject, or requester..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                        </div>
                        <div className="flex gap-2">
                            {['All', 'Open', 'In Progress', 'Resolved'].map(s => (
                                <Button id="btn-set-filter-status-admin-support-tickets" key={s} variant={filterStatus === s ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus(s)}>{s}</Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Ticket className="w-5 h-5 text-blue-600" />
                                <CardTitle>Tickets</CardTitle>
                            </div>
                            <Badge variant="outline">{filtered.length} tickets</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {filtered.map((ticket, i) => (
                                <motion.div key={ticket.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.07 }} className="border border-gray-100 rounded-lg p-4 hover:shadow-md hover:border-blue-100 transition-all duration-200">
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-sm font-mono font-bold text-blue-600">{ticket.id}</span>
                                                <Badge className={ticket.priorityColor}>{ticket.priority}</Badge>
                                                <Badge className={ticket.statusColor}>{ticket.status}</Badge>
                                                <Badge className={ticket.slaColor}>{ticket.sla}</Badge>
                                            </div>
                                            <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{ticket.description}</p>
                                        </div>
                                        <div className="flex items-center gap-6 lg:gap-8 text-sm text-gray-500 shrink-0">
                                            <div className="flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5" />
                                                <span>{ticket.requester}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <UserPlus className="w-3.5 h-3.5" />
                                                <span className={ticket.assignee === 'Unassigned' ? 'text-red-500 font-medium' : ''}>{ticket.assignee}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{ticket.created}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                {ticket.status === 'Open' && (
                                                    <Button id="btn-status-change-admin-support-tickets" variant="outline" size="sm" onClick={() => handleStatusChange(ticket.id, 'In Progress')}>
                                                        Start
                                                    </Button>
                                                )}
                                                {ticket.status === 'In Progress' && (
                                                    <Button id="btn-status-change-admin-support-tickets" variant="outline" size="sm" onClick={() => handleStatusChange(ticket.id, 'Resolved')}>
                                                        Resolve
                                                    </Button>
                                                )}
                                                {ticket.assignee === 'Unassigned' && (
                                                    <Button id="admin-support-tickets-btn" variant="outline" size="sm">
                                                        <UserPlus className="w-3.5 h-3.5 mr-1" /> Assign
                                                    </Button>
                                                )}
                                                <Button id="admin-support-tickets-btn-2" variant="ghost" size="sm">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
