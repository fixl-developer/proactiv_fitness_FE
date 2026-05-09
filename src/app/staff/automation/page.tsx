'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supportStaffService } from '@/services/supportStaffService'
import { Plus, AlertCircle, Zap, CheckCircle, PauseCircle, Activity, Edit2, Trash2, RefreshCw } from 'lucide-react'
import { validateRequired } from '@/utils/validation'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { toast } from 'sonner'

interface AutomationRule {
    id: string
    ruleId?: string
    name: string
    description?: string
    trigger: string
    conditions?: { field: string; operator: string; value: string }[]
    actions?: { type: string; value: string }[]
    isActive: boolean
    createdAt?: string
}

const TRIGGER_OPTIONS = [
    { value: 'ticket_created', label: 'Ticket Created' },
    { value: 'ticket_updated', label: 'Ticket Updated' },
    { value: 'ticket_escalated', label: 'Ticket Escalated' },
    { value: 'sla_breached', label: 'SLA Breached' },
]

const OPERATOR_OPTIONS = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'greater_than', label: 'Greater Than' },
]

const ACTION_TYPE_OPTIONS = [
    { value: 'assign', label: 'Assign' },
    { value: 'notify', label: 'Notify' },
    { value: 'escalate', label: 'Escalate' },
    { value: 'update_status', label: 'Update Status' },
]

const FIELD_OPTIONS = ['priority', 'status', 'category', 'customer', 'assignedTo']

const emptyForm = {
    name: '',
    description: '',
    trigger: 'ticket_created',
    conditionField: '',
    conditionOperator: 'equals',
    conditionValue: '',
    actionType: 'assign',
    actionValue: '',
    isActive: true,
}

export default function Automation() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [rules, setRules] = useState<AutomationRule[]>([])
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    const loadRules = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await supportStaffService.getAutomationRules()
            setRules(data?.rules || [])
        } catch (err: any) {
            setRules([])
            setError(err?.response?.data?.message || 'Failed to load rules')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return }
        loadRules()
    }, [isAuthenticated, router, loadRules])

    const openCreate = () => {
        setEditingId(null)
        setForm(emptyForm)
        setFormErrors({})
        setDrawerOpen(true)
    }

    const openEdit = (rule: AutomationRule) => {
        setEditingId(rule.ruleId || rule.id)
        setForm({
            name: rule.name || '',
            description: rule.description || '',
            trigger: rule.trigger || 'ticket_created',
            conditionField: rule.conditions?.[0]?.field || '',
            conditionOperator: rule.conditions?.[0]?.operator || 'equals',
            conditionValue: rule.conditions?.[0]?.value || '',
            actionType: rule.actions?.[0]?.type || 'assign',
            actionValue: rule.actions?.[0]?.value || '',
            isActive: rule.isActive,
        })
        setFormErrors({})
        setDrawerOpen(true)
    }

    const validateForm = (): Record<string, string> => {
        const errs: Record<string, string> = {}
        const n = validateRequired(form.name, 'Rule Name'); if (n) errs.name = n
        const t = validateRequired(form.trigger, 'Trigger'); if (t) errs.trigger = t
        const at = validateRequired(form.actionType, 'Action Type'); if (at) errs.actionType = at
        const av = validateRequired(form.actionValue, 'Action Value'); if (av) errs.actionValue = av
        return errs
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const errs = validateForm()
        setFormErrors(errs)
        if (Object.keys(errs).length > 0) return
        setSubmitting(true)
        try {
            const payload = {
                name: form.name.trim(),
                description: form.description.trim(),
                trigger: form.trigger,
                conditions: form.conditionField
                    ? [{ field: form.conditionField, operator: form.conditionOperator, value: form.conditionValue }]
                    : [],
                actions: form.actionType
                    ? [{ type: form.actionType, value: form.actionValue }]
                    : [],
                isActive: form.isActive,
            }
            if (editingId) {
                await (supportStaffService as any).updateAutomationRule(editingId, payload)
                toast.success('Rule updated')
            } else {
                await supportStaffService.createAutomationRule(payload)
                toast.success('Rule created')
            }
            setDrawerOpen(false)
            setForm(emptyForm)
            setEditingId(null)
            await loadRules()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to save rule')
        } finally {
            setSubmitting(false)
        }
    }

    const handleToggle = async (rule: AutomationRule) => {
        try {
            const id = rule.ruleId || rule.id
            await (supportStaffService as any).updateAutomationRule(id, { isActive: !rule.isActive })
            toast.success(`Rule ${!rule.isActive ? 'activated' : 'deactivated'}`)
            await loadRules()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to toggle rule')
        }
    }

    const handleDelete = async (rule: AutomationRule) => {
        if (!confirm(`Delete rule "${rule.name}"?`)) return
        try {
            const id = rule.ruleId || rule.id
            await (supportStaffService as any).deleteAutomationRule(id)
            toast.success('Rule deleted')
            await loadRules()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to delete rule')
        }
    }

    const totalRules = rules.length
    const activeRules = rules.filter((r) => r.isActive).length
    const inactiveRules = rules.filter((r) => !r.isActive).length

    if (!isAuthenticated) return null

    return (
        <div>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Automation Rules</h1>
                        <p className="text-sm text-gray-500 mt-1">Define triggers, conditions, and actions for tickets</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={loadRules}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            id="staff-automation-btn-create"
                            onClick={openCreate}
                            className="bg-cyan-600 text-white px-5 py-2 rounded-lg hover:bg-cyan-700 inline-flex items-center gap-2 text-sm font-medium shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> New Rule
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Total Rules</p>
                        <p className="text-2xl font-bold text-gray-900">{totalRules}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Active</p>
                        <p className="text-2xl font-bold text-gray-900">{activeRules}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-slate-500 to-slate-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <PauseCircle className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Inactive</p>
                        <p className="text-2xl font-bold text-gray-900">{inactiveRules}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Triggers/Day</p>
                        <p className="text-2xl font-bold text-gray-900">{activeRules}</p>
                    </div>
                </div>

                {/* Rules List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
                    </div>
                ) : rules.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-12 text-center">
                        <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Automation Rules</h3>
                        <p className="text-gray-500 mb-6 text-sm">Create your first automation rule to get started.</p>
                        <button
                            onClick={openCreate}
                            className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 inline-flex items-center gap-2 text-sm"
                        >
                            <Plus className="w-4 h-4" /> New Rule
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {rules.map((rule) => (
                            <div key={rule.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">{rule.name}</h3>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                {rule.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        {rule.description && <p className="text-sm text-gray-500 mb-3">{rule.description}</p>}
                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">Trigger:</span>{' '}
                                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{rule.trigger}</span>
                                            </div>
                                            {rule.conditions && rule.conditions.length > 0 && (
                                                <div>
                                                    <span className="font-medium text-gray-700">Conditions:</span>{' '}
                                                    {rule.conditions.map((c, i) => (
                                                        <span key={i} className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium mr-1">
                                                            {c.field} {c.operator} {c.value}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {rule.actions && rule.actions.length > 0 && (
                                                <div>
                                                    <span className="font-medium text-gray-700">Actions:</span>{' '}
                                                    {rule.actions.map((a, i) => (
                                                        <span key={i} className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs font-medium mr-1">
                                                            {a.type}: {a.value}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <button
                                            onClick={() => handleToggle(rule)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${rule.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                                            title={rule.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${rule.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                        <button
                                            onClick={() => openEdit(rule)}
                                            className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg"
                                            title="Edit Rule"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(rule)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                            title="Delete Rule"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CREATE / EDIT DRAWER (right side) */}
            <SlideInDrawer
                isOpen={drawerOpen}
                onClose={() => { setDrawerOpen(false); setEditingId(null); setForm(emptyForm); setFormErrors({}) }}
                title={editingId ? 'Edit Automation Rule' : 'New Automation Rule'}
                description={editingId ? 'Update rule trigger, conditions, and actions' : 'Define a new automation rule'}
                size="lg"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => { setDrawerOpen(false); setForm(emptyForm); setEditingId(null) }}
                            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                        >Cancel</button>
                        <button
                            type="submit"
                            form="automation-form"
                            disabled={submitting}
                            className="px-5 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 inline-flex items-center gap-2 text-sm font-medium"
                        >
                            {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                            {submitting ? 'Saving…' : (editingId ? 'Save Changes' : 'Create Rule')}
                        </button>
                    </div>
                }
            >
                <form id="automation-form" onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => {
                                setForm({ ...form, name: e.target.value })
                                const err = validateRequired(e.target.value, 'Rule Name')
                                setFormErrors(p => { const n = { ...p }; if (err) n.name = err; else delete n.name; return n })
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="e.g. Auto-assign critical tickets"
                        />
                        <FormFieldHint hint="" error={formErrors.name} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            rows={2}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                            placeholder="Brief description of what this rule does"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trigger <span className="text-red-500">*</span></label>
                        <select
                            value={form.trigger}
                            onChange={(e) => setForm({ ...form, trigger: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            {TRIGGER_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                        <p className="text-sm font-semibold text-gray-700">Condition (optional)</p>
                        <div className="grid grid-cols-3 gap-3">
                            <select
                                value={form.conditionField}
                                onChange={(e) => setForm({ ...form, conditionField: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                                <option value="">Field</option>
                                {FIELD_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                            <select
                                value={form.conditionOperator}
                                onChange={(e) => setForm({ ...form, conditionOperator: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                                {OPERATOR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            <input
                                type="text"
                                value={form.conditionValue}
                                onChange={(e) => setForm({ ...form, conditionValue: e.target.value })}
                                placeholder="Value"
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                        <p className="text-sm font-semibold text-gray-700">Action <span className="text-red-500">*</span></p>
                        <div className="grid grid-cols-2 gap-3">
                            <select
                                value={form.actionType}
                                onChange={(e) => {
                                    setForm({ ...form, actionType: e.target.value })
                                    setFormErrors(p => { const n = { ...p }; delete n.actionType; return n })
                                }}
                                className={`px-3 py-2 border rounded-lg text-sm ${formErrors.actionType ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                {ACTION_TYPE_OPTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                            </select>
                            <input
                                type="text"
                                value={form.actionValue}
                                onChange={(e) => {
                                    setForm({ ...form, actionValue: e.target.value })
                                    const err = validateRequired(e.target.value, 'Action Value')
                                    setFormErrors(p => { const n = { ...p }; if (err) n.actionValue = err; else delete n.actionValue; return n })
                                }}
                                placeholder="Value (e.g. senior_staff)"
                                className={`px-3 py-2 border rounded-lg text-sm ${formErrors.actionValue ? 'border-red-500' : 'border-gray-300'}`}
                            />
                        </div>
                        <FormFieldHint hint="" error={formErrors.actionType || formErrors.actionValue} />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                            className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Activate this rule immediately</span>
                    </label>
                </form>
            </SlideInDrawer>
        </div>
    )
}
