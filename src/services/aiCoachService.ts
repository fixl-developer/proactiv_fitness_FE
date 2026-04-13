import { apiClient } from '@/services/api/client';

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
    // ─── AI Coach Assistant Endpoints ───────────────────────────

    async analyzeForm(data: {
        studentId: string;
        tenantId: string;
        videoUrl: string;
        sessionType: string;
    }) {
        return apiClient.post<any>('/ai-coach-assistant/analyze-form', data);
    }

    async getSession(sessionId: string) {
        return apiClient.get<any>(`/ai-coach-assistant/sessions/${sessionId}`);
    }

    async listSessions(filters: {
        studentId?: string;
        coachId?: string;
        tenantId: string;
        sessionType?: string;
    }) {
        return apiClient.get<any>('/ai-coach-assistant/sessions', { params: filters });
    }

    async generateWorkoutSuggestion(data: WorkoutSuggestion) {
        return apiClient.post<any>('/ai-coach-assistant/workout-suggestions', data);
    }

    async predictProgress(studentId: string, tenantId: string) {
        return apiClient.get<any>('/ai-coach-assistant/predict-progress', {
            params: { studentId, tenantId }
        });
    }

    async submitFeedback(sessionId: string, feedback: {
        helpful: boolean;
        comments?: string;
        rating?: number;
    }) {
        return apiClient.post<any>(`/ai-coach-assistant/sessions/${sessionId}/feedback`, feedback);
    }

    async getInjuryPrevention(studentId: string) {
        return apiClient.get<any>(`/ai-coach-assistant/injury-prevention/${studentId}`);
    }

    // ─── AI Coach Core Endpoints ───────────────────────────────

    async getRecommendations(data: {
        studentId: string;
        performanceData?: any;
        skillLevel?: string;
    }) {
        return apiClient.post<any>('/ai-coach/recommendations', data);
    }

    async analyzePerformance(data: {
        studentId: string;
        performanceMetrics: any;
    }) {
        return apiClient.post<any>('/ai-coach/analyze', data);
    }

    async getCoachingPlan(studentId: string) {
        return apiClient.get<any>(`/ai-coach/coaching-plan/${studentId}`);
    }

    // ─── AI Chatbot (public, no auth needed) ───────────────────

    async chat(message: string, conversationHistory: any[] = []) {
        return apiClient.post<any>('/ai/chat', {
            message,
            conversationHistory,
        });
    }
}

export default new AICoachService();
