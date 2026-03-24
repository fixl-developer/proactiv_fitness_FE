'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Flag, Plus, Search, ToggleLeft, ToggleRight, Clock, FlaskConical, CheckCircle, XCircle, X, RefreshCw, Trash2, Edit2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

interface FeatureFlag {
    id: string
    key: string
    name: string
    description: string
    environment: string
    enabled: boolean
    rolloutPercentage: number
    createdAt?: string
    updatedAt?: string
}

function getEnvColor(env: string): string {
    const normalized = env?.toLowerCase() || ''
    if (normalized === 'production') return 'bg-green-100 text-green-700'
    if (normalized === 'staging') return 'bg-amber-100 text-amber-700'
    if (normalized === 'development') return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-700'
}

function getStatusInfo(enabled: boolean, rollout: number): { status: string; statusColor: string } {
    if (!enabled || rollout === 0) return { status: 'Disabled', statusColor: 'bg-gray-100 text-gray-600' }
    if (rollout === 100) return { status: 'Enabled', statusColor: 'bg-green-100 text-green-700' }
    return { status: 'Testing', statusColor: 'bg-purple-100 text-purple-700' }
}

function formatDate(dateStr?: string): string {
    if (!dateStr) return 'N/A'
    try {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
        return dateStr
    }
}

const defaultForm = { key: '', name: '', description: '', environment: 'development', enabled: false, rolloutPercentage: 0 }

export default function FeatureFlagsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [flags, setFlags] = useState<FeatureFlag[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null)
    const [form, setForm] = useState(defaultForm)
    const [submitting, setSubmitting] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    const loadFlags = useCallback(async () => {
        try {
            const data = await apiClient.get<any>('/feature-flags/list')
            const items = Array.isArray(data) ? data : (data?.data || data?.flags || [])
            const mapped: FeatureFlag[] = items.map((f: any) => ({
                id: f.id || f._id || f.key,
                key: f.key || f.flagKey || '',
                name: f.name || f.key || 'Unnamed',
                description: f.description || '',
                environment: f.environment || f.env || 'development',
                enabled: f.enabled ?? f.isEnabled ?? false,
                rolloutPercentage: f.rolloutPercentage ?? f.rollout ?? (f.enabled ? 100 : 0),
                createdAt: f.createdAt,
                updatedAt: f.updatedAt,
            }))
            setFlags(mapped)
        } catch {
            setFlags([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadFlags()
    }, [loadFlags])

    const toggleFlag = async (flag: FeatureFlag) => {
        const newEnabled = !flag.enabled
        const newRollout = newEnabled ? (flag.rolloutPercentage === 0 ? 25 : flag.rolloutPercentage) : 0

        setFlags(prev => prev.map(f => f.id === flag.id ? { ...f, enabled: newEnabled, rolloutPercentage: newRollout } : f))

        try {
            await apiClient.put(`/feature-flags/${flag.id}`, {
                enabled: newEnabled,
                rolloutPercentage: newRollout,
            })
            toast.success(`${flag.name} ${newEnabled ? 'enabled' : 'disabled'}`)
        } catch {
            setFlags(prev => prev.map(f => f.id === flag.id ? flag : f))
            toast.error('Failed to update flag')
        }
    }

    const updateRollout = async (flag: FeatureFlag, value: number) => {
        const newEnabled = value > 0
        setFlags(prev => prev.map(f => f.id === flag.id ? { ...f, rolloutPercentage: value, enabled: newEnabled } : f))

        try {
            await apiClient.put(`/feature-flags/${flag.id}`, {
                enabled: newEnabled,
                rolloutPercentage: value,
            })
        } catch {
            setFlags(prev => prev.map(f => f.id === flag.id ? flag : f))
            toast.error('Failed to update rollout')
        }
    }

    const openCreateModal = () => {
        setEditingFlag(null)
        setForm(defaultForm)
        setShowModal(true)
    }

    const openEditModal = (flag: FeatureFlag) => {
        setEditingFlag(flag)
        setForm({
            key: flag.key,
            name: flag.name,
            description: flag.description,
            environment: flag.environment,
            enabled: flag.enabled,
            rolloutPercentage: flag.rolloutPercentage,
        })
        setShowModal(true)
    }

    const handleSubmit = async () => {
        if (!form.key.trim() || !form.name.trim()) {
            toast.error('Key and name are required')
            return
        }
        setSubmitting(true)
        try {
            if (editingFlag) {
                await apiClient.put(`/feature-flags/${editingFlag.id}`, {
                    name: form.name,
                    description: form.description,
                    environment: form.environment,
                    enabled: form.enabled,
                    rolloutPercentage: form.rolloutPercentage,
                })
                toast.success('Feature flag updated')
            } else {
                await apiClient.post('/feature-flags/create', {
                    name: form.name,
                    key: form.key,
                    description: form.description,
                    environment: form.environment,
                    enabled: form.enabled,
                    rolloutPercentage: form.rolloutPercentage,
                })
                toast.success('Feature flag created')
            }
            setShowModal(false)
            setForm(defaultForm)
            setEditingFlag(null)
            loadFlags()
        } catch (err: any) {
            toast.error(editingFlag ? 'Failed to update flag' : 'Failed to create flag')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (flag: FeatureFlag) => {
        try {
            await apiClient.delete(`/feature-flags/flags/${flag.key}`)
            toast.success(`${flag.name} deleted`)
            setFlags(prev => prev.filter(f => f.id !== flag.id))
            setDeleteConfirm(null)
        } catch {
            toast.error('Failed to delete flag')
        }
    }

    const filtered = flags.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.key.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const enabledCount = flags.filter(f => f.enabled && f.rolloutPercentage === 100).length
    const disabledCount = flags.filter(f => !f.enabled).length
    const testingCount = flags.filter(f => f.enabled && f.rolloutPercentage < 100).length

    const stats = [
        { label: 'Total Flags', value: flags.length.toString(), icon: Flag, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
        { label: 'Enabled', value: enabledCount.toString(), icon: ToggleRight, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100' },
        { label: 'Disabled', value: disabledCount.toString(), icon: ToggleLeft, gradient: 'from-red-500 to-red-600', bgGradient: 'from-red-50 to-red-100' },
        { label: 'In Testing', value: testingCount.toString(), icon: FlaskConical, gradient: 'from-cyan-500 to-cyan-600', bgGradient: 'from-cyan-50 to-cyan-100' },
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
                    <h1 className="text-3xl font-bold text-gray-900">Feature Flags</h1>
                    <p className="text-gray-600 mt-1">Control feature rollouts, A/B tests, and environment toggles</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                    <Button id={`btn-action-admin-system-features-${i}`} variant="outline" size="sm" onClick={() => { setIsLoading(true); loadFlags() }}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                    <Button id="btn-open-create-modal-admin-system-features" size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={openCreateModal}>
                        <Plus className="w-4 h-4 mr-2" /> Create Flag
                    </Button>
                </motion.div>
            </div>

            {/* Create / Edit Modal */}
            {showModal && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="border-blue-200 shadow-lg">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{editingFlag ? 'Edit Feature Flag' : 'Create Feature Flag'}</CardTitle>
                                <Button id={`btn-action-admin-system-features-${i}`} variant="ghost" size="sm" onClick={() => { setShowModal(false); setEditingFlag(null) }}><X className="w-4 h-4" /></Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Flag Key</label>
                                    <input id="input-text-admin-system-features"
                                        type="text"
                                        value={form.key}
                                        onChange={e => setForm(f => ({ ...f, key: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                                        placeholder="my-feature-flag"
                                        disabled={!!editingFlag}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none font-mono disabled:bg-gray-50 disabled:text-gray-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Display Name</label>
                                    <input id="input-text-admin-system-features" type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="My Feature Flag" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe what this flag controls..." rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none resize-none" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Environment</label>
                                    <select id="select-admin-system-features-16" value={form.environment} onChange={e => setForm(f => ({ ...f, environment: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none">
                                        <option value="development">Development</option>
                                        <option value="staging">Staging</option>
                                        <option value="production">Production</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Initial State</label>
                                    <select id="select-admin-system-features-17" value={form.enabled ? 'enabled' : 'disabled'} onChange={e => setForm(f => ({ ...f, enabled: e.target.value === 'enabled', rolloutPercentage: e.target.value === 'enabled' ? 25 : 0 }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none">
                                        <option value="disabled">Disabled</option>
                                        <option value="enabled">Enabled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Rollout %</label>
                                    <input id="input-number-admin-system-features" type="number" min="0" max="100" value={form.rolloutPercentage} onChange={e => setForm(f => ({ ...f, rolloutPercentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button id="btn-action-admin-system-features" variant="outline" size="sm" onClick={() => { setShowModal(false); setEditingFlag(null) }}>Cancel</Button>
                                <Button id="btn-submit-admin-system-features" size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit} disabled={submitting}>
                                    {submitting ? (editingFlag ? 'Updating...' : 'Creating...') : (editingFlag ? 'Update Flag' : 'Create Flag')}
                                </Button>
                            </div>
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

            {/* Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        id={`input-text-admin-system-features-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}atures" type="text" placeholder="Search feature flags..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                    </div>
                </CardContent>
            </Card>

            {/* Flags List */}
            <div className="space-y-4">
                {filtered.length === 0 && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Flag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-500 mb-1">No feature flags found</h3>
                            <p className="text-sm text-gray-400">Create your first feature flag to get started</p>
                        </CardContent>
                    </Card>
                )}
                {filtered.map((flag, i) => {
                    const { status, statusColor } = getStatusInfo(flag.enabled, flag.rolloutPercentage)
                    return (
                        <motion.div key={flag.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.07 }}>
                            <Card className={`hover:shadow-lg transition-all duration-300 border-l-4 ${flag.enabled ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                                <CardContent className="p-5">
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-semibold text-gray-900 text-lg">{flag.name}</h3>
                                                <Badge className={getEnvColor(flag.environment)}>{flag.environment}</Badge>
                                                <Badge className={statusColor}>{status}</Badge>
                                            </div>
                                            <p className="text-sm text-gray-500">{flag.description}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                                    <Clock className="w-3 h-3" /> Updated: {formatDate(flag.updatedAt)}
                                                </div>
                                                <code className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{flag.key}</code>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 lg:gap-8">
                                            <div className="w-48">
                                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                    <span>Rollout</span>
                                                    <span className="font-medium">{flag.rolloutPercentage}%</span>
                                                </div>
                                                <input id="input-range-admin-system-features" type="range" min="0" max="100" step="5" value={flag.rolloutPercentage} onChange={(e) => updateRollout(flag, Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                                <Progress value={flag.rolloutPercentage} className="h-1.5 mt-1" />
                                            </div>

                                            <button id="btn-admin-system-features-10" onClick={() => toggleFlag(flag)} className="flex items-center gap-2 shrink-0">
                                                {flag.enabled ? <ToggleRight className="w-10 h-10 text-green-500" /> : <ToggleLeft className="w-10 h-10 text-gray-400" />}
                                            </button>

                                            <Button id="btn-open-edit-modal-admin-system-features" variant="ghost" size="sm" onClick={() => openEditModal(flag)} className="text-blue-500 hover:text-blue-700 shrink-0">
                                                <Edit2 className="w-4 h-4" />
                                            </Button>

                                            {deleteConfirm === flag.id ? (
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <Button id="btn-delete-admin-system-features" variant="ghost" size="sm" onClick={() => handleDelete(flag)} className="text-red-600 hover:text-red-800 text-xs">Confirm</Button>
                                                    <Button id="btn-set-delete-confirm-admin-system-features" variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)} className="text-gray-500 text-xs">Cancel</Button>
                                                </div>
                                            ) : (
                                                <Button id="btn-set-delete-confirm-admin-system-features" variant="ghost" size="sm" onClick={() => setDeleteConfirm(flag.id)} className="text-red-500 hover:text-red-700 shrink-0">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
