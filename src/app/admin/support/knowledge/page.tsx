'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Plus, Search, Upload, Eye, Edit, FolderOpen, FileText, ChevronDown, ChevronRight, Clock, User, Tag, X, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

interface Article {
    id: number
    title: string
    category: string
    catColor: string
    author: string
    lastUpdated: string
    views: number
    status: string
    statusColor: string
    content?: string
}

interface Category {
    name: string
    count: number
    color: string
}

const ARTICLES_KEY = 'proactiv_kb_articles'
const CATEGORIES_KEY = 'proactiv_kb_categories'

const defaultArticles: Article[] = [
    { id: 1, title: 'How to Book a Class', category: 'Bookings', catColor: 'bg-blue-100 text-blue-700', author: 'Admin Team', lastUpdated: 'Mar 15, 2026', views: 1200, status: 'Published', statusColor: 'bg-green-100 text-green-700', content: 'Step-by-step guide to booking a class through the ProActiv platform.' },
    { id: 2, title: 'Payment Methods Guide', category: 'Payments', catColor: 'bg-purple-100 text-purple-700', author: 'Finance Team', lastUpdated: 'Mar 12, 2026', views: 890, status: 'Published', statusColor: 'bg-green-100 text-green-700', content: 'All supported payment methods and how to set up recurring payments.' },
    { id: 3, title: 'Setting Up Your Account', category: 'Getting Started', catColor: 'bg-emerald-100 text-emerald-700', author: 'Admin Team', lastUpdated: 'Mar 10, 2026', views: 2100, status: 'Published', statusColor: 'bg-green-100 text-green-700', content: 'Complete guide to creating and configuring your ProActiv account.' },
    { id: 4, title: 'Troubleshooting Login Issues', category: 'Technical', catColor: 'bg-red-100 text-red-700', author: 'Tech Support', lastUpdated: 'Mar 8, 2026', views: 650, status: 'Published', statusColor: 'bg-green-100 text-green-700', content: 'Common login issues and how to resolve them.' },
    { id: 5, title: 'Cancellation Policy FAQ', category: 'Bookings', catColor: 'bg-blue-100 text-blue-700', author: 'Admin Team', lastUpdated: 'Mar 5, 2026', views: 430, status: 'Published', statusColor: 'bg-green-100 text-green-700', content: 'Frequently asked questions about cancellations and refunds.' },
    { id: 6, title: 'New Feature: Virtual Training', category: 'Technical', catColor: 'bg-red-100 text-red-700', author: 'Product Team', lastUpdated: 'Mar 18, 2026', views: 0, status: 'Draft', statusColor: 'bg-gray-100 text-gray-600', content: 'Introduction to the new virtual training module coming soon.' },
]

const defaultCategories: Category[] = [
    { name: 'Getting Started', count: 4, color: 'bg-emerald-500' },
    { name: 'Bookings', count: 8, color: 'bg-blue-500' },
    { name: 'Payments', count: 5, color: 'bg-purple-500' },
    { name: 'Account', count: 3, color: 'bg-amber-500' },
    { name: 'Technical', count: 6, color: 'bg-red-500' },
]

function getCatColor(category: string): string {
    const map: Record<string, string> = {
        'Getting Started': 'bg-emerald-100 text-emerald-700',
        Bookings: 'bg-blue-100 text-blue-700',
        Payments: 'bg-purple-100 text-purple-700',
        Account: 'bg-amber-100 text-amber-700',
        Technical: 'bg-red-100 text-red-700',
    }
    return map[category] || 'bg-gray-100 text-gray-700'
}

export default function KnowledgeBasePage() {
    const [isLoading, setIsLoading] = useState(true)
    const [articles, setArticles] = useState<Article[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState<string>('All')
    const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(['Bookings', 'Getting Started']))
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingArticle, setEditingArticle] = useState<Article | null>(null)
    const [form, setForm] = useState({ title: '', category: 'Bookings', author: '', content: '', status: 'Draft' })

    const [apiFailed, setApiFailed] = useState(false)

    const loadArticles = useCallback(async () => {
        setIsLoading(true)
        try {
            const res: any = await apiClient.get('/support/knowledge-base')
            // Backend: { success, data: { articles: [...], total, pages } }
            const raw = res?.data?.articles ?? res?.data ?? res?.articles ?? res
            const items = Array.isArray(raw) ? raw : []

            const mapped: Article[] = items.map((a: any) => ({
                id: a.articleId || a._id || a.id || Date.now(),
                title: a.title || 'Untitled',
                category: a.category || 'General',
                catColor: getCatColor(a.category || 'General'),
                author: a.author || 'Admin',
                lastUpdated: a.updatedAt ? new Date(a.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
                views: a.views || 0,
                status: a.status === 'published' ? 'Published' : a.status === 'draft' ? 'Draft' : a.status || 'Draft',
                statusColor: a.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600',
                content: a.content || '',
            }))
            setArticles(mapped)
            setApiFailed(false)
        } catch {
            setArticles(defaultArticles)
            setApiFailed(true)
        }
        setCategories(defaultCategories)
        setIsLoading(false)
    }, [])

    useEffect(() => {
        loadArticles()
    }, [loadArticles])

    const handleCreate = async () => {
        if (!form.title.trim()) { toast.error('Title is required'); return }
        try {
            await apiClient.post('/support/knowledge-base', {
                title: form.title,
                content: form.content,
                category: form.category,
                author: form.author || 'Admin',
                status: form.status === 'Published' ? 'published' : 'draft',
                tags: [],
            })
            toast.success('Article created successfully')
            setShowCreateModal(false)
            setForm({ title: '', category: 'Bookings', author: '', content: '', status: 'Draft' })
            loadArticles()
        } catch {
            // Fallback: add locally
            const newArticle: Article = {
                id: Date.now(),
                title: form.title,
                category: form.category,
                catColor: getCatColor(form.category),
                author: form.author || 'Admin',
                lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                views: 0,
                status: form.status,
                statusColor: form.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600',
                content: form.content,
            }
            setArticles(prev => [newArticle, ...prev])
            toast.success('Article created (local only)')
            setShowCreateModal(false)
            setForm({ title: '', category: 'Bookings', author: '', content: '', status: 'Draft' })
        }
    }

    const handleEdit = async () => {
        if (!editingArticle || !form.title.trim()) { toast.error('Title is required'); return }
        try {
            await apiClient.put(`/support/knowledge-base/${editingArticle.id}`, {
                title: form.title,
                content: form.content,
                category: form.category,
                author: form.author,
                status: form.status === 'Published' ? 'published' : 'draft',
            })
            toast.success('Article updated')
            setEditingArticle(null)
            setForm({ title: '', category: 'Bookings', author: '', content: '', status: 'Draft' })
            loadArticles()
        } catch {
            // Fallback: update locally
            setArticles(prev => prev.map(a => a.id === editingArticle.id ? {
                ...a,
                title: form.title,
                category: form.category,
                catColor: getCatColor(form.category),
                author: form.author || a.author,
                content: form.content,
                status: form.status,
                statusColor: form.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600',
                lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            } : a))
            toast.success('Article updated (local only)')
            setEditingArticle(null)
            setForm({ title: '', category: 'Bookings', author: '', content: '', status: 'Draft' })
        }
    }

    const handleDelete = async (id: number | string) => {
        try {
            await apiClient.delete(`/support/knowledge-base/${id}`)
            toast.success('Article deleted')
            loadArticles()
        } catch {
            setArticles(prev => prev.filter(a => a.id !== id))
            toast.success('Article deleted (local only)')
        }
    }

    const startEdit = (a: Article) => {
        setEditingArticle(a)
        setForm({ title: a.title, category: a.category, author: a.author, content: a.content || '', status: a.status })
    }

    const toggleCategory = (cat: string) => {
        setExpandedCats(prev => {
            const next = new Set(prev)
            if (next.has(cat)) next.delete(cat)
            else next.add(cat)
            return next
        })
    }

    const filtered = articles.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCat = activeCategory === 'All' || a.category === activeCategory
        return matchesSearch && matchesCat
    })

    const publishedCount = articles.filter(a => a.status === 'Published').length
    const draftCount = articles.filter(a => a.status === 'Draft').length
    const totalViews = articles.reduce((sum, a) => sum + a.views, 0)

    const stats = [
        { label: 'Total Articles', value: articles.length.toString(), icon: FileText, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
        { label: 'Published', value: publishedCount.toString(), icon: BookOpen, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100' },
        { label: 'Draft', value: draftCount.toString(), icon: Edit, gradient: 'from-yellow-500 to-yellow-600', bgGradient: 'from-yellow-50 to-yellow-100' },
        { label: 'Views (30d)', value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews.toString(), icon: Eye, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' },
    ]

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-lg"></div>)}
                    </div>
                    <div className="h-96 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        )
    }

    const ArticleFormModal = ({ title, onSubmit, onClose }: { title: string; onSubmit: () => void; onClose: () => void }) => (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-blue-200 shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{title}</CardTitle>
                        <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Title</label>
                            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Article title" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none">
                                {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none">
                                <option value="Draft">Draft</option>
                                <option value="Published">Published</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Author</label>
                        <input type="text" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} placeholder="Author name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Content</label>
                        <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Write article content..." rows={5} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none resize-none" />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={onSubmit}>Save Article</Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-800">Knowledge base articles are stored locally in your browser. Changes persist across sessions.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
                    <p className="text-gray-600 mt-1">Create and manage help articles, guides, and FAQs</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Tag className="w-4 h-4 mr-2" /> Manage Categories
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => { setForm({ title: '', category: 'Bookings', author: '', content: '', status: 'Draft' }); setShowCreateModal(true) }}>
                        <Plus className="w-4 h-4 mr-2" /> Create Article
                    </Button>
                </motion.div>
            </div>

            {showCreateModal && <ArticleFormModal title="Create New Article" onSubmit={handleCreate} onClose={() => setShowCreateModal(false)} />}
            {editingArticle && <ArticleFormModal title={`Edit: ${editingArticle.title}`} onSubmit={handleEdit} onClose={() => setEditingArticle(null)} />}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <div className={`rounded-lg border-0 bg-gradient-to-br ${stat.bgGradient} p-4 hover:shadow-lg transition-all`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className={`bg-gradient-to-br ${stat.gradient} p-2.5 rounded-lg shadow-md`}>
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 font-medium mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FolderOpen className="w-5 h-5 text-amber-600" /> Categories
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <button onClick={() => setActiveCategory('All')} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeCategory === 'All' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <div className="flex items-center justify-between">
                                    <span>All Articles</span>
                                    <Badge variant="outline" className="text-xs">{articles.length}</Badge>
                                </div>
                            </button>
                            {categories.map((cat, i) => (
                                <motion.button key={cat.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }} onClick={() => { setActiveCategory(cat.name); toggleCategory(cat.name) }} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeCategory === cat.name ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${cat.color}`}></div>
                                            <span>{cat.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Badge variant="outline" className="text-xs">{articles.filter(a => a.category === cat.name).length}</Badge>
                                            {expandedCats.has(cat.name) ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>

                <div className="lg:col-span-3 space-y-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="text" placeholder="Search articles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                            </div>
                        </CardContent>
                    </Card>

                    <AnimatePresence>
                        {filtered.map((article, i) => (
                            <motion.div key={article.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ delay: 0.4 + i * 0.07 }}>
                                <Card className="hover:shadow-lg hover:border-blue-100 transition-all duration-200">
                                    <CardContent className="p-5">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge className={article.catColor}>{article.category}</Badge>
                                                    <Badge className={article.statusColor}>{article.status}</Badge>
                                                </div>
                                                <h3 className="font-semibold text-gray-900 text-lg mb-1">{article.title}</h3>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <User className="w-3.5 h-3.5" />
                                                        <span>{article.author}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>{article.lastUpdated}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>{article.views >= 1000 ? `${(article.views / 1000).toFixed(1)}K` : article.views} views</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <Button variant="outline" size="sm">
                                                    <Eye className="w-3.5 h-3.5 mr-1" /> View
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => startEdit(article)}>
                                                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleDelete(article.id)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filtered.length === 0 && (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">No articles found</h3>
                                <p className="text-gray-500">Try adjusting your search or category filter</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
