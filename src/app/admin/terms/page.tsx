'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useLocalStorage } from '@/hooks/useClientOnly'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader, Plus, Edit2, Trash2, Calendar, CheckCircle, XCircle } from 'lucide-react'

interface Term {
    _id: string
    name: string
    startDate: string
    endDate: string
    status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
    description?: string
    createdAt: string
}

const TermsPage = () => {
    const router = useRouter()
    const [terms, setTerms] = useState<Term[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        status: 'ACTIVE' as const,
        description: ''
    })

    const userName = useLocalStorage('userName', 'Admin User')
    const userEmail = useLocalStorage('userEmail', 'admin@proactivsports.com')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isAuthenticated = localStorage.getItem('isAuthenticated')
            const userRole = localStorage.getItem('userRole')
            if (!isAuthenticated || userRole !== 'admin') {
                router.push('/login')
                return
            }
        }
    }, [router])

    useEffect(() => {
        loadTerms()
    }, [])

    const loadTerms = async () => {
        try {
            setIsLoading(true)
            setError('')
            // Mock data - replace with actual API call
            const mockTerms: Term[] = [
                {
                    _id: '1',
                    name: 'Summer 2024',
                    startDate: '2024-06-01',
                    endDate: '2024-08-31',
                    status: 'ACTIVE',
                    description: 'Summer term for all programs',
                    createdAt: '2024-01-01'
                },
                {
                    _id: '2',
                    name: 'Fall 2024',
                    startDate: '2024-09-01',
                    endDate: '2024-11-30',
                    status: 'INACTIVE',
                    description: 'Fall term for all programs',
                    createdAt: '2024-01-01'
                }
            ]
            setTerms(mockTerms)
        } catch (err: any) {
            setError(err.message || 'Failed to load terms')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingId) {
                // Update term
                setTerms(prev => prev.map(t => t._id === editingId ? { ...t, ...formData } : t))
            } else {
                // Create term
                const newTerm: Term = {
                    _id: Date.now().toString(),
                    ...formData,
                    createdAt: new Date().toISOString()
                }
                setTerms(prev => [...prev, newTerm])
            }
            resetForm()
        } catch (err: any) {
            setError(err.message || 'Failed to save term')
        }
    }

    const handleEdit = (term: Term) => {
        setFormData({
            name: term.name,
            startDate: term.startDate,
            endDate: term.endDate,
            status: term.status,
            description: term.description || ''
        })
        setEditingId(term._id)
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this term?')) return
        try {
            setTerms(prev => prev.filter(t => t._id !== id))
        } catch (err: any) {
            setError(err.message || 'Failed to delete term')
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            startDate: '',
            endDate: '',
            status: 'ACTIVE',
            description: ''
        })
        setEditingId(null)
        setShowForm(false)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-700 border-green-200'
            case 'INACTIVE':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'ARCHIVED':
                return 'bg-gray-100 text-gray-700 border-gray-200'
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    if (isLoading) {
        return (
            <DashboardLayout userRole="admin" userName={userName} userEmail={userEmail}>
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Loading terms...</p>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout userRole="admin" userName={userName} userEmail={userEmail}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Term Management</h1>
                        <p className="text-gray-600 mt-2">Create and manage academic terms</p>
                    </div>
                    <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-blue-600 to-purple-600">
                        <Plus className="w-4 h-4 mr-2" />
                        New Term
                    </Button>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3"
                    >
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                    </motion.div>
                )}

                {/* Form */}
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
                    >
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {editingId ? 'Edit Term' : 'Create New Term'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Term Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Summer 2024"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                        <option value="ARCHIVED">Archived</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Term description..."
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit" className="bg-gradient-to-r from-green-600 to-emerald-600">
                                    {editingId ? 'Update Term' : 'Create Term'}
                                </Button>
                                <Button type="button" onClick={resetForm} variant="outline">
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Terms List */}
                <div className="space-y-4">
                    {terms.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Terms Found</h3>
                                <p className="text-gray-600 mb-4">Create your first term to get started</p>
                                <Button onClick={() => setShowForm(true)}>Create Term</Button>
                            </CardContent>
                        </Card>
                    ) : (
                        terms.map((term, index) => (
                            <motion.div
                                key={term._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">{term.name}</h3>
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(term.status)}`}>
                                                        {term.status}
                                                    </span>
                                                </div>
                                                {term.description && (
                                                    <p className="text-sm text-gray-600 mb-2">{term.description}</p>
                                                )}
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(term.startDate).toLocaleDateString()} - {new Date(term.endDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleEdit(term)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-blue-600"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => handleDelete(term._id)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}

export default TermsPage
