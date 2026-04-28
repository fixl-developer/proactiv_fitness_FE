'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import WorkflowAutomationService from '@/services/modules/workflow-automation.service'
import { motion } from 'framer-motion'
import { Workflow, Plus, AlertCircle, Save, Play, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface WorkflowStep {
    id: string
    type: string
    name: string
    config: Record<string, string>
}

export default function WorkflowBuilderPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [workflowName, setWorkflowName] = useState('')
    const [trigger, setTrigger] = useState('booking_created')
    const [steps, setSteps] = useState<WorkflowStep[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
        }
    }, [isAuthenticated, router])

    const addStep = () => {
        const newStep: WorkflowStep = {
            id: `step-${Date.now()}`,
            type: 'action',
            name: 'New Step',
            config: {}
        }
        setSteps([...steps, newStep])
    }

    const removeStep = (stepId: string) => {
        setSteps(steps.filter(s => s.id !== stepId))
    }

    const handleSave = async () => {
        try {
            setLoading(true)
            setError(null)
            await WorkflowAutomationService.createWorkflow({
                name: workflowName,
                trigger,
                steps
            } as any)
            router.push('/advanced/workflows')
        } catch (err) {
            console.error('Error saving workflow:', err)
            setError('Failed to save workflow')
        } finally {
            setLoading(false)
        }
    }

    const handleTest = async () => {
        try {
            setLoading(true)
            setError(null)
            await WorkflowAutomationService.testWorkflow({
                name: workflowName,
                trigger,
                steps
            })
            alert('Workflow test completed successfully')
        } catch (err) {
            console.error('Error testing workflow:', err)
            setError('Failed to test workflow')
        } finally {
            setLoading(false)
        }
    }

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Workflow Builder</h1>
                    <p className="text-gray-600">Create automated workflows</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Workflow className="w-5 h-5 text-blue-600" />
                                    Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Workflow Name</label>
                                        <input
                                            id="workflow-builder-name-input"
                                            type="text"
                                            value={workflowName}
                                            onChange={(e) => setWorkflowName(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="My Workflow"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Trigger</label>
                                        <select id="workflow-builder-trigger-select"
                                            value={trigger}
                                            onChange={(e) => setTrigger(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="booking_created">Booking Created</option>
                                            <option value="payment_received">Payment Received</option>
                                            <option value="user_registered">User Registered</option>
                                            <option value="class_completed">Class Completed</option>
                                        </select>
                                    </div>

                                    <Button id="workflow-builder-add-step-btn" onClick={addStep} variant="outline" className="w-full">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Step
                                    </Button>

                                    <div className="flex gap-2">
                                        <Button id="workflow-builder-test-btn" onClick={handleTest} disabled={loading} variant="outline" className="flex-1">
                                            <Play className="w-4 h-4 mr-2" />
                                            Test
                                        </Button>
                                        <Button id="workflow-builder-save-btn" onClick={handleSave} disabled={loading || !workflowName} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                                            <Save className="w-4 h-4 mr-2" />
                                            {loading ? 'Saving...' : 'Save'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Workflow Steps</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {steps.length === 0 ? (
                                    <div className="flex items-center justify-center h-64 text-gray-400">
                                        <div className="text-center">
                                            <Workflow className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                            <p>Add steps to build your workflow</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {steps.map((step, idx) => (
                                            <motion.div
                                                key={step.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="p-4 border border-gray-200 rounded-lg flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{step.name}</p>
                                                        <p className="text-sm text-gray-500">{step.type}</p>
                                                    </div>
                                                </div>
                                                <Button id={`workflow-builder-remove-step-${step.id}-btn`} onClick={() => removeStep(step.id)} variant="ghost" size="sm">
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
