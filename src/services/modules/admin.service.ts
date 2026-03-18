import apiClient from '../api/client'

interface DashboardMetrics {
    totalLocations: number
    totalStudents: number
    totalRevenue: number
    staffMembers: number
    activeClasses: number
    revenueGrowth: number
    studentGrowth: number
    occupancyRate: number
    staffUtilization: number
    customerSatisfaction: number
}

interface RecentActivity {
    type: string
    title: string
    description: string
    time: string
    userId?: string
}

interface Alert {
    type: 'warning' | 'info' | 'success' | 'error'
    title: string
    description: string
    priority: 'low' | 'medium' | 'high'
    createdAt: string
}

class AdminService {
    /**
     * Get admin dashboard metrics
     */
    async getDashboardMetrics(): Promise<DashboardMetrics> {
        try {
            const response = await apiClient.get('/admin/dashboard/metrics')
            return response.data
        } catch (error) {
            console.error('Error fetching dashboard metrics:', error)
            throw error
        }
    }

    /**
     * Get recent activities
     */
    async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
        try {
            const response = await apiClient.get('/admin/dashboard/activities', {
                params: { limit }
            })
            return response.data
        } catch (error) {
            console.error('Error fetching recent activities:', error)
            throw error
        }
    }

    /**
     * Get alerts and notifications
     */
    async getAlerts(status: 'active' | 'resolved' | 'all' = 'active'): Promise<Alert[]> {
        try {
            const response = await apiClient.get('/admin/dashboard/alerts', {
                params: { status }
            })
            return response.data
        } catch (error) {
            console.error('Error fetching alerts:', error)
            throw error
        }
    }

    /**
     * Get revenue trend data
     */
    async getRevenueTrend(period: '7d' | '30d' | '90d' = '30d') {
        try {
            const response = await apiClient.get('/admin/dashboard/revenue-trend', {
                params: { period }
            })
            return response.data
        } catch (error) {
            console.error('Error fetching revenue trend:', error)
            throw error
        }
    }

    /**
     * Get student growth data
     */
    async getStudentGrowth(period: '7d' | '30d' | '90d' = '30d') {
        try {
            const response = await apiClient.get('/admin/dashboard/student-growth', {
                params: { period }
            })
            return response.data
        } catch (error) {
            console.error('Error fetching student growth:', error)
            throw error
        }
    }

    /**
     * Get business metrics
     */
    async getBusinessMetrics() {
        try {
            const response = await apiClient.get('/admin/dashboard/business-metrics')
            return response.data
        } catch (error) {
            console.error('Error fetching business metrics:', error)
            throw error
        }
    }
}

export default new AdminService()
