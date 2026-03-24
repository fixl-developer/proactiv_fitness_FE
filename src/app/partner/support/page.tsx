'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PartnerPortalService from '@/services/modules/partner-portal.service'
import { motion } from 'framer-motion'
import {
    HelpCircle, MessageSquare, Phone, Mail, Clock, Search,
    Plus, CheckCircle, AlertCircle, XCircle, Star, Send,
    Book, Video, FileText, ExternalLink, Zap, Users
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PartnerSupportPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [tickets, setTickets] = useState<any[]>([])
    const [faqs, setFaqs] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('overview')
    const [selectedTicket, setSelectedTicket] = useState<string | null>(null)

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
            const response = await PartnerPortalService.getPartnerNotifications(partnerId)

            setTickets([
                {
                    id: '1',
                    title: 'Integration Setup Issue',
                    description: 'Having trouble setting up Google Calendar integration',
                    status: 'OPEN',
                    priority: 'HIGH',
                    category: 'Technical',
                    createdDate: '2024-03-15',
                    lastUpdate: '2024-03-15',
                    assignedTo: 'Sarah Johnson',
                    messages: [
                        {
                            id: 'm1',
                            sender: 'You',
                            content: 'I am having trouble setting up the Google Calendar integration. The webhook URL is not working.',
                            timestamp: '2024-03-15 10:30 AM',
                            isOwn: true
                        },
                        {
                            id: 'm2',
                            sender: 'Sarah Johnson',
                            content: 'Hi! I can help you with that. Can you please share the exact error message you are seeing?',
                            timestamp: '2024-03-15 11:15 AM',
                            isOwn: false
                        }
                    ]
                },
                {
                    id: '2',
                    title: 'Commission Calculation Question',
                    description: 'Need clarification on how commissions are calculated',
                    status: 'IN_PROGRESS',
                    priority: 'MEDIUM',
                    category: 'Billing',
                    createdDate: '2024-03-14',
                    lastUpdate: '2024-03-14',
                    assignedTo: 'Mike Chen',
                    messages: []
                },
                {
                    id: '3',
                    title: 'Student Enrollment Process',
                    description: 'Questions about the student enrollment workflow',
                    status: 'RESOLVED',
                    priority: 'LOW',
                    category: 'General',
                    createdDate: '2024-03-13',
                    lastUpdate: '2024-03-13',
                    assignedTo: 'Lisa Wong',
                    messages: []
                }
            ])

            setFaqs([
                {
                    id: '1',
                    question: 'How do I set up API integrations?',
                    answer: 'To set up API integrations, go to the Integrations page and follow the step-by-step guide for each service.',
                    category: 'Technical',
                    helpful: 45,
                    views: 120
                },
                {
                    id: '2',
                    question: 'When are commissions paid out?',
                    answer: 'Commissions are paid out monthly on the 15th of each month for the previous month\'s earnings.',
                    category: 'Billing',
                    helpful: 38,
                    views: 95
                },
                {
                    id: '3',
                    question: 'How can I track student progress?',
                    answer: 'You can track student progress through the Students page, which shows attendance, achievements, and performance metrics.',
                    category: 'General',
                    helpful: 32,
                    views: 78
                },
                {
                    id: '4',
                    question: 'What marketing materials are available?',
                    answer: 'We provide various marketing materials including email templates, social media assets, and brand guidelines in the Resources section.',
                    category: 'Marketing',
                    helpful: 28,
                    views: 65
                }
            ])
        } catch (err: any) {
            console.error('Error fetching support data:', err)
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
        alert('Opening ticket creation form...')
    }

    const handleSendMessage = (ticketId: string, message: string) => {
        alert(`Sending message to ticket ${ticketId}: ${message}`)
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
                        value: '1',
                        icon: AlertCircle,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-50'
                    },
                    {
                        title: 'Avg Response Time',
                        value: '2.5h',
                        icon: Clock,
                        color: 'text-green-600',
                        bgColor: 'bg-green-50'
                    },
                    {
                        title: 'Resolution Rate',
                        value: '98%',
                        icon: CheckCircle,
                        color: 'text-purple-600',
                        bgColor: 'bg-purple-50'
                    },
                    {
                        title: 'Satisfaction Score',
                        value: '4.9/5',
                        icon: Star,
                        color: 'text-yellow-600',
                        bgColor: 'bg-yellow-50'
                    },
                ].map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">{metric.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                                    </div>
                                    <div className={`${metric.bgColor} p-3 rounded-lg`}>
                                        <metric.icon className={`w-6 h-6 ${metric.color}`} />
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
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <button id="partner-support-send-message-btn" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
        </div>
    )
}
