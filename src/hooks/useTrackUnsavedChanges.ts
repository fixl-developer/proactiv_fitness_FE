'use client'

import { useEffect, useRef } from 'react'
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext'

/**
 * Hook to track unsaved changes on a page.
 * Registers/clears with UnsavedChangesContext based on isDirty flag.
 *
 * @param pageId - unique identifier for the page
 * @param pageName - human-readable page name shown in logout modal
 * @param isDirty - whether the page has unsaved changes
 * @param saveFn - function to save the changes
 */
export function useTrackUnsavedChanges(
    pageId: string,
    pageName: string,
    isDirty: boolean,
    saveFn: () => Promise<void> | void
) {
    const { registerUnsavedChange, clearUnsavedChange } = useUnsavedChanges()
    const saveFnRef = useRef(saveFn)

    // Keep the save function ref up to date
    useEffect(() => {
        saveFnRef.current = saveFn
    }, [saveFn])

    useEffect(() => {
        if (isDirty) {
            registerUnsavedChange(pageId, pageName, () => saveFnRef.current())
        } else {
            clearUnsavedChange(pageId)
        }
    }, [isDirty, pageId, pageName, registerUnsavedChange, clearUnsavedChange])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearUnsavedChange(pageId)
        }
    }, [pageId, clearUnsavedChange])
}
