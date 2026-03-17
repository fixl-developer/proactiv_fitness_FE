'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SuperAdminPage() {
    const router = useRouter()

    useEffect(() => {
        // Redirect to dashboard
        router.push('/superadmin/dashboard')
    }, [router])

    return null
}
