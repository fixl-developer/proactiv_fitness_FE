'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { Bell, Send, Users, Settings, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function NotificationsPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [notifications] = useState([
        { id: '1', title: 'System Update', message: 'New version available', type: 'info', sent: true, recipients: 1234, timestamp: new Date().toISOString() },
        { id: '2', title: 'Maintenance Alert', message: 'Scheduled maintenance tonight', type: 'warning', sent: true, recipients: 1234, timestamp: new Date().toISOString() },
        { id: '3', title: 'Security Alert', message: 'Unusual activity detected', type: 'critical', sent: false, recipients: 0, timestamp: new Date().toISOString() }
    ])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        setLoading(false)
    }, [isAuthenticated, router])

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading notifications...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Notifications</h1>
                        <p className="text-gray-600">Manage system notifications</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Send className="w-4 h-4 mr-2" />
                        Send Notification
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Total Sent</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">2,468</p>
                                </div>
                                <Bell className="w-12 h-12 text-blue-500 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Recipients</p>
                                    <p className="text-3xl font-bold text-purple-600 mt-2">1,234</p>
                                </div>
                                <Users className="w-12 h-12 text-purple-500 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Pending</p>
                                    <p className="text-3xl font-bold text-orange-600 mt-2">1</p>
                                </div>
                                <AlertCircle className="w-12 h-12 text-orange-500 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-blue-600" />
                            Recent Notifications ({notifications.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {notifications.map((notification, idx) => (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                                                <Badge className={`${notification.type === 'info' ? 'bg-blue-100 text-blue-800' :
                                                        notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {notification.type}
                                                </Badge>
                                                <Badge className={`${notification.sent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {notification.sent ? 'Sent' : 'Draft'}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span>Recipients: {notification.recipients.toLocaleString()}</span>
                                                <span>•</span>
                                                <span>{new Date(notification.timestamp).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline">
                                            <Settings className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
