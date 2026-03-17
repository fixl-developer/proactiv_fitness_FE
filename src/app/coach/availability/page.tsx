'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Clock, Save, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { responsiveClasses } from '@/lib/responsiveClasses'
import { useAuth } from '@/contexts/AuthContext'
import { rbacManager } from '@/services/auth/rbac'

const CoachAvailabilityPage = () => {
    const router = useRouter()
    const { isAuthenticated, user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [availability, setAvailability] = useState<Record<string, { start: string; end: string; available: boolean }>>({
        monday: { start: '09:00', end: '17:00', available: true },
        tuesday: { start: '09:00', end: '17:00', available: true },
        wednesday: { start: '09:00', end: '17:00', available: true },
        thursday: { start: '09:00', end: '17:00', available: true },
        friday: { start: '09:00', end: '17:00', available: true },
        saturday: { start: '10:00', end: '14:00', available: true },
        sunday: { start: '', end: '', available: false }
    })

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        if (!rbacManager.hasPermission('coach_availability')) {
            router.push('/parent/dashboard')
            return
        }

        loadAvailability()
    }, [isAuthenticated, router])

    const loadAvailability = async () => {
        try {
            setIsLoading(false)
        } catch (error) {
            console.error('Error loading availability:', error)
            setIsLoading(false)
        }
    }

    const handleAvailabilityChange = (day: string, field: string, value: string | boolean) => {
        setAvailability(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value
            }
        }))
    }

    const handleSave = async () => {
        try {
            setIsSaving(true)
            // Save availability
            await new Promise(resolve => setTimeout(resolve, 1000))
            setIsSaving(false)
        } catch (error) {
            console.error('Error saving availability:', error)
            setIsSaving(false)
        }
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

            {/* Availability Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Weekly Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {days.map((day, index) => (
                            <motion.div
                                key={day}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">{dayLabels[day]}</h3>
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
                            <div>
                                <h4 className="font-semibold text-blue-900 mb-2">Your Weekly Hours</h4>
                                <p className="text-sm text-blue-800">
                                    {Object.values(availability)
                                        .filter(a => a.available)
                                        .reduce((total, day) => {
                                            if (day.start && day.end) {
                                                const start = parseInt(day.start.split(':')[0])
                                                const end = parseInt(day.end.split(':')[0])
                                                return total + (end - start)
                                            }
                                            return total
                                        }, 0)} hours per week
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
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
                        <li>• Your availability will be used to schedule new classes</li>
                        <li>• Students can only book classes during your available hours</li>
                        <li>• You can update your availability anytime</li>
                        <li>• Existing bookings will not be affected by changes</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}

export default CoachAvailabilityPage
