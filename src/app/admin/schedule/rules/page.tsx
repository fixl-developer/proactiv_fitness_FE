'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Settings, Clock, Users, MapPin, Calendar, AlertTriangle,
    Plus, Edit, Trash2, Save, X, CheckCircle, Info,
    Shield, Target, Activity, BarChart3, Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

// Scheduling rules data
const initialSchedulingRules = [
    {
        id: 1,
        name: 'Maximum Class Size',
        category: 'capacity',
        description: 'Limit the number of students per class based on age group',
        isActive: true,
        priority: 'high',
        conditions: 'Age 3-5: Max 8 students, Age 6-12: Max 12 students',
        actions: 'Block booking when limit reached',
        lastModified: '2024-01-15'
    },
    {
        id: 2,
        name: 'Coach Availability',
        category: 'staff',
        description: 'Ensure coaches are not double-booked',
        isActive: true,
        priority: 'critical',
        conditions: 'Check coach schedule conflicts',
        actions: 'Prevent overlapping assignments',
        lastModified: '2024-01-10'
    },
    {
        id: 3,
        name: 'Venue Capacity',
        category: 'facility',
        description: 'Manage venue occupancy limits',
        isActive: true,
        priority: 'high',
        conditions: 'Max 3 concurrent classes per venue',
        actions: 'Block new bookings when full',
        lastModified: '2024-01-08'
    },
    {
        id: 4,
        name: 'Advance Booking Window',
        category: 'booking',
        description: 'Set minimum advance booking requirements',
        isActive: false,
        priority: 'medium',
        conditions: 'Minimum 24 hours advance booking',
        actions: 'Show warning for last-minute bookings',
        lastModified: '2024-01-05'
    },
    {
        id: 5,
        name: 'Age Group Restrictions',
        category: 'capacity',
        description: 'Ensure proper age grouping in classes',
        isActive: true,
        priority: 'high',
        conditions: 'Age difference within 2 years',
        actions: 'Block inappropriate age mixing',
        lastModified: '2024-01-12'
    },
    {
        id: 6,
        name: 'Equipment Availability',
        category: 'facility',
        description: 'Check equipment availability for classes',
        isActive: false,
        priority: 'medium',
        conditions: 'Required equipment must be available',
        actions: 'Show equipment conflicts',
        lastModified: '2024-01-03'
    }
]

const SchedulingRulesPage = () => {
    const [editingRule, setEditingRule] = useState<number | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [rules, setRules] = useState(initialSchedulingRules)

    // Toggle rule active status
    const toggleRuleStatus = (ruleId: number) => {
        setRules(prevRules =>
            prevRules.map(rule =>
                rule.id === ruleId
                    ? { ...rule, isActive: !rule.isActive }
                    : rule
            )
        )
    }

    const categories = [
        { id: 'all', name: 'All Categories', count: rules.length },
        { id: 'capacity', name: 'Capacity Rules', count: rules.filter(r => r.category === 'capacity').length },
        { id: 'staff', name: 'Staff Rules', count: rules.filter(r => r.category === 'staff').length },
        { id: 'facility', name: 'Facility Rules', count: rules.filter(r => r.category === 'facility').length },
        { id: 'booking', name: 'Booking Rules', count: rules.filter(r => r.category === 'booking').length }
    ]

    const filteredRules = selectedCategory === 'all'
        ? rules
        : rules.filter(rule => rule.category === selectedCategory)

    const getPriorityColor = (priority: string) => {
        const colors = {
            critical: 'bg-red-100 text-red-700 border-red-200',
            high: 'bg-orange-100 text-orange-700 border-orange-200',
            medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            low: 'bg-blue-100 text-blue-700 border-blue-200'
        }
        return colors[priority as keyof typeof colors] || colors.medium
    }

    const getCategoryIcon = (category: string) => {
        const icons = {
            capacity: Users,
            staff: Shield,
            facility: MapPin,
            booking: Calendar
        }
        return icons[category as keyof typeof icons] || Settings
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Scheduling Rules</h1>
                    <p className="text-gray-600 mt-2">Configure automated scheduling rules and constraints</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Rule
                </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Rules</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">{rules.length}</p>
                            </div>
                            <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Rules</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                    {rules.filter(r => r.isActive).length}
                                </p>
                            </div>
                            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Critical Rules</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                    {rules.filter(r => r.priority === 'critical').length}
                                </p>
                            </div>
                            <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Categories</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                    {categories.filter(c => c.id !== 'all').length}
                                </p>
                            </div>
                            <Filter className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Category Filter */}
            <Card>
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${selectedCategory === category.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {category.name} ({category.count})
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Rules List */}
            <div className="space-y-4">
                {filteredRules.map((rule, index) => {
                    const CategoryIcon = getCategoryIcon(rule.category)
                    return (
                        <motion.div
                            key={rule.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                        <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                                            <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                                                <CategoryIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                                        {rule.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={getPriorityColor(rule.priority)}>
                                                            {rule.priority}
                                                        </Badge>
                                                        <Switch
                                                            checked={rule.isActive}
                                                            onCheckedChange={() => toggleRuleStatus(rule.id)}
                                                            className="ml-auto sm:ml-0"
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 mb-3 text-sm sm:text-base">{rule.description}</p>
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 text-sm">
                                                    <div>
                                                        <p className="font-medium text-gray-700 mb-1">Conditions:</p>
                                                        <p className="text-gray-600">{rule.conditions}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-700 mb-1">Actions:</p>
                                                        <p className="text-gray-600">{rule.actions}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-3 text-xs text-gray-500">
                                                    Last modified: {rule.lastModified}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2 lg:ml-4 flex-shrink-0">
                                            <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                                                <Edit className="w-4 h-4 lg:mr-0 mr-2" />
                                                <span className="lg:hidden">Edit</span>
                                            </Button>
                                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 flex-1 lg:flex-none">
                                                <Trash2 className="w-4 h-4 lg:mr-0 mr-2" />
                                                <span className="lg:hidden">Delete</span>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>

            {/* No Rules Message */}
            {filteredRules.length === 0 && (
                <Card>
                    <CardContent className="p-8 sm:p-12 text-center">
                        <Settings className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No rules found</h3>
                        <p className="text-gray-600 mb-4">
                            No scheduling rules match the selected category.
                        </p>
                        <Button className="w-full sm:w-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Rule
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default SchedulingRulesPage
