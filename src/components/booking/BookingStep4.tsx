'use client';

import Link from 'next/link';

interface BookingStep4Props {
    bookingId: string;
    classDetails: {
        name: string;
        date: string;
        time: string;
        location: string;
    };
    studentName: string;
    packageName: string;
    amount: number;
}

export default function BookingStep4({
    bookingId,
    classDetails,
    studentName,
    packageName,
    amount,
}: BookingStep4Props) {
    return (
        <div className="space-y-6 text-center">
            {/* Success Icon */}
            <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                        className="w-12 h-12 text-green-500"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
            </div>

            {/* Success Message */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Booking Confirmed!</h2>
                <p className="mt-2 text-gray-600">
                    Your booking has been successfully confirmed
                </p>
            </div>

            {/* Booking Details Card */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-left space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-sm text-gray-600">Booking ID</span>
                    <span className="font-mono font-semibold text-gray-900">
                        #{bookingId}
                    </span>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Student</span>
                        <span className="font-medium text-gray-900">{studentName}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-600">Class</span>
                        <span className="font-medium text-gray-900">{classDetails.name}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-600">Date & Time</span>
                        <span className="font-medium text-gray-900">
                            {classDetails.date} at {classDetails.time}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-600">Location</span>
                        <span className="font-medium text-gray-900">{classDetails.location}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-600">Package</span>
                        <span className="font-medium text-gray-900">{packageName}</span>
                    </div>

                    <div className="flex justify-between pt-3 border-t">
                        <span className="text-gray-900 font-semibold">Total Paid</span>
                        <span className="text-xl font-bold text-green-600">
                            ${amount.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Information Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <div className="flex">
                    <svg
                        className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">What's Next?</p>
                        <ul className="space-y-1 text-blue-700">
                            <li>• A confirmation email has been sent to your registered email</li>
                            <li>• Please arrive 10 minutes before the class starts</li>
                            <li>• Bring comfortable clothing and water bottle</li>
                            <li>• You can view or cancel this booking from "My Bookings"</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link id="booking-booking-step4-nav-my-bookings"
                    href="/my-bookings"
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                    View My Bookings
                </Link>
                <Link id="booking-booking-step4-nav-classes"
                    href="/classes"
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-center"
                >
                    Book Another Class
                </Link>
            </div>

            {/* Download/Print Options */}
            <div className="flex justify-center gap-4 pt-4">
                <button id="booking-booking-step4-btn" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                    <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    Download Receipt
                </button>
                <button id="booking-booking-step4-btn-2" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                    <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                    </svg>
                    Print Confirmation
                </button>
            </div>
        </div>
    );
}
