'use client';

import { useState } from 'react';
import { Target, MessageCircle, Award, Clock, Calendar, MapPin, Users, Star, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AssessmentDetailsModalProps {
    assessment: any;
    isOpen: boolean;
    onClose: () => void;
    onBookNow: () => void;
}

function AssessmentDetailsModal({ assessment, isOpen, onClose, onBookNow }: AssessmentDetailsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="relative">
                    <img
                        src={assessment.image}
                        alt={assessment.title}
                        className="w-full h-64 object-cover rounded-t-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-t-2xl"></div>

                    {/* Close Button */}
                    <button id="assessment-modal-close-btn"
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Price Badge */}
                    <div className="absolute top-4 left-4">
                        <div className={`px-4 py-2 rounded-full text-white font-semibold bg-gradient-to-r ${assessment.color}`}>
                            {assessment.price}
                        </div>
                    </div>

                    {/* Title Overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <h2 className="text-2xl font-bold text-white mb-2">{assessment.title}</h2>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Description */}
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        {assessment.description}
                    </p>

                    {/* Details Grid */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-500" />
                            <div>
                                <div className="font-medium text-gray-900">Time Slots</div>
                                <div className="text-sm text-gray-600">{assessment.ageRange}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <MapPin className="w-5 h-5 text-green-500" />
                            <div>
                                <div className="font-medium text-gray-900">Location</div>
                                <div className="text-sm text-gray-600">{assessment.location}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Users className="w-5 h-5 text-purple-500" />
                            <div>
                                <div className="font-medium text-gray-900">Duration</div>
                                <div className="text-sm text-gray-600">{assessment.duration}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Star className="w-5 h-5 text-yellow-500" />
                            <div>
                                <div className="font-medium text-gray-900">Age Group</div>
                                <div className="text-sm text-gray-600">18 months - 6 years</div>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3">What's Included:</h3>
                        <div className="grid md:grid-cols-2 gap-2">
                            {assessment.features.map((feature: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-gray-600 capitalize">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Additional Benefits */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Assessment Benefits:</h3>
                        <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <span>✅</span> Personalized program recommendation
                            </div>
                            <div className="flex items-center gap-2">
                                <span>✅</span> Meet your child's coach
                            </div>
                            <div className="flex items-center gap-2">
                                <span>✅</span> Understand skill level
                            </div>
                            <div className="flex items-center gap-2">
                                <span>✅</span> No pressure environment
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button id="assessment-modal-dismiss-btn"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                        <button id="assessment-modal-book-btn"
                            onClick={onBookNow}
                            className={`flex-1 py-3 px-4 rounded-lg text-white font-medium bg-gradient-to-r ${assessment.color} hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                        >
                            Book This Assessment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface WhatIsAssessmentProps {
    onStartBooking?: () => void;
}

export default function WhatIsAssessment({ onStartBooking }: WhatIsAssessmentProps) {
    const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter()

    // Check if user is authenticated by checking localStorage
    const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('authToken')

    const assessmentTypes = [
        {
            id: 'gymnastics-assessment',
            title: 'Gymnastics Assessment',
            description: 'Let your child up to 6 years learn from Day One! 30 minute assessment sessions are designed for children aged 18 months to 6 years.',
            ageRange: '18-30 pm • 1:00 pm',
            location: 'Cyberport',
            duration: '30 minutes',
            price: 'FREE',
            image: '/images/hero/gymnastics-1.jpg',
            features: ['Skill evaluation', 'Coach interaction', 'Program recommendation'],
            color: 'from-blue-500 to-cyan-500'
        },
        {
            id: 'recreational-assessment',
            title: 'Recreational Assessment',
            description: 'Let your child up to 6 years learn from Day One! 30 minute assessment sessions are designed for children aged 18 months to 6 years.',
            ageRange: '2:00 pm • 2:30 pm',
            location: 'Cyberport',
            duration: '30 minutes',
            price: 'FREE',
            image: '/images/hero/gymnastics-2.jpg',
            features: ['Fun activities', 'Social interaction', 'Basic skills'],
            color: 'from-purple-500 to-pink-500'
        },
        {
            id: 'competitive-assessment',
            title: 'Competitive Assessment',
            description: 'Let your child up to 6 years learn from Day One! 30 minute assessment sessions are designed for children aged 18 months to 6 years.',
            ageRange: '3:00 pm • 3:30 pm',
            location: 'Wan Chai',
            duration: '30 minutes',
            price: 'FREE',
            image: '/images/hero/gymnastics-3.jpg',
            features: ['Advanced skills', 'Competition prep', 'Intensive training'],
            color: 'from-green-500 to-emerald-500'
        }
    ];

    const assessmentFeatures = [
        {
            icon: Target,
            title: "Skill Evaluation",
            description: "Our coaches assess your child's current abilities, coordination, and physical development to understand their starting point.",
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: MessageCircle,
            title: "Coach Interaction",
            description: "One-on-one time with experienced coaches who specialize in working with children and creating positive experiences.",
            color: "from-purple-500 to-pink-500"
        },
        {
            icon: Award,
            title: "Program Recommendation",
            description: "Based on the assessment, we'll recommend the perfect program that matches your child's interests and skill level.",
            color: "from-green-500 to-emerald-500"
        },
        {
            icon: Clock,
            title: "30-Minute Session",
            description: "Quick and engaging session designed to keep children interested while gathering all the information we need.",
            color: "from-orange-500 to-red-500"
        }
    ];

    const handleMoreInfo = (assessment: any) => {
        setSelectedAssessment(assessment);
        setIsModalOpen(true);
    };

    const handleBookNow = () => {
        // Check authentication when user tries to book
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        setIsModalOpen(false);
        if (onStartBooking) {
            onStartBooking();
        }
        // Scroll to top when booking starts
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAssessment(null);
    };

    return (
        <>
            <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Available Assessments
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Choose from our range of free assessment sessions designed to find the perfect program for your child
                        </p>
                    </div>

                    {/* Assessment Types Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                        {assessmentTypes.map((assessment, index) => (
                            <div
                                key={assessment.id}
                                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 flex flex-col h-full"
                            >
                                {/* Image */}
                                <div className="relative h-48 overflow-hidden flex-shrink-0">
                                    <img
                                        src={assessment.image}
                                        alt={assessment.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                                    {/* Price Badge */}
                                    <div className="absolute top-4 right-4">
                                        <div className={`px-3 py-1 rounded-full text-white text-sm font-semibold bg-gradient-to-r ${assessment.color}`}>
                                            {assessment.price}
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                                        {assessment.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4 leading-relaxed flex-grow">
                                        {assessment.description}
                                    </p>

                                    {/* Details */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Clock className="w-4 h-4" />
                                            <span>{assessment.ageRange}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <MapPin className="w-4 h-4" />
                                            <span>{assessment.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Users className="w-4 h-4" />
                                            <span>{assessment.duration}</span>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {assessment.features.map((feature, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                            >
                                                {feature}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Action Buttons - Always at bottom */}
                                    <div className="flex gap-2 mt-auto">
                                        <button id={`assessment-${assessment.id}-info-btn`}
                                            onClick={() => handleMoreInfo(assessment)}
                                            className="flex-1 py-2 px-3 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            More Info
                                        </button>
                                        <button id={`assessment-${assessment.id}-book-btn`}
                                            onClick={() => {
                                                if (!isAuthenticated) {
                                                    router.push('/login')
                                                    return
                                                }
                                                handleBookNow()
                                            }}
                                            className={`flex-1 py-2 px-3 rounded-lg text-white text-sm font-medium bg-gradient-to-r ${assessment.color} hover:shadow-lg transition-all duration-300`}
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* What is Assessment Section */}
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            What is an Assessment?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Our free assessment is designed to help us understand your child's unique needs
                            and recommend the best program for their development and enjoyment.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {assessmentFeatures.map((feature, index) => {
                            const IconComponent = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200"
                                >
                                    {/* Icon */}
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <IconComponent className="w-8 h-8 text-white" />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Bottom CTA */}
                    <div className="text-center mt-16">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-4xl mx-auto">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Ready to Get Started?
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Book your free assessment today and take the first step towards your child's sports journey!
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    ✅ No equipment needed
                                </span>
                                <span className="flex items-center gap-1">
                                    ✅ Parent can observe
                                </span>
                                <span className="flex items-center gap-1">
                                    ✅ Flexible scheduling
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Assessment Details Modal */}
            <AssessmentDetailsModal
                assessment={selectedAssessment}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onBookNow={handleBookNow}
            />
        </>
    );
}
