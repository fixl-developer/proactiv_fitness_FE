'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { FiUsers, FiClock, FiCalendar, FiStar, FiCheckCircle, FiArrowRight, FiMapPin } from 'react-icons/fi'
import BookingForm from '@/components/ui/BookingForm'

const HolidayCampsPage = () => {
    const campTypes = [
        {
            title: 'Half Day Camps',
            description: 'Perfect for younger children or those new to gymnastics. Morning sessions with structured activities.',
            duration: '4 hours (9:00 AM - 1:00 PM)',
            ages: '3-8 years',
            activities: [
                'Basic gymnastics skills',
                'Fun games and activities',
                'Snack time included',
                'Small group instruction',
                'Safety-focused training'
            ],
            price: 'HK$700 per day',
            color: 'from-blue-400 to-blue-600',
            emoji: '🌅'
        },
        {
            title: 'Full Day Camps',
            description: 'Comprehensive day-long programs with gymnastics training, games, and recreational activities.',
            duration: '8 hours (9:00 AM - 5:00 PM)',
            ages: '6-16 years',
            activities: [
                'Intensive gymnastics training',
                'Skill development sessions',
                'Lunch and snacks included',
                'Recreational activities',
                'Progress assessments'
            ],
            price: 'HK$1,200 per day',
            color: 'from-green-400 to-green-600',
            emoji: '☀️'
        },
        {
            title: 'Intensive Training Camps',
            description: 'Advanced camps for serious gymnasts focusing on skill development and competition preparation.',
            duration: '6 hours (10:00 AM - 4:00 PM)',
            ages: '8-16 years',
            activities: [
                'Advanced skill training',
                'Competition preparation',
                'Strength and conditioning',
                'Individual coaching',
                'Performance evaluation'
            ],
            price: 'HK$1,500 per day',
            color: 'from-purple-400 to-purple-600',
            emoji: '🏆'
        }
    ]

    const upcomingCamps = [
        {
            title: 'Christmas Holiday Camp - Week 1',
            dates: 'December 19-23, 2025',
            location: 'Cyberport & Wan Chai',
            spotsAvailable: 15,
            type: 'Half Day & Full Day'
        },
        {
            title: 'Christmas Holiday Camp - Week 2',
            dates: 'December 26-30, 2025',
            location: 'Cyberport & Wan Chai',
            spotsAvailable: 12,
            type: 'Half Day & Full Day'
        },
        {
            title: 'New Year Camp',
            dates: 'January 2-6, 2026',
            location: 'Cyberport & Wan Chai',
            spotsAvailable: 20,
            type: 'All Types'
        }
    ]

    const benefits = [
        {
            icon: FiStar,
            title: 'Skill Development',
            description: 'Focused training sessions to improve gymnastics techniques and abilities.'
        },
        {
            icon: FiUsers,
            title: 'Social Interaction',
            description: 'Meet new friends and develop teamwork skills in a fun environment.'
        },
        {
            icon: FiCheckCircle,
            title: 'Professional Coaching',
            description: 'Expert instruction from qualified gymnastics coaches and instructors.'
        },
        {
            icon: FiClock,
            title: 'Structured Program',
            description: 'Well-organized daily schedules with balanced training and recreation.'
        }
    ]

    return (
        <div className="pt-16">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="/images/programs/holiday-camps-hero.jpg"
                        alt="Holiday Camps"
                        fill
                        className="object-cover"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                                parent.innerHTML = `
                                    <div class="w-full h-full bg-gradient-to-br from-green-600 to-blue-700 flex items-center justify-center">
                                        <span class="text-8xl">🏕️</span>
                                    </div>
                                `;
                            }
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-blue-700 flex items-center justify-center">
                        <span className="text-8xl">🏕️</span>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                </div>

                <div className="relative z-10 text-center text-white px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-6xl font-heading font-bold mb-6"
                    >
                        Holiday Camps
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
                    >
                        Make your school holidays count with action-packed gymnastics camps full of fun, learning, and new friendships
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
                    >
                        <Link
                            href="#camps"
                            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300 transform hover:scale-105"
                        >
                            View Camps
                        </Link>
                        <Link
                            href="#booking"
                            className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold transition-all duration-300"
                        >
                            Book Now
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Camp Types Section */}
            <section id="camps" className="section-padding bg-gray-50">
                <div className="container-max">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
                            Camp Options
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Choose from our variety of camp options designed to suit different ages,
                            skill levels, and schedule preferences.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {campTypes.map((camp, index) => (
                            <motion.div
                                key={camp.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className={`h-32 bg-gradient-to-br ${camp.color} flex items-center justify-center`}>
                                    <span className="text-6xl">{camp.emoji}</span>
                                </div>
                                <div className="p-8">
                                    <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">
                                        {camp.title}
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        {camp.description}
                                    </p>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                            <FiClock className="w-4 h-4" />
                                            <span>{camp.duration}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                            <FiUsers className="w-4 h-4" />
                                            <span>{camp.ages}</span>
                                        </div>
                                        <div className="text-lg font-bold text-primary-600">
                                            {camp.price}
                                        </div>
                                    </div>

                                    <ul className="space-y-2 mb-6">
                                        {camp.activities.map((activity) => (
                                            <li key={activity} className="flex items-center text-sm text-gray-600">
                                                <FiCheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                                                {activity}
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        href="#booking"
                                        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors duration-300 text-center block"
                                    >
                                        Book This Camp
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Upcoming Camps Section */}
            <section className="section-padding bg-white">
                <div className="container-max">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
                            Upcoming Camps
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Don't miss out on our exciting upcoming holiday camps. Book early to secure your spot!
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {upcomingCamps.map((camp, index) => (
                            <motion.div
                                key={camp.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                viewport={{ once: true }}
                                className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 border border-primary-100"
                            >
                                <h3 className="text-lg font-heading font-bold text-gray-900 mb-3">
                                    {camp.title}
                                </h3>
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <FiCalendar className="w-4 h-4" />
                                        <span>{camp.dates}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <FiMapPin className="w-4 h-4" />
                                        <span>{camp.location}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <FiUsers className="w-4 h-4" />
                                        <span>{camp.type}</span>
                                    </div>
                                </div>
                                <div className="text-sm text-green-600 font-medium mb-4">
                                    {camp.spotsAvailable} spots available
                                </div>
                                <Link
                                    href="#booking"
                                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-semibold transition-colors duration-300 text-center block text-sm"
                                >
                                    Book Now
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="section-padding bg-gray-50">
                <div className="container-max">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
                            Why Choose Our Holiday Camps?
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Our holiday camps offer more than just gymnastics training - they provide a complete
                            experience that combines learning, fun, and personal development.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={benefit.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <benefit.icon className="w-8 h-8 text-primary-600" />
                                </div>
                                <h3 className="text-lg font-heading font-bold text-gray-900 mb-2">
                                    {benefit.title}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {benefit.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Booking Section */}
            <section id="booking" className="section-padding bg-white">
                <div className="container-max">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
                            Book Your Holiday Camp
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Ready to make this holiday unforgettable? Book your camp spot today and give your child
                            an amazing gymnastics experience.
                        </p>
                    </motion.div>

                    <div className="max-w-4xl mx-auto">
                        <BookingForm
                            type="camp"
                            title="Book Holiday Camp"
                            subtitle="Secure your child's spot in our exciting holiday gymnastics camps."
                        />
                    </div>
                </div>
            </section>
        </div>
    )
}

export default HolidayCampsPage