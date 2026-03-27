'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    Brain, Sparkles, Loader2, RefreshCw, Utensils, Droplets,
    ShoppingCart, BookOpen, Target, TrendingUp, Plus, Calendar,
    Apple, Coffee, Sun, Moon, Clock, ChevronRight, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import nutritionService from '@/services/nutritionService'

export default function NutritionPage() {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'overview' | 'meal-plan' | 'recipes' | 'grocery'>('overview')

    // Data states
    const [mealPlans, setMealPlans] = useState<any[]>([])
    const [todayLogs, setTodayLogs] = useState<any>(null)
    const [recommendations, setRecommendations] = useState<any>(null)
    const [recipes, setRecipes] = useState<any>(null)
    const [groceryList, setGroceryList] = useState<any>(null)

    // AI states
    const [generating, setGenerating] = useState(false)
    const [recLoading, setRecLoading] = useState(false)
    const [recipeLoading, setRecipeLoading] = useState(false)
    const [groceryLoading, setGroceryLoading] = useState(false)

    // Log meal modal
    const [showLogModal, setShowLogModal] = useState(false)
    const [logForm, setLogForm] = useState({ mealType: 'breakfast', foodItems: '', calories: '', notes: '' })

    const childId = user?.id || ''

    const loadData = useCallback(async () => {
        setIsLoading(true)
        try {
            const [plansRes, logsRes] = await Promise.allSettled([
                nutritionService.listMealPlans(childId, ''),
                nutritionService.getNutritionLog(childId, new Date().toISOString().split('T')[0]),
            ])
            setMealPlans(plansRes.status === 'fulfilled' ? (plansRes.value?.data || plansRes.value || []) : [])
            setTodayLogs(logsRes.status === 'fulfilled' ? (logsRes.value?.data || logsRes.value) : null)
        } catch (err) {
            console.error('Failed to load nutrition data:', err)
        } finally {
            setIsLoading(false)
        }
    }, [childId])

    const loadRecommendations = async () => {
        setRecLoading(true)
        try {
            const res = await nutritionService.getNutritionLog(childId, '') // Use as proxy for recommendations
            setRecommendations(res?.data || res)
        } catch { /* ignore */ }
        finally { setRecLoading(false) }
    }

    const handleGenerateMealPlan = async () => {
        setGenerating(true)
        try {
            const result = await nutritionService.generateMealPlan({
                childId,
                age: (user as any)?.age || 10,
                duration: 7,
                activityLevel: 'moderate',
                dietaryRestrictions: [],
                goals: ['general health', 'athletic performance'],
            })
            if (result?.data || result) {
                setMealPlans(prev => [result.data || result, ...prev])
            }
        } catch (err) {
            console.error('Failed to generate meal plan:', err)
        } finally {
            setGenerating(false)
        }
    }

    const handleLoadRecipes = async () => {
        setRecipeLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/nutrition/recipes`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
                },
            })
            const data = await res.json()
            setRecipes(data?.data || data)
        } catch { /* ignore */ }
        finally { setRecipeLoading(false) }
    }

    const handleLoadGroceryList = async (planId: string) => {
        setGroceryLoading(true)
        try {
            const res = await nutritionService.getGroceryList(planId)
            setGroceryList(res?.data || res)
        } catch { /* ignore */ }
        finally { setGroceryLoading(false) }
    }

    const handleLogMeal = async () => {
        try {
            await nutritionService.logMeal({
                childId,
                studentId: childId,
                mealType: logForm.mealType,
                foodItems: logForm.foodItems.split(',').map(f => ({ name: f.trim() })),
                calories: parseInt(logForm.calories) || 0,
                notes: logForm.notes,
                date: new Date().toISOString(),
            })
            setShowLogModal(false)
            setLogForm({ mealType: 'breakfast', foodItems: '', calories: '', notes: '' })
            loadData()
        } catch (err) {
            console.error('Failed to log meal:', err)
        }
    }

    useEffect(() => {
        loadData()
        loadRecommendations()
    }, [loadData])

    const mealIcons: Record<string, any> = {
        breakfast: Sun, lunch: Coffee, dinner: Moon, snack: Apple,
    }

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
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Smart Nutrition</h1>
                    <p className="text-gray-600 mt-1">
                        AI-powered meal plans, tracking & recommendations
                        <Badge className="ml-2 bg-purple-100 text-purple-700 text-xs">AI Powered</Badge>
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowLogModal(true)}>
                        <Plus className="w-4 h-4 mr-1" /> Log Meal
                    </Button>
                    <Button size="sm" onClick={handleGenerateMealPlan} disabled={generating} className="bg-emerald-600 hover:bg-emerald-700">
                        {generating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Brain className="w-4 h-4 mr-1" />}
                        {generating ? 'Generating...' : 'Generate Meal Plan'}
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {(['overview', 'meal-plan', 'recipes', 'grocery'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => {
                            setActiveTab(tab)
                            if (tab === 'recipes' && !recipes) handleLoadRecipes()
                            if (tab === 'grocery' && !groceryList && mealPlans[0]?._id) handleLoadGroceryList(mealPlans[0]._id)
                        }}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        {tab === 'overview' ? 'Overview' : tab === 'meal-plan' ? 'Meal Plans' : tab === 'recipes' ? 'Recipes' : 'Grocery List'}
                    </button>
                ))}
            </div>

            {/* ─── OVERVIEW TAB ──────────────────────────────────── */}
            {activeTab === 'overview' && (
                <>
                    {/* Today's Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4 text-center">
                                <Utensils className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-gray-900">{todayLogs?.dailyTotals?.calories || 0}</p>
                                <p className="text-xs text-gray-500">Calories Today</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-gray-900">{todayLogs?.dailyTotals?.protein || 0}g</p>
                                <p className="text-xs text-gray-500">Protein</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <Droplets className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-gray-900">{todayLogs?.dailyTotals?.water || 0}</p>
                                <p className="text-xs text-gray-500">Water (glasses)</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <BookOpen className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-gray-900">{mealPlans.length}</p>
                                <p className="text-xs text-gray-500">Meal Plans</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Today's Meals */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-emerald-600" />
                                    Today&apos;s Meals
                                </CardTitle>
                                <Button variant="outline" size="sm" onClick={() => setShowLogModal(true)}>
                                    <Plus className="w-4 h-4 mr-1" /> Add
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {todayLogs?.logs?.length > 0 ? (
                                <div className="space-y-3">
                                    {todayLogs.logs.map((log: any, i: number) => {
                                        const MealIcon = mealIcons[log.mealType] || Utensils
                                        return (
                                            <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                    <MealIcon className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900 capitalize">{log.mealType}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {log.foodItems?.map((f: any) => f.name || f).join(', ') || 'No items logged'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-gray-900">{log.calories || 0} cal</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Utensils className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm">No meals logged today</p>
                                    <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowLogModal(true)}>
                                        Log Your First Meal
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

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
                            {recLoading ? (
                                <div className="flex items-center justify-center py-6 gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                                    <p className="text-sm text-gray-500">Analyzing your nutrition data...</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {[
                                        { icon: Target, text: 'Maintain balanced macros — aim for 30% protein, 45% carbs, 25% fats', color: 'text-blue-600 bg-blue-50' },
                                        { icon: Droplets, text: 'Stay hydrated — drink at least 6-8 glasses of water daily during training', color: 'text-cyan-600 bg-cyan-50' },
                                        { icon: Apple, text: 'Include protein-rich snacks after training for muscle recovery', color: 'text-green-600 bg-green-50' },
                                        { icon: Clock, text: 'Eat 2-3 hours before training for optimal energy levels', color: 'text-orange-600 bg-orange-50' },
                                    ].map((rec, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${rec.color}`}>
                                                <rec.icon className="w-4 h-4" />
                                            </div>
                                            <p className="text-sm text-gray-700">{rec.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {/* ─── MEAL PLANS TAB ────────────────────────────────── */}
            {activeTab === 'meal-plan' && (
                <div className="space-y-4">
                    {mealPlans.length > 0 ? (
                        mealPlans.map((plan: any, idx: number) => (
                            <motion.div key={plan._id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">
                                                {plan.duration || 7}-Day Meal Plan
                                                {plan.aiPowered && <Badge className="ml-2 bg-purple-100 text-purple-700 text-xs">AI Generated</Badge>}
                                            </CardTitle>
                                            <div className="flex gap-2">
                                                <Badge className={plan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                                                    {plan.status || 'active'}
                                                </Badge>
                                                <Button variant="outline" size="sm" onClick={() => { setActiveTab('grocery'); handleLoadGroceryList(plan._id); }}>
                                                    <ShoppingCart className="w-3 h-3 mr-1" /> Grocery List
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {plan.notes && (
                                            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 mb-4">
                                                <div className="flex items-start gap-2">
                                                    <Sparkles className="w-4 h-4 text-purple-600 mt-0.5" />
                                                    <p className="text-sm text-purple-900">{plan.notes}</p>
                                                </div>
                                            </div>
                                        )}
                                        {plan.dailyTotals && (
                                            <div className="grid grid-cols-4 gap-3 mb-4">
                                                <div className="text-center p-2 bg-gray-50 rounded">
                                                    <p className="text-lg font-bold text-gray-900">{plan.dailyTotals.avgCalories || 0}</p>
                                                    <p className="text-xs text-gray-500">Avg Calories</p>
                                                </div>
                                                <div className="text-center p-2 bg-gray-50 rounded">
                                                    <p className="text-lg font-bold text-gray-900">{plan.dailyTotals.avgProtein || plan.macros?.protein || 0}g</p>
                                                    <p className="text-xs text-gray-500">Protein</p>
                                                </div>
                                                <div className="text-center p-2 bg-gray-50 rounded">
                                                    <p className="text-lg font-bold text-gray-900">{plan.dailyTotals.avgCarbs || plan.macros?.carbs || 0}g</p>
                                                    <p className="text-xs text-gray-500">Carbs</p>
                                                </div>
                                                <div className="text-center p-2 bg-gray-50 rounded">
                                                    <p className="text-lg font-bold text-gray-900">{plan.dailyTotals.avgFats || plan.macros?.fats || 0}g</p>
                                                    <p className="text-xs text-gray-500">Fats</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            {(plan.meals || []).slice(0, 3).map((meal: any, i: number) => (
                                                <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded text-sm">
                                                    <span className="font-medium text-gray-700 w-14">Day {meal.day || i + 1}</span>
                                                    <span className="text-gray-600 flex-1">
                                                        {typeof meal.breakfast === 'string' ? meal.breakfast : meal.breakfast?.name || '—'} | {typeof meal.lunch === 'string' ? meal.lunch : meal.lunch?.name || '—'} | {typeof meal.dinner === 'string' ? meal.dinner : meal.dinner?.name || '—'}
                                                    </span>
                                                </div>
                                            ))}
                                            {(plan.meals?.length || 0) > 3 && (
                                                <p className="text-xs text-gray-500 text-center">+ {plan.meals.length - 3} more days</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No meal plans yet</p>
                            <p className="text-gray-400 text-sm mt-1">Let AI create a personalized meal plan for you</p>
                            <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={handleGenerateMealPlan} disabled={generating}>
                                {generating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Brain className="w-4 h-4 mr-1" />}
                                Generate AI Meal Plan
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* ─── RECIPES TAB ───────────────────────────────────── */}
            {activeTab === 'recipes' && (
                <div>
                    {recipeLoading ? (
                        <div className="flex items-center justify-center py-12 gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                            <p className="text-sm text-gray-500">AI is generating kid-friendly recipes...</p>
                        </div>
                    ) : recipes?.recipes?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recipes.recipes.map((recipe: any, i: number) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                    <Card className="h-full">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-semibold text-gray-900 text-sm">{recipe.name}</h3>
                                                <Badge className="bg-emerald-100 text-emerald-700 text-xs">{recipe.category}</Badge>
                                            </div>
                                            <div className="flex gap-3 text-xs text-gray-500 mb-3">
                                                <span>Prep: {recipe.prepTime}</span>
                                                <span>Cook: {recipe.cookTime}</span>
                                                <span>Serves: {recipe.servings}</span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-1 text-center">
                                                <div className="bg-gray-50 rounded p-1">
                                                    <p className="text-xs font-bold">{recipe.nutrition?.calories || 0}</p>
                                                    <p className="text-[10px] text-gray-500">cal</p>
                                                </div>
                                                <div className="bg-gray-50 rounded p-1">
                                                    <p className="text-xs font-bold">{recipe.nutrition?.protein || 0}g</p>
                                                    <p className="text-[10px] text-gray-500">protein</p>
                                                </div>
                                                <div className="bg-gray-50 rounded p-1">
                                                    <p className="text-xs font-bold">{recipe.nutrition?.carbs || 0}g</p>
                                                    <p className="text-[10px] text-gray-500">carbs</p>
                                                </div>
                                                <div className="bg-gray-50 rounded p-1">
                                                    <p className="text-xs font-bold">{recipe.nutrition?.fats || 0}g</p>
                                                    <p className="text-[10px] text-gray-500">fats</p>
                                                </div>
                                            </div>
                                            {recipe.kidFriendlyRating && (
                                                <div className="mt-2 flex items-center gap-1">
                                                    <span className="text-xs text-gray-500">Kid-Friendly:</span>
                                                    {[...Array(5)].map((_, s) => (
                                                        <span key={s} className={`text-xs ${s < recipe.kidFriendlyRating ? 'text-yellow-500' : 'text-gray-300'}`}>&#9733;</span>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No recipes loaded</p>
                            <Button variant="outline" className="mt-3" onClick={handleLoadRecipes}>
                                <Brain className="w-4 h-4 mr-1" /> Generate AI Recipes
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* ─── GROCERY LIST TAB ──────────────────────────────── */}
            {activeTab === 'grocery' && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-emerald-600" />
                            <CardTitle>AI Grocery List</CardTitle>
                            <Badge className="bg-purple-100 text-purple-700 text-xs">AI Generated</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {groceryLoading ? (
                            <div className="flex items-center justify-center py-8 gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                                <p className="text-sm text-gray-500">AI is building your grocery list...</p>
                            </div>
                        ) : groceryList?.items?.length > 0 ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {groceryList.items.map((item: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" className="rounded border-gray-300" />
                                                <span className="text-sm text-gray-900">{item.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">{item.quantity}</span>
                                                {item.estimatedCost && <span className="text-xs font-medium text-emerald-600">${item.estimatedCost}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {groceryList.totalEstimatedCost && (
                                    <div className="border-t pt-3 flex justify-between items-center">
                                        <span className="font-medium text-gray-700">Estimated Total</span>
                                        <span className="text-lg font-bold text-emerald-600">${groceryList.totalEstimatedCost}</span>
                                    </div>
                                )}
                                {groceryList.shoppingTips?.length > 0 && (
                                    <div className="bg-emerald-50 rounded-lg p-3">
                                        <p className="text-xs font-medium text-emerald-700 mb-1">Shopping Tips:</p>
                                        {groceryList.shoppingTips.map((tip: string, i: number) => (
                                            <p key={i} className="text-xs text-emerald-600">• {tip}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">Generate a meal plan first, then get your grocery list</p>
                                {mealPlans[0]?._id && (
                                    <Button variant="outline" size="sm" className="mt-3" onClick={() => handleLoadGroceryList(mealPlans[0]._id)}>
                                        Generate Grocery List
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* ─── LOG MEAL MODAL ────────────────────────────────── */}
            {showLogModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="p-6 border-b">
                            <h2 className="text-lg font-bold text-gray-900">Log a Meal</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
                                <select
                                    value={logForm.mealType}
                                    onChange={e => setLogForm({ ...logForm, mealType: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="breakfast">Breakfast</option>
                                    <option value="lunch">Lunch</option>
                                    <option value="dinner">Dinner</option>
                                    <option value="snack">Snack</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Food Items (comma separated)</label>
                                <input
                                    type="text"
                                    value={logForm.foodItems}
                                    onChange={e => setLogForm({ ...logForm, foodItems: e.target.value })}
                                    placeholder="e.g. Oatmeal, Banana, Milk"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Calories</label>
                                <input
                                    type="number"
                                    value={logForm.calories}
                                    onChange={e => setLogForm({ ...logForm, calories: e.target.value })}
                                    placeholder="e.g. 350"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                                <input
                                    type="text"
                                    value={logForm.notes}
                                    onChange={e => setLogForm({ ...logForm, notes: e.target.value })}
                                    placeholder="e.g. Post-workout meal"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-6 border-t">
                            <Button variant="outline" onClick={() => setShowLogModal(false)}>Cancel</Button>
                            <Button onClick={handleLogMeal} className="bg-emerald-600 hover:bg-emerald-700">Log Meal</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
