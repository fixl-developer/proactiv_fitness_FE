import { apiClient } from '../lib/api'

// Support Staff Dashboard Types
export interface SupportDashboard {
    totalTickets: number
    openTickets: number
    resolvedTickets: number
    avgResolutionTime: number
    customerSatisfaction: number
    responseTime: number
    ticketVolume: number
    resolutionRate: number
    escalatedTickets: number
    pendingReview: number
    criticalAlerts: number
    warnings: number
}

// Ticket Types
export interface SupportTicket {
    id: string
    subject: string
    customer: string
    customerEmail: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    status: 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed'
    category: string
    created: string
    updated: string
    assignedTo?: string
    description: string
    resolution?: string
    tags: string[]
}

// Inquiry Types
export interface CustomerInquiry {
    id: string
    customerName: string
    customerEmail: string
    subject: string
    message: string
    type: 'general' | 'billing' | 'technical' | 'complaint' | 'suggestion'
    status: 'new' | 'in-progress' | 'resolved' | 'closed'
    priority: 'low' | 'medium' | 'high'
    assignedTo?: string
    created: string
    updated: string
    responses: {
        id: string
        message: string
        author: string
        timestamp: string
        isInternal: boolean
    }[]
}

// Knowledge Base Types
export interface KnowledgeBaseArticle {
    id: string
    title: string
    content: string
    category: string
    tags: string[]
    status: 'draft' | 'published' | 'archived'
    author: string
    created: string
    updated: string
    views: number
    helpful: number
    notHelpful: number
    featured: boolean
}

// Analytics Types
export interface SupportAnalytics {
    ticketTrends: {
        date: string
        tickets: number
        resolved: number
    }[]
    resolutionTimes: {
        category: string
        avgTime: number
        target: number
    }[]
    customerSatisfaction: {
        period: string
        rating: number
        responses: number
    }[]
    topIssues: {
        category: string
        count: number
        trend: 'up' | 'down' | 'stable'
    }[]
    staffPerformance: {
        staffId: string
        name: string
        ticketsResolved: number
        avgResolutionTime: number
        satisfaction: number
    }[]
}

// Settings Types
export interface StaffSettings {
    profile: {
        firstName: string
        lastName: string
        email: string
        phone: string
        department: string
        role: string
        timezone: string
        language: string
    }
    notifications: {
        emailNotifications: boolean
        pushNotifications: boolean
        smsNotifications: boolean
        ticketAssignments: boolean
        escalations: boolean
        systemUpdates: boolean
        weeklyReports: boolean
        soundEnabled: boolean
        desktopNotifications: boolean
    }
    security: {
        twoFactorEnabled: boolean
        sessionTimeout: number
        passwordLastChanged: string
        loginHistory: boolean
        ipRestriction: boolean
    }
    preferences: {
        theme: string
        ticketsPerPage: number
        defaultPriority: string
        autoRefresh: boolean
        refreshInterval: number
        showClosedTickets: boolean
        compactView: boolean
    }
}

class SupportStaffService {
    // Dashboard Methods
    async getDashboardData(): Promise<SupportDashboard> {
        const response = await apiClient.get<{ success: boolean; data: SupportDashboard }>('/staff/dashboard')
        return response.data || response
    }

    // Ticket Methods
    async getTickets(filters?: any): Promise<{ tickets: SupportTicket[]; total: number; pages: number }> {
        const params = new URLSearchParams()
        if (filters?.status) params.append('status', filters.status)
        if (filters?.priority) params.append('priority', filters.priority)
        if (filters?.search) params.append('search', filters.search)

        const response = await apiClient.get<{ success: boolean; data: any }>(`/staff/tickets?${params.toString()}`)
        return response.data || response
    }

    async createTicket(ticketData: Partial<SupportTicket>): Promise<SupportTicket> {
        const response = await apiClient.post<{ success: boolean; data: SupportTicket }>('/staff/tickets', ticketData)
        return response.data || response
    }

    async updateTicket(ticketId: string, updates: Partial<SupportTicket>): Promise<SupportTicket> {
        const response = await apiClient.put<{ success: boolean; data: SupportTicket }>(`/staff/tickets/${ticketId}`, updates)
        return response.data || response
    }

    async deleteTicket(ticketId: string): Promise<void> {
        await apiClient.delete(`/staff/tickets/${ticketId}`)
    }

    // Inquiry Methods
    async getInquiries(filters?: any): Promise<{ inquiries: CustomerInquiry[]; total: number; pages: number }> {
        const params = new URLSearchParams()
        if (filters?.status) params.append('status', filters.status)
        if (filters?.type) params.append('type', filters.type)
        if (filters?.search) params.append('search', filters.search)

        const response = await apiClient.get<{ success: boolean; data: any }>(`/staff/inquiries?${params.toString()}`)
        return response.data || response
    }

    async updateInquiry(inquiryId: string, updates: Partial<CustomerInquiry>): Promise<CustomerInquiry> {
        const response = await apiClient.put<{ success: boolean; data: CustomerInquiry }>(`/staff/inquiries/${inquiryId}`, updates)
        return response.data || response
    }

    async respondToInquiry(inquiryId: string, message: string, isInternal: boolean = false): Promise<CustomerInquiry> {
        const response = await apiClient.post<{ success: boolean; data: CustomerInquiry }>(`/staff/inquiries/${inquiryId}/respond`, {
            message,
            isInternal
        })
        return response.data || response
    }

    // Knowledge Base Methods
    async getKnowledgeBaseArticles(filters?: any): Promise<{ articles: KnowledgeBaseArticle[]; total: number; pages: number }> {
        const params = new URLSearchParams()
        if (filters?.category) params.append('category', filters.category)
        if (filters?.status) params.append('status', filters.status)
        if (filters?.search) params.append('search', filters.search)

        const response = await apiClient.get<{ success: boolean; data: any }>(`/staff/knowledge-base?${params.toString()}`)
        return response.data || response
    }

    async createKnowledgeBaseArticle(articleData: Partial<KnowledgeBaseArticle>): Promise<KnowledgeBaseArticle> {
        const response = await apiClient.post<{ success: boolean; data: KnowledgeBaseArticle }>('/staff/knowledge-base', articleData)
        return response.data || response
    }

    async updateKnowledgeBaseArticle(articleId: string, updates: Partial<KnowledgeBaseArticle>): Promise<KnowledgeBaseArticle> {
        const response = await apiClient.put<{ success: boolean; data: KnowledgeBaseArticle }>(`/staff/knowledge-base/${articleId}`, updates)
        return response.data || response
    }

    async deleteKnowledgeBaseArticle(articleId: string): Promise<void> {
        await apiClient.delete(`/staff/knowledge-base/${articleId}`)
    }

    // Analytics Methods
    async getAnalytics(period: string = '30d'): Promise<SupportAnalytics> {
        const response = await apiClient.get<{ success: boolean; data: SupportAnalytics }>(`/staff/analytics?period=${period}`)
        return response.data || response
    }

    // Settings Methods
    async getSettings(): Promise<StaffSettings> {
        const response = await apiClient.get<{ success: boolean; data: StaffSettings }>('/staff/settings')
        return response.data || response
    }

    async updateSettings(settings: Partial<StaffSettings>): Promise<StaffSettings> {
        const response = await apiClient.put<{ success: boolean; data: StaffSettings }>('/staff/settings', settings)
        return response.data || response
    }

    // Advanced Features Methods

    // Live Chat Methods
    async getChatSessions(filters?: any): Promise<any> {
        const response = await apiClient.get<{ success: boolean; data: any }>('/staff/live-chat/sessions')
        return response.data || response
    }

    async getChatMessages(chatId: string): Promise<any> {
        const response = await apiClient.get<{ success: boolean; data: any }>(`/staff/live-chat/${chatId}/messages`)
        return response.data || response
    }

    async sendChatMessage(chatId: string, message: string): Promise<any> {
        const response = await apiClient.post<{ success: boolean; data: any }>(`/staff/live-chat/${chatId}/messages`, { message })
        return response.data || response
    }

    async createChatSession(data: { customerName: string; customerEmail?: string; initialMessage?: string }): Promise<any> {
        const response = await apiClient.post<{ success: boolean; data: any }>('/staff/live-chat/sessions', data)
        return response.data || response
    }

    // Escalations Methods
    async getEscalations(filters?: any): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/staff/escalations')
            return response.data || response
        } catch (error) {
            console.error('Error fetching escalations:', error)
            // Return mock data for development
            return {
                escalations: [
                    {
                        id: 'ESC-001',
                        ticketId: 'TKT-001',
                        title: 'Payment Processing Failure - Urgent Resolution Needed',
                        customer: 'Sarah Johnson',
                        priority: 'critical',
                        status: 'pending',
                        escalatedAt: '2024-03-15T09:30:00Z'
                    }
                ]
            }
        }
    }

    async createEscalation(escalationData: any): Promise<any> {
        try {
            const response = await apiClient.post<{ success: boolean; data: any }>('/staff/escalations', escalationData)
            return response.data || response
        } catch (error) {
            console.error('Error creating escalation:', error)
            throw error
        }
    }

    async updateEscalation(escalationId: string, updates: any): Promise<any> {
        try {
            const response = await apiClient.put<{ success: boolean; data: any }>(`/staff/escalations/${escalationId}`, updates)
            return response.data || response
        } catch (error) {
            console.error('Error updating escalation:', error)
            throw error
        }
    }

    // Schedules Methods
    async getSchedules(filters?: any): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/staff/schedules-advanced')
            return response.data || response
        } catch (error) {
            console.error('Error fetching schedules:', error)
            // Return mock data for development
            return {
                schedules: [
                    {
                        id: 'SCH-001',
                        staffName: 'John Doe',
                        date: '2024-03-15',
                        startTime: '09:00',
                        endTime: '17:00',
                        shiftType: 'full-day',
                        status: 'confirmed',
                        location: 'Main Office'
                    }
                ]
            }
        }
    }

    async createSchedule(scheduleData: any): Promise<any> {
        try {
            const response = await apiClient.post<{ success: boolean; data: any }>('/staff/schedules', scheduleData)
            return response.data || response
        } catch (error) {
            console.error('Error creating schedule:', error)
            throw error
        }
    }

    async updateSchedule(scheduleId: string, updates: any): Promise<any> {
        try {
            const response = await apiClient.put<{ success: boolean; data: any }>(`/staff/schedules/${scheduleId}`, updates)
            return response.data || response
        } catch (error) {
            console.error('Error updating schedule:', error)
            throw error
        }
    }

    // Training Methods
    async getTrainingModules(filters?: any): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/staff/training/modules')
            return response.data || response
        } catch (error) {
            console.error('Error fetching training modules:', error)
            // Return mock data for development
            return {
                modules: [
                    {
                        id: 'TM-001',
                        title: 'Customer Service Excellence',
                        description: 'Learn the fundamentals of providing exceptional customer service',
                        category: 'Customer Service',
                        type: 'video',
                        duration: 45,
                        difficulty: 'beginner',
                        status: 'completed',
                        progress: 100
                    }
                ]
            }
        }
    }

    async getTrainingPaths(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/staff/training/paths')
            return response.data || response
        } catch (error) {
            console.error('Error fetching training paths:', error)
            return { paths: [] }
        }
    }

    async getUserProgress(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/staff/training/progress')
            return response.data || response
        } catch (error) {
            console.error('Error fetching user progress:', error)
            return {
                totalModules: 4,
                completedModules: 2,
                inProgressModules: 1,
                certificatesEarned: 2,
                totalHours: 3.5,
                currentStreak: 5
            }
        }
    }

    // Reports Methods
    async getReports(type: string, filters?: any): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>(`/staff/reports/${type}`)
            return response.data || response
        } catch (error) {
            console.error('Error fetching reports:', error)
            return { reports: [] }
        }
    }

    async generateReport(reportConfig: any): Promise<any> {
        try {
            const response = await apiClient.post<{ success: boolean; data: any }>('/staff/reports/generate', reportConfig)
            return response.data || response
        } catch (error) {
            console.error('Error generating report:', error)
            throw error
        }
    }

    // Automation Methods
    async getAutomationRules(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/staff/automation/rules')
            return response.data || response
        } catch (error) {
            console.error('Error fetching automation rules:', error)
            return { rules: [] }
        }
    }

    async createAutomationRule(ruleData: any): Promise<any> {
        try {
            const response = await apiClient.post<{ success: boolean; data: any }>('/staff/automation/rules', ruleData)
            return response.data || response
        } catch (error) {
            console.error('Error creating automation rule:', error)
            throw error
        }
    }

    // Quality Assurance Methods
    async getQualityMetrics(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/staff/quality/metrics')
            return response.data || response
        } catch (error) {
            console.error('Error fetching quality metrics:', error)
            return { metrics: [] }
        }
    }

    async getQualityReviews(filters?: any): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/staff/quality/reviews')
            return response.data || response
        } catch (error) {
            console.error('Error fetching quality reviews:', error)
            return { reviews: [] }
        }
    }

    // Communication Methods
    async getAnnouncements(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/staff/communication/announcements')
            return response.data || response
        } catch (error) {
            console.error('Error fetching announcements:', error)
            return { announcements: [] }
        }
    }

    async getTeamMessages(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/staff/communication/messages')
            return response.data || response
        } catch (error) {
            console.error('Error fetching team messages:', error)
            return { messages: [] }
        }
    }

    async sendTeamMessage(messageData: any): Promise<any> {
        try {
            const response = await apiClient.post<{ success: boolean; data: any }>('/staff/communication/messages', messageData)
            return response.data || response
        } catch (error) {
            console.error('Error sending team message:', error)
            throw error
        }
    }
}

export const supportStaffService = new SupportStaffService()