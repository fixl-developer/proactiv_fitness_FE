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
        const url = userId ? `${this.baseUrl}/${userId}` : this.baseUrl;
        const response = await apiClient.get(url);
        return response.data;
    }

    async updateProgress(data: { skillName: string; progress: number }): Promise<ProgressData> {
        const response = await apiClient.put(this.baseUrl, data);
        return response.data;
    }

    async getMilestones(userId?: string): Promise<Milestone[]> {
        const url = userId ? `${this.baseUrl}/${userId}/milestones` : `${this.baseUrl}/milestones`;
        const response = await apiClient.get(url);
        return response.data;
    }

    async addMilestone(data: { title: string; description: string }): Promise<Milestone> {
        const response = await apiClient.post(`${this.baseUrl}/milestones`, data);
        return response.data;
    }

    async achieveMilestone(milestoneId: string): Promise<Milestone> {
        const response = await apiClient.patch(`${this.baseUrl}/milestones/${milestoneId}/achieve`);
        return response.data;
    }

    async getTimeline(userId?: string): Promise<any[]> {
        const url = userId ? `${this.baseUrl}/${userId}/timeline` : `${this.baseUrl}/timeline`;
        const response = await apiClient.get(url);
        return response.data;
    }

    async getSkills(userId?: string): Promise<any[]> {
        const url = userId ? `${this.baseUrl}/${userId}/skills` : `${this.baseUrl}/skills`;
        const response = await apiClient.get(url);
        return response.data;
    }
}

export default UserProgressService;
