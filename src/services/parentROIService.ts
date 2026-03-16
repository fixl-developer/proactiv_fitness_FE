import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.post(`${API_URL}/parent-roi`, data);
        return response.data;
    }

    async getReport(studentId: string, reportType: 'monthly' | 'quarterly' | 'annual') {
        const response = await axios.get(`${API_URL}/parent-roi/${studentId}`, {
            params: { type: reportType },
        });
        return response.data;
    }

    async listReports(studentId: string) {
        const response = await axios.get(`${API_URL}/parent-roi/${studentId}/all`);
        return response.data;
    }

    async emailReport(reportId: string, parentEmail: string) {
        const response = await axios.post(`${API_URL}/parent-roi/${reportId}/email`, {
            email: parentEmail,
        });
        return response.data;
    }

    async downloadReportPDF(reportId: string) {
        const response = await axios.get(`${API_URL}/parent-roi/${reportId}/download`, {
            responseType: 'blob',
        });
        return response.data;
    }

    async getROITrends(studentId: string, months: number = 6) {
        const response = await axios.get(`${API_URL}/parent-roi/${studentId}/trends`, {
            params: { months },
        });
        return response.data;
    }
}

export default new ParentROIService();
