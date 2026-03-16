'use client';

import { Star, Shield, Users, Clock } from 'lucide-react';

interface BookAssessmentHeroProps {
    onStartBooking: () => void;
}

export default function BookAssessmentHero({ onStartBooking }: BookAssessmentHeroProps) {
    return (
        <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 py-20">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
                <div className="absolute top-32 right-20 w-16 h-16 bg-yellow-300 rounded-full"></div>
                <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-green-300 rounded-full"></div>
                <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-orange-300 rounded-full"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    {/* Main Title */}
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Book a <span className="text-yellow-300">Free Assessment</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                        Discover your child's potential with our expert coaches.
                        Get personalized program recommendations in just 30 minutes!
                    </p>

                    {/* Trust Elements */}
                    <div className="flex flex-wrap justify-center gap-6 mb-10">
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
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={onStartBooking}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                        Start Booking Now
                    </button>

                    {/* Additional Info */}
                    <p className="text-blue-100 mt-4 text-sm">
                        ✨ No commitment required • Free consultation • Instant booking
                    </p>
                </div>
            </div>
        </section>
    );
}
