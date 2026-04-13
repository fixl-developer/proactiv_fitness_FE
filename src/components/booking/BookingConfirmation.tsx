'use client';

import { CheckCircle, Calendar, MapPin, Clock, Mail, Phone, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface BookingConfirmationProps {
    bookingData: any;
    onBackToStart: () => void;
}

export default function BookingConfirmation({ bookingData, onBackToStart }: BookingConfirmationProps) {
    const { role } = useAuth();
    const dashboardUrl = role?.toUpperCase() === 'PARENT' ? '/parent/bookings' : '/user/bookings';

    const programNames: { [key: string]: string } = {
        'gymnastics': 'Gymnastics',
        'multi-sports': 'Multi-Sports',
        'camps': 'Holiday Camps'
    };

    const locationNames: { [key: string]: string } = {
        'central': 'Central Sports Center',
        'east': 'East Side Academy',
        'west': 'West Point Facility'
    };

    const timeSlots: { [key: string]: string } = {
        '09:00': '9:00 AM',
        '10:00': '10:00 AM',
        '11:00': '11:00 AM',
        '14:00': '2:00 PM',
        '15:00': '3:00 PM',
        '16:00': '4:00 PM',
        '17:00': '5:00 PM',
        '18:00': '6:00 PM'
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const bookingId = `PA${Date.now().toString().slice(-6)}`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Success Header */}
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Booking Confirmed! 🎉
                    </h1>
                    <p className="text-xl text-gray-600 mb-2">
                        Your assessment has been successfully scheduled
                    </p>
                    <p className="text-lg text-gray-500">
                        Booking ID: <span className="font-mono font-bold text-blue-600">{bookingId}</span>
                    </p>
                </div>

                {/* Booking Details Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Assessment Details
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Date</div>
                                    <div className="font-semibold text-gray-900">
                                        {formatDate(bookingData.date)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Time</div>
                                    <div className="font-semibold text-gray-900">
                                        {timeSlots[bookingData.timeSlot]} (30 minutes)
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <MapPin className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Location</div>
                                    <div className="font-semibold text-gray-900">
                                        {locationNames[bookingData.location]}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            <div>
                                <div className="text-sm text-gray-600 mb-1">Program</div>
                                <div className="font-semibold text-gray-900">
                                    {programNames[bookingData.program]}
                                </div>
                            </div>

                            <div>
                                <div className="text-sm text-gray-600 mb-1">Child</div>
                                <div className="font-semibold text-gray-900">
                                    {bookingData.childName}, {bookingData.childAge} years old
                                </div>
                            </div>

                            <div>
                                <div className="text-sm text-gray-600 mb-1">Parent</div>
                                <div className="font-semibold text-gray-900">
                                    {bookingData.parentName}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-8">
                    <h3 className="text-xl font-bold text-blue-900 mb-4">
                        What Happens Next?
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-sm font-bold">1</span>
                            </div>
                            <div>
                                <div className="font-medium text-blue-900">Confirmation Email</div>
                                <div className="text-blue-700 text-sm">
                                    You'll receive a detailed confirmation email within 5 minutes
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-sm font-bold">2</span>
                            </div>
                            <div>
                                <div className="font-medium text-blue-900">Reminder Call</div>
                                <div className="text-blue-700 text-sm">
                                    Our team will call you 24 hours before the assessment
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-sm font-bold">3</span>
                            </div>
                            <div>
                                <div className="font-medium text-blue-900">Assessment Day</div>
                                <div className="text-blue-700 text-sm">
                                    Arrive 10 minutes early for a smooth check-in process
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Need to Make Changes?
                    </h3>
                    <p className="text-gray-600 mb-4">
                        If you need to reschedule or have any questions, please contact us:
                    </p>

                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2">
                            <Phone className="w-5 h-5 text-blue-600" />
                            <span className="font-medium">+852 1234 5678</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="w-5 h-5 text-blue-600" />
                            <span className="font-medium">bookings@proactivesports.com</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button id="booking-booking-confirmation-btn"
                        onClick={onBackToStart}
                        className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 font-medium transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Book Another Assessment
                    </button>

                    <Link
                        href={dashboardUrl}
                        className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                        <CheckCircle className="w-4 h-4" />
                        View My Bookings
                    </Link>

                    <button id="booking-booking-confirmation-btn-add-to-calendar" className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all">
                        Add to Calendar
                    </button>
                </div>

                {/* Footer Message */}
                <div className="text-center mt-12">
                    <p className="text-gray-500">
                        Thank you for choosing Proactive Sports! We're excited to meet {bookingData.childName} 🌟
                    </p>
                </div>
            </div>
        </div>
    );
}
