'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supportStaffService } from '@/services/supportStaffService'
import { Megaphone, MessageSquare, Bell, Send, AlertCircle, Clock, User } from 'lucide-react'

export default function Communication() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('announcements')
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [messages, setMessages] = useState<any[]>([])
    const [sending, setSending] = useState(false)
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        recipients: 'all',
        priority: 'low'
    })

    const loadData = async () => {
        setLoading(true)
        setError(null)
        try {
            const [announcementsRes, messagesRes] = await Promise.all([
                supportStaffService.getAnnouncements(),
                supportStaffService.getTeamMessages()
            ])
            setAnnouncements(announcementsRes?.announcements || [])
            setMessages(messagesRes?.messages || [])
        } catch (err: any) {
            setError(err?.message || 'Failed to load communication data')
            setAnnouncements([])
            setMessages([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadData()
    }, [isAuthenticated, router])

    const handleSendMessage = async () => {
        if (!formData.subject.trim() || !formData.message.trim()) {
            setError('Subject and message are required')
            return
        }
        setSending(true)
        setError(null)
        try {
            await supportStaffService.sendTeamMessage(formData)
            setFormData({ subject: '', message: '', recipients: 'all', priority: 'low' })
            setActiveTab('messages')
            await loadData()
        } catch (err: any) {
            setError(err?.message || 'Failed to send message')
        } finally {
            setSending(false)
        }
    }

    const unreadCount = messages.filter((m: any) => !m.read).length
    const sentTodayCount = messages.filter((m: any) => {
        if (!m.timestamp) return false
        const today = new Date().toISOString().split('T')[0]
        return m.timestamp.startsWith(today)
    }).length

    const priorityBadge = (priority: string) => {
        const colors: Record<string, string> = {
            high: 'bg-red-100 text-red-700 border border-red-200',
            medium: 'bg-orange-100 text-orange-700 border border-orange-200',
            low: 'bg-green-100 text-green-700 border border-green-200'
        }
        return colors[priority] || colors.low
    }

    if (!isAuthenticated) return null

    const tabs = [
        { key: 'announcements', label: 'Announcements' },
        { key: 'messages', label: 'Team Messages' },
        { key: 'send', label: 'Send Message' }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Communication</h1>
                        <p className="text-gray-500 mt-1">Announcements, messages, and team communication</p>
                    </div>
                    <button
                        id="staff-communication-refresh-btn"
                        onClick={loadData}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-red-800">{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800 font-medium text-sm">Dismiss</button>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    <div className="rounded-xl border-0 bg-gradient-to-br from-blue-50 to-blue-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md">
                                <Megaphone className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Announcements</p>
                        <p className="text-2xl font-bold text-gray-900">{announcements.length}</p>
                    </div>

                    <div className="rounded-xl border-0 bg-gradient-to-br from-green-50 to-green-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-lg shadow-md">
                                <MessageSquare className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Team Messages</p>
                        <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
                    </div>

                    <div className="rounded-xl border-0 bg-gradient-to-br from-orange-50 to-orange-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-lg shadow-md">
                                <Bell className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Unread</p>
                        <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
                    </div>

                    <div className="rounded-xl border-0 bg-gradient-to-br from-purple-50 to-purple-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg shadow-md">
                                <Send className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Sent Today</p>
                        <p className="text-2xl font-bold text-gray-900">{sentTodayCount}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex gap-4 border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            id={`staff-communication-tab-${tab.key}-btn`}
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                                activeTab === tab.key
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading communication data...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Announcements Tab */}
                        {activeTab === 'announcements' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {announcements.length === 0 ? (
                                    <div className="col-span-full text-center py-12">
                                        <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 text-lg">No announcements yet</p>
                                    </div>
                                ) : (
                                    announcements.map((announcement: any, index: number) => (
                                        <div key={announcement.id || index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100">
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="font-semibold text-gray-900 text-lg flex-1 mr-2">{announcement.title}</h3>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${priorityBadge(announcement.priority)}`}>
                                                    {announcement.priority || 'low'}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{announcement.content}</p>
                                            <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                                                <div className="flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5" />
                                                    <span>{announcement.author || 'System'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{announcement.publishedAt || announcement.created ? new Date(announcement.publishedAt || announcement.created).toLocaleDateString() : 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Team Messages Tab */}
                        {activeTab === 'messages' && (
                            <div className="space-y-4">
                                {messages.length === 0 ? (
                                    <div className="text-center py-12">
                                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 text-lg">No team messages yet</p>
                                    </div>
                                ) : (
                                    messages.map((msg: any, index: number) => (
                                        <div key={msg.id || index} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow border border-gray-100 flex gap-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                                    {(msg.sender || msg.author || 'U').charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-gray-900">{msg.sender || msg.author || 'Unknown'}</span>
                                                    {msg.subject && <span className="text-sm text-gray-500">- {msg.subject}</span>}
                                                </div>
                                                <p className="text-gray-600 text-sm mb-2">{msg.content || msg.message}</p>
                                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{msg.timestamp ? new Date(msg.timestamp).toLocaleString() : 'N/A'}</span>
                                                    </div>
                                                    {msg.priority && (
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityBadge(msg.priority)}`}>
                                                            {msg.priority}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Send Message Tab */}
                        {activeTab === 'send' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Send a Message</h2>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                                        <input
                                            id="staff-communication-subject-input"
                                            type="text"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            placeholder="Enter message subject"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                                        <textarea
                                            id="staff-communication-message-input"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="Type your message here..."
                                            rows={5}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-vertical"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Recipients</label>
                                            <select
                                                id="staff-communication-recipients-select"
                                                value={formData.recipients}
                                                onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
                                            >
                                                <option value="all">All</option>
                                                <option value="support-team">Support Team</option>
                                                <option value="managers">Managers</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                                            <select
                                                id="staff-communication-priority-select"
                                                value={formData.priority}
                                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            id="staff-communication-send-btn"
                                            onClick={handleSendMessage}
                                            disabled={sending || !formData.subject.trim() || !formData.message.trim()}
                                            className="bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            <Send className="w-4 h-4" />
                                            {sending ? 'Sending...' : 'Send Message'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
