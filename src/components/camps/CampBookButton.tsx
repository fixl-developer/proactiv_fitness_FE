'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { CampCategory } from '@/data/camps'

interface CampBookButtonProps {
    campId: number | string
    category: CampCategory
    className?: string
    children?: React.ReactNode
    id?: string
}

/**
 * Shared "Book Now" button for camp listings.
 * - If not logged in → redirects to /login with returnTo set to the camp booking page.
 * - If logged in → routes straight to /camps/book?camp=<id>&type=<category>.
 *
 * Matches the auth pattern used by /book-trial, /book-assessment and /book-now.
 */
export default function CampBookButton({
    campId,
    category,
    className = 'btn-primary',
    children = 'Book Now',
    id,
}: CampBookButtonProps) {
    const router = useRouter()
    const { isAuthenticated } = useAuth()

    const target = `/camps/book?camp=${encodeURIComponent(String(campId))}&type=${encodeURIComponent(category)}`

    const handleClick = () => {
        if (!isAuthenticated) {
            router.push(`/login?redirectTo=${encodeURIComponent(target)}`)
            return
        }
        router.push(target)
    }

    return (
        <button id={id} type="button" onClick={handleClick} className={className}>
            {children}
        </button>
    )
}
