'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useLocalStorage } from '@/hooks/useClientOnly'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader, Calendar, CheckCircle } from 'lucide-react'

const ScheduleGeneratePage = () => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [generatedCount, setGeneratedCount] = useState(0)
    const [formData, setFormData] = useState({
        termId: '',
        programIds: [] as string[],
        locationIds: [] as string[],
        days: [] as string[],
        startTime: '16:00',
        endTime: '17:00',
        recurrence: 'WEEKLY',
        weeks: 12
    })

    const userName = useLocalStorage('userName', 'Admin User')
    const userEmail = useLocalStorage('userEmail', 'admin@proactivsports.com')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isAuthenticated = localStorage.getItem('isAuthenticated')
            const userRole = localStorage.getItem('userRole')
            if (!isAuthenticated || userRole !== 'admin') {
                router.push('/login')
                return
            }
        }
    }, [router])

    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
    const mockTerms = [
        { _id: '1', name: 'Summer 2024' },
        { _id: '2', name: 'Fall 2024' }
    ]
    const mockPrograms = [
        { _id: '1', name: 'Beginner Gymnastics' },
        { _id: '2', name: 'Advanced Gymnastics' }
    ]
    const mockLocations = [
        { _id: '1', name: 'Cyberport' },
        { _id: '2', name: 'Wan Chai' }
    ]

    const handleDayToggle = (day: string) => {
        setFormData(prev => ({
            ...prev,
            days: prev.days.includes(day)
                ? prev.days.filter(d => d !== day)
                : [...prev.days, day]
        }))
    }

    const handleProgramToggle = (programId: string) => {
        setFormData(prev => ({
            ...prev,
            programIds: prev.programIds.includes(programId)
                ? prev.programIds.filter(id => id !== programId)
                : [...prev.programIds, programId]
        }))
    }

    const handleLocationToggle = (locationId: string) => {
        setFormData(prev => ({
            ...prev,
            locationIds: prev.locationIds.includes(locationId)
                ? prev.locationIds.filter(id => id !== locationId)
                : [...prev.locationIds, locationId]
        }))
    }

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (!formData.termId) {
            setError('Please select a term')
            return
        }
        if (formData.programIds.length === 0) {
            setError('Please select at least one program')
            return
        }
        if (formData.locationIds.length === 0) {
            setError('Please select at least one location')
            return
        }
        if (formData.days.length === 0) {
            setError('Please select at least one day')
            return
        }

        setIsLoading(true)
        try {
            // Simulate API call
            const count = formData.programIds.length * formData.locationIds.length * formData.days.length * formData.weeks
            await new Promise(resolve => setTimeout(resolve, 2000))
            setGeneratedCount(count)
            setSuccess(`Successfully generated ${count} sessions!`)
        } catch (err: any) {
            setError(err.message || 'Failed to generate schedule')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <DashboardLayout userRole="admin" userName={userName} userEmail={userEmail}>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Generate Schedule</h1>
                    <p className="text-gray-600 mt-2">Create sessions for a term</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3"
                    >
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                    </motion.div>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3"
                    >
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-green-700">{success}</p>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Schedule Configuration</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleGenerate} className="space-y-6">
                                    {/* Term Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Select Term
                                        </label>
                                        <select
                                            value={formData.termId}
                                            onChange={(e) => setFormData({ ...formData, termId: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Choose a term...</option>
                                            {mockTerms.map(term => (
                                                <option key={term._id} value={term._id}>{term.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Programs Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Select Programs
                                        </label>
                                        <div className="space-y-2">
                                            {mockPrograms.map(program => (
                                                <label key={program._id} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.programIds.includes(program._id)}
                                                        onChange={() => handleProgramToggle(program._id)}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="ml-2 text-gray-700">{program.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Locations Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Select Locations
                                        </label>
                                        <div className="space-y-2">
                                            {mockLocations.map(location => (
                                                <label key={location._id} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.locationIds.includes(location._id)}
                                                        onChange={() => handleLocationToggle(location._id)}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="ml-2 text-gray-700">{location.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Days Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Select Days
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {daysOfWeek.map(day => (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => handleDayToggle(day)}
                                                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${formData.days.includes(day)
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {day.slice(0, 3)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Time Configuration */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Start Time
                                            </label>
                                            <input
                                                type="time"
                                                value={formData.startTime}
                                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                End Time
                                            </label>
                                            <input
                                                type="time"
                                                value={formData.endTime}
                                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    {/* Recurrence */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Recurrence
                                            </label>
                                            <select
                                                value={formData.recurrence}
                                                onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="WEEKLY">Weekly</option>
                                                <option value="BIWEEKLY">Bi-weekly</option>
                                                <option value="MONTHLY">Monthly</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Number of Weeks
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.weeks}
                                                onChange={(e) => setFormData({ ...formData, weeks: parseInt(e.target.value) })}
                                                min="1"
                                                max="52"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center justify-center space-x-2">
                                                <Loader className="w-4 h-4 animate-spin" />
                                                <span>Generating...</span>
                                            </span>
                                        ) : (
                                            'Generate Schedule'
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Preview */}
                    <div>
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle>Preview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Programs Selected</p>
                                    <p className="text-2xl font-bold text-blue-600">{formData.programIds.length}</p>
                                </div>

                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Locations Selected</p>
                                    <p className="text-2xl font-bold text-green-600">{formData.locationIds.length}</p>
                                </div>

                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Days Selected</p>
                                    <p className="text-2xl font-bold text-purple-600">{formData.days.length}</p>
                                </div>

                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Estimated Sessions</p>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {formData.programIds.length * formData.locationIds.length * formData.days.length * formData.weeks}
                                    </p>
                                </div>

                                {generatedCount > 0 && (
                                    <div className="bg-green-100 border border-green-300 p-4 rounded-lg">
                                        <p className="text-sm font-semibold text-green-900">
                                            ✓ Generated {generatedCount} sessions
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default ScheduleGeneratePage
