'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Search, Plus, UserPlus, Phone, Mail, MoreVertical, AlertTriangle, UserCheck, X, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

interface Contact {
    id: number | string
    name: string
    email: string
    phone: string
    type: string
    typeColor: string
    status: string
    statusColor: string
    lastInteraction: string
    score: number
    lastLoginAt?: string | null
}

interface PipelineStage {
    name: string
    count: number
    color: string
}

function getTypeColor(type: string): string {
    const map: Record<string, string> = { Parent: 'bg-blue-100 text-blue-700', Student: 'bg-green-100 text-green-700', Lead: 'bg-amber-100 text-amber-700' }
    return map[type] || 'bg-gray-100 text-gray-700'
}

function getStatusColor(status: string): string {
    const map: Record<string, string> = { Active: 'bg-green-100 text-green-700', 'At Risk': 'bg-red-100 text-red-700', Inactive: 'bg-gray-100 text-gray-600', Lead: 'bg-amber-100 text-amber-700' }
    return map[status] || 'bg-gray-100 text-gray-700'
}

function getScoreColor(score: number) {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 50) return 'text-amber-600 bg-amber-50'
    return 'text-red-600 bg-red-50'
}

function computeStatus(lastLoginAt: string | null | undefined): { status: string; score: number } {
    if (!lastLoginAt) return { status: 'Inactive', score: Math.floor(Math.random() * 20) }
    const now = new Date()
    const last = new Date(lastLoginAt)
    const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays <= 7) return { status: 'Active', score: 80 + Math.floor(Math.random() * 20) }
    if (diffDays <= 30) return { status: 'Active', score: 60 + Math.floor(Math.random() * 20) }
    return { status: 'At Risk', score: 30 + Math.floor(Math.random() * 20) }
}

function formatLastInteraction(dateStr: string | null | undefined): string {
    if (!dateStr) return 'Never'
    const now = new Date()
    const d = new Date(dateStr)
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`
}

export default function CRMPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [contacts, setContacts] = useState<Contact[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<string>('All')
    const [filterStatus, setFilterStatus] = useState<string>('All')
    const [view, setView] = useState<'table' | 'pipeline'>('table')
    const [showLogModal, setShowLogModal] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [logForm, setLogForm] = useState({ contactId: '', type: 'Call', notes: '' })
    const [addForm, setAddForm] = useState({ name: '', email: '', phone: '', type: 'Lead' })
    const [logging, setLogging] = useState(false)
    const [adding, setAdding] = useState(false)

    const mapUsersToContacts = (items: any[]): Contact[] => {
        return items.map((c: any) => {
            const loginDate = c.lastLoginAt || c.lastLogin || c.updatedAt || null
            const { status, score } = computeStatus(loginDate)
            const rawType = c.type || c.role || 'Lead'
            const displayType = rawType === 'PARENT' ? 'Parent' : rawType === 'STUDENT' ? 'Student' : rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase()
            return {
                id: c.id || c._id,
                name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown',
                email: c.email || '',
                phone: c.phone || c.phoneNumber || '',
                type: displayType,
                typeColor: getTypeColor(displayType),
                status,
                statusColor: getStatusColor(status),
                lastInteraction: formatLastInteraction(loginDate),
                score,
                lastLoginAt: loginDate,
            }
        })
    }

    const loadCRM = useCallback(async () => {
        let loaded = false

        // Try CRM families endpoint first
        try {
            const data = await apiClient.get<any>('/crm/families')
            const items = Array.isArray(data) ? data : (data?.data || data?.families || [])
            if (items.length > 0) {
                setContacts(mapUsersToContacts(items))
                loaded = true
            }
        } catch {
            // Silently continue to fallback
        }

        // Fallback to users endpoint
        if (!loaded) {
            try {
                const data = await apiClient.get<any>('/users?page=1&limit=100')
                const items = Array.isArray(data) ? data : (data?.data || data?.users || [])
                if (items.length > 0) {
                    setContacts(mapUsersToContacts(items))
                    loaded = true
                }
            } catch {
                // Silently continue
            }
        }

        if (!loaded) {
            setContacts([])
        }

        setIsLoading(false)
    }, [])

    useEffect(() => {
        loadCRM()
    }, [loadCRM])

    const handleLogInteraction = async () => {
        if (!logForm.contactId || !logForm.notes.trim()) {
            toast.error('Contact and notes are required')
            return
        }
        setLogging(true)
        try {
            await apiClient.post('/parent-engagement/feedback', {
                contactId: logForm.contactId,
                type: logForm.type,
                notes: logForm.notes,
                feedback: logForm.notes,
            })
            toast.success('Interaction logged successfully')
            setShowLogModal(false)
            setLogForm({ contactId: '', type: 'Call', notes: '' })
            loadCRM()
        } catch (err: any) {
            toast.error('Failed to log interaction: ' + (err?.response?.data?.message || err?.message || 'Unknown error'))
        } finally {
            setLogging(false)
        }
    }

    const handleAddContact = async () => {
        if (!addForm.name.trim() || !addForm.email.trim()) {
            toast.error('Name and email are required')
            return
        }
        setAdding(true)
        try {
            await apiClient.post('/crm/families', {
                name: addForm.name,
                email: addForm.email,
                phone: addForm.phone,
                type: addForm.type,
            })
            toast.success('Contact added successfully')
            setShowAddModal(false)
            setAddForm({ name: '', email: '', phone: '', type: 'Lead' })
            loadCRM()
        } catch (err: any) {
            toast.error('Failed to add contact: ' + (err?.response?.data?.message || err?.message || 'Unknown error'))
        } finally {
            setAdding(false)
        }
    }

    const filtered = contacts.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = filterType === 'All' || c.type === filterType
        const matchesStatus = filterStatus === 'All' || c.status === filterStatus
        return matchesSearch && matchesType && matchesStatus
    })

    const activeCount = contacts.filter(c => c.status === 'Active').length
    const atRiskCount = contacts.filter(c => c.status === 'At Risk').length
    const newCount = contacts.filter(c => {
        if (!c.lastLoginAt) return false
        const d = new Date(c.lastLoginAt)
        const now = new Date()
        return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 30
    }).length
    const inactiveCount = contacts.filter(c => c.status === 'Inactive').length

    const pipelineStages: PipelineStage[] = [
        { name: 'Leads', count: contacts.filter(c => c.type === 'Lead').length, color: 'bg-amber-500' },
        { name: 'Prospects', count: contacts.filter(c => c.score >= 50 && c.score < 80 && c.type !== 'Lead').length, color: 'bg-blue-500' },
        { name: 'Active', count: activeCount, color: 'bg-green-500' },
        { name: 'At Risk', count: atRiskCount, color: 'bg-orange-500' },
        { name: 'Churned', count: inactiveCount, color: 'bg-red-500' },
    ]

    const stats = [
        { label: 'Total Contacts', value: contacts.length.toString(), icon: Users, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
        { label: 'Active', value: activeCount.toString(), icon: UserCheck, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100' },
        { label: 'At Risk', value: atRiskCount.toString(), icon: AlertTriangle, gradient: 'from-red-500 to-red-600', bgGradient: 'from-red-50 to-red-100' },
        { label: 'New (30d)', value: newCount.toString(), icon: UserPlus, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' },
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
                    <h1 className="text-3xl font-bold text-gray-900">CRM</h1>
                    <p className="text-gray-600 mt-1">Manage customer relationships, leads, and engagement</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                    <Button id="admin-crm-refresh-btn" variant="outline" size="sm" onClick={() => { setIsLoading(true); loadCRM() }}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                    <Button id="admin-crm-log-interaction-open-btn" variant="outline" size="sm" onClick={() => setShowLogModal(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Log Interaction
                    </Button>
                    <Button id="admin-crm-add-contact-open-btn" size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddModal(true)}>
                        <UserPlus className="w-4 h-4 mr-2" /> Add Contact
                    </Button>
                </motion.div>
            </div>

            {/* Log Interaction Modal */}
            <AnimatePresence>
                {showLogModal && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <Card className="border-blue-200 shadow-lg">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Log Interaction</CardTitle>
                                    <Button id="admin-crm-log-modal-close-btn" variant="ghost" size="sm" onClick={() => setShowLogModal(false)}><X className="w-4 h-4" /></Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Contact</label>
                                        <select id="admin-crm-log-contact-select" value={logForm.contactId} onChange={e => setLogForm(f => ({ ...f, contactId: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none">
                                            <option value="">Select contact...</option>
                                            {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
                                        <select id="admin-crm-log-type-select" value={logForm.type} onChange={e => setLogForm(f => ({ ...f, type: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none">
                                            <option value="Call">Phone Call</option>
                                            <option value="Email">Email</option>
                                            <option value="Meeting">Meeting</option>
                                            <option value="Note">Note</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Notes</label>
                                    <textarea value={logForm.notes} onChange={e => setLogForm(f => ({ ...f, notes: e.target.value }))} placeholder="Interaction details..." rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none resize-none" />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button id="admin-crm-log-cancel-btn" variant="outline" size="sm" onClick={() => setShowLogModal(false)}>Cancel</Button>
                                    <Button id="admin-crm-log-save-btn" size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleLogInteraction} disabled={logging}>
                                        {logging ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        {logging ? 'Saving...' : 'Save Interaction'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Contact Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <Card className="border-blue-200 shadow-lg">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Add New Contact</CardTitle>
                                    <Button id="admin-crm-add-modal-close-btn" variant="ghost" size="sm" onClick={() => setShowAddModal(false)}><X className="w-4 h-4" /></Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Name</label>
                                        <input id="admin-crm-add-name-input" type="text" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                                        <input id="admin-crm-add-email-input" type="email" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                                        <input id="admin-crm-add-phone-input" type="text" value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} placeholder="+852 9123 4567" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
                                        <select id="admin-crm-add-type-select" value={addForm.type} onChange={e => setAddForm(f => ({ ...f, type: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none">
                                            <option value="Parent">Parent</option>
                                            <option value="Student">Student</option>
                                            <option value="Lead">Lead</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button id="admin-crm-add-cancel-btn" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>Cancel</Button>
                                    <Button id="admin-crm-add-submit-btn" size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleAddContact} disabled={adding}>
                                        {adding ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
                                        {adding ? 'Adding...' : 'Add Contact'}
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
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="flex gap-2">
                <Button id="admin-crm-view-table-btn" variant={view === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setView('table')}>Table View</Button>
                <Button id="admin-crm-view-pipeline-btn" variant={view === 'pipeline' ? 'default' : 'outline'} size="sm" onClick={() => setView('pipeline')}>Pipeline View</Button>
            </div>

            {view === 'pipeline' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card>
                        <CardHeader><CardTitle>Sales Pipeline</CardTitle></CardHeader>
                        <CardContent>
                            {pipelineStages.every(s => s.count === 0) ? (
                                <div className="text-center py-12">
                                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-500 mb-1">No pipeline data</h3>
                                    <p className="text-sm text-gray-400">Add contacts to see pipeline stages</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Horizontal bar pipeline */}
                                    <div className="flex items-center gap-1 h-12 rounded-lg overflow-hidden">
                                        {pipelineStages.filter(s => s.count > 0).map((stage) => {
                                            const total = pipelineStages.reduce((s, st) => s + st.count, 0)
                                            const pct = total > 0 ? (stage.count / total) * 100 : 0
                                            return (
                                                <div
                                                    key={stage.name}
                                                    className={`${stage.color} h-full flex items-center justify-center text-white text-sm font-medium transition-all duration-500`}
                                                    style={{ width: `${Math.max(pct, 8)}%` }}
                                                    title={`${stage.name}: ${stage.count}`}
                                                >
                                                    {stage.count}
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        {pipelineStages.map((stage) => (
                                            <div key={stage.name} className="text-center flex-1">
                                                <div className="flex items-center justify-center gap-2 mb-1">
                                                    <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                                                    <span className="text-sm font-medium text-gray-700">{stage.name}</span>
                                                </div>
                                                <span className="text-2xl font-bold text-gray-900">{stage.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Arrow flow */}
                                    <div className="flex items-center justify-between px-8">
                                        {pipelineStages.map((stage, i) => (
                                            <div key={stage.name} className="flex items-center">
                                                <span className="text-xs text-gray-500 font-medium">{stage.name}</span>
                                                {i < pipelineStages.length - 1 && (
                                                    <svg className="w-6 h-4 text-gray-300 mx-2" fill="none" viewBox="0 0 24 16"><path d="M1 8h20m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                <>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input id="admin-crm-search-input" type="text" placeholder="Search contacts by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {['All', 'Parent', 'Student', 'Lead'].map(t => (
                                        <Button id={`admin-crm-filter-type-${t.toLowerCase()}-btn`} key={t} variant={filterType === t ? 'default' : 'outline'} size="sm" onClick={() => setFilterType(t)}>
                                            {t === 'All' ? 'All Types' : t}
                                        </Button>
                                    ))}
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {['All', 'Active', 'At Risk', 'Inactive'].map(s => (
                                        <Button id={`admin-crm-filter-status-${s.toLowerCase().replace(/\s+/g, '-')}-btn`} key={s} variant={filterStatus === s ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus(s)}>
                                            {s === 'All' ? 'All Status' : s}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-blue-600" />
                                        <CardTitle>Contacts</CardTitle>
                                    </div>
                                    <Badge variant="outline">{filtered.length} contacts</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {filtered.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-500 mb-1">No contacts found</h3>
                                        <p className="text-sm text-gray-400">Add your first contact to get started</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-100">
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Phone</th>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Type</th>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Last Interaction</th>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Score</th>
                                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <AnimatePresence>
                                                    {filtered.map((contact, i) => (
                                                        <motion.tr key={contact.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                            <td className="py-3.5 px-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                                                        {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                                    </div>
                                                                    <span className="font-medium text-gray-900">{contact.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-3.5 px-4 text-gray-600 text-sm">{contact.email || <span className="text-gray-400">-</span>}</td>
                                                            <td className="py-3.5 px-4 text-gray-600 text-sm">{contact.phone || <span className="text-gray-400">-</span>}</td>
                                                            <td className="py-3.5 px-4"><Badge className={contact.typeColor}>{contact.type}</Badge></td>
                                                            <td className="py-3.5 px-4"><Badge className={contact.statusColor}>{contact.status}</Badge></td>
                                                            <td className="py-3.5 px-4 text-gray-600 text-sm">{contact.lastInteraction}</td>
                                                            <td className="py-3.5 px-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`px-2.5 py-1 rounded-full text-sm font-bold ${getScoreColor(contact.score)}`}>{contact.score}</div>
                                                                    <Progress value={contact.score} className="w-12 h-1.5" />
                                                                </div>
                                                            </td>
                                                            <td className="py-3.5 px-4 text-right">
                                                                <div className="flex items-center gap-1 justify-end">
                                                                    <Button id={`admin-crm-call-${contact.id}-btn`} variant="ghost" size="sm" title="Call"><Phone className="w-3.5 h-3.5" /></Button>
                                                                    <Button id={`admin-crm-email-${contact.id}-btn`} variant="ghost" size="sm" title="Email"><Mail className="w-3.5 h-3.5" /></Button>
                                                                    <Button id={`admin-crm-more-${contact.id}-btn`} variant="ghost" size="sm"><MoreVertical className="w-3.5 h-3.5" /></Button>
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
                </>
            )}
        </div>
    )
}
