'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    Brain, Sparkles, Loader2, RefreshCw, Utensils, Droplets,
    ShoppingCart, BookOpen, Target, Plus, Calendar,
    Apple, Coffee, Sun, Moon, Clock, ChevronRight, AlertCircle, X, Check, Trash2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/services/api/client'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import {
    validateRequired,
    validateSelect,
    validateNumber,
    validateTextArea,
    validatePlainText,
    filterNumberInput,
} from '@/utils/validation'

// ── Fallback reference data (recommendations, recipes, grocery) ─────────

const FALLBACK_RECOMMENDATIONS = [
    { icon: Droplets, text: 'Stay hydrated -- drink at least 8 glasses of water daily, more during training sessions.', color: 'text-cyan-600 bg-cyan-50' },
    { icon: Target, text: 'Aim for 1.2-1.6g of protein per kg of body weight to support muscle recovery.', color: 'text-blue-600 bg-blue-50' },
    { icon: Apple, text: 'Eat a balanced pre-workout meal 2-3 hours before exercise: complex carbs + lean protein.', color: 'text-green-600 bg-green-50' },
    { icon: Clock, text: 'Post-workout, eat within 30-60 minutes -- a protein shake or chicken with rice works well.', color: 'text-orange-600 bg-orange-50' },
    { icon: Sun, text: 'Include fruits and vegetables in every meal for essential vitamins and minerals.', color: 'text-yellow-600 bg-yellow-50' },
    { icon: Moon, text: 'Avoid heavy meals close to bedtime. A light snack with casein protein supports overnight recovery.', color: 'text-indigo-600 bg-indigo-50' },
]

// Meal type options per spec
const MEAL_TYPES = [
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snack',
    'Pre-Workout',
    'Post-Workout',
]

interface MealLog {
    _id: string
    mealType: string
    mealName: string
    calories: number
    protein?: number
    carbs?: number
    fats?: number
    consumedAt: string
    notes?: string
    createdAt?: string
}

interface FormState {
    mealType: string
    mealName: string
    calories: string
    protein: string
    carbs: string
    fats: string
    consumedAt: string
    notes: string
}

function toDatetimeLocalNow() {
    const now = new Date()
    const tzOffset = now.getTimezoneOffset() * 60000
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16)
}

const EMPTY_FORM: FormState = {
    mealType: '',
    mealName: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    consumedAt: '',
    notes: '',
}

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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <Card key={i}><CardContent className="p-4"><div className="h-20 bg-gray-100 rounded" /></CardContent></Card>
                ))}
            </div>
            <Card><CardContent className="p-6"><div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-lg" />)}</div></CardContent></Card>
        </div>
    )
}

function formatDateTime(dateStr?: string) {
    if (!dateStr) return '--'
    try {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    } catch {
        return dateStr
    }
}

export default function NutritionPage() {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'overview' | 'recommendations'>('overview')

    // Real meal logs
    const [meals, setMeals] = useState<MealLog[]>([])

    // Log meal drawer
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [form, setForm] = useState<FormState>(EMPTY_FORM)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [submitting, setSubmitting] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const studentId = user?.id || ''

    const mealIcons: Record<string, any> = {
        Breakfast: Sun,
        Lunch: Coffee,
        Dinner: Moon,
        Snack: Apple,
        'Pre-Workout': Target,
        'Post-Workout': Target,
    }

    const loadMeals = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const res = await apiClient.get<any>('/user/nutrition/meals')
            const list: MealLog[] =
                res?.data?.meals ||
                res?.data?.data ||
                res?.data ||
                res?.meals ||
                (Array.isArray(res) ? res : []) ||
                []
            const normalized = Array.isArray(list) ? list : []
            normalized.sort((a, b) => {
                const aT = new Date(a.consumedAt || a.createdAt || 0).getTime()
                const bT = new Date(b.consumedAt || b.createdAt || 0).getTime()
                return bT - aT
            })
            setMeals(normalized)
        } catch (err: any) {
            console.warn('Failed to load meals:', err)
            setError(err?.response?.data?.message || err?.message || 'Unable to load meals')
            setMeals([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadMeals()
    }, [loadMeals])

    const openDrawer = () => {
        setForm({ ...EMPTY_FORM, consumedAt: toDatetimeLocalNow() })
        setErrors({})
        setDrawerOpen(true)
    }

    const closeDrawer = () => {
        if (submitting) return
        setDrawerOpen(false)
        setErrors({})
    }

    const validate = (): boolean => {
        const next: Record<string, string> = {}

        const mtErr = validateSelect(form.mealType, 'Meal Type')
        if (mtErr) next.mealType = mtErr

        const nameErr = validatePlainText(form.mealName, 'Meal name', 2, 80)
        if (nameErr) next.mealName = nameErr

        const calErr = validateNumber(form.calories, 'Calories', 0.0001)
        if (calErr) next.calories = calErr

        if (form.protein) {
            const err = validateNumber(form.protein, 'Protein', 0)
            if (err) next.protein = err
        }
        if (form.carbs) {
            const err = validateNumber(form.carbs, 'Carbs', 0)
            if (err) next.carbs = err
        }
        if (form.fats) {
            const err = validateNumber(form.fats, 'Fats', 0)
            if (err) next.fats = err
        }

        const consumedReq = validateRequired(form.consumedAt, 'Consumed at')
        if (consumedReq) {
            next.consumedAt = consumedReq
        } else if (isNaN(new Date(form.consumedAt).getTime())) {
            next.consumedAt = 'Please enter a valid date and time'
        }

        const notesErr = validateTextArea(form.notes, 'Notes', 0, 500)
        if (notesErr) next.notes = notesErr

        setErrors(next)
        return Object.keys(next).length === 0
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setSubmitting(true)
        try {
            const payload = {
                studentId,
                mealType: form.mealType,
                mealName: form.mealName.trim(),
                calories: parseFloat(form.calories),
                protein: form.protein ? parseFloat(form.protein) : 0,
                carbs: form.carbs ? parseFloat(form.carbs) : 0,
                fats: form.fats ? parseFloat(form.fats) : 0,
                consumedAt: new Date(form.consumedAt).toISOString(),
                notes: form.notes?.trim() || undefined,
            }
            const res = await apiClient.post<any>('/user/nutrition/meals', payload)
            const saved: MealLog =
                res?.data?.meal || res?.data?.data || res?.data || res || {
                    _id: `local-${Date.now()}`,
                    ...payload,
                }
            setMeals(prev => [saved, ...prev])
            setDrawerOpen(false)
            setForm(EMPTY_FORM)
            setErrors({})
        } catch (err: any) {
            console.warn('Failed to log meal:', err)
            setErrors(prev => ({
                ...prev,
                submit: err?.response?.data?.message || err?.message || 'Failed to log meal',
            }))
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!id || !confirm('Delete this meal?')) return
        setDeletingId(id)
        try {
            await apiClient.delete(`/user/nutrition/meals/${id}`)
            setMeals(prev => prev.filter(m => m._id !== id))
        } catch (err: any) {
            console.warn('Failed to delete meal:', err)
            alert(err?.response?.data?.message || err?.message || 'Failed to delete meal')
        } finally {
            setDeletingId(null)
        }
    }

    // Daily totals from today's meals
    const todayMeals = meals.filter(m => {
        try {
            const d = new Date(m.consumedAt)
            const now = new Date()
            return d.toDateString() === now.toDateString()
        } catch {
            return false
        }
    })
    const dailyTotals = todayMeals.reduce(
        (acc, m) => ({
            calories: acc.calories + (m.calories || 0),
            protein: acc.protein + (m.protein || 0),
            carbs: acc.carbs + (m.carbs || 0),
            fats: acc.fats + (m.fats || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
    )

    if (isLoading) return <LoadingSkeleton />

    return (
        <div className="space-y-6">
            {/* Error banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-800 flex-1">{error}</p>
                    <Button size="sm" variant="outline" onClick={loadMeals}>
                        <RefreshCw className="w-3 h-3 mr-1" /> Retry
                    </Button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Nutrition</h1>
                    <p className="text-gray-600 mt-1">Log meals and track your daily intake</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadMeals}>
                        <RefreshCw className="w-4 h-4 mr-1" /> Refresh
                    </Button>
                    <Button size="sm" onClick={openDrawer} className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="w-4 h-4 mr-1" /> Log Meal
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {(['overview', 'recommendations'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        {tab === 'overview' ? 'Overview' : 'Recommendations'}
                    </button>
                ))}
            </div>

            {/* ─── OVERVIEW TAB ──────────────────────────────────── */}
            {activeTab === 'overview' && (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4 text-center">
                                <Utensils className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-gray-900">{Math.round(dailyTotals.calories)}</p>
                                <p className="text-xs text-gray-500">Calories Today</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-gray-900">{Math.round(dailyTotals.protein)}g</p>
                                <p className="text-xs text-gray-500">Protein</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <BookOpen className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-gray-900">{Math.round(dailyTotals.carbs)}g</p>
                                <p className="text-xs text-gray-500">Carbs</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <Droplets className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-gray-900">{Math.round(dailyTotals.fats)}g</p>
                                <p className="text-xs text-gray-500">Fats</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Meals */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-emerald-600" />
                                    Meal Log
                                </CardTitle>
                                <Button variant="outline" size="sm" onClick={openDrawer}>
                                    <Plus className="w-4 h-4 mr-1" /> Log Meal
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {meals.length > 0 ? (
                                <div className="space-y-3">
                                    {meals.map((log) => {
                                        const MealIcon = mealIcons[log.mealType] || Utensils
                                        return (
                                            <div
                                                key={log._id}
                                                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                                            >
                                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <MealIcon className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {log.mealName}
                                                        </p>
                                                        <Badge className="bg-emerald-100 text-emerald-700 text-xs flex-shrink-0">
                                                            {log.mealType}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {formatDateTime(log.consumedAt)}
                                                        {(log.protein || log.carbs || log.fats) ? (
                                                            <>
                                                                {' · '}
                                                                P {log.protein || 0}g · C {log.carbs || 0}g · F {log.fats || 0}g
                                                            </>
                                                        ) : null}
                                                    </p>
                                                    {log.notes && (
                                                        <p className="text-xs text-gray-400 italic mt-0.5 truncate">
                                                            {log.notes}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-sm font-bold text-gray-900">{log.calories || 0} cal</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(log._id)}
                                                    disabled={deletingId === log._id}
                                                >
                                                    {deletingId === log._id ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    )}
                                                </Button>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Utensils className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm">No meals logged yet</p>
                                    <Button size="sm" variant="outline" className="mt-3" onClick={openDrawer}>
                                        Log Your First Meal
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {/* ─── RECOMMENDATIONS TAB ───────────────────────────── */}
            {activeTab === 'recommendations' && (
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
            )}

            {/* ─── LOG MEAL DRAWER ───────────────────────────────── */}
            <SlideInDrawer
                isOpen={drawerOpen}
                onClose={closeDrawer}
                title="Log Meal"
                description="Record a meal to track your nutrition"
                size="md"
                footer={
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={closeDrawer} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 mr-2" /> Save Meal
                                </>
                            )}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    {/* Meal Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Meal Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={form.mealType}
                            onChange={(e) => setForm({ ...form, mealType: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">Select meal type</option>
                            {MEAL_TYPES.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        {errors.mealType && <p className="text-xs text-red-600 mt-1">{errors.mealType}</p>}
                    </div>

                    {/* Meal Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Meal Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            maxLength={80}
                            value={form.mealName}
                            onChange={(e) => setForm({ ...form, mealName: e.target.value })}
                            placeholder="e.g. Grilled chicken with rice"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        {errors.mealName && <p className="text-xs text-red-600 mt-1">{errors.mealName}</p>}
                    </div>

                    {/* Calories */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Calories <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={form.calories}
                            onKeyDown={filterNumberInput}
                            onChange={(e) => setForm({ ...form, calories: e.target.value })}
                            placeholder="e.g. 450"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        {errors.calories && <p className="text-xs text-red-600 mt-1">{errors.calories}</p>}
                    </div>

                    {/* Macros */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Protein (g)</label>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={form.protein}
                                onKeyDown={filterNumberInput}
                                onChange={(e) => setForm({ ...form, protein: e.target.value })}
                                placeholder="30"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            {errors.protein && <p className="text-xs text-red-600 mt-1">{errors.protein}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Carbs (g)</label>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={form.carbs}
                                onKeyDown={filterNumberInput}
                                onChange={(e) => setForm({ ...form, carbs: e.target.value })}
                                placeholder="50"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            {errors.carbs && <p className="text-xs text-red-600 mt-1">{errors.carbs}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Fats (g)</label>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={form.fats}
                                onKeyDown={filterNumberInput}
                                onChange={(e) => setForm({ ...form, fats: e.target.value })}
                                placeholder="15"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            {errors.fats && <p className="text-xs text-red-600 mt-1">{errors.fats}</p>}
                        </div>
                    </div>

                    {/* Consumed At */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Consumed At <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            value={form.consumedAt}
                            onChange={(e) => setForm({ ...form, consumedAt: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        {errors.consumedAt && <p className="text-xs text-red-600 mt-1">{errors.consumedAt}</p>}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Notes <span className="text-gray-400 text-xs font-normal">(optional, max 500)</span>
                        </label>
                        <textarea
                            rows={3}
                            maxLength={500}
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            placeholder="Any additional context..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                        />
                        <div className="flex items-center justify-between mt-1">
                            {errors.notes ? (
                                <p className="text-xs text-red-600">{errors.notes}</p>
                            ) : (
                                <span />
                            )}
                            <span className="text-xs text-gray-400">{form.notes.length}/500</span>
                        </div>
                    </div>

                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-700">{errors.submit}</p>
                        </div>
                    )}
                </div>
            </SlideInDrawer>
        </div>
    )
}
