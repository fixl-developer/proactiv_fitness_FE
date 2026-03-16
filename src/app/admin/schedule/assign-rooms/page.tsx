'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useLocalStorage } from '@/hooks/useClientOnly'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader, Home, Save } from 'lucide-react'

interface Session {
    _id: string
    programName: string
    date: string
    startTime: string
    endTime: string
    locationName: string
    assignedRoom?: string
}

interface Room {
    _id: string
    name: string
    capacity: number
    location: string
}

const AssignRoomsPage = () => {
    const router = useRouter()
    const [sessions, setSessions] = useState<Session[]>([])
    const [rooms, setRooms] = useState<Room[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)
    const [assignments, setAssignments] = useState<Record<string, string>>({})

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

            const mockRooms: Room[] = [
                { _id: '1', name: 'Room A', capacity: 15, location: 'Cyberport' },
                { _id: '2', name: 'Room B', capacity: 12, location: 'Cyberport' },
                { _id: '3', name: 'Room C', capacity: 20, location: 'Wan Chai' },
                { _id: '4', name: 'Room D', capacity: 10, location: 'Wan Chai' }
            ]

            setSessions(mockSessions)
            setRooms(mockRooms)

            // Initialize assignments
            const initialAssignments: Record<string, string> = {}
            mockSessions.forEach(session => {
                initialAssignments[session._id] = session.assignedRoom || ''
            })
            setAssignments(initialAssignments)
        } catch (err: any) {
            setError(err.message || 'Failed to load data')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAssignmentChange = (sessionId: string, roomId: string) => {
        setAssignments(prev => ({
            ...prev,
            [sessionId]: roomId
        }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            alert('Rooms assigned successfully!')
        } catch (err: any) {
            setError(err.message || 'Failed to save assignments')
        } finally {
            setSaving(false)
        }
    }

    const getAvailableRooms = (locationName: string) => {
        return rooms.filter(room => room.location === locationName)
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
                        <h1 className="text-3xl font-bold text-gray-900">Assign Rooms</h1>
                        <p className="text-gray-600 mt-2">Assign rooms to sessions</p>
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
                    {sessions.map((session, index) => {
                        const availableRooms = getAvailableRooms(session.locationName)
                        return (
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
                                                {new Date(session.date).toLocaleDateString()} • {session.startTime} - {session.endTime}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Location Info */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Location
                                                </label>
                                                <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-900 font-medium">
                                                    {session.locationName}
                                                </div>
                                            </div>

                                            {/* Room Assignment */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Assign Room
                                                </label>
                                                <select
                                                    value={assignments[session._id] || ''}
                                                    onChange={(e) => handleAssignmentChange(session._id, e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Select room...</option>
                                                    {availableRooms.map(room => (
                                                        <option key={room._id} value={room._id}>
                                                            {room.name} (Capacity: {room.capacity})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Assignment Summary */}
                                        {assignments[session._id] && (
                                            <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                                <p className="text-sm text-green-900">
                                                    <span className="font-semibold">Assigned Room:</span>{' '}
                                                    {rooms.find(r => r._id === assignments[session._id])?.name}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </DashboardLayout>
    )
}

export default AssignRoomsPage
