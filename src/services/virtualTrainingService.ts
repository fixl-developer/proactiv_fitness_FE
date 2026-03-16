import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.post(`${API_URL}/virtual-training`, data);
        return response.data;
    }

    async getSession(sessionId: string) {
        const response = await axios.get(`${API_URL}/virtual-training/${sessionId}`);
        return response.data;
    }

    async listSessions(filters: {
        tenantId: string;
        locationId?: string;
        instructorId?: string;
        sessionType?: string;
        status?: string;
    }) {
        const response = await axios.get(`${API_URL}/virtual-training`, {
            params: filters,
        });
        return response.data;
    }

    async enrollStudent(sessionId: string, studentId: string) {
        const response = await axios.post(`${API_URL}/virtual-training/${sessionId}/enroll`, {
            studentId,
        });
        return response.data;
    }

    async startSession(sessionId: string) {
        const response = await axios.post(`${API_URL}/virtual-training/${sessionId}/start`);
        return response.data;
    }

    async endSession(sessionId: string) {
        const response = await axios.post(`${API_URL}/virtual-training/${sessionId}/end`);
        return response.data;
    }

    async recordAttendance(sessionId: string, studentId: string, action: 'join' | 'leave') {
        const response = await axios.post(`${API_URL}/virtual-training/${sessionId}/attendance`, {
            studentId,
            action,
        });
        return response.data;
    }

    async addFeedback(sessionId: string, studentId: string, rating: number, comment?: string) {
        const response = await axios.post(`${API_URL}/virtual-training/${sessionId}/feedback`, {
            studentId,
            rating,
            comment,
        });
        return response.data;
    }

    async getRecording(sessionId: string) {
        const response = await axios.get(`${API_URL}/virtual-training/${sessionId}/recording`);
        return response.data;
    }

    async incrementRecordingViews(sessionId: string) {
        const response = await axios.post(`${API_URL}/virtual-training/${sessionId}/recording/view`);
        return response.data;
    }
}

export default new VirtualTrainingService();
