'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users, CheckCircle, XCircle, Clock, Calendar, Download,
    Filter, Search, TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function LocationAttendancePage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterClass, setFilterClass] = useState('all')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false)
        }, 1000)
    }, [])

    // Attendance trend data
    const attendanceTrend = [
        { week: 'Week 1', attended: 145, enrolled: 160, rate: 91 },
        { week: 'Week 2', attended: 152, enrolled: 160, rate: 95 },
        { week: 'Week 3', attended: 158, enrolled: 160, rate: 99 },
        { week: 'Week 4', attended: 155, enrolled: 160, rate: 97 },
    ]

    // Class attendance data
    const classAttendance = [
        { name: 'Beginner', enrolled: 45, attended: 42, rate: 93, trend: 'UP' },
        { name: 'Intermediate', enrolled: 38, attended: 36, rate: 95, trend: 'UP' },
        { name: 'Advanced', enrolled: 28, attended: 27, rate: 96, trend: 'FLAT' },
        { name: 'Elite', enrolled: 22, attended: 22, rate: 100, trend: 'UP' },
    ]

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Attendance Tracking</h1>
                    <p className="text-gray-600 mt-1">Monitor student attendance records</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Download className="w-5 h-5" />
                    Export Report
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Enrolled', value: '133', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Present Today', value: '128', color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Absent Today', value: '5', color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Avg Attendance', value: '96.3%', color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, idx) => (
                    <Card key={idx}>
                        <CardContent className="pt-6">
                            <div className={`${stat.bg} p-4 rounded-lg`}>
                                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                                <p className={`text-3xl font-bold ${stat.color} mt-2`}>{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Attendance Trend Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Weekly Attendance Trend
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={attendanceTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="week" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="attended" stroke="#3b82f6" name="Attended" strokeWidth={2} />
                            <Line type="monotone" dataKey="rate" stroke="#10b981" name="Attendance %" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Class Attendance */}
            <Card>
                <CardHeader>
                    <CardTitle>Attendance by Class</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {classAttendance.map((cls, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-4 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <p className="font-medium text-gray-900">{cls.name}</p>
                                        <p className="text-xs text-gray-600">{cls.attended}/{cls.enrolled} students</p>
                                    </div>
                                    <Badge variant={cls.rate >= 95 ? 'default' : 'secondary'}>
                                        {cls.rate}%
                                    </Badge>
                                </div>
                                <Progress value={cls.rate} className="h-2" />
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Search & Filter */}
            <Card>
                <CardHeader>
                    <CardTitle>Student Attendance Records</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Classes</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="elite">Elite</option>
                        </select>
                    </div>

                    {/* Attendance Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Class</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Classes</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Attended</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { name: 'John Doe', class: 'Beginner', total: 12, attended: 11, rate: 92 },
                                    { name: 'Jane Smith', class: 'Intermediate', total: 12, attended: 12, rate: 100 },
                                    { name: 'Mike Johnson', class: 'Advanced', total: 12, attended: 12, rate: 100 },
                                    { name: 'Sarah Williams', class: 'Beginner', total: 12, attended: 10, rate: 83 },
                                    { name: 'Tom Brown', class: 'Elite', total: 12, attended: 12, rate: 100 },
                                ].map((record, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-900">{record.name}</td>
                                        <td className="py-3 px-4 text-gray-600">{record.class}</td>
                                        <td className="py-3 px-4 text-gray-600">{record.total}</td>
                                        <td className="py-3 px-4 text-gray-600">{record.attended}</td>
                                        <td className="py-3 px-4">
                                            <Badge variant={record.rate >= 90 ? 'default' : 'secondary'}>
                                                {record.rate}%
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
