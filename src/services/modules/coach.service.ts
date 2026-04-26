import { apiClient } from '../api/client'
import ErrorHandler from '../api/errorHandler'

// ==================== INTERFACES ====================

export interface CoachProfile {
    id: string
    staffId: string
    name: string
    firstName: string
    lastName: string
    email: string
    phone: string
    location: string
    bio: string
    specializations: string[]
    certifications: { name: string; status: string; issuingOrganization?: string; expiryDate?: string }[]
    skills: string[]
    experienceYears: number
    rating: number
    totalStudents: number
    totalClasses: number
    status: string
}

export interface CoachStudent {
    id: string
    name: string
    email: string
    phone: string
    level: string
    joinDate: string
    classes: number
    attendance: number
    progress: number
    skills: string[]
    rating: number
    programId?: string
}

export interface CoachFeedback {
    id: string
    studentId: string
    studentName: string
    coachId: string
    date: string
    rating: number
    text: string
    type: 'positive' | 'constructive'
}

export interface CoachAvailability {
    [day: string]: {
        start: string
        end: string
        available: boolean
    }
}

export interface CoachScheduleItem {
    id: string
    className: string
    date: string
    time: string
    startTime: string
    endTime: string
    location: string
    level: string
    enrolledStudents: number
    capacity: number
    duration: number
    status: string
}

export interface CoachDashboardData {
    todayClasses: number
    totalStudents: number
    attendanceRate: number
    activePrograms: number
    todaySchedule: CoachScheduleItem[]
    programs: {
        name: string
        level: string
        currentEnrollment: number
        capacity: number
        duration: number
    }[]
    performanceMetrics: {
        studentSatisfaction: number
        classCompletion: number
        skillImprovement: number
        attendanceConsistency: number
    }
}

export interface CoachReportData {
    totalClasses: number
    totalStudents: number
    avgAttendance: number
    avgRating: number
    classDistribution: { name: string; count: number; percentage: number }[]
    studentProgress: { name: string; progress: number; trend: string }[]
    attendanceByDay: { day: string; attended: number; total: number; percentage: number }[]
    performanceMetrics: { metric: string; value: number }[]
}

// ==================== SERVICE ====================
//
// All endpoints hit the dedicated /coach/* backend routes (coach.routes.ts).
// The previous version of this service tried to compose data from generic
// /scheduling, /staff, /attendance endpoints which had path mismatches and
// returned 404/500 for many calls. The new /coach/* routes give the coach
// dashboard a stable, purpose-built API surface.

class CoachService {
    private readonly MODULE_NAME = 'coach'

    private unwrap<T>(response: any): T {
        return (response?.data !== undefined ? response.data : response) as T
    }

    // ==================== DASHBOARD ====================

    async getDashboardData(_coachId?: string): Promise<CoachDashboardData> {
        try {
            const response = await apiClient.get<any>('/coach/dashboard')
            return this.unwrap<CoachDashboardData>(response)
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    // ==================== STUDENTS ====================

    async getMyStudents(_coachId?: string): Promise<CoachStudent[]> {
        try {
            const response = await apiClient.get<any>('/coach/students')
            const data = this.unwrap<any>(response)
            return Array.isArray(data) ? data : []
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    // ==================== SCHEDULE ====================

    async getSchedules(_coachId?: string, params?: { dateFrom?: string; dateTo?: string }): Promise<CoachScheduleItem[]> {
        try {
            const response = await apiClient.get<any>('/coach/schedule', { params })
            const data = this.unwrap<any>(response)
            return Array.isArray(data) ? data : []
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async createSchedule(data: any): Promise<any> {
        try {
            return await apiClient.post<any>('/coach/schedule', data)
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async updateSchedule(id: string, data: any): Promise<any> {
        try {
            return await apiClient.put<any>(`/coach/schedule/${id}`, data)
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async deleteSchedule(id: string): Promise<any> {
        try {
            return await apiClient.delete<any>(`/coach/schedule/${id}`)
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    // ==================== AVAILABILITY ====================

    async getAvailability(_coachId?: string): Promise<CoachAvailability> {
        try {
            const response = await apiClient.get<any>('/coach/availability')
            return this.unwrap<CoachAvailability>(response)
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async saveAvailability(_coachId: string | undefined, availability: CoachAvailability): Promise<any> {
        try {
            return await apiClient.put<any>('/coach/availability', availability)
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    // ==================== FEEDBACK ====================

    async getFeedbackHistory(_coachId?: string): Promise<CoachFeedback[]> {
        try {
            const response = await apiClient.get<any>('/coach/feedback')
            const data = this.unwrap<any>(response)
            return Array.isArray(data) ? data : []
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async sendFeedback(data: {
        studentId: string
        studentName?: string
        coachId?: string
        rating: number
        text: string
        type?: string
    }): Promise<any> {
        try {
            return await apiClient.post<any>('/coach/feedback', data)
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async deleteFeedback(feedbackId: string): Promise<any> {
        try {
            return await apiClient.delete<any>(`/coach/feedback/${feedbackId}`)
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    // ==================== PROFILE ====================

    async getProfile(_coachId?: string): Promise<CoachProfile> {
        try {
            const response = await apiClient.get<any>('/coach/profile')
            return this.unwrap<CoachProfile>(response)
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async updateProfile(_coachId: string | undefined, data: Partial<{
        firstName: string
        lastName: string
        phone: string
        bio: string
        specializations: string[]
        skills: string[]
    }>): Promise<any> {
        try {
            return await apiClient.put<any>('/coach/profile', data)
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    // ==================== REPORTS ====================

    async getReportData(_coachId?: string, _type?: string, _dateRange?: string): Promise<CoachReportData> {
        try {
            const response = await apiClient.get<any>('/coach/reports')
            return this.unwrap<CoachReportData>(response)
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    // ==================== ATTENDANCE ====================

    async markAttendance(data: {
        studentId: string
        classId: string
        date: string
        status: 'present' | 'absent' | 'late' | 'excused'
        notes?: string
    }): Promise<any> {
        try {
            return await apiClient.post<any>('/coach/attendance', data)
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }
}

// =============================================
// EXTENDED INTERFACES for 6 additional Coach pages
// =============================================

export interface AttendanceRosterItem {
    sessionId: string
    sessionTime: string
    studentId: string
    studentName: string
    status: 'pending' | 'present' | 'absent' | 'late' | 'excused'
    attendanceId: string | null
}
export interface AttendanceHistoryItem {
    id: string
    studentId: string
    studentName: string
    date: string
    status: string
    notes?: string
    sessionId?: string | null
}

export interface ChatConversation {
    conversationId: string
    otherUserId: string
    otherName: string
    lastMessage: string
    lastMessageAt: string
    unreadCount: number
    messages: { id: string; from: 'me' | 'other'; fromName: string; body: string; read: boolean; createdAt: string }[]
}

export interface LessonPlan {
    _id?: string
    id?: string
    title: string
    week: number
    programId?: string
    programName?: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    skills: string[]
    drills: string[]
    duration: number
    objectives?: string
    notes?: string
    status: 'draft' | 'published' | 'completed' | 'archived'
}

export interface StudentProgressItem {
    _id?: string
    id?: string
    studentId: string
    studentName: string
    skillName: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    masteryPercent: number
    notes?: string
    sessionDate: string
}

export interface CoachEquipmentItem {
    _id?: string
    id?: string
    name: string
    category: string
    quantity: number
    status: 'available' | 'in_use' | 'maintenance' | 'broken' | 'lost'
    location?: string
    purchaseDate?: string
    lastMaintenanceDate?: string
    notes?: string
}

export interface CoachGoalItem {
    _id?: string
    id?: string
    title: string
    description?: string
    metric: string
    targetValue: number
    currentValue: number
    unit?: string
    deadline: string
    priority: 'low' | 'medium' | 'high'
    status: 'active' | 'achieved' | 'missed' | 'archived'
}

interface CoachServiceExt {
    getAttendanceToday(): Promise<{ sessions: any[]; roster: AttendanceRosterItem[] }>
    getAttendanceHistory(days?: number): Promise<AttendanceHistoryItem[]>
    getMessages(): Promise<ChatConversation[]>
    sendMessage(data: { toUserId: string; body: string; conversationId?: string }): Promise<any>
    markConversationRead(conversationId: string): Promise<any>
    deleteMessage(id: string): Promise<any>
    getLessonPlans(params?: any): Promise<{ data: LessonPlan[]; pagination: any }>
    createLessonPlan(data: Partial<LessonPlan>): Promise<any>
    updateLessonPlan(id: string, data: Partial<LessonPlan>): Promise<any>
    deleteLessonPlan(id: string): Promise<any>
    getProgressEntries(params?: any): Promise<{ data: StudentProgressItem[]; pagination: any }>
    createProgressEntry(data: Partial<StudentProgressItem>): Promise<any>
    updateProgressEntry(id: string, data: Partial<StudentProgressItem>): Promise<any>
    deleteProgressEntry(id: string): Promise<any>
    getEquipment(params?: any): Promise<{ data: CoachEquipmentItem[]; pagination: any }>
    createEquipment(data: Partial<CoachEquipmentItem>): Promise<any>
    updateEquipment(id: string, data: Partial<CoachEquipmentItem>): Promise<any>
    deleteEquipment(id: string): Promise<any>
    getGoals(params?: any): Promise<{ data: CoachGoalItem[]; pagination: any }>
    createGoal(data: Partial<CoachGoalItem>): Promise<any>
    updateGoal(id: string, data: Partial<CoachGoalItem>): Promise<any>
    deleteGoal(id: string): Promise<any>
}

;(CoachService.prototype as any).getAttendanceToday = async function () {
    const r: any = await apiClient.get('/coach/attendance/today')
    return r?.data || { sessions: [], roster: [] }
}
;(CoachService.prototype as any).getAttendanceHistory = async function (days = 30) {
    const r: any = await apiClient.get('/coach/attendance/history', { params: { days } })
    return r?.data || []
}

;(CoachService.prototype as any).getMessages = async function () {
    const r: any = await apiClient.get('/coach/messages')
    return r?.data || []
}
;(CoachService.prototype as any).sendMessage = async function (data: any) {
    return apiClient.post('/coach/messages', data)
}
;(CoachService.prototype as any).markConversationRead = async function (cid: string) {
    return apiClient.patch(`/coach/messages/${cid}/read`, {})
}
;(CoachService.prototype as any).deleteMessage = async function (id: string) {
    return apiClient.delete(`/coach/messages/${id}`)
}

;(CoachService.prototype as any).getLessonPlans = async function (params?: any) {
    const r: any = await apiClient.get('/coach/curriculum', { params })
    return { data: r?.data || [], pagination: r?.pagination || {} }
}
;(CoachService.prototype as any).createLessonPlan = async function (data: any) {
    return apiClient.post('/coach/curriculum', data)
}
;(CoachService.prototype as any).updateLessonPlan = async function (id: string, data: any) {
    return apiClient.put(`/coach/curriculum/${id}`, data)
}
;(CoachService.prototype as any).deleteLessonPlan = async function (id: string) {
    return apiClient.delete(`/coach/curriculum/${id}`)
}

;(CoachService.prototype as any).getProgressEntries = async function (params?: any) {
    const r: any = await apiClient.get('/coach/progress', { params })
    return { data: r?.data || [], pagination: r?.pagination || {} }
}
;(CoachService.prototype as any).createProgressEntry = async function (data: any) {
    return apiClient.post('/coach/progress', data)
}
;(CoachService.prototype as any).updateProgressEntry = async function (id: string, data: any) {
    return apiClient.put(`/coach/progress/${id}`, data)
}
;(CoachService.prototype as any).deleteProgressEntry = async function (id: string) {
    return apiClient.delete(`/coach/progress/${id}`)
}

;(CoachService.prototype as any).getEquipment = async function (params?: any) {
    const r: any = await apiClient.get('/coach/equipment', { params })
    return { data: r?.data || [], pagination: r?.pagination || {} }
}
;(CoachService.prototype as any).createEquipment = async function (data: any) {
    return apiClient.post('/coach/equipment', data)
}
;(CoachService.prototype as any).updateEquipment = async function (id: string, data: any) {
    return apiClient.put(`/coach/equipment/${id}`, data)
}
;(CoachService.prototype as any).deleteEquipment = async function (id: string) {
    return apiClient.delete(`/coach/equipment/${id}`)
}

;(CoachService.prototype as any).getGoals = async function (params?: any) {
    const r: any = await apiClient.get('/coach/goals', { params })
    return { data: r?.data || [], pagination: r?.pagination || {} }
}
;(CoachService.prototype as any).createGoal = async function (data: any) {
    return apiClient.post('/coach/goals', data)
}
;(CoachService.prototype as any).updateGoal = async function (id: string, data: any) {
    return apiClient.put(`/coach/goals/${id}`, data)
}
;(CoachService.prototype as any).deleteGoal = async function (id: string) {
    return apiClient.delete(`/coach/goals/${id}`)
}

export const coachService = new CoachService() as CoachService & CoachServiceExt
export default CoachService
