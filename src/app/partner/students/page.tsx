'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PartnerPortalService from '@/services/modules/partner-portal.service'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Search, Users, UserCheck, UserX, DollarSign, Plus, Download, Eye, Edit, Trash2, Brain, Loader2, RefreshCw, Sparkles, AlertTriangle, TrendingUp } from 'lucide-react'
import { usePartnerConfig } from '@/contexts/PartnerContext'
import { Badge } from '@/components/ui/badge'
import { revenueIntelligenceService } from '@/services/advancedAIServices'

const emptyForm = { name: '', email: '', phone: '', enrolledPrograms: '', status: 'active' }

export default function Students() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const { config } = usePartnerConfig()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [students, setStudents] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null)
    const [showViewModal, setShowViewModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [editForm, setEditForm] = useState(emptyForm)
    const [submitting, setSubmitting] = useState(false)
    const [aiChurn, setAiChurn] = useState<any>(null)
    const [aiLoading, setAiLoading] = useState(false)

    const partnerId = user?.id || ''

    const loadAiChurnAnalysis = async () => {
        setAiLoading(true)
        try {
            const result = await revenueIntelligenceService.getChurnRisk(partnerId || 'partner')
            setAiChurn(result?.data || result)
        } catch (err) { console.error('AI churn unavailable:', err) }
        finally { setAiLoading(false) }
    }

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        const loadStudents = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await PartnerPortalService.getPartnerStudents(partnerId, { limit: 50 })
                setStudents(data.students || [])
            } catch (err) {
                console.error('Error loading students:', err)
                setError('Failed to load students')
            } finally {
                setLoading(false)
            }
        }

        if (partnerId) {
            loadStudents()
            loadAiChurnAnalysis()
        }
    }, [isAuthenticated, router, user, partnerId])

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const stats = useMemo(() => {
        const totalStudents = students.length
        const activeStudents = students.filter(s => s.status === 'active').length
        const inactiveStudents = totalStudents - activeStudents
        const totalSpent = students.reduce((sum, s) => sum + (s.totalSpent || 0), 0)
        const avgSpend = totalStudents > 0 ? totalSpent / totalStudents : 0
        return { totalStudents, activeStudents, inactiveStudents, avgSpend }
    }, [students])

    const handleView = (student: any) => {
        setSelectedStudent(student)
        setShowViewModal(true)
    }

    const handleEdit = (student: any) => {
        setSelectedStudent(student)
        setEditForm({
            name: student.name || '',
            email: student.email || '',
            phone: student.phone || '',
            enrolledPrograms: String(student.enrolledPrograms || 0),
            status: student.status || 'active',
        })
        setShowEditModal(true)
    }

    const handleDelete = async (student: any) => {
        if (window.confirm(`Are you sure you want to remove "${student.name}"?`)) {
            try {
                await PartnerPortalService.deletePartnerStudent(partnerId, student.id)
                setStudents(prev => prev.filter(s => s.id !== student.id))
            } catch (err) {
                console.error('Error deleting student:', err)
                alert('Failed to remove student. Please try again.')
            }
        }
    }

    const handleEditSave = async () => {
        if (!editForm.name || !editForm.email) {
            alert('Name and Email are required.')
            return
        }
        try {
            setSubmitting(true)
            const updated = await PartnerPortalService.updatePartnerStudent(partnerId, selectedStudent.id, editForm)
            setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, ...updated } : s))
            setShowEditModal(false)
            setSelectedStudent(null)
        } catch (err) {
            console.error('Error updating student:', err)
            alert('Failed to update student. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleAddStudent = async () => {
        if (!editForm.name || !editForm.email) {
            alert('Name and Email are required.')
            return
        }
        try {
            setSubmitting(true)
            const newStudent = await PartnerPortalService.createPartnerStudent(partnerId, editForm)
            if (newStudent) {
                setStudents(prev => [...prev, newStudent])
            }
            setShowAddModal(false)
            setEditForm(emptyForm)
        } catch (err) {
            console.error('Error creating student:', err)
            alert('Failed to add student. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleExport = () => {
        const headers = ['Name', 'Email', 'Phone', 'Programs', 'Total Spent', 'Status']
        const rows = filteredStudents.map(s => [s.name, s.email, s.phone, s.enrolledPrograms, s.totalSpent, s.status])
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'students_export.csv'
        a.click()
        URL.revokeObjectURL(url)
    }

    if (!isAuthenticated) return null

    const kpiCards = [
        { title: `Total ${config.memberLabel}`, value: stats.totalStudents, icon: Users, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100', change: `${stats.totalStudents} ${config.enrolledLabel.toLowerCase()}` },
        { title: `Active ${config.memberLabel}`, value: stats.activeStudents, icon: UserCheck, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100', change: `${stats.totalStudents > 0 ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0}% active` },
        { title: `Inactive ${config.memberLabel}`, value: stats.inactiveStudents, icon: UserX, gradient: 'from-orange-500 to-orange-600', bgGradient: 'from-orange-50 to-orange-100', change: `${stats.totalStudents > 0 ? Math.round((stats.inactiveStudents / stats.totalStudents) * 100) : 0}% inactive` },
        { title: 'Avg Spend', value: `$${stats.avgSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100', change: `Per ${config.memberLabelLower.slice(0, -1)}` },
    ]

    // Reusable form fields component for Add & Edit modals
    const renderFormFields = (isAdd: boolean) => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={`${config.memberLabelSingular} name`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="student@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                    type="tel"
                    value={editForm.phone}
                    onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enrolled Programs</label>
                <input
                    type="number"
                    min="0"
                    value={editForm.enrolledPrograms}
                    onChange={e => setEditForm(prev => ({ ...prev, enrolledPrograms: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                    value={editForm.status}
                    onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">{config.memberLabelSingular} Management</h1>
                    <div className="flex gap-3">
                        <button
                            onClick={handleExport}
                            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 font-medium"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button
                            onClick={() => {
                                setEditForm(emptyForm)
                                setShowAddModal(true)
                            }}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Add {config.memberLabelSingular}
                        </button>
                    </div>
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

                {/* AI Churn Analysis */}
                <Card className="border-purple-200 mb-6">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Brain className="w-5 h-5 text-purple-600" />
                                <span className="font-semibold text-sm">AI Student Retention Analysis</span>
                                <Badge className="bg-purple-100 text-purple-700 text-xs">AI</Badge>
                            </div>
                            <button onClick={loadAiChurnAnalysis} disabled={aiLoading} className="text-gray-400 hover:text-gray-600">
                                <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        {aiLoading ? (
                            <div className="flex items-center gap-2 py-2">
                                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                <p className="text-xs text-gray-500">Analyzing retention...</p>
                            </div>
                        ) : aiChurn ? (
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                                    <p className="text-xs font-semibold text-red-700 uppercase flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Churn Risk</p>
                                    <p className="text-xl font-bold text-red-900 mt-1">{aiChurn.riskScore || '--'}%</p>
                                    <p className="text-xs text-red-600">{aiChurn.riskLevel || 'unknown'} risk</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                    <p className="text-xs font-semibold text-blue-700 uppercase flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Urgency</p>
                                    <p className="text-sm font-bold text-blue-900 mt-1">{aiChurn.urgency || 'N/A'}</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 sm:col-span-2">
                                    <p className="text-xs font-semibold text-green-700 uppercase flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Retention Actions</p>
                                    <div className="mt-1 space-y-1">
                                        {(aiChurn.retentionActions || []).slice(0, 3).map((action: string, i: number) => (
                                            <p key={i} className="text-xs text-green-800">• {action}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400">AI analysis unavailable. <button onClick={loadAiChurnAnalysis} className="text-purple-600 hover:underline">Retry</button></p>
                        )}
                    </CardContent>
                </Card>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={`Search ${config.memberLabelLower} by name or email...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading {config.memberLabelLower}...</p>
                        </div>
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Name</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Email</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Phone</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Programs</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Total Spent</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-6 text-gray-900 font-medium">{student.name}</td>
                                        <td className="py-3 px-6 text-gray-600">{student.email}</td>
                                        <td className="py-3 px-6 text-gray-600">{student.phone || '-'}</td>
                                        <td className="py-3 px-6 text-gray-600">{student.enrolledPrograms}</td>
                                        <td className="py-3 px-6 text-gray-900 font-medium">${student.totalSpent?.toLocaleString()}</td>
                                        <td className="py-3 px-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleView(student)}
                                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(student)}
                                                    className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(student)}
                                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-gray-500">
                                            No {config.memberLabelLower} found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </div>

            {/* View Modal */}
            {showViewModal && selectedStudent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowViewModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedStudent.name}</h2>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Email</p>
                                    <p className="text-gray-900 font-semibold">{selectedStudent.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Phone</p>
                                    <p className="text-gray-900 font-semibold">{selectedStudent.phone || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Status</p>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedStudent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {selectedStudent.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Enrolled Programs</p>
                                    <p className="text-gray-900 font-semibold">{selectedStudent.enrolledPrograms}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Total Spent</p>
                                    <p className="text-gray-900 font-semibold">${selectedStudent.totalSpent?.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Join Date</p>
                                    <p className="text-gray-900 font-semibold">{selectedStudent.joinDate ? new Date(selectedStudent.joinDate).toLocaleDateString() : '-'}</p>
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
            {showEditModal && selectedStudent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit {config.memberLabelSingular}</h2>
                        {renderFormFields(false)}
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                                Cancel
                            </button>
                            <button onClick={handleEditSave} disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Add Student Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New {config.memberLabelSingular}</h2>
                        {renderFormFields(true)}
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                                Cancel
                            </button>
                            <button onClick={handleAddStudent} disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">
                                {submitting ? 'Adding...' : `Add ${config.memberLabelSingular}`}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
