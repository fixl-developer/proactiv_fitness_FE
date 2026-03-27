'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    Brain, Sparkles, Loader2, RefreshCw, Utensils, Droplets,
    ShoppingCart, BookOpen, Target, TrendingUp, Plus, Calendar,
    Apple, Coffee, Sun, Moon, Clock, ChevronRight, AlertCircle, X, Check
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/services/api/client'

// ── Fallback data used when API is unavailable ──────────────────────────

const FALLBACK_RECOMMENDATIONS = [
    { icon: Droplets, text: 'Stay hydrated -- drink at least 8 glasses of water daily, more during training sessions.', color: 'text-cyan-600 bg-cyan-50' },
    { icon: Target, text: 'Aim for 1.2-1.6g of protein per kg of body weight to support muscle recovery.', color: 'text-blue-600 bg-blue-50' },
    { icon: Apple, text: 'Eat a balanced pre-workout meal 2-3 hours before exercise: complex carbs + lean protein.', color: 'text-green-600 bg-green-50' },
    { icon: Clock, text: 'Post-workout, eat within 30-60 minutes -- a protein shake or chicken with rice works well.', color: 'text-orange-600 bg-orange-50' },
    { icon: Sun, text: 'Include fruits and vegetables in every meal for essential vitamins and minerals.', color: 'text-yellow-600 bg-yellow-50' },
    { icon: Moon, text: 'Avoid heavy meals close to bedtime. A light snack with casein protein supports overnight recovery.', color: 'text-indigo-600 bg-indigo-50' },
]

const FALLBACK_RECIPES = [
    {
        name: 'Banana Protein Pancakes',
        category: 'Breakfast',
        prepTime: '5 min',
        cookTime: '10 min',
        servings: 2,
        nutrition: { calories: 320, protein: 24, carbs: 38, fats: 8 },
        kidFriendlyRating: 5,
        ingredients: ['1 banana', '2 eggs', '1 scoop protein powder', '1/4 cup oats'],
        instructions: 'Blend all ingredients. Cook on a non-stick pan over medium heat until bubbles form, then flip.',
    },
    {
        name: 'Chicken & Rice Power Bowl',
        category: 'Lunch',
        prepTime: '10 min',
        cookTime: '20 min',
        servings: 1,
        nutrition: { calories: 520, protein: 42, carbs: 55, fats: 12 },
        kidFriendlyRating: 4,
        ingredients: ['150g chicken breast', '1 cup brown rice', 'mixed vegetables', 'soy sauce'],
        instructions: 'Cook rice. Grill chicken seasoned with salt and pepper. Stir-fry veggies. Combine in a bowl with soy sauce.',
    },
    {
        name: 'Greek Yogurt Parfait',
        category: 'Snack',
        prepTime: '5 min',
        cookTime: '0 min',
        servings: 1,
        nutrition: { calories: 280, protein: 20, carbs: 35, fats: 6 },
        kidFriendlyRating: 5,
        ingredients: ['200g Greek yogurt', '1/4 cup granola', 'mixed berries', '1 tsp honey'],
        instructions: 'Layer yogurt, granola, and berries in a glass. Drizzle with honey.',
    },
    {
        name: 'Tuna Pasta Salad',
        category: 'Lunch',
        prepTime: '10 min',
        cookTime: '12 min',
        servings: 2,
        nutrition: { calories: 410, protein: 32, carbs: 48, fats: 10 },
        kidFriendlyRating: 3,
        ingredients: ['200g whole wheat pasta', '1 can tuna', 'cherry tomatoes', 'olive oil', 'lemon juice'],
        instructions: 'Cook pasta and cool. Mix with drained tuna, halved tomatoes, olive oil, and lemon juice.',
    },
    {
        name: 'Overnight Oats',
        category: 'Breakfast',
        prepTime: '5 min',
        cookTime: '0 min',
        servings: 1,
        nutrition: { calories: 350, protein: 18, carbs: 52, fats: 8 },
        kidFriendlyRating: 4,
        ingredients: ['1/2 cup oats', '1/2 cup milk', '1 scoop protein powder', 'chia seeds', 'banana slices'],
        instructions: 'Mix oats, milk, protein powder, and chia seeds in a jar. Refrigerate overnight. Top with banana.',
    },
    {
        name: 'Sweet Potato & Black Bean Bowl',
        category: 'Dinner',
        prepTime: '10 min',
        cookTime: '25 min',
        servings: 2,
        nutrition: { calories: 440, protein: 18, carbs: 62, fats: 10 },
        kidFriendlyRating: 3,
        ingredients: ['2 sweet potatoes', '1 can black beans', 'avocado', 'lime', 'cumin'],
        instructions: 'Roast diced sweet potatoes at 200C for 25 min. Warm beans with cumin. Serve with avocado and lime.',
    },
]

const FALLBACK_GROCERY_ITEMS = [
    { name: 'Chicken breast', quantity: '500g', category: 'Protein', checked: false },
    { name: 'Brown rice', quantity: '1 kg', category: 'Grains', checked: false },
    { name: 'Bananas', quantity: '6 pcs', category: 'Fruits', checked: false },
    { name: 'Greek yogurt', quantity: '500g', category: 'Dairy', checked: false },
    { name: 'Eggs', quantity: '12 pcs', category: 'Protein', checked: false },
    { name: 'Oats', quantity: '500g', category: 'Grains', checked: false },
    { name: 'Mixed berries', quantity: '300g', category: 'Fruits', checked: false },
    { name: 'Sweet potatoes', quantity: '4 pcs', category: 'Vegetables', checked: false },
    { name: 'Broccoli', quantity: '1 head', category: 'Vegetables', checked: false },
    { name: 'Whole wheat pasta', quantity: '500g', category: 'Grains', checked: false },
    { name: 'Tuna cans', quantity: '3 cans', category: 'Protein', checked: false },
    { name: 'Olive oil', quantity: '1 bottle', category: 'Pantry', checked: false },
    { name: 'Protein powder', quantity: '1 tub', category: 'Supplements', checked: false },
    { name: 'Milk', quantity: '1 L', category: 'Dairy', checked: false },
]

function generateLocalMealPlan(): any {
    const meals = []
    const breakfasts = ['Oatmeal with berries', 'Banana protein pancakes', 'Scrambled eggs & toast', 'Overnight oats', 'Yogurt parfait', 'Whole wheat waffles', 'Smoothie bowl']
    const lunches = ['Chicken & rice bowl', 'Tuna pasta salad', 'Turkey wrap', 'Grilled chicken salad', 'Quinoa veggie bowl', 'Pasta with meat sauce', 'Fish tacos']
    const dinners = ['Grilled salmon & veggies', 'Sweet potato & black bean bowl', 'Chicken stir-fry', 'Lean beef & broccoli', 'Baked chicken & potatoes', 'Shrimp pasta', 'Turkey meatballs & rice']

    for (let i = 0; i < 7; i++) {
        meals.push({
            day: i + 1,
            breakfast: breakfasts[i],
            lunch: lunches[i],
            dinner: dinners[i],
        })
    }

    return {
        _id: `local-${Date.now()}`,
        duration: 7,
        status: 'active',
        aiPowered: false,
        notes: 'Locally generated meal plan based on balanced nutrition principles. Connect to the server for AI-powered personalized plans.',
        dailyTotals: {
            avgCalories: 2100,
            avgProtein: 130,
            avgCarbs: 240,
            avgFats: 70,
        },
        meals,
        createdAt: new Date().toISOString(),
    }
}

// ── Loading skeleton component ──────────────────────────────────────────

function LoadingSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
                <div>
                    <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-72 bg-gray-100 rounded" />
                </div>
                <div className="flex gap-2">
                    <div className="h-9 w-24 bg-gray-200 rounded" />
                    <div className="h-9 w-40 bg-gray-200 rounded" />
                </div>
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex-1 h-9 bg-gray-200 rounded-md" />
                ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <Card key={i}><CardContent className="p-4"><div className="h-20 bg-gray-100 rounded" /></CardContent></Card>
                ))}
            </div>
            <Card><CardContent className="p-6"><div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-lg" />)}</div></CardContent></Card>
        </div>
    )
}

// ── Main page component ─────────────────────────────────────────────────

export default function NutritionPage() {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'overview' | 'meal-plan' | 'recipes' | 'grocery'>('overview')

    // Data states
    const [mealPlans, setMealPlans] = useState<any[]>([])
    const [todayLogs, setTodayLogs] = useState<any>(null)
    const [recipes, setRecipes] = useState<any[]>([])
    const [groceryItems, setGroceryItems] = useState<any[]>([])

    // UI states
    const [generating, setGenerating] = useState(false)
    const [recipeLoading, setRecipeLoading] = useState(false)
    const [groceryLoading, setGroceryLoading] = useState(false)
    const [usingFallback, setUsingFallback] = useState(false)

    // Log meal modal
    const [showLogModal, setShowLogModal] = useState(false)
    const [logForm, setLogForm] = useState({
        mealName: '',
        mealType: 'breakfast',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
    })
    const [logSaving, setLogSaving] = useState(false)

    // Recipe detail modal
    const [selectedRecipe, setSelectedRecipe] = useState<any>(null)

    const childId = user?.id || ''

    // ── Data loading ────────────────────────────────────────────────────

    const loadData = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const [plansRes, logsRes] = await Promise.allSettled([
                apiClient.get<any>('/smart-nutrition/meal-plans').catch(() => apiClient.get<any>('/nutrition/meal-plans')),
                apiClient.get<any>('/smart-nutrition/logs/today').catch(() => apiClient.get<any>(`/nutrition/logs/today`)),
            ])

            if (plansRes.status === 'fulfilled') {
                const plans = plansRes.value?.data || plansRes.value || []
                setMealPlans(Array.isArray(plans) ? plans : [])
            } else {
                setMealPlans([])
            }

            if (logsRes.status === 'fulfilled') {
                setTodayLogs(logsRes.value?.data || logsRes.value || null)
            } else {
                setTodayLogs(null)
            }

            setUsingFallback(plansRes.status === 'rejected' && logsRes.status === 'rejected')
        } catch (err) {
            console.error('Failed to load nutrition data:', err)
            setError('Unable to connect to the nutrition service.')
            setUsingFallback(true)
        } finally {
            setIsLoading(false)
        }
    }, [childId])

    const handleGenerateMealPlan = async () => {
        setGenerating(true)
        try {
            const payload = {
                childId,
                duration: 7,
                activityLevel: 'moderate',
                dietaryRestrictions: [],
                goals: ['general health', 'athletic performance'],
            }
            const result = await apiClient.post<any>('/smart-nutrition/generate-meal-plan', payload)
                .catch(() => apiClient.post<any>('/nutrition/meal-plans/generate', payload))
            const plan = result?.data || result
            if (plan) {
                setMealPlans(prev => [plan, ...prev])
            }
        } catch (err) {
            console.warn('API meal plan generation failed, creating local plan:', err)
            const localPlan = generateLocalMealPlan()
            setMealPlans(prev => [localPlan, ...prev])
        } finally {
            setGenerating(false)
        }
    }

    const handleLoadRecipes = async () => {
        setRecipeLoading(true)
        try {
            const res = await apiClient.get<any>('/smart-nutrition/recipes').catch(() => apiClient.get<any>('/nutrition/recipes'))
            const data = res?.data || res?.recipes || res
            if (Array.isArray(data) && data.length > 0) {
                setRecipes(data)
            } else {
                setRecipes(FALLBACK_RECIPES)
            }
        } catch {
            console.warn('Recipes API unavailable, using fallback recipes.')
            setRecipes(FALLBACK_RECIPES)
        } finally {
            setRecipeLoading(false)
        }
    }

    const handleLoadGroceryList = async (planId?: string) => {
        setGroceryLoading(true)
        try {
            const smartUrl = planId ? `/smart-nutrition/grocery-list/${planId}` : '/smart-nutrition/grocery-list'
            const stubUrl = planId ? `/nutrition/grocery-list/${planId}` : '/nutrition/grocery-list'
            const res = await apiClient.get<any>(smartUrl).catch(() => apiClient.get<any>(stubUrl))
            const items = res?.data?.items || res?.items || res?.data || res
            if (Array.isArray(items) && items.length > 0) {
                setGroceryItems(items.map((item: any) => ({ ...item, checked: false })))
            } else {
                setGroceryItems(FALLBACK_GROCERY_ITEMS)
            }
        } catch {
            console.warn('Grocery API unavailable, using fallback list.')
            setGroceryItems(FALLBACK_GROCERY_ITEMS)
        } finally {
            setGroceryLoading(false)
        }
    }

    const handleLogMeal = async () => {
        if (!logForm.mealName.trim()) return
        setLogSaving(true)

        const mealData = {
            childId,
            studentId: childId,
            mealType: logForm.mealType,
            mealName: logForm.mealName,
            foodItems: [{ name: logForm.mealName }],
            calories: parseInt(logForm.calories) || 0,
            protein: parseInt(logForm.protein) || 0,
            carbs: parseInt(logForm.carbs) || 0,
            fats: parseInt(logForm.fats) || 0,
            date: new Date().toISOString(),
        }

        try {
            await apiClient.post('/smart-nutrition/logs', mealData).catch(() => apiClient.post('/nutrition/logs', mealData))
            setShowLogModal(false)
            setLogForm({ mealName: '', mealType: 'breakfast', calories: '', protein: '', carbs: '', fats: '' })
            loadData()
        } catch (err) {
            console.warn('Failed to log meal via API, saving locally:', err)
            // Save locally so the UI updates even when API is down
            const localLog = {
                mealType: logForm.mealType,
                foodItems: [{ name: logForm.mealName }],
                calories: parseInt(logForm.calories) || 0,
                protein: parseInt(logForm.protein) || 0,
                carbs: parseInt(logForm.carbs) || 0,
                fats: parseInt(logForm.fats) || 0,
            }
            setTodayLogs((prev: any) => ({
                ...prev,
                logs: [...(prev?.logs || []), localLog],
                dailyTotals: {
                    calories: (prev?.dailyTotals?.calories || 0) + (parseInt(logForm.calories) || 0),
                    protein: (prev?.dailyTotals?.protein || 0) + (parseInt(logForm.protein) || 0),
                    water: prev?.dailyTotals?.water || 0,
                },
            }))
            setShowLogModal(false)
            setLogForm({ mealName: '', mealType: 'breakfast', calories: '', protein: '', carbs: '', fats: '' })
        } finally {
            setLogSaving(false)
        }
    }

    const toggleGroceryItem = (index: number) => {
        setGroceryItems(prev => prev.map((item, i) => i === index ? { ...item, checked: !item.checked } : item))
    }

    useEffect(() => {
        loadData()
    }, [loadData])

    const mealIcons: Record<string, any> = {
        breakfast: Sun, lunch: Coffee, dinner: Moon, snack: Apple,
    }

    // ── Loading state ───────────────────────────────────────────────────

    if (isLoading) {
        return <LoadingSkeleton />
    }

    // ── Error state with retry ──────────────────────────────────────────

    if (error && !usingFallback) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <AlertCircle className="w-12 h-12 text-red-400" />
                <p className="text-gray-700 font-medium">{error}</p>
                <Button onClick={loadData} variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" /> Retry
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Fallback banner */}
            {usingFallback && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <p className="text-sm text-amber-800">
                        Nutrition service is currently unavailable. Showing offline recommendations and local data.
                    </p>
                    <Button size="sm" variant="outline" className="ml-auto flex-shrink-0" onClick={loadData}>
                        <RefreshCw className="w-3 h-3 mr-1" /> Retry
                    </Button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Smart Nutrition</h1>
                    <p className="text-gray-600 mt-1">
                        Meal plans, tracking &amp; recommendations
                        {!usingFallback && <Badge className="ml-2 bg-purple-100 text-purple-700 text-xs">Online</Badge>}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadData}>
                        <RefreshCw className="w-4 h-4 mr-1" /> Refresh
                    </Button>
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
                            if (tab === 'recipes' && recipes.length === 0) handleLoadRecipes()
                            if (tab === 'grocery' && groceryItems.length === 0) handleLoadGroceryList(mealPlans[0]?._id)
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

                    {/* Nutrition Recommendations (always available via fallback) */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Brain className="w-5 h-5 text-purple-600" />
                                <CardTitle>Nutrition Recommendations</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {FALLBACK_RECOMMENDATIONS.map((rec, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${rec.color}`}>
                                            <rec.icon className="w-4 h-4" />
                                        </div>
                                        <p className="text-sm text-gray-700">{rec.text}</p>
                                    </div>
                                ))}
                            </div>
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
                                                        {typeof meal.breakfast === 'string' ? meal.breakfast : meal.breakfast?.name || '--'} | {typeof meal.lunch === 'string' ? meal.lunch : meal.lunch?.name || '--'} | {typeof meal.dinner === 'string' ? meal.dinner : meal.dinner?.name || '--'}
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
                            <p className="text-gray-400 text-sm mt-1">Create a personalized meal plan to get started</p>
                            <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={handleGenerateMealPlan} disabled={generating}>
                                {generating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Brain className="w-4 h-4 mr-1" />}
                                Generate Meal Plan
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* ─── RECIPES TAB ───────────────────────────────────── */}
            {activeTab === 'recipes' && (
                <div>
                    {recipeLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <Card key={i}><CardContent className="p-4 animate-pulse"><div className="h-32 bg-gray-100 rounded" /></CardContent></Card>
                            ))}
                        </div>
                    ) : recipes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recipes.map((recipe: any, i: number) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                    <Card className="h-full cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedRecipe(recipe)}>
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
                                            <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                                                View details <ChevronRight className="w-3 h-3" />
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No recipes loaded yet</p>
                            <Button variant="outline" className="mt-3" onClick={handleLoadRecipes}>
                                <BookOpen className="w-4 h-4 mr-1" /> Load Recipes
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* ─── GROCERY LIST TAB ──────────────────────────────── */}
            {activeTab === 'grocery' && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                                <CardTitle>Grocery List</CardTitle>
                                {groceryItems.length > 0 && (
                                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                                        {groceryItems.filter(i => i.checked).length}/{groceryItems.length} done
                                    </Badge>
                                )}
                            </div>
                            {groceryItems.length > 0 && (
                                <Button variant="outline" size="sm" onClick={() => handleLoadGroceryList(mealPlans[0]?._id)}>
                                    <RefreshCw className="w-3 h-3 mr-1" /> Refresh
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {groceryLoading ? (
                            <div className="space-y-2 animate-pulse">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-10 bg-gray-100 rounded" />
                                ))}
                            </div>
                        ) : groceryItems.length > 0 ? (
                            <div className="space-y-4">
                                {groceryItems.length > 0 && (
                                    <Progress
                                        value={(groceryItems.filter(i => i.checked).length / groceryItems.length) * 100}
                                        className="h-2"
                                    />
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {groceryItems.map((item: any, i: number) => (
                                        <div
                                            key={i}
                                            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${item.checked ? 'bg-emerald-50' : 'bg-gray-50 hover:bg-gray-100'}`}
                                            onClick={() => toggleGroceryItem(i)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                                                    {item.checked && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                                <span className={`text-sm ${item.checked ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{item.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">{item.quantity}</span>
                                                {item.category && (
                                                    <Badge variant="outline" className="text-[10px] px-1 py-0">{item.category}</Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">No grocery list yet</p>
                                <p className="text-gray-400 text-xs mt-1">Generate a meal plan first, or load a default list</p>
                                <div className="flex justify-center gap-2 mt-3">
                                    <Button variant="outline" size="sm" onClick={() => handleLoadGroceryList()}>
                                        Load Grocery List
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setGroceryItems(FALLBACK_GROCERY_ITEMS)}>
                                        Use Sample List
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* ─── LOG MEAL MODAL ────────────────────────────────── */}
            {showLogModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowLogModal(false) }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
                    >
                        <div className="p-6 border-b flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Log a Meal</h2>
                            <button onClick={() => setShowLogModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meal Name *</label>
                                <input
                                    type="text"
                                    value={logForm.mealName}
                                    onChange={e => setLogForm({ ...logForm, mealName: e.target.value })}
                                    placeholder="e.g. Grilled chicken with rice"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
                                <select
                                    value={logForm.mealType}
                                    onChange={e => setLogForm({ ...logForm, mealType: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                >
                                    <option value="breakfast">Breakfast</option>
                                    <option value="lunch">Lunch</option>
                                    <option value="dinner">Dinner</option>
                                    <option value="snack">Snack</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
                                    <input
                                        type="number"
                                        value={logForm.calories}
                                        onChange={e => setLogForm({ ...logForm, calories: e.target.value })}
                                        placeholder="e.g. 450"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
                                    <input
                                        type="number"
                                        value={logForm.protein}
                                        onChange={e => setLogForm({ ...logForm, protein: e.target.value })}
                                        placeholder="e.g. 30"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Carbs (g)</label>
                                    <input
                                        type="number"
                                        value={logForm.carbs}
                                        onChange={e => setLogForm({ ...logForm, carbs: e.target.value })}
                                        placeholder="e.g. 50"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fats (g)</label>
                                    <input
                                        type="number"
                                        value={logForm.fats}
                                        onChange={e => setLogForm({ ...logForm, fats: e.target.value })}
                                        placeholder="e.g. 15"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-6 border-t">
                            <Button variant="outline" onClick={() => setShowLogModal(false)}>Cancel</Button>
                            <Button
                                onClick={handleLogMeal}
                                disabled={!logForm.mealName.trim() || logSaving}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                {logSaving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                                {logSaving ? 'Saving...' : 'Log Meal'}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* ─── RECIPE DETAIL MODAL ───────────────────────────── */}
            {selectedRecipe && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setSelectedRecipe(null) }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
                    >
                        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{selectedRecipe.name}</h2>
                                <Badge className="bg-emerald-100 text-emerald-700 text-xs mt-1">{selectedRecipe.category}</Badge>
                            </div>
                            <button onClick={() => setSelectedRecipe(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            {/* Quick info */}
                            <div className="flex gap-4 text-sm text-gray-600">
                                <span>Prep: {selectedRecipe.prepTime}</span>
                                <span>Cook: {selectedRecipe.cookTime}</span>
                                <span>Serves: {selectedRecipe.servings}</span>
                            </div>

                            {/* Macros */}
                            <div className="grid grid-cols-4 gap-2 text-center">
                                <div className="bg-orange-50 rounded-lg p-2">
                                    <p className="text-sm font-bold text-orange-700">{selectedRecipe.nutrition?.calories || 0}</p>
                                    <p className="text-xs text-orange-600">cal</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-2">
                                    <p className="text-sm font-bold text-blue-700">{selectedRecipe.nutrition?.protein || 0}g</p>
                                    <p className="text-xs text-blue-600">protein</p>
                                </div>
                                <div className="bg-yellow-50 rounded-lg p-2">
                                    <p className="text-sm font-bold text-yellow-700">{selectedRecipe.nutrition?.carbs || 0}g</p>
                                    <p className="text-xs text-yellow-600">carbs</p>
                                </div>
                                <div className="bg-pink-50 rounded-lg p-2">
                                    <p className="text-sm font-bold text-pink-700">{selectedRecipe.nutrition?.fats || 0}g</p>
                                    <p className="text-xs text-pink-600">fats</p>
                                </div>
                            </div>

                            {/* Ingredients */}
                            {selectedRecipe.ingredients && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Ingredients</h3>
                                    <ul className="space-y-1">
                                        {selectedRecipe.ingredients.map((ing: string, i: number) => (
                                            <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full flex-shrink-0" />
                                                {ing}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Instructions */}
                            {selectedRecipe.instructions && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
                                    <p className="text-sm text-gray-700 leading-relaxed">{selectedRecipe.instructions}</p>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t">
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => setSelectedRecipe(null)}>
                                Close
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
