'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supportStaffService } from '@/services/supportStaffService'
import { Megaphone, MessageSquare, Bell, Send, AlertCircle, Clock, User, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { validateRequired, validateTextArea, FORMAT_HINTS } from '@/utils/validation'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { toast } from 'sonner'

const RECIPIENTS_OPTIONS = [
    { value: 'all', label: 'All Staff' },
    { value: 'support-team', label: 'Support Team' },
    { value: 'managers', label: 'Managers' },
]
const PRIORITIES = ['low', 'medium', 'high'] as const

const emptyMsgForm = { subject: '', message: '', recipients: 'all', priority: 'low' as 'low' | 'medium' | 'high' }
const emptyAnnForm = { title: '', content: '', priority: 'low' as 'low' | 'medium' | 'high' }

export default function Communication() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'announcements' | 'messages'>('announcements')
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [messages, setMessages] = useState<any[]>([])

    // Drawers
    const [msgDrawerOpen, setMsgDrawerOpen] = useState(false)
    const [annDrawerOpen, setAnnDrawerOpen] = useState(false)
    const [msgForm, setMsgForm] = useState(emptyMsgForm)
    const [annForm, setAnnForm] = useState(emptyAnnForm)
    const [submitting, setSubmitting] = useState(false)
    const [msgErrors, setMsgErrors] = useState<Record<string, string>>({})
    const [annErrors, setAnnErrors] = useState<Record<string, string>>({})

    const loadData = async () => {
        setLoading(true)
        setError(null)
        try {
            const [annRes, msgRes] = await Promise.all([
                supportStaffService.getAnnouncements(),
                supportStaffService.getTeamMessages(),
            ])
            setAnnouncements(annRes?.announcements || [])
            setMessages(msgRes?.messages || [])
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to load communication data')
            setAnnouncements([])
            setMessages([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return }
        loadData()
    }, [isAuthenticated, router])

    const validateMsgForm = () => {
        const e: Record<string, string> = {}
        const s = validateRequired(msgForm.subject, 'Subject'); if (s) e.subject = s
        const m = validateTextArea(msgForm.message, 'Message', 1, 5000); if (m) e.message = m
        return e
    }

    const validateAnnForm = () => {
        const e: Record<string, string> = {}
        const t = validateRequired(annForm.title, 'Title'); if (t) e.title = t
        const c = validateTextArea(annForm.content, 'Content', 5, 5000); if (c) e.content = c
        return e
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        const errs = validateMsgForm()
        setMsgErrors(errs)
        if (Object.keys(errs).length > 0) return
        setSubmitting(true)
        try {
            await supportStaffService.sendTeamMessage(msgForm)
            setMsgForm(emptyMsgForm)
            setMsgDrawerOpen(false)
            toast.success('Message sent')
            setActiveTab('messages')
            await loadData()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to send message')
        } finally {
            setSubmitting(false)
        }
    }

    const handleCreateAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault()
        const errs = validateAnnForm()
        setAnnErrors(errs)
        if (Object.keys(errs).length > 0) return
        setSubmitting(true)
        try {
            await (supportStaffService as any).createAnnouncement(annForm)
            setAnnForm(emptyAnnForm)
            setAnnDrawerOpen(false)
            toast.success('Announcement published')
            await loadData()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to publish announcement')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteAnnouncement = async (a: any) => {
        if (!confirm(`Delete announcement "${a.title}"?`)) return
        try {
            await (supportStaffService as any).deleteAnnouncement(a.announcementId || a.id)
            toast.success('Announcement deleted')
            await loadData()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to delete')
        }
    }

    const handleDeleteMessage = async (m: any) => {
        if (!confirm(`Delete message "${m.subject}"?`)) return
        try {
            await (supportStaffService as any).deleteTeamMessage(m.messageId || m.id)
            toast.success('Message deleted')
            await loadData()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to delete')
        }
    }

    const unreadCount = messages.filter((m: any) => !m.read).length
    const sentTodayCount = messages.filter((m: any) => {
        if (!m.timestamp) return false
        const today = new Date().toISOString().split('T')[0]
        return String(m.timestamp).startsWith(today)
    }).length

    const priorityBadge = (priority: string) => {
        const colors: Record<string, string> = {
            high: 'bg-red-100 text-red-700 border border-red-200',
            medium: 'bg-orange-100 text-orange-700 border border-orange-200',
            low: 'bg-green-100 text-green-700 border border-green-200',
        }
        return colors[priority] || colors.low
    }

    if (!isAuthenticated) return null

    return (
        <div>
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Communication</h1>
                        <p className="text-sm text-gray-500 mt-1">Announcements and team messages</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={loadData}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        {activeTab === 'announcements' ? (
                            <button
                                id="staff-comm-btn-new-ann"
                                onClick={() => { setAnnForm(emptyAnnForm); setAnnErrors({}); setAnnDrawerOpen(true) }}
                                className="bg-cyan-600 text-white px-5 py-2 rounded-lg hover:bg-cyan-700 inline-flex items-center gap-2 text-sm font-medium shadow-sm"
                            >
                                <Plus className="w-4 h-4" /> New Announcement
                            </button>
                        ) : (
                            <button
                                id="staff-comm-btn-new-msg"
                                onClick={() => { setMsgForm(emptyMsgForm); setMsgErrors({}); setMsgDrawerOpen(true) }}
                                className="bg-cyan-600 text-white px-5 py-2 rounded-lg hover:bg-cyan-700 inline-flex items-center gap-2 text-sm font-medium shadow-sm"
                            >
                                <Send className="w-4 h-4" /> New Message
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <Megaphone className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Announcements</p>
                        <p className="text-2xl font-bold text-gray-900">{announcements.length}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Team Messages</p>
                        <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <Bell className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Unread</p>
                        <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <Send className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Sent Today</p>
                        <p className="text-2xl font-bold text-gray-900">{sentTodayCount}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex gap-4 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('announcements')}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors text-sm ${activeTab === 'announcements' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                    >
                        Announcements ({announcements.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('messages')}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors text-sm ${activeTab === 'messages' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                    >
                        Team Messages ({messages.length})
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'announcements' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {announcements.length === 0 ? (
                                    <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm">
                                        <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 text-lg">No announcements yet</p>
                                    </div>
                                ) : (
                                    announcements.map((a: any) => (
                                        <div key={a.id || a.announcementId} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100">
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="font-semibold text-gray-900 text-lg flex-1 mr-2">{a.title}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap capitalize ${priorityBadge(a.priority)}`}>
                                                        {a.priority || 'low'}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteAnnouncement(a)}
                                                        className="text-gray-400 hover:text-red-600"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-4 whitespace-pre-wrap">{a.content}</p>
                                            <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                                                <div className="flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5" />
                                                    <span>{a.author || 'System'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{a.publishedAt ? new Date(a.publishedAt).toLocaleString() : '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'messages' && (
                            <div className="space-y-4">
                                {messages.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 text-lg">No team messages yet</p>
                                    </div>
                                ) : (
                                    messages.map((m: any) => (
                                        <div key={m.id || m.messageId} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow border border-gray-100 flex gap-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-semibold text-sm">
                                                    {(m.sender || 'U').charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-gray-900">{m.sender || 'Unknown'}</span>
                                                    <span className="text-sm text-gray-500">— {m.subject}</span>
                                                </div>
                                                <p className="text-gray-600 text-sm mb-2 whitespace-pre-wrap">{m.content || m.message}</p>
                                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{m.timestamp ? new Date(m.timestamp).toLocaleString() : '-'}</span>
                                                    </div>
                                                    <span className="capitalize">→ {m.recipients}</span>
                                                    {m.priority && (
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${priorityBadge(m.priority)}`}>
                                                            {m.priority}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteMessage(m)}
                                                className="text-gray-400 hover:text-red-600 flex-shrink-0"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* SEND MESSAGE DRAWER (right side) */}
            <SlideInDrawer
                isOpen={msgDrawerOpen}
                onClose={() => { setMsgDrawerOpen(false); setMsgForm(emptyMsgForm); setMsgErrors({}) }}
                title="New Team Message"
                description="Send a message to your team"
                size="md"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => { setMsgDrawerOpen(false); setMsgForm(emptyMsgForm) }}
                            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                        >Cancel</button>
                        <button
                            type="submit"
                            form="msg-form"
                            disabled={submitting}
                            className="px-5 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 inline-flex items-center gap-2 text-sm font-medium"
                        >
                            {submitting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Send className="w-4 h-4" />}
                            {submitting ? 'Sending…' : 'Send Message'}
                        </button>
                    </div>
                }
            >
                <form id="msg-form" onSubmit={handleSendMessage} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={msgForm.subject}
                            onChange={(e) => {
                                setMsgForm({ ...msgForm, subject: e.target.value })
                                const err = validateRequired(e.target.value, 'Subject')
                                setMsgErrors(p => { const n = { ...p }; if (err) n.subject = err; else delete n.subject; return n })
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${msgErrors.subject ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Message subject"
                        />
                        <FormFieldHint hint={FORMAT_HINTS.subject} error={msgErrors.subject} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message <span className="text-red-500">*</span></label>
                        <textarea
                            rows={6}
                            value={msgForm.message}
                            onChange={(e) => {
                                setMsgForm({ ...msgForm, message: e.target.value })
                                const err = validateTextArea(e.target.value, 'Message', 1, 5000)
                                setMsgErrors(p => { const n = { ...p }; if (err) n.message = err; else delete n.message; return n })
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none ${msgErrors.message ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Type your message…"
                        />
                        <FormFieldHint hint={FORMAT_HINTS.message} error={msgErrors.message} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
                            <select
                                value={msgForm.recipients}
                                onChange={(e) => setMsgForm({ ...msgForm, recipients: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                {RECIPIENTS_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                value={msgForm.priority}
                                onChange={(e) => setMsgForm({ ...msgForm, priority: e.target.value as any })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 capitalize"
                            >
                                {PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                            </select>
                        </div>
                    </div>
                </form>
            </SlideInDrawer>

            {/* NEW ANNOUNCEMENT DRAWER (right side) */}
            <SlideInDrawer
                isOpen={annDrawerOpen}
                onClose={() => { setAnnDrawerOpen(false); setAnnForm(emptyAnnForm); setAnnErrors({}) }}
                title="New Announcement"
                description="Publish a team-wide announcement"
                size="md"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => { setAnnDrawerOpen(false); setAnnForm(emptyAnnForm) }}
                            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                        >Cancel</button>
                        <button
                            type="submit"
                            form="ann-form"
                            disabled={submitting}
                            className="px-5 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 inline-flex items-center gap-2 text-sm font-medium"
                        >
                            {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                            {submitting ? 'Publishing…' : 'Publish'}
                        </button>
                    </div>
                }
            >
                <form id="ann-form" onSubmit={handleCreateAnnouncement} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={annForm.title}
                            onChange={(e) => {
                                setAnnForm({ ...annForm, title: e.target.value })
                                const err = validateRequired(e.target.value, 'Title')
                                setAnnErrors(p => { const n = { ...p }; if (err) n.title = err; else delete n.title; return n })
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${annErrors.title ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Announcement title"
                        />
                        <FormFieldHint hint="" error={annErrors.title} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content <span className="text-red-500">*</span></label>
                        <textarea
                            rows={6}
                            value={annForm.content}
                            onChange={(e) => {
                                setAnnForm({ ...annForm, content: e.target.value })
                                const err = validateTextArea(e.target.value, 'Content', 5, 5000)
                                setAnnErrors(p => { const n = { ...p }; if (err) n.content = err; else delete n.content; return n })
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none ${annErrors.content ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Announcement details…"
                        />
                        <FormFieldHint hint="Min 5 characters" error={annErrors.content} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                            value={annForm.priority}
                            onChange={(e) => setAnnForm({ ...annForm, priority: e.target.value as any })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 capitalize"
                        >
                            {PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                        </select>
                    </div>
                </form>
            </SlideInDrawer>
        </div>
    )
}
