'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useLocalStorage } from '@/hooks/useClientOnly'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader, User, Save } from 'lucide-react'

interface Session {
    _id: string
    programName: string
    date: string
    startTime: string
    endTime: string
    locationName: string
    primaryCoach?: string
    assistantCoach?: string
}

interface Coach {
    _id: string
    name: string
    specialization: string
}

const AssignCoachesPage = () => {
    const router = useRouter()
    const [sessions, setSessions] = useState<Session[]>([])
    const [coaches, setCoaches] = useState<Coach[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)
    const [assignments, setAssignments] = useState<Record<string, { primary?: string; assistant?: string }>>({})

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

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setIsLoading(true)
            setError('')

            const mockSessions: Session[] = [
                {
                    _id: '1',
                    programName: 'Beginner Gymnastics',
                    date: '2024-06-03',
                    startTime: '16:00',
                    endTime: '17:00',
                    locationName: 'Cyberport'
                },
                {
                    _id: '2',
                    programName: 'Advanced Gymnastics',
                    date: '2024-06-05',
                    startTime: '17:00',
                    endTime: '18:30',
                    locationName: 'Wan Chai'
                }
            ]

            const mockCoaches: Coach[] = [
                { _id: '1', name: 'Sarah Johnson', specialization: 'Gymnastics' },
                { _id: '2', name: 'Mike Wilson', specialization: 'Gymnastics' },
                { _id: '3', name: 'Emma Davis', specialization: 'Gymnastics' }
            ]

            setSessions(mockSessions)
            setCoaches(mockCoaches)

            // Initialize assignments
            const initialAssignments: Record<string, { primary?: string; assistant?: string }> = {}
            mockSessions.forEach(session => {
                initialAssignments[session._id] = {
                    primary: session.primaryCoach,
                    assistant: session.assistantCoach
                }
            })
            setAssignments(initialAssignments)
        } catch (err: any) {
            setError(err.message || 'Failed to load data')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAssignmentChange = (sessionId: string, role: 'primary' | 'assistant', coachId: string) => {
        setAssignments(prev => ({
            ...prev,
            [sessionId]: {
                ...prev[sessionId],
                [role]: coachId || undefined
            }
        }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            alert('Coaches assigned successfully!')
        } catch (err: any) {
            setError(err.message || 'Failed to save assignments')
        } finally {
            setSaving(false)
        }
    }

    if (isLoading) {
        return (
            <DashboardLayout userRole="admin" userName={userName} userEmail={userEmail}>
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Loading sessions...</p>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout userRole="admin" userName={userName} userEmail={userEmail}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Assign Coaches</h1>
                        <p className="text-gray-600 mt-2">Assign coaches to sessions</p>
                    </div>
                    <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-green-600 to-emerald-600">
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Assignments'}
                    </Button>
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

                {/* Sessions List */}
                <div className="space-y-4">
                    {sessions.map((session, index) => (
                        <motion.div
                            key={session._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card>
                                <CardContent className="p-6">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">{session.programName}</h3>
                                        <p className="text-sm text-gray-600">
                                            {new Date(session.date).toLocaleDateString()} • {session.startTime} - {session.endTime} • {session.locationName}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Primary Coach */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Primary Coach
                                            </label>
                                            <select
                                                value={assignments[session._id]?.primary || ''}
                                                onChange={(e) => handleAssignmentChange(session._id, 'primary', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Select coach...</option>
                                                {coaches.map(coach => (
                                                    <option key={coach._id} value={coach._id}>
                                                        {coach.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Assistant Coach */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Assistant Coach
                                            </label>
                                            <select
                                                value={assignments[session._id]?.assistant || ''}
                                                onChange={(e) => handleAssignmentChange(session._id, 'assistant', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Select coach...</option>
                                                {coaches.map(coach => (
                                                    <option key={coach._id} value={coach._id}>
                                                        {coach.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Assignment Summary */}
                                    {(assignments[session._id]?.primary || assignments[session._id]?.assistant) && (
                                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                            <p className="text-sm text-blue-900">
                                                <span className="font-semibold">Assigned:</span>{' '}
                                                {assignments[session._id]?.primary && (
                                                    <span>
                                                        Primary: {coaches.find(c => c._id === assignments[session._id]?.primary)?.name}
                                                    </span>
                                                )}
                                                {assignments[session._id]?.primary && assignments[session._id]?.assistant && ' • '}
                                                {assignments[session._id]?.assistant && (
                                                    <span>
                                                        Assistant: {coaches.find(c => c._id === assignments[session._id]?.assistant)?.name}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    )
}

export default AssignCoachesPage
