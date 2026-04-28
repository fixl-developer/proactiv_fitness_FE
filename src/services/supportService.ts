/**
 * Support Service
 * Handles all support-related API calls for admin dashboard
 */

import { apiClient } from '@/services/api/client'

// apiClient.get/post/etc already return the response body.
// Backend shape: { success, data, pagination?, message? }
// Pages consume: response.data (array) and response.pagination?.totalPages
// So services must return the FULL body, not body.data.

// =============================================
// INTERFACES
// =============================================

export interface SupportTicket {
    id: string
    title?: string
    subject?: string
    description: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    status: 'open' | 'in_progress' | 'in-progress' | 'resolved' | 'closed'
    assignedTo?: string
    customerId?: string
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
    // Get all support tickets — returns the full body { success, data, pagination }
    getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
        try {
            const body = await apiClient.get('/support/tickets', { params })
            return body
        } catch (error) {
            console.error('Error fetching support tickets:', error)
            throw error
        }
    },

    // Get support ticket by ID
    getById: async (id: string) => {
        try {
            const body = await apiClient.get(`/support/tickets/${id}`)
            return body
        } catch (error) {
            console.error('Error fetching support ticket:', error)
            throw error
        }
    },

    // Create support ticket
    create: async (data: Partial<SupportTicket>) => {
        try {
            const body = await apiClient.post('/support/tickets', data)
            return body
        } catch (error) {
            console.error('Error creating support ticket:', error)
            throw error
        }
    },

    // Update support ticket
    update: async (id: string, data: Partial<SupportTicket>) => {
        try {
            const body = await apiClient.put(`/support/tickets/${id}`, data)
            return body
        } catch (error) {
            console.error('Error updating support ticket:', error)
            throw error
        }
    },

    // Delete support ticket
    delete: async (id: string) => {
        try {
            const body = await apiClient.delete(`/support/tickets/${id}`)
            return body
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
    // Get all knowledge base articles — returns the full body { success, data, pagination }
    // Pass `status: 'all'` for the admin list (so drafts are visible, not just published).
    getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; category?: string }) => {
        try {
            const body = await apiClient.get('/support/knowledge', { params })
            return body
        } catch (error) {
            console.error('Error fetching knowledge base articles:', error)
            throw error
        }
    },

    // Get knowledge base article by ID
    getById: async (id: string) => {
        try {
            const body = await apiClient.get(`/support/knowledge/${id}`)
            return body
        } catch (error) {
            console.error('Error fetching knowledge base article:', error)
            throw error
        }
    },

    // Create knowledge base article
    create: async (data: Partial<KnowledgeBase>) => {
        try {
            const body = await apiClient.post('/support/knowledge', data)
            return body
        } catch (error) {
            console.error('Error creating knowledge base article:', error)
            throw error
        }
    },

    // Update knowledge base article
    update: async (id: string, data: Partial<KnowledgeBase>) => {
        try {
            const body = await apiClient.put(`/support/knowledge/${id}`, data)
            return body
        } catch (error) {
            console.error('Error updating knowledge base article:', error)
            throw error
        }
    },

    // Delete knowledge base article
    delete: async (id: string) => {
        try {
            const body = await apiClient.delete(`/support/knowledge/${id}`)
            return body
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
