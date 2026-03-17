'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import NotificationService from '@/services/modules/notification.service'
import { Send, AlertCircle } from 'lucide-react'

export default function LiveChat() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [messages, setMessages] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        const loadChats = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await NotificationService.getNotifications({ limit: 10 })
                setMessages(data.notifications || [])
            } catch (err) {
                console.error('Error loading chats:', err)
                setError('Failed to load chats')
            } finally {
                setLoading(false)
            }
        }

        loadChats()
    }, [isAuthenticated, router])

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return
        try {
            await NotificationService.createNotification({
                userId: selectedCustomer?.id || '',
                type: 'message',
                title: 'New Message',
                message: newMessage,
                isRead: false,
                isPinned: false,
                priority: 'medium',
                channels: ['in-app']
            })
            setNewMessage('')
        } catch (err) {
            console.error('Error sending message:', err)
            setError('Failed to send message')
        }
    }

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Live Chat</h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
                    {/* Customer List */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="font-semibold text-gray-900">Conversations</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                        <p className="text-gray-600 text-sm">Loading...</p>
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        onClick={() => setSelectedCustomer(msg)}
                                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedCustomer?.id === msg.id ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <p className="font-medium text-gray-900 text-sm">{msg.title}</p>
                                        <p className="text-gray-600 text-xs mt-1 line-clamp-1">{msg.message}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="lg:col-span-3 bg-white rounded-lg shadow-md flex flex-col">
                        {selectedCustomer ? (
                            <>
                                <div className="p-4 border-b border-gray-200">
                                    <h2 className="font-semibold text-gray-900">{selectedCustomer.title}</h2>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    <div className="bg-gray-100 rounded-lg p-4 max-w-xs">
                                        <p className="text-gray-900 text-sm">{selectedCustomer.message}</p>
                                        <p className="text-gray-500 text-xs mt-2">
                                            {new Date(selectedCustomer.createdAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4 border-t border-gray-200">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder="Type a message..."
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500">Select a conversation to start chatting</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
