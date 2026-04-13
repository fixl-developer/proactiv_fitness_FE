'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PartnerPortalService from '@/services/modules/partner-portal.service'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Plus, BookOpen, CheckCircle, Users, DollarSign, Edit, Eye, Trash2, Brain, Loader2, RefreshCw, Sparkles, TrendingUp } from 'lucide-react'
import { usePartnerConfig } from '@/contexts/PartnerContext'
import { Badge } from '@/components/ui/badge'
import { revenueIntelligenceService } from '@/services/advancedAIServices'
import { validateRequired, validateTextArea, validateNumber, filterNumberInput, FORMAT_HINTS } from '@/utils/validation'
import { FormFieldHint } from '@/components/ui/FormFieldHint'

interface ProgramForm {
    name: string
    description: string
    category: string
    status: string
    enrolledStudents: string
    revenue: string
}

const emptyForm: ProgramForm = {
    name: '',
    description: '',
    category: '',
    status: 'active',
    enrolledStudents: '0',
    revenue: '0'
}

export default function Programs() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const { config } = usePartnerConfig()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [programs, setPrograms] = useState<any[]>([])
    const [selectedProgram, setSelectedProgram] = useState<any | null>(null)
    const [showViewModal, setShowViewModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [editForm, setEditForm] = useState<ProgramForm>({ ...emptyForm })
    const [saving, setSaving] = useState(false)
    const [aiOptimization, setAiOptimization] = useState<any>(null)
    const [aiLoading, setAiLoading] = useState(false)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    const validateProgramForm = (): boolean => {
        const newErrors: Record<string, string> = {}
        const nameErr = validateRequired(editForm.name, 'Program Name')
        if (nameErr) newErrors.name = nameErr
        const descErr = validateTextArea(editForm.description, 'Description', 0, 2000)
        if (descErr) newErrors.description = descErr
        if (editForm.enrolledStudents) {
            const studErr = validateNumber(editForm.enrolledStudents, 'Enrolled Students', 0)
            if (studErr) newErrors.enrolledStudents = studErr
        }
        if (editForm.revenue) {
            const revErr = validateNumber(editForm.revenue, 'Revenue', 0)
            if (revErr) newErrors.revenue = revErr
        }
        setFormErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const partnerId = user?.id || ''

    const loadAiProgramInsights = async () => {
        setAiLoading(true)
        try {
            const result = await revenueIntelligenceService.getOptimizationSuggestions()
            setAiOptimization(result?.data || result)
        } catch (err) { console.error('AI unavailable:', err) }
        finally { setAiLoading(false) }
    }

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        const loadPrograms = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await PartnerPortalService.getPartnerPrograms(partnerId, { limit: 20 })
                setPrograms(data.programs || [])
            } catch (err) {
                console.error('Error loading programs:', err)
                setError('Failed to load programs')
            } finally {
                setLoading(false)
            }
        }

        loadPrograms()
        loadAiProgramInsights()
    }, [isAuthenticated, router, user, partnerId])

    const stats = useMemo(() => {
        const totalPrograms = programs.length
        const activePrograms = programs.filter(p => p.status === 'active').length
        const totalStudents = programs.reduce((sum, p) => sum + (p.enrolledStudents || 0), 0)
        const totalRevenue = programs.reduce((sum, p) => sum + (p.revenue || 0), 0)
        return { totalPrograms, activePrograms, totalStudents, totalRevenue }
    }, [programs])

    const handleView = (program: any) => {
        setSelectedProgram(program)
        setShowViewModal(true)
    }

    const handleEdit = (program: any) => {
        setSelectedProgram(program)
        setEditForm({
            name: program.name || '',
            description: program.description || '',
            category: program.category || '',
            status: program.status || 'active',
            enrolledStudents: String(program.enrolledStudents || 0),
            revenue: String(program.revenue || 0)
        })
        setShowEditModal(true)
    }

    const handleDelete = async (program: any) => {
        if (window.confirm(`Are you sure you want to delete "${program.name}"?`)) {
            try {
                await PartnerPortalService.deletePartnerProgram(partnerId, program.id)
                setPrograms(prev => prev.filter(p => p.id !== program.id))
            } catch (err) {
                console.error('Error deleting program:', err)
                alert('Failed to delete program. Please try again.')
            }
        }
    }

    const handleEditSave = async () => {
        if (!validateProgramForm()) return
        try {
            setSaving(true)
            const updated = await PartnerPortalService.updatePartnerProgram(partnerId, selectedProgram.id, {
                ...editForm,
                enrolledStudents: parseInt(editForm.enrolledStudents) || 0,
                revenue: parseFloat(editForm.revenue) || 0
            } as any)
            setPrograms(prev => prev.map(p => p.id === selectedProgram.id ? { ...p, ...updated } : p))
            setShowEditModal(false)
            setSelectedProgram(null)
        } catch (err) {
            console.error('Error updating program:', err)
            alert('Failed to update program. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const handleAddProgram = async () => {
        if (!validateProgramForm()) return
        try {
            setSaving(true)
            const newProgram = await PartnerPortalService.createPartnerProgram(partnerId, {
                ...editForm,
                enrolledStudents: parseInt(editForm.enrolledStudents) || 0,
                revenue: parseFloat(editForm.revenue) || 0
            } as any)
            if (newProgram) {
                setPrograms(prev => [...prev, newProgram])
            }
            setShowAddModal(false)
            setEditForm({ ...emptyForm })
        } catch (err) {
            console.error('Error creating program:', err)
            alert('Failed to create program. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    if (!isAuthenticated) return null

    const kpiCards = [
        { title: `Total ${config.programLabel}`, value: stats.totalPrograms, icon: BookOpen, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100', change: `${stats.totalPrograms} total` },
        { title: `Active ${config.programLabel}`, value: stats.activePrograms, icon: CheckCircle, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100', change: `${stats.totalPrograms > 0 ? Math.round((stats.activePrograms / stats.totalPrograms) * 100) : 0}% active` },
        { title: `Total ${config.memberLabel}`, value: stats.totalStudents, icon: Users, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100', change: `Across ${config.programLabel.toLowerCase()}` },
        { title: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, gradient: 'from-orange-500 to-orange-600', bgGradient: 'from-orange-50 to-orange-100', change: `All ${config.programLabel.toLowerCase()}` },
    ]

    const renderFormFields = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                        type="text"
                        value={editForm.name}
                        onChange={e => {
                            setEditForm(prev => ({ ...prev, name: e.target.value }))
                            const err = validateRequired(e.target.value, 'Program Name')
                            setFormErrors(prev => { const n = { ...prev }; if (err) n.name = err; else delete n.name; return n })
                        }}
                        placeholder="Program name"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <FormFieldHint hint="Enter program name" error={formErrors.name} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                        type="text"
                        value={editForm.category}
                        onChange={e => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="e.g. Fitness, Yoga, CrossFit"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                    value={editForm.description}
                    onChange={e => {
                        setEditForm(prev => ({ ...prev, description: e.target.value }))
                        const err = validateTextArea(e.target.value, 'Description', 0, 2000)
                        setFormErrors(prev => { const n = { ...prev }; if (err) n.description = err; else delete n.description; return n })
                    }}
                    rows={2}
                    placeholder="Program description"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.description ? 'border-red-500' : 'border-gray-300'}`}
                />
                <FormFieldHint hint={FORMAT_HINTS.description} error={formErrors.description} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                        value={editForm.status}
                        onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{config.enrolledLabel} {config.memberLabel}</label>
                    <input
                        type="number"
                        min="0"
                        value={editForm.enrolledStudents}
                        onKeyDown={filterNumberInput}
                        onChange={e => {
                            setEditForm(prev => ({ ...prev, enrolledStudents: e.target.value }))
                            if (e.target.value) {
                                const err = validateNumber(e.target.value, 'Enrolled Students', 0)
                                setFormErrors(prev => { const n = { ...prev }; if (err) n.enrolledStudents = err; else delete n.enrolledStudents; return n })
                            }
                        }}
                        placeholder="0"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.enrolledStudents ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <FormFieldHint hint={FORMAT_HINTS.capacity} error={formErrors.enrolledStudents} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Revenue ($)</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editForm.revenue}
                        onKeyDown={filterNumberInput}
                        onChange={e => {
                            setEditForm(prev => ({ ...prev, revenue: e.target.value }))
                            if (e.target.value) {
                                const err = validateNumber(e.target.value, 'Revenue', 0)
                                setFormErrors(prev => { const n = { ...prev }; if (err) n.revenue = err; else delete n.revenue; return n })
                            }
                        }}
                        placeholder="0"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.revenue ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <FormFieldHint hint={FORMAT_HINTS.amount} error={formErrors.revenue} />
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">{config.programLabelSingular} Management</h1>
                    <button
                        id="partner-programs-new-btn"
                        onClick={() => {
                            setEditForm({ ...emptyForm })
                            setShowAddModal(true)
                        }}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        New {config.programLabelSingular}
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {kpiCards.map((metric, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                            <Card className={`hover:shadow-lg transition-all border-0 bg-gradient-to-br ${metric.bgGradient}`}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`bg-gradient-to-br ${metric.gradient} p-2.5 rounded-lg shadow-md`}>
                                            <metric.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">{metric.change}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 font-medium mb-1">{metric.title}</p>
                                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* AI Program Optimization */}
                <Card className="border-purple-200 mb-6">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Brain className="w-5 h-5 text-purple-600" />
                                <span className="font-semibold text-sm">AI Program Optimizer</span>
                                <Badge className="bg-purple-100 text-purple-700 text-xs">AI</Badge>
                            </div>
                            <button onClick={loadAiProgramInsights} disabled={aiLoading} className="text-gray-400 hover:text-gray-600">
                                <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        {aiLoading ? (
                            <div className="flex items-center gap-2 py-2">
                                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                <p className="text-xs text-gray-500">Analyzing programs...</p>
                            </div>
                        ) : aiOptimization ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {(Array.isArray(aiOptimization) ? aiOptimization : aiOptimization.suggestions || aiOptimization.recommendations || []).slice(0, 3).map((tip: any, i: number) => (
                                    <div key={i} className="p-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                                        <div className="flex items-center gap-1 mb-1">
                                            <Sparkles className="w-3 h-3 text-purple-600" />
                                            <span className="text-xs font-semibold text-purple-700">{tip.title || tip.name || `Tip ${i + 1}`}</span>
                                        </div>
                                        <p className="text-xs text-gray-700">{tip.description || tip.suggestion || tip.reason || tip}</p>
                                    </div>
                                ))}
                                {(!Array.isArray(aiOptimization) && !aiOptimization.suggestions && !aiOptimization.recommendations) && (
                                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 col-span-3">
                                        <p className="text-sm text-purple-800">{aiOptimization.message || 'AI is analyzing your programs for optimization opportunities.'}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400">AI unavailable. <button onClick={loadAiProgramInsights} className="text-purple-600 hover:underline">Retry</button></p>
                        )}
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading {config.programLabel.toLowerCase()}...</p>
                        </div>
                    </div>
                ) : programs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No {config.programLabel} Yet</h3>
                        <p className="text-gray-400 mb-6">Create your first {config.programLabelSingular.toLowerCase()} to get started.</p>
                        <button
                            onClick={() => {
                                setEditForm({ ...emptyForm })
                                setShowAddModal(true)
                            }}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create {config.programLabelSingular}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {programs.map((program) => (
                            <motion.div
                                key={program.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                        program.status === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {program.status === 'active' ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{program.description}</p>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-600"><span className="font-medium">Category:</span> {program.category}</p>
                                    <p className="text-gray-600"><span className="font-medium">{config.memberLabel}:</span> {program.enrolledStudents}</p>
                                    <p className="text-gray-600"><span className="font-medium">Revenue:</span> ${program.revenue?.toLocaleString()}</p>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <button
                                        id={`partner-programs-edit-${program.id}-btn`}
                                        onClick={() => handleEdit(program)}
                                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium flex items-center justify-center gap-1"
                                    >
                                        <Edit className="w-3.5 h-3.5" />
                                        Edit
                                    </button>
                                    <button
                                        id={`partner-programs-view-${program.id}-btn`}
                                        onClick={() => handleView(program)}
                                        className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 text-sm font-medium flex items-center justify-center gap-1"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        View
                                    </button>
                                    <button
                                        id={`partner-programs-delete-${program.id}-btn`}
                                        onClick={() => handleDelete(program)}
                                        className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium flex items-center justify-center gap-1"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* View Modal */}
            {showViewModal && selectedProgram && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowViewModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedProgram.name}</h2>
                        <div className="space-y-3">
                            <p className="text-gray-600">{selectedProgram.description}</p>
                            <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Category</p>
                                    <p className="text-gray-900 font-semibold">{selectedProgram.category}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Status</p>
                                    <p className="text-gray-900 font-semibold capitalize">{selectedProgram.status || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">{config.memberLabel}</p>
                                    <p className="text-gray-900 font-semibold">{selectedProgram.enrolledStudents}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Revenue</p>
                                    <p className="text-gray-900 font-semibold">${selectedProgram.revenue?.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setShowViewModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedProgram && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit {config.programLabelSingular}</h2>
                        {renderFormFields()}
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                                Cancel
                            </button>
                            <button
                                onClick={handleEditSave}
                                disabled={saving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New {config.programLabelSingular}</h2>
                        {renderFormFields()}
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                                Cancel
                            </button>
                            <button
                                onClick={handleAddProgram}
                                disabled={saving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                            >
                                {saving ? 'Creating...' : `Create ${config.programLabelSingular}`}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
