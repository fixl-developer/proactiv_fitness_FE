import { apiClient } from '../api/client'

export interface PerformanceMetrics {
    totalRevenue: number
    totalStudents: number
    totalPrograms: number
    averageRating: number
    growthRate: number
    conversionRate: number
    retentionRate: number
    customerSatisfaction: number
}

export interface PerformanceTrend {
    date: string
    revenue: number
    students: number
    bookings: number
    rating: number
}

export interface StudentProgress {
    studentId: string
    studentName: string
    programId: string
    programName: string
    progress: number
    status: 'active' | 'completed' | 'dropped'
    startDate: string
    completionDate?: string
    score?: number
}

export interface ClassPerformance {
    classId: string
    className: string
    enrolledStudents: number
    completedStudents: number
    averageScore: number
    rating: number
    revenue: number
    status: 'active' | 'completed' | 'cancelled'
}

export interface RevenueAnalytics {
    totalRevenue: number
    averageRevenuePerStudent: number
    averageRevenuePerProgram: number
    revenueByProgram: { program: string; revenue: number }[]
    revenueByMonth: { month: string; revenue: number }[]
    revenueGrowth: number
}

export interface GrowthAnalytics {
    studentGrowth: number
    programGrowth: number
    revenueGrowth: number
    bookingGrowth: number
    trends: { metric: string; growth: number }[]
}

export interface ComplianceMetrics {
    complianceScore: number
    documentsSubmitted: number
    documentsExpiring: number
    auditsPassed: number
    auditsFailed: number
    status: 'compliant' | 'non-compliant' | 'pending'
}

export interface QualityMetrics {
    qualityScore: number
    studentSatisfaction: number
    instructorRating: number
    completionRate: number
    dropoutRate: number
    improvementAreas: string[]
}

export interface CustomerSatisfaction {
    overallScore: number
    serviceQuality: number
    instructorQuality: number
    valueForMoney: number
    recommendationScore: number
    reviews: { rating: number; comment: string; date: string }[]
}

export interface MarketAnalytics {
    marketShare: number
    competitorCount: number
    marketGrowth: number
    opportunities: string[]
    threats: string[]
}

export interface CompetitiveAnalysis {
    partnerId: string
    partnerName: string
    marketPosition: number
    competitiveAdvantages: string[]
    weaknesses: string[]
    recommendations: string[]
}

export interface ForecastAnalytics {
    nextMonthRevenue: number
    nextQuarterRevenue: number
    nextYearRevenue: number
    confidence: number
    assumptions: string[]
}

export interface BenchmarkAnalytics {
    partnerMetric: number
    industryAverage: number
    topPerformer: number
    percentile: number
    comparison: string
}

export interface GoalProgress {
    goalId: string
    goalName: string
    targetValue: number
    currentValue: number
    progress: number
    status: 'on-track' | 'at-risk' | 'off-track'
    dueDate: string
}

export interface OpportunityAnalysis {
    opportunityId: string
    title: string
    description: string
    potentialRevenue: number
    difficulty: 'easy' | 'medium' | 'hard'
    timeframe: string
    recommendations: string[]
}

export class PartnerAnalyticsService {
    /**
     * Get performance metrics
     */
    static async getPerformanceMetrics(partnerId: string): Promise<PerformanceMetrics> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/analytics/performance`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching performance metrics:', error)
            throw error
        }
    }

    /**
     * Get performance trends
     */
    static async getPerformanceTrends(partnerId: string, filters?: { startDate?: string; endDate?: string }): Promise<PerformanceTrend[]> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/analytics/trends`, { params: filters })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching performance trends:', error)
            throw error
        }
    }

    /**
     * Get student progress
     */
    static async getStudentProgress(partnerId: string, filters?: { page?: number; limit?: number }): Promise<{ students: StudentProgress[]; total: number }> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/analytics/student-progress`, { params: filters })
            return (response as any)?.data || { students: [], total: 0 }
        } catch (error) {
            console.error('Error fetching student progress:', error)
            throw error
        }
    }

    /**
     * Get class performance
     */
    static async getClassPerformance(partnerId: string, filters?: { page?: number; limit?: number }): Promise<{ classes: ClassPerformance[]; total: number }> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/analytics/class-performance`, { params: filters })
            return (response as any)?.data || { classes: [], total: 0 }
        } catch (error) {
            console.error('Error fetching class performance:', error)
            throw error
        }
    }

    /**
     * Get revenue analytics
     */
    static async getRevenueAnalytics(partnerId: string, filters?: { startDate?: string; endDate?: string }): Promise<RevenueAnalytics> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/analytics/revenue`, { params: filters })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching revenue analytics:', error)
            throw error
        }
    }

    /**
     * Get growth analytics
     */
    static async getGrowthAnalytics(partnerId: string, period?: string): Promise<GrowthAnalytics> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/analytics/growth`, { params: { period } })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching growth analytics:', error)
            throw error
        }
    }

    /**
     * Get compliance metrics
     */
    static async getComplianceMetrics(partnerId: string): Promise<ComplianceMetrics> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/analytics/compliance`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching compliance metrics:', error)
            throw error
        }
    }

    /**
     * Get quality metrics
     */
    static async getQualityMetrics(partnerId: string): Promise<QualityMetrics> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/analytics/quality`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching quality metrics:', error)
            throw error
        }
    }

    /**
     * Get customer satisfaction
     */
    static async getCustomerSatisfaction(partnerId: string): Promise<CustomerSatisfaction> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/analytics/satisfaction`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching customer satisfaction:', error)
            throw error
        }
    }

    /**
     * Get market analytics
     */
    static async getMarketAnalytics(partnerId: string): Promise<MarketAnalytics> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/analytics/market`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching market analytics:', error)
            throw error
        }
    }

    /**
     * Get competitive analysis
     */
    static async getCompetitiveAnalysis(partnerId: string): Promise<CompetitiveAnalysis> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/analytics/competitive`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching competitive analysis:', error)
            throw error
        }
    }

    /**
     * Get forecast analytics
     */
    static async getForecastAnalytics(partnerId: string): Promise<ForecastAnalytics> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/analytics/forecast`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching forecast analytics:', error)
            throw error
        }
    }

    /**
     * Get benchmark analytics
     */
    static async getBenchmarkAnalytics(partnerId: string, metric: string): Promise<BenchmarkAnalytics> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/analytics/benchmark`, { params: { metric } })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching benchmark analytics:', error)
            throw error
        }
    }

    /**
     * Get goal progress
     */
    static async getGoalProgress(partnerId: string, filters?: { page?: number; limit?: number }): Promise<{ goals: GoalProgress[]; total: number }> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/analytics/goals`, { params: filters })
            return (response as any)?.data || { goals: [], total: 0 }
        } catch (error) {
            console.error('Error fetching goal progress:', error)
            throw error
        }
    }

    /**
     * Get opportunity analysis
     */
    static async getOpportunityAnalysis(partnerId: string, filters?: { page?: number; limit?: number }): Promise<{ opportunities: OpportunityAnalysis[]; total: number }> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/analytics/opportunities`, { params: filters })
            return (response as any)?.data || { opportunities: [], total: 0 }
        } catch (error) {
            console.error('Error fetching opportunity analysis:', error)
            throw error
        }
    }

    /**
     * Export analytics report
     */
    static async exportAnalyticsReport(partnerId: string, format: 'pdf' | 'excel' | 'csv'): Promise<Blob> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/analytics/export`, { params: { format } })
            return response as any
        } catch (error) {
            console.error('Error exporting analytics report:', error)
            throw error
        }
    }
}

export default PartnerAnalyticsService
