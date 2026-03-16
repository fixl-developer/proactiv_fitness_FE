'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, User, Mail, Phone, Dumbbell, AlertCircle } from 'lucide-react';

interface ReviewConfirmProps {
    bookingData: {
        program: string;
        childName: string;
        childAge: string;
        childGender: string;
        location: string;
        date: string;
        timeSlot: string;
        parentName: string;
        parentEmail: string;
        parentPhone: string;
    };
    onConfirm: () => void;
}

export default function ReviewConfirm({ bookingData, onConfirm }: ReviewConfirmProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const programNames: { [key: string]: string } = {
        'gymnastics': 'Gymnastics',
        'multi-sports': 'Multi-Sports',
        'camps': 'Holiday Camps'
    };

    const locationNames: { [key: string]: string } = {
        'central': 'Central Sports Center',
        'east': 'East Side Academy',
        'west': 'West Point Facility',
        'cyberport': 'Cyberport Location',
        'wan-chai': 'Wan Chai Location'
    };

    const timeSlots: { [key: string]: string } = {
        '09:00': '9:00 AM',
        '10:00': '10:00 AM',
        '11:00': '11:00 AM',
        '14:00': '2:00 PM',
        '15:00': '3:00 PM',
        '16:00': '4:00 PM',
        '17:00': '5:00 PM',
        '18:00': '6:00 PM',
        '9:00 AM': '9:00 AM',
        '10:00 AM': '10:00 AM',
        '11:00 AM': '11:00 AM',
        '2:00 PM': '2:00 PM',
        '3:00 PM': '3:00 PM',
        '4:00 PM': '4:00 PM',
        '5:00 PM': '5:00 PM',
        '6:00 PM': '6:00 PM'
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

    const handleConfirm = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            // Convert time slot to 24-hour format if needed
            let timeSlot = bookingData.timeSlot;
            if (timeSlot.includes('AM') || timeSlot.includes('PM')) {
                // Convert 12-hour to 24-hour format
                const hour = parseInt(timeSlot.split(':')[0]);
                const isPM = timeSlot.includes('PM');
                const hour24 = isPM && hour !== 12 ? hour + 12 : (hour === 12 && !isPM ? 0 : hour);
                timeSlot = `${hour24.toString().padStart(2, '0')}:00`;
            }

            const payload = {
                program: bookingData.program,
                childName: bookingData.childName,
                childAge: parseInt(bookingData.childAge),
                childGender: bookingData.childGender || 'Prefer not to say',
                location: bookingData.location,
                date: bookingData.date,
                timeSlot: timeSlot,
                parentName: bookingData.parentName,
                parentEmail: bookingData.parentEmail,
                parentPhone: bookingData.parentPhone
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/bookings/assessment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                // Call the parent callback to show success
                onConfirm();
            } else {
                setError(result.message || 'Failed to book assessment. Please try again.');
            }
        } catch (err) {
            console.error('Error submitting booking:', err);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Review & Confirm
            </h2>
            <p className="text-gray-600 mb-8">
                Please review your booking details before confirming
            </p>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-red-900">Booking Error</h4>
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {/* Assessment Summary Card */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Dumbbell className="w-5 h-5 text-blue-600" />
                        Assessment Details
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <Dumbbell className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Program</div>
                                <div className="font-medium text-gray-900">
                                    {programNames[bookingData.program]}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Duration</div>
                                <div className="font-medium text-gray-900">30 minutes</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Child Information */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-green-600" />
                        Child Information
                    </h3>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium text-gray-900">{bookingData.childName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Age:</span>
                            <span className="font-medium text-gray-900">{bookingData.childAge} years old</span>
                        </div>
                        {bookingData.childGender && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Gender:</span>
                                <span className="font-medium text-gray-900">{bookingData.childGender}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Date & Location */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-orange-600" />
                        Date & Location
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-sm text-gray-600">Date</div>
                                <div className="font-medium text-gray-900">
                                    {formatDate(bookingData.date)}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-sm text-gray-600">Time</div>
                                <div className="font-medium text-gray-900">
                                    {timeSlots[bookingData.timeSlot] || bookingData.timeSlot}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-sm text-gray-600">Location</div>
                                <div className="font-medium text-gray-900">
                                    {locationNames[bookingData.location]}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Parent Contact */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-blue-600" />
                        Contact Information
                    </h3>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Parent Name:</span>
                            <span className="font-medium text-gray-900">{bookingData.parentName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium text-gray-900">{bookingData.parentEmail}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium text-gray-900">{bookingData.parentPhone}</span>
                        </div>
                    </div>
                </div>

                {/* Important Notes */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                    <h4 className="font-medium text-yellow-900 mb-3">
                        📋 Important Notes
                    </h4>
                    <ul className="text-sm text-yellow-800 space-y-2">
                        <li>• Please arrive 10 minutes early for check-in</li>
                        <li>• Bring comfortable clothes and water bottle</li>
                        <li>• Parents are welcome to observe the assessment</li>
                        <li>• Free parking is available at all locations</li>
                        <li>• You'll receive a confirmation email shortly</li>
                    </ul>
                </div>

                {/* Confirm Button */}
                <button
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold text-lg py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Confirming Booking...
                        </span>
                    ) : (
                        '✅ Confirm Assessment Booking'
                    )}
                </button>
            </div>
        </div>
    );
}