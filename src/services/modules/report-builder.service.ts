import { apiClient } from '../api/client'

export interface Report {
    id: string
    name: string
    description: string
    type: string
    template?: string
    config: any
    schedule?: ReportSchedule
    createdAt: string
    createdBy: string
    lastRun?: string
}

export interface ReportSchedule {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
    time: string
    timezone: string
    recipients: string[]
    enabled: boolean
}

export interface ReportTemplate {
    id: string
    name: string
    description: string
    category: string
    config: any
    preview: string
}

export class ReportBuilderService {
    /**
     * Get all reports
     */
    static async getReports(filters?: { type?: string; status?: string }): Promise<Report[]> {
        try {
            const response = await apiClient.get('/reports', { params: filters })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching reports:', error)
            throw error
        }
    }

    /**
     * Get report by ID
     */
    static async getReportById(reportId: string): Promise<Report> {
        try {
            const response = await apiClient.get(`/reports/${reportId}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching report:', error)
            throw error
        }
    }

    /**
     * Create report
     */
    static async createReport(data: Partial<Report>): Promise<Report> {
        try {
            const response = await apiClient.post('/reports', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating report:', error)
            throw error
        }
    }

    /**
     * Update report
     */
    static async updateReport(reportId: string, data: Partial<Report>): Promise<Report> {
        try {
            const response = await apiClient.patch(`/reports/${reportId}`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating report:', error)
            throw error
        }
    }

    /**
     * Delete report
     */
    static async deleteReport(reportId: string): Promise<void> {
        try {
            await apiClient.delete(`/reports/${reportId}`)
        } catch (error) {
            console.error('Error deleting report:', error)
            throw error
        }
    }

    /**
     * Generate report
     */
    static async generateReport(reportId: string, parameters?: any): Promise<any> {
        try {
            const response = await apiClient.post(`/reports/${reportId}/generate`, parameters)
            return (response as any)?.data
        } catch (error) {
            console.error('Error generating report:', error)
            throw error
        }
    }

    /**
     * Export report
     */
    static async exportReport(reportId: string, format: 'pdf' | 'excel' | 'csv'): Promise<Blob> {
        try {
            const response = await apiClient.get(`/reports/${reportId}/export`, {
                params: { format },
                responseType: 'blob'
            })
            return response as any
        } catch (error) {
            console.error('Error exporting report:', error)
            throw error
        }
    }

    /**
     * Get report templates
     */
    static async getTemplates(category?: string): Promise<ReportTemplate[]> {
        try {
            const response = await apiClient.get('/reports/templates', { params: { category } })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching templates:', error)
            throw error
        }
    }

    /**
     * Create report from template
     */
    static async createFromTemplate(templateId: string, data: any): Promise<Report> {
        try {
            const response = await apiClient.post(`/reports/templates/${templateId}/create`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating from template:', error)
            throw error
        }
    }

    /**
     * Get scheduled reports
     */
    static async getScheduledReports(): Promise<Report[]> {
        try {
            const response = await apiClient.get('/reports/scheduled')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching scheduled reports:', error)
            throw error
        }
    }

    /**
     * Schedule report
     */
    static async scheduleReport(reportId: string, schedule: ReportSchedule): Promise<Report> {
        try {
            const response = await apiClient.post(`/reports/${reportId}/schedule`, schedule)
            return (response as any)?.data
        } catch (error) {
            console.error('Error scheduling report:', error)
            throw error
        }
    }

    /**
     * Update report schedule
     */
    static async updateSchedule(reportId: string, schedule: Partial<ReportSchedule>): Promise<Report> {
        try {
            const response = await apiClient.patch(`/reports/${reportId}/schedule`, schedule)
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating schedule:', error)
            throw error
        }
    }

    /**
     * Delete report schedule
     */
    static async deleteSchedule(reportId: string): Promise<void> {
        try {
            await apiClient.delete(`/reports/${reportId}/schedule`)
        } catch (error) {
            console.error('Error deleting schedule:', error)
            throw error
        }
    }

    /**
     * Get report execution history
     */
    static async getExecutionHistory(reportId: string): Promise<any[]> {
        try {
            const response = await apiClient.get(`/reports/${reportId}/history`)
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching execution history:', error)
            throw error
        }
    }

    /**
     * Share report
     */
    static async shareReport(reportId: string, recipients: string[], message?: string): Promise<void> {
        try {
            await apiClient.post(`/reports/${reportId}/share`, { recipients, message })
        } catch (error) {
            console.error('Error sharing report:', error)
            throw error
        }
    }

    /**
     * Get report data sources
     */
    static async getDataSources(): Promise<any[]> {
        try {
            const response = await apiClient.get('/reports/data-sources')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching data sources:', error)
            throw error
        }
    }

    /**
     * Preview report
     */
    static async previewReport(config: any): Promise<any> {
        try {
            const response = await apiClient.post('/reports/preview', config)
            return (response as any)?.data
        } catch (error) {
            console.error('Error previewing report:', error)
            throw error
        }
    }

    /**
     * Get report statistics
     */
    static async getReportStatistics(reportId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/reports/${reportId}/statistics`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching statistics:', error)
            throw error
        }
    }
}

export default ReportBuilderService
