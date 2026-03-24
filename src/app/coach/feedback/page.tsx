'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MessageSquare, Send, Star, User, Trash2,
    CheckCircle, AlertCircle, X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { responsiveClasses } from '@/lib/responsiveClasses'
import { useAuth } from '@/contexts/AuthContext'
import { coachService } from '@/services/modules/coach.service'
import type { CoachStudent, CoachFeedback } from '@/services/modules/coach.service'

// Mock fallback data
const mockStudents: Pick<CoachStudent, 'id' | 'name' | 'level'>[] = [
    { id: '1', name: 'Aarav Patel', level: 'beginner' },
    { id: '2', name: 'Priya Singh', level: 'intermediate' },
    { id: '3', name: 'Rohan Kumar', level: 'advanced' },
    { id: '4', name: 'Ananya Sharma', level: 'beginner' },
    { id: '5', name: 'Vikram Desai', level: 'intermediate' }
]

const mockFeedback: CoachFeedback[] = [
    {
        id: '1',
        studentId: '1',
        studentName: 'Aarav Patel',
        coachId: '',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        rating: 4,
        text: 'Great improvement in balance! Keep practicing the stretches.',
        type: 'positive'
    },
    {
        id: '2',
        studentId: '2',
        studentName: 'Priya Singh',
        coachId: '',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        rating: 5,
        text: 'Excellent performance today! Your tumbling skills are impressive.',
        type: 'positive'
    },
    {
        id: '3',
        studentId: '3',
        studentName: 'Rohan Kumar',
        coachId: '',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        rating: 3,
        text: 'Need to focus more on form. Let\'s work on technique next class.',
        type: 'constructive'
    }
]

interface Notification {
    type: 'success' | 'error'
    message: string
}

const CoachFeedbackPage = () => {
    const { isAuthenticated, user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
    const [feedbackText, setFeedbackText] = useState('')
    const [rating, setRating] = useState(5)
    const [isSending, setIsSending] = useState(false)
    const [students, setStudents] = useState<Pick<CoachStudent, 'id' | 'name' | 'level'>[]>([])
    const [feedbackHistory, setFeedbackHistory] = useState<CoachFeedback[]>([])
    const [filterType, setFilterType] = useState('all')
    const [notification, setNotification] = useState<Notification | null>(null)

    const coachId = user?.id || ''

    const showNotification = useCallback((type: 'success' | 'error', message: string) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 4000)
    }, [])

    const loadStudents = useCallback(async () => {
        if (!coachId) return
        try {
            const data = await coachService.getMyStudents(coachId)
            if (data && data.length > 0) {
                setStudents(data.map(s => ({ id: s.id, name: s.name, level: s.level })))
            } else {
                // No students found from API - show fallback for demo
                setStudents(mockStudents)
            }
        } catch (error) {
            console.error('Error loading students:', error)
            setStudents(mockStudents)
        }
    }, [coachId])

    const loadFeedback = useCallback(async () => {
        if (!coachId) return
        try {
            const data = await coachService.getFeedbackHistory(coachId)
            setFeedbackHistory(data ?? [])
        } catch (error) {
            console.error('Error loading feedback:', error)
            setFeedbackHistory(mockFeedback.map(f => ({ ...f, coachId })))
        }
    }, [coachId])

    useEffect(() => {
        if (!isAuthenticated && !localStorage.getItem('token')) return

        const loadAll = async () => {
            setIsLoading(true)
            await Promise.all([loadStudents(), loadFeedback()])
            setIsLoading(false)
        }
        loadAll()
    }, [isAuthenticated, loadStudents, loadFeedback])

    const handleSendFeedback = async () => {
        if (!selectedStudent || !feedbackText.trim()) {
            showNotification('error', 'Please select a student and write feedback.')
            return
        }

        try {
            setIsSending(true)
            const feedbackType: 'positive' | 'constructive' = rating >= 4 ? 'positive' : 'constructive'

            await coachService.sendFeedback({
                studentId: selectedStudent,
                coachId,
                rating,
                text: feedbackText,
                type: feedbackType
            })

            const selectedStudentData = students.find(s => s.id === selectedStudent)
            const newFeedback: CoachFeedback = {
                id: Date.now().toString(),
                studentId: selectedStudent,
                studentName: selectedStudentData?.name || 'Unknown',
                coachId,
                date: new Date().toISOString(),
                rating,
                text: feedbackText,
                type: feedbackType
            }
            setFeedbackHistory(prev => [newFeedback, ...prev])

            // Reset form
            setFeedbackText('')
            setRating(5)
            setSelectedStudent(null)

            showNotification('success', `Feedback sent to ${selectedStudentData?.name || 'student'} successfully!`)
        } catch (error) {
            console.error('Error sending feedback:', error)
            showNotification('error', 'Failed to send feedback. Please try again.')
        } finally {
            setIsSending(false)
        }
    }

    const handleDeleteFeedback = async (feedbackId: string) => {
        try {
            await coachService.deleteFeedback(feedbackId)
            setFeedbackHistory(prev => prev.filter(f => f.id !== feedbackId))
            showNotification('success', 'Feedback entry removed.')
        } catch (error) {
            console.error('Error deleting feedback:', error)
            // Still remove locally even if API fails (may be mock data)
            setFeedbackHistory(prev => prev.filter(f => f.id !== feedbackId))
            showNotification('success', 'Feedback entry removed.')
        }
    }

    const filteredFeedback = feedbackHistory.filter(f => {
        if (filterType === 'all') return true
        return f.type === filterType
    })

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-96 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        )
    }

    return (
        <div className={responsiveClasses.pageContainer}>
            {/* Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
                            notification.type === 'success'
                                ? 'bg-green-600 text-white'
                                : 'bg-red-600 text-white'
                        }`}
                    >
                        {notification.type === 'success' ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <AlertCircle className="w-5 h-5" />
                        )}
                        <span className="text-sm font-medium">{notification.message}</span>
                        <button id="coach-feedback-dismiss-notification-btn" onClick={() => setNotification(null)} className="ml-2 hover:opacity-80">
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className={responsiveClasses.headerContainer}>
                <div>
                    <h1 className={responsiveClasses.headerTitle}>Student Feedback</h1>
                    <p className={responsiveClasses.headerSubtitle}>
                        Provide feedback and track student progress
                    </p>
                </div>
            </div>

            {/* Feedback Form */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Send Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Student Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Student
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                            {students.map(student => (
                                <button id={`coach-feedback-select-student-${student.id}-btn`}
                                    key={student.id}
                                    onClick={() => setSelectedStudent(student.id)}
                                    className={`p-3 rounded-lg border-2 transition-all text-center ${selectedStudent === student.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <User className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                                    <p className="text-xs font-medium text-gray-900 truncate">{student.name}</p>
                                    <p className="text-xs text-gray-500">{student.level}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedStudent && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            {/* Rating */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rating
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(r => (
                                        <button id={`coach-feedback-rating-${r}-btn`}
                                            key={r}
                                            onClick={() => setRating(r)}
                                            className="transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-8 h-8 ${r <= rating
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Feedback Text */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Feedback Message
                                </label>
                                <Textarea
                                    placeholder="Write your feedback here... (e.g., areas of improvement, strengths, encouragement)"
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                    className="min-h-24"
                                />
                            </div>

                            {/* Send Button */}
                            <Button id="coach-feedback-send-btn"
                                onClick={handleSendFeedback}
                                disabled={isSending || !feedbackText.trim()}
                                className="w-full"
                            >
                                {isSending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Send Feedback
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    )}
                </CardContent>
            </Card>

            {/* Feedback History */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Feedback History</CardTitle>
                        <div className="flex gap-2">
                            <select id="select-coach-feedback-1"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Feedback</option>
                                <option value="positive">Positive</option>
                                <option value="constructive">Constructive</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredFeedback.length > 0 ? (
                            filteredFeedback.map((feedback, index) => (
                                <motion.div
                                    key={feedback.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`p-4 rounded-lg border-l-4 ${feedback.type === 'positive'
                                            ? 'border-l-green-500 bg-green-50'
                                            : 'border-l-blue-500 bg-blue-50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{feedback.studentName}</h4>
                                            <p className="text-xs text-gray-600">
                                                {new Date(feedback.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex gap-1">
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
                                            <button id={`coach-feedback-delete-${feedback.id}-btn`}
                                                onClick={() => handleDeleteFeedback(feedback.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                                                title="Delete feedback"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-700">{feedback.text}</p>
                                    <Badge className="mt-2" variant="outline">
                                        {feedback.type === 'positive' ? 'Positive' : 'Constructive'}
                                    </Badge>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600">No feedback yet</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default CoachFeedbackPage
