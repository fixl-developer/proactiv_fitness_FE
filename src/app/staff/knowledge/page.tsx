'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supportStaffService } from '@/services/supportStaffService'
import { FileText, CheckCircle, Edit3, Star, Plus, Search, AlertCircle, Eye, ThumbsUp, Trash2, X } from 'lucide-react'
import { validateRequired, validateTextArea, FORMAT_HINTS } from '@/utils/validation'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import { toast } from 'sonner'

interface Article {
    id: string
    _id?: string
    title: string
    content: string
    category: string
    tags?: string[]
    status: 'draft' | 'published' | 'archived'
    featured?: boolean
    views?: number
    helpful?: number
    createdAt?: string
    updatedAt?: string
}

interface ArticleForm {
    title: string
    content: string
    category: string
    tags: string
    status: 'draft' | 'published'
    featured: boolean
}

const emptyForm: ArticleForm = {
    title: '',
    content: '',
    category: '',
    tags: '',
    status: 'draft',
    featured: false,
}

export default function KnowledgeBase() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [articles, setArticles] = useState<Article[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingArticle, setEditingArticle] = useState<Article | null>(null)
    const [formData, setFormData] = useState<ArticleForm>(emptyForm)
    const [submitting, setSubmitting] = useState(false)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    const validateArticleForm = (): boolean => {
        const newErrors: Record<string, string> = {}
        const titleErr = validateRequired(formData.title, 'Title')
        if (titleErr) newErrors.title = titleErr
        const contentErr = validateTextArea(formData.content, 'Content', 10, 50000)
        if (contentErr) newErrors.content = contentErr
        const catErr = validateRequired(formData.category, 'Category')
        if (catErr) newErrors.category = catErr
        setFormErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const loadArticles = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const filters: any = {}
            if (searchQuery.trim()) filters.search = searchQuery.trim()
            if (categoryFilter) filters.category = categoryFilter
            const data = await supportStaffService.getKnowledgeBaseArticles(filters)
            setArticles(data?.articles || [])
        } catch {
            setArticles([])
            setError('Failed to load articles.')
        } finally {
            setLoading(false)
        }
    }, [searchQuery, categoryFilter])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadArticles()
    }, [isAuthenticated, router, loadArticles])

    // Stats
    const totalArticles = articles.length
    const publishedCount = articles.filter(a => a.status === 'published').length
    const draftCount = articles.filter(a => a.status === 'draft').length
    const featuredCount = articles.filter(a => a.featured).length

    // Categories for filter dropdown
    const categories = Array.from(new Set(articles.map(a => a.category).filter(Boolean)))

    // Handlers
    const openCreateModal = () => {
        setFormData(emptyForm)
        setShowCreateModal(true)
    }

    const openEditModal = (article: Article) => {
        setEditingArticle(article)
        setFormData({
            title: article.title || '',
            content: article.content || '',
            category: article.category || '',
            tags: (article.tags || []).join(', '),
            status: article.status === 'archived' ? 'draft' : article.status,
            featured: article.featured || false,
        })
        setShowEditModal(true)
    }

    const closeModals = () => {
        setShowCreateModal(false)
        setShowEditModal(false)
        setEditingArticle(null)
        setFormData(emptyForm)
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateArticleForm()) return
        setSubmitting(true)
        try {
            await supportStaffService.createKnowledgeBaseArticle({
                title: formData.title,
                content: formData.content,
                category: formData.category,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                status: formData.status,
                featured: formData.featured,
            } as any)
            closeModals()
            toast.success('Article created successfully')
            await loadArticles()
        } catch {
            toast.error('Failed to create article.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingArticle) return
        if (!validateArticleForm()) return
        setSubmitting(true)
        try {
            const articleId = editingArticle._id || editingArticle.id
            await supportStaffService.updateKnowledgeBaseArticle(articleId, {
                title: formData.title,
                content: formData.content,
                category: formData.category,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                status: formData.status,
                featured: formData.featured,
            } as any)
            closeModals()
            toast.success('Article updated successfully')
            await loadArticles()
        } catch {
            toast.error('Failed to update article.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (article: Article) => {
        if (!confirm(`Are you sure you want to delete "${article.title}"?`)) return
        try {
            const articleId = article._id || article.id
            await supportStaffService.deleteKnowledgeBaseArticle(articleId)
            toast.success('Article deleted successfully')
            await loadArticles()
        } catch {
            toast.error('Failed to delete article.')
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Published</span>
            case 'draft':
                return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Draft</span>
            case 'archived':
                return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Archived</span>
            default:
                return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{status}</span>
        }
    }

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Knowledge Base</h1>
                    <button
                        onClick={openCreateModal}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        New Article
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <p className="text-red-800">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    <div className="rounded-xl border-0 bg-gradient-to-br from-blue-50 to-blue-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Total Articles</p>
                        <p className="text-2xl font-bold text-gray-900">{totalArticles}</p>
                    </div>

                    <div className="rounded-xl border-0 bg-gradient-to-br from-green-50 to-green-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-lg shadow-md">
                                <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Published</p>
                        <p className="text-2xl font-bold text-gray-900">{publishedCount}</p>
                    </div>

                    <div className="rounded-xl border-0 bg-gradient-to-br from-orange-50 to-orange-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-lg shadow-md">
                                <Edit3 className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Draft</p>
                        <p className="text-2xl font-bold text-gray-900">{draftCount}</p>
                    </div>

                    <div className="rounded-xl border-0 bg-gradient-to-br from-purple-50 to-purple-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg shadow-md">
                                <Star className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Featured</p>
                        <p className="text-2xl font-bold text-gray-900">{featuredCount}</p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && loadArticles()}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[180px]"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <button
                        onClick={loadArticles}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                        Search
                    </button>
                </div>

                {/* Articles Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading articles...</p>
                        </div>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-16">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No articles found</h3>
                        <p className="text-gray-500 mb-6">Get started by creating your first knowledge base article.</p>
                        <button
                            onClick={openCreateModal}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium transition-colors inline-flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            New Article
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map((article) => (
                            <div key={article._id || article.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200 flex flex-col">
                                <div className="flex items-start justify-between mb-3">
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                        {article.category}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        {getStatusBadge(article.status)}
                                        {article.featured && (
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>

                                <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                                    {article.content ? article.content.substring(0, 150) + (article.content.length > 150 ? '...' : '') : 'No content preview available.'}
                                </p>

                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-4 h-4" />
                                        {article.views ?? 0} views
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <ThumbsUp className="w-4 h-4" />
                                        {article.helpful ?? 0}% helpful
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => openEditModal(article)}
                                        className="flex-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(article)}
                                        className="flex-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Article Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModals}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">New Article</h2>
                            <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => {
                                        setFormData({ ...formData, title: e.target.value })
                                        const err = validateRequired(e.target.value, 'Title')
                                        setFormErrors(prev => { const n = { ...prev }; if (err) n.title = err; else delete n.title; return n })
                                    }}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.title ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Article title"
                                />
                                <FormFieldHint hint="Enter a descriptive title" error={formErrors.title} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Content</label>
                                <textarea
                                    required
                                    rows={8}
                                    value={formData.content}
                                    onChange={(e) => {
                                        setFormData({ ...formData, content: e.target.value })
                                        const err = validateTextArea(e.target.value, 'Content', 10, 50000)
                                        setFormErrors(prev => { const n = { ...prev }; if (err) n.content = err; else delete n.content; return n })
                                    }}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y ${formErrors.content ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Write your article content here..."
                                />
                                <FormFieldHint hint="Minimum 10 characters" error={formErrors.content} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. Getting Started"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="tag1, tag2, tag3"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                    </select>
                                </div>
                                <div className="flex items-end pb-1">
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.featured}
                                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Featured Article</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={closeModals}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Creating...' : 'Create Article'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Article Modal */}
            {showEditModal && editingArticle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModals}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Edit Article</h2>
                            <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => {
                                        setFormData({ ...formData, title: e.target.value })
                                        const err = validateRequired(e.target.value, 'Title')
                                        setFormErrors(prev => { const n = { ...prev }; if (err) n.title = err; else delete n.title; return n })
                                    }}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.title ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Article title"
                                />
                                <FormFieldHint hint="Enter a descriptive title" error={formErrors.title} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Content</label>
                                <textarea
                                    required
                                    rows={8}
                                    value={formData.content}
                                    onChange={(e) => {
                                        setFormData({ ...formData, content: e.target.value })
                                        const err = validateTextArea(e.target.value, 'Content', 10, 50000)
                                        setFormErrors(prev => { const n = { ...prev }; if (err) n.content = err; else delete n.content; return n })
                                    }}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y ${formErrors.content ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Write your article content here..."
                                />
                                <FormFieldHint hint="Minimum 10 characters" error={formErrors.content} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. Getting Started"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="tag1, tag2, tag3"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                    </select>
                                </div>
                                <div className="flex items-end pb-1">
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.featured}
                                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Featured Article</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={closeModals}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
