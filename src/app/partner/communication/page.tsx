'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PartnerPortalService from '@/services/modules/partner-portal.service'
import { apiClient } from '@/services/api/client'
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
    const [replyText, setReplyText] = useState('')
    const [composeOpen, setComposeOpen] = useState(false)
    const [composeSubject, setComposeSubject] = useState('')
    const [composeRecipient, setComposeRecipient] = useState('')
    const [composeBody, setComposeBody] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [sendingMessage, setSendingMessage] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

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
            const [messagesRes, notificationsRes] = await Promise.all([
                apiClient.get(`/partner/${partnerId}/messages`).catch(() => ({ data: { messages: [] } })),
                PartnerPortalService.getPartnerNotifications(partnerId).catch(() => ({ notifications: [], total: 0 }))
            ])

            const fetchedMessages = (messagesRes as any)?.data?.messages || (messagesRes as any)?.messages || []
            setMessages(fetchedMessages.length > 0 ? fetchedMessages : [
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

            const fetchedNotifications = (notificationsRes as any)?.notifications || []
            setNotifications(fetchedNotifications.length > 0 ? fetchedNotifications : [
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
                    title: 'New Enrollment',
                    message: '5 new members enrolled through your referral link',
                    timestamp: '2024-03-13 08:20 AM',
                    status: 'READ',
                    priority: 'LOW'
                }
            ])
        } catch (err: any) {
            console.error('Error fetching communication data:', err)
            setError('Failed to load communication data')
        } finally {
            setIsLoading(false)
        }
    }

    // Computed stats from actual data
    const unreadMessages = messages.filter(m => m.status === 'UNREAD').length
    const activeConversations = messages.length
    const pendingResponses = messages.filter(m => {
        const lastMsg = m.messages?.[m.messages.length - 1]
        return lastMsg && !lastMsg.isOwn
    }).length
    const unreadNotifications = notifications.filter(n => n.status === 'UNREAD').length

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

    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedConversation) return

        setSendingMessage(true)
        try {
            const partnerId = user?.id || 'partner-1'
            await apiClient.post(`/partner/${partnerId}/messages/${selectedConversation}/reply`, {
                content: replyText
            }).catch(() => null)

            // Update local state with the new message
            setMessages(prev => prev.map(msg => {
                if (msg.id === selectedConversation) {
                    return {
                        ...msg,
                        messages: [
                            ...msg.messages,
                            {
                                id: `m-${Date.now()}`,
                                sender: 'You',
                                content: replyText,
                                timestamp: new Date().toLocaleString(),
                                isOwn: true
                            }
                        ]
                    }
                }
                return msg
            }))
            setReplyText('')
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
        } catch (err) {
            console.error('Error sending reply:', err)
        } finally {
            setSendingMessage(false)
        }
    }

    const handleComposeMessage = async () => {
        if (!composeSubject.trim() || !composeBody.trim()) return

        setSendingMessage(true)
        try {
            const partnerId = user?.id || 'partner-1'
            await apiClient.post(`/partner/${partnerId}/messages`, {
                subject: composeSubject,
                recipient: composeRecipient,
                content: composeBody,
                type: 'SUPPORT'
            }).catch(() => null)

            // Add to local state
            const newMessage = {
                id: `msg-${Date.now()}`,
                type: 'SUPPORT',
                subject: composeSubject,
                from: composeRecipient || 'Support Team',
                fromEmail: composeRecipient,
                timestamp: new Date().toLocaleString(),
                status: 'READ',
                priority: 'MEDIUM',
                preview: composeBody.substring(0, 80) + '...',
                messages: [
                    {
                        id: `m-${Date.now()}`,
                        sender: 'You',
                        content: composeBody,
                        timestamp: new Date().toLocaleString(),
                        isOwn: true
                    }
                ]
            }
            setMessages(prev => [newMessage, ...prev])
            setComposeOpen(false)
            setComposeSubject('')
            setComposeRecipient('')
            setComposeBody('')
            setSelectedConversation(newMessage.id)
        } catch (err) {
            console.error('Error composing message:', err)
        } finally {
            setSendingMessage(false)
        }
    }

    const handleMarkAsRead = async (messageId: string) => {
        try {
            const partnerId = user?.id || 'partner-1'
            await apiClient.patch(`/partner/${partnerId}/messages/${messageId}/read`).catch(() => null)

            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, status: 'READ' } : msg
            ))
        } catch (err) {
            console.error('Error marking as read:', err)
        }
    }

    const handleMarkNotificationAsRead = async (notificationId: string) => {
        try {
            const partnerId = user?.id || 'partner-1'
            await apiClient.patch(`/partner/${partnerId}/notifications/${notificationId}/read`).catch(() => null)

            setNotifications(prev => prev.map(n =>
                n.id === notificationId ? { ...n, status: 'READ' } : n
            ))
        } catch (err) {
            console.error('Error marking notification as read:', err)
        }
    }

    const handleArchiveConversation = async (messageId: string) => {
        try {
            const partnerId = user?.id || 'partner-1'
            await apiClient.patch(`/partner/${partnerId}/messages/${messageId}/archive`).catch(() => null)

            setMessages(prev => prev.filter(msg => msg.id !== messageId))
            if (selectedConversation === messageId) {
                setSelectedConversation(null)
            }
        } catch (err) {
            console.error('Error archiving conversation:', err)
        }
    }

    const handleStarConversation = (messageId: string) => {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, starred: !msg.starred } : msg
        ))
    }

    const filteredMessages = messages.filter(msg =>
        msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.from?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.preview?.toLowerCase().includes(searchQuery.toLowerCase())
    )

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
                <button
                    id="partner-communication-new-message-btn"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => setComposeOpen(true)}
                >
                    <Plus className="w-5 h-5" />
                    New Message
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Compose Modal */}
            {composeOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="border-2 border-blue-200">
                        <CardHeader className="border-b bg-blue-50">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Compose New Message</CardTitle>
                                <button
                                    onClick={() => setComposeOpen(false)}
                                    className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                                >
                                    &times;
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">To</label>
                                <input
                                    type="text"
                                    value={composeRecipient}
                                    onChange={(e) => setComposeRecipient(e.target.value)}
                                    placeholder="Recipient email or name..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Subject</label>
                                <input
                                    type="text"
                                    value={composeSubject}
                                    onChange={(e) => setComposeSubject(e.target.value)}
                                    placeholder="Message subject..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Message</label>
                                <textarea
                                    value={composeBody}
                                    onChange={(e) => setComposeBody(e.target.value)}
                                    placeholder="Type your message..."
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setComposeOpen(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleComposeMessage}
                                    disabled={sendingMessage || !composeSubject.trim() || !composeBody.trim()}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                    {sendingMessage ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Colorful Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { title: 'Unread Messages', value: String(unreadMessages), icon: MessageSquare, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100', change: unreadMessages > 0 ? `${unreadMessages} new` : 'All read' },
                    { title: 'Active Conversations', value: String(activeConversations), icon: Mail, gradient: 'from-green-500 to-green-600', bgGradient: 'from-green-50 to-green-100', change: `${activeConversations} total` },
                    { title: 'Pending Responses', value: String(pendingResponses), icon: Clock, gradient: 'from-orange-500 to-orange-600', bgGradient: 'from-orange-50 to-orange-100', change: pendingResponses > 0 ? 'Needs reply' : 'All caught up' },
                    { title: 'Notifications', value: String(unreadNotifications), icon: Bell, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100', change: unreadNotifications > 0 ? `${unreadNotifications} unread` : 'None pending' },
                ].map((metric, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <Card className={`hover:shadow-lg transition-all border-0 bg-gradient-to-br ${metric.bgGradient}`}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`bg-gradient-to-br ${metric.gradient} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">{metric.change}</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium mb-1">{metric.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
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
                        {tab.id === 'messages' && unreadMessages > 0 && (
                            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">{unreadMessages}</span>
                        )}
                        {tab.id === 'notifications' && unreadNotifications > 0 && (
                            <span className="bg-red-600 text-white text-xs rounded-full px-2 py-0.5">{unreadNotifications}</span>
                        )}
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
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button id="partner-communication-filter-btn" className="p-2 hover:bg-gray-100 rounded-lg">
                                <Filter className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>

                        {filteredMessages.map((message, idx) => {
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
                                        onClick={() => {
                                            setSelectedConversation(message.id)
                                            if (message.status === 'UNREAD') {
                                                handleMarkAsRead(message.id)
                                            }
                                        }}
                                    >
                                        <CardContent className="pt-4">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-gray-100 p-2 rounded-lg">
                                                    <TypeIcon className="w-4 h-4 text-gray-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className={`font-semibold truncate ${message.status === 'UNREAD' ? 'text-gray-900' : 'text-gray-700'}`}>{message.subject}</h3>
                                                        {message.status === 'UNREAD' && (
                                                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
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

                        {filteredMessages.length === 0 && (
                            <div className="text-center py-8">
                                <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500">No messages found</p>
                            </div>
                        )}
                    </div>

                    {/* Message Detail */}
                    <div className="lg:col-span-2">
                        {selectedConversation ? (() => {
                            const selectedMsg = messages.find(m => m.id === selectedConversation)
                            return (
                                <Card className="h-full">
                                    <CardHeader className="border-b">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>{selectedMsg?.subject}</CardTitle>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {selectedMsg?.from}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    id="partner-communication-star-btn"
                                                    className={`p-2 hover:bg-gray-100 rounded-lg ${selectedMsg?.starred ? 'text-yellow-500' : ''}`}
                                                    onClick={() => handleStarConversation(selectedConversation)}
                                                    title="Star conversation"
                                                >
                                                    <Star className={`w-4 h-4 ${selectedMsg?.starred ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`} />
                                                </button>
                                                <button
                                                    id="partner-communication-mark-read-btn"
                                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                                    onClick={() => handleMarkAsRead(selectedConversation)}
                                                    title="Mark as read"
                                                >
                                                    <Mail className="w-4 h-4 text-gray-600" />
                                                </button>
                                                <button
                                                    id="partner-communication-archive-btn"
                                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                                    onClick={() => handleArchiveConversation(selectedConversation)}
                                                    title="Archive conversation"
                                                >
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
                                            {selectedMsg?.messages.map((msg: any) => (
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
                                            <div ref={messagesEndRef} />
                                        </div>
                                        <div className="border-t p-4">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Type your reply..."
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault()
                                                            handleSendReply()
                                                        }
                                                    }}
                                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                <button id="partner-communication-attach-btn" className="p-2 hover:bg-gray-100 rounded-lg">
                                                    <Paperclip className="w-4 h-4 text-gray-600" />
                                                </button>
                                                <button id="partner-communication-emoji-btn" className="p-2 hover:bg-gray-100 rounded-lg">
                                                    <Smile className="w-4 h-4 text-gray-600" />
                                                </button>
                                                <button
                                                    id="partner-communication-send-btn"
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                                    onClick={handleSendReply}
                                                    disabled={sendingMessage || !replyText.trim()}
                                                >
                                                    <Send className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })() : (
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
                    {notifications.length === 0 && (
                        <div className="text-center py-12">
                            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500">No notifications</p>
                        </div>
                    )}
                    {notifications.map((notification, idx) => {
                        const TypeIcon = getTypeIcon(notification.type)
                        return (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className={`hover:shadow-lg transition-shadow ${notification.status === 'UNREAD' ? 'border-l-4 border-l-blue-500' : ''}`}>
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
                                            {notification.status === 'UNREAD' && (
                                                <button
                                                    onClick={() => handleMarkNotificationAsRead(notification.id)}
                                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                                                >
                                                    Mark as read
                                                </button>
                                            )}
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
