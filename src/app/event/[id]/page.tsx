'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { FiCalendar, FiClock, FiMapPin, FiUser, FiPhone, FiMail, FiMessageSquare } from 'react-icons/fi'
import BookingHeader from '@/components/layout/BookingHeader'
import { eventData } from '@/data/eventData'

export default function EventPage() {
    const params = useParams()
    const eventId = params.id as string
    const [selectedSession, setSelectedSession] = useState<string | null>(null)
    const [showBookingForm, setShowBookingForm] = useState(false)

    const event = eventData[eventId as keyof typeof eventData]

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
                    <Link id="book-now" href="/book-now" className="text-blue-600 hover:text-blue-800">
                        ← Back to Booking
                    </Link>
                </div>
            </div>
        )
    }

    const handleSelectAndContinue = () => {
        if (selectedSession) {
            setShowBookingForm(true)
        }
    }

    return (
        <>
            <BookingHeader />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <Link id="book-now" href="/book-now" className="text-blue-600 hover:text-blue-800 font-medium">
                                ← Back to Classes
                            </Link>
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-600">Classes</span>
                                <span className="text-sm text-gray-600">Packages</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Event Details */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <h1 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h1>

                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
                                    <div className="flex items-center">
                                        <FiCalendar className="w-4 h-4 mr-1" />
                                        Nov 03, 2025 to Feb 13, 2026 (36 sessions)
                                    </div>
                                    <div className="flex items-center">
                                        <FiClock className="w-4 h-4 mr-1" />
                                        {event.duration}
                                    </div>
                                </div>

                                {/* Sessions List */}
                                <div className="space-y-3 mb-6">
                                    {event.sessions.map((session: any) => (
                                        <div id="event-id-div-clickable"
                                            key={session.id}
                                            className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedSession === session.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => setSelectedSession(session.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-xs text-gray-500 text-center">
                                                        <div className="font-bold">{session.date.split(',')[0].toUpperCase()}</div>
                                                        <div>{session.date.split(' ')[2]}</div>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{session.date}</div>
                                                        <div className="text-sm text-orange-600">{session.time}</div>
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <FiMapPin className="w-4 h-4 mr-1" />
                                                        {event.location}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-sm text-gray-600">
                                                        <div className="flex items-center">
                                                            <FiUser className="w-4 h-4 mr-1" />
                                                            {session.availableSeats} seats
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {session.bookedSeats}/{session.availableSeats} seats
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                                            WM
                                                        </div>
                                                        {event.coach.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button id="event-id-btn--14-sessions-more" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                        + 14 sessions more
                                    </button>
                                </div>
                            </div>

                            {/* About Section */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>

                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <FiCalendar className="w-4 h-4 mr-2" />
                                        {event.type} - {event.title}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <FiClock className="w-4 h-4 mr-2" />
                                        {event.duration}
                                    </div>
                                </div>

                                <div className="flex items-center text-sm text-gray-600 mb-6">
                                    <FiUser className="w-4 h-4 mr-2" />
                                    {event.ageRange}
                                </div>

                                <h3 className="font-bold text-gray-900 mb-3">{event.description}</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">{event.fullDescription}</p>

                                <div className="space-y-2">
                                    {event.features.map((feature: string, index: number) => (
                                        <div key={index} className="flex items-start">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                            <span className="text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Location */}
                                <div className="mt-8">
                                    <h3 className="font-bold text-gray-900 mb-3">Location</h3>
                                    <div className="text-gray-600 mb-4">{event.location}</div>

                                    {/* Map placeholder */}
                                    <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center mb-4">
                                        <span className="text-gray-500">Map View</span>
                                    </div>

                                    <div className="flex items-center text-sm text-gray-600">
                                        <FiMapPin className="w-4 h-4 mr-2" />
                                        {event.address}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Booking Options */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Booking options</h3>

                                <div className="text-sm text-gray-600 mb-4">Per session (Drop-in)</div>

                                <div className="border rounded-lg p-4 mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-blue-600 font-medium">{event.type}s - {event.title}</span>
                                        <span className="font-bold text-green-600">{event.price}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">{event.duration}</div>
                                </div>

                                <button id="event-id-btn-select-continue"
                                    onClick={handleSelectAndContinue}
                                    disabled={!selectedSession}
                                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${selectedSession
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    Select & Continue
                                </button>

                                {/* Team Section */}
                                <div className="mt-8">
                                    <h4 className="font-bold text-gray-900 mb-3">Team</h4>
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                            WM
                                        </div>
                                        <span className="text-gray-700">{event.coach.name}</span>
                                    </div>
                                </div>

                                {/* Contact Section */}
                                <div className="mt-8">
                                    <h4 className="font-bold text-gray-900 mb-3">Contact</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer">
                                            <FiPhone className="w-4 h-4 mr-2" />
                                            <span className="text-sm">Call</span>
                                        </div>
                                        <div className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer">
                                            <FiMessageSquare className="w-4 h-4 mr-2" />
                                            <span className="text-sm">Message</span>
                                        </div>
                                        <div className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer">
                                            <FiMessageSquare className="w-4 h-4 mr-2" />
                                            <span className="text-sm">Whatsapp</span>
                                        </div>
                                        <div className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer">
                                            <FiMail className="w-4 h-4 mr-2" />
                                            <span className="text-sm">Email</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking Form Modal */}
                {showBookingForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Book Assessment</h3>
                            <form id="form-event-id" className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Parent Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Child Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Child Age *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="3"
                                        max="10"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex space-x-3 pt-4">
                                    <button id="event-id-btn"
                                        type="button"
                                        onClick={() => setShowBookingForm(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button id="event-id-btn-book-now"
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}