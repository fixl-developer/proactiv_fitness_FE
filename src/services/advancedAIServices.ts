import { apiClient } from '@/services/api/client';

// ─── 1. AI Video Analysis ──────────────────────────────────────
export const videoAnalysisService = {
    async analyzeVideo(data: { studentId: string; videoUrl: string; exerciseType: string }) {
        return apiClient.post<any>('/ai-video-analysis/analyze-video', data);
    },
    async getAnalysis(id: string) {
        return apiClient.get<any>(`/ai-video-analysis/analysis/${id}`);
    },
    async getStudentHistory(studentId: string) {
        return apiClient.get<any>(`/ai-video-analysis/student/${studentId}/history`);
    },
    async compareAnalyses(data: { analysisId1: string; analysisId2: string }) {
        return apiClient.post<any>('/ai-video-analysis/compare', data);
    },
};

// ─── 2. Smart Scheduler ────────────────────────────────────────
export const smartSchedulerService = {
    async predictAttendance(data: { classId: string; date: string }) {
        return apiClient.post<any>('/smart-scheduler/predict-attendance', data);
    },
    async optimizeSchedule(data: { locationId: string; termId?: string }) {
        return apiClient.post<any>('/smart-scheduler/optimize-schedule', data);
    },
    async getPeakHours(locationId: string) {
        return apiClient.get<any>(`/smart-scheduler/peak-hours/${locationId}`);
    },
    async matchCoach(data: { studentId: string; programType: string }) {
        return apiClient.post<any>('/smart-scheduler/match-coach', data);
    },
    async autoFillWaitlist(data: { classId: string }) {
        return apiClient.post<any>('/smart-scheduler/auto-fill-waitlist', data);
    },
};

// ─── 3. Parent AI Assistant ────────────────────────────────────
export const parentAIService = {
    async generateReport(studentId: string, period?: string) {
        return apiClient.post<any>(`/parent-ai-assistant/generate-report/${studentId}`, { period });
    },
    async askQuestion(data: { studentId: string; question: string; conversationHistory?: any[] }) {
        return apiClient.post<any>('/parent-ai-assistant/ask', data);
    },
    async getMilestones(studentId: string) {
        return apiClient.get<any>(`/parent-ai-assistant/milestones/${studentId}`);
    },
    async generateReportCard(studentId: string, termId?: string) {
        return apiClient.post<any>(`/parent-ai-assistant/report-card/${studentId}`, { termId });
    },
    async getNotifications(parentId: string) {
        return apiClient.get<any>(`/parent-ai-assistant/notifications/${parentId}`);
    },
};

// ─── 4. Revenue Intelligence ───────────────────────────────────
export const revenueIntelligenceService = {
    async getChurnRisk(entityId: string) {
        return apiClient.get<any>(`/revenue-intelligence/churn-risk/${entityId}`);
    },
    async triggerRetentionCampaign(data: { targetStudents: string[]; campaignType: string }) {
        return apiClient.post<any>('/revenue-intelligence/retention-campaign', data);
    },
    async getUpsellOpportunities() {
        return apiClient.get<any>('/revenue-intelligence/upsell-opportunities');
    },
    async predictLTV(studentId: string) {
        return apiClient.get<any>(`/revenue-intelligence/ltv/${studentId}`);
    },
    async getOptimizationSuggestions() {
        return apiClient.get<any>('/revenue-intelligence/optimization-suggestions');
    },
};

// ─── 5. AI Content Engine ──────────────────────────────────────
export const contentEngineService = {
    async generateSocialPost(data: { topic: string; platform?: string; targetAudience?: string; tone?: string }) {
        return apiClient.post<any>('/ai-content-engine/generate-social-post', data);
    },
    async generateEmail(data: { topic: string; targetAudience?: string; tone?: string; campaignType?: string }) {
        return apiClient.post<any>('/ai-content-engine/generate-email', data);
    },
    async generateArticle(data: { topic: string; targetAudience?: string; tone?: string; wordCount?: number }) {
        return apiClient.post<any>('/ai-content-engine/generate-article', data);
    },
    async generateAdCopy(data: { topic: string; targetAudience?: string; tone?: string; adPlatform?: string; budget?: number }) {
        return apiClient.post<any>('/ai-content-engine/generate-ad-copy', data);
    },
    async getSeoSuggestions(pageUrl: string) {
        return apiClient.get<any>('/ai-content-engine/seo-suggestions', { params: { pageUrl } });
    },
};

// ─── 6. Workflow Orchestrator ──────────────────────────────────
export const workflowOrchestratorService = {
    async createChain(data: { name: string; description: string; steps?: any[]; useAI?: boolean }) {
        return apiClient.post<any>('/workflow-orchestrator/create-chain', data);
    },
    async executeChain(chainId: string) {
        return apiClient.post<any>(`/workflow-orchestrator/execute/${chainId}`, {});
    },
    async getChain(chainId: string) {
        return apiClient.get<any>(`/workflow-orchestrator/chain/${chainId}`);
    },
    async scheduleReport(data: { reportType: string; schedule: string; recipients: string[] }) {
        return apiClient.post<any>('/workflow-orchestrator/schedule-report', data);
    },
    async getWorkflowHealth() {
        return apiClient.get<any>('/workflow-orchestrator/health');
    },
};

// ─── 7. Smart Support ──────────────────────────────────────────
export const smartSupportService = {
    async classifyTicket(data: { ticketRef: string; subject: string; message: string; memberHistory?: string }) {
        return apiClient.post<any>('/smart-support/classify-ticket', data);
    },
    async routeTicket(data: { ticketRef: string; category: string; priority: string; subject: string; message: string; availableAgents?: string[] }) {
        return apiClient.post<any>('/smart-support/route-ticket', data);
    },
    async suggestResponse(ticketId: string) {
        return apiClient.get<any>(`/smart-support/suggest-response/${ticketId}`);
    },
    async analyzeSentiment(data: { ticketRef: string; message: string }) {
        return apiClient.post<any>('/smart-support/analyze-sentiment', data);
    },
    async autoResolve(data: { ticketRef: string; subject: string; message: string; category?: string }) {
        return apiClient.post<any>('/smart-support/auto-resolve', data);
    },
};

// ─── 8. AI Safety Monitor ──────────────────────────────────────
export const safetyMonitorService = {
    async getSafetyScore(locationId: string) {
        return apiClient.get<any>(`/ai-safety-monitor/safety-score/${locationId}`);
    },
    async getIncidentPredictions(locationId: string) {
        return apiClient.get<any>(`/ai-safety-monitor/incident-predictions/${locationId}`);
    },
    async getCertificationAlerts() {
        return apiClient.get<any>('/ai-safety-monitor/certification-alerts');
    },
    async getEmergencyGuide(data: { scenario: string; locationId: string }) {
        return apiClient.post<any>('/ai-safety-monitor/emergency-guide', data);
    },
    async runComplianceAudit(locationId: string) {
        return apiClient.post<any>('/ai-safety-monitor/compliance-audit', { locationId });
    },
};

// ─── 9. AI Communication ──────────────────────────────────────
export const aiCommunicationService = {
    async optimizeMessage(data: { message: string; channel: string; audience: string }) {
        return apiClient.post<any>('/ai-communication/optimize-message', data);
    },
    async getBestTime(data: { audienceType: string; channel: string }) {
        return apiClient.post<any>('/ai-communication/best-time', data);
    },
    async createABTest(data: { messageA: string; messageB: string; audience: string }) {
        return apiClient.post<any>('/ai-communication/ab-test', data);
    },
    async getEngagementScore(campaignId: string) {
        return apiClient.get<any>(`/ai-communication/engagement-score/${campaignId}`);
    },
    async predictCampaign(data: { type: string; audience: string; budget: number }) {
        return apiClient.post<any>('/ai-communication/predict-campaign', data);
    },
};

// ─── 10. Student Digital Twin ──────────────────────────────────
export const digitalTwinService = {
    async getProfile(studentId: string) {
        return apiClient.get<any>(`/student-digital-twin/profile/${studentId}`);
    },
    async getLearningPath(studentId: string) {
        return apiClient.get<any>(`/student-digital-twin/learning-path/${studentId}`);
    },
    async getSkillGaps(studentId: string) {
        return apiClient.get<any>(`/student-digital-twin/skill-gaps/${studentId}`);
    },
    async getCompetitionReadiness(studentId: string) {
        return apiClient.get<any>(`/student-digital-twin/competition-readiness/${studentId}`);
    },
    async getDevelopmentRoadmap(studentId: string) {
        return apiClient.get<any>(`/student-digital-twin/development-roadmap/${studentId}`);
    },
};

// ─── 11. AI Gamification Engine ────────────────────────────────
export const gamificationEngineService = {
    async getChallenges(studentId: string) {
        return apiClient.post<any>(`/ai-gamification-engine/generate-challenges/${studentId}`, {});
    },
    async adjustDifficulty(data: { studentId: string; currentPerformance: any }) {
        return apiClient.post<any>('/ai-gamification-engine/adjust-difficulty', data);
    },
    async balanceTeams(data: { students: any[]; teamCount: number }) {
        return apiClient.post<any>('/ai-gamification-engine/balance-teams', data);
    },
    async getRewardTiming(studentId: string) {
        return apiClient.get<any>(`/ai-gamification-engine/reward-timing/${studentId}`);
    },
    async getStreakRisk(studentId: string) {
        return apiClient.get<any>(`/ai-gamification-engine/streak-risk/${studentId}`);
    },
};

// ─── 12. Global Intelligence ───────────────────────────────────
export const globalIntelligenceService = {
    async getBenchmarks() {
        return apiClient.get<any>('/global-intelligence/benchmarks');
    },
    async getBestPractices() {
        return apiClient.get<any>('/global-intelligence/best-practices');
    },
    async getGlobalForecast() {
        return apiClient.get<any>('/global-intelligence/global-forecast');
    },
    async optimizeResources() {
        return apiClient.get<any>('/global-intelligence/optimize-resources');
    },
    async getExpansionOpportunities() {
        return apiClient.get<any>('/global-intelligence/expansion-opportunities');
    },
};
