'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'

export default function ParentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const [hasToken, setHasToken] = useState(true)

    useEffect(() => {
        setHasToken(!!localStorage.getItem('token'))
    }, [])

    useEffect(() => {
        if (isLoading) return
        if (!isAuthenticated && !localStorage.getItem('token')) {
            router.push('/login')
        }
    }, [isAuthenticated, isLoading, router])

    if (isLoading && !hasToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!isAuthenticated && !hasToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <DashboardLayout
            userRole="parent"
            userName={user?.name || ''}
            userEmail={user?.email || ''}
        >
            {children}
        </DashboardLayout>
    )
}
