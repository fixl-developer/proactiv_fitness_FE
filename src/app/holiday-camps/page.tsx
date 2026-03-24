'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { FiCalendar, FiClock, FiUsers, FiStar, FiMapPin } from 'react-icons/fi'
import { getRandomImage } from '@/utils/imageUtils'

const HolidayCampsPage = () => {
    const campTypes = [
        {
            id: 'gymnastics',
            title: 'Gymnastics Camps',
            description: 'Intensive gymnastics skill development with professional coaching',
            image: '/images/camps/gymnastics-camp.jpg',
            ages: '4-12 years',
            duration: 'Half Day (9am-1pm) or Full Day (9am-4pm)',
            price: 'From HK$400/day',
            features: [
                'Professional gymnastics coaching',
                'Skill development focus',
                'Equipment training',
                'Progress assessment',
                'Certificate of participation'
            ]
        },
        {
            id: 'multi-activity',
            title: 'Multi-Activity Camps',
            description: 'Diverse sports and activities for well-rounded development',
            image: '/images/camps/multi-activity-camp.jpg',
            ages: '5-10 years',
            duration: 'Full Day (9am-4pm)',
            price: 'From HK$500/day',
            features: [
                'Various sports activities',
                'Team building games',
                'Creative arts & crafts',
                'Swimming (selected venues)',
                'Lunch included'
            ]
        },
        {
            id: 'elite',
            title: 'Elite Training Camps',
            description: 'Advanced training for competitive gymnasts',
            image: '/images/camps/elite-camp.jpg',
            ages: '8+ years',
            duration: 'Extended Day (9am-5pm)',
            price: 'From HK$600/day',
            features: [
                'Elite level coaching',
                'Competition preparation',
                'Advanced skill training',
                'Video analysis',
                'Nutrition guidance'
            ]
        }
    ]

    const upcomingCamps = [
        {
            name: 'Christmas Holiday Camp',
            dates: 'December 18-22, 2024',
            location: 'Both Locations',
            status: 'Open for Booking'
        },
        {
            name: 'Easter Holiday Camp',
            dates: 'April 1-5, 2025',
            location: 'Both Locations',
            status: 'Early Bird Available'
        },
        {
            name: 'Summer Holiday Camp',
            dates: 'July 15 - August 15, 2025',
            location: 'Both Locations',
            status: 'Coming Soon'
        }
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-700 flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <Image
                        src={getRandomImage('holiday camps')}
                        alt="Holiday Camps Background"
                        fill
                        className="object-cover opacity-30"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                </div>
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="relative z-10 text-center text-white px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-4"
                    >
                        Holiday Gymnastics Camps
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl max-w-2xl mx-auto"
                    >
                        Action-packed holidays filled with fun, learning, and skill development
                    </motion.p>
                </div>
            </section>

            {/* Camp Types Section */}
            <section className="py-16 px-4">
                <div className="container-max">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Choose Your Camp Adventure</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Professional coaching, safe environment, and unforgettable experiences await your child
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {campTypes.map((camp, index) => (
                            <motion.div
                                key={camp.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <div className="text-white text-center">
                                        <FiStar className="w-12 h-12 mx-auto mb-2" />
                                        <h3 className="text-xl font-bold">{camp.title}</h3>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <p className="text-gray-600 mb-4">{camp.description}</p>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <FiUsers className="w-4 h-4 mr-2" />
                                            Ages: {camp.ages}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <FiClock className="w-4 h-4 mr-2" />
                                            {camp.duration}
                                        </div>
                                        <div className="flex items-center text-sm font-semibold text-blue-600">
                                            <span>{camp.price}</span>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <h4 className="font-semibold mb-2">What's Included:</h4>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            {camp.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-center">
                                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <Link id="holiday-camps-nav-book-this-camp"
                                        href={`/book-camp?type=${camp.id}`}
                                        className="w-full btn-primary text-center block"
                                    >
                                        Book This Camp
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Upcoming Camps Schedule */}
            <section className="py-16 bg-white">
                <div className="container-max px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Upcoming Camp Dates</h2>
                        <p className="text-gray-600">Plan ahead and secure your child's spot in our popular camps</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {upcomingCamps.map((camp, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-100"
                            >
                                <div className="flex items-center mb-3">
                                    <FiCalendar className="w-5 h-5 text-blue-600 mr-2" />
                                    <h3 className="font-semibold text-gray-800">{camp.name}</h3>
                                </div>
                                <p className="text-gray-600 mb-2">{camp.dates}</p>
                                <div className="flex items-center text-sm text-gray-600 mb-3">
                                    <FiMapPin className="w-4 h-4 mr-1" />
                                    {camp.location}
                                </div>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${camp.status === 'Open for Booking'
                                    ? 'bg-green-100 text-green-800'
                                    : camp.status === 'Early Bird Available'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {camp.status}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What to Expect Section */}
            <section className="py-16 bg-gray-50">
                <div className="container-max px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">What to Expect</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiUsers className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="font-semibold mb-2">Professional Coaching</h3>
                            <p className="text-gray-600 text-sm">Qualified instructors with years of experience</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiStar className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="font-semibold mb-2">Skill Development</h3>
                            <p className="text-gray-600 text-sm">Progressive learning tailored to each child's level</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiClock className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="font-semibold mb-2">Flexible Timing</h3>
                            <p className="text-gray-600 text-sm">Half-day and full-day options available</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiMapPin className="w-8 h-8 text-orange-600" />
                            </div>
                            <h3 className="font-semibold mb-2">Premium Facilities</h3>
                            <p className="text-gray-600 text-sm">State-of-the-art equipment and safe environment</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
                <div className="container-max px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Book Your Child's Adventure?</h2>
                    <p className="text-xl mb-8 opacity-90">
                        Spaces fill up quickly! Secure your child's spot today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link id="book-camp" href="/book-camp" className="btn-secondary">
                            Book Camp Now
                        </Link>
                        <Link id="contact" href="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-blue-600">
                            Ask Questions
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default HolidayCampsPage
