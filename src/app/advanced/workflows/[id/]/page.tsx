'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import WorkflowAutomationService, { Workflow } from '@/services/modules/workflow-automation.service'
import { AlertCircle, Edit, Play } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function WorkflowDetailsPage() {
    const router = useRouter()
    const params = useParams()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [workflow, setWorkflow] = useState<Workflow | null>(null)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        if (params.id) {
            loadWorkflow(params.id as string)
        }
    }, [isAuthenticated, router, params.id])

    const loadWorkflow = async (workflowId: string) => {
        try {
            setLoading(true)
            setError(null)
            const response = await WorkflowAutomationService.getWorkflowById(workflowId)
            setWorkflow(response)
        } catch (err) {
            console.error('Error loading workflow:', err)
            setError('Failed to load workflow')
        } finally {
            setLoading(false)
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading workflow...</p>
                </div>
            </div>
        )
    }

    if (!workflow) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">Workflow not found</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">{workflow.name}</h1>
                        <p className="text-gray-600">{workflow.description}</p>
                    </div>
                    <div className="flex gap-3">
                        <Button id="advanced-workflows-id-btn" variant="outline">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                        <Button id="advanced-workflows-id-btn-2" className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Play className="w-4 h-4 mr-2" />
                            Execute
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-sm text-gray-600">Status</p>
                            <Badge className={`${workflow.status === 'active' ? 'bg-green-100 text-green-800' :
                                    workflow.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                        'bg-yellow-100 text-yellow-800'
                                }`}>
                                {workflow.status}
                            </Badge>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-sm text-gray-600">Executions</p>
                            <p className="text-3xl font-bold mt-2">{workflow.executionCount}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-sm text-gray-600">Actions</p>
                            <p className="text-3xl font-bold mt-2">{workflow.actions.length}</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Workflow Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Trigger Type</p>
                                <p className="text-gray-900">{workflow.trigger.type}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Actions</p>
                                <p className="text-gray-900">{workflow.actions.length} action(s) configured</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
