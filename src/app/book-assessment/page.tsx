'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Shield, Users, Clock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BookingHeader from '@/components/layout/BookingHeader';
import AssessmentListing from '@/components/assessment/AssessmentListing';
import BookingFlow from '@/components/booking/BookingFlow';
import BookingConfirmation from '@/components/booking/BookingConfirmation';
import { useAuth } from '@/contexts/AuthContext';

// Import dashboard components
import ParentBookingsPage from '@/app/parent/bookings/page'
import ParentChildrenPage from '@/app/parent/children/page'
import ParentProfilePage from '@/app/parent/profile/page'
import ParentPaymentsPage from '@/app/parent/payments/page'
import ParentDashboardPage from '@/app/parent/dashboard/page'
import BookingDashboardLayout from '@/components/dashboard/BookingDashboardLayout'

function BookAssessmentContent() {
    const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);
    const [showBookingFlow, setShowBookingFlow] = useState(false);
    const [bookingComplete, setBookingComplete] = useState(false);
    const [bookingData, setBookingData] = useState(null);
    const { isAuthenticated, user } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Get section from URL parameters
    const section = searchParams.get('section')

    // Determine what content to show
    const showDashboardContent = isAuthenticated && section && ['profile', 'bookings', 'children', 'payments', 'dashboard', 'settings'].includes(section)

    const handleBookAssessment = (assessmentId: string) => {
        // Check authentication when user tries to book
        if (!isAuthenticated) {
            router.push(`/login?redirectTo=${encodeURIComponent('/book-assessment')}`)
            return
        }

        setSelectedAssessment(assessmentId);
        setShowBookingFlow(true);
        // Scroll to top when booking flow starts
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBookingComplete = (data: any) => {
        setBookingData(data);
        setBookingComplete(true);
    };

    const handleBackToAssessments = () => {
        setShowBookingFlow(false);
        setBookingComplete(false);
        setBookingData(null);
        setSelectedAssessment(null);
    };

    // Render dashboard content based on section
    const renderDashboardContent = () => {
        switch (section) {
            case 'profile':
                return <ParentProfilePage />
            case 'bookings':
                return <ParentBookingsPage />
            case 'children':
                return <ParentChildrenPage />
            case 'payments':
                return <ParentPaymentsPage />
            case 'dashboard':
                return <ParentDashboardPage />
            case 'settings':
                return <ParentProfilePage /> // Use profile page for settings for now
            default:
                return null
        }
    }

    if (bookingComplete) {
        return (
            <BookingConfirmation
                bookingData={bookingData}
                onBackToStart={handleBackToAssessments}
            />
        );
    }

    return (
        <>
            {showDashboardContent ? (
                // Dashboard Content with Sidebar and BookingHeader
                <>
                    <BookingHeader />
                    <BookingDashboardLayout currentSection={section}>
                        {/* Back to Assessment Button */}
                        <div className="mb-6">
                            <button id="book-assessment-btn"
                                onClick={() => {
                                    const currentUrl = new URL(window.location.href)
                                    currentUrl.searchParams.delete('section')
                                    router.push(currentUrl.pathname + currentUrl.search)
                                }}
                                className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to Assessment
                            </button>
                        </div>

                        {/* Dashboard Content */}
                        {renderDashboardContent()}
                    </BookingDashboardLayout>
                </>
            ) : (
                // Assessment Content
                <>
                    <Header hideBookAssessment={true} />
                    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
                        {!showBookingFlow ? (
                            <>
                                {/* Modern Header */}
                                <motion.div
                                    initial={{ y: -50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.6 }}
                                    className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden pt-16"
                                >
                                    {/* Background Image */}
                                    <div className="absolute inset-0">
                                        <img
                                            src="/images/hero/gymnastics-1.jpg"
                                            alt="Gymnastics Assessment"
                                            className="w-full h-full object-cover opacity-30"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-purple-900/60 to-indigo-900/80"></div>
                                    </div>

                                    {/* Content */}
                                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                                        <div className="text-center">
                                            <motion.h1
                                                className="text-4xl md:text-5xl font-bold text-white mb-6"
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: 0.2, duration: 0.5 }}
                                            >
                                                Book a Free Assessment
                                            </motion.h1>
                                            <motion.p
                                                className="text-xl text-blue-100 max-w-2xl mx-auto mb-8"
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.4, duration: 0.5 }}
                                            >
                                                Discover your child's potential with our expert coaches. Get personalized program recommendations in just 30 minutes!
                                            </motion.p>

                                            {/* Trust Elements */}
                                            <motion.div
                                                initial={{ y: 30, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.6, duration: 0.5 }}
                                                className="flex flex-wrap justify-center gap-6 mb-8"
                                            >
                                                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                                    <Star className="w-5 h-5 text-yellow-300 fill-current" />
                                                    <span className="text-white font-medium">Expert Coaches</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                                    <Shield className="w-5 h-5 text-green-300" />
                                                    <span className="text-white font-medium">Safe Environment</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                                    <Users className="w-5 h-5 text-blue-300" />
                                                    <span className="text-white font-medium">Age-Appropriate</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                                    <Clock className="w-5 h-5 text-purple-300" />
                                                    <span className="text-white font-medium">30 Minutes</span>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Assessment Listing */}
                                <AssessmentListing onBookAssessment={handleBookAssessment} />
                            </>
                        ) : (
                            <BookingFlow
                                onComplete={handleBookingComplete}
                                onBack={handleBackToAssessments}
                            />
                        )}
                    </main>
                    <Footer />
                </>
            )}
        </>
    );
}

export default function BookAssessmentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>}>
            <BookAssessmentContent />
        </Suspense>
    );
}
