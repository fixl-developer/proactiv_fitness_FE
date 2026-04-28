import { apiClient } from '../api/client'

interface Program {
    id: string
    name: string
    description: string
    category: string
    ageGroup: string
    level: 'beginner' | 'intermediate' | 'advanced'
    duration: number
    capacity: number
    price: number
    status: 'active' | 'inactive'
}

interface Schedule {
    id: string
    programId: string
    locationId: string
    roomId: string
    coachId: string
    dayOfWeek: number
    startTime: string
    endTime: string
    startDate: string
    endDate: string
    status: 'active' | 'inactive'
}

interface Rule {
    id: string
    name: string
    type: 'enrollment' | 'scheduling' | 'payment' | 'attendance'
    condition: string
    action: string
    priority: number
    status: 'active' | 'inactive'
}

class ProgramService {
    // ==================== PROGRAMS ====================

    /**
     * Get all programs
     */
    async getAllPrograms(filters?: any): Promise<Program[]> {
        try {
            const response = await apiClient.get<any>('/programs', { params: filters })
            return response?.data || response || []
        } catch (error) {
            console.error('Error fetching programs:', error)
            throw error
        }
    }

    /**
     * Get program by ID
     */
    async getProgramById(programId: string): Promise<Program> {
        try {
            const response = await apiClient.get<any>(`/admin/programs/catalog/${programId}`)
            return response?.data || response
        } catch (error) {
            console.error('Error fetching program:', error)
            throw error
        }
    }

    /**
     * Create program
     */
    async createProgram(programData: Omit<Program, 'id'>): Promise<Program> {
        try {
            const response = await apiClient.post<any>('/admin/programs/catalog', programData)
            return response?.data || response
        } catch (error) {
            console.error('Error creating program:', error)
            throw error
        }
    }

    /**
     * Update program
     */
    async updateProgram(programId: string, programData: Partial<Program>): Promise<Program> {
        try {
            const response = await apiClient.put<any>(`/admin/programs/catalog/${programId}`, programData)
            return response?.data || response
        } catch (error) {
            console.error('Error updating program:', error)
            throw error
        }
    }

    /**
     * Delete program
     */
    async deleteProgram(programId: string): Promise<void> {
        try {
            await apiClient.delete(`/admin/programs/catalog/${programId}`)
        } catch (error) {
            console.error('Error deleting program:', error)
            throw error
        }
    }

    // ==================== SCHEDULES ====================

    /**
     * Get all schedules
     */
    async getAllSchedules(filters?: any): Promise<Schedule[]> {
        try {
            const response = await apiClient.get('/admin/programs/schedule', { params: filters })
            return response?.data || response
        } catch (error) {
            console.error('Error fetching schedules:', error)
            throw error
        }
    }

    /**
     * Get schedule by ID
     */
    async getScheduleById(scheduleId: string): Promise<Schedule> {
        try {
            const response = await apiClient.get(`/admin/programs/schedule/${scheduleId}`)
            return response?.data || response
        } catch (error) {
            console.error('Error fetching schedule:', error)
            throw error
        }
    }

    /**
     * Create schedule
     */
    async createSchedule(scheduleData: Omit<Schedule, 'id'>): Promise<Schedule> {
        try {
            const response = await apiClient.post('/admin/programs/schedule', scheduleData)
            return response?.data || response
        } catch (error) {
            console.error('Error creating schedule:', error)
            throw error
        }
    }

    /**
     * Update schedule
     */
    async updateSchedule(scheduleId: string, scheduleData: Partial<Schedule>): Promise<Schedule> {
        try {
            const response = await apiClient.put(`/admin/programs/schedule/${scheduleId}`, scheduleData)
            return response?.data || response
        } catch (error) {
            console.error('Error updating schedule:', error)
            throw error
        }
    }

    /**
     * Delete schedule
     */
    async deleteSchedule(scheduleId: string): Promise<void> {
        try {
            await apiClient.delete(`/admin/programs/schedule/${scheduleId}`)
        } catch (error) {
            console.error('Error deleting schedule:', error)
            throw error
        }
    }

    /**
     * Check schedule conflicts
     */
    async checkScheduleConflicts(scheduleData: Partial<Schedule>): Promise<any> {
        try {
            const response = await apiClient.post('/admin/programs/schedule/check-conflicts', scheduleData)
            return response?.data || response
        } catch (error) {
            console.error('Error checking schedule conflicts:', error)
            throw error
        }
    }

    // ==================== RULES ENGINE ====================

    /**
     * Get all rules
     */
    async getAllRules(type?: string): Promise<Rule[]> {
        try {
            const response = await apiClient.get('/admin/programs/rules', { params: { type } })
            return response?.data || response
        } catch (error) {
            console.error('Error fetching rules:', error)
            throw error
        }
    }

    /**
     * Get rule by ID
     */
    async getRuleById(ruleId: string): Promise<Rule> {
        try {
            const response = await apiClient.get(`/admin/programs/rules/${ruleId}`)
            return response?.data || response
        } catch (error) {
            console.error('Error fetching rule:', error)
            throw error
        }
    }

    /**
     * Create rule
     */
    async createRule(ruleData: Omit<Rule, 'id'>): Promise<Rule> {
        try {
            const response = await apiClient.post('/admin/programs/rules', ruleData)
            return response?.data || response
        } catch (error) {
            console.error('Error creating rule:', error)
            throw error
        }
    }

    /**
     * Update rule
     */
    async updateRule(ruleId: string, ruleData: Partial<Rule>): Promise<Rule> {
        try {
            const response = await apiClient.put(`/admin/programs/rules/${ruleId}`, ruleData)
            return response?.data || response
        } catch (error) {
            console.error('Error updating rule:', error)
            throw error
        }
    }

    /**
     * Delete rule
     */
    async deleteRule(ruleId: string): Promise<void> {
        try {
            await apiClient.delete(`/admin/programs/rules/${ruleId}`)
        } catch (error) {
            console.error('Error deleting rule:', error)
            throw error
        }
    }

    /**
     * Test rule
     */
    async testRule(ruleId: string, testData: any): Promise<any> {
        try {
            const response = await apiClient.post(`/admin/programs/rules/${ruleId}/test`, testData)
            return response?.data || response
        } catch (error) {
            console.error('Error testing rule:', error)
            throw error
        }
    }
}

export const programService = new ProgramService()
export default programService
