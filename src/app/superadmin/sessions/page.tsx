'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import IAMService from '@/services/modules/iam.service'
import { motion } from 'framer-motion'
import { Activity, X, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function SessionsPage() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sessions, setSessions] = useState<any[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        loadSessions()
    }, [isAuthenticated, router])

    const loadSessions = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await IAMService.getActiveSessions()
            setSessions(response || [])
        } catch (err) {
            console.error('Error loading sessions:', err)
            setError('Failed to load sessions')
        } finally {
            setLoading(false)
        }
    }

    const handleRevokeSession = async (sessionId: string) => {
        if (!confirm('Are you sure you want to revoke this session?')) return

        try {
            await IAMService.revokeSession(sessionId)
            loadSessions()
        } catch (err) {
            console.error('Error revoking session:', err)
            alert('Failed to revoke session')
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Active Sessions</h1>
                    <p className="text-gray-600">Monitor and manage user sessions</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            Active Sessions ({sessions.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {sessions.map((session, idx) => (
                                <motion.div
                                    key={session.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-gray-900">User ID: {session.userId}</h3>
                                            <Badge className={session.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                {session.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">IP: {session.ipAddress}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Created: {session.createdAt} | Expires: {session.expiresAt}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleRevokeSession(session.id)}
                                        className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
