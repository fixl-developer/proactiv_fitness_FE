'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import WorkflowAutomationService, { Workflow } from '@/services/modules/workflow-automation.service'
import { motion } from 'framer-motion'
import { Zap, Plus, Play, Pause, Trash2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function WorkflowsPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [workflows, setWorkflows] = useState<Workflow[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadWorkflows()
    }, [isAuthenticated, router])

    const loadWorkflows = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await WorkflowAutomationService.getWorkflows()
            setWorkflows(response)
        } catch (err) {
            console.error('Error loading workflows:', err)
            setError('Failed to load workflows')
        } finally {
            setLoading(false)
        }
    }

    const handleToggle = async (workflowId: string, active: boolean) => {
        try {
            await WorkflowAutomationService.toggleWorkflow(workflowId, !active)
            await loadWorkflows()
        } catch (err) {
            console.error('Error toggling workflow:', err)
            alert('Failed to toggle workflow')
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading workflows...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Workflows</h1>
                        <p className="text-gray-600">Manage automation workflows</p>
                    </div>
                    <Button id="workflows-create-workflow-btn" onClick={() => router.push('/advanced/workflows/builder')} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Workflow
                    </Button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <div className="space-y-4">
                    {workflows.map((workflow, idx) => (
                        <motion.div
                            key={workflow.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <Zap className="w-10 h-10 text-blue-600" />
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold">{workflow.name}</h3>
                                                <p className="text-sm text-gray-600">{workflow.description}</p>
                                                <p className="text-xs text-gray-500 mt-1">Executions: {workflow.executionCount}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className={`${workflow.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    workflow.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {workflow.status}
                                            </Badge>
                                            <Button id="workflows-toggle-btn"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleToggle(workflow.id, workflow.status === 'active')}
                                            >
                                                {workflow.status === 'active' ? (
                                                    <Pause className="w-4 h-4" />
                                                ) : (
                                                    <Play className="w-4 h-4" />
                                                )}
                                            </Button>
                                            <Button id="workflows-delete-btn" size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {workflows.length === 0 && (
                    <div className="text-center py-12">
                        <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">No workflows yet</p>
                        <Button id="workflows-create-first-workflow-btn" onClick={() => router.push('/advanced/workflows/builder')} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Workflow
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
