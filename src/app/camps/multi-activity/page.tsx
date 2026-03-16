'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { FiCalendar, FiClock, FiUsers, FiMapPin, FiStar, FiTarget, FiHeart } from 'react-icons/fi'
import { getRandomImage } from '@/utils/imageUtils'

const MultiActivityCampsPage = () => {
    const activities = [
        {
            name: 'Gymnastics',
            description: 'Core gymnastics skills and apparatus training',
            icon: '🤸‍♀️',
            skills: ['Tumbling', 'Balance beam', 'Vault', 'Uneven bars']
        },
        {
            name: 'Sports Games',
            description: 'Team sports and competitive games',
            icon: '⚽',
            skills: ['Football', 'Basketball', 'Dodgeball', 'Relay races']
        },
        {
            name: 'Arts & Crafts',
            description: 'Creative projects and artistic expression',
            icon: '🎨',
            skills: ['Painting', 'Sculpture', 'Jewelry making', 'Decorations']
        },
        {
            name: 'Dance & Movement',
            description: 'Rhythmic activities and choreography',
            icon: '💃',
            skills: ['Hip hop', 'Contemporary', 'Jazz', 'Creative movement']
        },
        {
            name: 'Outdoor Adventures',
            description: 'Nature activities and exploration',
            icon: '🏕️',
            skills: ['Treasure hunts', 'Nature walks', 'Outdoor games', 'Team challenges']
        },
        {
            name: 'STEM Activities',
            description: 'Science experiments and building projects',
            icon: '🔬',
            skills: ['Simple experiments', 'Building challenges', 'Problem solving', 'Discovery games']
        }
    ]

    const upcomingCamps = [
        {
            id: 1,
            name: 'Winter Multi-Activity Camp',
            dates: 'Dec 18-22, 2024',
            duration: '5 days',
            time: '9:00 AM - 4:00 PM',
            location: 'Both Locations',
            price: 'HK$2,800',
            ageGroup: '5-12 years',
            spotsLeft: 10,
            highlights: ['Winter sports', 'Holiday crafts', 'Special performances']
        },
        {
            id: 2,
            name: 'Adventure Explorer Camp',
            dates: 'Jan 8-12, 2025',
            duration: '5 days',
            time: '9:00 AM - 4:00 PM',
            location: 'Cyberport',
            price: 'HK$2,900',
            ageGroup: '6-14 years',
            spotsLeft: 8,
            highlights: ['Outdoor adventures', 'Team building', 'Leadership skills']
        },
        {
            id: 3,
            name: 'Creative Arts Camp',
            dates: 'Feb 17-21, 2025',
            duration: '5 days',
            time: '10:00 AM - 3:00 PM',
            location: 'Wan Chai',
            price: 'HK$2,600',
            ageGroup: '4-10 years',
            spotsLeft: 12,
            highlights: ['Art exhibitions', 'Creative projects', 'Performance showcase']
        },
        {
            id: 4,
            name: 'Sports & Science Camp',
            dates: 'Apr 21-25, 2025',
            duration: '5 days',
            time: '9:00 AM - 4:00 PM',
            location: 'Both Locations',
            price: 'HK$3,000',
            ageGroup: '7-15 years',
            spotsLeft: 6,
            highlights: ['Sports science', 'Experiments', 'Technology integration']
        }
    ]

    const dailySchedule = [
        { time: '9:00 AM', activity: 'Arrival & Morning Circle' },
        { time: '9:30 AM', activity: 'Gymnastics Session' },
        { time: '10:30 AM', activity: 'Snack Break' },
        { time: '11:00 AM', activity: 'Sports & Games' },
        { time: '12:00 PM', activity: 'Lunch Break' },
        { time: '1:00 PM', activity: 'Arts & Crafts' },
        { time: '2:00 PM', activity: 'Dance & Movement' },
        { time: '2:45 PM', activity: 'Outdoor Activities' },
        { time: '3:30 PM', activity: 'Reflection & Sharing' },
        { time: '4:00 PM', activity: 'Departure' }
    ]

    return (
        <div className="pt-20">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-purple-600 to-purple-800 text-white section-padding overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <Image
                        src={getRandomImage('multi activity camps')}
                        alt="Multi Activity Camps Background"
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
                            Multi-Activity Holiday Camps
                        </h1>
                        <p className="text-xl text-purple-100 mb-8 leading-relaxed">
                            The ultimate holiday experience combining gymnastics, sports, arts, dance, and outdoor adventures.
                            Perfect for children who love variety and want to explore different activities in a fun, supportive environment.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link href="#upcoming-camps" className="btn-secondary">
                                View Upcoming Camps
                            </Link>
                            <Link href="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-purple-600">
                                Get More Info
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Activities Overview */}
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
                            Diverse Activities for Every Interest
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Our multi-activity camps offer a perfect blend of physical activities, creative pursuits,
                            and educational experiences designed to engage children with different interests and learning styles.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {activities.map((activity, index) => (
                            <motion.div
                                key={activity.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                viewport={{ once: true }}
                                className="card p-6 text-center hover:shadow-2xl transition-all duration-500"
                            >
                                <div className="text-6xl mb-4">{activity.icon}</div>
                                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">
                                    {activity.name}
                                </h3>
                                <p className="text-gray-600 mb-4 leading-relaxed">
                                    {activity.description}
                                </p>
                                <div className="space-y-2">
                                    {activity.skills.map((skill) => (
                                        <div key={skill} className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                            <span>{skill}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="section-padding bg-gray-50">
                <div className="container-max">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">
                                Why Choose Multi-Activity Camps?
                            </h2>
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <FiTarget className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Discover New Interests</h3>
                                        <p className="text-gray-600 text-sm">
                                            Exposure to various activities helps children discover their passions and develop new skills.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <FiUsers className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Social Development</h3>
                                        <p className="text-gray-600 text-sm">
                                            Working in groups and trying new activities together builds confidence and social skills.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <FiStar className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Well-Rounded Development</h3>
                                        <p className="text-gray-600 text-sm">
                                            Combination of physical, creative, and intellectual activities promotes holistic growth.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <FiHeart className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Fun & Engagement</h3>
                                        <p className="text-gray-600 text-sm">
                                            Variety keeps children engaged and excited throughout the entire camp experience.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <div className="aspect-[4/5] bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                                    <div className="text-white text-center">
                                        <div className="text-6xl mb-4">🌟</div>
                                        <p className="text-lg font-medium">Multi-Activity Fun</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Upcoming Camps */}
            <section id="upcoming-camps" className="section-padding bg-white">
                <div className="container-max">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mb-4">
                            Upcoming Multi-Activity Camps
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Join our exciting multi-activity camps where every day brings new adventures,
                            learning opportunities, and fun experiences.
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
                                        : 'bg-purple-100 text-purple-700'
                                        }`}>
                                        {camp.spotsLeft} spots left
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                                    <div className="flex items-center space-x-2">
                                        <FiCalendar className="w-4 h-4 text-purple-600" />
                                        <span>{camp.dates}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <FiClock className="w-4 h-4 text-purple-600" />
                                        <span>{camp.time}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <FiMapPin className="w-4 h-4 text-purple-600" />
                                        <span>{camp.location}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <FiUsers className="w-4 h-4 text-purple-600" />
                                        <span>{camp.ageGroup}</span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Camp Highlights:</h4>
                                    <ul className="space-y-1">
                                        {camp.highlights.map((highlight) => (
                                            <li key={highlight} className="flex items-center space-x-2 text-sm text-gray-600">
                                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                                <span>{highlight}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {camp.price}
                                    </div>
                                    <Link
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
            <section className="section-padding bg-gray-50">
                <div className="container-max">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">
                                A Day Full of Adventures
                            </h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Each day is carefully structured to provide a perfect balance of activities,
                                ensuring children stay engaged while having plenty of opportunities to rest and recharge.
                            </p>

                            <div className="space-y-4">
                                {dailySchedule.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.4 }}
                                        viewport={{ once: true }}
                                        className="flex items-center space-x-4 p-3 bg-white rounded-lg shadow-sm"
                                    >
                                        <div className="w-20 text-sm font-medium text-purple-600">
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
                            className="bg-purple-50 rounded-2xl p-8"
                        >
                            <h3 className="text-xl font-heading font-bold text-gray-900 mb-6">
                                What's Included
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">All Activities</div>
                                        <div className="text-sm text-gray-600">Access to all scheduled activities and materials</div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">Professional Supervision</div>
                                        <div className="text-sm text-gray-600">Qualified staff for all activity areas</div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">Meals & Snacks</div>
                                        <div className="text-sm text-gray-600">Nutritious lunch and healthy snacks</div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">Take-Home Projects</div>
                                        <div className="text-sm text-gray-600">Arts and crafts creations to keep</div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">Camp T-Shirt</div>
                                        <div className="text-sm text-gray-600">Commemorative shirt for each participant</div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">Showcase Event</div>
                                        <div className="text-sm text-gray-600">End-of-camp presentation for families</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-padding bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                <div className="container-max text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-heading font-bold mb-4">
                            Give Your Child the Ultimate Holiday Experience
                        </h2>
                        <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
                            Our multi-activity camps provide the perfect blend of fun, learning, and adventure.
                            Book now to secure your child's spot in an unforgettable holiday experience!
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link href="/camps/book" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
                                Book Camp Now
                            </Link>
                            <Link href="/contact" className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                                Ask Questions
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}

export default MultiActivityCampsPage