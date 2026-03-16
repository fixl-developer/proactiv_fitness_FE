'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
    MessageSquare, Send, Star, User, Calendar, TrendingUp,
    AlertCircle, CheckCircle, Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { responsiveClasses } from '@/lib/responsiveClasses'
import { useAuth } from '@/contexts/AuthContext'
import { rbacManager } from '@/services/auth/rbac'

const CoachFeedbackPage = () => {
    const router = useRouter()
    const { isAuthenticated, user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
    const [feedbackText, setFeedbackText] = useState('')
    const [rating, setRating] = useState(5)
    const [isSending, setIsSending] = useState(false)
    const [feedbackHistory, setFeedbackHistory] = useState<any[]>([])
    const [filterType, setFilterType] = useState('all')

    const students = [
        { id: '1', name: 'Aarav Patel', level: 'beginner' },
        { id: '2', name: 'Priya Singh', level: 'intermediate' },
        { id: '3', name: 'Rohan Kumar', level: 'advanced' },
        { id: '4', name: 'Ananya Sharma', level: 'beginner' },
        { id: '5', name: 'Vikram Desai', level: 'intermediate' }
    ]

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        if (!rbacManager.hasPermission('coach_feedback')) {
            router.push('/parent/dashboard')
            return
        }

        loadFeedback()
    }, [isAuthenticated, router])

    const loadFeedback = async () => {
        try {
            // Mock feedback history
            const mockFeedback = [
                {
                    id: '1',
                    studentId: '1',
                    studentName: 'Aarav Patel',
                    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    rating: 4,
                    text: 'Great improvement in balance! Keep practicing the stretches.',
                    type: 'positive'
                },
                {
                    id: '2',
                    studentId: '2',
                    studentName: 'Priya Singh',
                    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    rating: 5,
                    text: 'Excellent performance today! Your tumbling skills are impressive.',
                    type: 'positive'
                },
                {
                    id: '3',
                    studentId: '3',
                    studentName: 'Rohan Kumar',
                    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    rating: 3,
                    text: 'Need to focus more on form. Let\'s work on technique next class.',
                    type: 'constructive'
                }
            ]
            setFeedbackHistory(mockFeedback)
            setIsLoading(false)
        } catch (error) {
            console.error('Error loading feedback:', error)
            setIsLoading(false)
        }
    }

    const handleSendFeedback = async () => {
        if (!selectedStudent || !feedbackText.trim()) {
            return
        }

        try {
            setIsSending(true)
            // Send feedback
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Add to history
            const newFeedback = {
                id: Date.now().toString(),
                studentId: selectedStudent,
                studentName: students.find(s => s.id === selectedStudent)?.name,
                date: new Date().toISOString(),
                rating,
                text: feedbackText,
                type: rating >= 4 ? 'positive' : 'constructive'
            }
            setFeedbackHistory([newFeedback, ...feedbackHistory])

            // Reset form
            setFeedbackText('')
            setRating(5)
            setSelectedStudent(null)
            setIsSending(false)
        } catch (error) {
            console.error('Error sending feedback:', error)
            setIsSending(false)
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
                                <button
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
                                        <button
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
                            <Button
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
                            <select
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
