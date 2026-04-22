'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, TrendingUp, Activity, Zap, Plus, AlertCircle, LineChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface HealthMetric {
    _id: string
    date: string
    weight: number
    bmi: number
    heartRate: number
    steps: number
    calories: number
}

export default function HealthMetricsPage() {
    const [metrics, setMetrics] = useState<HealthMetric[]>([
        {
            _id: '1',
            date: 'Apr 22, 2026',
            weight: 75,
            bmi: 24.5,
            heartRate: 72,
            steps: 8500,
            calories: 2100
        },
        {
            _id: '2',
            date: 'Apr 21, 2026',
            weight: 75.2,
            bmi: 24.6,
            heartRate: 70,
            steps: 9200,
            calories: 2200
        },
        {
            _id: '3',
            date: 'Apr 20, 2026',
            weight: 75.5,
            bmi: 24.7,
            heartRate: 75,
            steps: 7800,
            calories: 2000
        }
    ])
    const [showAddMetric, setShowAddMetric] = useState(false)
    const [newMetric, setNewMetric] = useState({
        weight: '',
        heartRate: '',
        steps: '',
        calories: ''
    })

    const currentMetric = metrics[0]
    const previousMetric = metrics[1]

    const getWeightChange = () => {
        if (!previousMetric) return 0
        return (currentMetric.weight - previousMetric.weight).toFixed(1)
    }

    const getBMIStatus = (bmi: number) => {
        if (bmi < 18.5) return { status: 'Underweight', color: 'text-blue-600' }
        if (bmi < 25) return { status: 'Normal', color: 'text-green-600' }
        if (bmi < 30) return { status: 'Overweight', color: 'text-yellow-600' }
        return { status: 'Obese', color: 'text-red-600' }
    }

    const handleAddMetric = () => {
        if (!newMetric.weight || !newMetric.heartRate) {
            alert('Please fill in required fields')
            return
        }

        const metric: HealthMetric = {
            _id: String(metrics.length + 1),
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            weight: parseFloat(newMetric.weight),
            bmi: parseFloat(newMetric.weight) / 1.75 / 1.75,
            heartRate: parseInt(newMetric.heartRate),
            steps: parseInt(newMetric.steps) || 0,
            calories: parseInt(newMetric.calories) || 0
        }

        setMetrics([metric, ...metrics])
        setNewMetric({ weight: '', heartRate: '', steps: '', calories: '' })
        setShowAddMetric(false)
    }

    const bmiStatus = getBMIStatus(currentMetric.bmi)

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Health Metrics</h1>
                    <p className="text-gray-600 mt-2 text-sm font-medium">Track your fitness and health data</p>
                </div>
                <Button
                    onClick={() => setShowAddMetric(!showAddMetric)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Metric
                </Button>
            </div>

            {/* Add Metric Form */}
            {showAddMetric && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="p-6 border-emerald-200/50 bg-emerald-50/50">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Add Health Metric</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg) *</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={newMetric.weight}
                                    onChange={(e) => setNewMetric({ ...newMetric, weight: e.target.value })}
                                    placeholder="Enter weight"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Heart Rate (bpm) *</label>
                                <input
                                    type="number"
                                    value={newMetric.heartRate}
                                    onChange={(e) => setNewMetric({ ...newMetric, heartRate: e.target.value })}
                                    placeholder="Enter heart rate"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Steps</label>
                                <input
                                    type="number"
                                    value={newMetric.steps}
                                    onChange={(e) => setNewMetric({ ...newMetric, steps: e.target.value })}
                                    placeholder="Enter steps"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Calories</label>
                                <input
                                    type="number"
                                    value={newMetric.calories}
                                    onChange={(e) => setNewMetric({ ...newMetric, calories: e.target.value })}
                                    placeholder="Enter calories"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={handleAddMetric}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            >
                                Add Metric
                            </Button>
                            <Button
                                onClick={() => setShowAddMetric(false)}
                                variant="outline"
                                className="flex-1 border-gray-200 hover:bg-gray-50"
                            >
                                Cancel
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Current Metrics Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {/* Weight */}
                <Card className="p-4 border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-700 font-semibold">Weight</p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">{currentMetric.weight} kg</p>
                            <p className={`text-xs font-semibold mt-1 ${getWeightChange() > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {getWeightChange() > 0 ? '+' : ''}{getWeightChange()} kg
                            </p>
                        </div>
                        <Activity className="w-8 h-8 text-blue-400" />
                    </div>
                </Card>

                {/* BMI */}
                <Card className="p-4 border-purple-200/50 bg-gradient-to-br from-purple-50 to-purple-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-700 font-semibold">BMI</p>
                            <p className="text-2xl font-bold text-purple-900 mt-1">{currentMetric.bmi.toFixed(1)}</p>
                            <p className={`text-xs font-semibold mt-1 ${bmiStatus.color}`}>
                                {bmiStatus.status}
                            </p>
                        </div>
                        <LineChart className="w-8 h-8 text-purple-400" />
                    </div>
                </Card>

                {/* Heart Rate */}
                <Card className="p-4 border-red-200/50 bg-gradient-to-br from-red-50 to-red-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-700 font-semibold">Heart Rate</p>
                            <p className="text-2xl font-bold text-red-900 mt-1">{currentMetric.heartRate} bpm</p>
                            <p className="text-xs text-red-600 font-semibold mt-1">Normal</p>
                        </div>
                        <Heart className="w-8 h-8 text-red-400" />
                    </div>
                </Card>

                {/* Steps */}
                <Card className="p-4 border-green-200/50 bg-gradient-to-br from-green-50 to-green-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700 font-semibold">Steps</p>
                            <p className="text-2xl font-bold text-green-900 mt-1">{currentMetric.steps.toLocaleString()}</p>
                            <p className="text-xs text-green-600 font-semibold mt-1">Good</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-400" />
                    </div>
                </Card>
            </motion.div>

            {/* Metrics History */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <Card className="p-6 border-gray-200/50">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Metrics History</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200/50">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Date</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Weight</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">BMI</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Heart Rate</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Steps</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Calories</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metrics.map((metric, index) => (
                                    <motion.tr
                                        key={metric._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">{metric.date}</td>
                                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">{metric.weight} kg</td>
                                        <td className="py-3 px-4 text-sm text-gray-900">{metric.bmi.toFixed(1)}</td>
                                        <td className="py-3 px-4 text-sm text-gray-900">{metric.heartRate} bpm</td>
                                        <td className="py-3 px-4 text-sm text-gray-900">{metric.steps.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-sm text-gray-900">{metric.calories} kcal</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </motion.div>

            {/* Health Tips */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <Card className="p-6 border-emerald-200/50 bg-emerald-50/50">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Health Tips</h2>
                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <Zap className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-gray-900">Stay Active</p>
                                <p className="text-sm text-gray-600">Aim for at least 10,000 steps daily</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Heart className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-gray-900">Monitor Heart Rate</p>
                                <p className="text-sm text-gray-600">Normal resting heart rate is 60-100 bpm</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-gray-900">Maintain Healthy Weight</p>
                                <p className="text-sm text-gray-600">BMI between 18.5-24.9 is considered normal</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
