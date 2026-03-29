'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getPartnerConfig, PartnerTypeConfig, PartnerTypeKey } from '@/config/partnerTypeConfig'
import { apiClient } from '@/services/api/client'

interface PartnerContextValue {
    partnerType: PartnerTypeKey
    config: PartnerTypeConfig
    partnerProfile: any | null
    loading: boolean
}

const PartnerContext = createContext<PartnerContextValue>({
    partnerType: 'other',
    config: getPartnerConfig('other'),
    partnerProfile: null,
    loading: true,
})

export function PartnerProvider({ children }: { children: ReactNode }) {
    const [partnerType, setPartnerType] = useState<PartnerTypeKey>('other')
    const [partnerProfile, setPartnerProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadPartnerType = async () => {
            try {
                // First check localStorage for cached partner type
                const userData = localStorage.getItem('user')
                if (userData) {
                    const parsed = JSON.parse(userData)
                    if (parsed.partnerType) {
                        setPartnerType(parsed.partnerType as PartnerTypeKey)
                    }
                }

                // Then fetch fresh profile from API
                // Backend route: GET /api/partners/:partnerId
                const partnerId = JSON.parse(userData || '{}')?.id || ''
                if (partnerId) {
                    const response = await apiClient.get<any>(`/partners/${partnerId}`)
                    const profile = response?.data || response
                    if (profile) {
                        setPartnerProfile(profile)
                        // partnerType comes from the profile response
                        const type = (profile.partnerType || profile.businessType) as PartnerTypeKey
                        if (type) {
                            setPartnerType(type)
                            // Update localStorage cache
                            const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
                            currentUser.partnerType = type
                            localStorage.setItem('user', JSON.stringify(currentUser))
                        }
                    }
                }
            } catch (error) {
                // If API fails, keep the localStorage cached value
                console.warn('Could not fetch partner profile, using cached type:', error)
            } finally {
                setLoading(false)
            }
        }

        loadPartnerType()
    }, [])

    const config = getPartnerConfig(partnerType)

    return (
        <PartnerContext.Provider value={{ partnerType, config, partnerProfile, loading }}>
            {children}
        </PartnerContext.Provider>
    )
}

export function usePartnerConfig() {
    return useContext(PartnerContext)
}
