'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    Brain, Sparkles, Loader2, RefreshCw, Utensils, Droplets,
    ShoppingCart, BookOpen, Target, TrendingUp, Plus, Calendar,
    Apple, FileText, Award, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import nutritionService from '@/services/nutritionService'
import { parentAIService } from '@/services/advancedAIServices'

export default function ParentNutritionPage() {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [mealPlans, setMealPlans] = useState<any[]>([])
    const [recommendations, setRecommendations] = useState<any>(null)
    const [report, setReport] = useState<any>(null)
    const [generating, setGenerating] = useState(false)
    const [reportLoading, setReportLoading] = useState(false)
    const [selectedChild, setSelectedChild] = useState('')

    const parentId = user?.id || ''

    const loadData = useCallback(async () => {
        setIsLoading(true)
        try {
            const childId = selectedChild || parentId
            const [plansRes, recRes] = await Promise.allSettled([
                nutritionService.listMealPlans(childId, ''),
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/nutrition/recommendations/${childId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` },
                }).then(r => r.json()),
            ])
            setMealPlans(plansRes.status === 'fulfilled' ? (plansRes.value?.data || plansRes.value || []) : [])
            setRecommendations(recRes.status === 'fulfilled' ? (recRes.value?.data || recRes.value) : null)
        } catch (err) {
            console.error('Failed to load nutrition:', err)
        } finally {
            setIsLoading(false)
        }
    }, [parentId, selectedChild])

    const handleGeneratePlan = async () => {
        setGenerating(true)
        try {
            const childId = selectedChild || parentId
            const result = await nutritionService.generateMealPlan({
                childId,
                age: 10,
                duration: 7,
                activityLevel: 'moderate',
                dietaryRestrictions: [],
                goals: ['general health', 'athletic performance'],
            })
            if (result?.data || result) {
                setMealPlans(prev => [result.data || result, ...prev])
            }
        } catch (err) {
            console.error('Failed to generate plan:', err)
        } finally {
            setGenerating(false)
        }
    }

    const handleGenerateReport = async () => {
        setReportLoading(true)
        try {
            const childId = selectedChild || parentId
            const result = await parentAIService.generateReport(childId, 'weekly')
            setReport(result?.data || result)
        } catch (err) {
            console.error('Failed to generate report:', err)
        } finally {
            setReportLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [loadData])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <p className="text-gray-500">Loading nutrition data...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Child Nutrition</h1>
                    <p className="text-gray-600 mt-1">
                        AI-powered meal plans & nutrition management for your child
                        <Badge className="ml-2 bg-purple-100 text-purple-700 text-xs">AI Powered</Badge>
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleGenerateReport} disabled={reportLoading}>
                        {reportLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <FileText className="w-4 h-4 mr-1" />}
                        AI Report
                    </Button>
                    <Button size="sm" onClick={handleGeneratePlan} disabled={generating} className="bg-emerald-600 hover:bg-emerald-700">
                        {generating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Brain className="w-4 h-4 mr-1" />}
                        Generate Meal Plan
                    </Button>
                </div>
            </div>

            {/* AI Report Card */}
            {report && (
                <Card className="border-purple-200 bg-purple-50/50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-600" />
                            <CardTitle>AI Nutrition Report</CardTitle>
                            <Badge className="bg-purple-100 text-purple-700 text-xs">AI Generated</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {report.summary && <p className="text-sm text-gray-700">{report.summary}</p>}
                            {report.highlights?.length > 0 && (
                                <div className="space-y-2">
                                    {report.highlights.map((h: any, i: number) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-gray-700">{typeof h === 'string' ? h : h.text || h.title}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {report.recommendations?.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-purple-200">
                                    <p className="text-xs font-medium text-purple-700 mb-2">Recommendations:</p>
                                    {report.recommendations.map((r: string, i: number) => (
                                        <p key={i} className="text-xs text-purple-600 mb-1">- {r}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* AI Recommendations */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-600" />
                        <CardTitle>AI Nutrition Recommendations</CardTitle>
                        <Badge className="bg-purple-100 text-purple-700 text-xs">AI Powered</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {recommendations?.recommendations?.length > 0 ? (
                        <div className="space-y-3">
                            {recommendations.recommendations.map((rec: any, i: number) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                        rec.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                                    }`}>
                                        <Target className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{rec.recommendation || rec.category}</p>
                                        {rec.reason && <p className="text-xs text-gray-500 mt-0.5">{rec.reason}</p>}
                                        {rec.priority && <Badge className="mt-1 text-xs">{rec.priority}</Badge>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <Apple className="w-5 h-5 text-emerald-600 mt-0.5" />
                                <p className="text-sm text-gray-700">Ensure a balanced diet with proteins, carbs, and healthy fats for young athletes</p>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <Droplets className="w-5 h-5 text-cyan-600 mt-0.5" />
                                <p className="text-sm text-gray-700">Your child should drink 6-8 glasses of water daily, especially during training days</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Meal Plans */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Utensils className="w-5 h-5 text-emerald-600" />
                            Meal Plans
                        </CardTitle>
                        <Button size="sm" variant="outline" onClick={handleGeneratePlan} disabled={generating}>
                            {generating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                            New Plan
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {mealPlans.length > 0 ? (
                        <div className="space-y-3">
                            {mealPlans.map((plan: any, idx: number) => (
                                <motion.div
                                    key={plan._id || idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="border border-gray-200 rounded-lg p-4"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900">{plan.duration || 7}-Day Meal Plan</h3>
                                            {plan.aiPowered && <Badge className="bg-purple-100 text-purple-700 text-xs">AI</Badge>}
                                            <Badge className={plan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                                                {plan.status || 'active'}
                                            </Badge>
                                        </div>
                                        <span className="text-xs text-gray-500">{new Date(plan.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {plan.notes && <p className="text-sm text-gray-600 mb-2">{plan.notes}</p>}
                                    {plan.macros && (
                                        <div className="flex gap-4 text-xs text-gray-500">
                                            <span>Protein: {plan.macros.protein}g</span>
                                            <span>Carbs: {plan.macros.carbs}g</span>
                                            <span>Fats: {plan.macros.fats}g</span>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Utensils className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No meal plans yet</p>
                            <Button size="sm" className="mt-3 bg-emerald-600 hover:bg-emerald-700" onClick={handleGeneratePlan} disabled={generating}>
                                <Brain className="w-4 h-4 mr-1" /> Generate AI Meal Plan
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
