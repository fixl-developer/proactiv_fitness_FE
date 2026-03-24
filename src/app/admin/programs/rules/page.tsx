'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────────────────
interface Rule {
  _id: string
  name: string
  category: string
  conditions: RuleCondition[]
  priority: number
  status: 'active' | 'inactive'
  description?: string
  lastEvaluated?: string
  createdAt?: string
}

interface RuleCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in'
  value: string
}

interface EvaluationResult {
  ruleId: string
  ruleName: string
  passed: boolean
  message: string
}

const EMPTY_FORM = {
  name: '',
  category: 'enrollment',
  conditions: [{ field: '', operator: 'equals' as const, value: '' }],
  priority: 1,
  status: 'active' as const,
  description: '',
}

const CATEGORIES = ['enrollment', 'scheduling', 'pricing', 'capacity', 'age', 'prerequisite']
const OPERATORS: { value: RuleCondition['operator']; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not equals' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
  { value: 'contains', label: 'Contains' },
  { value: 'in', label: 'In list' },
]

// ── Fallback mock data ─────────────────────────────────────────────────────
const FALLBACK_RULES: Rule[] = [
  { _id: 'mock-r1', name: 'Minimum Age Check', category: 'age', conditions: [{ field: 'student.age', operator: 'greater_than', value: '3' }], priority: 1, status: 'active', description: 'Students must be at least 3 years old' },
  { _id: 'mock-r2', name: 'Capacity Limit', category: 'capacity', conditions: [{ field: 'program.enrolledCount', operator: 'less_than', value: 'program.capacity' }], priority: 2, status: 'active', description: 'Enrollment cannot exceed capacity' },
  { _id: 'mock-r3', name: 'Prerequisite Level', category: 'prerequisite', conditions: [{ field: 'student.level', operator: 'equals', value: 'intermediate' }], priority: 3, status: 'inactive', description: 'Must complete beginner level first' },
]

// ── Component ──────────────────────────────────────────────────────────────
export default function ProgramRulesPage() {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [apiFailed, setApiFailed] = useState(false)

  // Form
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  // Test evaluation
  const [testing, setTesting] = useState(false)
  const [testResults, setTestResults] = useState<EvaluationResult[] | null>(null)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Rule | null>(null)

  // ── Load rules ─────────────────────────────────────────────────────────
  const loadRules = useCallback(async () => {
    setLoading(true)
    try {
      const res: any = await apiClient.get('/rules')
      const raw = res?.data?.data ?? res?.data?.rules ?? res?.data ?? res?.rules ?? res
      const list = Array.isArray(raw) ? raw : []
      setRules(list)
      setApiFailed(false)
    } catch (err: any) {
      console.error('Failed to load rules:', err)
      setApiFailed(true)
      setRules(FALLBACK_RULES)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRules()
  }, [loadRules])

  // ── Create / Edit ──────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        conditions: formData.conditions,
        priority: formData.priority,
        status: formData.status,
        description: formData.description,
      }
      if (editingId) {
        await apiClient.put(`/rules/${editingId}`, payload)
        toast.success('Rule updated successfully')
      } else {
        await apiClient.post('/rules', payload)
        toast.success('Rule created successfully')
      }
      resetForm()
      loadRules()
    } catch {
      toast.error(editingId ? 'Failed to update rule' : 'Failed to create rule')
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (r: Rule) => {
    setEditingId(r._id)
    setFormData({
      name: r.name,
      category: r.category,
      conditions: r.conditions.length > 0 ? r.conditions : [{ field: '', operator: 'equals', value: '' }],
      priority: r.priority,
      status: r.status,
      description: r.description || '',
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(EMPTY_FORM)
  }

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await apiClient.delete(`/rules/${deleteTarget._id}`)
      toast.success(`"${deleteTarget.name}" deleted`)
      setDeleteTarget(null)
      loadRules()
    } catch {
      toast.error('Failed to delete rule')
    }
  }

  // ── Toggle status ──────────────────────────────────────────────────────
  const toggleStatus = async (r: Rule) => {
    try {
      await apiClient.patch(`/rules/${r._id}/status`, {
        status: r.status === 'active' ? 'inactive' : 'active',
      })
      toast.success(`"${r.name}" ${r.status === 'active' ? 'deactivated' : 'activated'}`)
      loadRules()
    } catch {
      toast.error('Failed to toggle rule status')
    }
  }

  // ── Test / Evaluate rules ─────────────────────────────────────────────
  const handleTestRules = async () => {
    setTesting(true)
    setTestResults(null)
    try {
      const res: any = await apiClient.post('/rules/evaluate')
      const results = Array.isArray(res) ? res : res?.data ?? res?.results ?? []
      setTestResults(results)
      toast.success('Rules evaluated')
    } catch {
      toast.error('Failed to evaluate rules')
    } finally {
      setTesting(false)
    }
  }

  // ── Condition helpers ─────────────────────────────────────────────────
  const updateCondition = (index: number, field: keyof RuleCondition, value: string) => {
    const updated = [...formData.conditions]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, conditions: updated })
  }

  const addCondition = () => {
    setFormData({
      ...formData,
      conditions: [...formData.conditions, { field: '', operator: 'equals', value: '' }],
    })
  }

  const removeCondition = (index: number) => {
    if (formData.conditions.length <= 1) return
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((_, i) => i !== index),
    })
  }

  // ── Visual helpers ────────────────────────────────────────────────────
  const statusColor = (s: string) =>
    s === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'

  const categoryColor = (c: string) => {
    const map: Record<string, string> = {
      enrollment: 'bg-blue-100 text-blue-800',
      scheduling: 'bg-purple-100 text-purple-800',
      pricing: 'bg-orange-100 text-orange-800',
      capacity: 'bg-teal-100 text-teal-800',
      age: 'bg-pink-100 text-pink-800',
      prerequisite: 'bg-yellow-100 text-yellow-800',
    }
    return map[c] ?? 'bg-gray-100 text-gray-600'
  }

  const priorityLabel = (p: number) => {
    if (p <= 1) return { text: 'Critical', cls: 'text-red-600 font-semibold' }
    if (p <= 3) return { text: 'High', cls: 'text-orange-600 font-medium' }
    if (p <= 5) return { text: 'Medium', cls: 'text-yellow-600' }
    return { text: 'Low', cls: 'text-gray-500' }
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="p-6">
      {/* API warning banner */}
      {apiFailed && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800 flex items-center gap-2">
          <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Unable to reach the rules API. Showing sample data.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Program Rules</h1>
        <div className="flex gap-3">
          <button id="btn-admin-programs-rules-1"
            onClick={handleTestRules}
            disabled={testing}
            className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 disabled:opacity-50"
          >
            {testing ? 'Evaluating...' : 'Test All Rules'}
          </button>
          <button id="btn-admin-programs-rules-2"
            onClick={() => { showForm ? resetForm() : setShowForm(true) }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Create Rule'}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Rules</p>
          <p className="text-2xl font-bold mt-1">{rules.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold mt-1 text-green-600">
            {rules.filter((r) => r.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="text-2xl font-bold mt-1 text-red-600">
            {rules.filter((r) => r.status === 'inactive').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Categories</p>
          <p className="text-2xl font-bold mt-1">
            {new Set(rules.map((r) => r.category)).size}
          </p>
        </div>
      </div>

      {/* Test results */}
      {testResults && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Evaluation Results</h2>
            <button id="btn-admin-programs-rules-3" onClick={() => setTestResults(null)} className="text-sm text-gray-500 hover:text-gray-700">
              Dismiss
            </button>
          </div>
          {testResults.length === 0 ? (
            <p className="text-gray-500 text-sm">No evaluation results returned.</p>
          ) : (
            <div className="space-y-2">
              {testResults.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                    r.passed ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}
                >
                  <span className="font-medium">{r.passed ? 'PASS' : 'FAIL'}</span>
                  <span className="font-medium">{r.ruleName}</span>
                  <span className="text-xs opacity-75">{r.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Rule' : 'Create Rule'}</h2>
          <form id="form-admin-programs-rules" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rule Name</label>
                <input id={`input-text-admin-programs-rules-${i}`}
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="e.g., Minimum Age Check"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select id="select-admin-programs-rules-15"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Priority (1 = highest)</label>
                <input id="input-number-admin-programs-rules"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                  min={1}
                  max={10}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select id="select-admin-programs-rules-16"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Rule['status'] })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={2}
              />
            </div>

            {/* Conditions builder */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Conditions</label>
                <button id="btn-admin-programs-rules-4" type="button" onClick={addCondition} className="text-sm text-blue-600 hover:text-blue-800">
                  + Add Condition
                </button>
              </div>
              <div className="space-y-2">
                {formData.conditions.map((cond, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input id={`input-text-admin-programs-rules-${i}`}
                      type="text"
                      placeholder="Field (e.g. student.age)"
                      value={cond.field}
                      onChange={(e) => updateCondition(i, 'field', e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      required
                    />
                    <select id="select-admin-programs-rules-17"
                      value={cond.operator}
                      onChange={(e) => updateCondition(i, 'operator', e.target.value)}
                      className="px-3 py-2 border rounded-lg text-sm"
                    >
                      {OPERATORS.map((op) => (
                        <option key={op.value} value={op.value}>{op.label}</option>
                      ))}
                    </select>
                    <input id="input-text-admin-programs-rules"
                      type="text"
                      placeholder="Value"
                      value={cond.value}
                      onChange={(e) => updateCondition(i, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      required
                    />
                    {formData.conditions.length > 1 && (
                      <button id="admin-programs-rules-btn-remove"
                        type="button"
                        onClick={() => removeCondition(i)}
                        className="text-red-500 hover:text-red-700 px-2 py-1 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button id="admin-programs-rules-btn"
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingId ? 'Update Rule' : 'Create Rule'}
              </button>
              <button id="btn-admin-programs-rules-5" type="button" onClick={resetForm} className="px-6 py-2 border rounded-lg hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rules list */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading rules...</div>
      ) : rules.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          No rules found. Create your first rule to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((r) => {
            const pri = priorityLabel(r.priority)
            return (
              <div key={r._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{r.name}</h3>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor(r.status)}`}>
                        {r.status}
                      </span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${categoryColor(r.category)}`}>
                        {r.category}
                      </span>
                      <span className={`text-xs ${pri.cls}`}>Priority: {r.priority} ({pri.text})</span>
                    </div>
                    {r.description && <p className="text-sm text-gray-600 mt-1">{r.description}</p>}
                    {/* Conditions summary */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {r.conditions.map((c, i) => (
                        <span key={i} className="inline-block bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                          {c.field} {c.operator.replace('_', ' ')} {c.value}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-4 flex-shrink-0">
                    <button id="btn-admin-programs-rules-6" onClick={() => startEdit(r)} className="text-blue-600 hover:text-blue-800 px-2 py-1 text-sm rounded hover:bg-blue-50">
                      Edit
                    </button>
                    <button id="btn-admin-programs-rules-7" onClick={() => toggleStatus(r)} className="text-yellow-600 hover:text-yellow-800 px-2 py-1 text-sm rounded hover:bg-yellow-50">
                      {r.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button id="btn-admin-programs-rules-8" onClick={() => setDeleteTarget(r)} className="text-red-600 hover:text-red-800 px-2 py-1 text-sm rounded hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button id="btn-admin-programs-rules-9" onClick={() => setDeleteTarget(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button id="btn-admin-programs-rules-10" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
