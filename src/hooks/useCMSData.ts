'use client'

import { useState, useEffect } from 'react'

/**
 * Generic hook to fetch CMS data with loading state and fallback support
 */
export function useCMSData<T>(
    fetcher: () => Promise<T>,
    fallbackData: T,
    deps: any[] = []
): { data: T; isLoading: boolean; error: Error | null } {
    const [data, setData] = useState<T>(fallbackData)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        let cancelled = false

        const loadData = async () => {
            try {
                setIsLoading(true)
                const result = await fetcher()
                if (!cancelled) {
                    // Only use API data if it's non-empty
                    if (result && (Array.isArray(result) ? result.length > 0 : true)) {
                        setData(result)
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err as Error)
                    // Keep fallback data on error
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false)
                }
            }
        }

        loadData()
        return () => { cancelled = true }
    }, deps)

    return { data, isLoading, error }
}
