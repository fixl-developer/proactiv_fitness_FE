'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Shield, Users, Clock } from 'lucide-react';
import Header from '@/components/layout/Header';
import WhatIsAssessment from '@/components/booking/WhatIsAssessment';
import BookingFlow from '@/components/booking/BookingFlow';
import BookingConfirmation from '@/components/booking/BookingConfirmation';

export default function BookAssessmentPage() {
    const [showBookingFlow, setShowBookingFlow] = useState(false);
    const [bookingComplete, setBookingComplete] = useState(false);
    const [bookingData, setBookingData] = useState(null);

    const handleStartBooking = () => {
        setShowBookingFlow(true);
        // Scroll to top when booking flow starts
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBookingComplete = (data: any) => {
        setBookingData(data);
        setBookingComplete(true);
    };

    const handleBackToStart = () => {
        setShowBookingFlow(false);
        setBookingComplete(false);
        setBookingData(null);
    };

    if (bookingComplete) {
        return (
            <BookingConfirmation
                bookingData={bookingData}
                onBackToStart={handleBackToStart}
            />
        );
    }

    return (
        <>
            <Header hideBookAssessment={true} />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
                {!showBookingFlow ? (
                    <>
                        {/* Modern Header with Background Image */}
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6 }}
                            className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden"
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

                                    {/* Quick Stats */}
                                    <motion.div
                                        initial={{ y: 30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.8, duration: 0.5 }}
                                        className="flex flex-wrap justify-center gap-8 text-white mb-8"
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

                                    {/* CTA Button */}
                                    <motion.button
                                        onClick={handleStartBooking}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 1, duration: 0.5 }}
                                        className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                    >
                                        Start Free Assessment
                                    </motion.button>

                                    {/* Additional Info */}
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1.2, duration: 0.5 }}
                                        className="text-blue-100 mt-4 text-sm"
                                    >
                                        ✨ No commitment required • Free consultation • Instant booking
                                    </motion.p>
                                </div>
                            </div>
                        </motion.div>
                        <WhatIsAssessment onStartBooking={handleStartBooking} />
                    </>
                ) : (
                    <BookingFlow
                        onComplete={handleBookingComplete}
                        onBack={handleBackToStart}
                    />
                )}
            </div>
        </>
    );
}