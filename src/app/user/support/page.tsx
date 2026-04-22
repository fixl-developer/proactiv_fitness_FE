'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    HelpCircle,
    MessageSquare,
    Send,
    AlertCircle,
    CheckCircle2,
    Loader,
    Clock,
    User,
    Search,
    ChevronDown,
    Phone,
    Mail,
    MapPin
} from 'lucide-react'
import supportService from '@/services/modules/support.service'

interface SupportTicket {
    id: string
    subject: string
    description: string
    status: 'open' | 'in-progress' | 'resolved' | 'closed'
    priority: 'low' | 'medium' | 'high'
    createdAt: string
    updatedAt: string
    replies: number
}

interface FAQ {
    id: string
    question: string
    answer: string
    category: string
}

export default function SupportPage() {
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [activeTab, setActiveTab] = useState<'tickets' | 'faq' | 'contact'>('tickets')
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

    const [tickets, setTickets] = useState<SupportTicket[]>([])
    const [faqs, setFaqs] = useState<FAQ[]>([])
    const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all')

    const [newTicket, setNewTicket] = useState({
        subject: '',
        description: '',
        priority: 'medium' as const,
        category: 'general'
    })

    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [ticketsData, faqsData] = await Promise.all([
                supportService.getTickets(),
                supportService.getFAQs()
            ])
            setTickets(ticketsData || [])
            setFaqs(faqsData || [])
        } catch (error) {
            console.error('Failed to load support data:', error)
            setMessage({ type: 'error', text: 'Failed to load support data' })
        } finally {
            setLoading(false)
        }
    }

    const handleCreateTicket = async () => {
        if (!newTicket.subject || !newTicket.description) {
            setMessage({ type: 'error', text: 'Please fill in all fields' })
            return
        }

        try {
            setSubmitting(true)
            const ticket = await supportService.createTicket(newTicket)
            setTickets(prev => [ticket, ...prev])
            setNewTicket({ subject: '', description: '', priority: 'medium', category: 'general' })
            setMessage({ type: 'success', text: 'Support ticket created successfully' })
            setTimeout(() => setMessage(null), 3000)
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to create ticket' })
        } finally {
            setSubmitting(false)
        }
    }

    const handleContactSubmit = async () => {
        if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
            setMessage({ type: 'error', text: 'Please fill in all fields' })
            return
        }

        try {
            setSubmitting(true)
            await supportService.sendContactMessage(contactForm)
            setContactForm({ name: '', email: '', phone: '', subject: '', message: '' })
            setMessage({ type: 'success', text: 'Message sent successfully. We will contact you soon.' })
            setTimeout(() => setMessage(null), 3000)
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to send message' })
        } finally {
            setSubmitting(false)
        }
    }

    const filteredTickets = tickets.filter(ticket => {
        const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus
        const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesStatus && matchesSearch
    })

    const filteredFAQs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open':
                return 'bg-blue-50 text-blue-700 border-blue-200'
            case 'in-progress':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200'
            case 'resolved':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200'
            case 'closed':
                return 'bg-gray-50 text-gray-700 border-gray-200'
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200'
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'text-red-600'
            case 'medium':
                return 'text-yellow-600'
            case 'low':
                return 'text-green-600'
            default:
                return 'text-gray-600'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Center</h1>
                <p className="text-gray-600">Get help with your account and fitness journey</p>
            </motion.div>

            {/* Message Alert */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${message.type === 'success'
                            ? 'bg-emerald-50 border border-emerald-200'
                            : 'bg-red-50 border border-red-200'
                        }`}
                >
                    {message.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <span className={message.type === 'success' ? 'text-emerald-800' : 'text-red-800'}>
                        {message.text}
                    </span>
                </motion.div>
            )}

            {/* Tabs */}
            <div className="flex space-x-2 mb-6 border-b border-gray-200">
                {(['tickets', 'faq', 'contact'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === tab
                                ? 'border-emerald-600 text-emerald-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {tab === 'tickets' && 'My Tickets'}
                        {tab === 'faq' && 'FAQ'}
                        {tab === 'contact' && 'Contact Us'}
                    </button>
                ))}
            </div>

            {/* Tickets Tab */}
            {activeTab === 'tickets' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    {/* Create New Ticket */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Support Ticket</h2>
                        <div className="space-y-4">
                            <Input
                                type="text"
                                value={newTicket.subject}
                                onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                                placeholder="Subject"
                                className="w-full"
                            />
                            <textarea
                                value={newTicket.description}
                                onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe your issue..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                                rows={4}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    value={newTicket.category}
                                    onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                >
                                    <option value="general">General</option>
                                    <option value="billing">Billing</option>
                                    <option value="technical">Technical</option>
                                    <option value="account">Account</option>
                                </select>
                                <select
                                    value={newTicket.priority}
                                    onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as any }))}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                >
                                    <option value="low">Low Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="high">High Priority</option>
                                </select>
                            </div>
                            <Button
                                onClick={handleCreateTicket}
                                disabled={submitting}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                {submitting ? 'Creating...' : 'Create Ticket'}
                            </Button>
                        </div>
                    </div>

                    {/* Tickets List */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search tickets..."
                                    className="pl-10"
                                />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="open">Open</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>

                        {filteredTickets.length === 0 ? (
                            <div className="text-center py-12">
                                <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600">No support tickets found</p>
                            </div>
                        ) : (
                            filteredTickets.map(ticket => (
                                <motion.div
                                    key={ticket.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(ticket.status)}`}>
                                                    {ticket.status}
                                                </span>
                                                <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                                    {ticket.priority.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                <span className="flex items-center space-x-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                                </span>
                                                <span className="flex items-center space-x-1">
                                                    <MessageSquare className="w-3 h-3" />
                                                    <span>{ticket.replies} replies</span>
                                                </span>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="ml-4">
                                            View
                                        </Button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>
            )}

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search FAQs..."
                            className="pl-10"
                        />
                    </div>

                    {filteredFAQs.length === 0 ? (
                        <div className="text-center py-12">
                            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">No FAQs found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredFAQs.map(faq => (
                                <motion.div
                                    key={faq.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                                >
                                    <button
                                        onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <h3 className="font-medium text-gray-900 text-left">{faq.question}</h3>
                                        <motion.div
                                            animate={{ rotate: expandedFAQ === faq.id ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDown className="w-5 h-5 text-gray-600" />
                                        </motion.div>
                                    </button>
                                    {expandedFAQ === faq.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="px-4 pb-4 border-t border-gray-200 bg-gray-50"
                                        >
                                            <p className="text-gray-700">{faq.answer}</p>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                    {/* Contact Form */}
                    <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Send us a Message</h2>
                        <div className="space-y-4">
                            <Input
                                type="text"
                                value={contactForm.name}
                                onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Your Name"
                                className="w-full"
                            />
                            <Input
                                type="email"
                                value={contactForm.email}
                                onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="Your Email"
                                className="w-full"
                            />
                            <Input
                                type="tel"
                                value={contactForm.phone}
                                onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder="Your Phone (Optional)"
                                className="w-full"
                            />
                            <Input
                                type="text"
                                value={contactForm.subject}
                                onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                                placeholder="Subject"
                                className="w-full"
                            />
                            <textarea
                                value={contactForm.message}
                                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="Your Message"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                                rows={6}
                            />
                            <Button
                                onClick={handleContactSubmit}
                                disabled={submitting}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                {submitting ? 'Sending...' : 'Send Message'}
                            </Button>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Phone</p>
                                        <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Mail className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Email</p>
                                        <p className="text-sm text-gray-600">support@proactiv.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Address</p>
                                        <p className="text-sm text-gray-600">123 Fitness Street<br />New York, NY 10001</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Business Hours</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Monday - Friday</span>
                                    <span className="font-medium text-gray-900">9:00 AM - 6:00 PM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Saturday</span>
                                    <span className="font-medium text-gray-900">10:00 AM - 4:00 PM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Sunday</span>
                                    <span className="font-medium text-gray-900">Closed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
