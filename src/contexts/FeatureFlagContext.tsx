'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { FeatureFlagService } from '@/services/featureFlagService'

interface FeatureFlagContextType {
    flags: Record<string, boolean>
    isLoading: boolean
    checkFlag: (key: string) => boolean
    refreshFlags: () => Promise<void>
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined)

export const useFeatureFlags = () => {
    const context = useContext(FeatureFlagContext)
    if (context === undefined) {
        throw new Error('useFeatureFlags must be used within a FeatureFlagProvider')
    }
    return context
}

interface FeatureFlagProviderProps {
    children: ReactNode
    initialFlags?: string[]
}

export const FeatureFlagProvider = ({ children, initialFlags = [] }: FeatureFlagProviderProps) => {
    const [flags, setFlags] = useState<Record<string, boolean>>({})
    const [isLoading, setIsLoading] = useState(true)

    const loadFlags = async (flagKeys: string[]) => {
        try {
            setIsLoading(true)
            const results = await FeatureFlagService.checkMultipleFeatureFlags(flagKeys)
            setFlags(results)
        } catch (error) {
            console.error('Failed to load feature flags:', error)
            // Set all to false on error
            setFlags(flagKeys.reduce((acc, key) => ({ ...acc, [key]: false }), {}))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (initialFlags.length > 0) {
            loadFlags(initialFlags)
        } else {
            setIsLoading(false)
        }
    }, [])

    const checkFlag = (key: string): boolean => {
        return flags[key] ?? false
    }

    const refreshFlags = async () => {
        const flagKeys = Object.keys(flags)
        if (flagKeys.length > 0) {
            await loadFlags(flagKeys)
        }
    }

    const value: FeatureFlagContextType = {
        flags,
        isLoading,
        checkFlag,
        refreshFlags
    }

    return (
        <FeatureFlagContext.Provider value={value}>
            {children}
        </FeatureFlagContext.Provider>
    )
}
