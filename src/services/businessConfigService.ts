/**
 * Business Configuration Service
 * Handles all business config-related API calls for admin dashboard
 */

import { apiClient } from '@/services/api/client'

// =============================================
// INTERFACES
// =============================================

export interface Country {
    id: string
    name: string
    code: string
    currency: string
    timezone: string
    isActive: boolean
    createdAt?: string
    updatedAt?: string
}

export interface BusinessUnit {
    id: string
    name: string
    code: string
    type: string
    countryId: string
    managerId?: string
    isActive: boolean
    createdAt?: string
    updatedAt?: string
}

export interface Location {
    id: string
    name: string
    address: string
    city: string
    state?: string
    country: string
    postalCode?: string
    phone?: string
    email?: string
    businessUnitId?: string
    capacity?: number
    facilities?: string[]
    isActive: boolean
    createdAt?: string
    updatedAt?: string
}

export interface Term {
    id: string
    name: string
    startDate: string
    endDate: string
    locationId?: string
    holidays?: Holiday[]
    isActive: boolean
    createdAt?: string
    updatedAt?: string
}

export interface Holiday {
    id?: string
    name: string
    date: string
    type: string
}

export interface PaymentGateway {
    id: string
    name: string
    provider: string
    apiKey?: string
    secretKey?: string
    webhookUrl?: string
    isActive: boolean
    supportedCurrencies?: string[]
    config?: Record<string, any>
    createdAt?: string
    updatedAt?: string
}

// =============================================
// COUNTRIES & REGIONS SERVICE
// =============================================

export const CountryService = {
    // Get all countries
    getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
        try {
            const response = await apiClient.get('/api/v1/countries', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching countries:', error)
            throw error
        }
    },

    // Get country by ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/api/v1/countries/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching country:', error)
            throw error
        }
    },

    // Create country
    create: async (data: Partial<Country>) => {
        try {
            const response = await apiClient.post('/api/v1/countries', data)
            return response.data
        } catch (error) {
            console.error('Error creating country:', error)
            throw error
        }
    },

    // Update country
    update: async (id: string, data: Partial<Country>) => {
        try {
            const response = await apiClient.put(`/api/v1/countries/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating country:', error)
            throw error
        }
    },

    // Delete country
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/api/v1/countries/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting country:', error)
            throw error
        }
    },
}

// =============================================
// BUSINESS UNITS SERVICE
// =============================================

export const BusinessUnitService = {
    // Get all business units
    getAll: async (params?: { page?: number; limit?: number; search?: string; countryId?: string }) => {
        try {
            const response = await apiClient.get('/api/v1/business-units', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching business units:', error)
            throw error
        }
    },

    // Get business unit by ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/api/v1/business-units/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching business unit:', error)
            throw error
        }
    },

    // Create business unit
    create: async (data: Partial<BusinessUnit>) => {
        try {
            const response = await apiClient.post('/api/v1/business-units', data)
            return response.data
        } catch (error) {
            console.error('Error creating business unit:', error)
            throw error
        }
    },

    // Update business unit
    update: async (id: string, data: Partial<BusinessUnit>) => {
        try {
            const response = await apiClient.put(`/api/v1/business-units/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating business unit:', error)
            throw error
        }
    },

    // Delete business unit
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/api/v1/business-units/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting business unit:', error)
            throw error
        }
    },
}

// =============================================
// LOCATIONS SERVICE
// =============================================

export const LocationService = {
    // Get all locations
    getAll: async (params?: { page?: number; limit?: number; search?: string; businessUnitId?: string }) => {
        try {
            const response = await apiClient.get('/api/v1/locations', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching locations:', error)
            throw error
        }
    },

    // Get location by ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/api/v1/locations/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching location:', error)
            throw error
        }
    },

    // Create location
    create: async (data: Partial<Location>) => {
        try {
            const response = await apiClient.post('/api/v1/locations', data)
            return response.data
        } catch (error) {
            console.error('Error creating location:', error)
            throw error
        }
    },

    // Update location
    update: async (id: string, data: Partial<Location>) => {
        try {
            const response = await apiClient.put(`/api/v1/locations/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating location:', error)
            throw error
        }
    },

    // Delete location
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/api/v1/locations/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting location:', error)
            throw error
        }
    },
}

// =============================================
// TERMS & HOLIDAYS SERVICE
// =============================================

export const TermService = {
    // Get all terms
    getAll: async (params?: { page?: number; limit?: number; search?: string; locationId?: string }) => {
        try {
            const response = await apiClient.get('/api/v1/terms', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching terms:', error)
            throw error
        }
    },

    // Get term by ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/api/v1/terms/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching term:', error)
            throw error
        }
    },

    // Create term
    create: async (data: Partial<Term>) => {
        try {
            const response = await apiClient.post('/api/v1/terms', data)
            return response.data
        } catch (error) {
            console.error('Error creating term:', error)
            throw error
        }
    },

    // Update term
    update: async (id: string, data: Partial<Term>) => {
        try {
            const response = await apiClient.put(`/api/v1/terms/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating term:', error)
            throw error
        }
    },

    // Delete term
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/api/v1/terms/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting term:', error)
            throw error
        }
    },
}

// =============================================
// PAYMENT GATEWAYS SERVICE
// =============================================

export const PaymentGatewayService = {
    // Get all payment gateways
    getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
        try {
            const response = await apiClient.get('/api/v1/payment-gateways', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching payment gateways:', error)
            throw error
        }
    },

    // Get payment gateway by ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/api/v1/payment-gateways/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching payment gateway:', error)
            throw error
        }
    },

    // Create payment gateway
    create: async (data: Partial<PaymentGateway>) => {
        try {
            const response = await apiClient.post('/api/v1/payment-gateways', data)
            return response.data
        } catch (error) {
            console.error('Error creating payment gateway:', error)
            throw error
        }
    },

    // Update payment gateway
    update: async (id: string, data: Partial<PaymentGateway>) => {
        try {
            const response = await apiClient.put(`/api/v1/payment-gateways/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating payment gateway:', error)
            throw error
        }
    },

    // Delete payment gateway
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/api/v1/payment-gateways/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting payment gateway:', error)
            throw error
        }
    },

    // Test payment gateway connection
    test: async (id: string) => {
        try {
            const response = await apiClient.post(`/api/v1/payment-gateways/${id}/test`)
            return response.data
        } catch (error) {
            console.error('Error testing payment gateway:', error)
            throw error
        }
    },
}

export default {
    CountryService,
    BusinessUnitService,
    LocationService,
    TermService,
    PaymentGatewayService,
}
