/**
 * Business Configuration Service
 * Handles all business config-related API calls for admin dashboard
 *
 * Response shape normalization:
 * Backend returns { success, message, data, timestamp } for all endpoints.
 * apiClient.get() returns the body directly.
 *
 * For list endpoints (getAll), we unwrap backend's `data` array and expose it as
 * `response.data`, and also attach a `pagination` shape that pages expect
 * (even if backend doesn't support real pagination yet — we fake it client-side
 * so UI binding keeps working).
 *
 * For single-item endpoints (getById, create, update), we unwrap backend's `data`
 * object and return it directly so pages can use `response.id`, `response.name`, etc.
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

export interface ListResponse<T> {
    data: T[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

// =============================================
// HELPERS
// =============================================

/**
 * Normalize a Mongoose-style document to a UI-friendly object with `id`
 * (some backends return `_id`, others return `id`).
 */
function normalizeItem<T extends { id?: string; _id?: string }>(item: any): T {
    if (!item || typeof item !== 'object') return item
    if (!item.id && item._id) {
        return { ...item, id: String(item._id) } as T
    }
    return item as T
}

function normalizeList<T extends { id?: string; _id?: string }>(items: any): T[] {
    if (!Array.isArray(items)) return []
    return items.map(normalizeItem) as T[]
}

/**
 * Unwrap the backend body and build a consistent ListResponse shape.
 * Backend returns: { success, message, data: array | { items, total, ... }, timestamp }
 * Pages expect: { data: array, pagination: { page, limit, total, totalPages } }
 *
 * If backend supports pagination it will return an object with `items` or similar
 * fields; otherwise we fall back to client-side pagination of the full array.
 */
function unwrapListResponse<T extends { id?: string; _id?: string }>(
    body: any,
    params?: { page?: number; limit?: number }
): ListResponse<T> {
    const page = params?.page || 1
    const limit = params?.limit || 10

    // Body can be the array directly (if backend is bare) or { data: [...] }
    const payload = body?.data !== undefined ? body.data : body

    if (Array.isArray(payload)) {
        // Client-side pagination over full list
        const total = payload.length
        const start = (page - 1) * limit
        const items = payload.slice(start, start + limit)
        return {
            data: normalizeList<T>(items),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
        }
    }

    // Payload is an object — look for common pagination shapes
    if (payload && typeof payload === 'object') {
        const items = payload.items || payload.data || payload.results || []
        return {
            data: normalizeList<T>(items),
            pagination: {
                page: payload.page ?? page,
                limit: payload.limit ?? limit,
                total: payload.total ?? items.length,
                totalPages: payload.totalPages ?? Math.max(1, Math.ceil((payload.total ?? items.length) / limit)),
            },
        }
    }

    return {
        data: [],
        pagination: { page, limit, total: 0, totalPages: 1 },
    }
}

/** Unwrap a single-item response: body.data if present, else body itself. */
function unwrapItemResponse<T extends { id?: string; _id?: string }>(body: any): T {
    const payload = body?.data !== undefined ? body.data : body
    return normalizeItem<T>(payload)
}

// =============================================
// COUNTRIES & REGIONS SERVICE
// =============================================

export const CountryService = {
    getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<ListResponse<Country>> => {
        const body = await apiClient.get('/countries', { params })
        return unwrapListResponse<Country>(body, params)
    },

    getById: async (id: string): Promise<Country> => {
        const body = await apiClient.get(`/countries/${id}`)
        return unwrapItemResponse<Country>(body)
    },

    create: async (data: Partial<Country>): Promise<Country> => {
        const body = await apiClient.post('/countries', data)
        return unwrapItemResponse<Country>(body)
    },

    update: async (id: string, data: Partial<Country>): Promise<Country> => {
        const body = await apiClient.put(`/countries/${id}`, data)
        return unwrapItemResponse<Country>(body)
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/countries/${id}`)
    },
}

// =============================================
// BUSINESS UNITS SERVICE
// =============================================

export const BusinessUnitService = {
    getAll: async (params?: { page?: number; limit?: number; search?: string; countryId?: string }): Promise<ListResponse<BusinessUnit>> => {
        const body = await apiClient.get('/business-units', { params })
        return unwrapListResponse<BusinessUnit>(body, params)
    },

    getById: async (id: string): Promise<BusinessUnit> => {
        const body = await apiClient.get(`/business-units/${id}`)
        return unwrapItemResponse<BusinessUnit>(body)
    },

    create: async (data: Partial<BusinessUnit>): Promise<BusinessUnit> => {
        const body = await apiClient.post('/business-units', data)
        return unwrapItemResponse<BusinessUnit>(body)
    },

    update: async (id: string, data: Partial<BusinessUnit>): Promise<BusinessUnit> => {
        const body = await apiClient.put(`/business-units/${id}`, data)
        return unwrapItemResponse<BusinessUnit>(body)
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/business-units/${id}`)
    },
}

// =============================================
// LOCATIONS SERVICE
// =============================================

/**
 * Backend stores location as nested { address: {...}, contactInfo: {...} }.
 * Flatten to the shape pages use: address (street), city, state, country,
 * postalCode, email, phone. Keep the original nested objects too so callers
 * that want them still have access.
 */
function flattenLocation(loc: any): any {
    if (!loc || typeof loc !== 'object') return loc
    const addr = loc.address || {}
    const contact = loc.contactInfo || {}
    return {
        ...loc,
        address: typeof loc.address === 'string' ? loc.address : (addr.street || ''),
        city: addr.city || loc.city || '',
        state: addr.state || loc.state || '',
        country: addr.country || loc.country || '',
        postalCode: addr.postalCode || loc.postalCode || '',
        email: contact.email || loc.email || '',
        phone: contact.phone || loc.phone || '',
        isActive: loc.isActive ?? (loc.status ? loc.status === 'ACTIVE' : true),
    }
}

export const LocationService = {
    getAll: async (params?: { page?: number; limit?: number; search?: string; businessUnitId?: string }): Promise<ListResponse<Location>> => {
        const body = await apiClient.get('/locations', { params })
        const listResponse = unwrapListResponse<Location>(body, params)
        listResponse.data = listResponse.data.map(flattenLocation) as Location[]
        return listResponse
    },

    getById: async (id: string): Promise<Location> => {
        const body = await apiClient.get(`/locations/${id}`)
        return flattenLocation(unwrapItemResponse<Location>(body)) as Location
    },

    // Create — transforms flat frontend payload to backend's nested structure.
    // Backend requires: name, code, businessUnitId, countryId, address{street,city,postalCode,country}, contactInfo{email,phone}, capacity, operatingHours.
    create: async (data: Partial<Location> & { code?: string; countryId?: string; regionId?: string; address?: any; contactInfo?: any; operatingHours?: any }): Promise<Location> => {
        const d: any = data
        const payload: any = {
            name: d.name,
            code: d.code || (d.name || '').toUpperCase().replace(/\s+/g, '-').slice(0, 20),
            businessUnitId: d.businessUnitId,
            countryId: d.countryId,
            capacity: Number(d.capacity) || 1,
            facilities: d.facilities,
            isActive: d.isActive,
        }
        if (d.regionId) payload.regionId = d.regionId
        // Address: flat → nested if a string was passed (legacy forms)
        if (typeof d.address === 'string') {
            payload.address = {
                street: d.address,
                city: d.city || '',
                state: d.state || '',
                postalCode: d.postalCode || '',
                country: d.country || '',
            }
        } else if (d.address) {
            payload.address = d.address
        }
        // ContactInfo
        payload.contactInfo = d.contactInfo || { email: d.email || '', phone: d.phone || '' }
        // Operating hours default (backend requires it)
        payload.operatingHours = d.operatingHours || {
            monday: { open: '09:00', close: '17:00', closed: false },
            tuesday: { open: '09:00', close: '17:00', closed: false },
            wednesday: { open: '09:00', close: '17:00', closed: false },
            thursday: { open: '09:00', close: '17:00', closed: false },
            friday: { open: '09:00', close: '17:00', closed: false },
            saturday: { open: '10:00', close: '14:00', closed: false },
            sunday: { open: '10:00', close: '14:00', closed: true },
        }
        const body = await apiClient.post('/locations', payload)
        return unwrapItemResponse<Location>(body)
    },

    update: async (id: string, data: Partial<Location> & { code?: string; countryId?: string; address?: any; contactInfo?: any }): Promise<Location> => {
        const d: any = data
        const payload: any = {}
        if (d.name) payload.name = d.name
        if (d.code) payload.code = d.code
        if (d.countryId) payload.countryId = d.countryId
        if (d.businessUnitId) payload.businessUnitId = d.businessUnitId
        if (typeof d.address === 'string') {
            payload.address = {
                street: d.address, city: d.city || '', state: d.state || '',
                postalCode: d.postalCode || '', country: d.country || '',
            }
        } else if (d.address) {
            payload.address = d.address
        }
        if (d.email || d.phone) {
            payload.contactInfo = { email: d.email || '', phone: d.phone || '' }
        }
        if (d.capacity !== undefined) payload.capacity = Number(d.capacity)
        if (d.facilities) payload.facilities = d.facilities
        if (d.isActive !== undefined) payload.isActive = d.isActive
        const body = await apiClient.put(`/locations/${id}`, payload)
        return unwrapItemResponse<Location>(body)
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/locations/${id}`)
    },
}

// =============================================
// TERMS & HOLIDAYS SERVICE
// =============================================

/**
 * Backend Term schema has no `holidays[]` field — holidays are tracked on a
 * separate HolidayCalendar model referenced via `holidayCalendarId`. To keep
 * the existing Term form usable while holiday-calendar UX doesn't exist yet,
 * we stash any holidays the admin adds in `metadata.holidays` so they round-trip.
 */
function flattenTerm(term: any): any {
    if (!term || typeof term !== 'object') return term
    const holidays = Array.isArray(term.metadata?.holidays) ? term.metadata.holidays : []
    return { ...term, holidays }
}

function buildTermPayload(data: any, isUpdate = false): any {
    const payload: any = {}
    if (data.name !== undefined) payload.name = data.name
    const derivedCode = data.code && data.code.trim()
        ? data.code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '')
        : ((data.name || '').toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 20))
    if (!isUpdate || data.code !== undefined) {
        if (derivedCode) payload.code = derivedCode
    }
    if (data.businessUnitId) payload.businessUnitId = data.businessUnitId
    if (data.locationId) payload.locationId = data.locationId
    if (data.startDate) payload.startDate = data.startDate
    if (data.endDate) payload.endDate = data.endDate
    if (data.isActive !== undefined) payload.isActive = data.isActive
    if (data.allowEnrollment !== undefined) payload.allowEnrollment = data.allowEnrollment
    if (data.pricingMultiplier !== undefined) payload.pricingMultiplier = Number(data.pricingMultiplier)
    if (Array.isArray(data.holidays)) {
        payload.metadata = { ...(data.metadata || {}), holidays: data.holidays }
    }
    return payload
}

export const TermService = {
    getAll: async (params?: { page?: number; limit?: number; search?: string; locationId?: string }): Promise<ListResponse<Term>> => {
        const body = await apiClient.get('/terms', { params })
        const listResponse = unwrapListResponse<Term>(body, params)
        listResponse.data = listResponse.data.map(flattenTerm) as Term[]
        return listResponse
    },

    getById: async (id: string): Promise<Term> => {
        const body = await apiClient.get(`/terms/${id}`)
        return flattenTerm(unwrapItemResponse<Term>(body)) as Term
    },

    create: async (data: Partial<Term> & { code?: string; businessUnitId?: string }): Promise<Term> => {
        const payload = buildTermPayload(data, false)
        const body = await apiClient.post('/terms', payload)
        return flattenTerm(unwrapItemResponse<Term>(body)) as Term
    },

    update: async (id: string, data: Partial<Term> & { code?: string; businessUnitId?: string }): Promise<Term> => {
        const payload = buildTermPayload(data, true)
        const body = await apiClient.put(`/terms/${id}`, payload)
        return flattenTerm(unwrapItemResponse<Term>(body)) as Term
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/terms/${id}`)
    },
}

// =============================================
// PAYMENT GATEWAYS SERVICE
// =============================================

export const PaymentGatewayService = {
    getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<ListResponse<PaymentGateway>> => {
        const body = await apiClient.get('/payment-gateways', { params })
        return unwrapListResponse<PaymentGateway>(body, params)
    },

    getById: async (id: string): Promise<PaymentGateway> => {
        const body = await apiClient.get(`/payment-gateways/${id}`)
        return unwrapItemResponse<PaymentGateway>(body)
    },

    create: async (data: Partial<PaymentGateway>): Promise<PaymentGateway> => {
        const body = await apiClient.post('/payment-gateways', data)
        return unwrapItemResponse<PaymentGateway>(body)
    },

    update: async (id: string, data: Partial<PaymentGateway>): Promise<PaymentGateway> => {
        const body = await apiClient.put(`/payment-gateways/${id}`, data)
        return unwrapItemResponse<PaymentGateway>(body)
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/payment-gateways/${id}`)
    },

    test: async (id: string): Promise<any> => {
        const body = await apiClient.post(`/payment-gateways/${id}/test`)
        return unwrapItemResponse<any>(body)
    },
}

export default {
    CountryService,
    BusinessUnitService,
    LocationService,
    TermService,
    PaymentGatewayService,
}
