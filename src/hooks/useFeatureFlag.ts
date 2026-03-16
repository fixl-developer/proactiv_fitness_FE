import { useState, useEffect } from 'react'
import { FeatureFlagService } from '@/services/featureFlagService'

/**
 * Hook to check if a feature flag is enabled
 * @param key - Feature flag key
 * @param defaultValue - Default value if check fails (default: false)
 * @returns Object with isEnabled status and loading state
 */
export function useFeatureFlag(key: string, defaultValue: boolean = false) {
    const [isEnabled, setIsEnabled] = useState<boolean>(defaultValue)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        let isMounted = true

        const checkFlag = async () => {
            try {
                setIsLoading(true)
                setError(null)

                const enabled = await FeatureFlagService.checkFeatureFlag(key)

                if (isMounted) {
                    setIsEnabled(enabled)
                }
            } catch (err) {
                console.error(`Failed to check feature flag: ${key}`, err)
                if (isMounted) {
                    setError(err as Error)
                    setIsEnabled(defaultValue)
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        checkFlag()

        return () => {
            isMounted = false
        }
    }, [key, defaultValue])

    return { isEnabled, isLoading, error }
}

/**
 * Hook to check multiple feature flags
 * @param keys - Array of feature flag keys
 * @returns Object with flags status and loading state
 */
export function useFeatureFlags(keys: string[]) {
    const [flags, setFlags] = useState<Record<string, boolean>>({})
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        let isMounted = true

        const checkFlags = async () => {
            try {
                setIsLoading(true)
                setError(null)

                const results = await FeatureFlagService.checkMultipleFeatureFlags(keys)

                if (isMounted) {
                    setFlags(results)
                }
            } catch (err) {
                console.error('Failed to check feature flags', err)
                if (isMounted) {
                    setError(err as Error)
                    // Set all to false on error
                    setFlags(keys.reduce((acc, key) => ({ ...acc, [key]: false }), {}))
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        if (keys.length > 0) {
            checkFlags()
        } else {
            setIsLoading(false)
        }

        return () => {
            isMounted = false
        }
    }, [keys.join(',')])

    return { flags, isLoading, error }
}

/**
 * Helper function to check feature flag synchronously (for use outside React components)
 * Note: This returns a Promise, use with await
 */
export async function checkFeatureFlag(key: string): Promise<boolean> {
    return FeatureFlagService.checkFeatureFlag(key)
}
