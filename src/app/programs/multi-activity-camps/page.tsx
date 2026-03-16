'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { FiUsers, FiClock, FiCalendar, FiStar, FiCheckCircle, FiArrowRight, FiMapPin, FiHeart } from 'react-icons/fi'
import BookingForm from '@/components/ui/BookingForm'

const MultiActivityCampsPage = () => {
    const activities = [
        {
            title: 'Gymnastics Training',
            description: 'Core gymnastics skills and techniques',
            icon: '🤸‍♀️',
            color: 'from-blue-400 to-blue-600'
        },
        {
            title: 'Arts & Crafts',
            description: 'Creative projects and artistic expression',
            icon: '🎨',
            color: 'from-purple-400 to-purple-600'
        },
        {
            title: 'Team Sports',
            description: 'Basketball, football, and team games',
            icon: '⚽',
            color: 'from-green-400 to-green-600'
        },
        {
            title: 'Dance & Movement',
            description: 'Rhythmic activities and dance routines',
            icon: '💃',
            color: 'from-pink-400 to-pink-600'
        },
        {
            title: 'Outdoor Adventures',
            description: 'Nature exploration and outdoor games',
            icon: '🌳',
            color: 'from-emerald-400 to-emerald-600'
        },
        {
            title: 'STEM Activities',
            description: 'Science experiments and building projects',
            icon: '🔬',
            color: 'from-orange-400 to-orange-600'
        }
    ]

    const campSchedule = [
        {
            time: '9:00 - 9:30 AM',
            activity: 'Arrival & Morning Circle',
            description: 'Welcome activities and daily briefing'
        },
        {
            time: '9:30 - 10:30 AM',
            activity: 'Gymnastics Session 1',
            description: 'Skill development and training'
        },
        {
            time: '10:30 - 10:45 AM',
            activity: 'Snack Break',
            description: 'Healthy snacks and hydration'
        },
        {
            time: '10:45 - 11:45 AM',
            activity: 'Arts & Crafts',
            description: 'Creative projects and activities'
        },
        {
            time: '11:45 AM - 12:45 PM',
            activity: 'Team Sports',
            description: 'Group games and sports activities'
        },
        {
            time: '12:45 - 1:30 PM',
            activity: 'Lunch Break',
            description: 'Nutritious lunch and rest time'
        },
        {
            time: '1:30 - 2:30 PM',
            activity: 'Gymnastics Session 2',
            description: 'Advanced skills and routines'
        },
        {
            time: '2:30 - 3:30 PM',
            activity: 'Outdoor Activities',
            description: 'Fresh air and nature exploration'
        },
        {
            time: '3:30 - 4:00 PM',
            activity: 'Closing Circle',
            description: 'Reflection and preparation for pickup'
        }
    ]

    const ageGroups = [
        {
            title: 'Little Explorers (Ages 3-5)',
            description: 'Gentle introduction to various activities with focus on fun and exploration.',
            features: [
                'Shorter activity sessions',
                'More rest and snack breaks',
                'Simple craft projects',
                'Basic movement skills',
                'Lots of encouragement'
            ],
            ratio: '1:4 coach to child ratio'
        },
        {
            title: 'Adventure Seekers (Ages 6-8)',
            description: 'Balanced mix of structured activities and free play with skill development focus.',
            features: [
                'Skill-building activities',
                'Team cooperation games',
                'Creative art projects',
                'Basic sports introduction',
                'Independence building'
            ],
            ratio: '1:6 coach to child ratio'
        },
        {
            title: 'Activity Masters (Ages 9-12)',
            description: 'Advanced activities with leadership opportunities and complex projects.',
            features: [
                'Advanced skill training',
                'Leadership roles',
                'Complex art projects',
                'Competitive team games',
                'Goal setting activities'
            ],
            ratio: '1:8 coach to child ratio'
        }
    ]

    const benefits = [
        {
            icon: FiStar,
            title: 'Diverse Skill Development',
            description: 'Exposure to multiple activities helps develop various skills and interests.'
        },
        {
            icon: FiUsers,
            title: 'Social Interaction',
            description: 'Meet children with different interests and build lasting friendships.'
        },
        {
            icon: FiHeart,
            title: 'Confidence Building',
            description: 'Success in various activities builds overall confidence and self-esteem.'
        },
        {
            icon: FiCheckCircle,
            title: 'Well-Rounded Development',
            description: 'Physical, creative, and intellectual growth through diverse activities.'
        }
    ]

    return (
        <div className="pt-16">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="/images/programs/multi-activity-camps-hero.jpg"
                        alt="Multi-Activity Camps"
                        fill
                        className="object-cover"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                                parent.innerHTML = `
                                    <div class="w-full h-full bg-gradient-to-br from-purple-600 to-pink-700 flex items-center justify-center">
                                        <span class="text-8xl">🎨</span>
                                    </div>
                                `;
                            }
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-700 flex items-center justify-center">
                        <span className="text-8xl">🎨</span>
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
                        Multi-Activity Camps
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
                    >
                        Discover new passions with our diverse camps featuring gymnastics, arts, sports, and outdoor adventures
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
                    >
                        <Link
                            href="#activities"
                            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300 transform hover:scale-105"
                        >
                            Explore Activities
                        </Link>
                        <Link
                            href="#booking"
                            className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold transition-all duration-300"
                        >
                            Book Camp
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Activities Section */}
            <section id="activities" className="section-padding bg-gray-50">
                <div className="container-max">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
                            Camp Activities
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Our multi-activity camps offer a perfect blend of physical activities, creative pursuits,
                            and educational experiences to keep children engaged and excited.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {activities.map((activity, index) => (
                            <motion.div
                                key={activity.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className={`h-24 bg-gradient-to-br ${activity.color} flex items-center justify-center`}>
                                    <span className="text-4xl">{activity.icon}</span>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-heading font-bold text-gray-900 mb-2">
                                        {activity.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {activity.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Daily Schedule Section */}
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
                            Daily Schedule
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Our structured daily schedule ensures a perfect balance of activities,
                            rest periods, and nutritious meals throughout the day.
                        </p>
                    </motion.div>

                    <div className="max-w-4xl mx-auto">
                        <div className="space-y-4">
                            {campSchedule.map((item, index) => (
                                <motion.div
                                    key={item.time}
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.6 }}
                                    viewport={{ once: true }}
                                    className="bg-gray-50 rounded-xl p-6 flex items-center space-x-6"
                                >
                                    <div className="flex-shrink-0">
                                        <div className="w-20 text-center">
                                            <div className="text-sm font-semibold text-primary-600">
                                                {item.time}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            {item.activity}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            {item.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Age Groups Section */}
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
                            Age-Appropriate Programs
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Our camps are tailored to different age groups, ensuring activities are
                            developmentally appropriate and engaging for each child.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {ageGroups.map((group, index) => (
                            <motion.div
                                key={group.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-2xl shadow-lg p-8"
                            >
                                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">
                                    {group.title}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {group.description}
                                </p>

                                <ul className="space-y-2 mb-6">
                                    {group.features.map((feature) => (
                                        <li key={feature} className="flex items-center text-sm text-gray-600">
                                            <FiCheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <div className="bg-primary-50 rounded-lg p-3">
                                    <div className="text-sm font-semibold text-primary-700">
                                        {group.ratio}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
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
                            Why Choose Multi-Activity Camps?
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Our diverse approach to camp activities provides children with opportunities
                            to discover new interests and develop a wide range of skills.
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

            {/* Pricing Section */}
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
                            Camp Pricing
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Affordable pricing with excellent value for comprehensive multi-activity programs.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-2xl shadow-lg p-8 text-center"
                        >
                            <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                                Half Day Camp
                            </h3>
                            <div className="text-4xl font-bold text-primary-600 mb-2">
                                HK$800
                            </div>
                            <div className="text-gray-500 mb-6">per day (9:00 AM - 1:00 PM)</div>
                            <ul className="space-y-2 text-sm text-gray-600 mb-8">
                                <li>✓ 4 hours of activities</li>
                                <li>✓ Snack included</li>
                                <li>✓ All materials provided</li>
                                <li>✓ Professional supervision</li>
                            </ul>
                            <Link
                                href="#booking"
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors duration-300 block"
                            >
                                Book Half Day
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-2xl shadow-lg p-8 text-center border-2 border-primary-200"
                        >
                            <div className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4 inline-block">
                                Most Popular
                            </div>
                            <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                                Full Day Camp
                            </h3>
                            <div className="text-4xl font-bold text-primary-600 mb-2">
                                HK$1,300
                            </div>
                            <div className="text-gray-500 mb-6">per day (9:00 AM - 4:00 PM)</div>
                            <ul className="space-y-2 text-sm text-gray-600 mb-8">
                                <li>✓ 7 hours of activities</li>
                                <li>✓ Lunch and snacks included</li>
                                <li>✓ All materials provided</li>
                                <li>✓ Extended outdoor time</li>
                            </ul>
                            <Link
                                href="#booking"
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors duration-300 block"
                            >
                                Book Full Day
                            </Link>
                        </motion.div>
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
                            Book Your Multi-Activity Camp
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Give your child the opportunity to explore, learn, and grow through our
                            exciting multi-activity camp experience.
                        </p>
                    </motion.div>

                    <div className="max-w-4xl mx-auto">
                        <BookingForm
                            type="camp"
                            title="Book Multi-Activity Camp"
                            subtitle="Join our diverse and exciting multi-activity camp program."
                        />
                    </div>
                </div>
            </section>
        </div>
    )
}

export default MultiActivityCampsPage