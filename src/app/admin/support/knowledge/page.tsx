'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Plus, Search, Upload, Eye, Edit, FolderOpen, FileText, ChevronDown, ChevronRight, Clock, User, Tag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

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
}

const articles: Article[] = [
    { id: 1, title: 'How to Book a Class', category: 'Bookings', catColor: 'bg-blue-100 text-blue-700', author: 'Admin Team', lastUpdated: 'Mar 15, 2026', views: 1200, status: 'Published', statusColor: 'bg-green-100 text-green-700' },
    { id: 2, title: 'Payment Methods Guide', category: 'Payments', catColor: 'bg-purple-100 text-purple-700', author: 'Finance Team', lastUpdated: 'Mar 12, 2026', views: 890, status: 'Published', statusColor: 'bg-green-100 text-green-700' },
    { id: 3, title: 'Setting Up Your Account', category: 'Getting Started', catColor: 'bg-emerald-100 text-emerald-700', author: 'Admin Team', lastUpdated: 'Mar 10, 2026', views: 2100, status: 'Published', statusColor: 'bg-green-100 text-green-700' },
    { id: 4, title: 'Troubleshooting Login Issues', category: 'Technical', catColor: 'bg-red-100 text-red-700', author: 'Tech Support', lastUpdated: 'Mar 8, 2026', views: 650, status: 'Published', statusColor: 'bg-green-100 text-green-700' },
    { id: 5, title: 'Cancellation Policy FAQ', category: 'Bookings', catColor: 'bg-blue-100 text-blue-700', author: 'Admin Team', lastUpdated: 'Mar 5, 2026', views: 430, status: 'Published', statusColor: 'bg-green-100 text-green-700' },
    { id: 6, title: 'New Feature: Virtual Training', category: 'Technical', catColor: 'bg-red-100 text-red-700', author: 'Product Team', lastUpdated: 'Mar 18, 2026', views: 0, status: 'Draft', statusColor: 'bg-gray-100 text-gray-600' },
]

const categories = [
    { name: 'Getting Started', count: 4, color: 'bg-emerald-500' },
    { name: 'Bookings', count: 8, color: 'bg-blue-500' },
    { name: 'Payments', count: 5, color: 'bg-purple-500' },
    { name: 'Account', count: 3, color: 'bg-amber-500' },
    { name: 'Technical', count: 6, color: 'bg-red-500' },
]

export default function KnowledgeBasePage() {
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState<string>('All')
    const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(['Bookings', 'Getting Started']))

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600)
        return () => clearTimeout(timer)
    }, [])

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
        { label: 'Total Articles', value: articles.length.toString(), icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Published', value: publishedCount.toString(), icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Draft', value: draftCount.toString(), icon: Edit, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Views (30d)', value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews.toString(), icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50' },
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
                    <p className="text-gray-600 mt-1">Create and manage help articles, guides, and FAQs</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                    </Button>
                    <Button variant="outline" size="sm">
                        <Tag className="w-4 h-4 mr-2" />
                        Manage Categories
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Article
                    </Button>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Card className="hover:shadow-lg transition-all duration-300">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                        <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                                    </div>
                                    <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Categories Sidebar */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FolderOpen className="w-5 h-5 text-amber-600" />
                                Categories
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <button
                                onClick={() => setActiveCategory('All')}
                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    activeCategory === 'All' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>All Articles</span>
                                    <Badge variant="outline" className="text-xs">{articles.length}</Badge>
                                </div>
                            </button>
                            {categories.map((cat, i) => (
                                <motion.button
                                    key={cat.name}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + i * 0.05 }}
                                    onClick={() => {
                                        setActiveCategory(cat.name)
                                        toggleCategory(cat.name)
                                    }}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                        activeCategory === cat.name ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${cat.color}`}></div>
                                            <span>{cat.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Badge variant="outline" className="text-xs">{cat.count}</Badge>
                                            {expandedCats.has(cat.name) ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Articles */}
                <div className="lg:col-span-3 space-y-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search articles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <AnimatePresence>
                        {filtered.map((article, i) => (
                            <motion.div
                                key={article.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ delay: 0.4 + i * 0.07 }}
                            >
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
                                                    <Eye className="w-3.5 h-3.5 mr-1" />
                                                    View
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="w-3.5 h-3.5 mr-1" />
                                                    Edit
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
