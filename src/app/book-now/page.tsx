'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BookingHeader from '@/components/layout/BookingHeader'
import ScheduleCalendar from '@/components/scheduling/ScheduleCalendar'
import BookingFlow from '@/components/scheduling/BookingFlow'
import { useAuth } from '@/contexts/AuthContext'

// Import dashboard components
import ParentBookingsPage from '@/app/parent/bookings/page'
import ParentChildrenPage from '@/app/parent/children/page'
import ParentProfilePage from '@/app/parent/profile/page'
import ParentPaymentsPage from '@/app/parent/payments/page'
import ParentDashboardPage from '@/app/parent/dashboard/page'
import BookingDashboardLayout from '@/components/dashboard/BookingDashboardLayout'

interface TimeSlot {
    id: string;
    startTime: string;
    endTime: string;
    programType: 'class' | 'trial' | 'assessment' | 'party' | 'private';
    programName: string;
    coach: string;
    location: string;
    ageGroup: string;
    capacity: number;
    booked: number;
    waitlist: number;
    price: number;
    level: string;
    status: 'available' | 'full' | 'waitlist' | 'cancelled';
    date: string;
}

const BookNowContent = () => {
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
    const [bookingStep, setBookingStep] = useState<'schedule' | 'booking' | 'confirmation'>('schedule')
    const { isAuthenticated, user } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Get section from URL parameters
    const section = searchParams.get('section')

    // Determine what content to show
    const showDashboardContent = isAuthenticated && section && ['profile', 'bookings', 'children', 'payments', 'dashboard', 'settings'].includes(section)

    const handleSlotSelect = (slot: TimeSlot) => {
        // Check authentication when user tries to book
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        setSelectedSlot(slot)
        setBookingStep('booking')
    }

    const handleBookingComplete = (bookingData: any) => {
        console.log('Booking completed:', bookingData)
        setBookingStep('confirmation')
    }

    const handleBookingCancel = () => {
        setSelectedSlot(null)
        setBookingStep('schedule')
    }

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

    return (
        <>
            {showDashboardContent ? (
                // Dashboard Content with Sidebar and BookingHeader
                <>
                    <BookingHeader />
                    <BookingDashboardLayout currentSection={section}>
                        {/* Back to Booking Button */}
                        <div className="mb-6">
                            <button
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
                                Back to Booking
                            </button>
                        </div>

                        {/* Dashboard Content */}
                        {renderDashboardContent()}
                    </BookingDashboardLayout>
                </>
            ) : (
                <>
                    <Header />
                    {/* Original Booking Content */}
                    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
                        {/* Modern Header with Background Image */}
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
                                    alt="Gymnastics Class"
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
                                        Book Your Perfect Class
                                    </motion.h1>
                                    <motion.p
                                        className="text-xl text-blue-100 max-w-2xl mx-auto mb-8"
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.4, duration: 0.5 }}
                                    >
                                        Choose from our wide range of gymnastics programs, assessments, and private coaching sessions
                                    </motion.p>

                                    {/* Quick Stats */}
                                    <motion.div
                                        initial={{ y: 30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.6, duration: 0.5 }}
                                        className="flex flex-wrap justify-center gap-8 text-white"
                                    >
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-blue-300">500+</div>
                                            <div className="text-sm text-blue-100">Happy Students</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-purple-300">15+</div>
                                            <div className="text-sm text-blue-100">Expert Coaches</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-indigo-300">2</div>
                                            <div className="text-sm text-blue-100">Premium Locations</div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                            <AnimatePresence mode="wait">
                                {bookingStep === 'schedule' && (
                                    <motion.div
                                        key="schedule"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <ScheduleCalendar onSlotSelect={handleSlotSelect} />
                                    </motion.div>
                                )}

                                {bookingStep === 'booking' && selectedSlot && (
                                    <motion.div
                                        key="booking"
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <BookingFlow
                                            selectedSlot={selectedSlot}
                                            onComplete={handleBookingComplete}
                                            onCancel={handleBookingCancel}
                                        />
                                    </motion.div>
                                )}

                                {bookingStep === 'confirmation' && (
                                    <motion.div
                                        key="confirmation"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className="text-center py-16"
                                    >
                                        <div className="max-w-md mx-auto">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                                            >
                                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </motion.div>
                                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Booking Successful!</h2>
                                            <p className="text-gray-600 mb-8">
                                                Your class has been booked successfully. Check your email for confirmation details.
                                            </p>
                                            <div className="space-y-4">
                                                <button
                                                    onClick={() => window.location.href = '/book-now?section=bookings'}
                                                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                                >
                                                    View My Bookings
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setBookingStep('schedule')
                                                        setSelectedSlot(null)
                                                    }}
                                                    className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                                >
                                                    Book Another Class
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Features Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                            className="bg-white/50 backdrop-blur-sm border-t border-white/20 mt-16"
                        >
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                                <div className="text-center mb-12">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Booking System?</h2>
                                    <p className="text-gray-600 max-w-2xl mx-auto">
                                        Experience the most advanced gymnastics booking platform in Hong Kong
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {[
                                        {
                                            icon: "⚡",
                                            title: "Real-Time Availability",
                                            description: "See live class availability and book instantly without waiting",
                                            image: "/images/hero/gymnastics-1.jpg"
                                        },
                                        {
                                            icon: "🎯",
                                            title: "Smart Matching",
                                            description: "AI-powered recommendations based on your child's age and skill level",
                                            image: "/images/hero/gymnastics-2.jpg"
                                        },
                                        {
                                            icon: "📱",
                                            title: "Mobile Optimized",
                                            description: "Book classes seamlessly on any device, anywhere, anytime",
                                            image: "/images/hero/gymnastics-3.jpg"
                                        }
                                    ].map((feature, index) => (
                                        <motion.div
                                            key={feature.title}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 1 + index * 0.2, duration: 0.5 }}
                                            className="group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                                        >
                                            {/* Background Image */}
                                            <div className="relative h-48 overflow-hidden">
                                                <img
                                                    src={feature.image}
                                                    alt={feature.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                                                <div className="absolute top-4 left-4">
                                                    <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl">
                                                        {feature.icon}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-6">
                                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                                <p className="text-gray-600">{feature.description}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Program Types Visual Section */}
                                <div className="mt-16">
                                    <div className="text-center mb-12">
                                        <h2 className="text-3xl font-bold text-gray-900 mb-4">What You Can Book</h2>
                                        <p className="text-gray-600 max-w-2xl mx-auto">
                                            Choose from our comprehensive range of gymnastics programs
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {[
                                            {
                                                title: "Regular Classes",
                                                description: "Weekly gymnastics classes for all skill levels",
                                                image: "/images/services/school-gymnastics.jpg",
                                                color: "from-blue-500 to-blue-600",
                                                price: "From HK$350"
                                            },
                                            {
                                                title: "Free Assessment",
                                                description: "Professional skill evaluation for new students",
                                                image: "/images/hero/gymnastics-4.png",
                                                color: "from-purple-500 to-purple-600",
                                                price: "FREE"
                                            },
                                            {
                                                title: "Holiday Camps",
                                                description: "Intensive training during school holidays",
                                                image: "/images/services/holiday-camps.jpg",
                                                color: "from-green-500 to-green-600",
                                                price: "From HK$800"
                                            },
                                            {
                                                title: "Birthday Parties",
                                                description: "Memorable gymnastics-themed celebrations",
                                                image: "/images/services/birthday-parties.jpg",
                                                color: "from-pink-500 to-pink-600",
                                                price: "From HK$1200"
                                            }
                                        ].map((program, index) => (
                                            <motion.div
                                                key={program.title}
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 1.5 + index * 0.1, duration: 0.5 }}
                                                className="group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                                                whileHover={{ y: -5 }}
                                            >
                                                {/* Background Image */}
                                                <div className="relative h-40 overflow-hidden">
                                                    <img
                                                        src={program.image}
                                                        alt={program.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                                                    {/* Price Badge */}
                                                    <div className="absolute top-3 right-3">
                                                        <div className={`px-3 py-1 rounded-full text-white text-sm font-semibold bg-gradient-to-r ${program.color}`}>
                                                            {program.price}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-4">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{program.title}</h3>
                                                    <p className="text-gray-600 text-sm">{program.description}</p>

                                                    {/* Book Button */}
                                                    <div className="mt-4">
                                                        <button
                                                            onClick={() => {
                                                                if (!isAuthenticated) {
                                                                    router.push('/login')
                                                                    return
                                                                }
                                                                // Handle booking logic here
                                                            }}
                                                            className={`w-full py-2 px-4 rounded-lg text-white font-medium bg-gradient-to-r ${program.color} hover:shadow-lg transition-all duration-300`}
                                                        >
                                                            Book Now
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                    <Footer />
                </>
            )}
        </>
    )
}

function BookNowPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>}>
            <BookNowContent />
        </Suspense>
    )
}

export default BookNowPage
