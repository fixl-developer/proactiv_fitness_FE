import { apiClient } from '../api/client'

export interface TrainingModule {
    id: string
    title: string
    description?: string
    duration: string
    category: string
    progress: number
    status: 'completed' | 'in-progress' | 'not-started'
    startedAt?: string
    completedAt?: string
    instructor?: string
    materials?: { name: string; url: string }[]
}

export interface QualityAudit {
    id: string
    ticketId: string
    score: number
    status: 'passed' | 'needs-improvement' | 'failed'
    reviewer: string
    reviewerId: string
    date: string
    feedback?: string
    checklist?: { item: string; passed: boolean }[]
}

export interface AutomationRule {
    id: string
    name: string
    description?: string
    trigger: string
    action: string
    isActive: boolean
    priority: number
    createdAt: string
    updatedAt: string
    createdBy?: string
    testResults?: { success: boolean; message: string }
}

export interface StaffSchedule {
    id: string
    staffId: string
    staffName: string
    shift: 'morning' | 'evening' | 'night'
    startTime: string
    endTime: string
    days: string[]
    startDate: string
    endDate?: string
    isActive: boolean
    notes?: string
}

export interface KnowledgeArticle {
    id: string
    title: string
    content: string
    category: string
    tags: string[]
    views: number
    helpful: number
    unhelpful: number
    author: string
    createdAt: string
    updatedAt: string
    isPublished: boolean
}

export class StaffManagementService {
    /**
     * Get training modules for staff member
     */
    static async getTrainingModules(staffId?: string, filters?: { status?: string; page?: number; limit?: number }): Promise<{ modules: TrainingModule[]; total: number }> {
        try {
            const params: Record<string, any> = { ...filters }
            if (staffId) params.staffId = staffId
            const response = await apiClient.get('/staff/training', { params })
            return (response as any)?.data || { modules: [], total: 0 }
        } catch (error) {
            console.error('Error fetching training modules:', error)
            throw error
        }
    }

    /**
     * Get training module by ID
     */
    static async getTrainingModuleById(id: string): Promise<TrainingModule> {
        try {
            const response = await apiClient.get(`/staff/training/${id}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching training module:', error)
            throw error
        }
    }

    /**
     * Update training module progress
     */
    static async updateTrainingProgress(id: string, progress: number, status: string): Promise<TrainingModule> {
        try {
            const response = await apiClient.patch(`/staff/training/${id}`, { progress, status })
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating training progress:', error)
            throw error
        }
    }

    /**
     * Get quality audits
     */
    static async getQualityAudits(filters?: { status?: string; reviewerId?: string; page?: number; limit?: number }): Promise<{ audits: QualityAudit[]; total: number }> {
        try {
            const response = await apiClient.get('/staff/quality-audits', { params: filters })
            return (response as any)?.data || { audits: [], total: 0 }
        } catch (error) {
            console.error('Error fetching quality audits:', error)
            throw error
        }
    }

    /**
     * Create quality audit
     */
    static async createQualityAudit(data: Omit<QualityAudit, 'id' | 'date'>): Promise<QualityAudit> {
        try {
            const response = await apiClient.post('/staff/quality-audits', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating quality audit:', error)
            throw error
        }
    }

    /**
     * Get automation rules
     */
    static async getAutomationRules(filters?: { isActive?: boolean; page?: number; limit?: number }): Promise<{ rules: AutomationRule[]; total: number }> {
        try {
            const response = await apiClient.get('/staff/automation-rules', { params: filters })
            return (response as any)?.data || { rules: [], total: 0 }
        } catch (error) {
            console.error('Error fetching automation rules:', error)
            throw error
        }
    }

    /**
     * Create automation rule
     */
    static async createAutomationRule(data: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AutomationRule> {
        try {
            const response = await apiClient.post('/staff/automation-rules', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating automation rule:', error)
            throw error
        }
    }

    /**
     * Update automation rule
     */
    static async updateAutomationRule(id: string, data: Partial<AutomationRule>): Promise<AutomationRule> {
        try {
            const response = await apiClient.patch(`/staff/automation-rules/${id}`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating automation rule:', error)
            throw error
        }
    }

    /**
     * Toggle automation rule active status
     */
    static async toggleAutomationRule(id: string): Promise<AutomationRule> {
        try {
            const response = await apiClient.patch(`/staff/automation-rules/${id}/toggle`, {})
            return (response as any)?.data
        } catch (error) {
            console.error('Error toggling automation rule:', error)
            throw error
        }
    }

    /**
     * Test automation rule
     */
    static async testAutomationRule(id: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.post(`/staff/automation-rules/${id}/test`, {})
            return (response as any)?.data
        } catch (error) {
            console.error('Error testing automation rule:', error)
            throw error
        }
    }

    /**
     * Get staff schedules
     */
    static async getStaffSchedules(filters?: { staffId?: string; isActive?: boolean; page?: number; limit?: number }): Promise<{ schedules: StaffSchedule[]; total: number }> {
        try {
            const response = await apiClient.get('/staff/schedules', { params: filters })
            return (response as any)?.data || { schedules: [], total: 0 }
        } catch (error) {
            console.error('Error fetching staff schedules:', error)
            throw error
        }
    }

    /**
     * Create staff schedule
     */
    static async createStaffSchedule(data: Omit<StaffSchedule, 'id'>): Promise<StaffSchedule> {
        try {
            const response = await apiClient.post('/staff/schedules', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating staff schedule:', error)
            throw error
        }
    }

    /**
     * Update staff schedule
     */
    static async updateStaffSchedule(id: string, data: Partial<StaffSchedule>): Promise<StaffSchedule> {
        try {
            const response = await apiClient.patch(`/staff/schedules/${id}`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating staff schedule:', error)
            throw error
        }
    }

    /**
     * Get knowledge base articles
     */
    static async getKnowledgeArticles(filters?: { category?: string; search?: string; page?: number; limit?: number }): Promise<{ articles: KnowledgeArticle[]; total: number }> {
        try {
            const response = await apiClient.get('/staff/knowledge-base', { params: filters })
            return (response as any)?.data || { articles: [], total: 0 }
        } catch (error) {
            console.error('Error fetching knowledge articles:', error)
            throw error
        }
    }

    /**
     * Get knowledge article by ID
     */
    static async getKnowledgeArticleById(id: string): Promise<KnowledgeArticle> {
        try {
            const response = await apiClient.get(`/staff/knowledge-base/${id}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching knowledge article:', error)
            throw error
        }
    }

    /**
     * Create knowledge article
     */
    static async createKnowledgeArticle(data: Omit<KnowledgeArticle, 'id' | 'views' | 'helpful' | 'unhelpful' | 'createdAt' | 'updatedAt'>): Promise<KnowledgeArticle> {
        try {
            const response = await apiClient.post('/staff/knowledge-base', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating knowledge article:', error)
            throw error
        }
    }

    /**
     * Update knowledge article
     */
    static async updateKnowledgeArticle(id: string, data: Partial<KnowledgeArticle>): Promise<KnowledgeArticle> {
        try {
            const response = await apiClient.patch(`/staff/knowledge-base/${id}`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating knowledge article:', error)
            throw error
        }
    }

    /**
     * Mark article as helpful
     */
    static async markArticleHelpful(id: string, helpful: boolean): Promise<KnowledgeArticle> {
        try {
            const response = await apiClient.post(`/staff/knowledge-base/${id}/helpful`, { helpful })
            return (response as any)?.data
        } catch (error) {
            console.error('Error marking article helpful:', error)
            throw error
        }
    }

    /**
     * Search knowledge base
     */
    static async searchKnowledgeBase(query: string): Promise<KnowledgeArticle[]> {
        try {
            const response = await apiClient.get('/staff/knowledge-base/search', { params: { q: query } })
            return (response as any)?.data?.articles || []
        } catch (error) {
            console.error('Error searching knowledge base:', error)
            throw error
        }
    }
}

export default StaffManagementService
