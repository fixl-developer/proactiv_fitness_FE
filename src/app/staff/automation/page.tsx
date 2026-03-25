'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supportStaffService } from '@/services/supportStaffService'
import {
    Plus,
    AlertCircle,
    Zap,
    CheckCircle,
    PauseCircle,
    Activity,
    X,
    Edit2,
    Trash2,
} from 'lucide-react'

interface AutomationRule {
    id: string
    name: string
    description?: string
    trigger: string
    conditions?: { field: string; operator: string; value: string }[]
    actions?: { type: string; value: string }[]
    isActive: boolean
    createdAt?: string
    updatedAt?: string
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

export default function Automation() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [rules, setRules] = useState<AutomationRule[]>([])
    const [showNewRuleModal, setShowNewRuleModal] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        trigger: 'ticket_created',
        conditionField: '',
        conditionOperator: 'equals',
        conditionValue: '',
        actionType: 'assign',
        actionValue: '',
        isActive: true,
    })

    const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }, [])

    const loadRules = useCallback(async () => {
        setLoading(true)
        try {
            const data = await supportStaffService.getAutomationRules()
            setRules(data?.rules || [])
        } catch {
            setRules([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadRules()
    }, [isAuthenticated, router, loadRules])

    const handleToggle = (id: string) => {
        setRules((prev) =>
            prev.map((rule) =>
                rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
            )
        )
        showToast('Rule status updated successfully')
    }

    const handleDelete = (id: string) => {
        setRules((prev) => prev.filter((rule) => rule.id !== id))
        showToast('Rule deleted successfully')
    }

    const handleEdit = (id: string) => {
        const rule = rules.find((r) => r.id === id)
        if (!rule) return
        setFormData({
            name: rule.name,
            description: rule.description || '',
            trigger: rule.trigger || 'ticket_created',
            conditionField: rule.conditions?.[0]?.field || '',
            conditionOperator: rule.conditions?.[0]?.operator || 'equals',
            conditionValue: rule.conditions?.[0]?.value || '',
            actionType: rule.actions?.[0]?.type || 'assign',
            actionValue: rule.actions?.[0]?.value || '',
            isActive: rule.isActive,
        })
        setShowNewRuleModal(true)
    }

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            trigger: 'ticket_created',
            conditionField: '',
            conditionOperator: 'equals',
            conditionValue: '',
            actionType: 'assign',
            actionValue: '',
            isActive: true,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name.trim()) {
            setError('Rule name is required')
            return
        }
        setSubmitting(true)
        setError(null)
        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                trigger: formData.trigger,
                conditions: formData.conditionField
                    ? [{ field: formData.conditionField, operator: formData.conditionOperator, value: formData.conditionValue }]
                    : [],
                actions: formData.actionType
                    ? [{ type: formData.actionType, value: formData.actionValue }]
                    : [],
                isActive: formData.isActive,
            }
            await supportStaffService.createAutomationRule(payload)
            showToast('Rule created successfully')
            setShowNewRuleModal(false)
            resetForm()
            await loadRules()
        } catch {
            setError('Failed to create rule')
        } finally {
            setSubmitting(false)
        }
    }

    // Stats
    const totalRules = rules.length
    const activeRules = rules.filter((r) => r.isActive).length
    const inactiveRules = rules.filter((r) => !r.isActive).length
    const triggersToday = rules.filter((r) => r.isActive).length // approximate

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Automation Rules</h1>
                    <button
                        id="staff-automation-new-rule-btn"
                        onClick={() => {
                            resetForm()
                            setShowNewRuleModal(true)
                        }}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        New Rule
                    </button>
                </div>

                {/* Toast */}
                {toast && (
                    <div
                        className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white font-medium transition-all ${
                            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                        }`}
                    >
                        {toast.message}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {/* Total Rules */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-blue-50 to-blue-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Total Rules</p>
                        <p className="text-2xl font-bold text-gray-900">{totalRules}</p>
                    </div>

                    {/* Active */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-green-50 to-green-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-lg shadow-md">
                                <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Active</p>
                        <p className="text-2xl font-bold text-gray-900">{activeRules}</p>
                    </div>

                    {/* Inactive */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-slate-50 to-slate-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-slate-500 to-slate-600 p-2.5 rounded-lg shadow-md">
                                <PauseCircle className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Inactive</p>
                        <p className="text-2xl font-bold text-gray-900">{inactiveRules}</p>
                    </div>

                    {/* Triggers Today */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-purple-50 to-purple-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg shadow-md">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Triggers Today</p>
                        <p className="text-2xl font-bold text-gray-900">{triggersToday}</p>
                    </div>
                </div>

                {/* Rules List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading automation rules...</p>
                        </div>
                    </div>
                ) : rules.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-12 text-center">
                        <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Automation Rules</h3>
                        <p className="text-gray-500 mb-6">Create your first automation rule to get started.</p>
                        <button
                            onClick={() => {
                                resetForm()
                                setShowNewRuleModal(true)
                            }}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            New Rule
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {rules.map((rule) => (
                            <div
                                key={rule.id}
                                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                {rule.name}
                                            </h3>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    rule.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {rule.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        {rule.description && (
                                            <p className="text-sm text-gray-500 mb-3">{rule.description}</p>
                                        )}
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <div>
                                                <span className="font-medium text-gray-700">Trigger:</span>{' '}
                                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                                                    {rule.trigger}
                                                </span>
                                            </div>
                                            {rule.conditions && rule.conditions.length > 0 && (
                                                <div>
                                                    <span className="font-medium text-gray-700">Conditions:</span>{' '}
                                                    {rule.conditions.map((c, i) => (
                                                        <span
                                                            key={i}
                                                            className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium mr-1"
                                                        >
                                                            {c.field} {c.operator} {c.value}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {rule.actions && rule.actions.length > 0 && (
                                                <div>
                                                    <span className="font-medium text-gray-700">Actions:</span>{' '}
                                                    {rule.actions.map((a, i) => (
                                                        <span
                                                            key={i}
                                                            className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs font-medium mr-1"
                                                        >
                                                            {a.type}: {a.value}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                                        {/* Toggle Switch */}
                                        <button
                                            id={`staff-automation-toggle-${rule.id}-btn`}
                                            onClick={() => handleToggle(rule.id)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                rule.isActive ? 'bg-green-500' : 'bg-gray-300'
                                            }`}
                                            title={rule.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                                    rule.isActive ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                        {/* Edit */}
                                        <button
                                            id={`staff-automation-edit-${rule.id}-btn`}
                                            onClick={() => handleEdit(rule.id)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit Rule"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        {/* Delete */}
                                        <button
                                            id={`staff-automation-delete-${rule.id}-btn`}
                                            onClick={() => handleDelete(rule.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

            {/* New Rule Modal */}
            {showNewRuleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowNewRuleModal(false)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">New Automation Rule</h2>
                            <button
                                onClick={() => setShowNewRuleModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="Enter rule name"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                    rows={3}
                                    placeholder="Describe what this rule does"
                                />
                            </div>

                            {/* Trigger */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trigger</label>
                                <select
                                    value={formData.trigger}
                                    onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                >
                                    {TRIGGER_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Condition Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Condition Field</label>
                                <input
                                    type="text"
                                    value={formData.conditionField}
                                    onChange={(e) => setFormData({ ...formData, conditionField: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="e.g. priority, category, status"
                                />
                            </div>

                            {/* Condition Operator */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Condition Operator
                                </label>
                                <select
                                    value={formData.conditionOperator}
                                    onChange={(e) => setFormData({ ...formData, conditionOperator: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                >
                                    {OPERATOR_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Condition Value */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Condition Value</label>
                                <input
                                    type="text"
                                    value={formData.conditionValue}
                                    onChange={(e) => setFormData({ ...formData, conditionValue: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="e.g. high, billing, open"
                                />
                            </div>

                            {/* Action Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                                <select
                                    value={formData.actionType}
                                    onChange={(e) => setFormData({ ...formData, actionType: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                >
                                    {ACTION_TYPE_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Action Value */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Action Value</label>
                                <input
                                    type="text"
                                    value={formData.actionValue}
                                    onChange={(e) => setFormData({ ...formData, actionValue: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="e.g. team_lead, support@email.com"
                                />
                            </div>

                            {/* Active Checkbox */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="rule-active-checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="rule-active-checkbox" className="text-sm font-medium text-gray-700">
                                    Active
                                </label>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowNewRuleModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {submitting ? 'Creating...' : 'Create Rule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
