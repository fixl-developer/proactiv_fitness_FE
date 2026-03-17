'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    MessageSquare, Star, ThumbsUp, ThumbsDown, Search, Filter,
    TrendingUp, Users, Calendar, Reply, Trash2, Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function CustomerFeedbackPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRating, setFilterRating] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [feedback, setFeedback] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchFeedback()
    }, [searchTerm, filterRating, filterStatus])

    const fetchFeedback = async () => {
        try {
            setIsLoading(true)
            setError(null)
            // Mock data
            setFeedback([
                {
                    id: '1',
                    customerName: 'John Smith',
                    email: 'john@example.com',
                    rating: 5,
                    program: 'Gymnastics Classes',
                    title: 'Excellent coaching!',
                    comment: 'My daughter loves the classes. The coaches are very professional and caring.',
                    date: '2024-03-12',
                    status: 'PUBLISHED',
                    helpful: 24,
                    unhelpful: 1
                },
                {
                    id: '2',
                    customerName: 'Sarah Johnson',
                    email: 'sarah@example.com',
                    rating: 4,
                    program: 'Birthday Party',
                    title: 'Great party experience',
                    comment: 'The birthday party was well organized. Kids had a lot of fun!',
                    date: '2024-03-10',
                    status: 'PUBLISHED',
                    helpful: 18,
                    unhelpful: 2
                },
                {
                    id: '3',
                    customerName: 'Mike Chen',
                    email: 'mike@example.com',
                    rating: 3,
                    program: 'Summer Camp',
                    title: 'Good but could be better',
                    comment: 'The camp was good but the schedule was a bit tight. More breaks would be appreciated.',
                    date: '2024-03-08',
                    status: 'PENDING',
                    helpful: 5,
                    unhelpful: 3
                },
                {
                    id: '4',
                    customerName: 'Emma Davis',
                    email: 'emma@example.com',
                    rating: 5,
                    program: 'Private Coaching',
                    title: 'Highly recommend!',
                    comment: 'One-on-one coaching is fantastic. My son improved significantly.',
                    date: '2024-03-05',
                    status: 'PUBLISHED',
                    helpful: 32,
                    unhelpful: 0
                },
                {
                    id: '5',
                    customerName: 'David Wilson',
                    email: 'david@example.com',
                    rating: 2,
                    program: 'Gymnastics Classes',
                    title: 'Needs improvement',
                    comment: 'Classes are too crowded. Need better student-to-coach ratio.',
                    date: '2024-03-01',
                    status: 'PENDING',
                    helpful: 8,
                    unhelpful: 12
                },
            ])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const avgRating = (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    const publishedCount = feedback.filter(f => f.status === 'PUBLISHED').length
    const pendingCount = feedback.filter(f => f.status === 'PENDING').length
    const ratingDistribution = [
        { rating: '5 Stars', count: feedback.filter(f => f.rating === 5).length },
        { rating: '4 Stars', count: feedback.filter(f => f.rating === 4).length },
        { rating: '3 Stars', count: feedback.filter(f => f.rating === 3).length },
        { rating: '2 Stars', count: feedback.filter(f => f.rating === 2).length },
        { rating: '1 Star', count: feedback.filter(f => f.rating === 1).length },
    ]

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#dc2626']

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Customer Feedback</h1>
                    <p className="text-gray-600 mt-1">Reviews and ratings management</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    {
                        title: 'Average Rating',
                        value: `${avgRating}/5.0`,
                        icon: Star,
                        color: 'text-yellow-600',
                        bgColor: 'bg-yellow-50'
                    },
                    {
                        title: 'Total Reviews',
                        value: feedback.length.toString(),
                        icon: MessageSquare,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-50'
                    },
                    {
                        title: 'Published',
                        value: publishedCount.toString(),
                        icon: ThumbsUp,
                        color: 'text-green-600',
                        bgColor: 'bg-green-50'
                    },
                    {
                        title: 'Pending Review',
                        value: pendingCount.toString(),
                        icon: Calendar,
                        color: 'text-orange-600',
                        bgColor: 'bg-orange-50'
                    },
                ].map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">{metric.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                                    </div>
                                    <div className={`${metric.bgColor} p-3 rounded-lg`}>
                                        <metric.icon className={`w-6 h-6 ${metric.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Rating Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Rating Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={ratingDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ rating, count }) => `${rating}: ${count}`}
                                    outerRadius={80}
                                    dataKey="count"
                                >
                                    {ratingDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Rating Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {ratingDistribution.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < parseInt(item.rating)
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-400"
                                            style={{ width: `${(item.count / feedback.length) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 w-8 text-right">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search feedback..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={filterRating}
                            onChange={(e) => setFilterRating(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="published">Published</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Feedback List */}
            <div className="space-y-4">
                {feedback.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                                            <Badge variant={item.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                                                {item.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < item.rating
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                            <span className="text-sm text-gray-600 ml-2">{item.rating}/5</span>
                                        </div>
                                        <p className="text-gray-700 mb-2">{item.comment}</p>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <span>By: {item.customerName}</span>
                                            <span>Program: {item.program}</span>
                                            <span>Date: {item.date}</span>
                                        </div>
                                        <div className="flex gap-4 mt-3">
                                            <div className="flex items-center gap-1 text-sm">
                                                <ThumbsUp className="w-4 h-4 text-green-600" />
                                                <span className="text-gray-600">{item.helpful} helpful</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm">
                                                <ThumbsDown className="w-4 h-4 text-red-600" />
                                                <span className="text-gray-600">{item.unhelpful} unhelpful</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                                            <Reply className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {error && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-4">
                        <p className="text-sm text-yellow-800">⚠️ {error}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
