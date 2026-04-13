import { apiClient } from '@/services/api/client';

export interface VirtualSession {
    sessionId?: string;
    tenantId: string;
    locationId?: string;
    title: string;
    description: string;
    sessionType: 'live' | 'on-demand' | 'hybrid';
    instructorId: string;
    scheduledStartTime?: Date;
    scheduledEndTime?: Date;
    streamUrl?: string;
    recordingUrl?: string;
    maxParticipants: number;
    enrolledStudents?: string[];
    status?: 'scheduled' | 'live' | 'completed' | 'cancelled';
    interactionFeatures?: {
        chat: boolean;
        qa: boolean;
        polls: boolean;
        screenShare: boolean;
    };
    recording?: {
        enabled: boolean;
        url?: string;
        duration?: number;
        views: number;
    };
}

class VirtualTrainingService {
    async createSession(data: VirtualSession) {
        const response = await apiClient.post(`/virtual-training`, data);
        return response;
    }

    async getSession(sessionId: string) {
        const response = await apiClient.get(`/virtual-training/${sessionId}`);
        return response;
    }

    async listSessions(filters: {
        tenantId: string;
        locationId?: string;
        instructorId?: string;
        sessionType?: string;
        status?: string;
    }) {
        const response = await apiClient.get(`/virtual-training`, {
            params: filters,
        });
        return response;
    }

    async enrollStudent(sessionId: string, studentId: string) {
        const response = await apiClient.post(`/virtual-training/${sessionId}/enroll`, {
            studentId,
        });
        return response;
    }

    async startSession(sessionId: string) {
        const response = await apiClient.post(`/virtual-training/${sessionId}/start`);
        return response;
    }

    async endSession(sessionId: string) {
        const response = await apiClient.post(`/virtual-training/${sessionId}/end`);
        return response;
    }

    async recordAttendance(sessionId: string, studentId: string, action: 'join' | 'leave') {
        const response = await apiClient.post(`/virtual-training/${sessionId}/attendance`, {
            studentId,
            action,
        });
        return response;
    }

    async addFeedback(sessionId: string, studentId: string, rating: number, comment?: string) {
        const response = await apiClient.post(`/virtual-training/${sessionId}/feedback`, {
            studentId,
            rating,
            comment,
        });
        return response;
    }

    async getRecording(sessionId: string) {
        const response = await apiClient.get(`/virtual-training/${sessionId}/recording`);
        return response;
    }

    async incrementRecordingViews(sessionId: string) {
        const response = await apiClient.post(`/virtual-training/${sessionId}/recording/view`);
        return response;
    }
}

export default new VirtualTrainingService();
