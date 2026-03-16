'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Edit2, Trash2, Eye, Calendar, Users, Clock, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default function LocationClassesPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterLevel, setFilterLevel] = useState('all')

    const classes = [
        {
            id: 1,
            name: 'Beginner Gymnastics',
            level: 'beginner',
            coach: 'Sarah Johnson',
            schedule: 'Mon, Wed, Fri - 9:00 AM',
            students: 12,
            capacity: 15,
            room: 'A1',
            status: 'active'
        },
        {
            id: 2,
            name: 'Intermediate Gymnastics',
            level: 'intermediate',
            coach: 'Mike Chen',
            schedule: 'Tue, Thu - 10:30 AM',
            students: 15,
            capacity: 15,
            room: 'A2',
            status: 'active'
        },
        {
            id: 3,
            name: 'Advanced Gymnastics',
            level: 'advanced',
            coach: 'John Williams',
            schedule: 'Mon, Wed, Fri - 12:00 PM',
            students: 10,
            capacity: 12,
            room: 'A1',
            status: 'active'
        },
        {
            id: 4,
            name: 'Kids Gymnastics',
            level: 'beginner',
            coach: 'Emma Davis',
            schedule: 'Sat, Sun - 2:00 PM',
            students: 18,
            capacity: 20,
            room: 'B1',
            status: 'active'
        },
        {
            id: 5,
            name: 'Teen Gymnastics',
            level: 'intermediate',
            coach: 'David Martinez',
            schedule: 'Tue, Thu - 3:30 PM',
            students: 14,
            capacity: 16,
            room: 'B2',
            status: 'active'
        },
    ]

    const filteredClasses = classes.filter(cls => {
        const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesLevel = filterLevel === 'all' || cls.level === filterLevel
        return matchesSearch && matchesLevel
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Classes</h1>
                    <p className="text-gray-600 mt-1">Manage all classes at this location</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    Add Class
                </button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search classes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={filterLevel}
                            onChange={(e) => setFilterLevel(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Levels</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6">
                {filteredClasses.map((cls, idx) => (
                    <motion.div
                        key={cls.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-blue-50 rounded-lg">
                                                <Calendar className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-bold text-gray-900">{cls.name}</h3>
                                                    <Badge variant="outline">{cls.level}</Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">Coach: <span className="font-medium">{cls.coach}</span></p>
                                                <p className="text-sm text-gray-600">Schedule: <span className="font-medium">{cls.schedule}</span></p>
                                                <p className="text-sm text-gray-600">Room: <span className="font-medium">{cls.room}</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                <Users className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm text-gray-600">Students</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-900">{cls.students}/{cls.capacity}</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                <Award className="w-4 h-4 text-green-600" />
                                                <span className="text-sm text-gray-600">Occupancy</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-900">{Math.round((cls.students / cls.capacity) * 100)}%</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 w-full lg:w-auto">
                                        <button className="flex-1 lg:flex-none px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                                            <Eye className="w-4 h-4" />
                                            <span className="hidden sm:inline">View</span>
                                        </button>
                                        <button className="flex-1 lg:flex-none px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                            <Edit2 className="w-4 h-4" />
                                            <span className="hidden sm:inline">Edit</span>
                                        </button>
                                        <button className="flex-1 lg:flex-none px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                                            <Trash2 className="w-4 h-4" />
                                            <span className="hidden sm:inline">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
