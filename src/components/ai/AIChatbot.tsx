'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MessageCircle,
    Send,
    X,
    Bot,
    User,
    Calendar,
    Sparkles,
    Loader2,
    CheckCircle2
} from 'lucide-react'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'
import { formatAIResponse } from '@/utils/formatAIResponse'

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

const INITIAL_BOOKING_DATA: Partial<BookingData> = {
    type: 'trial',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    childName: '',
    childAge: '',
    childGender: 'Prefer not to say',
    program: '',
    location: '',
    date: '',
    timeSlot: ''
}

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputMessage, setInputMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [conversationHistory, setConversationHistory] = useState<any[]>([])
    const [isBookingMode, setIsBookingMode] = useState(false)
    const [bookingData, setBookingData] = useState<Partial<BookingData>>(INITIAL_BOOKING_DATA)
    const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
    const [isBookingSubmitting, setIsBookingSubmitting] = useState(false)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const streamingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // Auto-scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages, scrollToBottom])

    // Cleanup streaming on unmount
    useEffect(() => {
        return () => {
            if (streamingIntervalRef.current) {
                clearInterval(streamingIntervalRef.current)
            }
        }
    }, [])

    // Streaming text animation
    const animateText = useCallback((text: string, messageId: string, suggestions?: string[]) => {
        if (streamingIntervalRef.current) {
            clearInterval(streamingIntervalRef.current)
        }

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
                setMessages(prev => prev.map(msg =>
                    msg.id === messageId
                        ? { ...msg, content: text, isStreaming: false, suggestions }
                        : msg
                ))
                setStreamingMessageId(null)
                streamingIntervalRef.current = null
                clearInterval(interval)
            }
        }, 40)

        streamingIntervalRef.current = interval
        return interval
    }, [scrollToBottom])

    // Initialize chat with welcome message
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

            const welcomeText = `Hi! I'm your ProActiv Sports AI Assistant! 👋

I can help you with:
🤸 Information about our programs (Gymnastics, Multi-Sports, Camps)
📅 Booking trial classes and assessments
📍 Location and schedule details
💰 Pricing information
❓ Any questions about ProActiv Fitness

How can I help you today?`

            const suggestions = [
                'Book a free trial class',
                'Book an assessment',
                'Tell me about programs',
                'What are your locations?',
                'Pricing information'
            ]

            setTimeout(() => {
                animateText(welcomeText, welcomeMessageId, suggestions)
            }, 500)
        }
    }, [isOpen, messages.length, animateText])

    /**
     * Detects booking intent from AI response - handles both
     * AI-powered format (intent: "booking" + bookingIntent object)
     * and fallback format (intent: "book_trial" / "book_assessment")
     */
    const detectBookingIntent = (data: any): { shouldBook: boolean; type: 'trial' | 'assessment'; extractedData: Partial<BookingData> } => {
        const intent = data.intent || ''
        const bookingIntent = data.bookingIntent

        // Case 1: Fallback mode returns intent directly as book_trial/book_assessment
        if (intent === 'book_trial' || intent === 'book_assessment') {
            return {
                shouldBook: true,
                type: intent === 'book_assessment' ? 'assessment' : 'trial',
                extractedData: {
                    childName: bookingIntent?.childName || '',
                    childAge: bookingIntent?.childAge?.toString() || '',
                    program: bookingIntent?.programType || bookingIntent?.program || '',
                    location: bookingIntent?.preferredLocation || bookingIntent?.location || '',
                }
            }
        }

        // Case 2: AI-powered mode returns intent "booking" with bookingIntent object
        if (intent === 'booking' && bookingIntent) {
            const programType = (bookingIntent.programType || '').toLowerCase()
            const isAssessment = programType.includes('assessment') ||
                (typeof bookingIntent === 'object' && bookingIntent.type === 'assessment')

            return {
                shouldBook: true,
                type: isAssessment ? 'assessment' : 'trial',
                extractedData: {
                    childName: bookingIntent.childName || '',
                    childAge: bookingIntent.childAge?.toString() || '',
                    program: bookingIntent.programType || '',
                    location: bookingIntent.preferredLocation || '',
                }
            }
        }

        // Case 3: Check if bookingIntent has nested intent field
        if (bookingIntent && typeof bookingIntent === 'object') {
            const nestedIntent = bookingIntent.intent || ''
            if (nestedIntent === 'book_trial' || nestedIntent === 'book_assessment') {
                return {
                    shouldBook: true,
                    type: nestedIntent === 'book_assessment' ? 'assessment' : 'trial',
                    extractedData: {
                        childName: bookingIntent.childName || '',
                        childAge: bookingIntent.childAge?.toString() || '',
                        program: bookingIntent.programType || bookingIntent.program || '',
                        location: bookingIntent.preferredLocation || bookingIntent.location || '',
                    }
                }
            }
        }

        return { shouldBook: false, type: 'trial', extractedData: {} }
    }

    // Send message to AI
    const sendMessage = async (message: string) => {
        if (!message.trim() || streamingMessageId) return

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: message,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputMessage('')
        setIsLoading(true)

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
            const result = await apiClient.post<any>('/ai/chat', {
                message: message,
                conversationHistory: conversationHistory
            })

            const data = result?.data
            if (data) {
                // Safely extract the response text
                let responseText = data.response || data.message || ''
                if (typeof responseText === 'object') {
                    responseText = formatAIResponse(responseText)
                }
                if (!responseText || responseText.trim() === '') {
                    responseText = "I'm here to help! Could you tell me more about what you're looking for? I can help with program info, booking trials, locations, and pricing."
                }

                // Start streaming animation
                animateText(responseText, aiMessageId, data.suggestions)
                setConversationHistory(data.conversationHistory || [])

                // Detect booking intent using unified logic
                const bookingDetection = detectBookingIntent(data)
                if (bookingDetection.shouldBook) {
                    setIsBookingMode(true)
                    setBookingData({
                        ...INITIAL_BOOKING_DATA,
                        type: bookingDetection.type,
                        ...bookingDetection.extractedData,
                    })
                }
            } else {
                throw new Error(result?.message || 'Failed to get response')
            }
        } catch (error: any) {
            console.error('Chat error:', error)
            const errorText = "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or contact our team directly at info@proactivsports.net"
            animateText(errorText, aiMessageId)
        }
    }

    // Handle suggestion click
    const handleSuggestionClick = (suggestion: string) => {
        if (!streamingMessageId) {
            sendMessage(suggestion)
        }
    }

    // Handle booking form field changes
    const handleBookingInput = (field: string, value: string) => {
        setBookingData(prev => ({ ...prev, [field]: value }))
    }

    // Validate booking data
    const isBookingValid = (): boolean => {
        return !!(
            bookingData.parentName?.trim() &&
            bookingData.parentEmail?.trim() &&
            bookingData.parentPhone?.trim() &&
            bookingData.childName?.trim() &&
            bookingData.childAge?.trim() &&
            bookingData.program &&
            bookingData.location &&
            bookingData.date &&
            bookingData.timeSlot
        )
    }

    // Complete booking
    const completeBooking = async () => {
        if (!isBookingValid()) {
            toast.error('Please fill in all required fields')
            return
        }

        setIsBookingSubmitting(true)
        try {
            const result = await apiClient.post<any>('/ai/book-via-chat', bookingData)

            if (result?.data) {
                const confirmationText = typeof result.data.confirmationMessage === 'string'
                    ? result.data.confirmationMessage
                    : `Your ${bookingData.type === 'assessment' ? 'assessment' : 'trial class'} booking has been confirmed! We will contact you at ${bookingData.parentEmail} with more details.`

                const confirmationMessage: Message = {
                    id: Date.now().toString(),
                    type: 'ai',
                    content: confirmationText,
                    timestamp: new Date(),
                    suggestions: ['Book another class', 'Tell me about programs', 'Contact support']
                }
                setMessages(prev => [...prev, confirmationMessage])
                setIsBookingMode(false)
                setBookingData(INITIAL_BOOKING_DATA)
                toast.success('Booking confirmed successfully!')
            } else {
                throw new Error(result?.message || 'Booking failed')
            }
        } catch (error: any) {
            console.error('Booking error:', error)
            const errorMsg = error?.response?.data?.message || error?.message || 'Unknown error'
            toast.error(`Booking failed: ${errorMsg}`)
            const errorMessage: Message = {
                id: Date.now().toString(),
                type: 'ai',
                content: `Sorry, there was an issue with your booking: ${errorMsg}. Please try again or contact us directly at info@proactivsports.net`,
                timestamp: new Date(),
                suggestions: ['Try booking again', 'Contact support']
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsBookingSubmitting(false)
        }
    }

    // Cancel booking
    const cancelBooking = () => {
        setIsBookingMode(false)
        setBookingData(INITIAL_BOOKING_DATA)
        const cancelMessage: Message = {
            id: Date.now().toString(),
            type: 'ai',
            content: "No problem! The booking form has been closed. How else can I help you?",
            timestamp: new Date(),
            suggestions: ['Book a trial class', 'Tell me about programs', 'Pricing information']
        }
        setMessages(prev => [...prev, cancelMessage])
    }

    return (
        <>
            {/* Chat Toggle Button */}
            <motion.button
                id="ai-chatbot-toggle-btn"
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
                        className="fixed bottom-24 right-6 z-40 w-96 h-[550px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold">ProActiv AI Assistant</h3>
                                <p className="text-xs text-blue-100">Always here to help!</p>
                            </div>
                            <Sparkles className="w-5 h-5 text-yellow-300" />
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                                                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                                                    {typeof message.content === 'string'
                                                        ? message.content
                                                        : formatAIResponse(message.content)}
                                                    {message.isStreaming && (
                                                        <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse"></span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Suggestions */}
                                        {message.suggestions && message.suggestions.length > 0 && !message.isStreaming && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {message.suggestions.map((suggestion, index) => (
                                                    <button
                                                        id={`ai-chatbot-suggestion-${index}-btn`}
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

                            {/* Booking Form - Inline */}
                            {isBookingMode && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3"
                                >
                                    <div className="flex items-center gap-2 text-blue-700">
                                        <Calendar className="w-4 h-4" />
                                        <h4 className="font-semibold text-sm">
                                            Book {bookingData.type === 'assessment' ? 'Assessment' : 'Free Trial Class'}
                                        </h4>
                                    </div>

                                    {/* Booking Type Toggle */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleBookingInput('type', 'trial')}
                                            className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${bookingData.type === 'trial'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            Trial Class
                                        </button>
                                        <button
                                            onClick={() => handleBookingInput('type', 'assessment')}
                                            className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${bookingData.type === 'assessment'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            Assessment
                                        </button>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <label className="block text-gray-700 font-medium text-xs">Parent Name *</label>
                                            <input
                                                type="text"
                                                value={bookingData.parentName || ''}
                                                onChange={(e) => handleBookingInput('parentName', e.target.value)}
                                                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Your full name"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-gray-700 font-medium text-xs">Email *</label>
                                                <input
                                                    type="email"
                                                    value={bookingData.parentEmail || ''}
                                                    onChange={(e) => handleBookingInput('parentEmail', e.target.value)}
                                                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="email@example.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-medium text-xs">Phone *</label>
                                                <input
                                                    type="tel"
                                                    value={bookingData.parentPhone || ''}
                                                    onChange={(e) => handleBookingInput('parentPhone', e.target.value)}
                                                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="+852 1234 5678"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-gray-700 font-medium text-xs">Child Name *</label>
                                                <input
                                                    type="text"
                                                    value={bookingData.childName || ''}
                                                    onChange={(e) => handleBookingInput('childName', e.target.value)}
                                                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Child's name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-medium text-xs">Age *</label>
                                                <input
                                                    type="number"
                                                    value={bookingData.childAge || ''}
                                                    onChange={(e) => handleBookingInput('childAge', e.target.value)}
                                                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Age"
                                                    min="2"
                                                    max="18"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-medium text-xs">Program *</label>
                                            <select
                                                id="ai-chatbot-booking-program-select"
                                                value={bookingData.program || ''}
                                                onChange={(e) => handleBookingInput('program', e.target.value)}
                                                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select program</option>
                                                <option value="gymnastics">Gymnastics</option>
                                                <option value="multi-sports">Multi-Sports</option>
                                                <option value="holiday-camps">Holiday Camps</option>
                                                <option value="birthday-parties">Birthday Parties</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-gray-700 font-medium text-xs">Location *</label>
                                                <select
                                                    id="ai-chatbot-booking-location-select"
                                                    value={bookingData.location || ''}
                                                    onChange={(e) => handleBookingInput('location', e.target.value)}
                                                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">Select location</option>
                                                    <option value="cyberport">Cyberport</option>
                                                    <option value="wan-chai">Wan Chai</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-medium text-xs">Date *</label>
                                                <input
                                                    type="date"
                                                    value={bookingData.date || ''}
                                                    onChange={(e) => handleBookingInput('date', e.target.value)}
                                                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-medium text-xs">Time Slot *</label>
                                            <select
                                                id="ai-chatbot-booking-timeslot-select"
                                                value={bookingData.timeSlot || ''}
                                                onChange={(e) => handleBookingInput('timeSlot', e.target.value)}
                                                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                            id="ai-chatbot-complete-booking-btn"
                                            onClick={completeBooking}
                                            disabled={!isBookingValid() || isBookingSubmitting}
                                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2"
                                        >
                                            {isBookingSubmitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Booking...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Complete Booking
                                                </>
                                            )}
                                        </button>
                                        <button
                                            id="ai-chatbot-cancel-booking-btn"
                                            onClick={cancelBooking}
                                            disabled={isBookingSubmitting}
                                            className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </motion.div>
                            )}

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
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey && !streamingMessageId) {
                                            e.preventDefault()
                                            sendMessage(inputMessage)
                                        }
                                    }}
                                    placeholder="Type your message..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    disabled={isLoading || !!streamingMessageId}
                                />
                                <button
                                    id="ai-chatbot-send-btn"
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
