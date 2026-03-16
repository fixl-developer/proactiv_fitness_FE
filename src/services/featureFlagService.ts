import apiClient, { ApiResponse } from '@/lib/apiClient'

// ==================== INTERFACES ====================

export interface FeatureFlag {
    _id: string
    key: string
    name: string
    description?: string
    isEnabled: boolean
    tenantId?: string
    franchiseId?: string
    locationId?: string
    rolloutPercentage: number
    conditions?: {
        userRoles?: string[]
        userIds?: string[]
        startDate?: string
        endDate?: string
    }
    metadata?: Record<string, any>
    createdBy: string
    updatedBy?: string
    createdAt: string
    updatedAt: string
}

export interface CreateFeatureFlagRequest {
    key: string
    name: string
    description?: string
    isEnabled: boolean
    tenantId?: string
    franchiseId?: string
    locationId?: string
    rolloutPercentage?: number
    conditions?: {
        userRoles?: string[]
        userIds?: string[]
        startDate?: string
        endDate?: string
    }
    metadata?: Record<string, any>
}

export interface UpdateFeatureFlagRequest {
    name?: string
    description?: string
    isEnabled?: boolean
    rolloutPercentage?: number
    conditions?: {
        userRoles?: string[]
        userIds?: string[]
        startDate?: string
        endDate?: string
    }
    metadata?: Record<string, any>
}

export interface FeatureFlagCheckResponse {
    key: string
    isEnabled: boolean
    reason?: string
}

// ==================== FEATURE FLAG SERVICE ====================

export class FeatureFlagService {
    /**
     * Get all feature flags
     * Backend: GET /feature-flags
     */
    static async getFeatureFlags(params?: {
        tenantId?: string
        franchiseId?: string
        locationId?: string
        isEnabled?: boolean
        search?: string
    }): Promise<FeatureFlag[]> {
        try {
            const response = await apiClient.get<FeatureFlag[]>('/feature-flags', { params })
            return response.data
        } catch (error: any) {
            console.error('Get feature flags failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch feature flags')
        }
    }

    /**
     * Get feature flag by key
     * Backend: GET /feature-flags/:key
     */
    static async getFeatureFlagByKey(key: string): Promise<FeatureFlag> {
        try {
            const response = await apiClient.get<FeatureFlag>(`/feature-flags/${key}`)
            return response.data
        } catch (error: any) {
            console.error('Get feature flag failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch feature flag')
        }
    }

    /**
     * Create feature flag (Admin only)
     * Backend: POST /feature-flags
     */
    static async createFeatureFlag(data: CreateFeatureFlagRequest): Promise<FeatureFlag> {
        try {
            const response = await apiClient.post<FeatureFlag>('/feature-flags', data)
            return response.data
        } catch (error: any) {
            console.error('Create feature flag failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to create feature flag')
        }
    }

    /**
     * Update feature flag (Admin only)
     * Backend: PUT /feature-flags/:key
     */
    static async updateFeatureFlag(key: string, data: UpdateFeatureFlagRequest): Promise<FeatureFlag> {
        try {
            const response = await apiClient.put<FeatureFlag>(`/feature-flags/${key}`, data)
            return response.data
        } catch (error: any) {
            console.error('Update feature flag failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to update feature flag')
        }
    }

    /**
     * Delete feature flag (Admin only)
     * Backend: DELETE /feature-flags/:key
     */
    static async deleteFeatureFlag(key: string): Promise<void> {
        try {
            await apiClient.delete(`/feature-flags/${key}`)
        } catch (error: any) {
            console.error('Delete feature flag failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to delete feature flag')
        }
    }

    /**
     * Check if feature is enabled for current user
     * Backend: GET /feature-flags/check/:key
     */
    static async checkFeatureFlag(key: string): Promise<boolean> {
        try {
            const response = await apiClient.get<FeatureFlagCheckResponse>(`/feature-flags/check/${key}`)
            return response.data.isEnabled
        } catch (error: any) {
            console.error('Check feature flag failed:', error)
            // Return false by default if check fails
            return false
        }
    }

    /**
     * Check multiple feature flags at once
     */
    static async checkMultipleFeatureFlags(keys: string[]): Promise<Record<string, boolean>> {
        try {
            const results: Record<string, boolean> = {}

            // Check all flags in parallel
            const promises = keys.map(key =>
                this.checkFeatureFlag(key).then(isEnabled => ({ key, isEnabled }))
            )

            const responses = await Promise.all(promises)

            responses.forEach(({ key, isEnabled }) => {
                results[key] = isEnabled
            })

            return results
        } catch (error: any) {
            console.error('Check multiple feature flags failed:', error)
            // Return all false by default
            return keys.reduce((acc, key) => ({ ...acc, [key]: false }), {})
        }
    }

    /**
     * Enable feature flag (Admin only)
     */
    static async enableFeatureFlag(key: string): Promise<FeatureFlag> {
        return this.updateFeatureFlag(key, { isEnabled: true })
    }

    /**
     * Disable feature flag (Admin only)
     */
    static async disableFeatureFlag(key: string): Promise<FeatureFlag> {
        return this.updateFeatureFlag(key, { isEnabled: false })
    }

    /**
     * Toggle feature flag (Admin only)
     */
    static async toggleFeatureFlag(key: string): Promise<FeatureFlag> {
        try {
            const flag = await this.getFeatureFlagByKey(key)
            return this.updateFeatureFlag(key, { isEnabled: !flag.isEnabled })
        } catch (error: any) {
            console.error('Toggle feature flag failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to toggle feature flag')
        }
    }
}
