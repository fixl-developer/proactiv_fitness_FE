'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'

export default function CoachLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const [hasToken, setHasToken] = useState(true)

    // Check localStorage token directly to avoid flash redirect
    useEffect(() => {
        const token = localStorage.getItem('token')
        setHasToken(!!token)
    }, [])

    useEffect(() => {
        if (isLoading) return
        if (!isAuthenticated && !localStorage.getItem('token')) {
            router.push('/login/staff')
        }
    }, [isAuthenticated, isLoading, router])

    // Show loading only on initial load, not on sub-page navigation
    if (isLoading && !hasToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        )
    }

    // If no token at all, show loading (will redirect via useEffect)
    if (!isAuthenticated && !hasToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        )
    }

    return (
        <DashboardLayout
            userRole="coach"
            userName={(user as any)?.name || (user as any)?.firstName || 'Coach'}
            userEmail={user?.email ?? ''}
        >
            {children}
        </DashboardLayout>
    )
}
