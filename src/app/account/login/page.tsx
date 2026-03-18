'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function RedirectContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const registered = searchParams.get('registered')
        if (registered === 'true') {
            router.replace('/login?registered=true')
        } else {
            router.replace('/login')
        }
    }, [router, searchParams])

    return null
}

export default function AccountLoginRedirect() {
    return (
        <Suspense fallback={null}>
            <RedirectContent />
        </Suspense>
    )
}
