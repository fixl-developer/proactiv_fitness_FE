'use client'

import { useState, useCallback } from 'react'
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext'

interface UseLogoutOptions {
    redirectTo?: string
}

export function useLogout(options: UseLogoutOptions = {}) {
    const { redirectTo = '/login/staff' } = options
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const { hasUnsavedChanges, getUnsavedPages, saveAllChanges } = useUnsavedChanges()

    const performLogout = useCallback(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        localStorage.removeItem('savedSession')
        localStorage.removeItem('lastActivity')
        localStorage.removeItem('auth-storage')
        window.location.href = redirectTo
    }, [redirectTo])

    const handleLogoutClick = useCallback(() => {
        if (hasUnsavedChanges()) {
            // Show modal only when there are unsaved changes
            setShowLogoutModal(true)
        } else {
            // Direct logout - no unsaved changes
            performLogout()
        }
    }, [hasUnsavedChanges, performLogout])

    const handleSaveAndLogout = useCallback(async () => {
        // Save all pending changes first
        await saveAllChanges()
        // Then logout
        performLogout()
    }, [saveAllChanges, performLogout])

    const handlePermanentLogout = useCallback(() => {
        // Logout without saving
        performLogout()
    }, [performLogout])

    const closeLogoutModal = useCallback(() => {
        setShowLogoutModal(false)
    }, [])

    const unsavedPages = getUnsavedPages()

    return {
        showLogoutModal,
        unsavedPages,
        handleLogoutClick,
        handleSaveAndLogout,
        handlePermanentLogout,
        closeLogoutModal,
    }
}
