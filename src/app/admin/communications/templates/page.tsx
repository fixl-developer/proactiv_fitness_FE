'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Search, Plus, Copy, Eye, Edit, Smartphone, Zap, FileText, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const templates = [
    { id: 1, name: 'Booking Confirmation', type: 'Email', typeColor: 'bg-blue-100 text-blue-700', category: 'Booking', catColor: 'bg-emerald-100 text-emerald-700', lastModified: 'Mar 12, 2026', usageCount: 1200, preview: 'Hi {name}, your booking for {class} on {date} has been confirmed. See you there!', status: 'Active' },
    { id: 2, name: 'Payment Receipt', type: 'Email', typeColor: 'bg-blue-100 text-blue-700', category: 'Payment', catColor: 'bg-violet-100 text-violet-700', lastModified: 'Mar 10, 2026', usageCount: 890, preview: 'Thank you for your payment of ${amount}. Your receipt is attached below.', status: 'Active' },
    { id: 3, name: 'Class Reminder', type: 'SMS', typeColor: 'bg-orange-100 text-orange-700', category: 'Reminder', catColor: 'bg-amber-100 text-amber-700', lastModified: 'Mar 14, 2026', usageCount: 2100, preview: 'Reminder: Your {class} class starts in 1 hour at {location}. Don\'t forget your gear!', status: 'Active' },
    { id: 4, name: 'Welcome New Student', type: 'Email', typeColor: 'bg-blue-100 text-blue-700', category: 'Marketing', catColor: 'bg-pink-100 text-pink-700', lastModified: 'Mar 8, 2026', usageCount: 340, preview: 'Welcome to ProActiv Fitness, {name}! We\'re excited to have you join our community.', status: 'Active' },
    { id: 5, name: 'Cancellation Notice', type: 'Email', typeColor: 'bg-blue-100 text-blue-700', category: 'Booking', catColor: 'bg-emerald-100 text-emerald-700', lastModified: 'Mar 5, 2026', usageCount: 156, preview: 'Your booking for {class} on {date} has been cancelled. A refund will be processed.', status: 'Active' },
    { id: 6, name: 'Monthly Newsletter', type: 'Email', typeColor: 'bg-blue-100 text-blue-700', category: 'Marketing', catColor: 'bg-pink-100 text-pink-700', lastModified: 'Mar 18, 2026', usageCount: 0, preview: 'This month at ProActiv: New programs, coach spotlights, and upcoming events...', status: 'Draft' },
]

export default function TemplatesPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterCategory, setFilterCategory] = useState<string>('All')

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600)
        return () => clearTimeout(timer)
    }, [])

    const filtered = templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = filterCategory === 'All' || t.category === filterCategory
        return matchesSearch && matchesCategory
    })

    const stats = [
        { label: 'Total Templates', value: '24', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Email', value: '16', icon: Mail, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'SMS', value: '6', icon: Smartphone, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Push', value: '2', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
    ]

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-lg"></div>)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-56 bg-gray-200 rounded-lg"></div>)}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-3xl font-bold text-gray-900">Email & SMS Templates</h1>
                    <p className="text-gray-600 mt-1">Create and manage communication templates for all channels</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Template
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

            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search templates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {['All', 'Booking', 'Payment', 'Reminder', 'Marketing'].map(c => (
                                <Button key={c} variant={filterCategory === c ? 'default' : 'outline'} size="sm" onClick={() => setFilterCategory(c)}>
                                    {c}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence>
                    {filtered.map((template, i) => (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: i * 0.08 }}
                        >
                            <Card className="hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge className={template.typeColor}>{template.type}</Badge>
                                                <Badge className={template.catColor}>{template.category}</Badge>
                                                {template.status === 'Draft' && <Badge className="bg-gray-100 text-gray-600">Draft</Badge>}
                                            </div>
                                            <CardTitle className="text-lg">{template.name}</CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-between">
                                    <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
                                        <p className="text-sm text-gray-600 line-clamp-2 italic">&ldquo;{template.preview}&rdquo;</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{template.lastModified}</span>
                                            </div>
                                            <span className="font-medium">{template.usageCount > 0 ? `Used ${template.usageCount >= 1000 ? (template.usageCount / 1000).toFixed(1) + 'K' : template.usageCount} times` : 'Not used yet'}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <Edit className="w-3.5 h-3.5 mr-1" />
                                                Edit
                                            </Button>
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <Copy className="w-3.5 h-3.5 mr-1" />
                                                Duplicate
                                            </Button>
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <Eye className="w-3.5 h-3.5 mr-1" />
                                                Preview
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}
