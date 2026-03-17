'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MessageCircle,
    Send,
    X,
    Bot,
    User,
    Calendar,
    MapPin,
    Clock,
    Phone,
    Mail,
    Sparkles,
    Loader2
} from 'lucide-react'

interface Message {
    id: string
    type: 'user' | 'ai'
    content: string
    timestamp: Date
    suggestions?: string[]
    isStreaming?: boolean
}

interface BookingData {
    type: 'trial' | 'assessment'
    parentName: string
    parentEmail: string
    parentPhone: string
    childName: string
    childAge: string
    childGender: string
    program: string
    location: string
    date: string
    timeSlot: string
}

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputMessage, setInputMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [conversationHistory, setConversationHistory] = useState<any[]>([])
    const [isBookingMode, setIsBookingMode] = useState(false)
    const [bookingData, setBookingData] = useState<Partial<BookingData>>({})
    const [bookingStep, setBookingStep] = useState(0)
    const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Streaming text animation
    const animateText = (text: string, messageId: string, suggestions?: string[]) => {
        const words = text.split(' ')
        let currentText = ''
        let wordIndex = 0

        const interval = setInterval(() => {
            if (wordIndex < words.length) {
                currentText += (wordIndex > 0 ? ' ' : '') + words[wordIndex]

                setMessages(prev => prev.map(msg =>
                    msg.id === messageId
                        ? { ...msg, content: currentText, isStreaming: true }
                        : msg
                ))

                wordIndex++
                scrollToBottom()
            } else {
                // Animation complete
                setMessages(prev => prev.map(msg =>
                    msg.id === messageId
                        ? { ...msg, content: text, isStreaming: false, suggestions }
                        : msg
                ))
                setStreamingMessageId(null)
                clearInterval(interval)
            }
        }, 50) // Adjust speed here (lower = faster)

        return interval
    }

    // Initialize chat
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcomeMessageId = Date.now().toString()
            const welcomeMessage: Message = {
                id: welcomeMessageId,
                type: 'ai',
                content: '',
                timestamp: new Date(),
                isStreaming: true
            }

            setMessages([welcomeMessage])
            setStreamingMessageId(welcomeMessageId)

            const welcomeText = `👋 Hi! I'm your ProActive Sports AI Assistant! 

I can help you with:
🤸‍♀️ Information about our programs
📅 Booking trial classes and assessments  
📍 Location and schedule details
💰 Pricing information
❓ Answering any questions

How can I help you today?`

            const suggestions = [
                'Book a free trial class',
                'Schedule an assessment',
                'Tell me about programs',
                'What are your locations?',
                'Pricing information'
            ]

            // Start streaming animation for welcome message
            setTimeout(() => {
                animateText(welcomeText, welcomeMessageId, suggestions)
            }, 500)
        }
    }, [isOpen, messages.length])

    // Send message to AI
    const sendMessage = async (message: string) => {
        if (!message.trim()) return

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: message,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputMessage('')
        setIsLoading(true)

        // Create placeholder AI message for streaming
        const aiMessageId = (Date.now() + 1).toString()
        const placeholderMessage: Message = {
            id: aiMessageId,
            type: 'ai',
            content: '',
            timestamp: new Date(),
            isStreaming: true
        }

        setMessages(prev => [...prev, placeholderMessage])
        setStreamingMessageId(aiMessageId)
        setIsLoading(false)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    conversationHistory: conversationHistory
                })
            })

            const result = await response.json()

            if (result.success) {
                // Start streaming animation
                animateText(result.response, aiMessageId, result.suggestions)
                setConversationHistory(result.conversationHistory)

                // Check if user wants to book
                if (result.intent && (result.intent.intent === 'book_trial' || result.intent.intent === 'book_assessment')) {
                    setIsBookingMode(true)
                    setBookingData({
                        type: result.intent.intent === 'book_trial' ? 'trial' : 'assessment',
                        childName: result.intent.childName || '',
                        childAge: result.intent.childAge || '',
                        program: result.intent.program || '',
                        location: result.intent.location || '',
                        parentName: '',
                        parentEmail: '',
                        parentPhone: '',
                        childGender: 'Prefer not to say',
                        date: '',
                        timeSlot: ''
                    })
                    setBookingStep(1)
                }
            } else {
                throw new Error(result.message)
            }
        } catch (error) {
            console.error('Chat error:', error)
            const errorText = "I apologize, but I'm having trouble right now. Please try again or contact our staff directly at +852 1234 5678."
            animateText(errorText, aiMessageId)
        }
    }

    // Handle suggestion click
    const handleSuggestionClick = (suggestion: string) => {
        if (!streamingMessageId) {
            sendMessage(suggestion)
        }
    }

    // Handle booking flow
    const handleBookingInput = (field: string, value: string) => {
        setBookingData(prev => ({ ...prev, [field]: value }))
    }

    // Complete booking
    const completeBooking = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ai/book-via-chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            })

            const result = await response.json()

            if (result.success) {
                const confirmationMessage: Message = {
                    id: Date.now().toString(),
                    type: 'ai',
                    content: result.confirmationMessage,
                    timestamp: new Date()
                }
                setMessages(prev => [...prev, confirmationMessage])
                setIsBookingMode(false)
                setBookingData({})
                setBookingStep(0)
            } else {
                throw new Error(result.message)
            }
        } catch (error) {
            console.error('Booking error:', error)
            const errorMessage: Message = {
                id: Date.now().toString(),
                type: 'ai',
                content: `Sorry, there was an error with your booking: ${error.message}. Please try again or contact us directly.`,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            {/* Chat Toggle Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        className="fixed bottom-24 right-6 z-40 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold">ProActive AI Assistant</h3>
                                <p className="text-xs text-blue-100">Always here to help! 🤸‍♀️</p>
                            </div>
                            <Sparkles className="w-5 h-5 text-yellow-300" />
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Booking Form */}
                            {isBookingMode && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3"
                                >
                                    <div className="flex items-center gap-2 text-blue-700">
                                        <Calendar className="w-4 h-4" />
                                        <h4 className="font-semibold">
                                            Book {bookingData.type === 'assessment' ? 'Assessment' : 'Trial Class'}
                                        </h4>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <label className="block text-gray-700 font-medium">Parent Name</label>
                                            <input
                                                type="text"
                                                value={bookingData.parentName || ''}
                                                onChange={(e) => handleBookingInput('parentName', e.target.value)}
                                                className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Your full name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-medium">Email</label>
                                            <input
                                                type="email"
                                                value={bookingData.parentEmail || ''}
                                                onChange={(e) => handleBookingInput('parentEmail', e.target.value)}
                                                className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="your.email@example.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-medium">Phone</label>
                                            <input
                                                type="tel"
                                                value={bookingData.parentPhone || ''}
                                                onChange={(e) => handleBookingInput('parentPhone', e.target.value)}
                                                className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="+852 1234 5678"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-medium">Child Name</label>
                                            <input
                                                type="text"
                                                value={bookingData.childName || ''}
                                                onChange={(e) => handleBookingInput('childName', e.target.value)}
                                                className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Child's name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-medium">Child Age</label>
                                            <input
                                                type="number"
                                                value={bookingData.childAge || ''}
                                                onChange={(e) => handleBookingInput('childAge', e.target.value)}
                                                className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Age in years"
                                                min="1"
                                                max="18"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-medium">Program</label>
                                            <select
                                                value={bookingData.program || ''}
                                                onChange={(e) => handleBookingInput('program', e.target.value)}
                                                className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select program</option>
                                                <option value="gymnastics">Gymnastics</option>
                                                <option value="multi-sports">Multi-Sports</option>
                                                <option value="camps">Holiday Camps</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-medium">Location</label>
                                            <select
                                                value={bookingData.location || ''}
                                                onChange={(e) => handleBookingInput('location', e.target.value)}
                                                className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select location</option>
                                                <option value="cyberport">Cyberport</option>
                                                <option value="wan-chai">Wan Chai</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-medium">Preferred Date</label>
                                            <input
                                                type="date"
                                                value={bookingData.date || ''}
                                                onChange={(e) => handleBookingInput('date', e.target.value)}
                                                className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-medium">Time Slot</label>
                                            <select
                                                value={bookingData.timeSlot || ''}
                                                onChange={(e) => handleBookingInput('timeSlot', e.target.value)}
                                                className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select time</option>
                                                <option value="09:00">9:00 AM</option>
                                                <option value="10:00">10:00 AM</option>
                                                <option value="11:00">11:00 AM</option>
                                                <option value="14:00">2:00 PM</option>
                                                <option value="15:00">3:00 PM</option>
                                                <option value="16:00">4:00 PM</option>
                                                <option value="17:00">5:00 PM</option>
                                                <option value="18:00">6:00 PM</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={completeBooking}
                                            disabled={!bookingData.parentName || !bookingData.parentEmail || !bookingData.parentPhone ||
                                                !bookingData.childName || !bookingData.childAge || !bookingData.program ||
                                                !bookingData.location || !bookingData.date || !bookingData.timeSlot}
                                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                        >
                                            Complete Booking
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsBookingMode(false)
                                                setBookingData({})
                                                setBookingStep(0)
                                            }}
                                            className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                                        <div className={`flex items-start gap-2 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                {message.type === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                                            </div>
                                            <div className={`rounded-2xl px-4 py-2 ${message.type === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                <p className="text-sm whitespace-pre-wrap">
                                                    {message.content}
                                                    {message.isStreaming && (
                                                        <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse"></span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Suggestions */}
                                        {message.suggestions && message.suggestions.length > 0 && !message.isStreaming && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {message.suggestions.map((suggestion, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleSuggestionClick(suggestion)}
                                                        disabled={!!streamingMessageId}
                                                        className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Loading indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                            <Bot className="w-3 h-3 text-gray-600" />
                                        </div>
                                        <div className="bg-gray-100 rounded-2xl px-4 py-2 flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                                            <span className="text-sm text-gray-600">Thinking...</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-gray-200">
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && !streamingMessageId && sendMessage(inputMessage)}
                                    placeholder="Type your message..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    disabled={isLoading || !!streamingMessageId}
                                />
                                <button
                                    onClick={() => sendMessage(inputMessage)}
                                    disabled={isLoading || !inputMessage.trim() || !!streamingMessageId}
                                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
