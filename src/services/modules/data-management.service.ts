import { apiClient } from '../api/client'

export interface ImportJob {
    id: string
    fileName: string
    fileSize: number
    status: 'pending' | 'processing' | 'completed' | 'failed'
    totalRecords: number
    processedRecords: number
    failedRecords: number
    createdAt: string
    completedAt?: string
    errors?: any[]
}

export interface ExportJob {
    id: string
    name: string
    format: 'csv' | 'excel' | 'json' | 'xml'
    status: 'pending' | 'processing' | 'completed' | 'failed'
    totalRecords: number
    createdAt: string
    completedAt?: string
    downloadUrl?: string
}

export interface BulkOperation {
    id: string
    operation: string
    entity: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    totalRecords: number
    processedRecords: number
    createdAt: string
    completedAt?: string
}

export class DataManagementService {
    /**
     * Import data
     */
    static async importData(file: File, options: any): Promise<ImportJob> {
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('options', JSON.stringify(options))

            const response = await apiClient.post('/data/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            return (response as any)?.data
        } catch (error) {
            console.error('Error importing data:', error)
            throw error
        }
    }

    /**
     * Get import jobs
     */
    static async getImportJobs(): Promise<ImportJob[]> {
        try {
            const response = await apiClient.get('/data/import/jobs')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching import jobs:', error)
            throw error
        }
    }

    /**
     * Get import job status
     */
    static async getImportJobStatus(jobId: string): Promise<ImportJob> {
        try {
            const response = await apiClient.get(`/data/import/jobs/${jobId}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching import job status:', error)
            throw error
        }
    }

    /**
     * Cancel import job
     */
    static async cancelImportJob(jobId: string): Promise<void> {
        try {
            await apiClient.post(`/data/import/jobs/${jobId}/cancel`)
        } catch (error) {
            console.error('Error canceling import job:', error)
            throw error
        }
    }

    /**
     * Export data
     */
    static async exportData(entity: string, format: string, filters?: any): Promise<ExportJob> {
        try {
            const response = await apiClient.post('/data/export', { entity, format, filters })
            return (response as any)?.data
        } catch (error) {
            console.error('Error exporting data:', error)
            throw error
        }
    }

    /**
     * Get export jobs
     */
    static async getExportJobs(): Promise<ExportJob[]> {
        try {
            const response = await apiClient.get('/data/export/jobs')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching export jobs:', error)
            throw error
        }
    }

    /**
     * Download export
     */
    static async downloadExport(jobId: string): Promise<Blob> {
        try {
            const response = await apiClient.get(`/data/export/jobs/${jobId}/download`, {
                responseType: 'blob'
            })
            return response as any
        } catch (error) {
            console.error('Error downloading export:', error)
            throw error
        }
    }

    /**
     * Execute bulk operation
     */
    static async executeBulkOperation(operation: string, entity: string, data: any): Promise<BulkOperation> {
        try {
            const response = await apiClient.post('/data/bulk', { operation, entity, data })
            return (response as any)?.data
        } catch (error) {
            console.error('Error executing bulk operation:', error)
            throw error
        }
    }

    /**
     * Get bulk operations
     */
    static async getBulkOperations(): Promise<BulkOperation[]> {
        try {
            const response = await apiClient.get('/data/bulk/operations')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching bulk operations:', error)
            throw error
        }
    }

    /**
     * Validate data
     */
    static async validateData(entity: string, data: any[]): Promise<any> {
        try {
            const response = await apiClient.post('/data/validate', { entity, data })
            return (response as any)?.data
        } catch (error) {
            console.error('Error validating data:', error)
            throw error
        }
    }

    /**
     * Transform data
     */
    static async transformData(transformations: any[], data: any[]): Promise<any[]> {
        try {
            const response = await apiClient.post('/data/transform', { transformations, data })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error transforming data:', error)
            throw error
        }
    }

    /**
     * Archive data
     */
    static async archiveData(entity: string, filters: any): Promise<any> {
        try {
            const response = await apiClient.post('/data/archive', { entity, filters })
            return (response as any)?.data
        } catch (error) {
            console.error('Error archiving data:', error)
            throw error
        }
    }

    /**
     * Get archived data
     */
    static async getArchivedData(entity: string): Promise<any[]> {
        try {
            const response = await apiClient.get('/data/archive', { params: { entity } })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching archived data:', error)
            throw error
        }
    }

    /**
     * Restore archived data
     */
    static async restoreData(archiveId: string): Promise<void> {
        try {
            await apiClient.post(`/data/archive/${archiveId}/restore`)
        } catch (error) {
            console.error('Error restoring data:', error)
            throw error
        }
    }

    /**
     * Clean up data
     */
    static async cleanupData(entity: string, rules: any): Promise<any> {
        try {
            const response = await apiClient.post('/data/cleanup', { entity, rules })
            return (response as any)?.data
        } catch (error) {
            console.error('Error cleaning up data:', error)
            throw error
        }
    }

    /**
     * Get data quality report
     */
    static async getDataQualityReport(entity: string): Promise<any> {
        try {
            const response = await apiClient.get('/data/quality', { params: { entity } })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching data quality report:', error)
            throw error
        }
    }
}

export default DataManagementService
