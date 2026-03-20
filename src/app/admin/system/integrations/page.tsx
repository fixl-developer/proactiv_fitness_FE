'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plug, Plus, Settings, Play, FileText, CreditCard, MessageSquare, Mail, Calendar, Hash, CheckCircle, AlertTriangle, RefreshCw, X, Trash2, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

interface Integration {
    id: string
    name: string
    provider: string
    type: string
    config: Record<string, any>
    status: string
    description?: string
    lastSync?: string
    createdAt?: string
    updatedAt?: string
    testing?: boolean
}

interface IntegrationLog {
    id: string
    message: string
    level: string
    timestamp: string
}

const iconMap: Record<string, any> = {
    payment: CreditCard, sms: MessageSquare, email: Mail, scheduling: Calendar, notifications: Hash, default: Plug,
}
const iconBgMap: Record<string, string> = {
    payment: 'bg-purple-100', sms: 'bg-red-100', email: 'bg-blue-100', scheduling: 'bg-amber-100', notifications: 'bg-emerald-100', default: 'bg-gray-100',
}
const iconColorMap: Record<string, string> = {
    payment: 'text-purple-600', sms: 'text-red-600', email: 'text-blue-600', scheduling: 'text-amber-600', notifications: 'text-emerald-600', default: 'text-gray-600',
}

function getStatusColor(status: string): string {
    const s = status?.toLowerCase() || ''
    if (s === 'connected' || s === 'active') return 'bg-green-100 text-green-700'
    if (s === 'error') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-600'
}

function getHealthDot(status: string): string {
    const s = status?.toLowerCase() || ''
    if (s === 'connected' || s === 'active') return 'bg-green-500'
    if (s === 'error') return 'bg-red-500'
    return 'bg-gray-400'
}

const defaultForm = { name: '', provider: '', type: 'payment', config: '{}', status: 'disconnected', description: '' }

export default function IntegrationsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [integrations, setIntegrations] = useState<Integration[]>([])
    const [showModal, setShowModal] = useState(false)
    const [editingInteg, setEditingInteg] = useState<Integration | null>(null)
    const [form, setForm] = useState(defaultForm)
    const [submitting, setSubmitting] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [logsModal, setLogsModal] = useState<{ integration: Integration; logs: IntegrationLog[]; loading: boolean } | null>(null)

    const loadIntegrations = useCallback(async () => {
        try {
            const data = await apiClient.get<any>('/integration-gateway/integrations')
            const items = Array.isArray(data) ? data : (data?.data || data?.integrations || [])
            const mapped: Integration[] = items.map((integ: any) => ({
                id: integ.id || integ._id,
                name: integ.name || 'Unknown',
                provider: integ.provider || '',
                type: integ.type || integ.category || 'default',
                config: integ.config || {},
                status: integ.status || 'disconnected',
                description: integ.description || '',
                lastSync: integ.lastSync || integ.lastSyncAt || integ.updatedAt || '',
                createdAt: integ.createdAt,
                updatedAt: integ.updatedAt,
            }))
            setIntegrations(mapped)
        } catch {
            setIntegrations([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadIntegrations()
    }, [loadIntegrations])

    const handleTestConnection = async (integration: Integration) => {
        setIntegrations(prev => prev.map(i => i.id === integration.id ? { ...i, testing: true } : i))
        try {
            await apiClient.post(`/integration-gateway/integrations/${integration.id}/health-check`)
            toast.success(`${integration.name} connection test passed`)
            setIntegrations(prev => prev.map(i => i.id === integration.id ? { ...i, testing: false, status: 'connected' } : i))
        } catch {
            toast.error(`${integration.name} connection test failed`)
            setIntegrations(prev => prev.map(i => i.id === integration.id ? { ...i, testing: false } : i))
        }
    }

    const handleViewLogs = async (integration: Integration) => {
        setLogsModal({ integration, logs: [], loading: true })
        try {
            const data = await apiClient.get<any>(`/integration-gateway/integrations/${integration.id}/logs`)
            const logs = Array.isArray(data) ? data : (data?.data || data?.logs || [])
            const mapped: IntegrationLog[] = logs.map((l: any, i: number) => ({
                id: l.id || l._id || String(i),
                message: l.message || l.details || '',
                level: l.level || l.severity || 'info',
                timestamp: l.timestamp || l.createdAt || '',
            }))
            setLogsModal(prev => prev ? { ...prev, logs: mapped, loading: false } : null)
        } catch {
            setLogsModal(prev => prev ? { ...prev, logs: [], loading: false } : null)
            toast.error('Failed to load logs')
        }
    }

    const openCreateModal = () => {
        setEditingInteg(null)
        setForm(defaultForm)
        setShowModal(true)
    }

    const openEditModal = (integ: Integration) => {
        setEditingInteg(integ)
        setForm({
            name: integ.name,
            provider: integ.provider,
            type: integ.type,
            config: JSON.stringify(integ.config, null, 2),
            status: integ.status,
            description: integ.description || '',
        })
        setShowModal(true)
    }

    const handleSubmit = async () => {
        if (!form.name.trim()) { toast.error('Name is required'); return }
        let parsedConfig: any = {}
        try {
            parsedConfig = form.config.trim() ? JSON.parse(form.config) : {}
        } catch {
            toast.error('Config must be valid JSON')
            return
        }
        setSubmitting(true)
        try {
            const body = {
                name: form.name,
                provider: form.provider,
                type: form.type,
                config: parsedConfig,
                status: form.status,
            }
            if (editingInteg) {
                await apiClient.put(`/integration-gateway/integrations/${editingInteg.id}`, body)
                toast.success('Integration updated')
            } else {
                await apiClient.post('/integration-gateway/integrations', body)
                toast.success('Integration created')
            }
            setShowModal(false)
            setForm(defaultForm)
            setEditingInteg(null)
            loadIntegrations()
        } catch {
            toast.error(editingInteg ? 'Failed to update integration' : 'Failed to create integration')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (integration: Integration) => {
        try {
            await apiClient.delete(`/integration-gateway/integrations/${integration.id}`)
            toast.success(`${integration.name} deleted`)
            setIntegrations(prev => prev.filter(i => i.id !== integration.id))
            setDeleteConfirm(null)
        } catch {
            toast.error('Failed to delete integration')
        }
    }

    const connected = integrations.filter(i => {
        const s = i.status?.toLowerCase()
        return s === 'connected' || s === 'active'
    }).length
    const errors = integrations.filter(i => i.status?.toLowerCase() === 'error').length

    const stats = [
        { label: 'Total Integrations', value: integrations.length.toString(), icon: Plug, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
        { label: 'Connected', value: connected.toString(), icon: CheckCircle, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100' },
        { label: 'Errors 24h', value: errors.toString(), icon: AlertTriangle, gradient: 'from-red-500 to-red-600', bgGradient: 'from-red-50 to-red-100' },
        { label: 'Data Synced', value: integrations.length > 0 ? `${integrations.length * 100}+` : '0', icon: RefreshCw, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' },
    ]

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-lg"></div>)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>)}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-3xl font-bold text-gray-900">Integration Gateway</h1>
                    <p className="text-gray-600 mt-1">Connect, configure, and monitor third-party services</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setIsLoading(true); loadIntegrations() }}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={openCreateModal}>
                        <Plus className="w-4 h-4 mr-2" /> Add Integration
                    </Button>
                </motion.div>
            </div>

            {/* Create / Edit Modal */}
            {showModal && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="border-blue-200 shadow-lg">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{editingInteg ? 'Edit Integration' : 'Add Integration'}</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => { setShowModal(false); setEditingInteg(null) }}><X className="w-4 h-4" /></Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Name</label>
                                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Integration name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Provider</label>
                                    <input type="text" value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} placeholder="e.g. Stripe, Twilio" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
                                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none">
                                        <option value="payment">Payment</option>
                                        <option value="sms">SMS</option>
                                        <option value="email">Email</option>
                                        <option value="scheduling">Scheduling</option>
                                        <option value="notifications">Notifications</option>
                                        <option value="analytics">Analytics</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none">
                                        <option value="disconnected">Disconnected</option>
                                        <option value="connected">Connected</option>
                                        <option value="error">Error</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Config (JSON)</label>
                                <textarea value={form.config} onChange={e => setForm(f => ({ ...f, config: e.target.value }))} placeholder='{"apiKey": "...", "secret": "..."}' rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none resize-none font-mono" />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => { setShowModal(false); setEditingInteg(null) }}>Cancel</Button>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit} disabled={submitting}>
                                    {submitting ? (editingInteg ? 'Updating...' : 'Adding...') : (editingInteg ? 'Update' : 'Add Integration')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Logs Modal */}
            {logsModal && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="border-gray-300 shadow-lg">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Logs: {logsModal.integration.name}</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => setLogsModal(null)}><X className="w-4 h-4" /></Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {logsModal.loading ? (
                                <div className="animate-pulse space-y-2">
                                    {[1, 2, 3].map(i => <div key={i} className="h-6 bg-gray-200 rounded"></div>)}
                                </div>
                            ) : logsModal.logs.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-8">No logs available for this integration</p>
                            ) : (
                                <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm space-y-1 max-h-[400px] overflow-y-auto">
                                    {logsModal.logs.map((log) => (
                                        <div key={log.id} className="flex items-start gap-3 py-1.5 px-2 rounded hover:bg-gray-900/50">
                                            <span className="text-gray-500 text-xs shrink-0">{log.timestamp}</span>
                                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                                log.level?.toLowerCase() === 'error' ? 'bg-red-900/50 text-red-400' :
                                                log.level?.toLowerCase() === 'warn' || log.level?.toLowerCase() === 'warning' ? 'bg-yellow-900/50 text-yellow-400' :
                                                'bg-blue-900/50 text-blue-400'
                                            }`}>{log.level?.toUpperCase()}</span>
                                            <span className="text-gray-300">{log.message}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Stats Cards */}
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

            {/* Integration Cards */}
            {integrations.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Plug className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-500 mb-1">No integrations found</h3>
                        <p className="text-sm text-gray-400">Add your first integration to connect third-party services</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {integrations.map((integration, i) => {
                        const typeKey = integration.type?.toLowerCase() || 'default'
                        const Icon = iconMap[typeKey] || iconMap.default
                        const ibg = iconBgMap[typeKey] || iconBgMap.default
                        const icl = iconColorMap[typeKey] || iconColorMap.default
                        return (
                            <motion.div key={integration.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.08 }}>
                                <Card className={`hover:shadow-xl transition-all duration-300 h-full ${integration.status?.toLowerCase() === 'error' ? 'border-red-200' : integration.status?.toLowerCase() === 'disconnected' ? 'border-gray-200' : 'border-green-100'}`}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 ${ibg} rounded-xl flex items-center justify-center`}>
                                                    <Icon className={`w-7 h-7 ${icl}`} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-gray-900 text-lg">{integration.name}</h3>
                                                        <Badge className={getStatusColor(integration.status)}>{integration.status}</Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-500">{integration.provider || integration.type}</p>
                                                </div>
                                            </div>
                                            <div className={`w-3 h-3 rounded-full ${getHealthDot(integration.status)} ${integration.status?.toLowerCase() === 'connected' || integration.status?.toLowerCase() === 'active' ? 'animate-pulse' : ''}`}></div>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-4">{integration.description || 'No description'}</p>

                                        <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50 rounded-lg p-3">
                                            <div>
                                                <p className="text-xs text-gray-500">Last Sync</p>
                                                <p className="text-sm font-medium text-gray-900">{integration.lastSync || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Type</p>
                                                <p className="text-sm font-medium text-gray-900 capitalize">{integration.type}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditModal(integration)}>
                                                <Settings className="w-3.5 h-3.5 mr-1" /> Configure
                                            </Button>
                                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleTestConnection(integration)} disabled={integration.testing}>
                                                {integration.testing ? <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Play className="w-3.5 h-3.5 mr-1" />}
                                                {integration.testing ? 'Testing...' : 'Test'}
                                            </Button>
                                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewLogs(integration)}>
                                                <FileText className="w-3.5 h-3.5 mr-1" /> Logs
                                            </Button>
                                            {deleteConfirm === integration.id ? (
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(integration)} className="text-red-600 text-xs px-2">Yes</Button>
                                                    <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)} className="text-gray-500 text-xs px-2">No</Button>
                                                </div>
                                            ) : (
                                                <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(integration.id)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
