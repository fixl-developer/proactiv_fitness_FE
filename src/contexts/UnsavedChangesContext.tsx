'use client'

import { createContext, useContext, useCallback, useRef, useMemo } from 'react'

interface UnsavedEntry {
    pageId: string
    pageName: string
    saveFn: () => Promise<void> | void
}

interface UnsavedChangesContextType {
    registerUnsavedChange: (pageId: string, pageName: string, saveFn: () => Promise<void> | void) => void
    clearUnsavedChange: (pageId: string) => void
    hasUnsavedChanges: () => boolean
    getUnsavedPages: () => string[]
    saveAllChanges: () => Promise<boolean>
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | null>(null)

export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
    const entriesRef = useRef<Map<string, UnsavedEntry>>(new Map())

    const registerUnsavedChange = useCallback((pageId: string, pageName: string, saveFn: () => Promise<void> | void) => {
        entriesRef.current.set(pageId, { pageId, pageName, saveFn })
    }, [])

    const clearUnsavedChange = useCallback((pageId: string) => {
        entriesRef.current.delete(pageId)
    }, [])

    const hasUnsavedChanges = useCallback(() => {
        return entriesRef.current.size > 0
    }, [])

    const getUnsavedPages = useCallback(() => {
        return Array.from(entriesRef.current.values()).map(e => e.pageName)
    }, [])

    const saveAllChanges = useCallback(async (): Promise<boolean> => {
        const entries = Array.from(entriesRef.current.values())
        if (entries.length === 0) return true

        try {
            await Promise.all(entries.map(entry => entry.saveFn()))
            entriesRef.current.clear()
            return true
        } catch (err) {
            console.error('Failed to save changes:', err)
            return false
        }
    }, [])

    const value = useMemo(() => ({
        registerUnsavedChange,
        clearUnsavedChange,
        hasUnsavedChanges,
        getUnsavedPages,
        saveAllChanges,
    }), [registerUnsavedChange, clearUnsavedChange, hasUnsavedChanges, getUnsavedPages, saveAllChanges])

    return (
        <UnsavedChangesContext.Provider value={value}>
            {children}
        </UnsavedChangesContext.Provider>
    )
}

export function useUnsavedChanges() {
    const context = useContext(UnsavedChangesContext)
    if (!context) {
        // Return a no-op version if not wrapped in provider (safety fallback)
        return {
            registerUnsavedChange: () => {},
            clearUnsavedChange: () => {},
            hasUnsavedChanges: () => false,
            getUnsavedPages: () => [] as string[],
            saveAllChanges: async () => true,
        }
    }
    return context
}
