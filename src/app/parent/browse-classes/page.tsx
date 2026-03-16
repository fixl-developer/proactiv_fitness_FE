'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import SearchFilters from '@/components/booking/SearchFilters'
import SessionCard from '@/components/booking/SessionCard'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useLocalStorage } from '@/hooks/useClientOnly'
import { EnhancedBookingService, AvailableSession, SearchFilters as SearchFiltersType } from '@/services/enhancedBookingService'
import { Loader, AlertCircle } from 'lucide-react'

const BrowseClassesPage = () => {
    const router = useRouter()
    const [sessions, setSessions] = useState<AvailableSession[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [hasSearched, setHasSearched] = useState(false)

    const userName = useLocalStorage('userName', 'Parent User')
    const userEmail = useLocalStorage('userEmail', 'parent@proactivsports.com')

    // Check authentication
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isAuthenticated = localStorage.getItem('isAuthenticated')
            if (!isAuthenticated) {
                router.push('/login')
                return
            }
        }
    }, [router])

    const handleSearch = async (filters: SearchFiltersType) => {
        setIsLoading(true)
        setError('')
        setHasSearched(true)

        try {
            const bookingService = new EnhancedBookingService()
            const results = await bookingService.searchAvailableSessions(filters)
            setSessions(results)

            if (results.length === 0) {
                setError('No classes found matching your criteria. Try adjusting your filters.')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to search classes')
            setSessions([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleReset = () => {
        setSessions([])
        setHasSearched(false)
        setError('')
    }

    const handleBook = (sessionId: string) => {
        router.push(`/parent/book-class/${sessionId}`)
    }

    const handleViewDetails = (session: AvailableSession) => {
        // Store session details in sessionStorage for the details page
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('selectedSession', JSON.stringify(session))
        }
        router.push(`/parent/book-class/${session.sessionId}`)
    }

    return (
        <DashboardLayout
            userRole="parent"
            userName={userName}
            userEmail={userEmail}
        >
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Browse Classes</h1>
                    <p className="text-gray-600 mt-2">Find and book the perfect class for your child</p>
                </div>

                {/* Search Filters */}
                <SearchFilters onSearch={handleSearch} onReset={handleReset} />

                {/* Results */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-600 font-medium">Searching for classes...</p>
                    </div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3"
                    >
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-red-900">Search Error</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                    </motion.div>
                )}

                {!isLoading && hasSearched && sessions.length > 0 && (
                    <div>
                        <p className="text-sm text-gray-600 mb-4">
                            Found <span className="font-semibold text-gray-900">{sessions.length}</span> classes
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sessions.map((session, index) => (
                                <motion.div
                                    key={session.sessionId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <SessionCard
                                        session={session}
                                        onBook={handleBook}
                                        onViewDetails={handleViewDetails}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {!isLoading && !hasSearched && (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Searching</h3>
                        <p className="text-gray-600">Use the filters above to find classes that match your needs</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default BrowseClassesPage
