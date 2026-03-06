'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export function WhatsAppWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const whatsappNumber = '+1234567890'; // Replace with actual number
    const message = 'Hi! I would like to know more about ProActiv Fitness programs.';

    const handleWhatsAppClick = () => {
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <>
            {/* WhatsApp Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110"
                aria-label="WhatsApp Chat"
            >
                {isOpen ? (
                    <X className="w-8 h-8" />
                ) : (
                    <MessageCircle className="w-8 h-8" />
                )}
            </button>

            {/* Chat Popup */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                    {/* Header */}
                    <div className="bg-green-500 text-white p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                <MessageCircle className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <h3 className="font-bold">ProActiv Fitness</h3>
                                <p className="text-sm text-green-100">
                                    Typically replies instantly
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    <div className="p-6 bg-gray-50">
                        <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                            <p className="text-gray-700 text-sm">
                                👋 Hi there! How can we help you today?
                            </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-gray-600 text-xs mb-3">
                                Get in touch with us on WhatsApp for:
                            </p>
                            <ul className="text-sm text-gray-700 space-y-2">
                                <li>• Program inquiries</li>
                                <li>• Class schedules</li>
                                <li>• Trial bookings</li>
                                <li>• General questions</li>
                            </ul>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="p-4 bg-white border-t">
                        <button
                            onClick={handleWhatsAppClick}
                            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Start Chat
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
