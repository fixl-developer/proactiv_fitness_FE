import apiClient, { ApiResponse } from '@/lib/apiClient'

// ==================== INTERFACES ====================

export interface MediaFile {
    _id: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    url: string
    signedUrl?: string
    path: string
    provider: 'LOCAL' | 'CLOUDINARY' | 'S3' | 'AZURE'
    metadata?: {
        width?: number
        height?: number
        duration?: number
        format?: string
        [key: string]: any
    }
    uploadedBy: string
    tenantId?: string
    entityType?: string
    entityId?: string
    isPublic: boolean
    expiresAt?: string
    createdAt: string
    updatedAt: string
}

export interface UploadOptions {
    entityType?: string
    entityId?: string
    isPublic?: boolean
    folder?: string
    tags?: string[]
    metadata?: Record<string, any>
}

export interface UploadProgress {
    loaded: number
    total: number
    percentage: number
}

// ==================== MEDIA SERVICE ====================

export class MediaService {
    /**
     * Upload single file
     * Backend: POST /media/upload
     */
    static async uploadFile(
        file: File,
        options?: UploadOptions,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<MediaFile> {
        try {
            const formData = new FormData()
            formData.append('file', file)

            if (options?.entityType) formData.append('entityType', options.entityType)
            if (options?.entityId) formData.append('entityId', options.entityId)
            if (options?.isPublic !== undefined) formData.append('isPublic', String(options.isPublic))
            if (options?.folder) formData.append('folder', options.folder)
            if (options?.tags) formData.append('tags', JSON.stringify(options.tags))
            if (options?.metadata) formData.append('metadata', JSON.stringify(options.metadata))

            const response = await apiClient.post<MediaFile>('/media/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        onProgress({
                            loaded: progressEvent.loaded,
                            total: progressEvent.total,
                            percentage
                        })
                    }
                }
            })

            return response.data
        } catch (error: any) {
            console.error('Upload file failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to upload file')
        }
    }

    /**
     * Upload multiple files
     * Backend: POST /media/upload (multiple calls)
     */
    static async uploadMultipleFiles(
        files: File[],
        options?: UploadOptions,
        onProgress?: (fileIndex: number, progress: UploadProgress) => void
    ): Promise<MediaFile[]> {
        try {
            const uploadPromises = files.map((file, index) =>
                this.uploadFile(file, options, (progress) => {
                    if (onProgress) {
                        onProgress(index, progress)
                    }
                })
            )

            return await Promise.all(uploadPromises)
        } catch (error: any) {
            console.error('Upload multiple files failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to upload files')
        }
    }

    /**
     * Get media file by ID
     * Backend: GET /media/:id
     */
    static async getMediaFile(id: string): Promise<MediaFile> {
        try {
            const response = await apiClient.get<MediaFile>(`/media/${id}`)
            return response.data
        } catch (error: any) {
            console.error('Get media file failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch media file')
        }
    }

    /**
     * Get signed URL for private file
     * Backend: GET /media/signed-url/:id
     */
    static async getSignedUrl(id: string, expiresIn?: number): Promise<string> {
        try {
            const params = expiresIn ? { expiresIn } : undefined
            const response = await apiClient.get<{ signedUrl: string }>(`/media/signed-url/${id}`, { params })
            return response.data.signedUrl
        } catch (error: any) {
            console.error('Get signed URL failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to get signed URL')
        }
    }

    /**
     * Delete media file
     * Backend: DELETE /media/:id
     */
    static async deleteMediaFile(id: string): Promise<void> {
        try {
            await apiClient.delete(`/media/${id}`)
        } catch (error: any) {
            console.error('Delete media file failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to delete media file')
        }
    }

    /**
     * Get media files by entity
     * Backend: GET /media?entityType=xxx&entityId=xxx
     */
    static async getMediaByEntity(entityType: string, entityId: string): Promise<MediaFile[]> {
        try {
            const response = await apiClient.get<MediaFile[]>('/media', {
                params: { entityType, entityId }
            })
            return response.data
        } catch (error: any) {
            console.error('Get media by entity failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch media files')
        }
    }

    /**
     * Update media file metadata
     * Backend: PATCH /media/:id
     */
    static async updateMediaFile(id: string, data: {
        filename?: string
        isPublic?: boolean
        metadata?: Record<string, any>
        tags?: string[]
    }): Promise<MediaFile> {
        try {
            const response = await apiClient.patch<MediaFile>(`/media/${id}`, data)
            return response.data
        } catch (error: any) {
            console.error('Update media file failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to update media file')
        }
    }

    /**
     * Validate file before upload
     */
    static validateFile(file: File, options?: {
        maxSize?: number // in bytes
        allowedTypes?: string[]
    }): { valid: boolean; error?: string } {
        const maxSize = options?.maxSize || 10 * 1024 * 1024 // 10MB default
        const allowedTypes = options?.allowedTypes || []

        // Check file size
        if (file.size > maxSize) {
            return {
                valid: false,
                error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`
            }
        }

        // Check file type
        if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
            }
        }

        return { valid: true }
    }

    /**
     * Get file extension from filename
     */
    static getFileExtension(filename: string): string {
        return filename.split('.').pop()?.toLowerCase() || ''
    }

    /**
     * Check if file is image
     */
    static isImage(file: File | MediaFile): boolean {
        const mimeType = file instanceof File ? file.type : file.mimeType
        return mimeType.startsWith('image/')
    }

    /**
     * Check if file is video
     */
    static isVideo(file: File | MediaFile): boolean {
        const mimeType = file instanceof File ? file.type : file.mimeType
        return mimeType.startsWith('video/')
    }

    /**
     * Check if file is document
     */
    static isDocument(file: File | MediaFile): boolean {
        const mimeType = file instanceof File ? file.type : file.mimeType
        return mimeType.includes('pdf') ||
            mimeType.includes('document') ||
            mimeType.includes('word') ||
            mimeType.includes('excel') ||
            mimeType.includes('powerpoint')
    }

    /**
     * Format file size for display
     */
    static formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes'

        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))

        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }
}
