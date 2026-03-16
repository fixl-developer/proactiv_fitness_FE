'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    BookOpen, Search, Plus, Edit, Trash2, Eye, Filter,
    FileText, Tag, Clock, User, Star, Download, Upload,
    MessageSquare, Brain, Lightbulb, HelpCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const KnowledgeBasePage = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')

    // Knowledge base articles
    const articles = [
        {
            id: 1,
            title: 'Class Scheduling Best Practices',
            category: 'Operations',
            content: 'Guidelines for optimal class scheduling and resource allocation...',
            author: 'Admin Team',
            lastUpdated: '2024-01-20',
            views: 156,
            rating: 4.8,
            tags: ['scheduling', 'operations', 'best-practices'],
            status: 'published'
        },
        {
            id: 2,
            title: 'Customer Service SOP',
            category: 'Customer Service',
            content: 'Standard operating procedures for handling customer inquiries...',
            author: 'Sarah Chen',
            lastUpdated: '2024-01-18',
            views: 203,
            rating: 4.9,
            tags: ['customer-service', 'sop', 'communication'],
            status: 'published'
        },
        {
            id: 3,
            title: 'Payment Processing Guidelines',
            category: 'Finance',
            content: 'Step-by-step guide for processing payments and handling refunds...',
            author: 'Finance Team',
            lastUpdated: '2024-01-15',
            views: 89,
            rating: 4.6,
            tags: ['payments', 'finance', 'procedures'],
            status: 'published'
        },
        {
            id: 4,
            title: 'Emergency Procedures',
            category: 'Safety',
            content: 'Emergency response procedures for various scenarios...',
            author: 'Safety Officer',
            lastUpdated: '2024-01-12',
            views: 67,
            rating: 5.0,
            tags: ['emergency', 'safety', 'procedures'],
            status: 'published'
        },
        {
            id: 5,
            title: 'AI Chatbot Training Guide',
            category: 'Technology',
            content: 'How to train and optimize the AI chatbot responses...',
            author: 'Tech Team',
            lastUpdated: '2024-01-10',
            views: 45,
            rating: 4.7,
            tags: ['ai', 'chatbot', 'training'],
            status: 'draft'
        }
    ]

    const categories = [
        { id: 'all', name: 'All Categories', count: articles.length },
        { id: 'Operations', name: 'Operations', count: articles.filter(a => a.category === 'Operations').length },
        { id: 'Customer Service', name: 'Customer Service', count: articles.filter(a => a.category === 'Customer Service').length },
        { id: 'Finance', name: 'Finance', count: articles.filter(a => a.category === 'Finance').length },
        { id: 'Safety', name: 'Safety', count: articles.filter(a => a.category === 'Safety').length },
        { id: 'Technology', name: 'Technology', count: articles.filter(a => a.category === 'Technology').length }
    ]

    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const getCategoryColor = (category: string) => {
        const colors = {
            'Operations': 'bg-blue-100 text-blue-700',
            'Customer Service': 'bg-green-100 text-green-700',
            'Finance': 'bg-purple-100 text-purple-700',
            'Safety': 'bg-red-100 text-red-700',
            'Technology': 'bg-orange-100 text-orange-700'
        }
        return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700'
    }

    const getStatusColor = (status: string) => {
        return status === 'published'
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Knowledge Base</h1>
                    <p className="text-gray-600 mt-2">Manage documentation, SOPs, and training materials</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button className="flex-1 sm:flex-none">
                        <Plus className="w-4 h-4 mr-2" />
                        New Article
                    </Button>
                    <Button variant="outline" className="flex-1 sm:flex-none">
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Articles</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">{articles.length}</p>
                            </div>
                            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Published</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                    {articles.filter(a => a.status === 'published').length}
                                </p>
                            </div>
                            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Views</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                    {articles.reduce((sum, a) => sum + a.views, 0)}
                                </p>
                            </div>
                            <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                    {(articles.reduce((sum, a) => sum + a.rating, 0) / articles.length).toFixed(1)}
                                </p>
                            </div>
                            <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search articles, content, or tags..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${selectedCategory === category.id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {category.name} ({category.count})
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Articles List */}
            <div className="space-y-4">
                {filteredArticles.map((article, index) => (
                    <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{article.title}</h3>
                                            <div className="flex gap-2">
                                                <Badge className={getCategoryColor(article.category)}>
                                                    {article.category}
                                                </Badge>
                                                <Badge className={getStatusColor(article.status)}>
                                                    {article.status}
                                                </Badge>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 mb-3 text-sm sm:text-base">{article.content}</p>

                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {article.tags.map((tag) => (
                                                <Badge key={tag} variant="outline" className="text-xs">
                                                    <Tag className="w-3 h-3 mr-1" />
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                {article.author}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {article.lastUpdated}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Eye className="w-4 h-4" />
                                                {article.views} views
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-500" />
                                                {article.rating}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 lg:ml-4 flex-shrink-0">
                                        <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                                            <Eye className="w-4 h-4 lg:mr-0 mr-2" />
                                            <span className="lg:hidden">View</span>
                                        </Button>
                                        <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                                            <Edit className="w-4 h-4 lg:mr-0 mr-2" />
                                            <span className="lg:hidden">Edit</span>
                                        </Button>
                                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* No Results */}
            {filteredArticles.length === 0 && (
                <Card>
                    <CardContent className="p-8 sm:p-12 text-center">
                        <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                        <p className="text-gray-600 mb-4">
                            No articles match your search criteria. Try adjusting your filters.
                        </p>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Article
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default KnowledgeBasePage