/**
 * Support Service
 * Handles all support-related API calls for admin dashboard
 */

import { apiClient } from '@/services/api/client'

// =============================================
// INTERFACES
// =============================================

export interface SupportTicket {
    id: string
    subject: string
    description: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    status: 'open' | 'in-progress' | 'resolved' | 'closed'
    assignedTo?: string
    customerId: string
    createdAt?: string
    updatedAt?: string
}

export interface KnowledgeBase {
    id: string
    title: string
    category: 'faq' | 'guide' | 'troubleshooting' | 'tutorial'
    content: string
    tags?: string[]
    status: 'published' | 'draft' | 'archived'
    views?: number
    createdAt?: string
    updatedAt?: string
}

// =============================================
// SUPPORT TICKETS SERVICE
// =============================================

export const SupportTicketService = {
    // Get all support tickets
    getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
        try {
            const response = await apiClient.get('/api/v1/support/tickets', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching support tickets:', error)
            throw error
        }
    },

    // Get support ticket by ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/api/v1/support/tickets/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching support ticket:', error)
            throw error
        }
    },

    // Create support ticket
    create: async (data: Partial<SupportTicket>) => {
        try {
            const response = await apiClient.post('/api/v1/support/tickets', data)
            return response.data
        } catch (error) {
            console.error('Error creating support ticket:', error)
            throw error
        }
    },

    // Update support ticket
    update: async (id: string, data: Partial<SupportTicket>) => {
        try {
            const response = await apiClient.put(`/api/v1/support/tickets/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating support ticket:', error)
            throw error
        }
    },

    // Delete support ticket
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/api/v1/support/tickets/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting support ticket:', error)
            throw error
        }
    },
}

// =============================================
// KNOWLEDGE BASE SERVICE
// =============================================

export const KnowledgeBaseService = {
    // Get all knowledge base articles
    getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
        try {
            const response = await apiClient.get('/api/v1/support/knowledge', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching knowledge base articles:', error)
            throw error
        }
    },

    // Get knowledge base article by ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/api/v1/support/knowledge/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching knowledge base article:', error)
            throw error
        }
    },

    // Create knowledge base article
    create: async (data: Partial<KnowledgeBase>) => {
        try {
            const response = await apiClient.post('/api/v1/support/knowledge', data)
            return response.data
        } catch (error) {
            console.error('Error creating knowledge base article:', error)
            throw error
        }
    },

    // Update knowledge base article
    update: async (id: string, data: Partial<KnowledgeBase>) => {
        try {
            const response = await apiClient.put(`/api/v1/support/knowledge/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating knowledge base article:', error)
            throw error
        }
    },

    // Delete knowledge base article
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/api/v1/support/knowledge/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting knowledge base article:', error)
            throw error
        }
    },
}

export default {
    SupportTicketService,
    KnowledgeBaseService,
}
