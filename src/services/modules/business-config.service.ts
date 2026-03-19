import { apiClient } from '../api/client'

interface Region {
    id: string
    name: string
    country: string
    code: string
    timezone: string
    currency: string
    status: 'active' | 'inactive'
}

interface BusinessUnit {
    id: string
    name: string
    description: string
    regionId: string
    managerId: string
    status: 'active' | 'inactive'
}

interface Location {
    id: string
    name: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
    phone: string
    email: string
    businessUnitId: string
    rooms: Room[]
    status: 'active' | 'inactive'
}

interface Room {
    id: string
    name: string
    capacity: number
    type: string
    locationId: string
    status: 'active' | 'inactive'
}

interface Term {
    id: string
    name: string
    startDate: string
    endDate: string
    status: 'active' | 'inactive'
}

interface Holiday {
    id: string
    name: string
    date: string
    type: 'public' | 'company'
    regionId?: string
}

interface PaymentGateway {
    id: string
    name: string
    provider: 'stripe' | 'paypal' | 'square'
    apiKey: string
    secretKey: string
    webhookUrl: string
    status: 'active' | 'inactive'
    isDefault: boolean
}

class BusinessConfigService {
    // ==================== REGIONS ====================

    /**
     * Get all regions
     */
    async getAllRegions(): Promise<Region[]> {
        try {
            const response = await apiClient.get('/admin/business-config/regions')
            return response.data
        } catch (error) {
            console.error('Error fetching regions:', error)
            throw error
        }
    }

    /**
     * Create region
     */
    async createRegion(regionData: Omit<Region, 'id'>): Promise<Region> {
        try {
            const response = await apiClient.post('/admin/business-config/regions', regionData)
            return response.data
        } catch (error) {
            console.error('Error creating region:', error)
            throw error
        }
    }

    /**
     * Update region
     */
    async updateRegion(regionId: string, regionData: Partial<Region>): Promise<Region> {
        try {
            const response = await apiClient.put(`/admin/business-config/regions/${regionId}`, regionData)
            return response.data
        } catch (error) {
            console.error('Error updating region:', error)
            throw error
        }
    }

    /**
     * Delete region
     */
    async deleteRegion(regionId: string): Promise<void> {
        try {
            await apiClient.delete(`/admin/business-config/regions/${regionId}`)
        } catch (error) {
            console.error('Error deleting region:', error)
            throw error
        }
    }

    // ==================== BUSINESS UNITS ====================

    /**
     * Get all business units
     */
    async getAllBusinessUnits(): Promise<BusinessUnit[]> {
        try {
            const response = await apiClient.get('/admin/business-config/units')
            return response.data
        } catch (error) {
            console.error('Error fetching business units:', error)
            throw error
        }
    }

    /**
     * Create business unit
     */
    async createBusinessUnit(unitData: Omit<BusinessUnit, 'id'>): Promise<BusinessUnit> {
        try {
            const response = await apiClient.post('/admin/business-config/units', unitData)
            return response.data
        } catch (error) {
            console.error('Error creating business unit:', error)
            throw error
        }
    }

    /**
     * Update business unit
     */
    async updateBusinessUnit(unitId: string, unitData: Partial<BusinessUnit>): Promise<BusinessUnit> {
        try {
            const response = await apiClient.put(`/admin/business-config/units/${unitId}`, unitData)
            return response.data
        } catch (error) {
            console.error('Error updating business unit:', error)
            throw error
        }
    }

    /**
     * Delete business unit
     */
    async deleteBusinessUnit(unitId: string): Promise<void> {
        try {
            await apiClient.delete(`/admin/business-config/units/${unitId}`)
        } catch (error) {
            console.error('Error deleting business unit:', error)
            throw error
        }
    }

    // ==================== LOCATIONS ====================

    /**
     * Get all locations
     */
    async getAllLocations(): Promise<Location[]> {
        try {
            const response = await apiClient.get('/admin/business-config/locations')
            return response.data
        } catch (error) {
            console.error('Error fetching locations:', error)
            throw error
        }
    }

    /**
     * Create location
     */
    async createLocation(locationData: Omit<Location, 'id' | 'rooms'>): Promise<Location> {
        try {
            const response = await apiClient.post('/admin/business-config/locations', locationData)
            return response.data
        } catch (error) {
            console.error('Error creating location:', error)
            throw error
        }
    }

    /**
     * Update location
     */
    async updateLocation(locationId: string, locationData: Partial<Location>): Promise<Location> {
        try {
            const response = await apiClient.put(`/admin/business-config/locations/${locationId}`, locationData)
            return response.data
        } catch (error) {
            console.error('Error updating location:', error)
            throw error
        }
    }

    /**
     * Delete location
     */
    async deleteLocation(locationId: string): Promise<void> {
        try {
            await apiClient.delete(`/admin/business-config/locations/${locationId}`)
        } catch (error) {
            console.error('Error deleting location:', error)
            throw error
        }
    }

    /**
     * Add room to location
     */
    async addRoom(locationId: string, roomData: Omit<Room, 'id' | 'locationId'>): Promise<Room> {
        try {
            const response = await apiClient.post(`/admin/business-config/locations/${locationId}/rooms`, roomData)
            return response.data
        } catch (error) {
            console.error('Error adding room:', error)
            throw error
        }
    }

    /**
     * Update room
     */
    async updateRoom(locationId: string, roomId: string, roomData: Partial<Room>): Promise<Room> {
        try {
            const response = await apiClient.put(`/admin/business-config/locations/${locationId}/rooms/${roomId}`, roomData)
            return response.data
        } catch (error) {
            console.error('Error updating room:', error)
            throw error
        }
    }

    /**
     * Delete room
     */
    async deleteRoom(locationId: string, roomId: string): Promise<void> {
        try {
            await apiClient.delete(`/admin/business-config/locations/${locationId}/rooms/${roomId}`)
        } catch (error) {
            console.error('Error deleting room:', error)
            throw error
        }
    }

    // ==================== TERMS & HOLIDAYS ====================

    /**
     * Get all terms
     */
    async getAllTerms(): Promise<Term[]> {
        try {
            const response = await apiClient.get('/admin/business-config/terms')
            return response.data
        } catch (error) {
            console.error('Error fetching terms:', error)
            throw error
        }
    }

    /**
     * Create term
     */
    async createTerm(termData: Omit<Term, 'id'>): Promise<Term> {
        try {
            const response = await apiClient.post('/admin/business-config/terms', termData)
            return response.data
        } catch (error) {
            console.error('Error creating term:', error)
            throw error
        }
    }

    /**
     * Update term
     */
    async updateTerm(termId: string, termData: Partial<Term>): Promise<Term> {
        try {
            const response = await apiClient.put(`/admin/business-config/terms/${termId}`, termData)
            return response.data
        } catch (error) {
            console.error('Error updating term:', error)
            throw error
        }
    }

    /**
     * Delete term
     */
    async deleteTerm(termId: string): Promise<void> {
        try {
            await apiClient.delete(`/admin/business-config/terms/${termId}`)
        } catch (error) {
            console.error('Error deleting term:', error)
            throw error
        }
    }

    /**
     * Get all holidays
     */
    async getAllHolidays(): Promise<Holiday[]> {
        try {
            const response = await apiClient.get('/admin/business-config/holidays')
            return response.data
        } catch (error) {
            console.error('Error fetching holidays:', error)
            throw error
        }
    }

    /**
     * Create holiday
     */
    async createHoliday(holidayData: Omit<Holiday, 'id'>): Promise<Holiday> {
        try {
            const response = await apiClient.post('/admin/business-config/holidays', holidayData)
            return response.data
        } catch (error) {
            console.error('Error creating holiday:', error)
            throw error
        }
    }

    /**
     * Delete holiday
     */
    async deleteHoliday(holidayId: string): Promise<void> {
        try {
            await apiClient.delete(`/admin/business-config/holidays/${holidayId}`)
        } catch (error) {
            console.error('Error deleting holiday:', error)
            throw error
        }
    }

    // ==================== PAYMENT GATEWAYS ====================

    /**
     * Get all payment gateways
     */
    async getAllPaymentGateways(): Promise<PaymentGateway[]> {
        try {
            const response = await apiClient.get('/admin/business-config/payment-gateways')
            return response.data
        } catch (error) {
            console.error('Error fetching payment gateways:', error)
            throw error
        }
    }

    /**
     * Create payment gateway
     */
    async createPaymentGateway(gatewayData: Omit<PaymentGateway, 'id'>): Promise<PaymentGateway> {
        try {
            const response = await apiClient.post('/admin/business-config/payment-gateways', gatewayData)
            return response.data
        } catch (error) {
            console.error('Error creating payment gateway:', error)
            throw error
        }
    }

    /**
     * Update payment gateway
     */
    async updatePaymentGateway(gatewayId: string, gatewayData: Partial<PaymentGateway>): Promise<PaymentGateway> {
        try {
            const response = await apiClient.put(`/admin/business-config/payment-gateways/${gatewayId}`, gatewayData)
            return response.data
        } catch (error) {
            console.error('Error updating payment gateway:', error)
            throw error
        }
    }

    /**
     * Delete payment gateway
     */
    async deletePaymentGateway(gatewayId: string): Promise<void> {
        try {
            await apiClient.delete(`/admin/business-config/payment-gateways/${gatewayId}`)
        } catch (error) {
            console.error('Error deleting payment gateway:', error)
            throw error
        }
    }

    /**
     * Set default payment gateway
     */
    async setDefaultPaymentGateway(gatewayId: string): Promise<PaymentGateway> {
        try {
            const response = await apiClient.put(`/admin/business-config/payment-gateways/${gatewayId}/set-default`)
            return response.data
        } catch (error) {
            console.error('Error setting default payment gateway:', error)
            throw error
        }
    }
}

export default new BusinessConfigService()
