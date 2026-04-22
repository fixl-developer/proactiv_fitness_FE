import { apiClient } from '@/services/api/client'

const downloadsService = {
    async getDownloads(): Promise<any[]> {
        try {
            const response = await apiClient.get('/downloads')
            return response.data?.data || []
        } catch (error) {
            console.error('Failed to fetch downloads:', error)
            return []
        }
    },

    async downloadFile(id: string): Promise<void> {
        try {
            const response = await apiClient.get(`/downloads/${id}/download`, {
                responseType: 'blob'
            })

            // Create a blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `file-${id}`)
            document.body.appendChild(link)
            link.click()
            link.parentNode?.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Failed to download file:', error)
            throw error
        }
    },

    async getDownloadById(id: string): Promise<any> {
        try {
            const response = await apiClient.get(`/downloads/${id}`)
            return response.data?.data || {}
        } catch (error) {
            console.error('Failed to fetch download:', error)
            return {}
        }
    },

    async deleteDownload(id: string): Promise<void> {
        try {
            await apiClient.delete(`/downloads/${id}`)
        } catch (error) {
            console.error('Failed to delete download:', error)
            throw error
        }
    },

    async getCertificates(): Promise<any[]> {
        try {
            const response = await apiClient.get('/downloads/certificates')
            return response.data?.data || []
        } catch (error) {
            console.error('Failed to fetch certificates:', error)
            return []
        }
    },

    async getReports(): Promise<any[]> {
        try {
            const response = await apiClient.get('/downloads/reports')
            return response.data?.data || []
        } catch (error) {
            console.error('Failed to fetch reports:', error)
            return []
        }
    },

    async getMaterials(): Promise<any[]> {
        try {
            const response = await apiClient.get('/downloads/materials')
            return response.data?.data || []
        } catch (error) {
            console.error('Failed to fetch materials:', error)
            return []
        }
    },

    async shareDownload(id: string): Promise<any> {
        try {
            const response = await apiClient.post(`/downloads/${id}/share`)
            return response.data?.data || {}
        } catch (error) {
            console.error('Failed to share download:', error)
            throw error
        }
    }
}

export default downloadsService
