'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PartnerPortalService from '@/services/modules/partner-portal.service'
import { motion } from 'framer-motion'
import {
    HelpCircle, MessageSquare, Phone, Mail, Clock, Search,
    Plus, CheckCircle, AlertCircle, XCircle, Star, Send,
    Book, Video, FileText, ExternalLink, Zap, Users, X,
    Package, Dumbbell, Wrench, ShoppingCart, Laptop, Headphones
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { validateSubject, validateTextArea } from '@/utils/validation'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import { toast } from 'sonner'

export default function PartnerSupportPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [tickets, setTickets] = useState<any[]>([])
    const [faqs, setFaqs] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('overview')
    const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
    const [replyText, setReplyText] = useState('')
    const [sendingReply, setSendingReply] = useState(false)
    const [showCreateTicketModal, setShowCreateTicketModal] = useState(false)
    const [creatingTicket, setCreatingTicket] = useState(false)
    const [ticketForm, setTicketForm] = useState({
        resourceType: '',
        subject: '',
        description: '',
        priority: 'MEDIUM',
        quantity: '1',
        preferredDate: '',
        additionalNotes: ''
    })
    const [ticketErrors, setTicketErrors] = useState<Record<string, string>>({})

    const todayISO = new Date().toISOString().split('T')[0]

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        fetchSupportData()
    }, [isAuthenticated, router])

    const fetchSupportData = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const partnerId = user?.id || 'partner-1'
            const response = await PartnerPortalService.getSupportTickets(partnerId)

            setTickets((response?.tickets || []).map((t: any) => ({
                id: t.id,
                title: t.subject,
                description: t.description,
                status: t.status?.toUpperCase().replace(' ', '_') || 'OPEN',
                priority: t.priority?.toUpperCase() || 'MEDIUM',
                category: t.category || 'General',
                createdDate: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A',
                lastUpdate: t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : 'N/A',
                assignedTo: t.assignedTo || 'Support Team',
                messages: (t.messages || []).map((m: any) => ({
                    id: m.id,
                    sender: m.sender,
                    content: m.message,
                    timestamp: m.createdAt ? new Date(m.createdAt).toLocaleString() : 'N/A',
                    isOwn: m.senderType === 'partner'
                }))
            })))

            setFaqs([])
        } catch (err: any) {
            console.error('Error fetching support data:', err)
            setError('Failed to load support data')
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-blue-100 text-blue-800'
            case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
            case 'RESOLVED': return 'bg-green-100 text-green-800'
            case 'CLOSED': return 'bg-gray-100 text-gray-800'
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'OPEN': return AlertCircle
            case 'IN_PROGRESS': return Clock
            case 'RESOLVED': return CheckCircle
            case 'CLOSED': return XCircle
            default: return HelpCircle
        }
    }

    const handleCreateTicket = () => {
        setShowCreateTicketModal(true)
    }

    const validateTicketForm = (): boolean => {
        const errs: Record<string, string> = {}
        if (!ticketForm.resourceType) errs.resourceType = 'Please select a resource type'
        const subErr = validateSubject(ticketForm.subject, 'Subject')
        if (subErr) errs.subject = subErr
        const descErr = validateTextArea(ticketForm.description, 'Description', 5, 5000)
        if (descErr) errs.description = descErr
        if (ticketForm.preferredDate) {
            const today = new Date(); today.setHours(0, 0, 0, 0)
            const picked = new Date(ticketForm.preferredDate)
            if (picked < today) errs.preferredDate = 'Preferred Date cannot be in the past'
        }
        if (ticketForm.quantity) {
            const qty = Number(ticketForm.quantity)
            if (isNaN(qty) || qty < 1) errs.quantity = 'Quantity must be at least 1'
        }
        setTicketErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSubmitTicket = async () => {
        if (!validateTicketForm()) {
            toast.error('Please fix the highlighted errors before submitting.')
            return
        }
        try {
            setCreatingTicket(true)
            const partnerId = user?.id || 'partner-1'
            await PartnerPortalService.createSupportTicket(partnerId, {
                subject: `[Resource Request - ${ticketForm.resourceType}] ${ticketForm.subject}`,
                description: `Resource Type: ${ticketForm.resourceType}\nQuantity: ${ticketForm.quantity}\nPreferred Date: ${ticketForm.preferredDate || 'N/A'}\n\n${ticketForm.description}\n\nAdditional Notes: ${ticketForm.additionalNotes || 'None'}`,
                priority: ticketForm.priority.toLowerCase(),
                category: 'Resource Request'
            })
            setShowCreateTicketModal(false)
            setTicketForm({ resourceType: '', subject: '', description: '', priority: 'MEDIUM', quantity: '1', preferredDate: '', additionalNotes: '' })
            setTicketErrors({})
            await fetchSupportData()
            toast.success('Support ticket submitted successfully!')
        } catch (err: any) {
            console.error('Error creating ticket:', err)
            toast.error(err?.response?.data?.error || 'Failed to submit ticket. Please try again.')
        } finally {
            setCreatingTicket(false)
        }
    }

    const handleSendMessage = async (ticketId: string) => {
        if (!replyText.trim()) return
        try {
            setSendingReply(true)
            const newMsg = await PartnerPortalService.addTicketMessage(ticketId, {
                message: replyText,
                sender: 'Partner Admin',
                senderType: 'partner'
            })
            setTickets(prev => prev.map(t => {
                if (t.id === ticketId) {
                    return {
                        ...t,
                        messages: [...t.messages, {
                            id: newMsg.id,
                            sender: newMsg.sender,
                            content: newMsg.message,
                            timestamp: new Date(newMsg.createdAt).toLocaleString(),
                            isOwn: true
                        }]
                    }
                }
                return t
            }))
            setReplyText('')
        } catch (err) {
            console.error('Error sending message:', err)
        } finally {
            setSendingReply(false)
        }
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
                    <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
                    <p className="text-gray-600 mt-1">Get help, submit tickets, and access resources</p>
                </div>
                <button id="partner-support-create-ticket-btn"
                    onClick={handleCreateTicket}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Create Ticket
                </button>
            </div>

            {/* Support Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    {
                        title: 'Open Tickets',
                        value: String(tickets.filter(t => t.status === 'OPEN').length),
                        icon: AlertCircle,
                        iconColor: 'text-white',
                        iconBg: 'bg-blue-500',
                        gradient: 'bg-gradient-to-br from-blue-500 to-blue-700',
                        textColor: 'text-white',
                        subtextColor: 'text-blue-100'
                    },
                    {
                        title: 'In Progress',
                        value: String(tickets.filter(t => t.status === 'IN_PROGRESS').length),
                        icon: Clock,
                        iconColor: 'text-white',
                        iconBg: 'bg-amber-500',
                        gradient: 'bg-gradient-to-br from-amber-400 to-orange-600',
                        textColor: 'text-white',
                        subtextColor: 'text-amber-100'
                    },
                    {
                        title: 'Resolved',
                        value: String(tickets.filter(t => t.status === 'RESOLVED').length),
                        icon: CheckCircle,
                        iconColor: 'text-white',
                        iconBg: 'bg-emerald-500',
                        gradient: 'bg-gradient-to-br from-emerald-400 to-green-700',
                        textColor: 'text-white',
                        subtextColor: 'text-emerald-100'
                    },
                    {
                        title: 'Total Tickets',
                        value: String(tickets.length),
                        icon: Star,
                        iconColor: 'text-white',
                        iconBg: 'bg-purple-500',
                        gradient: 'bg-gradient-to-br from-purple-500 to-indigo-700',
                        textColor: 'text-white',
                        subtextColor: 'text-purple-100'
                    },
                ].map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className={`hover:shadow-xl transition-all hover:scale-105 ${metric.gradient} border-0`}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm font-medium ${metric.subtextColor}`}>{metric.title}</p>
                                        <p className={`text-3xl font-bold ${metric.textColor} mt-2`}>{metric.value}</p>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                        <metric.icon className={`w-7 h-7 ${metric.iconColor}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button id="partner-support-live-chat-btn" className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
                            <MessageSquare className="w-6 h-6 text-blue-600" />
                            <div>
                                <p className="font-medium text-gray-900">Live Chat</p>
                                <p className="text-sm text-gray-600">Chat with our support team</p>
                            </div>
                        </button>
                        <button id="partner-support-phone-btn" className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
                            <Phone className="w-6 h-6 text-green-600" />
                            <div>
                                <p className="font-medium text-gray-900">Phone Support</p>
                                <p className="text-sm text-gray-600">Call us at +1 (555) 123-4567</p>
                            </div>
                        </button>
                        <button id="partner-support-email-btn" className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
                            <Mail className="w-6 h-6 text-purple-600" />
                            <div>
                                <p className="font-medium text-gray-900">Email Support</p>
                                <p className="text-sm text-gray-600">support@proactive.com</p>
                            </div>
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs Navigation */}
            <div className="flex gap-2 border-b border-gray-200">
                {[
                    { id: 'tickets', name: 'My Tickets', icon: MessageSquare },
                    { id: 'faq', name: 'FAQ', icon: HelpCircle },
                    { id: 'resources', name: 'Help Resources', icon: Book },
                ].map((tab) => (
                    <button id={`partner-support-tab-${tab.id}-btn`}
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

            {/* Tickets Tab */}
            {activeTab === 'tickets' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Ticket List */}
                    <div className="lg:col-span-1 space-y-4">
                        {tickets.map((ticket, idx) => {
                            const StatusIcon = getStatusIcon(ticket.status)
                            return (
                                <motion.div
                                    key={ticket.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card
                                        id={`partner-support-ticket-${ticket.id}-card`}
                                        className={`cursor-pointer hover:shadow-lg transition-shadow ${selectedTicket === ticket.id ? 'ring-2 ring-blue-500' : ''
                                            }`}
                                        onClick={() => setSelectedTicket(ticket.id)}
                                    >
                                        <CardContent className="pt-4">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-gray-100 p-2 rounded-lg">
                                                    <StatusIcon className="w-4 h-4 text-gray-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 truncate">{ticket.title}</h3>
                                                    <p className="text-sm text-gray-600 truncate">{ticket.description}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge className={getStatusColor(ticket.status)}>
                                                            {ticket.status.replace('_', ' ')}
                                                        </Badge>
                                                        <Badge className={getPriorityColor(ticket.priority)}>
                                                            {ticket.priority}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Updated: {ticket.lastUpdate}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )
                        })}
                    </div>

                    {/* Ticket Detail */}
                    <div className="lg:col-span-2">
                        {selectedTicket ? (
                            <Card className="h-full">
                                <CardHeader className="border-b">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>{tickets.find(t => t.id === selectedTicket)?.title}</CardTitle>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Assigned to: {tickets.find(t => t.id === selectedTicket)?.assignedTo}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Badge className={getStatusColor(tickets.find(t => t.id === selectedTicket)?.status || '')}>
                                                {tickets.find(t => t.id === selectedTicket)?.status.replace('_', ' ')}
                                            </Badge>
                                            <Badge className={getPriorityColor(tickets.find(t => t.id === selectedTicket)?.priority || '')}>
                                                {tickets.find(t => t.id === selectedTicket)?.priority}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex flex-col h-96">
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {tickets.find(t => t.id === selectedTicket)?.messages.map((msg: any) => (
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
                                                    <p className="text-sm font-medium mb-1">{msg.sender}</p>
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
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && !sendingReply && handleSendMessage(selectedTicket!)}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <button
                                                id="partner-support-send-message-btn"
                                                onClick={() => handleSendMessage(selectedTicket!)}
                                                disabled={sendingReply || !replyText.trim()}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                            >
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
                                    <p className="text-gray-600">Select a ticket to view details</p>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
                <div className="space-y-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search frequently asked questions..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <motion.div
                                key={faq.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="hover:shadow-lg transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                                                <p className="text-gray-600 mb-3">{faq.answer}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>{faq.helpful} found helpful</span>
                                                    <span>{faq.views} views</span>
                                                    <Badge variant="outline">{faq.category}</Badge>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button id={`partner-support-faq-helpful-${faq.id}-btn`} className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors">
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                                <button id={`partner-support-faq-link-${faq.id}-btn`} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Help Resources Tab */}
            {activeTab === 'resources' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            title: 'Documentation',
                            description: 'Comprehensive guides and API documentation',
                            icon: FileText,
                            color: 'text-blue-600',
                            bgColor: 'bg-blue-50',
                            items: ['API Reference', 'Integration Guide', 'Best Practices']
                        },
                        {
                            title: 'Video Tutorials',
                            description: 'Step-by-step video guides and walkthroughs',
                            icon: Video,
                            color: 'text-purple-600',
                            bgColor: 'bg-purple-50',
                            items: ['Getting Started', 'Advanced Features', 'Troubleshooting']
                        },
                        {
                            title: 'Community',
                            description: 'Connect with other partners and share experiences',
                            icon: Users,
                            color: 'text-green-600',
                            bgColor: 'bg-green-50',
                            items: ['Partner Forum', 'Success Stories', 'Feature Requests']
                        }
                    ].map((resource, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow h-full">
                                <CardContent className="pt-6">
                                    <div className={`${resource.bgColor} p-3 rounded-lg w-fit mb-4`}>
                                        <resource.icon className={`w-6 h-6 ${resource.color}`} />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{resource.title}</h3>
                                    <p className="text-gray-600 mb-4">{resource.description}</p>
                                    <ul className="space-y-2">
                                        {resource.items.map((item, itemIdx) => (
                                            <li key={itemIdx} className="flex items-center gap-2 text-sm text-gray-700">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <button id={`partner-support-explore-${idx}-btn`} className="w-full mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                        Explore {resource.title}
                                    </button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Resource Request Ticket Modal */}
            {showCreateTicketModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
                    >
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 rounded-t-2xl flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">Request Resources</h2>
                                <p className="text-blue-100 text-sm mt-1">Submit a resource request ticket for your partner needs</p>
                            </div>
                            <button
                                onClick={() => setShowCreateTicketModal(false)}
                                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5">
                            {/* Resource Type Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Resource Type *</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {[
                                        { value: 'Equipment', icon: Dumbbell, color: 'border-blue-500 bg-blue-50 text-blue-700' },
                                        { value: 'Marketing Materials', icon: Package, color: 'border-purple-500 bg-purple-50 text-purple-700' },
                                        { value: 'Software/Tools', icon: Laptop, color: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
                                        { value: 'Maintenance', icon: Wrench, color: 'border-amber-500 bg-amber-50 text-amber-700' },
                                        { value: 'Supplies', icon: ShoppingCart, color: 'border-rose-500 bg-rose-50 text-rose-700' },
                                        { value: 'IT Support', icon: Headphones, color: 'border-cyan-500 bg-cyan-50 text-cyan-700' },
                                    ].map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setTicketForm(prev => ({ ...prev, resourceType: type.value }))}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                                                ticketForm.resourceType === type.value
                                                    ? `${type.color} border-current shadow-md scale-105`
                                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                            }`}
                                        >
                                            <type.icon className="w-5 h-5" />
                                            <span className="text-xs font-medium text-center">{type.value}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject *</label>
                                <input
                                    type="text"
                                    placeholder="Brief title for your resource request (min 5 chars, must contain letters)"
                                    value={ticketForm.subject}
                                    onChange={(e) => {
                                        setTicketForm(prev => ({ ...prev, subject: e.target.value }))
                                        const err = validateSubject(e.target.value, 'Subject')
                                        setTicketErrors(prev => { const n = { ...prev }; if (err) n.subject = err; else delete n.subject; return n })
                                    }}
                                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${ticketErrors.subject ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                <FormFieldHint hint="5-200 characters, must contain letters (no symbols-only)" error={ticketErrors.subject} />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                                <textarea
                                    placeholder="Describe what resources you need and why..."
                                    rows={4}
                                    value={ticketForm.description}
                                    onChange={(e) => {
                                        setTicketForm(prev => ({ ...prev, description: e.target.value }))
                                        const err = validateTextArea(e.target.value, 'Description', 5, 5000)
                                        setTicketErrors(prev => { const n = { ...prev }; if (err) n.description = err; else delete n.description; return n })
                                    }}
                                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${ticketErrors.description ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                <FormFieldHint hint="Minimum 5 characters" error={ticketErrors.description} />
                            </div>

                            {/* Priority & Quantity Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
                                    <select
                                        value={ticketForm.priority}
                                        onChange={(e) => setTicketForm(prev => ({ ...prev, priority: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="CRITICAL">Critical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={ticketForm.quantity}
                                        onChange={(e) => {
                                            setTicketForm(prev => ({ ...prev, quantity: e.target.value }))
                                            const qty = Number(e.target.value)
                                            if (e.target.value !== '' && (isNaN(qty) || qty < 1)) {
                                                setTicketErrors(prev => ({ ...prev, quantity: 'Quantity must be at least 1' }))
                                            } else {
                                                setTicketErrors(prev => { const n = { ...prev }; delete n.quantity; return n })
                                            }
                                        }}
                                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${ticketErrors.quantity ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    <FormFieldHint hint="Minimum 1" error={ticketErrors.quantity} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Date</label>
                                    <input
                                        type="date"
                                        min={todayISO}
                                        value={ticketForm.preferredDate}
                                        onChange={(e) => {
                                            setTicketForm(prev => ({ ...prev, preferredDate: e.target.value }))
                                            if (e.target.value) {
                                                const today = new Date(); today.setHours(0, 0, 0, 0)
                                                if (new Date(e.target.value) < today) {
                                                    setTicketErrors(prev => ({ ...prev, preferredDate: 'Preferred Date cannot be in the past' }))
                                                } else {
                                                    setTicketErrors(prev => { const n = { ...prev }; delete n.preferredDate; return n })
                                                }
                                            } else {
                                                setTicketErrors(prev => { const n = { ...prev }; delete n.preferredDate; return n })
                                            }
                                        }}
                                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${ticketErrors.preferredDate ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    <FormFieldHint hint="Cannot be in the past" error={ticketErrors.preferredDate} />
                                </div>
                            </div>

                            {/* Additional Notes */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Additional Notes</label>
                                <textarea
                                    placeholder="Any additional information or special requirements..."
                                    rows={2}
                                    value={ticketForm.additionalNotes}
                                    onChange={(e) => setTicketForm(prev => ({ ...prev, additionalNotes: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowCreateTicketModal(false)}
                                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitTicket}
                                disabled={creatingTicket || !ticketForm.subject.trim() || !ticketForm.description.trim() || !ticketForm.resourceType}
                                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {creatingTicket ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Submit Request
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
