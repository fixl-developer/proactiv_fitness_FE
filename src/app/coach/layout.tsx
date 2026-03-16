'use client'

import { useEffect } from 'react'
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

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || user?.role !== 'COACH')) {
            router.push('/auth/login')
        }
    }, [isAuthenticated, isLoading, user, router])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
            </div>
        )
    }

    if (!isAuthenticated || user?.role !== 'COACH') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
            </div>
        )
    }

    return (
        <DashboardLayout
            userRole="coach"
            userName={user.name}
            userEmail={user.email}
        >
            {children}
        </DashboardLayout>
    )
}