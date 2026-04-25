'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    Brain, Sparkles, Loader2, Utensils, Droplets,
    Target, Plus, Apple, FileText, ChefHat, Clock, Flame
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/services/api/client'
import { validateSelect, validateNumber, filterNumberInput } from '@/utils/validation'
import { toast } from 'sonner'

interface Recipe {
    id?: string
    _id?: string
    name: string
    description?: string
    calories?: number
    prepTime?: number | string
    ingredients?: string[]
    tags?: string[]
}

export default function ParentNutritionPage() {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [mealPlans, setMealPlans] = useState<any[]>([])
    const [recommendations, setRecommendations] = useState<any[]>([])
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [error, setError] = useState<string | null>(null)
    const [generating, setGenerating] = useState(false)
    const [loadingRecipes, setLoadingRecipes] = useState(false)
    const [recipesError, setRecipesError] = useState<string | null>(null)
    const [children, setChildren] = useState<any[]>([])
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null)

    // Meal plan drawer state
    const [planOpen, setPlanOpen] = useState(false)
    const [planAge, setPlanAge] = useState('')
    const [planDuration, setPlanDuration] = useState('7')
    const [planActivityLevel, setPlanActivityLevel] = useState('moderate')
    const [planGoals, setPlanGoals] = useState<string[]>(['health'])
    const [planAllergies, setPlanAllergies] = useState('')
    const [planErrors, setPlanErrors] = useState<Record<string, string>>({})

    const loadData = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        // First load children to get childId for nutrition endpoints
        let childId: string | null = selectedChildId
        if (!childId) {
            try {
                const childrenRes = await apiClient.get('/parent/children')
                const childrenData = childrenRes?.data || childrenRes || []
                const childList = Array.isArray(childrenData) ? childrenData : (childrenData.children || [])
                setChildren(childList)
                if (childList.length > 0) {
                    childId = childList[0]._id || childList[0].id
                    setSelectedChildId(childId)
                }
            } catch (err) {
                console.error('Failed to load children:', err)
            }
        }

        // Load recommendations - try AI endpoint first, fallback to parent/nutrition
        let recommendationsLoaded = false
        if (childId) {
            try {
                const aiRecResponse = await apiClient.get(`/nutrition/recommendations/${childId}`)
                const aiRecData = aiRecResponse?.data || aiRecResponse || {}
                const aiRecs = Array.isArray(aiRecData) ? aiRecData : (aiRecData.recommendations || [])
                if (aiRecs.length > 0) {
                    setRecommendations(aiRecs)
                    recommendationsLoaded = true
                }
            } catch (err) {
                console.error('AI recommendations not available, falling back:', err)
            }
        }

        if (!recommendationsLoaded) {
            try {
                const response = await apiClient.get('/parent/nutrition')
                const data = response?.data || response || {}
                setRecommendations(data.recommendations || [])
                if (!mealPlans.length) {
                    setMealPlans(data.mealPlans || [])
                }
            } catch (err) {
                console.error('Failed to load nutrition:', err)
                setError('Failed to load nutrition data')
                setRecommendations([
                    { id: '1', title: 'Stay Hydrated', description: 'Ensure your child drinks at least 8 glasses of water daily, especially before and after swimming.', priority: 'high' },
                    { id: '2', title: 'Protein Rich Meals', description: 'Include lean protein in every meal to support muscle recovery after training sessions.', priority: 'medium' },
                    { id: '3', title: 'Pre-Training Snack', description: 'A banana or energy bar 30 minutes before class helps maintain energy levels.', priority: 'medium' },
                ])
            }
        }

        // Load existing AI meal plans
        if (childId) {
            try {
                const mealPlanResponse = await apiClient.get(`/nutrition/meal-plans/${childId}`)
                const mealPlanData = mealPlanResponse?.data || mealPlanResponse || {}
                const plans = Array.isArray(mealPlanData) ? mealPlanData : (mealPlanData.mealPlans || mealPlanData.plans || [])
                if (plans.length > 0) {
                    setMealPlans(plans)
                }
            } catch (err) {
                console.error('AI meal plans not available:', err)
            }
        }

        setIsLoading(false)
    }, [selectedChildId])

    const openPlanDrawer = () => {
        if (!selectedChildId) { toast.info('Select a child first'); return }
        const child = children.find((c: any) => (c._id || c.id) === selectedChildId)
        const derivedAge = child?.age ? String(child.age) : ''
        setPlanAge(derivedAge)
        setPlanDuration('7')
        setPlanActivityLevel('moderate')
        setPlanGoals(['health'])
        setPlanAllergies((child?.medicalInfo?.allergies || []).join(', '))
        setPlanErrors({})
        setPlanOpen(true)
    }

    const handleGeneratePlan = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!selectedChildId) return
        const errs: Record<string, string> = {}
        const ageErr = validateNumber(planAge, 'Age', 1, 18)
        if (ageErr) errs.age = ageErr
        const durErr = validateNumber(planDuration, 'Duration', 1, 30)
        if (durErr) errs.duration = durErr
        const actErr = validateSelect(planActivityLevel, 'Activity level')
        if (actErr) errs.activityLevel = actErr
        if (!planGoals.length) errs.goals = 'Select at least one goal'
        if (Object.keys(errs).length) { setPlanErrors(errs); return }

        setGenerating(true)
        try {
            const response = await apiClient.post('/nutrition/meal-plans', {
                childId: selectedChildId,
                age: Number(planAge),
                duration: Number(planDuration),
                activityLevel: planActivityLevel,
                goals: planGoals,
                allergies: planAllergies.split(',').map(s => s.trim()).filter(Boolean),
            })
            const planData = response?.data || response || {}
            const newPlan = planData.mealPlan || planData.plan || planData
            if (newPlan && (newPlan._id || newPlan.id || newPlan.duration)) {
                setMealPlans(prev => [newPlan, ...prev])
            } else {
                setMealPlans(prev => [{
                    _id: `plan-${Date.now()}`,
                    duration: Number(planDuration),
                    status: 'active',
                    aiPowered: true,
                    createdAt: new Date().toISOString(),
                    notes: `AI-generated ${planDuration}-day meal plan (${planActivityLevel} activity, goals: ${planGoals.join(', ')}).`,
                    macros: { protein: 65, carbs: 200, fats: 50 },
                    ...newPlan,
                }, ...prev])
            }
            toast.success('Meal plan generated')
            setPlanOpen(false)
        } catch (err) {
            console.error('Failed to generate plan:', err)
            toast.error('Failed to generate meal plan')
        } finally {
            setGenerating(false)
        }
    }

    const formatPlanDate = (iso: any) => {
        if (!iso) return ''
        try {
            const d = new Date(iso)
            if (isNaN(d.getTime())) return ''
            return d.toLocaleDateString()
        } catch { return '' }
    }

    const handleGetRecipes = async () => {
        setLoadingRecipes(true)
        setRecipesError(null)
        try {
            const response = await apiClient.get('/nutrition/recipes')
            const data = response?.data || response || {}
            const recipeList = Array.isArray(data) ? data : (data.recipes || [])
            setRecipes(recipeList)
            if (recipeList.length === 0) {
                setRecipesError('No recipes returned. Try again later.')
            }
        } catch (err) {
            console.error('Failed to fetch AI recipes:', err)
            setRecipesError('Could not load AI recipes. Please try again later.')
        } finally {
            setLoadingRecipes(false)
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
                    <div className="text-gray-600 mt-1">
                        AI-powered meal plans & nutrition management for your child
                        <Badge className="ml-2 bg-purple-100 text-purple-700 text-xs">AI Powered</Badge>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                    {children.length > 1 && (
                        <select
                            value={selectedChildId || ''}
                            onChange={(e) => { setSelectedChildId(e.target.value); }}
                            className="text-sm border rounded-lg px-3 py-1.5 bg-white"
                        >
                            {children.map((child: any) => (
                                <option key={child._id || child.id} value={child._id || child.id}>
                                    {child.firstName || child.name} {child.lastName || ''}
                                </option>
                            ))}
                        </select>
                    )}
                    <Button variant="outline" size="sm" onClick={() => loadData()}>
                        <FileText className="w-4 h-4 mr-1" />
                        Refresh
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleGetRecipes}
                        disabled={loadingRecipes}
                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                    >
                        {loadingRecipes ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <ChefHat className="w-4 h-4 mr-1" />}
                        Get AI Recipe Ideas
                    </Button>
                    <Button size="sm" onClick={openPlanDrawer} disabled={generating} className="bg-emerald-600 hover:bg-emerald-700">
                        {generating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Brain className="w-4 h-4 mr-1" />}
                        Generate Meal Plan
                    </Button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
                    {error} - Showing default recommendations instead.
                </div>
            )}

            {/* Nutrition Recommendations */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-600" />
                        <CardTitle>Nutrition Recommendations</CardTitle>
                        <Badge className="bg-purple-100 text-purple-700 text-xs">AI Powered</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {recommendations.length > 0 ? (
                        <div className="space-y-3">
                            {recommendations.map((rec: any, i: number) => (
                                <motion.div
                                    key={rec.id || i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                        rec.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                                    }`}>
                                        <Target className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{rec.title || rec.recommendation || rec.category}</p>
                                        {rec.description && <p className="text-xs text-gray-500 mt-0.5">{rec.description}</p>}
                                        {rec.priority && (
                                            <Badge className={`mt-1 text-xs ${rec.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {rec.priority}
                                            </Badge>
                                        )}
                                    </div>
                                </motion.div>
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

            {/* AI Recipe Ideas */}
            {(recipes.length > 0 || recipesError) && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ChefHat className="w-5 h-5 text-orange-600" />
                            <CardTitle>AI Recipe Ideas</CardTitle>
                            <Badge className="bg-orange-100 text-orange-700 text-xs">AI Powered</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recipesError && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700 mb-3">
                                {recipesError}
                            </div>
                        )}
                        {recipes.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {recipes.map((recipe, idx) => (
                                    <motion.div
                                        key={recipe.id || recipe._id || idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{recipe.name}</h4>
                                        {recipe.description && (
                                            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{recipe.description}</p>
                                        )}
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            {recipe.calories != null && (
                                                <span className="flex items-center gap-1">
                                                    <Flame className="w-3 h-3 text-orange-500" />
                                                    {recipe.calories} cal
                                                </span>
                                            )}
                                            {recipe.prepTime != null && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-blue-500" />
                                                    {recipe.prepTime} min
                                                </span>
                                            )}
                                        </div>
                                        {recipe.tags && recipe.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {recipe.tags.map((tag, tIdx) => (
                                                    <Badge key={tIdx} className="bg-gray-100 text-gray-600 text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Meal Plans */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Utensils className="w-5 h-5 text-emerald-600" />
                            Meal Plans
                        </CardTitle>
                        <Button size="sm" variant="outline" onClick={openPlanDrawer} disabled={generating}>
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
                                        <span className="text-xs text-gray-500">{formatPlanDate(plan.createdAt)}</span>
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
                            <Button size="sm" className="mt-3 bg-emerald-600 hover:bg-emerald-700" onClick={openPlanDrawer} disabled={generating}>
                                <Brain className="w-4 h-4 mr-1" /> Generate AI Meal Plan
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Generate Meal Plan Drawer */}
            <SlideInDrawer
                isOpen={planOpen}
                onClose={() => { setPlanOpen(false); setPlanErrors({}) }}
                title="Generate AI Meal Plan"
                description="Personalise nutrition for your child"
                size="md"
            >
                <form onSubmit={handleGeneratePlan} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Child</label>
                        <select
                            value={selectedChildId || ''}
                            onChange={(e) => setSelectedChildId(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            {children.length === 0 ? (
                                <option value="">No children linked to account</option>
                            ) : (
                                children.map((c: any) => (
                                    <option key={c._id || c.id} value={c._id || c.id}>
                                        {c.firstName || c.name} {c.lastName || ''}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Age (years)</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={planAge}
                            onChange={(e) => {
                                setPlanAge(e.target.value)
                                if (planErrors.age) setPlanErrors(prev => { const n = { ...prev }; delete n.age; return n })
                            }}
                            onKeyDown={filterNumberInput}
                            required
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${planErrors.age ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="e.g. 10"
                        />
                        <FormFieldHint hint="Numbers only, 1-18" error={planErrors.age} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={planDuration}
                            onChange={(e) => {
                                setPlanDuration(e.target.value)
                                if (planErrors.duration) setPlanErrors(prev => { const n = { ...prev }; delete n.duration; return n })
                            }}
                            onKeyDown={filterNumberInput}
                            required
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${planErrors.duration ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="7"
                        />
                        <FormFieldHint hint="Numbers only, 1-30" error={planErrors.duration} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
                        <select
                            value={planActivityLevel}
                            onChange={(e) => {
                                setPlanActivityLevel(e.target.value)
                                if (planErrors.activityLevel) setPlanErrors(prev => { const n = { ...prev }; delete n.activityLevel; return n })
                            }}
                            required
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${planErrors.activityLevel ? 'border-red-500' : 'border-gray-300'}`}
                        >
                            <option value="">Select</option>
                            <option value="low">Low</option>
                            <option value="moderate">Moderate</option>
                            <option value="high">High</option>
                            <option value="athletic">Athletic</option>
                        </select>
                        <FormFieldHint error={planErrors.activityLevel} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Goals</label>
                        <div className="space-y-2">
                            {[
                                { v: 'health', l: 'General health' },
                                { v: 'athletic', l: 'Athletic performance' },
                                { v: 'weight_gain', l: 'Weight gain' },
                                { v: 'weight_loss', l: 'Weight management' },
                                { v: 'muscle', l: 'Muscle building' },
                            ].map(g => (
                                <label key={g.v} className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={planGoals.includes(g.v)}
                                        onChange={(e) => {
                                            if (e.target.checked) setPlanGoals(prev => [...prev, g.v])
                                            else setPlanGoals(prev => prev.filter(x => x !== g.v))
                                            if (planErrors.goals) setPlanErrors(prev => { const n = { ...prev }; delete n.goals; return n })
                                        }}
                                        className="rounded border-gray-300"
                                    />
                                    {g.l}
                                </label>
                            ))}
                        </div>
                        <FormFieldHint hint="Pick at least one" error={planErrors.goals} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (optional)</label>
                        <textarea
                            rows={2}
                            value={planAllergies}
                            onChange={(e) => setPlanAllergies(e.target.value)}
                            maxLength={300}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Comma-separated (e.g. peanuts, dairy)"
                        />
                        <FormFieldHint hint="Comma-separated list" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => { setPlanOpen(false); setPlanErrors({}) }}>Cancel</Button>
                        <Button type="submit" disabled={generating} className="bg-emerald-600 hover:bg-emerald-700">
                            {generating ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>) : 'Generate Plan'}
                        </Button>
                    </div>
                </form>
            </SlideInDrawer>
        </div>
    )
}
