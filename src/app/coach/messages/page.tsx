'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Plus, Send, Search, Trash2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { coachService, type ChatConversation } from '@/services/modules/coach.service'

export default function CoachMessagesPage() {
    const [conversations, setConversations] = useState<ChatConversation[]>([])
    const [loading, setLoading] = useState(true)
    const [activeConvo, setActiveConvo] = useState<ChatConversation | null>(null)
    const [composerOpen, setComposerOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    // Composer state
    const [toUserId, setToUserId] = useState('')
    const [body, setBody] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Reply state
    const [replyBody, setReplyBody] = useState('')

    const loadConversations = async () => {
        try {
            setLoading(true)
            const data = await coachService.getMessages()
            setConversations(Array.isArray(data) ? data : [])
        } catch (e: any) {
            toast.error(e?.message || 'Failed to load messages')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadConversations() }, [])

    const validateNewMsg = () => {
        const errs: Record<string, string> = {}
        if (!toUserId.trim()) errs.toUserId = 'Recipient user ID is required'
        else if (!/^[a-f0-9]{24}$/i.test(toUserId.trim())) errs.toUserId = 'Recipient must be a valid user ID (24-char hex)'
        if (!body.trim()) errs.body = 'Message body is required'
        else if (body.trim().length < 2) errs.body = 'Message too short'
        else if (body.length > 5000) errs.body = 'Message too long (max 5000 chars)'
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSendNew = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateNewMsg()) return
        try {
            setSubmitting(true)
            await coachService.sendMessage({ toUserId: toUserId.trim(), body: body.trim() })
            toast.success('Message sent')
            setComposerOpen(false)
            setToUserId(''); setBody(''); setErrors({})
            await loadConversations()
        } catch (e: any) {
            toast.error(e?.message || 'Send failed')
        } finally {
            setSubmitting(false)
        }
    }

    const handleReply = async () => {
        if (!activeConvo || !replyBody.trim()) return
        try {
            setSubmitting(true)
            await coachService.sendMessage({
                toUserId: activeConvo.otherUserId,
                body: replyBody.trim(),
                conversationId: activeConvo.conversationId,
            })
            setReplyBody('')
            await loadConversations()
            // Re-select updated conversation
            const updated = conversations.find(c => c.conversationId === activeConvo.conversationId)
            if (updated) setActiveConvo(updated)
        } catch (e: any) {
            toast.error(e?.message || 'Reply failed')
        } finally {
            setSubmitting(false)
        }
    }

    const openConversation = async (c: ChatConversation) => {
        setActiveConvo(c)
        if (c.unreadCount > 0) {
            try {
                await coachService.markConversationRead(c.conversationId)
                await loadConversations()
            } catch {}
        }
    }

    const filtered = conversations.filter(c =>
        !searchTerm || c.otherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <MessageCircle className="w-8 h-8 text-purple-600" />
                            <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
                        </div>
                        <p className="text-slate-600 text-sm">Communicate with parents and students</p>
                    </div>
                    <button
                        onClick={() => setComposerOpen(true)}
                        className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition"
                    >
                        <Plus className="w-4 h-4" /> New Message
                    </button>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Conversation list */}
                    <div className="bg-white rounded-lg shadow overflow-hidden lg:col-span-1">
                        <div className="p-4 border-b border-slate-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                        <div className="max-h-[600px] overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-2" />
                                    <p className="text-sm text-slate-500">Loading...</p>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="p-8 text-center">
                                    <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                    <p className="text-sm text-slate-600">No conversations yet</p>
                                    <p className="text-xs text-slate-500 mt-1">Click "New Message" to start one</p>
                                </div>
                            ) : (
                                filtered.map(c => (
                                    <button
                                        key={c.conversationId}
                                        onClick={() => openConversation(c)}
                                        className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition ${activeConvo?.conversationId === c.conversationId ? 'bg-purple-50' : ''}`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-sm text-slate-900">{c.otherName}</span>
                                            {c.unreadCount > 0 && (
                                                <span className="bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full">{c.unreadCount}</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-600 truncate">{c.lastMessage}</p>
                                        <p className="text-xs text-slate-400 mt-1">{new Date(c.lastMessageAt).toLocaleString()}</p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Active conversation */}
                    <div className="bg-white rounded-lg shadow overflow-hidden lg:col-span-2 flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
                        {!activeConvo ? (
                            <div className="flex-1 flex items-center justify-center text-center p-8">
                                <div>
                                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-600">Select a conversation to view messages</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="p-4 border-b border-slate-200">
                                    <h3 className="font-semibold text-slate-900">{activeConvo.otherName}</h3>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {activeConvo.messages.slice().reverse().map(m => (
                                        <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-md px-4 py-2 rounded-lg text-sm ${m.from === 'me' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-900'}`}>
                                                <p>{m.body}</p>
                                                <p className={`text-xs mt-1 ${m.from === 'me' ? 'text-purple-200' : 'text-slate-500'}`}>{new Date(m.createdAt).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 border-t border-slate-200 flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={replyBody}
                                        onChange={e => setReplyBody(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleReply() }}
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <button
                                        onClick={handleReply}
                                        disabled={submitting || !replyBody.trim()}
                                        className="px-4 py-2 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* New message drawer */}
                <SlideInDrawer
                    isOpen={composerOpen}
                    onClose={() => { setComposerOpen(false); setErrors({}) }}
                    title="New Message"
                    size="md"
                >
                    <form onSubmit={handleSendNew} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">Recipient User ID <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={toUserId}
                                onChange={e => { setToUserId(e.target.value); if (errors.toUserId) setErrors({ ...errors, toUserId: '' }) }}
                                placeholder="24-char Mongo user ID"
                                className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${errors.toUserId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-purple-500'}`}
                            />
                            {errors.toUserId && <p className="mt-1 text-xs text-red-600">{errors.toUserId}</p>}
                            <p className="mt-1 text-xs text-slate-500">In a finished build, this would be a Parent picker dropdown.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">Message <span className="text-red-500">*</span></label>
                            <textarea
                                value={body}
                                onChange={e => { setBody(e.target.value); if (errors.body) setErrors({ ...errors, body: '' }) }}
                                placeholder="Type your message..."
                                rows={5}
                                maxLength={5000}
                                className={`w-full px-3 py-2 border rounded text-sm resize-y focus:outline-none focus:ring-2 ${errors.body ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-purple-500'}`}
                            />
                            {errors.body && <p className="mt-1 text-xs text-red-600">{errors.body}</p>}
                            <p className="mt-1 text-xs text-slate-500">{body.length}/5000 characters</p>
                        </div>
                        <div className="flex gap-3 pt-4 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => { setComposerOpen(false); setErrors({}) }}
                                className="flex-1 px-4 py-2 border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50"
                            >
                                {submitting ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    </form>
                </SlideInDrawer>
            </div>
        </div>
    )
}
