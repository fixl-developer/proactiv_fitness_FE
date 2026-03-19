'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Ticket, Plus, Search, Clock, User, MessageSquare, CheckCircle, AlertCircle, MoreVertical, UserPlus, Reply } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const tickets = [
    {
        id: 'TK-001', subject: 'Cannot book class', requester: 'Sarah Johnson',
        priority: 'High', priorityColor: 'bg-orange-100 text-orange-700',
        status: 'Open', statusColor: 'bg-blue-100 text-blue-700',
        assignee: 'Unassigned', created: '2h ago',
        sla: 'Within SLA', slaColor: 'bg-green-100 text-green-700',
        description: 'Unable to book Gymnastics class for March 25th, getting error on payment step.'
    },
    {
        id: 'TK-002', subject: 'Payment failed', requester: 'Tom Chen',
        priority: 'Critical', priorityColor: 'bg-red-100 text-red-700',
        status: 'In Progress', statusColor: 'bg-amber-100 text-amber-700',
        assignee: 'David Lee', created: '4h ago',
        sla: 'At Risk', slaColor: 'bg-yellow-100 text-yellow-700',
        description: 'Credit card payment failed for term enrollment, card has sufficient funds.'
    },
    {
        id: 'TK-003', subject: 'Schedule conflict', requester: 'Coach Mike',
        priority: 'Medium', priorityColor: 'bg-blue-100 text-blue-700',
        status: 'Open', statusColor: 'bg-blue-100 text-blue-700',
        assignee: 'Unassigned', created: '1d ago',
        sla: 'Within SLA', slaColor: 'bg-green-100 text-green-700',
        description: 'Two classes assigned to the same time slot in Room 3 on March 22nd.'
    },
    {
        id: 'TK-004', subject: 'Account access issue', requester: 'Emily Park',
        priority: 'High', priorityColor: 'bg-orange-100 text-orange-700',
        status: 'Resolved', statusColor: 'bg-green-100 text-green-700',
        assignee: 'Anna Park', created: '2d ago',
        sla: 'Met SLA', slaColor: 'bg-green-100 text-green-700',
        description: 'Cannot login to parent portal after password reset, verification email not received.'
    },
]

export default function SupportTicketsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<string>('All')

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600)
        return () => clearTimeout(timer)
    }, [])

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
        { label: 'Open Tickets', value: openCount.toString(), icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'In Progress', value: inProgressCount.toString(), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Resolved (30d)', value: '47', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Avg Resolution', value: '4.2h', icon: Ticket, color: 'text-purple-600', bg: 'bg-purple-50' },
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
                    <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
                    <p className="text-gray-600 mt-1">Track, assign, and resolve support requests</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Reply className="w-4 h-4 mr-2" />
                        Quick Response
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Ticket
                    </Button>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Card className="hover:shadow-lg transition-all duration-300">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                        <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
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

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tickets by ID, subject, or requester..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            {['All', 'Open', 'In Progress', 'Resolved'].map(s => (
                                <Button key={s} variant={filterStatus === s ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus(s)}>
                                    {s}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tickets Table */}
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
                                <motion.div
                                    key={ticket.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + i * 0.07 }}
                                    className="border border-gray-100 rounded-lg p-4 hover:shadow-md hover:border-blue-100 transition-all duration-200"
                                >
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
                                                {ticket.assignee === 'Unassigned' && (
                                                    <Button variant="outline" size="sm">
                                                        <UserPlus className="w-3.5 h-3.5 mr-1" />
                                                        Assign
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="sm">
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
