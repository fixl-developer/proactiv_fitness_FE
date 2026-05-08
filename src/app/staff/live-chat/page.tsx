'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supportStaffService } from '@/services/supportStaffService'
import {
    Send, MessageCircle, Clock, CheckCircle, Zap, User, AlertCircle,
    Plus, Search, Filter, RefreshCw, Phone, Video, MoreVertical,
    Smile, Paperclip, ArrowLeft, X, UserPlus, MessageSquare, Headphones
} from 'lucide-react'
import { validateName, validateEmail, validateTextArea, filterNameInput, FORMAT_HINTS } from '@/utils/validation'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { toast } from 'sonner'

// Backend often returns Mongo _id and populated User objects ({name,email,userId}).
// Coerce to flat strings so JSX rendering doesn't crash.
const stringify = (v: any): string => {
    if (v == null) return ''
    if (typeof v === 'string') return v
    if (typeof v === 'number' || typeof v === 'boolean') return String(v)
    if (typeof v === 'object') return v.name || v.fullName || v.email || v.label || ''
    return ''
}
const normalizeSession = (raw: any): ChatSession => ({
    id: raw?.id || raw?._id || '',
    customerName: stringify(raw?.customerName) || stringify(raw?.customer) || stringify(raw?.user) || 'Customer',
    customerEmail: stringify(raw?.customerEmail) || stringify(raw?.customer?.email),
    lastMessage: stringify(raw?.lastMessage) || stringify(raw?.lastMessage?.message) || '',
    status: (stringify(raw?.status) as ChatSession['status']) || 'active',
    updatedAt: raw?.updatedAt || raw?.updated || '',
    createdAt: raw?.createdAt || raw?.created || '',
    unreadCount: typeof raw?.unreadCount === 'number' ? raw.unreadCount : 0,
})
const normalizeMessage = (raw: any, idx: number): ChatMessage => ({
    id: raw?.id || raw?._id || `msg-${idx}`,
    sender: stringify(raw?.sender) || stringify(raw?.from) || stringify(raw?.user),
    senderType: (stringify(raw?.senderType) as ChatMessage['senderType']) || (raw?.isAgent ? 'agent' : 'customer'),
    message: stringify(raw?.message) || stringify(raw?.text) || stringify(raw?.body),
    createdAt: raw?.createdAt || raw?.created || raw?.timestamp || '',
})

interface ChatSession {
    id: string
    customerName: string
    customerEmail?: string
    lastMessage: string
    status: 'active' | 'waiting' | 'ended'
    updatedAt: string
    createdAt: string
    unreadCount?: number
}

interface ChatMessage {
    id: string
    sender: string
    senderType: 'customer' | 'agent'
    message: string
    createdAt: string
}

type StatusFilter = 'all' | 'active' | 'waiting' | 'ended'

export default function LiveChat() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sessions, setSessions] = useState<ChatSession[]>([])
    const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [messagesLoading, setMessagesLoading] = useState(false)
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [showNewChatModal, setShowNewChatModal] = useState(false)
    const [newChatForm, setNewChatForm] = useState({ customerName: '', customerEmail: '', initialMessage: '' })
    const [refreshing, setRefreshing] = useState(false)
    const [showMobileChat, setShowMobileChat] = useState(false)
    const [chatFormErrors, setChatFormErrors] = useState<Record<string, string>>({})
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadSessions()
    }, [isAuthenticated, router])

    // Auto-refresh sessions every 15 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            loadSessions(true)
        }, 15000)
        return () => clearInterval(interval)
    }, [])

    // Auto-refresh messages every 5 seconds when a session is selected
    useEffect(() => {
        if (!selectedSession) return
        const interval = setInterval(() => {
            loadMessages(selectedSession.id, true)
        }, 5000)
        return () => clearInterval(interval)
    }, [selectedSession])

    const loadSessions = async (silent = false) => {
        if (!silent) setLoading(true)
        setError(null)
        try {
            const data = await supportStaffService.getChatSessions()
            const list = data?.sessions || data
            const arr = Array.isArray(list) ? list : []
            setSessions(arr.map(normalizeSession).filter(s => s.id))
        } catch {
            if (!silent) setSessions([])
        } finally {
            if (!silent) setLoading(false)
        }
    }

    const loadMessages = async (chatId: string, silent = false) => {
        if (!silent) setMessagesLoading(true)
        try {
            const data = await supportStaffService.getChatMessages(chatId)
            const list = data?.messages || data
            const arr = Array.isArray(list) ? list : []
            setMessages(arr.map(normalizeMessage))
        } catch {
            if (!silent) setMessages([])
        } finally {
            if (!silent) setMessagesLoading(false)
        }
    }

    const handleSelectSession = (session: ChatSession) => {
        setSelectedSession(session)
        setShowMobileChat(true)
        loadMessages(session.id)
    }

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedSession || sending) return
        setSending(true)
        setError(null)
        try {
            await supportStaffService.sendChatMessage(selectedSession.id, newMessage)
            setNewMessage('')
            await loadMessages(selectedSession.id)
        } catch (err) {
            console.error('Error sending message:', err)
            setError('Failed to send message')
        } finally {
            setSending(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadSessions()
        if (selectedSession) {
            await loadMessages(selectedSession.id)
        }
        setRefreshing(false)
    }

    const handleNewChat = async () => {
        const newErrors: Record<string, string> = {}
        const nameErr = validateName(newChatForm.customerName, 'Customer Name')
        if (nameErr) newErrors.customerName = nameErr
        if (newChatForm.customerEmail) {
            const emailErr = validateEmail(newChatForm.customerEmail)
            if (emailErr) newErrors.customerEmail = emailErr
        }
        setChatFormErrors(newErrors)
        if (Object.keys(newErrors).length > 0) return
        try {
            const data: any = await supportStaffService.createChatSession({
                customerName: newChatForm.customerName.trim(),
                customerEmail: newChatForm.customerEmail.trim(),
                initialMessage: newChatForm.initialMessage.trim(),
            })
            setShowNewChatModal(false)
            setNewChatForm({ customerName: '', customerEmail: '', initialMessage: '' })
            toast.success('Chat session started')
            await loadSessions()
            // Auto-select newly created session
            const created = data?.session || data
            if (created?.sessionId || created?._id) {
                const newSession = normalizeSession(created)
                handleSelectSession(newSession)
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to start chat session')
        }
    }

    const activeCount = sessions.filter(s => s.status === 'active').length
    const waitingCount = sessions.filter(s => s.status === 'waiting').length
    const endedTodayCount = sessions.filter(s => {
        if (s.status !== 'ended') return false
        const today = new Date().toDateString()
        return new Date(s.updatedAt || s.createdAt).toDateString() === today
    }).length

    // Filter sessions
    const filteredSessions = sessions.filter(s => {
        const matchesSearch = !searchQuery ||
            (s.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.customerEmail || '').toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || s.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>Active</span>
            case 'waiting':
                return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>Waiting</span>
            default:
                return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Ended</span>
        }
    }

    const getTimeAgo = (dateStr: string) => {
        if (!dateStr) return ''
        const diff = Date.now() - new Date(dateStr).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'Just now'
        if (mins < 60) return `${mins}m ago`
        const hours = Math.floor(mins / 60)
        if (hours < 24) return `${hours}h ago`
        const days = Math.floor(hours / 24)
        return `${days}d ago`
    }

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Live Chat</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage customer conversations in real-time</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            <span className="text-sm font-medium">Refresh</span>
                        </button>
                        <button
                            id="staff-live-chat-new-chat-btn"
                            onClick={() => setShowNewChatModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">New Chat</span>
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="rounded-xl border-0 bg-gradient-to-br from-green-50 to-emerald-100 p-5 hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => setStatusFilter('active')}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-lg shadow-md">
                                <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            {activeCount > 0 && (
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                            )}
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Active Chats</p>
                        <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
                    </div>

                    <div className="rounded-xl border-0 bg-gradient-to-br from-orange-50 to-orange-100 p-5 hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => setStatusFilter('waiting')}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-lg shadow-md">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                            {waitingCount > 0 && (
                                <span className="bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{waitingCount}</span>
                            )}
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Waiting</p>
                        <p className="text-2xl font-bold text-gray-900">{waitingCount}</p>
                    </div>

                    <div className="rounded-xl border-0 bg-gradient-to-br from-blue-50 to-blue-100 p-5 hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => setStatusFilter('ended')}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md">
                                <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Ended Today</p>
                        <p className="text-2xl font-bold text-gray-900">{endedTodayCount}</p>
                    </div>

                    <div className="rounded-xl border-0 bg-gradient-to-br from-purple-50 to-purple-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg shadow-md">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Avg Response</p>
                        <p className="text-2xl font-bold text-gray-900">--</p>
                    </div>
                </div>

                {/* Chat Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 lg:gap-0 h-[600px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    {/* Session List - Left Panel */}
                    <div className={`${showMobileChat ? 'hidden lg:flex' : 'flex'} flex-col border-r border-gray-200`}>
                        {/* Search & Filter */}
                        <div className="p-3 border-b border-gray-100 space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search conversations..."
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                            {/* Status Filter Tabs */}
                            <div className="flex gap-1">
                                {(['all', 'active', 'waiting', 'ended'] as StatusFilter[]).map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setStatusFilter(filter)}
                                        className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                                            statusFilter === filter
                                                ? 'bg-blue-100 text-blue-700 shadow-sm'
                                                : 'text-gray-500 hover:bg-gray-100'
                                        }`}
                                    >
                                        {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                                        {filter === 'active' && activeCount > 0 && (
                                            <span className="ml-1 bg-green-500 text-white text-xs rounded-full px-1.5">{activeCount}</span>
                                        )}
                                        {filter === 'waiting' && waitingCount > 0 && (
                                            <span className="ml-1 bg-orange-500 text-white text-xs rounded-full px-1.5">{waitingCount}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sessions List */}
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                        <p className="text-gray-600 text-sm">Loading chats...</p>
                                    </div>
                                </div>
                            ) : filteredSessions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full px-4 py-8">
                                    <div className="bg-gray-100 rounded-full p-4 mb-4">
                                        <MessageSquare className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600 font-medium text-sm mb-1">
                                        {searchQuery || statusFilter !== 'all' ? 'No matching chats' : 'No conversations yet'}
                                    </p>
                                    <p className="text-gray-400 text-xs text-center mb-4">
                                        {searchQuery || statusFilter !== 'all'
                                            ? 'Try adjusting your search or filters'
                                            : 'Start a new chat or wait for customers to connect'}
                                    </p>
                                    {!searchQuery && statusFilter === 'all' && (
                                        <button
                                            onClick={() => setShowNewChatModal(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Start New Chat
                                        </button>
                                    )}
                                    {(searchQuery || statusFilter !== 'all') && (
                                        <button
                                            onClick={() => { setSearchQuery(''); setStatusFilter('all') }}
                                            className="text-blue-600 text-xs hover:underline"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                            ) : (
                                filteredSessions.map((session) => (
                                    <div
                                        id={`staff-live-chat-conversation-${session.id}-item`}
                                        key={session.id}
                                        onClick={() => handleSelectSession(session)}
                                        className={`p-3.5 border-b border-gray-50 cursor-pointer transition-all duration-150 ${
                                            selectedSession?.id === session.id
                                                ? 'bg-blue-50 border-l-4 border-l-blue-500'
                                                : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                session.status === 'active' ? 'bg-green-100' :
                                                session.status === 'waiting' ? 'bg-orange-100' : 'bg-gray-100'
                                            }`}>
                                                <User className={`w-4 h-4 ${
                                                    session.status === 'active' ? 'text-green-600' :
                                                    session.status === 'waiting' ? 'text-orange-600' : 'text-gray-500'
                                                }`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <p className="font-semibold text-gray-900 text-sm truncate">
                                                        {session.customerName || 'Customer'}
                                                    </p>
                                                    <span className="text-gray-400 text-xs flex-shrink-0 ml-2">
                                                        {getTimeAgo(session.updatedAt || session.createdAt)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-gray-500 text-xs truncate pr-2">
                                                        {session.lastMessage || 'No messages yet'}
                                                    </p>
                                                    {getStatusBadge(session.status)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Area - Right Panel */}
                    <div className={`lg:col-span-3 flex flex-col ${showMobileChat ? 'flex' : 'hidden lg:flex'}`}>
                        {selectedSession ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => { setShowMobileChat(false); setSelectedSession(null) }}
                                            className="lg:hidden p-1 hover:bg-gray-100 rounded-lg"
                                        >
                                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                                        </button>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            selectedSession.status === 'active' ? 'bg-green-100' :
                                            selectedSession.status === 'waiting' ? 'bg-orange-100' : 'bg-gray-100'
                                        }`}>
                                            <User className={`w-5 h-5 ${
                                                selectedSession.status === 'active' ? 'text-green-600' :
                                                selectedSession.status === 'waiting' ? 'text-orange-600' : 'text-gray-500'
                                            }`} />
                                        </div>
                                        <div>
                                            <h2 className="font-semibold text-gray-900 text-sm">
                                                {selectedSession.customerName || 'Customer'}
                                            </h2>
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(selectedSession.status)}
                                                <span className="text-xs text-gray-400">
                                                    {getTimeAgo(selectedSession.updatedAt || selectedSession.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Voice Call">
                                            <Phone className="w-4 h-4 text-gray-500" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Video Call">
                                            <Video className="w-4 h-4 text-gray-500" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="More Options">
                                            <MoreVertical className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
                                    {messagesLoading ? (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                                <p className="text-gray-500 text-sm">Loading messages...</p>
                                            </div>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <div className="bg-blue-50 rounded-full p-4 mb-3">
                                                <MessageCircle className="w-8 h-8 text-blue-400" />
                                            </div>
                                            <p className="text-gray-600 font-medium text-sm mb-1">No messages yet</p>
                                            <p className="text-gray-400 text-xs">Send a message to start the conversation</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Date separator */}
                                            <div className="flex items-center justify-center mb-2">
                                                <span className="bg-gray-200 text-gray-500 text-xs px-3 py-1 rounded-full">
                                                    {messages[0]?.createdAt
                                                        ? new Date(messages[0].createdAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
                                                        : 'Today'}
                                                </span>
                                            </div>
                                            {messages.map((msg) => (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${msg.senderType === 'agent' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    {msg.senderType !== 'agent' && (
                                                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                                                            <User className="w-3.5 h-3.5 text-gray-500" />
                                                        </div>
                                                    )}
                                                    <div
                                                        className={`rounded-2xl px-4 py-2.5 max-w-[70%] shadow-sm ${
                                                            msg.senderType === 'agent'
                                                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                                                                : 'bg-white text-gray-900 border border-gray-100 rounded-bl-md'
                                                        }`}
                                                    >
                                                        <p className={`text-xs font-medium mb-0.5 ${
                                                            msg.senderType === 'agent' ? 'text-blue-100' : 'text-gray-400'
                                                        }`}>
                                                            {msg.sender || (msg.senderType === 'agent' ? 'You' : 'Customer')}
                                                        </p>
                                                        <p className="text-sm leading-relaxed">{msg.message}</p>
                                                        <p className={`text-xs mt-1 ${
                                                            msg.senderType === 'agent' ? 'text-blue-200' : 'text-gray-400'
                                                        }`}>
                                                            {msg.createdAt
                                                                ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                                : ''}
                                                        </p>
                                                    </div>
                                                    {msg.senderType === 'agent' && (
                                                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center ml-2 flex-shrink-0 mt-1">
                                                            <Headphones className="w-3.5 h-3.5 text-blue-600" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <div className="p-4 border-t border-gray-200 bg-white">
                                    {selectedSession.status === 'ended' ? (
                                        <div className="text-center py-2">
                                            <p className="text-gray-500 text-sm">This conversation has ended</p>
                                        </div>
                                    ) : (
                                        <div className="flex items-end gap-2">
                                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 mb-0.5" title="Attach File">
                                                <Paperclip className="w-5 h-5 text-gray-400" />
                                            </button>
                                            <div className="flex-1 relative">
                                                <textarea
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault()
                                                            handleSendMessage()
                                                        }
                                                    }}
                                                    placeholder="Type your message..."
                                                    disabled={sending}
                                                    rows={1}
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 resize-none text-sm bg-gray-50"
                                                    style={{ minHeight: '42px', maxHeight: '120px' }}
                                                />
                                            </div>
                                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 mb-0.5" title="Emoji">
                                                <Smile className="w-5 h-5 text-gray-400" />
                                            </button>
                                            <button
                                                id="staff-live-chat-send-btn"
                                                onClick={handleSendMessage}
                                                disabled={sending || !newMessage.trim()}
                                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg flex-shrink-0 mb-0.5"
                                            >
                                                <Send className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            /* Empty State - No conversation selected */
                            <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-gray-50 to-white px-8">
                                <div className="relative mb-6">
                                    <div className="bg-blue-50 rounded-full p-6">
                                        <MessageCircle className="w-16 h-16 text-blue-400" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 bg-green-100 rounded-full p-2">
                                        <Headphones className="w-5 h-5 text-green-600" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Live Chat</h3>
                                <p className="text-gray-500 text-sm text-center max-w-md mb-8">
                                    Select a conversation from the left panel to start chatting, or create a new chat session to reach out to a customer.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
                                    <button
                                        onClick={() => setShowNewChatModal(true)}
                                        className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                                    >
                                        <div className="bg-blue-100 rounded-lg p-2.5 group-hover:bg-blue-200 transition-colors">
                                            <Plus className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">New Chat</span>
                                    </button>
                                    <button
                                        onClick={() => setStatusFilter('waiting')}
                                        className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group"
                                    >
                                        <div className="bg-orange-100 rounded-lg p-2.5 group-hover:bg-orange-200 transition-colors">
                                            <Clock className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Waiting ({waitingCount})</span>
                                    </button>
                                    <button
                                        onClick={handleRefresh}
                                        className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
                                    >
                                        <div className="bg-green-100 rounded-lg p-2.5 group-hover:bg-green-200 transition-colors">
                                            <RefreshCw className={`w-5 h-5 text-green-600 ${refreshing ? 'animate-spin' : ''}`} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Refresh</span>
                                    </button>
                                </div>

                                {sessions.length > 0 && (
                                    <p className="text-xs text-gray-400 mt-6">
                                        {sessions.length} conversation{sessions.length !== 1 ? 's' : ''} available &bull; {activeCount} active
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* New Chat Drawer (right side) */}
            <SlideInDrawer
                isOpen={showNewChatModal}
                onClose={() => { setShowNewChatModal(false); setChatFormErrors({}) }}
                title="New Chat Session"
                description="Start a new conversation with a customer"
                size="md"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setShowNewChatModal(false)}
                            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                        >Cancel</button>
                        <button
                            onClick={handleNewChat}
                            disabled={!newChatForm.customerName.trim()}
                            className="px-5 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 text-sm font-medium inline-flex items-center gap-2"
                        >
                            <UserPlus className="w-4 h-4" /> Start Chat
                        </button>
                    </div>
                }
            >
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={newChatForm.customerName}
                            onKeyDown={filterNameInput}
                            onChange={(e) => {
                                setNewChatForm(prev => ({ ...prev, customerName: e.target.value }))
                                const err = validateName(e.target.value, 'Customer Name')
                                setChatFormErrors(prev => { const n = { ...prev }; if (err) n.customerName = err; else delete n.customerName; return n })
                            }}
                            placeholder="Customer's full name"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${chatFormErrors.customerName ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        <FormFieldHint hint={FORMAT_HINTS.name} error={chatFormErrors.customerName} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
                        <input
                            type="email"
                            value={newChatForm.customerEmail}
                            onChange={(e) => {
                                setNewChatForm(prev => ({ ...prev, customerEmail: e.target.value }))
                                if (e.target.value) {
                                    const err = validateEmail(e.target.value)
                                    setChatFormErrors(prev => { const n = { ...prev }; if (err) n.customerEmail = err; else delete n.customerEmail; return n })
                                } else {
                                    setChatFormErrors(prev => { const n = { ...prev }; delete n.customerEmail; return n })
                                }
                            }}
                            placeholder="customer@example.com"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${chatFormErrors.customerEmail ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        <FormFieldHint hint={FORMAT_HINTS.email} error={chatFormErrors.customerEmail} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Initial Message</label>
                        <textarea
                            value={newChatForm.initialMessage}
                            onChange={(e) => setNewChatForm(prev => ({ ...prev, initialMessage: e.target.value }))}
                            placeholder="Type an optional welcome message..."
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm resize-none"
                        />
                        <FormFieldHint hint="Optional first message from customer's side" />
                    </div>
                </div>
            </SlideInDrawer>
        </div>
    )
}
