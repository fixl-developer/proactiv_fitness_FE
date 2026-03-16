import axios from 'axios'

// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor for adding auth tokens
api.interceptors.request.use(
    (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('authToken')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// API endpoints
export const apiEndpoints = {
    // Programs
    getPrograms: () => api.get('/programs'),
    getProgram: (id) => api.get(`/programs/${id}`),

    // Team
    getTeamMembers: () => api.get('/team'),
    getTeamMember: (id) => api.get(`/team/${id}`),

    // Testimonials
    getTestimonials: () => api.get('/testimonials'),

    // Locations
    getLocations: () => api.get('/locations'),
    getLocation: (id) => api.get(`/locations/${id}`),

    // Bookings
    bookTrial: (data) => api.post('/bookings/trial', data),
    bookAssessment: (data) => api.post('/bookings/assessment', data),
    bookParty: (data) => api.post('/bookings/party', data),

    // Contact
    submitContact: (data) => api.post('/contact', data),

    // Camps
    getCamps: () => api.get('/camps'),
    getCamp: (id) => api.get(`/camps/${id}`),
    bookCamp: (data) => api.post('/camps/book', data),

    // Blog
    getBlogPosts: () => api.get('/blog'),
    getBlogPost: (slug) => api.get(`/blog/${slug}`),

    // Newsletter
    subscribeNewsletter: (email) => api.post('/newsletter/subscribe', { email }),
}

// Helper functions for common operations
export const apiHelpers = {
    // Handle API errors
    handleError: (error) => {
        console.error('API Error:', error)

        if (error.response) {
            // Server responded with error status
            return {
                success: false,
                message: error.response.data?.message || 'An error occurred',
                status: error.response.status,
            }
        } else if (error.request) {
            // Request was made but no response received
            return {
                success: false,
                message: 'Network error. Please check your connection.',
                status: 0,
            }
        } else {
            // Something else happened
            return {
                success: false,
                message: 'An unexpected error occurred',
                status: 0,
            }
        }
    },

    // Format success response
    formatSuccess: (data, message = 'Success') => ({
        success: true,
        message,
        data,
    }),

    // Validate form data
    validateBookingForm: (data) => {
        const errors = {}

        if (!data.name?.trim()) errors.name = 'Name is required'
        if (!data.email?.trim()) errors.email = 'Email is required'
        if (!data.phone?.trim()) errors.phone = 'Phone is required'
        if (!data.program) errors.program = 'Program selection is required'

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (data.email && !emailRegex.test(data.email)) {
            errors.email = 'Please enter a valid email address'
        }

        // Phone validation (basic)
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/
        if (data.phone && !phoneRegex.test(data.phone)) {
            errors.phone = 'Please enter a valid phone number'
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        }
    },

    // Format date for API
    formatDate: (date) => {
        if (!date) return null
        return new Date(date).toISOString().split('T')[0]
    },

    // Parse API date
    parseDate: (dateString) => {
        if (!dateString) return null
        return new Date(dateString)
    },
}

// Mock data for development (remove when backend is ready)
export const mockData = {
    programs: [
        {
            id: 1,
            name: 'Beginner Gymnastics',
            description: 'Perfect introduction to gymnastics for young children',
            ageGroup: '3-6 years',
            duration: '45 minutes',
            price: 'HK$800/month',
            schedule: ['Monday 4:00 PM', 'Wednesday 4:00 PM', 'Saturday 10:00 AM'],
        },
        {
            id: 2,
            name: 'Intermediate Gymnastics',
            description: 'Building on fundamental skills with more advanced techniques',
            ageGroup: '7-12 years',
            duration: '60 minutes',
            price: 'HK$1000/month',
            schedule: ['Tuesday 5:00 PM', 'Thursday 5:00 PM', 'Saturday 11:00 AM'],
        },
    ],

    teamMembers: [
        {
            id: 1,
            name: 'Sarah Johnson',
            role: 'Head Coach & Director',
            specialization: 'Competitive Gymnastics',
            experience: '15+ years',
            bio: 'Former national team gymnast with extensive coaching experience...',
            certifications: ['Level 4 Coach', 'Safety Certified'],
            image: '/images/team/sarah-johnson.jpg',
        },
    ],

    testimonials: [
        {
            id: 1,
            name: 'Jennifer Wong',
            role: 'Parent',
            rating: 5,
            text: 'My daughter has been attending ProActive Sports for over two years...',
            program: 'School Gymnastics Program',
            location: 'Cyberport',
        },
    ],
}

export default api