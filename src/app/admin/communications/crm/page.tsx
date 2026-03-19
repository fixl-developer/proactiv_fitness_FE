'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, Plus, Upload, Download, UserPlus, Phone, Mail, MoreVertical, TrendingUp, AlertTriangle, UserCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const contacts = [
    { id: 1, name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '+852 9123 4567', type: 'Parent', typeColor: 'bg-blue-100 text-blue-700', status: 'Active', statusColor: 'bg-green-100 text-green-700', lastInteraction: '3 days ago', score: 92 },
    { id: 2, name: 'Tom Chen', email: 'tom.c@email.com', phone: '+852 9234 5678', type: 'Parent', typeColor: 'bg-blue-100 text-blue-700', status: 'At Risk', statusColor: 'bg-red-100 text-red-700', lastInteraction: '30 days ago', score: 45 },
    { id: 3, name: 'Emily Park', email: 'emily.p@email.com', phone: '+852 9345 6789', type: 'Lead', typeColor: 'bg-amber-100 text-amber-700', status: 'New', statusColor: 'bg-purple-100 text-purple-700', lastInteraction: 'Today', score: 70 },
    { id: 4, name: 'David Wong', email: 'david.w@email.com', phone: '+852 9456 7890', type: 'Parent', typeColor: 'bg-blue-100 text-blue-700', status: 'Active', statusColor: 'bg-green-100 text-green-700', lastInteraction: '1 week ago', score: 85 },
    { id: 5, name: 'Lisa Tam', email: 'lisa.t@email.com', phone: '+852 9567 8901', type: 'Lead', typeColor: 'bg-amber-100 text-amber-700', status: 'New', statusColor: 'bg-purple-100 text-purple-700', lastInteraction: '2 days ago', score: 60 },
]

const pipelineStages = [
    { name: 'Leads', count: 24, color: 'bg-amber-500' },
    { name: 'Prospects', count: 18, color: 'bg-blue-500' },
    { name: 'Active', count: 156, color: 'bg-green-500' },
    { name: 'At Risk', count: 12, color: 'bg-orange-500' },
    { name: 'Churned', count: 8, color: 'bg-red-500' },
]

function getScoreColor(score: number) {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-amber-600 bg-amber-50'
    return 'text-red-600 bg-red-50'
}

export default function CRMPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [view, setView] = useState<'table' | 'pipeline'>('table')

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600)
        return () => clearTimeout(timer)
    }, [])

    const filtered = contacts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const stats = [
        { label: 'Total Contacts', value: '218', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active', value: '156', icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'At Risk', value: '12', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'New (30d)', value: '24', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
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
                    <h1 className="text-3xl font-bold text-gray-900">CRM</h1>
                    <p className="text-gray-600 mt-1">Manage customer relationships, leads, and engagement</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Contact
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

            <div className="flex gap-2">
                <Button variant={view === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setView('table')}>
                    Table View
                </Button>
                <Button variant={view === 'pipeline' ? 'default' : 'outline'} size="sm" onClick={() => setView('pipeline')}>
                    Pipeline View
                </Button>
            </div>

            {view === 'pipeline' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Sales Pipeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-4">
                                {pipelineStages.map((stage, i) => (
                                    <motion.div
                                        key={stage.name}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.12 }}
                                        className="flex-1 text-center"
                                    >
                                        <div className="mb-2">
                                            <span className="text-2xl font-bold text-gray-900">{stage.count}</span>
                                        </div>
                                        <div className={`${stage.color} rounded-t-lg transition-all duration-700 mx-auto`} style={{ height: `${Math.max(48, (stage.count / 156) * 220)}px`, width: '80%' }}></div>
                                        <div className="mt-3 text-sm font-medium text-gray-600 bg-gray-50 rounded-b-lg py-2">{stage.name}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                <>
                    <Card>
                        <CardContent className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search contacts by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-blue-600" />
                                        <CardTitle>Contacts</CardTitle>
                                    </div>
                                    <Badge variant="outline">{filtered.length} contacts</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Phone</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Type</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Last Interaction</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Score</th>
                                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.map((contact, i) => (
                                                <motion.tr
                                                    key={contact.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                                >
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                                                {contact.name.split(' ').map(n => n[0]).join('')}
                                                            </div>
                                                            <span className="font-medium text-gray-900">{contact.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-gray-600 text-sm">{contact.email}</td>
                                                    <td className="py-3.5 px-4 text-gray-600 text-sm">{contact.phone}</td>
                                                    <td className="py-3.5 px-4"><Badge className={contact.typeColor}>{contact.type}</Badge></td>
                                                    <td className="py-3.5 px-4"><Badge className={contact.statusColor}>{contact.status}</Badge></td>
                                                    <td className="py-3.5 px-4 text-gray-600 text-sm">{contact.lastInteraction}</td>
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`px-2.5 py-1 rounded-full text-sm font-bold ${getScoreColor(contact.score)}`}>
                                                                {contact.score}
                                                            </div>
                                                            <Progress value={contact.score} className="w-12 h-1.5" />
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right">
                                                        <div className="flex items-center gap-1 justify-end">
                                                            <Button variant="ghost" size="sm"><Phone className="w-3.5 h-3.5" /></Button>
                                                            <Button variant="ghost" size="sm"><Mail className="w-3.5 h-3.5" /></Button>
                                                            <Button variant="ghost" size="sm"><MoreVertical className="w-3.5 h-3.5" /></Button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </>
            )}
        </div>
    )
}
