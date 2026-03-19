import { apiClient } from '../api/client';

export interface ProgressData {
    userId: string;
    overallProgress: number;
    skillsProgress: {
        skillName: string;
        level: number;
        progress: number;
    }[];
    milestones: {
        id: string;
        title: string;
        description: string;
        achieved: boolean;
        achievedAt?: string;
    }[];
    timeline: {
        date: string;
        event: string;
        description: string;
    }[];
}

export interface Milestone {
    id: string;
    userId: string;
    title: string;
    description: string;
    achieved: boolean;
    achievedAt?: string;
    createdAt: string;
}

class UserProgressService {
    private baseUrl = '/user/progress';

    async getProgress(userId?: string): Promise<ProgressData> {
        try {
            const url = userId ? `${this.baseUrl}/${userId}` : this.baseUrl;
            const response = await apiClient.get<any>(url);
            return response.data;
        } catch {
            throw new Error('Progress data not available');
        }
    }

    async updateProgress(data: { skillName: string; progress: number }): Promise<ProgressData> {
        const response = await apiClient.put<any>(this.baseUrl, data);
        return response.data;
    }

    async getMilestones(userId?: string): Promise<Milestone[]> {
        try {
            const url = userId ? `${this.baseUrl}/${userId}/milestones` : `${this.baseUrl}/milestones`;
            const response = await apiClient.get<any>(url);
            return response.data || [];
        } catch {
            return [];
        }
    }

    async addMilestone(data: { title: string; description: string }): Promise<Milestone> {
        const response = await apiClient.post<any>(`${this.baseUrl}/milestones`, data);
        return response.data;
    }

    async achieveMilestone(milestoneId: string): Promise<Milestone> {
        const response = await apiClient.patch<any>(`${this.baseUrl}/milestones/${milestoneId}/achieve`);
        return response.data;
    }

    async getTimeline(userId?: string): Promise<any[]> {
        try {
            const url = userId ? `${this.baseUrl}/${userId}/timeline` : `${this.baseUrl}/timeline`;
            const response = await apiClient.get<any>(url);
            return response.data || [];
        } catch {
            return [];
        }
    }

    async getSkills(userId?: string): Promise<any[]> {
        try {
            const url = userId ? `${this.baseUrl}/${userId}/skills` : `${this.baseUrl}/skills`;
            const response = await apiClient.get<any>(url);
            return response.data || [];
        } catch {
            return [];
        }
    }
}

export default UserProgressService;
