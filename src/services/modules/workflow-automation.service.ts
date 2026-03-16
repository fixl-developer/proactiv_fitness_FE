import { apiClient } from '../api/client'

export interface Workflow {
    id: string
    name: string
    description: string
    trigger: WorkflowTrigger
    actions: WorkflowAction[]
    status: 'active' | 'inactive' | 'draft'
    createdAt: string
    createdBy: string
    lastRun?: string
    executionCount: number
}

export interface WorkflowTrigger {
    type: string
    config: any
    conditions?: any[]
}

export interface WorkflowAction {
    id: string
    type: string
    config: any
    order: number
}

export interface WorkflowExecution {
    id: string
    workflowId: string
    status: 'running' | 'completed' | 'failed'
    startedAt: string
    completedAt?: string
    result?: any
    error?: string
}

export interface WorkflowTemplate {
    id: string
    name: string
    description: string
    category: string
    trigger: WorkflowTrigger
    actions: WorkflowAction[]
}

export class WorkflowAutomationService {
    /**
     * Get all workflows
     */
    static async getWorkflows(filters?: { status?: string }): Promise<Workflow[]> {
        try {
            const response = await apiClient.get('/workflows', { params: filters })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching workflows:', error)
            throw error
        }
    }

    /**
     * Get workflow by ID
     */
    static async getWorkflowById(workflowId: string): Promise<Workflow> {
        try {
            const response = await apiClient.get(`/workflows/${workflowId}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching workflow:', error)
            throw error
        }
    }

    /**
     * Create workflow
     */
    static async createWorkflow(data: Partial<Workflow>): Promise<Workflow> {
        try {
            const response = await apiClient.post('/workflows', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating workflow:', error)
            throw error
        }
    }

    /**
     * Update workflow
     */
    static async updateWorkflow(workflowId: string, data: Partial<Workflow>): Promise<Workflow> {
        try {
            const response = await apiClient.patch(`/workflows/${workflowId}`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating workflow:', error)
            throw error
        }
    }

    /**
     * Delete workflow
     */
    static async deleteWorkflow(workflowId: string): Promise<void> {
        try {
            await apiClient.delete(`/workflows/${workflowId}`)
        } catch (error) {
            console.error('Error deleting workflow:', error)
            throw error
        }
    }

    /**
     * Execute workflow manually
     */
    static async executeWorkflow(workflowId: string, parameters?: any): Promise<WorkflowExecution> {
        try {
            const response = await apiClient.post(`/workflows/${workflowId}/execute`, parameters)
            return (response as any)?.data
        } catch (error) {
            console.error('Error executing workflow:', error)
            throw error
        }
    }

    /**
     * Toggle workflow status
     */
    static async toggleWorkflow(workflowId: string, active: boolean): Promise<Workflow> {
        try {
            const response = await apiClient.patch(`/workflows/${workflowId}/toggle`, { active })
            return (response as any)?.data
        } catch (error) {
            console.error('Error toggling workflow:', error)
            throw error
        }
    }

    /**
     * Get workflow executions
     */
    static async getExecutions(workflowId: string): Promise<WorkflowExecution[]> {
        try {
            const response = await apiClient.get(`/workflows/${workflowId}/executions`)
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching executions:', error)
            throw error
        }
    }

    /**
     * Get execution details
     */
    static async getExecutionDetails(executionId: string): Promise<WorkflowExecution> {
        try {
            const response = await apiClient.get(`/workflows/executions/${executionId}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching execution details:', error)
            throw error
        }
    }

    /**
     * Get workflow templates
     */
    static async getTemplates(category?: string): Promise<WorkflowTemplate[]> {
        try {
            const response = await apiClient.get('/workflows/templates', { params: { category } })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching templates:', error)
            throw error
        }
    }

    /**
     * Create workflow from template
     */
    static async createFromTemplate(templateId: string, data: any): Promise<Workflow> {
        try {
            const response = await apiClient.post(`/workflows/templates/${templateId}/create`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating from template:', error)
            throw error
        }
    }

    /**
     * Get available triggers
     */
    static async getAvailableTriggers(): Promise<any[]> {
        try {
            const response = await apiClient.get('/workflows/triggers')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching triggers:', error)
            throw error
        }
    }

    /**
     * Get available actions
     */
    static async getAvailableActions(): Promise<any[]> {
        try {
            const response = await apiClient.get('/workflows/actions')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching actions:', error)
            throw error
        }
    }

    /**
     * Test workflow
     */
    static async testWorkflow(config: any): Promise<any> {
        try {
            const response = await apiClient.post('/workflows/test', config)
            return (response as any)?.data
        } catch (error) {
            console.error('Error testing workflow:', error)
            throw error
        }
    }

    /**
     * Get workflow statistics
     */
    static async getWorkflowStatistics(workflowId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/workflows/${workflowId}/statistics`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching statistics:', error)
            throw error
        }
    }

    /**
     * Clone workflow
     */
    static async cloneWorkflow(workflowId: string, name: string): Promise<Workflow> {
        try {
            const response = await apiClient.post(`/workflows/${workflowId}/clone`, { name })
            return (response as any)?.data
        } catch (error) {
            console.error('Error cloning workflow:', error)
            throw error
        }
    }
}

export default WorkflowAutomationService
