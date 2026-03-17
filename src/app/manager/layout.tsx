'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'

export default function ManagerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    const roleStr = typeof user?.role === 'object' ? (user?.role as any)?.name : user?.role
    const allowed = roleStr === 'MANAGER' || roleStr === 'LOCATION_MANAGER'

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || !allowed)) {
            router.push('/login')
        }
    }, [isAuthenticated, isLoading, allowed, router])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
            </div>
        )
    }

    if (!isAuthenticated || !allowed) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
            </div>
        )
    }

    return (
        <DashboardLayout
            userRole="manager"
            userName={(user as any)?.name}
            userEmail={user?.email ?? ''}
        >
            {children}
        </DashboardLayout>
    )
}
