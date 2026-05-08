'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supportStaffService } from '@/services/supportStaffService'
import { FileText, CheckCircle, Edit3, Star, Plus, Search, AlertCircle, Eye, ThumbsUp, Trash2, RefreshCw } from 'lucide-react'
import { validateRequired, validateTextArea } from '@/utils/validation'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { toast } from 'sonner'

interface Article {
    id: string
    articleId?: string
    _id?: string
    title: string
    content: string
    category: string
    tags?: string[]
    status: 'draft' | 'published' | 'archived'
    featured?: boolean
    views?: number
    helpful?: number
    notHelpful?: number
    createdAt?: string
    updatedAt?: string
}

interface ArticleForm {
    title: string
    content: string
    category: string
    tags: string
    status: 'draft' | 'published' | 'archived'
    featured: boolean
}

const CATEGORIES = ['Account', 'Booking', 'Payment', 'Technical', 'General', 'Membership']
const STATUSES = ['draft', 'published', 'archived'] as const

const emptyForm: ArticleForm = {
    title: '',
    content: '',
    category: '',
    tags: '',
    status: 'draft',
    featured: false,
}

const normalizeArticle = (raw: any): Article => ({
    ...raw,
    id: raw?.articleId || raw?.id || raw?._id || '',
    articleId: raw?.articleId || raw?.id || raw?._id || '',
    title: raw?.title || '',
    content: raw?.content || '',
    category: raw?.category || '',
    tags: Array.isArray(raw?.tags) ? raw.tags : [],
    status: raw?.status || 'draft',
    featured: !!raw?.featured,
    views: raw?.views ?? 0,
    helpful: raw?.helpful ?? 0,
    notHelpful: raw?.notHelpful ?? 0,
})

export default function KnowledgeBase() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [articles, setArticles] = useState<Article[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState<ArticleForm>(emptyForm)
    const [submitting, setSubmitting] = useState(false)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    const validateForm = (): Record<string, string> => {
        const errs: Record<string, string> = {}
        const t = validateRequired(form.title, 'Title'); if (t) errs.title = t
        const c = validateTextArea(form.content, 'Content', 10, 50000); if (c) errs.content = c
        const cat = validateRequired(form.category, 'Category'); if (cat) errs.category = cat
        return errs
    }

    const loadArticles = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const filters: any = {}
            if (searchQuery.trim()) filters.search = searchQuery.trim()
            if (categoryFilter) filters.category = categoryFilter
            if (statusFilter) filters.status = statusFilter
            const data = await supportStaffService.getKnowledgeBaseArticles(filters)
            setArticles((data?.articles || []).map(normalizeArticle))
        } catch (err: any) {
            setArticles([])
            setError(err?.response?.data?.message || 'Failed to load articles')
        } finally {
            setLoading(false)
        }
    }, [searchQuery, categoryFilter, statusFilter])

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return }
        loadArticles()
    }, [isAuthenticated, router, loadArticles])

    const totalArticles = articles.length
    const publishedCount = articles.filter(a => a.status === 'published').length
    const draftCount = articles.filter(a => a.status === 'draft').length
    const featuredCount = articles.filter(a => a.featured).length

    const openCreate = () => {
        setEditingId(null)
        setForm(emptyForm)
        setFormErrors({})
        setDrawerOpen(true)
    }

    const openEdit = (article: Article) => {
        setEditingId(article.articleId || article.id)
        setForm({
            title: article.title || '',
            content: article.content || '',
            category: article.category || '',
            tags: (article.tags || []).join(', '),
            status: article.status as any,
            featured: !!article.featured,
        })
        setFormErrors({})
        setDrawerOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const errs = validateForm()
        setFormErrors(errs)
        if (Object.keys(errs).length > 0) return
        setSubmitting(true)
        try {
            const payload = {
                title: form.title.trim(),
                content: form.content.trim(),
                category: form.category,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
                status: form.status,
                featured: form.featured,
            } as any
            if (editingId) {
                await supportStaffService.updateKnowledgeBaseArticle(editingId, payload)
                toast.success('Article updated')
            } else {
                await supportStaffService.createKnowledgeBaseArticle(payload)
                toast.success('Article created')
            }
            setDrawerOpen(false)
            setForm(emptyForm)
            setEditingId(null)
            await loadArticles()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to save article')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (article: Article) => {
        if (!confirm(`Delete "${article.title}"? This cannot be undone.`)) return
        try {
            const id = article.articleId || article.id
            await supportStaffService.deleteKnowledgeBaseArticle(id)
            toast.success('Article deleted')
            await loadArticles()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to delete article')
        }
    }

    const statusBadge = (status: string) => {
        const cls =
            status === 'published' ? 'bg-green-100 text-green-800' :
            status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
            status === 'archived' ? 'bg-gray-200 text-gray-700' :
            'bg-gray-100 text-gray-600'
        return <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${cls}`}>{status}</span>
    }

    if (!isAuthenticated) return null

    return (
        <div>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Knowledge Base</h1>
                        <p className="text-sm text-gray-500 mt-1">Help articles for customers and team</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={loadArticles}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            id="staff-knowledge-btn-create"
                            onClick={openCreate}
                            className="bg-cyan-600 text-white px-5 py-2 rounded-lg hover:bg-cyan-700 flex items-center gap-2 font-medium text-sm shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> New Article
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                {/* Stats Cards (DYNAMIC from articles list) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Total Articles</p>
                        <p className="text-2xl font-bold text-gray-900">{totalArticles}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Published</p>
                        <p className="text-2xl font-bold text-gray-900">{publishedCount}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <Edit3 className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Draft</p>
                        <p className="text-2xl font-bold text-gray-900">{draftCount}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <Star className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Featured</p>
                        <p className="text-2xl font-bold text-gray-900">{featuredCount}</p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && loadArticles()}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                            />
                        </div>
                        <select
                            id="staff-knowledge-select-cat"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm bg-white min-w-[160px]"
                        >
                            <option value="">All Categories</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select
                            id="staff-knowledge-select-status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm bg-white min-w-[160px] capitalize"
                        >
                            <option value="">All Status</option>
                            {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                        </select>
                        <button
                            onClick={loadArticles}
                            className="px-6 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium text-sm"
                        >Search</button>
                    </div>
                </div>

                {/* Articles Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No articles found</h3>
                        <p className="text-gray-500 mb-6 text-sm">Get started by creating your first article.</p>
                        <button
                            onClick={openCreate}
                            className="bg-cyan-600 text-white px-6 py-2.5 rounded-lg hover:bg-cyan-700 font-medium text-sm inline-flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> New Article
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map((article) => (
                            <div key={article.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all flex flex-col">
                                <div className="flex items-start justify-between mb-3">
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800">
                                        {article.category || 'General'}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        {statusBadge(article.status)}
                                        {article.featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                                    {article.content ? article.content.replace(/<[^>]+>/g, '').substring(0, 150) : 'No content preview'}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {article.views ?? 0} views</span>
                                    <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> {article.helpful ?? 0} helpful</span>
                                </div>
                                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => openEdit(article)}
                                        className="flex-1 px-3 py-2 text-sm font-medium text-cyan-700 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(article)}
                                        className="flex-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
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
                title={editingId ? 'Edit Article' : 'New Article'}
                description={editingId ? 'Update the article details below' : 'Fill in the article details. Required fields are marked.'}
                size="lg"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => { setDrawerOpen(false); setForm(emptyForm); setEditingId(null) }}
                            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                        >Cancel</button>
                        <button
                            type="submit"
                            form="kb-form"
                            disabled={submitting}
                            className="px-5 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 inline-flex items-center gap-2 text-sm font-medium"
                        >
                            {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                            {submitting ? 'Saving…' : (editingId ? 'Save Changes' : 'Create Article')}
                        </button>
                    </div>
                }
            >
                <form id="kb-form" onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => {
                                setForm({ ...form, title: e.target.value })
                                const err = validateRequired(e.target.value, 'Title')
                                setFormErrors(p => { const n = { ...p }; if (err) n.title = err; else delete n.title; return n })
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${formErrors.title ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Article title"
                        />
                        <FormFieldHint hint="Descriptive, search-friendly title" error={formErrors.title} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                            <select
                                value={form.category}
                                onChange={(e) => {
                                    setForm({ ...form, category: e.target.value })
                                    const err = validateRequired(e.target.value, 'Category')
                                    setFormErrors(p => { const n = { ...p }; if (err) n.category = err; else delete n.category; return n })
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${formErrors.category ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">Select category</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <FormFieldHint hint="" error={formErrors.category} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 capitalize"
                            >
                                {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags <span className="text-gray-400 font-normal text-xs">(comma separated)</span></label>
                        <input
                            type="text"
                            value={form.tags}
                            onChange={(e) => setForm({ ...form, tags: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            placeholder="tag1, tag2, tag3"
                        />
                        <FormFieldHint hint="Searchable keywords" />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.featured}
                            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                            className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Featured Article</span>
                        <span className="text-xs text-gray-400">(highlighted to customers)</span>
                    </label>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content <span className="text-red-500">*</span></label>
                        <textarea
                            rows={10}
                            value={form.content}
                            onChange={(e) => {
                                setForm({ ...form, content: e.target.value })
                                const err = validateTextArea(e.target.value, 'Content', 10, 50000)
                                setFormErrors(p => { const n = { ...p }; if (err) n.content = err; else delete n.content; return n })
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-y ${formErrors.content ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Write the article content here…"
                        />
                        <FormFieldHint hint="Minimum 10 characters. Plain text or simple HTML." error={formErrors.content} />
                    </div>
                </form>
            </SlideInDrawer>
        </div>
    )
}
