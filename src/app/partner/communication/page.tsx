'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PartnerPortalService from '@/services/modules/partner-portal.service'
import { motion } from 'framer-motion'
import {
    MessageSquare, Mail, Phone, Video, Bell, Send,
    Users, Calendar, Clock, Search, Filter, Plus,
    Paperclip, Smile, MoreHorizontal, Star, Archive, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PartnerCommunicationPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [messages, setMessages] = useState<any[]>([])
    const [notifications, setNotifications] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState('messages')
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        fetchCommunicationData()
    }, [isAuthenticated, router])

    const fetchCommunicationData = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const partnerId = user?.id || 'partner-1'
            const [notificationsRes] = await Promise.all([
                PartnerPortalService.getPartnerNotifications(partnerId)
            ])

            setMessages([
                {
                    id: '1',
                    type: 'SUPPORT',
                    subject: 'Integration Setup Help',
                    from: 'Sarah Johnson',
                    fromEmail: 'sarah@proactive.com',
                    timestamp: '2024-03-15 10:30 AM',
                    status: 'UNREAD',
                    priority: 'HIGH',
                    preview: 'Hi, I need help setting up the Google Calendar integration...',
                    messages: [
                        {
                            id: 'm1',
                            sender: 'Sarah Johnson',
                            content: 'Hi, I need help setting up the Google Calendar integration for our partner account. The webhook URL seems to be not working.',
                            timestamp: '2024-03-15 10:30 AM',
                            isOwn: false
                        }
                    ]
                },
                {
                    id: '2',
                    type: 'BILLING',
                    subject: 'Monthly Invoice Available',
                    from: 'Billing Team',
                    fromEmail: 'billing@proactive.com',
                    timestamp: '2024-03-14 02:15 PM',
                    status: 'READ',
                    priority: 'MEDIUM',
                    preview: 'Your monthly invoice for March 2024 is now available...',
                    messages: [
                        {
                            id: 'm2',
                            sender: 'Billing Team',
                            content: 'Your monthly invoice for March 2024 is now available in your partner portal. Total amount: $2,850.',
                            timestamp: '2024-03-14 02:15 PM',
                            isOwn: false
                        }
                    ]
                },
                {
                    id: '3',
                    type: 'MARKETING',
                    subject: 'New Marketing Campaign Opportunity',
                    from: 'Marketing Team',
                    fromEmail: 'marketing@proactive.com',
                    timestamp: '2024-03-13 11:45 AM',
                    status: 'READ',
                    priority: 'LOW',
                    preview: 'We have a new summer camp promotion campaign that might interest you...',
                    messages: [
                        {
                            id: 'm3',
                            sender: 'Marketing Team',
                            content: 'We have a new summer camp promotion campaign that might interest your partner network. Would you like to participate?',
                            timestamp: '2024-03-13 11:45 AM',
                            isOwn: false
                        },
                        {
                            id: 'm4',
                            sender: 'You',
                            content: 'Yes, please send me more details about the campaign requirements and commission structure.',
                            timestamp: '2024-03-13 12:30 PM',
                            isOwn: true
                        }
                    ]
                }
            ])

            setNotifications([
                {
                    id: '1',
                    type: 'SYSTEM',
                    title: 'Integration Health Alert',
                    message: 'Your Stripe integration health score has dropped to 85%',
                    timestamp: '2024-03-15 09:15 AM',
                    status: 'UNREAD',
                    priority: 'HIGH'
                },
                {
                    id: '2',
                    type: 'COMMISSION',
                    title: 'Commission Payment Processed',
                    message: 'Your monthly commission of $2,850 has been processed',
                    timestamp: '2024-03-14 03:30 PM',
                    status: 'READ',
                    priority: 'MEDIUM'
                },
                {
                    id: '3',
                    type: 'ENROLLMENT',
                    title: 'New Student Enrollment',
                    message: '5 new students enrolled through your referral link',
                    timestamp: '2024-03-13 08:20 AM',
                    status: 'READ',
                    priority: 'LOW'
                }
            ])
        } catch (err: any) {
            console.error('Error fetching communication data:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'UNREAD': return 'bg-blue-100 text-blue-800'
            case 'READ': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': return 'bg-red-100 text-red-800'
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
            case 'LOW': return 'bg-green-100 text-green-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'SUPPORT': return MessageSquare
            case 'BILLING': return Mail
            case 'MARKETING': return Bell
            case 'SYSTEM': return Bell
            case 'COMMISSION': return Mail
            case 'ENROLLMENT': return Users
            default: return MessageSquare
        }
    }

    const handleSendMessage = (conversationId: string, message: string) => {
        alert(`Sending message to conversation ${conversationId}: ${message}`)
    }

    const handleMarkAsRead = (messageId: string) => {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, status: 'READ' } : msg
        ))
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Communication Center</h1>
                    <p className="text-gray-600 mt-1">Manage messages, notifications, and communications</p>
                </div>
                <button id="partner-communication-new-message-btn" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    New Message
                </button>
            </div>

            {/* Communication Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    {
                        title: 'Unread Messages',
                        value: '3',
                        icon: MessageSquare,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-50'
                    },
                    {
                        title: 'Active Conversations',
                        value: '8',
                        icon: Users,
                        color: 'text-green-600',
                        bgColor: 'bg-green-50'
                    },
                    {
                        title: 'Pending Responses',
                        value: '2',
                        icon: Clock,
                        color: 'text-orange-600',
                        bgColor: 'bg-orange-50'
                    },
                    {
                        title: 'Avg Response Time',
                        value: '2.5h',
                        icon: Clock,
                        color: 'text-purple-600',
                        bgColor: 'bg-purple-50'
                    },
                ].map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">{metric.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                                    </div>
                                    <div className={`${metric.bgColor} p-3 rounded-lg`}>
                                        <metric.icon className={`w-6 h-6 ${metric.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-2 border-b border-gray-200">
                {[
                    { id: 'messages', name: 'Messages', icon: MessageSquare },
                    { id: 'notifications', name: 'Notifications', icon: Bell },
                ].map((tab) => (
                    <button id={`partner-communication-tab-${tab.id}-btn`}
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${activeTab === tab.id
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <tab.icon className="w-5 h-5" />
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* Messages Tab */}
            {activeTab === 'messages' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Message List */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button id="partner-communication-filter-btn" className="p-2 hover:bg-gray-100 rounded-lg">
                                <Filter className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>

                        {messages.map((message, idx) => {
                            const TypeIcon = getTypeIcon(message.type)
                            return (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card
                                        id={`partner-communication-conversation-${message.id}-card`}
                                        className={`cursor-pointer hover:shadow-lg transition-shadow ${selectedConversation === message.id ? 'ring-2 ring-blue-500' : ''
                                            }`}
                                        onClick={() => setSelectedConversation(message.id)}
                                    >
                                        <CardContent className="pt-4">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-gray-100 p-2 rounded-lg">
                                                    <TypeIcon className="w-4 h-4 text-gray-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-gray-900 truncate">{message.subject}</h3>
                                                        {message.status === 'UNREAD' && (
                                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-1">{message.from}</p>
                                                    <p className="text-sm text-gray-500 truncate">{message.preview}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge className={getPriorityColor(message.priority)}>
                                                            {message.priority}
                                                        </Badge>
                                                        <span className="text-xs text-gray-500">{message.timestamp}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )
                        })}
                    </div>

                    {/* Message Detail */}
                    <div className="lg:col-span-2">
                        {selectedConversation ? (
                            <Card className="h-full">
                                <CardHeader className="border-b">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>{messages.find(m => m.id === selectedConversation)?.subject}</CardTitle>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {messages.find(m => m.id === selectedConversation)?.from}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button id="partner-communication-star-btn" className="p-2 hover:bg-gray-100 rounded-lg">
                                                <Star className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <button id="partner-communication-archive-btn" className="p-2 hover:bg-gray-100 rounded-lg">
                                                <Archive className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <button id="partner-communication-more-btn" className="p-2 hover:bg-gray-100 rounded-lg">
                                                <MoreHorizontal className="w-4 h-4 text-gray-600" />
                                            </button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex flex-col h-96">
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {messages.find(m => m.id === selectedConversation)?.messages.map((msg: any) => (
                                            <div
                                                key={msg.id}
                                                className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.isOwn
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-900'
                                                        }`}
                                                >
                                                    <p className="text-sm">{msg.content}</p>
                                                    <p className={`text-xs mt-1 ${msg.isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                                                        {msg.timestamp}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t p-4">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                placeholder="Type your message..."
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <button id="partner-communication-attach-btn" className="p-2 hover:bg-gray-100 rounded-lg">
                                                <Paperclip className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <button id="partner-communication-emoji-btn" className="p-2 hover:bg-gray-100 rounded-lg">
                                                <Smile className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <button id="partner-communication-send-btn" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                                <Send className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="h-full flex items-center justify-center">
                                <div className="text-center">
                                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">Select a conversation to view messages</p>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <div className="space-y-4">
                    {notifications.map((notification, idx) => {
                        const TypeIcon = getTypeIcon(notification.type)
                        return (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="hover:shadow-lg transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-gray-100 p-2 rounded-lg">
                                                <TypeIcon className="w-5 h-5 text-gray-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                                                    {notification.status === 'UNREAD' && (
                                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 mb-2">{notification.message}</p>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getPriorityColor(notification.priority)}>
                                                        {notification.priority}
                                                    </Badge>
                                                    <span className="text-sm text-gray-500">{notification.timestamp}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
