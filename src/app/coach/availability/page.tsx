'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Clock, Save, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { responsiveClasses } from '@/lib/responsiveClasses'
import { useAuth } from '@/contexts/AuthContext'
import { coachService, CoachAvailability } from '@/services/modules/coach.service'

const DEFAULT_AVAILABILITY: CoachAvailability = {
    monday: { start: '09:00', end: '17:00', available: true },
    tuesday: { start: '09:00', end: '17:00', available: true },
    wednesday: { start: '09:00', end: '17:00', available: true },
    thursday: { start: '09:00', end: '17:00', available: true },
    friday: { start: '09:00', end: '17:00', available: true },
    saturday: { start: '10:00', end: '14:00', available: true },
    sunday: { start: '', end: '', available: false }
}

const CoachAvailabilityPage = () => {
    const { isAuthenticated, user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [availability, setAvailability] = useState<CoachAvailability>({ ...DEFAULT_AVAILABILITY })

    const coachId = user?.id

    useEffect(() => {
        if (!isAuthenticated && !localStorage.getItem('token')) return
        if (!coachId) {
            setIsLoading(false)
            return
        }

        loadAvailability()
    }, [isAuthenticated, coachId])

    const loadAvailability = async () => {
        if (!coachId) return
        try {
            setIsLoading(true)
            setLoadError(null)
            const data = await coachService.getAvailability(coachId)
            setAvailability(data)
        } catch (error) {
            console.error('Error loading availability:', error)
            setLoadError('Failed to load availability from server. Using default schedule.')
            setAvailability({ ...DEFAULT_AVAILABILITY })
        } finally {
            setIsLoading(false)
        }
    }

    const handleAvailabilityChange = (day: string, field: string, value: string | boolean) => {
        setSaveSuccess(false)
        setSaveError(null)
        setAvailability(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value
            }
        }))
    }

    const handleSave = async () => {
        if (!coachId) return
        try {
            setIsSaving(true)
            setSaveSuccess(false)
            setSaveError(null)
            await coachService.saveAvailability(coachId, availability)
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 5000)
        } catch (error) {
            console.error('Error saving availability:', error)
            setSaveError('Failed to save availability. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleResetToDefaults = () => {
        setAvailability({ ...DEFAULT_AVAILABILITY })
        setSaveSuccess(false)
        setSaveError(null)
    }

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayLabels: Record<string, string> = {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday'
    }

    const totalHours = useMemo(() => {
        return Object.values(availability)
            .filter(a => a.available)
            .reduce((total, day) => {
                if (day.start && day.end) {
                    const [startH, startM] = day.start.split(':').map(Number)
                    const [endH, endM] = day.end.split(':').map(Number)
                    const hours = (endH + endM / 60) - (startH + startM / 60)
                    return total + Math.max(0, hours)
                }
                return total
            }, 0)
    }, [availability])

    const activeDays = useMemo(() => {
        return Object.values(availability).filter(a => a.available).length
    }, [availability])

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-96 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        )
    }

    return (
        <div className={responsiveClasses.pageContainer}>
            {/* Header */}
            <div className={responsiveClasses.headerContainer}>
                <div>
                    <h1 className={responsiveClasses.headerTitle}>Availability</h1>
                    <p className={responsiveClasses.headerSubtitle}>
                        Set your weekly availability for classes
                    </p>
                </div>
            </div>

            {/* Load Error Banner */}
            {loadError && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">{loadError}</p>
                </div>
            )}

            {/* Availability Settings */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Weekly Schedule</CardTitle>
                        <Button id="coach-availability-reset-btn"
                            variant="outline"
                            size="sm"
                            onClick={handleResetToDefaults}
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset to Defaults
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {days.map((day, index) => (
                            <motion.div
                                key={day}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`p-4 border rounded-lg transition-colors ${
                                    availability[day].available
                                        ? 'border-green-200 bg-green-50/30 hover:border-green-300'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-gray-900">{dayLabels[day]}</h3>
                                        {availability[day].available && availability[day].start && availability[day].end && (
                                            <Badge variant="secondary" className="text-xs">
                                                {(() => {
                                                    const [sH, sM] = availability[day].start.split(':').map(Number)
                                                    const [eH, eM] = availability[day].end.split(':').map(Number)
                                                    const h = (eH + eM / 60) - (sH + sM / 60)
                                                    return h > 0 ? `${h.toFixed(1)}h` : '0h'
                                                })()}
                                            </Badge>
                                        )}
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={availability[day].available}
                                            onChange={(e) => handleAvailabilityChange(day, 'available', e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300"
                                        />
                                        <span className="text-sm text-gray-600">Available</span>
                                    </label>
                                </div>

                                {availability[day].available && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Start Time
                                            </label>
                                            <input
                                                type="time"
                                                value={availability[day].start}
                                                onChange={(e) => handleAvailabilityChange(day, 'start', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                End Time
                                            </label>
                                            <input
                                                type="time"
                                                value={availability[day].end}
                                                onChange={(e) => handleAvailabilityChange(day, 'end', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                )}

                                {!availability[day].available && (
                                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                                        Not available on this day
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                                <h4 className="font-semibold text-blue-900 mb-2">Your Weekly Hours</h4>
                                <div className="flex flex-wrap gap-4 text-sm text-blue-800">
                                    <span className="font-medium">
                                        {totalHours.toFixed(1)} hours per week
                                    </span>
                                    <span>|</span>
                                    <span>{activeDays} active days</span>
                                    <span>|</span>
                                    <span>
                                        {activeDays > 0
                                            ? `~${(totalHours / activeDays).toFixed(1)} hrs/day avg`
                                            : 'No active days'}
                                    </span>
                                </div>
                                {/* Visual bar */}
                                <div className="mt-3">
                                    <div className="w-full bg-blue-100 rounded-full h-2.5">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min((totalHours / 60) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-blue-600 mt-1">
                                        {totalHours.toFixed(1)} / 60 max recommended weekly hours
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Save Success Message */}
                    {saveSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
                        >
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <p className="text-sm text-green-800 font-medium">
                                Availability saved successfully!
                            </p>
                        </motion.div>
                    )}

                    {/* Save Error Message */}
                    {saveError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
                        >
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <p className="text-sm text-red-800 font-medium">
                                {saveError}
                            </p>
                        </motion.div>
                    )}

                    {/* Save Button */}
                    <Button id="coach-availability-save-btn"
                        onClick={handleSave}
                        disabled={isSaving || !coachId}
                        className="w-full mt-6"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Availability
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                        Important Notes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li>Your availability will be used to schedule new classes</li>
                        <li>Students can only book classes during your available hours</li>
                        <li>You can update your availability anytime</li>
                        <li>Existing bookings will not be affected by changes</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}

export default CoachAvailabilityPage
