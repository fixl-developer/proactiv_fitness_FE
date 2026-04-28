import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/services/api/client'

export interface Location {
    id: string
    _id?: string
    name: string
    code?: string
    address: string
    city: string
    state?: string
    country: string
    postalCode?: string
    phone?: string
    email?: string
    businessUnitId?: string
    countryId?: string
    capacity?: number
    facilities?: string[]
    isActive: boolean
    createdAt?: string
    updatedAt?: string
}

// Fallback locations if API fails
const FALLBACK_LOCATIONS: Location[] = [
    {
        id: 'cyberport-001',
        name: 'Cyberport',
        code: 'CP-01',
        address: 'Shop G01, Cyberport 1, 100 Cyberport Road',
        city: 'Hong Kong',
        country: 'Hong Kong',
        postalCode: '',
        phone: '+852 2234 5678',
        email: 'cyberport@proactivsports.net',
        capacity: 100,
        facilities: ['Gym', 'Pool', 'Parking'],
        isActive: true,
    },
    {
        id: 'wanchai-001',
        name: 'Wan Chai',
        code: 'WC-01',
        address: 'Wan Chai Sports Center, Wan Chai',
        city: 'Hong Kong',
        country: 'Hong Kong',
        postalCode: '',
        phone: '+852 2234 5679',
        email: 'wanchai@proactivsports.net',
        capacity: 80,
        facilities: ['Gym', 'Parking'],
        isActive: true,
    },
]

export function useLocations() {
    const [locations, setLocations] = useState<Location[]>(FALLBACK_LOCATIONS)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchLocations = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await apiClient.get('/admin/business-config/locations', {
                params: { limit: 100 }
            })

            const data = response?.data?.data || response?.data || []

            if (Array.isArray(data) && data.length > 0) {
                setLocations(data)
            } else {
                // Use fallback if no data returned
                setLocations(FALLBACK_LOCATIONS)
            }
        } catch (err) {
            console.error('Error fetching locations:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch locations')
            // Use fallback on error
            setLocations(FALLBACK_LOCATIONS)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchLocations()
    }, [fetchLocations])

    const getLocationById = useCallback((id: string): Location | undefined => {
        return locations.find(loc => loc.id === id || loc._id === id)
    }, [locations])

    const getLocationByName = useCallback((name: string): Location | undefined => {
        return locations.find(loc => loc.name.toLowerCase() === name.toLowerCase())
    }, [locations])

    const getActiveLocations = useCallback((): Location[] => {
        return locations.filter(loc => loc.isActive)
    }, [locations])

    return {
        locations,
        activeLocations: getActiveLocations(),
        loading,
        error,
        refetch: fetchLocations,
        getLocationById,
        getLocationByName,
    }
}

/**
 * Get locations as options for select dropdowns
 */
export function useLocationOptions() {
    const { locations, loading } = useLocations()

    return {
        options: locations.map(loc => ({
            value: loc.id || loc._id || loc.code || loc.name.toLowerCase(),
            label: loc.name,
            location: loc,
        })),
        loading,
    }
}
