import { apiClient } from '@/services/api/client';

export interface ParentROIReport {
    studentId: string;
    parentId: string;
    tenantId: string;
    reportPeriod: {
        startDate: Date;
        endDate: Date;
        type: 'monthly' | 'quarterly' | 'annual';
    };
    financialMetrics: {
        totalSpent: number;
        sessionsAttended: number;
        costPerSession: number;
        utilizationRate: number;
    };
    attendanceMetrics: {
        totalSessions: number;
        attendedSessions: number;
        missedSessions: number;
        attendanceRate: number;
        consistencyScore: number;
    };
    skillDevelopment: {
        skillsAchieved: number;
        certificationsEarned: number;
        levelProgression: number;
        improvementRate: number;
    };
    engagementMetrics: {
        participationScore: number;
        behaviorRating: number;
        coachFeedbackScore: number;
        peerInteractionScore: number;
    };
    healthFitness: {
        strengthImprovement: number;
        flexibilityImprovement: number;
        enduranceImprovement: number;
        coordinationImprovement: number;
    };
    comparativeAnalytics: {
        vsAgeGroup: number;
        vsLevel: number;
        vsLocation: number;
    };
    overallROIScore: number;
    generatedAt?: Date;
    emailedAt?: Date;
}

class ParentROIService {
    async generateReport(data: Omit<ParentROIReport, 'overallROIScore' | 'generatedAt'>) {
        const response = await apiClient.post(`/parent-roi`, data);
        return response;
    }

    async getReport(studentId: string, reportType: 'monthly' | 'quarterly' | 'annual') {
        const response = await apiClient.get(`/parent-roi/${studentId}`, {
            params: { type: reportType },
        });
        return response;
    }

    async listReports(studentId: string) {
        const response = await apiClient.get(`/parent-roi/${studentId}/all`);
        return response;
    }

    async emailReport(reportId: string, parentEmail: string) {
        const response = await apiClient.post(`/parent-roi/${reportId}/email`, {
            email: parentEmail,
        });
        return response;
    }

    async downloadReportPDF(reportId: string) {
        const response = await apiClient.get(`/parent-roi/${reportId}/download`, {
            responseType: 'blob',
        });
        return response;
    }

    async getROITrends(studentId: string, months: number = 6) {
        const response = await apiClient.get(`/parent-roi/${studentId}/trends`, {
            params: { months },
        });
        return response;
    }
}

export default new ParentROIService();
