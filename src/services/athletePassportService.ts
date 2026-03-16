import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.get(`${API_URL}/athlete-passport/${studentId}`);
        return response.data;
    }

    async createPassport(studentId: string, tenantId: string) {
        const response = await axios.post(`${API_URL}/athlete-passport`, {
            studentId,
            tenantId,
        });
        return response.data;
    }

    async addSkill(studentId: string, skill: Omit<Skill, 'skillId'>) {
        const response = await axios.post(`${API_URL}/athlete-passport/${studentId}/skills`, skill);
        return response.data;
    }

    async addMilestone(studentId: string, milestone: Omit<Milestone, 'milestoneId'>) {
        const response = await axios.post(`${API_URL}/athlete-passport/${studentId}/milestones`, milestone);
        return response.data;
    }

    async updateAttendance(studentId: string, attended: boolean) {
        const response = await axios.put(`${API_URL}/athlete-passport/${studentId}/attendance`, {
            attended,
        });
        return response.data;
    }

    async addBenchmark(studentId: string, benchmark: Omit<PerformanceBenchmark, 'benchmarkId'>) {
        const response = await axios.post(`${API_URL}/athlete-passport/${studentId}/benchmarks`, benchmark);
        return response.data;
    }

    async addBehavioralTracking(studentId: string, data: {
        rating: number;
        notes?: string;
    }) {
        const response = await axios.post(`${API_URL}/athlete-passport/${studentId}/behavior`, data);
        return response.data;
    }

    async exportPassport(studentId: string) {
        const response = await axios.get(`${API_URL}/athlete-passport/${studentId}/export`);
        return response.data;
    }

    async downloadPassportPDF(studentId: string) {
        const response = await axios.get(`${API_URL}/athlete-passport/${studentId}/export/pdf`, {
            responseType: 'blob',
        });
        return response.data;
    }
}

export default new AthletePassportService();
