'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { Brain, Plus, Settings, TrendingUp, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function AIModelsPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [models] = useState([
        { id: '1', name: 'Recommendation Engine', status: 'active', accuracy: 94, predictions: 12543, version: '2.1.0' },
        { id: '2', name: 'Churn Prediction', status: 'active', accuracy: 89, predictions: 8234, version: '1.5.2' },
        { id: '3', name: 'Sentiment Analysis', status: 'training', accuracy: 92, predictions: 5432, version: '3.0.0' }
    ])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        setLoading(false)
    }, [isAuthenticated, router])

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading AI models...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Models</h1>
                        <p className="text-gray-600">Manage and monitor AI models</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Deploy Model
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {models.map((model, idx) => (
                        <motion.div
                            key={model.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Brain className="w-5 h-5 text-blue-600" />
                                            {model.name}
                                        </CardTitle>
                                        <Badge className={`${model.status === 'active' ? 'bg-green-100 text-green-800' :
                                                model.status === 'training' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {model.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Accuracy</p>
                                                <p className="text-2xl font-bold text-green-600">{model.accuracy}%</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Predictions</p>
                                                <p className="text-2xl font-bold text-blue-600">{model.predictions.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Version</p>
                                            <p className="font-medium">{model.version}</p>
                                        </div>
                                        <div className="flex gap-2 pt-3">
                                            <Button size="sm" variant="outline" className="flex-1">
                                                <Settings className="w-4 h-4 mr-2" />
                                                Configure
                                            </Button>
                                            <Button size="sm" variant="outline">
                                                <TrendingUp className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
