'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useLocalStorage } from '@/hooks/useClientOnly'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader, Plus, Edit2, Trash2, Users, DollarSign } from 'lucide-react'

interface Program {
    _id: string
    name: string
    type: string
    ageGroup: { min: number; max: number }
    skillLevel: string
    duration: number
    capacity: number
    price: number
    currency: string
    description?: string
    createdAt: string
}

const ProgramsPage = () => {
    const router = useRouter()
    const [programs, setPrograms] = useState<Program[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        type: 'REGULAR_CLASS',
        ageGroup: { min: 5, max: 8 },
        skillLevel: 'BEGINNER',
        duration: 60,
        capacity: 12,
        price: 150,
        currency: 'USD',
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
        loadPrograms()
    }, [])

    const loadPrograms = async () => {
        try {
            setIsLoading(true)
            setError('')
            const mockPrograms: Program[] = [
                {
                    _id: '1',
                    name: 'Beginner Gymnastics',
                    type: 'REGULAR_CLASS',
                    ageGroup: { min: 5, max: 8 },
                    skillLevel: 'BEGINNER',
                    duration: 60,
                    capacity: 12,
                    price: 150,
                    currency: 'USD',
                    description: 'Perfect for beginners',
                    createdAt: '2024-01-01'
                },
                {
                    _id: '2',
                    name: 'Advanced Gymnastics',
                    type: 'REGULAR_CLASS',
                    ageGroup: { min: 9, max: 12 },
                    skillLevel: 'ADVANCED',
                    duration: 90,
                    capacity: 10,
                    price: 200,
                    currency: 'USD',
                    description: 'For advanced students',
                    createdAt: '2024-01-01'
                }
            ]
            setPrograms(mockPrograms)
        } catch (err: any) {
            setError(err.message || 'Failed to load programs')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingId) {
                setPrograms(prev => prev.map(p => p._id === editingId ? { ...p, ...formData } : p))
            } else {
                const newProgram: Program = {
                    _id: Date.now().toString(),
                    ...formData,
                    createdAt: new Date().toISOString()
                }
                setPrograms(prev => [...prev, newProgram])
            }
            resetForm()
        } catch (err: any) {
            setError(err.message || 'Failed to save program')
        }
    }

    const handleEdit = (program: Program) => {
        setFormData({
            name: program.name,
            type: program.type,
            ageGroup: program.ageGroup,
            skillLevel: program.skillLevel,
            duration: program.duration,
            capacity: program.capacity,
            price: program.price,
            currency: program.currency,
            description: program.description || ''
        })
        setEditingId(program._id)
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this program?')) return
        try {
            setPrograms(prev => prev.filter(p => p._id !== id))
        } catch (err: any) {
            setError(err.message || 'Failed to delete program')
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'REGULAR_CLASS',
            ageGroup: { min: 5, max: 8 },
            skillLevel: 'BEGINNER',
            duration: 60,
            capacity: 12,
            price: 150,
            currency: 'USD',
            description: ''
        })
        setEditingId(null)
        setShowForm(false)
    }

    if (isLoading) {
        return (
            <DashboardLayout userRole="admin" userName={userName} userEmail={userEmail}>
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Loading programs...</p>
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
                        <h1 className="text-3xl font-bold text-gray-900">Program Management</h1>
                        <p className="text-gray-600 mt-2">Create and manage programs</p>
                    </div>
                    <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-blue-600 to-purple-600">
                        <Plus className="w-4 h-4 mr-2" />
                        New Program
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
                            {editingId ? 'Edit Program' : 'Create New Program'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Program Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Beginner Gymnastics"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Program Type
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="REGULAR_CLASS">Regular Class</option>
                                        <option value="TRIAL">Trial</option>
                                        <option value="CAMP">Camp</option>
                                        <option value="PRIVATE_LESSON">Private Lesson</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Skill Level
                                    </label>
                                    <select
                                        value={formData.skillLevel}
                                        onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="BEGINNER">Beginner</option>
                                        <option value="INTERMEDIATE">Intermediate</option>
                                        <option value="ADVANCED">Advanced</option>
                                        <option value="ELITE">Elite</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Duration (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Capacity
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Min Age
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.ageGroup.min}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            ageGroup: { ...formData.ageGroup, min: parseInt(e.target.value) }
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Max Age
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.ageGroup.max}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            ageGroup: { ...formData.ageGroup, max: parseInt(e.target.value) }
                                        })}
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
                                    placeholder="Program description..."
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit" className="bg-gradient-to-r from-green-600 to-emerald-600">
                                    {editingId ? 'Update Program' : 'Create Program'}
                                </Button>
                                <Button type="button" onClick={resetForm} variant="outline">
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Programs List */}
                <div className="space-y-4">
                    {programs.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Programs Found</h3>
                                <p className="text-gray-600 mb-4">Create your first program to get started</p>
                                <Button onClick={() => setShowForm(true)}>Create Program</Button>
                            </CardContent>
                        </Card>
                    ) : (
                        programs.map((program, index) => (
                            <motion.div
                                key={program._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{program.name}</h3>
                                                {program.description && (
                                                    <p className="text-sm text-gray-600 mb-3">{program.description}</p>
                                                )}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                    <div className="bg-blue-50 p-2 rounded">
                                                        <p className="text-gray-600">Type</p>
                                                        <p className="font-semibold text-gray-900">{program.type}</p>
                                                    </div>
                                                    <div className="bg-green-50 p-2 rounded">
                                                        <p className="text-gray-600">Age</p>
                                                        <p className="font-semibold text-gray-900">{program.ageGroup.min}-{program.ageGroup.max}</p>
                                                    </div>
                                                    <div className="bg-purple-50 p-2 rounded">
                                                        <p className="text-gray-600">Capacity</p>
                                                        <p className="font-semibold text-gray-900">{program.capacity}</p>
                                                    </div>
                                                    <div className="bg-yellow-50 p-2 rounded">
                                                        <p className="text-gray-600">Price</p>
                                                        <p className="font-semibold text-gray-900">${program.price}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleEdit(program)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-blue-600"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => handleDelete(program._id)}
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

export default ProgramsPage
