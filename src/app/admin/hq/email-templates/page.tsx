'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Edit2, Eye, Trash2, Plus, Send, Copy } from 'lucide-react'
import { HQAdminService } from '@/services/hqAdminService'

export default function EmailTemplatesPage() {
    const [templates, setTemplates] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
    const [editMode, setEditMode] = useState(false)

    useEffect(() => {
        fetchTemplates()
    }, [])

    const fetchTemplates = async () => {
        try {
            setIsLoading(true)
            setError(null)
            // Will call backend when available
            setTemplates(getMockTemplates())
        } catch (err: any) {
            console.error('Error fetching templates:', err)
            setError(err.message)
            setTemplates(getMockTemplates())
        } finally {
            setIsLoading(false)
        }
    }

    const getMockTemplates = () => [
        {
            id: 1,
            name: 'Welcome Email',
            subject: 'Welcome to Proactiv Fitness!',
            category: 'onboarding',
            status: 'active',
            lastModified: '2026-03-10',
            preview: 'Welcome to our platform. Get started with your fitness journey...',
            content: '<h1>Welcome!</h1><p>Thank you for joining Proactiv Fitness...</p>',
            variables: ['{{firstName}}', '{{email}}', '{{activationLink}}'],
        },
        {
            id: 2,
            name: 'Password Reset',
            subject: 'Reset Your Password',
            category: 'security',
            status: 'active',
            lastModified: '2026-03-09',
            preview: 'Click the link below to reset your password...',
            content: '<h1>Password Reset</h1><p>Click here to reset your password</p>',
            variables: ['{{firstName}}', '{{resetLink}}', '{{expiryTime}}'],
        },
    ]

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        <Plus className="w-5 h-5 inline mr-2" />
                        New Template
                    </button>
                </div>

                <div className="grid gap-6">
                    {templates.map((template) => (
                        <Card key={template.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{template.name}</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">{template.subject}</p>
                                    </div>
                                    <Badge>{template.status}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 mb-4">{template.preview}</p>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-gray-100 rounded">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 hover:bg-gray-100 rounded">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 hover:bg-gray-100 rounded">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 hover:bg-gray-100 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
