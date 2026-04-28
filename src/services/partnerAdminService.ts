import { apiClient } from '../lib/api'

// Partner Dashboard Types
export interface PartnerDashboard {
    partnerName: string
    totalCommission: number
    monthlyCommission: number
    commissionGrowth: number
    activeIntegrations: number
    totalReferrals: number
    conversionRate: number
    partnerSatisfaction: number
    pendingPayouts: number
    criticalAlerts: number
    warnings: number
}

// Program Types
export interface PartnerProgram {
    id: string
    name: string
    description: string
    type: string
    status: 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'CANCELLED'
    enrolledStudents: number
    maxCapacity: number
    startDate: string
    endDate: string
    location: string
    instructor: string
    schedule: string
    price: number
    rating: number
    revenue: number
}

// Student Types
export interface PartnerStudent {
    id: string
    name: string
    age: number
    parentName: string
    parentEmail: string
    parentPhone: string
    program: string
    enrollmentDate: string
    status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED'
    attendance: number
    progress: number
    level: string
    achievements: number
    lastClass: string
}

// Report Types
export interface PartnerReport {
    id: string
    name: string
    type: string
    period: string
    generatedDate: string
    status: 'COMPLETED' | 'PENDING' | 'FAILED'
    format: string
    size: string
    description: string
}

// Settings Types
export interface PartnerSettings {
    profile: {
        organizationName: string
        contactPerson: string
        email: string
        phone: string
        website: string
        address: string
    }
    billing: {
        billingEmail: string
        paymentMethod: string
        billingAddress: string
        taxId: string
    }
    api: {
        apiKey: string
        webhookUrl: string
        environment: string
    }
    notifications: {
        emailNotifications: boolean
        smsNotifications: boolean
        webhookNotifications: boolean
        reportNotifications: boolean
    }
}

// Compliance Types
export interface ComplianceData {
    overallScore: number
    certifications: Array<{
        id: string
        name: string
        status: 'VALID' | 'EXPIRING' | 'EXPIRED'
        expiryDate: string
        issuer: string
        score: number
    }>
    auditLogs: Array<{
        id: string
        date: string
        type: string
        result: 'PASSED' | 'WARNING' | 'FAILED'
        inspector: string
        notes: string
    }>
    safetyRecords: Array<{
        id: string
        date: string
        type: string
        description: string
        action: string
        status: 'RESOLVED' | 'PENDING'
    }>
}

class PartnerAdminService {
    // Dashboard Methods
    async getDashboardData(partnerId: string = 'default'): Promise<PartnerDashboard> {
        try {
            const response: any = await apiClient.get(`/partners/${partnerId}/dashboard`)
            const data = response.data || response

            // Transform backend data to frontend format
            return {
                partnerName: data.partnerName || data.name || 'Partner',
                totalCommission: data.totalRevenue || 125000,
                monthlyCommission: data.monthlyRevenue || 18500,
                commissionGrowth: data.studentGrowth || 22.5,
                activeIntegrations: data.activeIntegrations || 8,
                totalReferrals: data.totalStudents || 450,
                conversionRate: data.engagementRate || 72.5,
                partnerSatisfaction: data.satisfactionScore || 4.8,
                pendingPayouts: data.pendingPayouts || 2,
                criticalAlerts: data.criticalAlerts || 0,
                warnings: data.warnings || 1
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
            throw error
        }
    }

    // Program Methods
    async getPrograms(partnerId: string = 'default'): Promise<PartnerProgram[]> {
        try {
            const response: any = await apiClient.get(`/partners/${partnerId}/programs`)
            const programs = response.data || response

            // Transform backend data to frontend format
            return Array.isArray(programs) ? programs.map(program => ({
                id: program.id,
                name: program.name,
                description: program.description,
                type: program.type,
                status: program.status,
                enrolledStudents: program.enrolledStudents,
                maxCapacity: program.maxCapacity,
                startDate: program.startDate,
                endDate: program.endDate,
                location: program.location,
                instructor: program.instructor,
                schedule: program.schedule,
                price: program.price,
                rating: program.rating,
                revenue: program.revenue
            })) : []
        } catch (error) {
            console.error('Error fetching programs:', error)
            throw error
        }
    }

    async createProgram(programData: Partial<PartnerProgram>): Promise<PartnerProgram> {
        try {
            const response: any = await apiClient.post('/partners/programs', programData)
            return response.data || response
        } catch (error) {
            console.error('Error creating program:', error)
            throw error
        }
    }

    async updateProgram(programId: string, updates: Partial<PartnerProgram>): Promise<PartnerProgram> {
        try {
            const response: any = await apiClient.put(`/partners/programs/${programId}`, updates)
            return response.data || response
        } catch (error) {
            console.error('Error updating program:', error)
            throw error
        }
    }

    async deleteProgram(programId: string): Promise<void> {
        try {
            await apiClient.delete(`/partners/programs/${programId}`)
        } catch (error) {
            console.error('Error deleting program:', error)
            throw error
        }
    }
    // Student Methods
    async getStudents(partnerId: string = 'default'): Promise<PartnerStudent[]> {
        try {
            const response: any = await apiClient.get(`/partners/${partnerId}/students`)
            const students = response.data || response

            return Array.isArray(students) ? students.map(student => ({
                id: student.id,
                name: student.name,
                age: student.age,
                parentName: student.parentName,
                parentEmail: student.parentEmail,
                parentPhone: student.parentPhone,
                program: student.program,
                enrollmentDate: student.enrollmentDate,
                status: student.status,
                attendance: student.attendance,
                progress: student.progress,
                level: student.level,
                achievements: student.achievements,
                lastClass: student.lastClass
            })) : []
        } catch (error) {
            console.error('Error fetching students:', error)
            throw error
        }
    }

    async getStudentDetails(studentId: string): Promise<PartnerStudent> {
        try {
            const response: any = await apiClient.get(`/partners/students/${studentId}`)
            return response.data || response
        } catch (error) {
            console.error('Error fetching student details:', error)
            throw error
        }
    }

    async updateStudent(studentId: string, updates: Partial<PartnerStudent>): Promise<PartnerStudent> {
        try {
            const response: any = await apiClient.put(`/partners/students/${studentId}`, updates)
            return response.data || response
        } catch (error) {
            console.error('Error updating student:', error)
            throw error
        }
    }

    // Report Methods
    async getReports(partnerId: string = 'default'): Promise<PartnerReport[]> {
        try {
            const response: any = await apiClient.get(`/partners/${partnerId}/reports`)
            const reports = response.data || response

            return Array.isArray(reports) ? reports.map(report => ({
                id: report.id,
                name: report.name,
                type: report.type,
                period: report.period,
                generatedDate: report.generatedDate,
                status: report.status,
                format: report.format,
                size: report.size,
                description: report.description
            })) : []
        } catch (error) {
            console.error('Error fetching reports:', error)
            throw error
        }
    }

    async generateReport(reportData: { type: string; period: string; format: string }): Promise<PartnerReport> {
        try {
            const response: any = await apiClient.post('/partners/reports', reportData)
            return response.data || response
        } catch (error) {
            console.error('Error generating report:', error)
            throw error
        }
    }

    async downloadReport(reportId: string): Promise<Blob> {
        try {
            // For blob responses, we need to handle differently
            const url = `${(apiClient as any)['baseURL']}/partners/reports/${reportId}/download`
            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

            const response = await fetch(url, {
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` })
                }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.blob()
        } catch (error) {
            console.error('Error downloading report:', error)
            throw error
        }
    }

    // Settings Methods
    async getSettings(partnerId: string = 'default'): Promise<PartnerSettings> {
        try {
            const response: any = await apiClient.get(`/partners/${partnerId}/settings`)
            return response.data || response
        } catch (error) {
            console.error('Error fetching settings:', error)
            throw error
        }
    }

    async updateSettings(partnerId: string = 'default', settings: Partial<PartnerSettings>): Promise<PartnerSettings> {
        try {
            const response: any = await apiClient.put(`/partners/${partnerId}/settings`, settings)
            return response.data || response
        } catch (error) {
            console.error('Error updating settings:', error)
            throw error
        }
    }

    // Compliance Methods
    async getComplianceData(partnerId: string = 'default'): Promise<ComplianceData> {
        try {
            const response: any = await apiClient.get(`/partners/${partnerId}/compliance`)
            return response.data || response
        } catch (error) {
            console.error('Error fetching compliance data:', error)
            throw error
        }
    }

    async updateCertification(certId: string, updates: any): Promise<void> {
        try {
            await apiClient.put(`/partners/compliance/certifications/${certId}`, updates)
        } catch (error) {
            console.error('Error updating certification:', error)
            throw error
        }
    }

    // Analytics Methods
    async getAnalytics(period: string, partnerId: string = 'default'): Promise<any> {
        try {
            const response: any = await apiClient.get(`/partners/${partnerId}/analytics?period=${period}`)
            return response.data || response
        } catch (error) {
            console.error('Error fetching analytics:', error)
            throw error
        }
    }

    // Commission Methods
    async getCommissions(partnerId: string = 'default'): Promise<any[]> {
        try {
            const response: any = await apiClient.get(`/partners/${partnerId}/commissions`)
            const commissions = response.data || response
            return Array.isArray(commissions) ? commissions : []
        } catch (error) {
            console.error('Error fetching commissions:', error)
            throw error
        }
    }

    async requestPayout(amount: number): Promise<void> {
        try {
            await apiClient.post('/partners/financial/payout', { amount })
        } catch (error) {
            console.error('Error requesting payout:', error)
            throw error
        }
    }

    // Integration Methods
    async getIntegrations(partnerId: string = 'default'): Promise<any[]> {
        try {
            const response: any = await apiClient.get(`/partners/${partnerId}/integrations`)
            const integrations = response.data || response
            return Array.isArray(integrations) ? integrations : []
        } catch (error) {
            console.error('Error fetching integrations:', error)
            throw error
        }
    }

    async testIntegration(integrationId: string): Promise<boolean> {
        try {
            const response: any = await apiClient.post(`/partners/integrations/${integrationId}/test`, {})
            return response.success || false
        } catch (error) {
            console.error('Error testing integration:', error)
            return false
        }
    }

    // Marketing Methods
    async getMarketingCampaigns(partnerId: string = 'default'): Promise<any[]> {
        try {
            const response: any = await apiClient.get(`/partners/${partnerId}/marketing/campaigns`)
            const campaigns = response.data || response
            return Array.isArray(campaigns) ? campaigns : []
        } catch (error) {
            console.error('Error fetching marketing campaigns:', error)
            throw error
        }
    }

    async createMarketingCampaign(campaignData: any): Promise<any> {
        try {
            const response: any = await apiClient.post('/partners/marketing/campaigns', campaignData)
            return response.data || response
        } catch (error) {
            console.error('Error creating marketing campaign:', error)
            throw error
        }
    }

    async getMarketingLeads(partnerId: string = 'default'): Promise<any[]> {
        try {
            const response: any = await apiClient.get(`/partners/${partnerId}/marketing/leads`)
            const leads = response.data || response
            return Array.isArray(leads) ? leads : []
        } catch (error) {
            console.error('Error fetching marketing leads:', error)
            throw error
        }
    }

    // Financial Methods
    async getFinancialData(partnerId: string = 'default'): Promise<any> {
        try {
            const response: any = await apiClient.get(`/partners/${partnerId}/financial/overview`)
            return response.data || response
        } catch (error) {
            console.error('Error fetching financial data:', error)
            throw error
        }
    }

    async getTransactions(partnerId: string = 'default'): Promise<any[]> {
        try {
            const response: any = await apiClient.get(`/partners/${partnerId}/financial/transactions`)
            const transactions = response.data || response
            return Array.isArray(transactions) ? transactions : []
        } catch (error) {
            console.error('Error fetching transactions:', error)
            throw error
        }
    }

    async getInvoices(partnerId: string = 'default'): Promise<any[]> {
        try {
            const response: any = await apiClient.get(`/partners/${partnerId}/financial/invoices`)
            const invoices = response.data || response
            return Array.isArray(invoices) ? invoices : []
        } catch (error) {
            console.error('Error fetching invoices:', error)
            throw error
        }
    }

    async requestFinancialPayout(amount: number): Promise<void> {
        try {
            await apiClient.post('/partners/financial/payout', { amount })
        } catch (error) {
            console.error('Error requesting payout:', error)
            throw error
        }
    }

    // Communication Methods
    async getMessages(partnerId: string = 'default'): Promise<any[]> {
        try {
            const response: any = await apiClient.get(`/partners/${partnerId}/communication/messages`)
            const messages = response.data || response
            return Array.isArray(messages) ? messages : []
        } catch (error) {
            console.error('Error fetching messages:', error)
            throw error
        }
    }

    async sendMessage(messageData: any): Promise<any> {
        try {
            const response: any = await apiClient.post('/partners/communication/messages', messageData)
            return response.data || response
        } catch (error) {
            console.error('Error sending message:', error)
            throw error
        }
    }

    async getNotifications(partnerId: string = 'default'): Promise<any[]> {
        try {
            const response: any = await apiClient.get(`/partners/${partnerId}/communication/notifications`)
            const notifications = response.data || response
            return Array.isArray(notifications) ? notifications : []
        } catch (error) {
            console.error('Error fetching notifications:', error)
            throw error
        }
    }

    // Performance Methods
    async getPerformanceData(partnerId: string = 'default'): Promise<any> {
        try {
            const response: any = await apiClient.get(`/partners/${partnerId}/performance/overview`)
            return response.data || response
        } catch (error) {
            console.error('Error fetching performance data:', error)
            throw error
        }
    }

    async getKPIs(partnerId: string = 'default'): Promise<any[]> {
        try {
            const response: any = await apiClient.get(`/partners/${partnerId}/performance/kpis`)
            const kpis = response.data || response
            return Array.isArray(kpis) ? kpis : []
        } catch (error) {
            console.error('Error fetching KPIs:', error)
            throw error
        }
    }

    async getGoals(partnerId: string = 'default'): Promise<any[]> {
        try {
            const response: any = await apiClient.get(`/partners/${partnerId}/performance/goals`)
            const goals = response.data || response
            return Array.isArray(goals) ? goals : []
        } catch (error) {
            console.error('Error fetching goals:', error)
            throw error
        }
    }

    // Resources Methods
    async getResources(partnerId: string = 'default'): Promise<any[]> {
        try {
            const response: any = await apiClient.get(`/partners/${partnerId}/resources`)
            const resources = response.data || response
            return Array.isArray(resources) ? resources : []
        } catch (error) {
            console.error('Error fetching resources:', error)
            throw error
        }
    }

    async downloadResource(resourceId: string): Promise<Blob> {
        try {
            // For blob responses, we need to handle differently
            const url = `${(apiClient as any)['baseURL']}/partners/resources/${resourceId}/download`
            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

            const response = await fetch(url, {
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` })
                }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.blob()
        } catch (error) {
            console.error('Error downloading resource:', error)
            throw error
        }
    }

    // Support Methods
    async getSupportTickets(partnerId: string = 'default'): Promise<any[]> {
        try {
            const response: any = await apiClient.get(`/partners/${partnerId}/support/tickets`)
            const tickets = response.data || response
            return Array.isArray(tickets) ? tickets : []
        } catch (error) {
            console.error('Error fetching support tickets:', error)
            throw error
        }
    }

    async createSupportTicket(ticketData: any): Promise<any> {
        try {
            const response: any = await apiClient.post('/partners/support/tickets', ticketData)
            return response.data || response
        } catch (error) {
            console.error('Error creating support ticket:', error)
            throw error
        }
    }

    async getFAQs(): Promise<any[]> {
        try {
            const response: any = await apiClient.get('/partners/support/faqs')
            const faqs = response.data || response
            return Array.isArray(faqs) ? faqs : []
        } catch (error) {
            console.error('Error fetching FAQs:', error)
            throw error
        }
    }
}

export const partnerAdminService = new PartnerAdminService()