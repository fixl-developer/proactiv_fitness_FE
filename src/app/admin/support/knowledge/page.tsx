'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { KnowledgeBaseService } from '@/services/supportService'
import { getErrorMessage } from '@/utils/apiErrorHandler'
import { extractList, extractPagination } from '@/utils/apiResponse'

type ArticleCategory = 'faq' | 'guide' | 'troubleshooting' | 'tutorial'
type ArticleStatus = 'published' | 'draft' | 'archived'

interface KnowledgeBaseArticle {
    id: string
    title: string
    category: ArticleCategory
    content: string
    tags?: string[]
    status?: ArticleStatus
    views?: number
    createdAt?: string
}

export default function KnowledgeBasePage() {
    const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [submitting, setSubmitting] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    const [formData, setFormData] = useState<{
        title: string
        category: KnowledgeBaseArticle['category']
        content: string
        tags: string
        isPublished: boolean
    }>({
        title: '',
        category: 'faq',
        content: '',
        tags: '',
        isPublished: true,
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    // Category colors
    const categoryColors: Record<string, string> = {
        faq: 'bg-blue-100 text-blue-800',
        guide: 'bg-green-100 text-green-800',
        troubleshooting: 'bg-orange-100 text-orange-800',
        tutorial: 'bg-purple-100 text-purple-800',
    }

    // Load articles
    const loadArticles = async () => {
        try {
            setLoading(true)
            // status='all' tells the backend to skip its default "published only" filter,
            // so admins see drafts they just created.
            const response = await KnowledgeBaseService.getAll({
                page: currentPage,
                limit: 10,
                search: searchTerm,
                status: 'all',
            })
            const list = extractList<any>(response).map((a: any) => ({
                ...a,
                id: a.id || a._id,
            }))
            setArticles(list)
            setTotalPages(extractPagination(response).totalPages)
        } catch (error) {
            console.error('Error loading articles:', error)
            toast.error('Failed to load knowledge base articles')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadArticles()
    }, [currentPage, searchTerm])

    // Validate form (per-field rules)
    const validateFormData = () => {
        const newErrors: Record<string, string> = {}

        const title = formData.title.trim()
        if (!title) newErrors.title = 'Title is required'
        else if (title.length < 3) newErrors.title = 'Title must be at least 3 characters'
        else if (title.length > 200) newErrors.title = 'Title must be under 200 characters'

        const validCategories: ArticleCategory[] = ['faq', 'guide', 'troubleshooting', 'tutorial']
        if (!validCategories.includes(formData.category)) newErrors.category = 'Select a valid category'

        const content = formData.content.trim()
        if (!content) newErrors.content = 'Content is required'
        else if (content.length < 20) newErrors.content = 'Content must be at least 20 characters'
        else if (content.length > 20000) newErrors.content = 'Content is too long'

        // Tags optional, but each tag must be a sane slug-ish word (letters, spaces, hyphens, underscores only)
        if (formData.tags.trim()) {
            const tagList = formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
            const bad = tagList.find((t) => !/^[A-Za-z][A-Za-z _-]{0,29}$/.test(t))
            if (bad) newErrors.tags = `Invalid tag: "${bad}". Use letters/spaces/hyphens only (max 30 chars).`
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateFormData()) {
            toast.error('Please fix the highlighted fields')
            return
        }

        try {
            setSubmitting(true)

            // Backend stores status (published|draft|archived); the toggle maps to that.
            const submitData = {
                title: formData.title.trim(),
                category: formData.category,
                content: formData.content.trim(),
                tags: formData.tags
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter((tag) => tag),
                status: formData.isPublished ? 'published' : 'draft',
            }

            if (editingId) {
                await KnowledgeBaseService.update(editingId, submitData as any)
                toast.success('Article updated successfully')
            } else {
                await KnowledgeBaseService.create(submitData as any)
                toast.success('Article created successfully')
            }

            setShowForm(false)
            resetForm()
            loadArticles()
        } catch (error) {
            console.error('Error saving article:', error)
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    // Handle edit
    const handleEdit = (article: KnowledgeBaseArticle) => {
        setFormData({
            title: article.title,
            category: article.category,
            content: article.content,
            tags: article.tags?.join(', ') || '',
            isPublished: article.status ? article.status === 'published' : true,
        })
        setEditingId(article.id)
        setShowForm(true)
    }

    // Handle delete
    const handleDelete = async (id: string) => {
        try {
            await KnowledgeBaseService.delete(id)
            toast.success('Article deleted successfully')
            setDeleteConfirm(null)
            loadArticles()
        } catch (error) {
            console.error('Error deleting article:', error)
            toast.error(getErrorMessage(error))
        }
    }

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            category: 'faq',
            content: '',
            tags: '',
            isPublished: true,
        })
        setErrors({})
        setEditingId(null)
    }

    // Handle close drawer
    const handleCloseDrawer = () => {
        setShowForm(false)
        resetForm()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="w-8 h-8 text-blue-600" />
                        <h1 className="text-4xl font-bold text-slate-900">Knowledge Base</h1>
                    </div>
                    <p className="text-slate-600">Manage help articles, guides, FAQs, and tutorials</p>
                </motion.div>

                {/* Controls */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex gap-4 items-center"
                >
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={() => {
                            resetForm()
                            setShowForm(true)
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Create Article
                    </button>
                </motion.div>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-slate-600">Loading articles...</p>
                        </div>
                    ) : articles.length === 0 ? (
                        <div className="p-8 text-center">
                            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600">No articles found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Title</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Category</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Views</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Created</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {articles.map((article) => (
                                            <tr key={article.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                    {article.title}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[article.category]}`}>
                                                        {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium ${article.status === 'published'
                                                            ? 'bg-green-100 text-green-800'
                                                            : article.status === 'archived'
                                                                ? 'bg-slate-200 text-slate-700'
                                                                : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                    >
                                                        {article.status
                                                            ? article.status.charAt(0).toUpperCase() + article.status.slice(1)
                                                            : 'Draft'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {article.views || 0}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(article)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(article.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                                <p className="text-sm text-slate-600">
                                    Page {currentPage} of {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50 transition"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50 transition"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>

                {/* Form Drawer */}
                <SlideInDrawer
                    isOpen={showForm}
                    onClose={handleCloseDrawer}
                    title={editingId ? 'Edit Article' : 'Create New Article'}
                    size="lg"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => {
                                    // Strip any digits from title field
                                    const cleaned = e.target.value.replace(/[0-9]/g, '')
                                    setFormData({ ...formData, title: cleaned })
                                    if (errors.title) setErrors({ ...errors, title: '' })
                                }}
                                placeholder="e.g., How to book a class"
                                maxLength={200}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.title
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-slate-300 focus:ring-blue-500'
                                    }`}
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        category: e.target.value as ArticleCategory,
                                    })
                                    if (errors.category) setErrors({ ...errors, category: '' })
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.category
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-slate-300 focus:ring-blue-500'
                                    }`}
                            >
                                <option value="faq">FAQ</option>
                                <option value="guide">Guide</option>
                                <option value="troubleshooting">Troubleshooting</option>
                                <option value="tutorial">Tutorial</option>
                            </select>
                            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Content <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => {
                                    // Strip any digits from content field
                                    const cleaned = e.target.value.replace(/[0-9]/g, '')
                                    setFormData({ ...formData, content: cleaned })
                                    if (errors.content) setErrors({ ...errors, content: '' })
                                }}
                                placeholder="Write the article content here..."
                                rows={6}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.content
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-slate-300 focus:ring-blue-500'
                                    }`}
                            />
                            {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
                            <p className="mt-1 text-xs text-slate-500">Minimum 20 characters required</p>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Tags
                            </label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => {
                                    // Strip any digits from tags field
                                    const cleaned = e.target.value.replace(/[0-9]/g, '')
                                    setFormData({ ...formData, tags: cleaned })
                                    if (errors.tags) setErrors({ ...errors, tags: '' })
                                }}
                                placeholder="e.g., booking, class, schedule (comma-separated)"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.tags
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-slate-300 focus:ring-blue-500'
                                    }`}
                            />
                            {errors.tags && <p className="mt-1 text-sm text-red-600">{errors.tags}</p>}
                            <p className="mt-1 text-xs text-slate-500">Separate tags with commas</p>
                        </div>

                        {/* Published Status */}
                        <div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPublished}
                                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                        className="sr-only"
                                    />
                                    <div
                                        className={`w-11 h-6 rounded-full transition-colors ${formData.isPublished ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}
                                    >
                                        <div
                                            className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform mt-0.5 ${formData.isPublished
                                                ? 'translate-x-5.5 ml-[22px]'
                                                : 'translate-x-0.5 ml-0.5'
                                                }`}
                                        />
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-slate-900">Published</span>
                            </label>
                            <p className="mt-1 text-xs text-slate-500">
                                Draft articles are not visible to users
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-3 pt-6 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={handleCloseDrawer}
                                className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                            >
                                {submitting ? 'Saving...' : editingId ? 'Update Article' : 'Create Article'}
                            </button>
                        </div>
                    </form>
                </SlideInDrawer>

                {/* Delete Confirmation */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-lg p-6 max-w-sm"
                        >
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Article?</h3>
                            <p className="text-slate-600 mb-6">
                                This action cannot be undone. The article will be permanently deleted from the knowledge base.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    )
}
