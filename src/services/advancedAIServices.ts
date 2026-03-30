import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

const getAuthHeaders = () => {
    const token = typeof window !== 'undefined'
        ? localStorage.getItem('accessToken') || localStorage.getItem('token')
        : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── 1. AI Video Analysis ──────────────────────────────────────
export const videoAnalysisService = {
    async analyzeVideo(data: { studentId: string; videoUrl: string; exerciseType: string }) {
        const res = await axios.post(`${API_URL}/ai-video-analysis/analyze-video`, data, { headers: getAuthHeaders() });
        return res.data;
    },
    async getAnalysis(id: string) {
        const res = await axios.get(`${API_URL}/ai-video-analysis/analysis/${id}`, { headers: getAuthHeaders() });
        return res.data;
    },
    async getStudentHistory(studentId: string) {
        const res = await axios.get(`${API_URL}/ai-video-analysis/student/${studentId}/history`, { headers: getAuthHeaders() });
        return res.data;
    },
    async compareAnalyses(data: { analysisId1: string; analysisId2: string }) {
        const res = await axios.post(`${API_URL}/ai-video-analysis/compare`, data, { headers: getAuthHeaders() });
        return res.data;
    },
};

// ─── 2. Smart Scheduler ────────────────────────────────────────
export const smartSchedulerService = {
    async predictAttendance(data: { classId: string; date: string }) {
        const res = await axios.post(`${API_URL}/smart-scheduler/predict-attendance`, data, { headers: getAuthHeaders() });
        return res.data;
    },
    async optimizeSchedule(data: { locationId: string; termId?: string }) {
        const res = await axios.post(`${API_URL}/smart-scheduler/optimize-schedule`, data, { headers: getAuthHeaders() });
        return res.data;
    },
    async getPeakHours(locationId: string) {
        const res = await axios.get(`${API_URL}/smart-scheduler/peak-hours/${locationId}`, { headers: getAuthHeaders() });
        return res.data;
    },
    async matchCoach(data: { studentId: string; programType: string }) {
        const res = await axios.post(`${API_URL}/smart-scheduler/match-coach`, data, { headers: getAuthHeaders() });
        return res.data;
    },
    async autoFillWaitlist(data: { classId: string }) {
        const res = await axios.post(`${API_URL}/smart-scheduler/auto-fill-waitlist`, data, { headers: getAuthHeaders() });
        return res.data;
    },
};

// ─── 3. Parent AI Assistant ────────────────────────────────────
export const parentAIService = {
    async generateReport(studentId: string, period?: string) {
        const res = await axios.post(`${API_URL}/parent-ai-assistant/generate-report/${studentId}`, { period }, { headers: getAuthHeaders() });
        return res.data;
    },
    async askQuestion(data: { studentId: string; question: string; conversationHistory?: any[] }) {
        const res = await axios.post(`${API_URL}/parent-ai-assistant/ask`, data, { headers: getAuthHeaders() });
        return res.data;
    },
    async getMilestones(studentId: string) {
        const res = await axios.get(`${API_URL}/parent-ai-assistant/milestones/${studentId}`, { headers: getAuthHeaders() });
        return res.data;
    },
    async generateReportCard(studentId: string, termId?: string) {
        const res = await axios.post(`${API_URL}/parent-ai-assistant/report-card/${studentId}`, { termId }, { headers: getAuthHeaders() });
        return res.data;
    },
    async getNotifications(parentId: string) {
        const res = await axios.get(`${API_URL}/parent-ai-assistant/notifications/${parentId}`, { headers: getAuthHeaders() });
        return res.data;
    },
};

// ─── 4. Revenue Intelligence ───────────────────────────────────
export const revenueIntelligenceService = {
    async getChurnRisk(entityId: string) {
        const res = await axios.get(`${API_URL}/revenue-intelligence/churn-risk/${entityId}`, { headers: getAuthHeaders() });
        return res.data;
    },
    async triggerRetentionCampaign(data: { targetStudents: string[]; campaignType: string }) {
        const res = await axios.post(`${API_URL}/revenue-intelligence/retention-campaign`, data, { headers: getAuthHeaders() });
        return res.data;
    },
    async getUpsellOpportunities() {
        const res = await axios.get(`${API_URL}/revenue-intelligence/upsell-opportunities`, { headers: getAuthHeaders() });
        return res.data;
    },
    async predictLTV(studentId: string) {
        const res = await axios.get(`${API_URL}/revenue-intelligence/ltv/${studentId}`, { headers: getAuthHeaders() });
        return res.data;
    },
    async getOptimizationSuggestions() {
        const res = await axios.get(`${API_URL}/revenue-intelligence/optimization-suggestions`, { headers: getAuthHeaders() });
        return res.data;
    },
};

// ─── 5. AI Content Engine ──────────────────────────────────────
export const contentEngineService = {
    async generateSocialPost(data: { topic: string; platform?: string; targetAudience?: string; tone?: string }) {
        const res = await axios.post(`${API_URL}/ai-content-engine/generate-social-post`, data, { headers: getAuthHeaders() });
        return res.data;
    },
    async generateEmail(data: { topic: string; targetAudience?: string; tone?: string; campaignType?: string }) {
        const res = await axios.post(`${API_URL}/ai-content-engine/generate-email`, data, { headers: getAuthHeaders() });
        return res.data;
    },
    async generateArticle(data: { topic: string; targetAudience?: string; tone?: string; wordCount?: number }) {
        const res = await axios.post(`${API_URL}/ai-content-engine/generate-article`, data, { headers: getAuthHeaders() });
        return res.data;
    },
    async generateAdCopy(data: { topic: string; targetAudience?: string; tone?: string; adPlatform?: string; budget?: number }) {
        const res = await axios.post(`${API_URL}/ai-content-engine/generate-ad-copy`, data, { headers: getAuthHeaders() });
        return res.data;
    },
    async getSeoSuggestions(pageUrl: string) {
        const res = await axios.get(`${API_URL}/ai-content-engine/seo-suggestions`, { params: { pageUrl }, headers: getAuthHeaders() });
        return res.data;
    },
};

// ─── 6. Workflow Orchestrator ──────────────────────────────────
export const workflowOrchestratorService = {
    async createChain(data: { name: string; description: string; steps?: any[]; useAI?: boolean }) {
        const res = await axios.post(`${API_URL}/workflow-orchestrator/create-chain`, data, { headers: getAuthHeaders() });
        return res.data;
    },
    async executeChain(chainId: string) {
        const res = await axios.post(`${API_URL}/workflow-orchestrator/execute/${chainId}`, {}, { headers: getAuthHeaders() });
        return res.data;
    },
    async getChain(chainId: string) {
        const res = await axios.get(`${API_URL}/workflow-orchestrator/chain/${chainId}`, { headers: getAuthHeaders() });
        return res.data;
    },
    async scheduleReport(data: { reportType: string; schedule: string; recipients: string[] }) {
        const res = await axios.post(`${API_URL}/workflow-orchestrator/schedule-report`, data, { headers: getAuthHeaders() });
        return res.data;
    },
    async getWorkflowHealth() {
        const res = await axios.get(`${API_URL}/workflow-orchestrator/health`, { headers: getAuthHeaders() });
        return res.data;
    },
};

// ─── 7. Smart Support ──────────────────────────────────────────
export const smartSupportService = {
    async classifyTicket(data: { ticketRef: string; subject: string; message: string; memberHistory?: string }) {
        const res = await axios.post(`${API_URL}/smart-support/classify-ticket`, data, { headers: getAuthHeaders() });
        return res.data;
    },
    async routeTicket(data: { ticketRef: string; category: string; priority: string; subject: string; message: string; availableAgents?: string[] }) {
        const res = await axios.post(`${API_URL}/smart-support/route-ticket`, data, { headers: getAuthHeaders() });
        return res.data;
    },
    async suggestResponse(ticketId: string) {
        const res = await axios.get(`${API_URL}/smart-support/suggest-response/${ticketId}`, { headers: getAuthHeaders() });
        return res.data;
    },
    async analyzeSentiment(data: { ticketRef: string; message: string }) {
        const res = await axios.post(`${API_URL}/smart-support/analyze-sentiment`, data, { headers: getAuthHeaders() });
        return res.data;
    },
    async autoResolve(data: { ticketRef: string; subject: string; message: string; category?: string }) {
        const res = await axios.post(`${API_URL}/smart-support/auto-resolve`, data, { headers: getAuthHeaders() });
        return res.data;
    },
};

// ─── 8. AI Safety Monitor ──────────────────────────────────────
export const safetyMonitorService = {
    async getSafetyScore(locationId: string) {
        const res = await axios.get(`${API_URL}/ai-safety-monitor/safety-score/${locationId}`, { headers: getAuthHeaders() });
        return res.data;
    },
    async getIncidentPredictions(locationId: string) {
        const res = await axios.get(`${API_URL}/ai-safety-monitor/incident-predictions/${locationId}`, { headers: getAuthHeaders() });
        return res.data;
    },
    async getCertificationAlerts() {
        const res = await axios.get(`${API_URL}/ai-safety-monitor/certification-alerts`, { headers: getAuthHeaders() });
        return res.data;
    },
    async getEmergencyGuide(data: { scenario: string; locationId: string }) {
        const res = await axios.post(`${API_URL}/ai-safety-monitor/emergency-guide`, data, { headers: getAuthHeaders() });
        return res.data;
    },
    async runComplianceAudit(locationId: string) {
        const res = await axios.post(`${API_URL}/ai-safety-monitor/compliance-audit`, { locationId }, { headers: getAuthHeaders() });
        return res.data;
    },
};

// ─── 9. AI Communication ──────────────────────────────────────
export const aiCommunicationService = {
    async optimizeMessage(data: { message: string; channel: string; audience: string }) {
        const res = await axios.post(`${API_URL}/ai-communication/optimize-message`, data, { headers: getAuthHeaders() });
        return res.data;
    },
    async getBestTime(data: { audienceType: string; channel: string }) {
        const res = await axios.post(`${API_URL}/ai-communication/best-time`, data, { headers: getAuthHeaders() });
        return res.data;
    },
    async createABTest(data: { messageA: string; messageB: string; audience: string }) {
        const res = await axios.post(`${API_URL}/ai-communication/ab-test`, data, { headers: getAuthHeaders() });
        return res.data;
    },
    async getEngagementScore(campaignId: string) {
        const res = await axios.get(`${API_URL}/ai-communication/engagement-score/${campaignId}`, { headers: getAuthHeaders() });
        return res.data;
    },
    async predictCampaign(data: { type: string; audience: string; budget: number }) {
        const res = await axios.post(`${API_URL}/ai-communication/predict-campaign`, data, { headers: getAuthHeaders() });
        return res.data;
    },
};

// ─── 10. Student Digital Twin ──────────────────────────────────
export const digitalTwinService = {
    async getProfile(studentId: string) {
        const res = await axios.get(`${API_URL}/student-digital-twin/profile/${studentId}`, { headers: getAuthHeaders() });
        return res.data;
    },
    async getLearningPath(studentId: string) {
        const res = await axios.get(`${API_URL}/student-digital-twin/learning-path/${studentId}`, { headers: getAuthHeaders() });
        return res.data;
    },
    async getSkillGaps(studentId: string) {
        const res = await axios.get(`${API_URL}/student-digital-twin/skill-gaps/${studentId}`, { headers: getAuthHeaders() });
        return res.data;
    },
    async getCompetitionReadiness(studentId: string) {
        const res = await axios.get(`${API_URL}/student-digital-twin/competition-readiness/${studentId}`, { headers: getAuthHeaders() });
        return res.data;
    },
    async getDevelopmentRoadmap(studentId: string) {
        const res = await axios.get(`${API_URL}/student-digital-twin/development-roadmap/${studentId}`, { headers: getAuthHeaders() });
        return res.data;
    },
};

// ─── 11. AI Gamification Engine ────────────────────────────────
export const gamificationEngineService = {
    async getChallenges(studentId: string) {
        const res = await axios.post(`${API_URL}/ai-gamification-engine/generate-challenges/${studentId}`, {}, { headers: getAuthHeaders() });
        return res.data;
    },
    async adjustDifficulty(data: { studentId: string; currentPerformance: any }) {
        const res = await axios.post(`${API_URL}/ai-gamification-engine/adjust-difficulty`, data, { headers: getAuthHeaders() });
        return res.data;
    },
    async balanceTeams(data: { students: any[]; teamCount: number }) {
        const res = await axios.post(`${API_URL}/ai-gamification-engine/balance-teams`, data, { headers: getAuthHeaders() });
        return res.data;
    },
    async getRewardTiming(studentId: string) {
        const res = await axios.get(`${API_URL}/ai-gamification-engine/reward-timing/${studentId}`, { headers: getAuthHeaders() });
        return res.data;
    },
    async getStreakRisk(studentId: string) {
        const res = await axios.get(`${API_URL}/ai-gamification-engine/streak-risk/${studentId}`, { headers: getAuthHeaders() });
        return res.data;
    },
};

// ─── 12. Global Intelligence ───────────────────────────────────
export const globalIntelligenceService = {
    async getBenchmarks() {
        const res = await axios.get(`${API_URL}/global-intelligence/benchmarks`, { headers: getAuthHeaders() });
        return res.data;
    },
    async getBestPractices() {
        const res = await axios.get(`${API_URL}/global-intelligence/best-practices`, { headers: getAuthHeaders() });
        return res.data;
    },
    async getGlobalForecast() {
        const res = await axios.get(`${API_URL}/global-intelligence/global-forecast`, { headers: getAuthHeaders() });
        return res.data;
    },
    async optimizeResources() {
        const res = await axios.get(`${API_URL}/global-intelligence/optimize-resources`, { headers: getAuthHeaders() });
        return res.data;
    },
    async getExpansionOpportunities() {
        const res = await axios.get(`${API_URL}/global-intelligence/expansion-opportunities`, { headers: getAuthHeaders() });
        return res.data;
    },
};
