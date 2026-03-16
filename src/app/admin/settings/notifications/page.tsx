'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Bell, Mail, MessageSquare, Smartphone, Settings, Users,
    Calendar, CreditCard, AlertTriangle, CheckCircle, Clock,
    Volume2, VolumeX, Save, RefreshCw, TestTube, Plus,
    Edit, Trash2, Send, Eye, EyeOff
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface NotificationChannel {
    id: string
    name: string
    type: 'email' | 'sms' | 'push' | 'whatsapp'
    icon: any
    enabled: boolean
    description: string
    config?: Record<string, any>
}

interface NotificationTemplate {
    id: string
    name: string
    subject: string
    type: 'booking' | 'payment' | 'reminder' | 'system' | 'marketing'
    channels: string[]
    enabled: boolean
    lastModified: string
}

interface NotificationRule {
    id: string
    name: string
    trigger: string
    conditions: string[]
    actions: string[]
    enabled: boolean
    priority: 'low' | 'medium' | 'high'
}

const notificationChannels: NotificationChannel[] = [
    {
        id: 'email',
        name: 'Email',
        type: 'email',
        icon: Mail,
        enabled: true,
        description: 'Send notifications via email',
        config: {
            smtp_host: 'smtp.gmail.com',
            smtp_port: 587,
            from_email: 'noreply@progym.hk'
        }
    },
    {
        id: 'sms',
        name: 'SMS',
        type: 'sms',
        icon: Smartphone,
        enabled: false,
        description: 'Send SMS notifications via Twilio',
        config: {
            provider: 'twilio',
            account_sid: '',
            auth_token: ''
        }
    },
    {
        id: 'whatsapp',
        name: 'WhatsApp',
        type: 'whatsapp',
        icon: MessageSquare,
        enabled: false,
        description: 'Send WhatsApp messages via Business API',
        config: {
            business_account_id: '',
            access_token: ''
        }
    },
    {
        id: 'push',
        name: 'Push Notifications',
        type: 'push',
        icon: Bell,
        enabled: true,
        description: 'Send push notifications to mobile apps',
        config: {
            firebase_key: '',
            apns_key: ''
        }
    }
]

const notificationTemplates: NotificationTemplate[] = [
    {
        id: 'booking_confirmation',
        name: 'Booking Confirmation',
        subject: 'Your class booking has been confirmed',
        type: 'booking',
        channels: ['email', 'push'],
        enabled: true,
        lastModified: '2024-01-15'
    },
    {
        id: 'payment_receipt',
        name: 'Payment Receipt',
        subject: 'Payment received - Receipt #{{receipt_number}}',
        type: 'payment',
        channels: ['email'],
        enabled: true,
        lastModified: '2024-01-14'
    },
    {
        id: 'class_reminder',
        name: 'Class Reminder',
        subject: 'Reminder: Your class starts in 1 hour',
        type: 'reminder',
        channels: ['email', 'sms', 'push'],
        enabled: true,
        lastModified: '2024-01-13'
    },
    {
        id: 'system_maintenance',
        name: 'System Maintenance',
        subject: 'Scheduled maintenance notification',
        type: 'system',
        channels: ['email'],
        enabled: false,
        lastModified: '2024-01-10'
    },
    {
        id: 'marketing_newsletter',
        name: 'Monthly Newsletter',
        subject: 'ProActive Sports - Monthly Update',
        type: 'marketing',
        channels: ['email'],
        enabled: true,
        lastModified: '2024-01-12'
    }
]

const notificationRules: NotificationRule[] = [
    {
        id: 'booking_created',
        name: 'New Booking Created',
        trigger: 'booking.created',
        conditions: ['booking.status = confirmed'],
        actions: ['send_template:booking_confirmation'],
        enabled: true,
        priority: 'high'
    },
    {
        id: 'payment_received',
        name: 'Payment Received',
        trigger: 'payment.completed',
        conditions: ['payment.amount > 0'],
        actions: ['send_template:payment_receipt'],
        enabled: true,
        priority: 'medium'
    },
    {
        id: 'class_reminder_1h',
        name: 'Class Reminder (1 hour)',
        trigger: 'schedule.before_class',
        conditions: ['time_before = 1 hour'],
        actions: ['send_template:class_reminder'],
        enabled: true,
        priority: 'high'
    }
]

const typeColors = {
    booking: 'bg-blue-100 text-blue-800',
    payment: 'bg-green-100 text-green-800',
    reminder: 'bg-orange-100 text-orange-800',
    system: 'bg-red-100 text-red-800',
    marketing: 'bg-purple-100 text-purple-800'
}

const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
}

export default function NotificationsPage() {
    const [activeTab, setActiveTab] = useState('channels')
    const [selectedChannel, setSelectedChannel] = useState<NotificationChannel | null>(null)
    const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null)
    const [isConfiguring, setIsConfiguring] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    const handleToggleChannel = (channelId: string) => {
        // Handle channel toggle logic
        console.log('Toggle channel:', channelId)
    }

    const handleToggleTemplate = (templateId: string) => {
        // Handle template toggle logic
        console.log('Toggle template:', templateId)
    }

    const handleToggleRule = (ruleId: string) => {
        // Handle rule toggle logic
        console.log('Toggle rule:', ruleId)
    }

    const handleTestNotification = (templateId: string) => {
        // Handle test notification logic
        console.log('Test notification:', templateId)
    }

    const handleConfigureChannel = (channel: NotificationChannel) => {
        setSelectedChannel(channel)
        setIsConfiguring(true)
    }

    const handleEditTemplate = (template: NotificationTemplate) => {
        setSelectedTemplate(template)
        setIsEditing(true)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
                    <p className="text-gray-600 mt-2">
                        Configure notification channels, templates, and automation rules
                    </p>
                </div>
                <div className="flex space-x-3">
                    <Button variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </Button>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Channels</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {notificationChannels.filter(c => c.enabled).length}
                                </p>
                            </div>
                            <Bell className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Templates</p>
                                <p className="text-2xl font-bold text-gray-900">{notificationTemplates.length}</p>
                            </div>
                            <Mail className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Rules</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {notificationRules.filter(r => r.enabled).length}
                                </p>
                            </div>
                            <Settings className="w-8 h-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Sent Today</p>
                                <p className="text-2xl font-bold text-gray-900">1,247</p>
                            </div>
                            <Send className="w-8 h-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="channels">Channels</TabsTrigger>
                        <TabsTrigger value="templates">Templates</TabsTrigger>
                        <TabsTrigger value="rules">Automation Rules</TabsTrigger>
                    </TabsList>

                    {/* Channels Tab */}
                    <TabsContent value="channels" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {notificationChannels.map((channel) => (
                                <Card key={channel.id} className="hover:shadow-lg transition-shadow duration-200">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                                    <channel.icon className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">{channel.name}</CardTitle>
                                                    <p className="text-sm text-gray-600">{channel.description}</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={channel.enabled}
                                                onCheckedChange={() => handleToggleChannel(channel.id)}
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-center">
                                            <Badge className={channel.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                {channel.enabled ? 'Active' : 'Inactive'}
                                            </Badge>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleConfigureChannel(channel)}
                                                >
                                                    <Settings className="w-4 h-4 mr-2" />
                                                    Configure
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleTestNotification(channel.id)}
                                                >
                                                    <TestTube className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Templates Tab */}
                    <TabsContent value="templates" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Notification Templates</h3>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                New Template
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {notificationTemplates.map((template) => (
                                <Card key={template.id}>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h4 className="font-semibold text-gray-900">{template.name}</h4>
                                                    <Badge className={typeColors[template.type]}>
                                                        {template.type}
                                                    </Badge>
                                                    <Switch
                                                        checked={template.enabled}
                                                        onCheckedChange={() => handleToggleTemplate(template.id)}
                                                    />
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                    <span>Channels: {template.channels.join(', ')}</span>
                                                    <span>Last modified: {template.lastModified}</span>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditTemplate(template)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleTestNotification(template.id)}
                                                >
                                                    <TestTube className="w-4 h-4" />
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Rules Tab */}
                    <TabsContent value="rules" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Automation Rules</h3>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                New Rule
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {notificationRules.map((rule) => (
                                <Card key={rule.id}>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h4 className="font-semibold text-gray-900">{rule.name}</h4>
                                                    <Badge className={priorityColors[rule.priority]}>
                                                        {rule.priority} priority
                                                    </Badge>
                                                    <Switch
                                                        checked={rule.enabled}
                                                        onCheckedChange={() => handleToggleRule(rule.id)}
                                                    />
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">Trigger: {rule.trigger}</p>
                                                <div className="text-xs text-gray-500">
                                                    <p>Conditions: {rule.conditions.join(', ')}</p>
                                                    <p>Actions: {rule.actions.join(', ')}</p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button variant="outline" size="sm">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </motion.div>

            {/* Configuration Modal */}
            {isConfiguring && selectedChannel && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setIsConfiguring(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                        <selectedChannel.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Configure {selectedChannel.name}</h2>
                                        <p className="text-gray-600">{selectedChannel.description}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsConfiguring(false)}
                                >
                                    ✕
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {selectedChannel.type === 'email' && (
                                    <>
                                        <div>
                                            <Label htmlFor="smtp-host">SMTP Host</Label>
                                            <Input
                                                id="smtp-host"
                                                defaultValue={selectedChannel.config?.smtp_host}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="smtp-port">SMTP Port</Label>
                                            <Input
                                                id="smtp-port"
                                                type="number"
                                                defaultValue={selectedChannel.config?.smtp_port}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="from-email">From Email</Label>
                                            <Input
                                                id="from-email"
                                                type="email"
                                                defaultValue={selectedChannel.config?.from_email}
                                                className="mt-1"
                                            />
                                        </div>
                                    </>
                                )}

                                {selectedChannel.type === 'sms' && (
                                    <>
                                        <div>
                                            <Label htmlFor="account-sid">Account SID</Label>
                                            <Input
                                                id="account-sid"
                                                defaultValue={selectedChannel.config?.account_sid}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="auth-token">Auth Token</Label>
                                            <Input
                                                id="auth-token"
                                                type="password"
                                                defaultValue={selectedChannel.config?.auth_token}
                                                className="mt-1"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-end space-x-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsConfiguring(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                                        Save Configuration
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    )
}