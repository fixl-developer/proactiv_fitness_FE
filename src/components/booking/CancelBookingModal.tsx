'use client';

import { useState } from 'react';

interface CancelBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    bookingId: string;
    className: string;
}

export default function CancelBookingModal({
    isOpen,
    onClose,
    onConfirm,
    bookingId,
    className,
}: CancelBookingModalProps) {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsSubmitting(true);
        await onConfirm(reason);
        setIsSubmitting(false);
        setReason('');
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div id="booking-cancel-booking-modal-div-clickable"
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    {/* Close Button */}
                    <button id="booking-cancel-booking-modal-btn"
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>

                    {/* Warning Icon */}
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-10 h-10 text-red-600"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Cancel Booking?
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to cancel this booking?
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 text-left">
                            <p className="text-sm text-gray-700">
                                <span className="font-semibold">Booking ID:</span> #{bookingId}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                                <span className="font-semibold">Class:</span> {className}
                            </p>
                        </div>
                    </div>

                    {/* Cancellation Reason */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for Cancellation (Optional)
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            placeholder="Please let us know why you're cancelling..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Cancellation Policy */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex">
                            <svg
                                className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <div className="text-sm text-yellow-800">
                                <p className="font-medium mb-1">Cancellation Policy</p>
                                <ul className="space-y-1 text-yellow-700">
                                    <li>• Free cancellation up to 24 hours before class</li>
                                    <li>• 50% refund for cancellations within 24 hours</li>
                                    <li>• No refund for no-shows</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button id="booking-cancel-booking-modal-btn-keep-booking"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Keep Booking
                        </button>
                        <button id="booking-cancel-booking-modal-btn-2"
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? 'Cancelling...' : 'Yes, Cancel'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
