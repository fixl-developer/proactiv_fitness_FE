'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { FiCalendar, FiClock, FiUsers, FiMapPin, FiStar, FiTarget } from 'react-icons/fi'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getRandomImage } from '@/utils/imageUtils'

const GymnasticsCampsPage = () => {
    const campLevels = [
        {
            level: 'Beginner',
            ageGroup: '4-8 years',
            description: 'Perfect introduction to gymnastics in a fun, supportive environment.',
            activities: [
                'Basic tumbling and rolls',
                'Balance beam fundamentals',
                'Vault introduction',
                'Uneven bars basics',
                'Flexibility and strength',
                'Games and activities'
            ],
            objectives: [
                'Build confidence and coordination',
                'Learn basic gymnastics skills',
                'Develop social skills',
                'Have fun while learning'
            ]
        },
        {
            level: 'Advanced',
            ageGroup: '9-16 years',
            description: 'Intensive training for experienced gymnasts looking to advance their skills.',
            activities: [
                'Advanced tumbling sequences',
                'Complex beam routines',
                'Vault progressions',
                'Bar skill development',
                'Conditioning and flexibility',
                'Routine choreography'
            ],
            objectives: [
                'Master advanced techniques',
                'Improve strength and flexibility',
                'Develop competitive skills',
                'Build mental toughness'
            ]
        }
    ]

    const upcomingCamps = [
        {
            id: 1,
            name: 'Christmas Holiday Camp',
            dates: 'Dec 18-22, 2024',
            duration: '5 days',
            time: '9:00 AM - 3:00 PM',
            location: 'Both Locations',
            price: 'HK$2,500',
            level: 'All Levels',
            spotsLeft: 8,
            highlights: ['Christmas themed activities', 'Special performances', 'Holiday crafts']
        },
        {
            id: 2,
            name: 'New Year Skills Camp',
            dates: 'Jan 2-5, 2025',
            duration: '4 days',
            time: '10:00 AM - 4:00 PM',
            location: 'Cyberport',
            price: 'HK$2,200',
            level: 'Intermediate/Advanced',
            spotsLeft: 5,
            highlights: ['Skill assessments', 'Goal setting', 'Progress tracking']
        },
        {
            id: 3,
            name: 'Chinese New Year Camp',
            dates: 'Feb 10-14, 2025',
            duration: '5 days',
            time: '9:00 AM - 3:00 PM',
            location: 'Wan Chai',
            price: 'HK$2,600',
            level: 'All Levels',
            spotsLeft: 12,
            highlights: ['Cultural activities', 'Lion dance workshop', 'Traditional games']
        },
        {
            id: 4,
            name: 'Easter Skills Intensive',
            dates: 'Apr 14-18, 2025',
            duration: '5 days',
            time: '9:00 AM - 4:00 PM',
            location: 'Both Locations',
            price: 'HK$2,800',
            level: 'Advanced',
            spotsLeft: 6,
            highlights: ['Competition prep', 'Advanced skills', 'Mental training']
        }
    ]

    const dailySchedule = [
        { time: '9:00 AM', activity: 'Arrival & Warm-up' },
        { time: '9:30 AM', activity: 'Skill Development Session 1' },
        { time: '10:30 AM', activity: 'Snack Break' },
        { time: '11:00 AM', activity: 'Apparatus Rotation' },
        { time: '12:00 PM', activity: 'Lunch Break' },
        { time: '1:00 PM', activity: 'Games & Activities' },
        { time: '2:00 PM', activity: 'Skill Development Session 2' },
        { time: '2:45 PM', activity: 'Cool Down & Reflection' },
        { time: '3:00 PM', activity: 'Departure' }
    ]

    return (
        <>
            <Header />
            <main className="min-h-screen">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white section-padding overflow-hidden">
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <Image
                            src={getRandomImage('gymnastics camps')}
                            alt="Gymnastics Camps Background"
                            fill
                            className="object-cover opacity-20"
                            onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                    </div>

                    <div className="container-max relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-4xl mx-auto text-center"
                        >
                            <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-6">
                                Gymnastics Holiday Camps
                            </h1>
                            <p className="text-xl text-green-100 mb-8 leading-relaxed">
                                Action-packed holiday camps combining skill development with fun activities.
                                Perfect for gymnasts of all levels to learn, grow, and make new friends during school breaks.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                                <Link id="upcoming-camps" href="#upcoming-camps" className="btn-secondary">
                                    View Upcoming Camps
                                </Link>
                                <Link id="contact" href="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-green-600">
                                    Get More Info
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Camp Levels */}
                <section className="section-padding bg-white">
                    <div className="container-max">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mb-4">
                                Camp Levels
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                We offer camps tailored to different skill levels, ensuring every participant
                                receives appropriate instruction and has an amazing experience.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {campLevels.map((camp, index) => (
                                <motion.div
                                    key={camp.level}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.2, duration: 0.6 }}
                                    viewport={{ once: true }}
                                    className="card p-8"
                                >
                                    <div className="flex items-center space-x-4 mb-6">
                                        <h3 className="text-2xl font-heading font-bold text-gray-900">
                                            {camp.level} Level
                                        </h3>
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                            {camp.ageGroup}
                                        </span>
                                    </div>

                                    <p className="text-gray-600 mb-6 leading-relaxed">
                                        {camp.description}
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                <FiTarget className="w-4 h-4 mr-2 text-green-600" />
                                                Activities Include
                                            </h4>
                                            <ul className="space-y-2">
                                                {camp.activities.map((activity) => (
                                                    <li key={activity} className="flex items-start space-x-2 text-sm text-gray-600">
                                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                                        <span>{activity}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                <FiStar className="w-4 h-4 mr-2 text-green-600" />
                                                Learning Objectives
                                            </h4>
                                            <ul className="space-y-2">
                                                {camp.objectives.map((objective) => (
                                                    <li key={objective} className="flex items-start space-x-2 text-sm text-gray-600">
                                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                                        <span>{objective}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Upcoming Camps */}
                <section id="upcoming-camps" className="section-padding bg-gray-50">
                    <div className="container-max">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mb-4">
                                Upcoming Camps
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Book your spot in our upcoming holiday camps. Limited spaces available –
                                early booking recommended!
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {upcomingCamps.map((camp, index) => (
                                <motion.div
                                    key={camp.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.6 }}
                                    viewport={{ once: true }}
                                    className="card p-6 hover:shadow-2xl transition-all duration-500"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-heading font-bold text-gray-900">
                                            {camp.name}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${camp.spotsLeft <= 5
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-green-100 text-green-700'
                                            }`}>
                                            {camp.spotsLeft} spots left
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                                        <div className="flex items-center space-x-2">
                                            <FiCalendar className="w-4 h-4 text-green-600" />
                                            <span>{camp.dates}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <FiClock className="w-4 h-4 text-green-600" />
                                            <span>{camp.time}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <FiMapPin className="w-4 h-4 text-green-600" />
                                            <span>{camp.location}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <FiUsers className="w-4 h-4 text-green-600" />
                                            <span>{camp.level}</span>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="font-medium text-gray-900 mb-2">Camp Highlights:</h4>
                                        <ul className="space-y-1">
                                            {camp.highlights.map((highlight) => (
                                                <li key={highlight} className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                    <span>{highlight}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="text-2xl font-bold text-green-600">
                                            {camp.price}
                                        </div>
                                        <Link id="camps-gymnastics-nav-book-now"
                                            href={`/camps/book?camp=${camp.id}`}
                                            className="btn-primary"
                                        >
                                            Book Now
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Daily Schedule */}
                <section className="section-padding bg-white">
                    <div className="container-max">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">
                                    Typical Daily Schedule
                                </h2>
                                <p className="text-gray-600 mb-8 leading-relaxed">
                                    Our camps follow a structured yet flexible schedule that balances skill development
                                    with fun activities. Each day is carefully planned to maximize learning while
                                    ensuring participants have an enjoyable experience.
                                </p>

                                <div className="space-y-4">
                                    {dailySchedule.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1, duration: 0.4 }}
                                            viewport={{ once: true }}
                                            className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="w-20 text-sm font-medium text-green-600">
                                                {item.time}
                                            </div>
                                            <div className="text-gray-700">
                                                {item.activity}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                                className="bg-green-50 rounded-2xl p-8"
                            >
                                <h3 className="text-xl font-heading font-bold text-gray-900 mb-6">
                                    What's Included
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">Professional Coaching</div>
                                            <div className="text-sm text-gray-600">Certified instructors with years of experience</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">All Equipment</div>
                                            <div className="text-sm text-gray-600">Access to professional gymnastics apparatus</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">Snacks & Drinks</div>
                                            <div className="text-sm text-gray-600">Healthy refreshments throughout the day</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">Progress Report</div>
                                            <div className="text-sm text-gray-600">Detailed feedback on skills and development</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">Camp T-Shirt</div>
                                            <div className="text-sm text-gray-600">Commemorative shirt for each participant</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">End-of-Camp Show</div>
                                            <div className="text-sm text-gray-600">Showcase skills learned during the camp</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="section-padding bg-gradient-to-r from-green-600 to-green-700 text-white">
                    <div className="container-max text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-heading font-bold mb-4">
                                Ready for an Amazing Camp Experience?
                            </h2>
                            <p className="text-green-100 mb-8 max-w-2xl mx-auto">
                                Don't miss out on our popular holiday camps! Spaces fill up quickly,
                                so secure your child's spot today and give them an unforgettable gymnastics adventure.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                                <Link id="camps-book" href="/camps/book" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
                                    Book Camp Now
                                </Link>
                                <Link id="contact" href="/contact" className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                                    Ask Questions
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}

export default GymnasticsCampsPage
