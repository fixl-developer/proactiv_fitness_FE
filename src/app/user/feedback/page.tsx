'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import {
    MessageSquare,
    Send,
    AlertCircle,
    CheckCircle2,
    Loader,
    Star,
    Trash2,
    Search,
    Filter,
    Plus
} from 'lucide-react'
import feedbackService from '@/services/modules/feedback.service'
import {
    validateRequired,
    validateSelect,
    validateTextArea
} from '@/utils/validation'

interface Feedback {
    id: string
    type?: 'bug' | 'feature' | 'improvement' | 'other'
    category?: string
    title?: string
    subject?: string
    description?: string
    message?: string
    rating: number
    status: 'new' | 'reviewed' | 'in-progress' | 'completed'
    createdAt: string
    updatedAt: string
    anonymous?: boolean
}

type FeedbackFormState = {
    category: string
    subject: string
    message: string
    rating: number
    anonymous: boolean
}

export default function FeedbackPage() {
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterCategory, setFilterCategory] = useState<string>('all')

    const [feedbackList, setFeedbackList] = useState<Feedback[]>([])
    const [hoveredRating, setHoveredRating] = useState(0)

    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [newFeedback, setNewFeedback] = useState<FeedbackFormState>({
        category: '',
        subject: '',
        message: '',
        rating: 0,
        anonymous: false
    })
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        loadFeedback()
    }, [])

    const loadFeedback = async () => {
        try {
            setLoading(true)
            const data = await feedbackService.getFeedback()
            setFeedbackList(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Failed to load feedback:', error)
            setMessage({ type: 'error', text: 'Failed to load feedback' })
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setNewFeedback({ category: '', subject: '', message: '', rating: 0, anonymous: false })
        setHoveredRating(0)
        setFormErrors({})
    }

    const validateFeedback = (): boolean => {
        const errors: Record<string, string> = {}
        if (!newFeedback.rating || newFeedback.rating < 1 || newFeedback.rating > 5) {
            errors.rating = 'Please select a rating from 1 to 5 stars'
        }
        const categoryErr = validateSelect(newFeedback.category, 'Category')
        if (categoryErr) errors.category = categoryErr

        const subjectErr = validateRequired(newFeedback.subject, 'Subject')
        if (subjectErr) errors.subject = subjectErr

        const messageErr = validateTextArea(newFeedback.message, 'Message', 10, 2000)
        if (messageErr) errors.message = messageErr

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmitFeedback = async () => {
        if (!validateFeedback()) return

        try {
            setSubmitting(true)
            const payload: any = {
                rating: newFeedback.rating,
                category: newFeedback.category,
                subject: newFeedback.subject.trim(),
                title: newFeedback.subject.trim(),
                message: newFeedback.message.trim(),
                description: newFeedback.message.trim(),
                anonymous: newFeedback.anonymous,
                // Preserve existing enum shape for any legacy consumer
                type: 'improvement'
            }
            const feedback = await feedbackService.submitFeedback(payload)
            if (feedback && feedback.id) {
                setFeedbackList(prev => [feedback, ...prev])
            } else {
                await loadFeedback()
            }
            resetForm()
            setIsDrawerOpen(false)
            setMessage({ type: 'success', text: 'Thank you for your feedback!' })
            setTimeout(() => setMessage(null), 3000)
        } catch (error: any) {
            setMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to submit feedback' })
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
        } catch (error: any) {
            setMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to delete feedback' })
        }
    }

    const filteredFeedback = feedbackList.filter(feedback => {
        const cat = feedback.category || feedback.type || ''
        const matchesType = filterCategory === 'all' || cat === filterCategory
        const haystack = `${feedback.title || feedback.subject || ''} ${feedback.description || feedback.message || ''}`.toLowerCase()
        const matchesSearch = haystack.includes(searchQuery.toLowerCase())
        return matchesType && matchesSearch
    })

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'Experience':
            case 'experience':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200'
            case 'Coach':
            case 'coach':
                return 'bg-blue-50 text-blue-700 border-blue-200'
            case 'Facility':
            case 'facility':
                return 'bg-purple-50 text-purple-700 border-purple-200'
            case 'Program':
            case 'program':
                return 'bg-amber-50 text-amber-700 border-amber-200'
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
                className="mb-8 flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Feedback & Suggestions</h1>
                    <p className="text-gray-600">Help us improve by sharing your thoughts and ideas</p>
                </div>
                <Button
                    onClick={() => setIsDrawerOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Feedback
                </Button>
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

            {/* Feedback History */}
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
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                            <option value="all">All Categories</option>
                            <option value="Experience">Experience</option>
                            <option value="Coach">Coach</option>
                            <option value="Facility">Facility</option>
                            <option value="Program">Program</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                {/* Feedback List */}
                {filteredFeedback.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No feedback yet</p>
                        <Button
                            onClick={() => setIsDrawerOpen(true)}
                            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Share Your First Feedback
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredFeedback.map(feedback => {
                            const cat = feedback.category || feedback.type || 'Other'
                            const title = feedback.title || feedback.subject || '(Untitled)'
                            const desc = feedback.description || feedback.message || ''
                            return (
                                <motion.div
                                    key={feedback.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2 flex-wrap gap-y-1">
                                                <h3 className="font-semibold text-gray-900">{title}</h3>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(cat)}`}>
                                                    {cat}
                                                </span>
                                                {feedback.status && (
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(feedback.status)}`}>
                                                        {feedback.status}
                                                    </span>
                                                )}
                                                {feedback.anonymous && (
                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                                        Anonymous
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">{desc}</p>
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < (feedback.rating || 0)
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-gray-300'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString() : '—'}
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
                            )
                        })}
                    </div>
                )}
            </motion.div>

            {/* Submit Feedback Drawer */}
            <SlideInDrawer
                isOpen={isDrawerOpen}
                onClose={() => {
                    if (!submitting) {
                        setIsDrawerOpen(false)
                        resetForm()
                    }
                }}
                title="Share Your Feedback"
                description="Your feedback helps us improve our service."
                size="lg"
                footer={
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDrawerOpen(false)
                                resetForm()
                            }}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitFeedback}
                            disabled={submitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            {submitting ? 'Submitting...' : 'Submit'}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-5">
                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">How would you rate your experience? <span className="text-red-500">*</span></label>
                        <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
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
                        {formErrors.rating && <p className="text-xs text-red-600 mt-1">{formErrors.rating}</p>}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                        <select
                            value={newFeedback.category}
                            onChange={(e) => setNewFeedback(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                            <option value="">Select category</option>
                            <option value="Experience">Experience</option>
                            <option value="Coach">Coach</option>
                            <option value="Facility">Facility</option>
                            <option value="Program">Program</option>
                            <option value="Other">Other</option>
                        </select>
                        {formErrors.category && <p className="text-xs text-red-600 mt-1">{formErrors.category}</p>}
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject <span className="text-red-500">*</span></label>
                        <Input
                            type="text"
                            value={newFeedback.subject}
                            onChange={(e) => setNewFeedback(prev => ({ ...prev, subject: e.target.value }))}
                            placeholder="Brief summary of your feedback"
                            maxLength={120}
                            className="w-full"
                        />
                        {formErrors.subject && <p className="text-xs text-red-600 mt-1">{formErrors.subject}</p>}
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message <span className="text-red-500">*</span></label>
                        <textarea
                            value={newFeedback.message}
                            onChange={(e) => setNewFeedback(prev => ({ ...prev, message: e.target.value }))}
                            placeholder="Please share the details (10-2000 chars)..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                            rows={6}
                            maxLength={2000}
                        />
                        <div className="flex justify-between mt-1">
                            {formErrors.message ? (
                                <p className="text-xs text-red-600">{formErrors.message}</p>
                            ) : <span />}
                            <p className="text-xs text-gray-400">{newFeedback.message.length}/2000</p>
                        </div>
                    </div>

                    {/* Anonymous */}
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={newFeedback.anonymous}
                            onChange={(e) => setNewFeedback(prev => ({ ...prev, anonymous: e.target.checked }))}
                            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Submit anonymously</span>
                    </label>
                </div>
            </SlideInDrawer>
        </div>
    )
}
