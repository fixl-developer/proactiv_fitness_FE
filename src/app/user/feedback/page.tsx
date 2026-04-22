'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    MessageSquare,
    Send,
    AlertCircle,
    CheckCircle2,
    Loader,
    Star,
    Trash2,
    Search,
    Filter
} from 'lucide-react'
import feedbackService from '@/services/modules/feedback.service'

interface Feedback {
    id: string
    type: 'bug' | 'feature' | 'improvement' | 'other'
    title: string
    description: string
    rating: number
    status: 'new' | 'reviewed' | 'in-progress' | 'completed'
    createdAt: string
    updatedAt: string
}

export default function FeedbackPage() {
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit')
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<'all' | 'bug' | 'feature' | 'improvement' | 'other'>('all')

    const [feedbackList, setFeedbackList] = useState<Feedback[]>([])
    const [hoveredRating, setHoveredRating] = useState(0)

    const [newFeedback, setNewFeedback] = useState({
        type: 'improvement' as const,
        title: '',
        description: '',
        rating: 0
    })

    useEffect(() => {
        loadFeedback()
    }, [])

    const loadFeedback = async () => {
        try {
            setLoading(true)
            const data = await feedbackService.getFeedback()
            setFeedbackList(data || [])
        } catch (error) {
            console.error('Failed to load feedback:', error)
            setMessage({ type: 'error', text: 'Failed to load feedback' })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitFeedback = async () => {
        if (!newFeedback.title || !newFeedback.description || newFeedback.rating === 0) {
            setMessage({ type: 'error', text: 'Please fill in all fields and provide a rating' })
            return
        }

        try {
            setSubmitting(true)
            const feedback = await feedbackService.submitFeedback(newFeedback)
            setFeedbackList(prev => [feedback, ...prev])
            setNewFeedback({ type: 'improvement', title: '', description: '', rating: 0 })
            setHoveredRating(0)
            setMessage({ type: 'success', text: 'Thank you for your feedback!' })
            setTimeout(() => setMessage(null), 3000)
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to submit feedback' })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteFeedback = async (id: string) => {
        try {
            await feedbackService.deleteFeedback(id)
            setFeedbackList(prev => prev.filter(f => f.id !== id))
            setMessage({ type: 'success', text: 'Feedback deleted' })
            setTimeout(() => setMessage(null), 3000)
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete feedback' })
        }
    }

    const filteredFeedback = feedbackList.filter(feedback => {
        const matchesType = filterType === 'all' || feedback.type === filterType
        const matchesSearch = feedback.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            feedback.description.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesType && matchesSearch
    })

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'bug':
                return 'bg-red-50 text-red-700 border-red-200'
            case 'feature':
                return 'bg-blue-50 text-blue-700 border-blue-200'
            case 'improvement':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200'
            case 'other':
                return 'bg-gray-50 text-gray-700 border-gray-200'
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new':
                return 'bg-blue-50 text-blue-700'
            case 'reviewed':
                return 'bg-yellow-50 text-yellow-700'
            case 'in-progress':
                return 'bg-purple-50 text-purple-700'
            case 'completed':
                return 'bg-emerald-50 text-emerald-700'
            default:
                return 'bg-gray-50 text-gray-700'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Feedback & Suggestions</h1>
                <p className="text-gray-600">Help us improve by sharing your thoughts and ideas</p>
            </motion.div>

            {/* Message Alert */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${message.type === 'success'
                            ? 'bg-emerald-50 border border-emerald-200'
                            : 'bg-red-50 border border-red-200'
                        }`}
                >
                    {message.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <span className={message.type === 'success' ? 'text-emerald-800' : 'text-red-800'}>
                        {message.text}
                    </span>
                </motion.div>
            )}

            {/* Tabs */}
            <div className="flex space-x-2 mb-6 border-b border-gray-200">
                {(['submit', 'history'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === tab
                                ? 'border-emerald-600 text-emerald-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {tab === 'submit' ? 'Submit Feedback' : 'Feedback History'}
                    </button>
                ))}
            </div>

            {/* Submit Feedback Tab */}
            {activeTab === 'submit' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Share Your Feedback</h2>

                        <div className="space-y-6">
                            {/* Feedback Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Feedback Type</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {(['bug', 'feature', 'improvement', 'other'] as const).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setNewFeedback(prev => ({ ...prev, type }))}
                                            className={`p-3 rounded-lg border-2 transition-all font-medium text-sm ${newFeedback.type === type
                                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Rating */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">How would you rate your experience?</label>
                                <div className="flex items-center space-x-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            onClick={() => setNewFeedback(prev => ({ ...prev, rating: star }))}
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onMouseLeave={() => setHoveredRating(0)}
                                            className="transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-8 h-8 ${star <= (hoveredRating || newFeedback.rating)
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                    {newFeedback.rating > 0 && (
                                        <span className="ml-2 text-sm font-medium text-gray-700">
                                            {newFeedback.rating} out of 5
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                <Input
                                    type="text"
                                    value={newFeedback.title}
                                    onChange={(e) => setNewFeedback(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Brief title for your feedback"
                                    className="w-full"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={newFeedback.description}
                                    onChange={(e) => setNewFeedback(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Please provide detailed feedback..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                                    rows={6}
                                />
                            </div>

                            <Button
                                onClick={handleSubmitFeedback}
                                disabled={submitting}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                {submitting ? 'Submitting...' : 'Submit Feedback'}
                            </Button>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="font-semibold text-blue-900 mb-3">Tips for Better Feedback</h3>
                        <ul className="space-y-2 text-sm text-blue-800">
                            <li>• Be specific and clear about what you're reporting or suggesting</li>
                            <li>• Include steps to reproduce if reporting a bug</li>
                            <li>• Explain how a feature would improve your experience</li>
                            <li>• Be constructive and respectful in your feedback</li>
                        </ul>
                    </div>
                </motion.div>
            )}

            {/* Feedback History Tab */}
            {activeTab === 'history' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search feedback..."
                                className="pl-10"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-gray-600" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as any)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            >
                                <option value="all">All Types</option>
                                <option value="bug">Bug</option>
                                <option value="feature">Feature</option>
                                <option value="improvement">Improvement</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Feedback List */}
                    {filteredFeedback.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">No feedback found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredFeedback.map(feedback => (
                                <motion.div
                                    key={feedback.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="font-semibold text-gray-900">{feedback.title}</h3>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(feedback.type)}`}>
                                                    {feedback.type}
                                                </span>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(feedback.status)}`}>
                                                    {feedback.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">{feedback.description}</p>
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < feedback.rating
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-gray-300'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(feedback.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteFeedback(feedback.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                            title="Delete feedback"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    )
}
