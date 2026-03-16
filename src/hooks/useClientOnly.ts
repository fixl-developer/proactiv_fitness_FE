import { useState, useEffect } from 'react'

/**
 * Custom hook to handle client-side only values
 * Prevents hydration errors by returning default values during SSR
 */
export const useClientOnly = () => {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    return isClient
}

/**
 * Hook to safely get localStorage values
 * Returns default value during SSR, actual value on client
 */
export const useLocalStorage = (key: string, defaultValue: string = '') => {
    const [value, setValue] = useState(defaultValue)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedValue = localStorage.getItem(key)
            setValue(storedValue || defaultValue)
        }
    }, [key, defaultValue])

    return value
}