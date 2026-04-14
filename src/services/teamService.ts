import apiClient from '@/lib/apiClient'

export interface TeamMember {
    id: string
    name: string
    position: string
    experience: string
    specializations: string[]
    certifications: string[]
    bio: string
    profileImage?: string
}

export interface TeamResponse {
    data: TeamMember[]
    total: number
    meta?: any
}

class TeamServiceClass {
    /**
     * Get public team members for display on website
     */
    async getPublicTeam(): Promise<TeamMember[]> {
        try {
            const response = await apiClient.get<TeamResponse>('/api/team/public')
            return response.data || []
        } catch (error) {
            // Silently fail - component will use fallback mock data
            throw error
        }
    }

    /**
     * Get all team members (admin only)
     */
    async getAllTeam(filters?: any): Promise<TeamResponse> {
        try {
            const response = await apiClient.get<TeamResponse>('/api/team', { params: filters })
            return response.data
        } catch (error) {
            console.error('Failed to fetch team:', error)
            throw error
        }
    }

    /**
     * Get team member by ID
     */
    async getTeamMemberById(memberId: string): Promise<TeamMember> {
        try {
            const response = await apiClient.get<{ data: TeamMember }>(`/api/team/${memberId}`)
            return response.data
        } catch (error) {
            console.error('Failed to fetch team member:', error)
            throw error
        }
    }

    /**
     * Create new team member (admin only)
     */
    async createTeamMember(data: Partial<TeamMember>): Promise<TeamMember> {
        try {
            const response = await apiClient.post<{ data: TeamMember }>('/api/team', data)
            return response.data
        } catch (error) {
            console.error('Failed to create team member:', error)
            throw error
        }
    }

    /**
     * Update team member (admin only)
     */
    async updateTeamMember(memberId: string, data: Partial<TeamMember>): Promise<TeamMember> {
        try {
            const response = await apiClient.put<{ data: TeamMember }>(`/api/team/${memberId}`, data)
            return response.data
        } catch (error) {
            console.error('Failed to update team member:', error)
            throw error
        }
    }

    /**
     * Delete team member (admin only)
     */
    async deleteTeamMember(memberId: string): Promise<void> {
        try {
            await apiClient.delete(`/api/team/${memberId}`)
        } catch (error) {
            console.error('Failed to delete team member:', error)
            throw error
        }
    }

    /**
     * Get team members by specialization
     */
    async getTeamBySpecialization(specialization: string): Promise<TeamMember[]> {
        try {
            const response = await apiClient.get<TeamResponse>('/api/team', {
                params: { specialization }
            })
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch team by specialization:', error)
            throw error
        }
    }

    /**
     * Get team statistics
     */
    async getTeamStatistics(): Promise<any> {
        try {
            const response = await apiClient.get('/api/team/statistics')
            return response.data
        } catch (error) {
            console.error('Failed to fetch team statistics:', error)
            throw error
        }
    }
}

export const TeamService = new TeamServiceClass()
