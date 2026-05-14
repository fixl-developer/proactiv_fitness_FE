'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// MANAGER role has been retired (role taxonomy locked at 9 roles, 2026-05-13).
// This page now redirects away — admin/staff/manager flows live under the
// dedicated admin tier pages: /admin/users, /admin/regional/staff,
// /admin/franchise/staff, /admin/location/staff.
export default function ManagerStaffRetired() {
    const router = useRouter()
    useEffect(() => {
        router.replace('/unauthorized')
    }, [router])
    return (
        <div className="min-h-screen flex items-center justify-center text-gray-500">
            Manager dashboard has been retired. Redirecting…
        </div>
    )
}
