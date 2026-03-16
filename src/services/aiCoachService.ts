import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface AICoachSession {
    sessionId?: string;
    studentId: string;
    coachId: string;
    tenantId: string;
    sessionType: 'form-correction' | 'posture-analysis' | 'workout-suggestion' | 'injury-prevention' | 'progress-prediction';
    videoUrl?: string;
    analysisResults?: {
        formScore: number;
        postureScore: number;
        recommendations: string[];
        corrections: Array<{
            timestamp: number;
            bodyPart: string;
            issue: string;
            correction: string;
            severity: 'low' | 'medium' | 'high';
        }>;
        injuryRisks: Array<{
            bodyPart: string;
            riskLevel: number;
            preventionTips: string[];
        }>;
    };
    aiModel?: string;
    confidence?: number;
    status?: 'processing' | 'completed' | 'failed';
}

export interface WorkoutSuggestion {
    studentId: string;
    tenantId: string;
    currentLevel: string;
    goals: string[];
    personalizationFactors: {
        age: number;
        skillLevel: string;
        injuries?: string[];
        preferences?: string[];
    };
}

class AICoachService {
    async analyzeForm(data: {
        studentId: string;
        tenantId: string;
        videoUrl: string;
        sessionType: string;
    }) {
        const response = await axios.post(`${API_URL}/ai-coach-assistant/analyze`, data);
        return response.data;
    }

    async getSession(sessionId: string) {
        const response = await axios.get(`${API_URL}/ai-coach-assistant/sessions/${sessionId}`);
        return response.data;
    }

    async listSessions(filters: {
        studentId?: string;
        coachId?: string;
        tenantId: string;
        sessionType?: string;
    }) {
        const response = await axios.get(`${API_URL}/ai-coach-assistant/sessions`, {
            params: filters,
        });
        return response.data;
    }

    async generateWorkoutSuggestion(data: WorkoutSuggestion) {
        const response = await axios.post(`${API_URL}/ai-coach-assistant/workout-suggestions`, data);
        return response.data;
    }

    async predictProgress(studentId: string, tenantId: string) {
        const response = await axios.get(`${API_URL}/ai-coach-assistant/predict-progress`, {
            params: { studentId, tenantId },
        });
        return response.data;
    }

    async submitFeedback(sessionId: string, feedback: {
        helpful: boolean;
        comments?: string;
        rating?: number;
    }) {
        const response = await axios.post(`${API_URL}/ai-coach-assistant/sessions/${sessionId}/feedback`, feedback);
        return response.data;
    }

    async getInjuryPrevention(studentId: string) {
        const response = await axios.get(`${API_URL}/ai-coach-assistant/injury-prevention/${studentId}`);
        return response.data;
    }
}

export default new AICoachService();
