'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { rbacManager } from '@/services/auth/rbac'

export default function ManagerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isAuthenticated, isLoading, role } = useAuth()
    const router = useRouter()
    const [hasToken, setHasToken] = useState(true)

    useEffect(() => {
        setHasToken(!!localStorage.getItem('token'))
    }, [])

    useEffect(() => {
        if (isLoading) return
        if (!isAuthenticated && !localStorage.getItem('token')) {
            router.push('/login/staff')
            return
        }
        if (isAuthenticated && role) {
            const upper = String(role).toUpperCase()
            const allowed = ['MANAGER', 'LOCATION_MANAGER', 'ADMIN']
            if (!allowed.includes(upper)) {
                rbacManager.setRole(upper)
                const target = rbacManager.getDashboard()
                router.push(target && target !== '/login' ? target : '/unauthorized')
            }
        }
    }, [isAuthenticated, isLoading, router, role])

    if (isLoading && !hasToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        )
    }

    if (!isAuthenticated && !hasToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
