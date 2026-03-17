import { apiClient } from '../api/client'

export interface FeatureFlag {
    id: string
    name: string
    key: string
    description: string
    enabled: boolean
    rolloutPercentage: number
    targetUsers: string[]
    targetRoles: string[]
    createdAt: string
    updatedAt: string
}

export interface ABTest {
    id: string
    name: string
    description: string
    variants: ABTestVariant[]
    status: 'draft' | 'running' | 'completed' | 'paused'
    startDate: string
    endDate?: string
    metrics: any
}

export interface ABTestVariant {
    id: string
    name: string
    percentage: number
    config: any
}

export class FeatureFlagsService {
    /**
     * Get all feature flags
     */
    static async getFeatureFlags(): Promise<FeatureFlag[]> {
        try {
            const response = await apiClient.get('/feature-flags')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching feature flags:', error)
            throw error
        }
    }

    /**
     * Get feature flag by ID
     */
    static async getFeatureFlagById(flagId: string): Promise<FeatureFlag> {
        try {
            const response = await apiClient.get(`/feature-flags/${flagId}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching feature flag:', error)
            throw error
        }
    }

    /**
     * Create feature flag
     */
    static async createFeatureFlag(data: Partial<FeatureFlag>): Promise<FeatureFlag> {
        try {
            const response = await apiClient.post('/feature-flags', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating feature flag:', error)
            throw error
        }
    }

    /**
     * Update feature flag
     */
    static async updateFeatureFlag(flagId: string, data: Partial<FeatureFlag>): Promise<FeatureFlag> {
        try {
            const response = await apiClient.patch(`/feature-flags/${flagId}`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating feature flag:', error)
            throw error
        }
    }

    /**
     * Delete feature flag
     */
    static async deleteFeatureFlag(flagId: string): Promise<void> {
        try {
            await apiClient.delete(`/feature-flags/${flagId}`)
        } catch (error) {
            console.error('Error deleting feature flag:', error)
            throw error
        }
    }

    /**
     * Toggle feature flag
     */
    static async toggleFeatureFlag(flagId: string, enabled: boolean): Promise<FeatureFlag> {
        try {
            const response = await apiClient.patch(`/feature-flags/${flagId}/toggle`, { enabled })
            return (response as any)?.data
        } catch (error) {
            console.error('Error toggling feature flag:', error)
            throw error
        }
    }

    /**
     * Check if feature is enabled for user
     */
    static async isFeatureEnabled(flagKey: string, userId: string): Promise<boolean> {
        try {
            const response = await apiClient.get(`/feature-flags/${flagKey}/check`, { params: { userId } })
            return (response as any)?.data?.enabled || false
        } catch (error) {
            console.error('Error checking feature flag:', error)
            return false
        }
    }

    /**
     * Get A/B tests
     */
    static async getABTests(): Promise<ABTest[]> {
        try {
            const response = await apiClient.get('/feature-flags/ab-tests')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching A/B tests:', error)
            throw error
        }
    }

    /**
     * Create A/B test
     */
    static async createABTest(data: Partial<ABTest>): Promise<ABTest> {
        try {
            const response = await apiClient.post('/feature-flags/ab-tests', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating A/B test:', error)
            throw error
        }
    }

    /**
     * Update A/B test
     */
    static async updateABTest(testId: string, data: Partial<ABTest>): Promise<ABTest> {
        try {
            const response = await apiClient.patch(`/feature-flags/ab-tests/${testId}`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating A/B test:', error)
            throw error
        }
    }

    /**
     * Get feature flag analytics
     */
    static async getFeatureFlagAnalytics(flagId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/feature-flags/${flagId}/analytics`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching feature flag analytics:', error)
            throw error
        }
    }

    /**
     * Get rollout history
     */
    static async getRolloutHistory(flagId: string): Promise<any[]> {
        try {
            const response = await apiClient.get(`/feature-flags/${flagId}/history`)
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching rollout history:', error)
            throw error
        }
    }
}

export default FeatureFlagsService
