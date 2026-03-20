'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Mail,
    Search,
    Plus,
    Copy,
    Edit,
    MessageSquare,
    Bell,
    FileText,
    Clock,
    X,
    Trash2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

interface Template {
    _id: string
    name: string
    type: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP'
    category: string
    subject: string
    body: string
    variables: string[]
    status: 'published' | 'draft'
    usageCount: number
    createdAt: string
    updatedAt: string
}

interface Stats {
    total: number
    byType: { EMAIL: number; SMS: number; PUSH: number; IN_APP: number }
    byStatus: { published: number; draft: number }
}

function getTypeColor(type: string): string {
    const map: Record<string, string> = {
        EMAIL: 'bg-blue-100 text-blue-700',
        SMS: 'bg-orange-100 text-orange-700',
        PUSH: 'bg-purple-100 text-purple-700',
        IN_APP: 'bg-teal-100 text-teal-700',
    }
    return map[type] || 'bg-gray-100 text-gray-700'
}

function getCatColor(category: string): string {
    const map: Record<string, string> = {
        Booking: 'bg-emerald-100 text-emerald-700',
        Payment: 'bg-violet-100 text-violet-700',
        Reminder: 'bg-amber-100 text-amber-700',
        Marketing: 'bg-pink-100 text-pink-700',
        General: 'bg-gray-100 text-gray-700',
    }
    return map[category] || 'bg-gray-100 text-gray-700'
}

function formatDate(dateStr: string): string {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatUsageCount(count: number): string {
    if (count === 0) return 'Not used yet'
    if (count >= 1000) return `Used ${(count / 1000).toFixed(1)}K times`
    return `Used ${count} times`
}

export default function TemplatesPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [templates, setTemplates] = useState<Template[]>([])
    const [stats, setStats] = useState<Stats>({
        total: 0,
        byType: { EMAIL: 0, SMS: 0, PUSH: 0, IN_APP: 0 },
        byStatus: { published: 0, draft: 0 },
    })
    const [searchQuery, setSearchQuery] = useState('')
    const [filterCategory, setFilterCategory] = useState<string>('All')
    const [filterType, setFilterType] = useState<string>('All')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
    const [form, setForm] = useState({
        name: '',
        type: 'EMAIL',
        category: 'General',
        subject: '',
        body: '',
        status: 'draft' as 'published' | 'draft',
    })
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    const fetchStats = useCallback(async () => {
        try {
            const data: any = await apiClient.get('/notification-templates/stats')
            const raw = data?.data ?? data
            setStats({
                total: raw?.total ?? 0,
                byType: raw?.byType ?? { EMAIL: 0, SMS: 0, PUSH: 0, IN_APP: 0 },
                byStatus: raw?.byStatus ?? { published: 0, draft: 0 },
            })
        } catch {
            // Stats fetch failed - keep defaults
        }
    }, [])

    const fetchTemplates = useCallback(async () => {
        try {
            setIsLoading(true)
            const params = new URLSearchParams()
            if (searchQuery) params.set('search', searchQuery)
            if (filterType !== 'All') params.set('type', filterType)
            if (filterCategory !== 'All') params.set('category', filterCategory)

            const url = `/notification-templates${params.toString() ? `?${params.toString()}` : ''}`
            const data: any = await apiClient.get(url)
            const raw = data?.data ?? data
            const list: Template[] = Array.isArray(raw)
                ? raw
                : raw?.templates ?? raw?.data ?? []
            setTemplates(list)
        } catch {
            toast.error('Failed to load templates')
            setTemplates([])
        } finally {
            setIsLoading(false)
        }
    }, [searchQuery, filterType, filterCategory])

    useEffect(() => {
        fetchTemplates()
        fetchStats()
    }, [fetchTemplates, fetchStats])

    const handleCreate = async () => {
        if (!form.name.trim()) {
            toast.error('Template name is required')
            return
        }
        if (!form.body.trim()) {
            toast.error('Template body is required')
            return
        }
        try {
            await apiClient.post('/notification-templates', {
                name: form.name,
                type: form.type,
                category: form.category,
                subject: form.subject,
                body: form.body,
                status: form.status,
            })
            toast.success('Template created successfully')
            setShowCreateModal(false)
            setForm({ name: '', type: 'EMAIL', category: 'General', subject: '', body: '', status: 'draft' })
            fetchTemplates()
            fetchStats()
        } catch {
            toast.error('Failed to create template')
        }
    }

    const handleEdit = async () => {
        if (!editingTemplate || !form.name.trim()) {
            toast.error('Template name is required')
            return
        }
        try {
            await apiClient.put(`/notification-templates/${editingTemplate._id}`, {
                name: form.name,
                type: form.type,
                category: form.category,
                subject: form.subject,
                body: form.body,
                status: form.status,
            })
            toast.success('Template updated successfully')
            setEditingTemplate(null)
            setForm({ name: '', type: 'EMAIL', category: 'General', subject: '', body: '', status: 'draft' })
            fetchTemplates()
            fetchStats()
        } catch {
            toast.error('Failed to update template')
        }
    }

    const handleDuplicate = async (template: Template) => {
        try {
            await apiClient.post(`/notification-templates/${template._id}/duplicate`)
            toast.success('Template duplicated')
            fetchTemplates()
            fetchStats()
        } catch {
            toast.error('Failed to duplicate template')
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await apiClient.delete(`/notification-templates/${id}`)
            toast.success('Template deleted')
            setDeleteConfirm(null)
            fetchTemplates()
            fetchStats()
        } catch {
            toast.error('Failed to delete template')
        }
    }

    const handleToggleStatus = async (template: Template) => {
        const newStatus = template.status === 'published' ? 'draft' : 'published'
        try {
            await apiClient.put(`/notification-templates/${template._id}`, { status: newStatus })
            toast.success(`Template ${newStatus === 'published' ? 'published' : 'moved to draft'}`)
            fetchTemplates()
            fetchStats()
        } catch {
            toast.error('Failed to update status')
        }
    }

    const startEdit = (t: Template) => {
        setEditingTemplate(t)
        setForm({
            name: t.name,
            type: t.type,
            category: t.category,
            subject: t.subject,
            body: t.body,
            status: t.status,
        })
    }

    const categories = ['All', ...new Set(templates.map((t) => t.category).filter(Boolean))]

    const statCards = [
        {
            label: 'Total Templates',
            value: stats.total,
            icon: FileText,
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100',
        },
        {
            label: 'Email',
            value: stats.byType.EMAIL,
            icon: Mail,
            gradient: 'from-green-500 to-emerald-600',
            bgGradient: 'from-green-50 to-emerald-100',
        },
        {
            label: 'SMS',
            value: stats.byType.SMS,
            icon: MessageSquare,
            gradient: 'from-orange-500 to-orange-600',
            bgGradient: 'from-orange-50 to-orange-100',
        },
        {
            label: 'Push',
            value: stats.byType.PUSH,
            icon: Bell,
            gradient: 'from-purple-500 to-purple-600',
            bgGradient: 'from-purple-50 to-purple-100',
        },
    ]

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-28 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-56 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const TemplateFormModal = ({
        title,
        onSubmit,
        onClose,
    }: {
        title: string
        onSubmit: () => void
        onClose: () => void
    }) => (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-blue-200 shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{title}</CardTitle>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                Name
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                placeholder="Template name"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                Type
                            </label>
                            <select
                                value={form.type}
                                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                            >
                                <option value="EMAIL">Email</option>
                                <option value="SMS">SMS</option>
                                <option value="PUSH">Push</option>
                                <option value="IN_APP">In-App</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                Category
                            </label>
                            <select
                                value={form.category}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, category: e.target.value }))
                                }
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                            >
                                <option value="General">General</option>
                                <option value="Booking">Booking</option>
                                <option value="Payment">Payment</option>
                                <option value="Reminder">Reminder</option>
                                <option value="Marketing">Marketing</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                Status
                            </label>
                            <select
                                value={form.status}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        status: e.target.value as 'published' | 'draft',
                                    }))
                                }
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Subject
                        </label>
                        <input
                            type="text"
                            value={form.subject}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, subject: e.target.value }))
                            }
                            placeholder="Template subject line"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Body
                        </label>
                        <textarea
                            value={form.body}
                            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                            placeholder="Write template content... Use {name}, {class}, {date} for variables"
                            rows={5}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none resize-none"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={onSubmit}
                        >
                            Save Template
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Email & Notification Templates
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Create and manage communication templates for all channels
                    </p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                >
                    <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                            setForm({
                                name: '',
                                type: 'EMAIL',
                                category: 'General',
                                subject: '',
                                body: '',
                                status: 'draft',
                            })
                            setShowCreateModal(true)
                        }}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Template
                    </Button>
                </motion.div>
            </div>

            {/* Create / Edit Modals */}
            {showCreateModal && (
                <TemplateFormModal
                    title="Create New Template"
                    onSubmit={handleCreate}
                    onClose={() => setShowCreateModal(false)}
                />
            )}
            {editingTemplate && (
                <TemplateFormModal
                    title={`Edit: ${editingTemplate.name}`}
                    onSubmit={handleEdit}
                    onClose={() => setEditingTemplate(null)}
                />
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div
                            className={`rounded-lg border-0 bg-gradient-to-br ${stat.bgGradient} p-4 hover:shadow-lg transition-all`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div
                                    className={`bg-gradient-to-br ${stat.gradient} p-2.5 rounded-lg shadow-md`}
                                >
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 font-medium mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search templates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {['All', 'EMAIL', 'SMS', 'PUSH', 'IN_APP'].map((t) => (
                                <Button
                                    key={t}
                                    variant={filterType === t ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilterType(t)}
                                >
                                    {t === 'All' ? 'All Types' : t}
                                </Button>
                            ))}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {categories.map((c) => (
                                <Button
                                    key={c}
                                    variant={filterCategory === c ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilterCategory(c)}
                                >
                                    {c}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Template Grid */}
            {templates.length === 0 ? (
                <div className="text-center py-16">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-1">No templates found</h3>
                    <p className="text-sm text-gray-400">
                        Create your first template to get started
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <AnimatePresence>
                        {templates.map((template, i) => (
                            <motion.div
                                key={template._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.08 }}
                            >
                                <Card className="hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <Badge className={getTypeColor(template.type)}>
                                                        {template.type}
                                                    </Badge>
                                                    <Badge
                                                        className={getCatColor(template.category)}
                                                    >
                                                        {template.category}
                                                    </Badge>
                                                    <Badge
                                                        className={
                                                            template.status === 'published'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-gray-100 text-gray-600'
                                                        }
                                                    >
                                                        {template.status === 'published'
                                                            ? 'Published'
                                                            : 'Draft'}
                                                    </Badge>
                                                </div>
                                                <CardTitle className="text-lg">
                                                    {template.name}
                                                </CardTitle>
                                                {template.subject && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Subject: {template.subject}
                                                    </p>
                                                )}
                                            </div>
                                            {deleteConfirm === template._id ? (
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 text-xs px-2"
                                                        onClick={() =>
                                                            handleDelete(template._id)
                                                        }
                                                    >
                                                        Yes
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-gray-500 text-xs px-2"
                                                        onClick={() => setDeleteConfirm(null)}
                                                    >
                                                        No
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        setDeleteConfirm(template._id)
                                                    }
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col justify-between">
                                        <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
                                            <p className="text-sm text-gray-600 line-clamp-3 italic">
                                                &ldquo;
                                                {template.body.length > 150
                                                    ? template.body.slice(0, 150) + '...'
                                                    : template.body}
                                                &rdquo;
                                            </p>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>
                                                        {formatDate(template.updatedAt)}
                                                    </span>
                                                </div>
                                                <span className="font-medium">
                                                    {formatUsageCount(template.usageCount)}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => startEdit(template)}
                                                >
                                                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => handleDuplicate(template)}
                                                >
                                                    <Copy className="w-3.5 h-3.5 mr-1" /> Duplicate
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => handleToggleStatus(template)}
                                                >
                                                    {template.status === 'published'
                                                        ? 'Unpublish'
                                                        : 'Publish'}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}
