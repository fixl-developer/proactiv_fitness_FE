import { apiClient } from '@/services/api/client';

export interface Skill {
    skillId: string;
    skillName: string;
    category: string;
    level: string;
    achievedDate: Date;
    verifiedBy: string;
    evidenceUrl?: string;
}

export interface Milestone {
    milestoneId: string;
    title: string;
    description: string;
    achievedDate: Date;
    category: 'skill' | 'attendance' | 'behavior' | 'competition' | 'other';
}

export interface PerformanceBenchmark {
    benchmarkId: string;
    name: string;
    value: number;
    unit: string;
    recordedDate: Date;
    percentile?: number;
}

export interface AthletePassport {
    studentId: string;
    tenantId: string;
    skills: Skill[];
    certifications: string[];
    milestones: Milestone[];
    attendanceHistory: {
        totalSessions: number;
        attendedSessions: number;
        attendanceRate: number;
        lastUpdated: Date;
    };
    performanceBenchmarks: PerformanceBenchmark[];
    behavioralTracking: Array<{
        date: Date;
        rating: number;
        notes?: string;
        recordedBy: string;
    }>;
    healthSafety: {
        medicalFlags: string[];
        injuries: Array<{
            date: Date;
            description: string;
            recoveryDate?: Date;
        }>;
    };
    exportable: boolean;
    lastExportedAt?: Date;
}

class AthletePassportService {
    async getPassport(studentId: string) {
        const response = await apiClient.get(`/athlete-passport/${studentId}`);
        return response;
    }

    async createPassport(studentId: string, tenantId: string) {
        const response = await apiClient.post(`/athlete-passport`, {
            studentId,
            tenantId,
        });
        return response;
    }

    async addSkill(studentId: string, skill: Omit<Skill, 'skillId'>) {
        const response = await apiClient.post(`/athlete-passport/${studentId}/skills`, skill);
        return response;
    }

    async addMilestone(studentId: string, milestone: Omit<Milestone, 'milestoneId'>) {
        const response = await apiClient.post(`/athlete-passport/${studentId}/milestones`, milestone);
        return response;
    }

    async updateAttendance(studentId: string, attended: boolean) {
        const response = await apiClient.put(`/athlete-passport/${studentId}/attendance`, {
            attended,
        });
        return response;
    }

    async addBenchmark(studentId: string, benchmark: Omit<PerformanceBenchmark, 'benchmarkId'>) {
        const response = await apiClient.post(`/athlete-passport/${studentId}/benchmarks`, benchmark);
        return response;
    }

    async addBehavioralTracking(studentId: string, data: {
        rating: number;
        notes?: string;
    }) {
        const response = await apiClient.post(`/athlete-passport/${studentId}/behavior`, data);
        return response;
    }

    async exportPassport(studentId: string) {
        const response = await apiClient.get(`/athlete-passport/${studentId}/export`);
        return response;
    }

    async downloadPassportPDF(studentId: string) {
        const response = await apiClient.get(`/athlete-passport/${studentId}/export/pdf`, {
            responseType: 'blob',
        });
        return response;
    }
}

export default new AthletePassportService();
