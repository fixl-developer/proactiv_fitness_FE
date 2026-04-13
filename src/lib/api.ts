// Re-export unified API client
import { apiClient } from '@/services/api/client'
export { apiClient }

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'
export { API_BASE_URL }

// Team API Functions
export const teamAPI = {
    // Get all team members
    getAll: async (params: { program?: string; limit?: number } = {}) => {
        const queryParams = new URLSearchParams();
        if (params.program) queryParams.append('program', params.program);
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const endpoint = `/team${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return apiClient.get(endpoint);
    },

    // Get team member by ID
    getById: async (id: string) => {
        return apiClient.get(`/team/${id}`);
    },

    // Get team members by program
    getByProgram: async (program: string) => {
        return apiClient.get(`/team/program/${program}`);
    },

    // Get available coaches
    getAvailableCoaches: async (date: string, timeSlot: string, program: string) => {
        return apiClient.get(`/team/available/${date}/${timeSlot}/${program}`);
    }
};

// Booking API Functions
export const bookingAPI = {
    // Create assessment booking
    createAssessment: async (bookingData: {
        program: string;
        childName: string;
        childAge: string;
        childGender?: string;
        location: string;
        date: string;
        timeSlot: string;
        parentName: string;
        parentEmail: string;
        parentPhone: string;
    }) => {
        return apiClient.post('/bookings/assessment', bookingData);
    },

    // Create trial booking
    createTrial: async (bookingData: {
        program: string;
        childName: string;
        childAge: string;
        childGender?: string;
        location: string;
        date: string;
        timeSlot: string;
        parentName: string;
        parentEmail: string;
        parentPhone: string;
    }) => {
        return apiClient.post('/bookings/trial', bookingData);
    },

    // Get available time slots
    getAvailableSlots: async (date: string, location: string) => {
        return apiClient.get(`/bookings/available-slots/${date}/${location}`);
    },

    // Get booking details
    getBooking: async (bookingId: string) => {
        return apiClient.get(`/bookings/${bookingId}`);
    }
};

// Auth API Functions
export const authAPI = {
    // Login
    login: async (credentials: { email: string; password: string }) => {
        return apiClient.post('/auth/login', credentials);
    },

    // Register
    register: async (userData: {
        name: string;
        email: string;
        password: string;
        phone?: string;
    }) => {
        return apiClient.post('/auth/register', userData);
    },

    // Get current user
    getCurrentUser: async () => {
        return apiClient.get('/auth/me');
    }
};

// Health check function
export const healthCheck = async () => {
    try {
        return await apiClient.get('/health');
    } catch (error) {
        throw new Error('Backend server is not responding');
    }
};

// Legacy API object for backward compatibility
export const api = {
    // Team members
    getTeamMembers: teamAPI.getAll,

    // Bookings
    createBooking: bookingAPI.createAssessment,

    // Programs - can be extended later
    getPrograms: async () => {
        // This can be implemented when you add programs API
        return {
            success: true,
            data: [
                { id: 'gymnastics', name: 'Gymnastics', description: 'Build strength and flexibility', ageRange: '3-12 years' },
                { id: 'multi-sports', name: 'Multi-Sports', description: 'Explore various sports', ageRange: '4-10 years' },
                { id: 'camps', name: 'Holiday Camps', description: 'Action-packed camps', ageRange: '5-12 years' }
            ]
        };
    }
};