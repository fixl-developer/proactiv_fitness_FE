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

class CoachService {
    private readonly MODULE_NAME = 'coach'

    // ==================== DASHBOARD ====================

    async getDashboardData(coachId: string): Promise<CoachDashboardData> {
        try {
            // Fetch data from multiple endpoints in parallel
            const [schedulesRes, programsRes, attendanceRes, performanceRes] = await Promise.allSettled([
                apiClient.get<any>('/scheduling', {
                    params: { coachId, date: new Date().toISOString().split('T')[0], limit: 20 }
                }),
                apiClient.get<any>('/admin/programs/catalog', { params: { status: 'active', limit: 10 } }),
                apiClient.get<any>('/attendance/statistics'),
                apiClient.get<any>(`/staff/${coachId}/performance`)
            ])

            const schedules = schedulesRes.status === 'fulfilled'
                ? (schedulesRes.value as any)?.data?.schedules || (schedulesRes.value as any)?.schedules || []
                : []

            const programs = programsRes.status === 'fulfilled'
                ? (programsRes.value as any)?.data || (programsRes.value as any) || []
                : []

            const attendanceStats = attendanceRes.status === 'fulfilled'
                ? (attendanceRes.value as any)?.data || {}
                : {}

            const performance = performanceRes.status === 'fulfilled'
                ? (performanceRes.value as any)?.data || {}
                : {}

            // Map schedules to today's schedule
            const today = new Date().toISOString().split('T')[0]
            const todaySchedule = Array.isArray(schedules)
                ? schedules.filter((s: any) => s.date === today || s.dayOfWeek === new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase())
                : []

            return {
                todayClasses: todaySchedule.length || schedules.length || 0,
                totalStudents: performance?.totalStudents || attendanceStats?.totalRecords || 0,
                attendanceRate: attendanceStats?.occupancyRate || performance?.attendanceRate || 0,
                activePrograms: Array.isArray(programs) ? programs.filter((p: any) => p.status === 'active').length : 0,
                todaySchedule: todaySchedule.map((s: any) => ({
                    id: s._id || s.id,
                    className: s.className || s.name || 'Class',
                    date: s.date || today,
                    time: s.startTime ? `${s.startTime} - ${s.endTime}` : '',
                    startTime: s.startTime || '',
                    endTime: s.endTime || '',
                    location: s.location || s.roomId || 'TBD',
                    level: s.level || 'beginner',
                    enrolledStudents: s.enrolled || s.enrolledStudents || 0,
                    capacity: s.capacity || 0,
                    duration: s.duration || 60,
                    status: s.status || 'active'
                })),
                programs: Array.isArray(programs) ? programs.slice(0, 5).map((p: any) => ({
                    name: p.name || '',
                    level: p.level || 'beginner',
                    currentEnrollment: p.currentEnrollment || p.enrolled || 0,
                    capacity: p.capacity || 0,
                    duration: p.duration || 0
                })) : [],
                performanceMetrics: {
                    studentSatisfaction: performance?.studentSatisfactionRating || 0,
                    classCompletion: performance?.classesCompleted && performance?.classesAssigned
                        ? Math.round((performance.classesCompleted / performance.classesAssigned) * 100) : 0,
                    skillImprovement: performance?.skillAssessmentScore || 0,
                    attendanceConsistency: performance?.attendanceRate || attendanceStats?.occupancyRate || 0
                }
            }
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    // ==================== STUDENTS ====================

    async getMyStudents(coachId: string): Promise<CoachStudent[]> {
        try {
            // Try to get students enrolled in coach's classes
            const [schedulesRes, attendanceRes] = await Promise.allSettled([
                apiClient.get<any>('/scheduling', { params: { coachId, limit: 50 } }),
                apiClient.get<any>('/attendance/records', { params: { limit: 100 } })
            ])

            // Get unique students from schedules and attendance
            const schedules = schedulesRes.status === 'fulfilled'
                ? (schedulesRes.value as any)?.data?.schedules || []
                : []
            const attendance = attendanceRes.status === 'fulfilled'
                ? (attendanceRes.value as any)?.data || []
                : []

            // Extract student info from attendance records
            const studentMap = new Map<string, CoachStudent>()

            if (Array.isArray(attendance)) {
                attendance.forEach((record: any) => {
                    if (record.studentId && !studentMap.has(record.studentId)) {
                        studentMap.set(record.studentId, {
                            id: record.studentId,
                            name: record.studentName || `Student ${record.studentId.slice(-4)}`,
                            email: record.studentEmail || '',
                            phone: record.studentPhone || '',
                            level: record.level || 'beginner',
                            joinDate: record.enrollmentDate || record.createdAt || new Date().toISOString(),
                            classes: 0,
                            attendance: 0,
                            progress: 0,
                            skills: record.skills || [],
                            rating: record.rating || 0
                        })
                    }
                })
            }

            return Array.from(studentMap.values())
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    // ==================== SCHEDULE ====================

    async getSchedules(coachId: string, params?: { dateFrom?: string; dateTo?: string }): Promise<CoachScheduleItem[]> {
        try {
            const response = await apiClient.get<any>('/scheduling', {
                params: { coachId, ...params, limit: 50 }
            })
            const schedules = response?.data?.schedules || response?.schedules || []
            return Array.isArray(schedules) ? schedules.map((s: any) => ({
                id: s._id || s.id,
                className: s.className || s.name || 'Class',
                date: s.date || '',
                time: s.startTime ? `${s.startTime} - ${s.endTime}` : '',
                startTime: s.startTime || '',
                endTime: s.endTime || '',
                location: s.location || s.roomId || 'TBD',
                level: s.level || 'beginner',
                enrolledStudents: s.enrolled || s.enrolledStudents || 0,
                capacity: s.capacity || 0,
                duration: s.duration || 60,
                status: s.status || 'active'
            })) : []
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async createSchedule(data: any): Promise<any> {
        try {
            const response = await apiClient.post<any>('/scheduling', data)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async updateSchedule(id: string, data: any): Promise<any> {
        try {
            const response = await apiClient.put<any>(`/scheduling/${id}`, data)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async deleteSchedule(id: string): Promise<any> {
        try {
            const response = await apiClient.delete<any>(`/scheduling/${id}`)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    // ==================== AVAILABILITY ====================

    async getAvailability(coachId: string): Promise<CoachAvailability> {
        try {
            const response = await apiClient.get<any>(`/staff/${coachId}`)
            const staff = response?.data || response
            const availability: CoachAvailability = {}
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

            if (staff?.weeklyAvailability && Array.isArray(staff.weeklyAvailability)) {
                staff.weeklyAvailability.forEach((slot: any) => {
                    const dayName = days[slot.dayOfWeek] || days[0]
                    availability[dayName] = {
                        start: slot.startTime || '09:00',
                        end: slot.endTime || '17:00',
                        available: slot.isAvailable !== false
                    }
                })
            }

            // Fill in missing days with defaults
            days.forEach(day => {
                if (!availability[day]) {
                    availability[day] = {
                        start: day === 'sunday' ? '' : '09:00',
                        end: day === 'sunday' ? '' : '17:00',
                        available: day !== 'sunday'
                    }
                }
            })

            return availability
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async saveAvailability(coachId: string, availability: CoachAvailability): Promise<any> {
        try {
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            const weeklyAvailability = days.map((day, index) => ({
                dayOfWeek: index,
                startTime: availability[day]?.start || '',
                endTime: availability[day]?.end || '',
                isAvailable: availability[day]?.available || false
            }))

            const response = await apiClient.put<any>(`/staff/availability`, {
                staffId: coachId,
                weeklyAvailability
            })
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    // ==================== FEEDBACK ====================

    async getFeedbackHistory(coachId: string): Promise<CoachFeedback[]> {
        try {
            const response = await apiClient.get<any>('/staff/reports/feedback', {
                params: { coachId, limit: 50 }
            })
            const feedbacks = response?.data || response || []
            return Array.isArray(feedbacks) ? feedbacks.map((f: any) => ({
                id: f._id || f.id,
                studentId: f.studentId || '',
                studentName: f.studentName || '',
                coachId: f.coachId || coachId,
                date: f.date || f.createdAt || new Date().toISOString(),
                rating: f.rating || 0,
                text: f.text || f.message || f.feedback || '',
                type: (f.rating >= 4 ? 'positive' : 'constructive') as 'positive' | 'constructive'
            })) : []
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async sendFeedback(data: {
        studentId: string
        coachId: string
        rating: number
        text: string
        type: string
    }): Promise<any> {
        try {
            const response = await apiClient.post<any>('/staff/reports/feedback', data)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async deleteFeedback(feedbackId: string): Promise<any> {
        try {
            const response = await apiClient.delete<any>(`/staff/reports/feedback/${feedbackId}`)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    // ==================== PROFILE ====================

    async getProfile(coachId: string): Promise<CoachProfile> {
        try {
            const response = await apiClient.get<any>(`/staff/${coachId}`)
            const staff = response?.data || response

            return {
                id: staff?._id || staff?.id || coachId,
                staffId: staff?.staffId || '',
                name: staff?.personalInfo
                    ? `${staff.personalInfo.firstName || ''} ${staff.personalInfo.lastName || ''}`.trim()
                    : staff?.name || '',
                firstName: staff?.personalInfo?.firstName || '',
                lastName: staff?.personalInfo?.lastName || '',
                email: staff?.contactInfo?.email || staff?.email || '',
                phone: staff?.contactInfo?.phone || staff?.phone || '',
                location: staff?.contactInfo?.address
                    ? `${staff.contactInfo.address.city || ''}, ${staff.contactInfo.address.country || ''}`.trim()
                    : staff?.location || '',
                bio: staff?.notes || staff?.bio || '',
                specializations: staff?.specializations || [],
                certifications: (staff?.certifications || []).map((c: any) => ({
                    name: c.name || '',
                    status: c.status || 'valid',
                    issuingOrganization: c.issuingOrganization || '',
                    expiryDate: c.expiryDate || ''
                })),
                skills: staff?.skills || [],
                experienceYears: staff?.experienceYears || 0,
                rating: staff?.performanceMetrics?.[0]?.studentSatisfactionRating || 0,
                totalStudents: staff?.performanceMetrics?.[0]?.classesAssigned || 0,
                totalClasses: staff?.performanceMetrics?.[0]?.classesCompleted || 0,
                status: staff?.status || 'active'
            }
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async updateProfile(coachId: string, data: Partial<{
        personalInfo: { firstName: string; lastName: string }
        contactInfo: { email: string; phone: string; address: any }
        notes: string
        specializations: string[]
        skills: string[]
    }>): Promise<any> {
        try {
            const response = await apiClient.put<any>(`/staff/${coachId}`, data)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    // ==================== REPORTS ====================

    async getReportData(coachId: string, type: string, dateRange: string): Promise<CoachReportData> {
        try {
            const [schedulesRes, attendanceRes, performanceRes] = await Promise.allSettled([
                apiClient.get<any>('/scheduling', { params: { coachId, limit: 100 } }),
                apiClient.get<any>('/attendance/statistics'),
                apiClient.get<any>(`/staff/${coachId}/performance`)
            ])

            const schedules = schedulesRes.status === 'fulfilled'
                ? (schedulesRes.value as any)?.data?.schedules || []
                : []
            const attendance = attendanceRes.status === 'fulfilled'
                ? (attendanceRes.value as any)?.data || {}
                : {}
            const performance = performanceRes.status === 'fulfilled'
                ? (performanceRes.value as any)?.data || {}
                : {}

            const totalClasses = Array.isArray(schedules) ? schedules.length : 0

            // Calculate class distribution
            const levelCounts: Record<string, number> = {}
            if (Array.isArray(schedules)) {
                schedules.forEach((s: any) => {
                    const level = s.level || 'unknown'
                    levelCounts[level] = (levelCounts[level] || 0) + 1
                })
            }

            const classDistribution = Object.entries(levelCounts).map(([name, count]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                count,
                percentage: totalClasses > 0 ? Math.round((count / totalClasses) * 100) : 0
            }))

            return {
                totalClasses,
                totalStudents: performance?.totalStudents || attendance?.totalRecords || 0,
                avgAttendance: attendance?.occupancyRate || performance?.attendanceRate || 0,
                avgRating: performance?.studentSatisfactionRating || 0,
                classDistribution,
                studentProgress: [],
                attendanceByDay: [],
                performanceMetrics: [
                    { metric: 'Student Satisfaction', value: performance?.studentSatisfactionRating || 0 },
                    { metric: 'Class Completion Rate', value: performance?.classesCompleted && performance?.classesAssigned
                        ? Math.round((performance.classesCompleted / performance.classesAssigned) * 100) : 0 },
                    { metric: 'Skill Improvement', value: performance?.skillAssessmentScore || 0 },
                    { metric: 'Attendance Consistency', value: performance?.attendanceRate || attendance?.occupancyRate || 0 }
                ]
            }
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
            const response = await apiClient.post<any>('/attendance/record', data)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }
}

export const coachService = new CoachService()
export default CoachService
