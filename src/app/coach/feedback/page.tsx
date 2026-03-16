'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Star, MessageSquare, ThumbsUp, Heart, Award,
    Filter, Search, Calendar, User, TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

const CoachFeedbackPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRating, setSelectedRating] = useState('all')

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 800)
    }, [])

    const feedbackStats = {
        averageRating: 4.8,
        totalReviews: 156,
        fiveStars: 128,
        fourStars: 22,
        threeStars: 4,
        twoStars: 1,
        oneStars: 1,
        responseRate: 95
    }

    const recentFeedback = [
        {
            id: 1,
            studentName: 'Emma Wong',
            parentName: 'Mrs. Wong',
            rating: 5,
            date: '2024-01-20',
            class: 'GYMTOTS (3-4 years)',
            comment: 'Sarah is absolutely wonderful with Emma! She has such patience and makes learning fun. Emma looks forward to every class and has improved so much in just a few weeks.',
            highlights: ['Patient', 'Fun', 'Encouraging'],
            type: 'parent'
        },
        {
            id: 2,
            studentName: 'Lucas Chen',
            parentName: 'Mr. Chen',
            rating: 5,
            date: '2024-01-19',
            class: 'Beginner 1 (5-7 years)',
            comment: 'Coach Sarah has been amazing for Lucas. Her teaching style is perfect - she breaks down complex moves into simple steps. Lucas has gained so much confidence!',
            highlights: ['Clear Instructions', 'Confidence Building', 'Professional'],
            type: 'parent'
        },
        {
            id: 3,
            studentName: 'Sophia Li',
            parentName: 'Mrs. Li',
            rating: 5,
            date: '2024-01-18',
            class: 'Intermediate (8-10 years)',
            comment: 'Sarah pushes Sophia just the right amount. She recognizes her potential and helps her achieve new skills safely. We are so grateful for her expertise.',
            highlights: ['Skill Development', 'Safety Focused', 'Motivating'],
            type: 'parent'
        },
        {
            id: 4,
            studentName: 'Ryan Kim',
            parentName: 'Mr. Kim',
            rating: 4,
            date: '2024-01-17',
            class: 'Beginner 1 (5-7 years)',
            comment: 'Ryan was very shy at first, but Sarah made him feel comfortable. He is starting to participate more and enjoy the classes. Thank you for your patience!',
            highlights: ['Patient', 'Understanding', 'Supportive'],
            type: 'parent'
        },
        {
            id: 5,
            studentName: 'Mia Zhang',
            parentName: 'Mrs. Zhang',
            rating: 5,
            date: '2024-01-16',
            class: 'Intermediate (8-10 years)',
            comment: 'Mia absolutely loves Coach Sarah! She comes home excited about what she learned and practices at home. Sarah has a gift for teaching children.',
            highlights: ['Inspiring', 'Enthusiastic', 'Talented Teacher'],
            type: 'parent'
        },
        {
            id: 6,
            studentName: 'Alex Tan',
            parentName: 'Mrs. Tan',
            rating: 5,
            date: '2024-01-15',
            class: 'GYMTOTS (3-4 years)',
            comment: 'Sarah is fantastic! Alex was scared of gymnastics at first, but she made it so fun and safe. Now he asks when the next class is every day!',
            highlights: ['Fun', 'Safe Environment', 'Child-Friendly'],
            type: 'parent'
        }
    ]

    const monthlyTrends = [
        { month: 'Jan 2024', rating: 4.8, reviews: 28 },
        { month: 'Dec 2023', rating: 4.7, reviews: 25 },
        { month: 'Nov 2023', rating: 4.6, reviews: 22 },
        { month: 'Oct 2023', rating: 4.5, reviews: 20 },
        { month: 'Sep 2023', rating: 4.4, reviews: 18 },
        { month: 'Aug 2023', rating: 4.3, reviews: 15 }
    ]

    const topHighlights = [
        { highlight: 'Patient', count: 45, percentage: 89 },
        { highlight: 'Fun', count: 42, percentage: 83 },
        { highlight: 'Encouraging', count: 38, percentage: 75 },
        { highlight: 'Professional', count: 35, percentage: 69 },
        { highlight: 'Clear Instructions', count: 32, percentage: 63 },
        { highlight: 'Safety Focused', count: 30, percentage: 59 }
    ]

    const filteredFeedback = recentFeedback.filter(feedback => {
        const matchesSearch = feedback.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            feedback.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            feedback.comment.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRating = selectedRating === 'all' || feedback.rating.toString() === selectedRating
        return matchesSearch && matchesRating
    })

    const getRatingColor = (rating: number) => {
        if (rating === 5) return 'text-green-600'
        if (rating === 4) return 'text-blue-600'
        if (rating === 3) return 'text-yellow-600'
        return 'text-red-600'
    }

    if (isLoading) {
        return (
            <DashboardLayout userRole="coach" userName="Sarah Chen">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout userRole="coach" userName="Sarah Chen">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Student & Parent Feedback</h1>
                        <p className="text-gray-600">Track your teaching performance and parent satisfaction</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                        ⭐ {feedbackStats.averageRating}/5.0 Average
                    </Badge>
                </div>

                {/* Feedback Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            title: 'Average Rating',
                            value: feedbackStats.averageRating,
                            subtitle: 'Out of 5.0',
                            icon: Star,
                            color: 'text-yellow-600',
                            bg: 'bg-yellow-50'
                        },
                        {
                            title: 'Total Reviews',
                            value: feedbackStats.totalReviews,
                            subtitle: 'All time',
                            icon: MessageSquare,
                            color: 'text-blue-600',
                            bg: 'bg-blue-50'
                        },
                        {
                            title: '5-Star Reviews',
                            value: feedbackStats.fiveStars,
                            subtitle: `${Math.round((feedbackStats.fiveStars / feedbackStats.totalReviews) * 100)}% of total`,
                            icon: Award,
                            color: 'text-green-600',
                            bg: 'bg-green-50'
                        },
                        {
                            title: 'Response Rate',
                            value: `${feedbackStats.responseRate}%`,
                            subtitle: 'Parents who review',
                            icon: TrendingUp,
                            color: 'text-purple-600',
                            bg: 'bg-purple-50'
                        }
                    ].map((stat, index) => (
                        <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}>
                            <Card>
                                <CardContent className={`p-6 ${stat.bg}`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                            <p className="text-xs text-gray-500">{stat.subtitle}</p>
                                        </div>
                                        <stat.icon className={`w-8 h-8 ${stat.color}`} />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Rating Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Rating Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[5, 4, 3, 2, 1].map(rating => {
                                const count = rating === 5 ? feedbackStats.fiveStars :
                                    rating === 4 ? feedbackStats.fourStars :
                                        rating === 3 ? feedbackStats.threeStars :
                                            rating === 2 ? feedbackStats.twoStars :
                                                feedbackStats.oneStars
                                const percentage = (count / feedbackStats.totalReviews) * 100

                                return (
                                    <div key={rating} className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 w-16">
                                            <span className="text-sm font-medium">{rating}</span>
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                        </div>
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-yellow-400 h-2 rounded-full transition-all"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-600 w-12">{count}</span>
                                        <span className="text-sm text-gray-500 w-12">{percentage.toFixed(0)}%</span>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Highlights */}
                <Card>
                    <CardHeader>
                        <CardTitle>What Parents Say About You</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {topHighlights.map((highlight, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200"
                                >
                                    <div className="text-center">
                                        <p className="font-semibold text-gray-900">{highlight.highlight}</p>
                                        <p className="text-2xl font-bold text-blue-600">{highlight.count}</p>
                                        <p className="text-xs text-gray-600">{highlight.percentage}% mention this</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search feedback..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                        {['all', '5', '4', '3', '2', '1'].map((rating) => (
                            <button
                                key={rating}
                                onClick={() => setSelectedRating(rating)}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${selectedRating === rating
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {rating === 'all' ? 'All Ratings' : `${rating} ⭐`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent Feedback */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Feedback ({filteredFeedback.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {filteredFeedback.map((feedback, index) => (
                                <motion.div
                                    key={feedback.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                {feedback.studentName.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{feedback.studentName}</h4>
                                                <p className="text-sm text-gray-600">by {feedback.parentName}</p>
                                                <p className="text-xs text-gray-500">{feedback.class} • {feedback.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-4 h-4 ${star <= feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                                />
                                            ))}
                                            <span className={`ml-2 font-semibold ${getRatingColor(feedback.rating)}`}>
                                                {feedback.rating}.0
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-gray-700 mb-3 leading-relaxed">{feedback.comment}</p>

                                    <div className="flex flex-wrap gap-2">
                                        {feedback.highlights.map((highlight, idx) => (
                                            <Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                                <ThumbsUp className="w-3 h-3 mr-1" />
                                                {highlight}
                                            </Badge>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle>Rating Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {monthlyTrends.map((month, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium text-gray-900">{month.month}</span>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <span className="font-semibold">{month.rating}</span>
                                        </div>
                                        <span className="text-sm text-gray-600">{month.reviews} reviews</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

export default CoachFeedbackPage