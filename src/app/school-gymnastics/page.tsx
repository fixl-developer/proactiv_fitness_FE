'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiClock, FiUsers, FiTarget, FiStar, FiMapPin, FiCalendar } from 'react-icons/fi'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PageHero from '@/components/sections/PageHero'
import TeamPreview from '@/components/sections/TeamPreview'

const SchoolGymnasticsPage = () => {
    const programLevels = [
        {
            level: 'Beginner',
            ageGroup: '3-6 years',
            duration: '45 minutes',
            classSize: '6-8 students',
            price: 'HK$800/month',
            description: 'Perfect introduction to gymnastics focusing on basic movements, coordination, and fun.',
            objectives: [
                'Develop basic motor skills and coordination',
                'Learn fundamental gymnastics positions',
                'Build confidence and social skills',
                'Introduction to apparatus (beam, bars, vault)',
                'Safety awareness and following instructions'
            ],
            schedule: [
                { day: 'Monday', time: '4:00 PM - 4:45 PM', location: 'Cyberport' },
                { day: 'Wednesday', time: '4:00 PM - 4:45 PM', location: 'Wan Chai' },
                { day: 'Saturday', time: '10:00 AM - 10:45 AM', location: 'Both Locations' }
            ]
        },
        {
            level: 'Intermediate',
            ageGroup: '7-10 years',
            duration: '60 minutes',
            classSize: '8-10 students',
            price: 'HK$1000/month',
            description: 'Building on fundamental skills with more advanced techniques and apparatus work.',
            objectives: [
                'Master basic gymnastics skills',
                'Learn intermediate tumbling sequences',
                'Develop strength and flexibility',
                'Introduction to competitive elements',
                'Goal setting and achievement'
            ],
            schedule: [
                { day: 'Tuesday', time: '5:00 PM - 6:00 PM', location: 'Cyberport' },
                { day: 'Thursday', time: '5:00 PM - 6:00 PM', location: 'Wan Chai' },
                { day: 'Saturday', time: '11:00 AM - 12:00 PM', location: 'Both Locations' }
            ]
        },
        {
            level: 'Advanced',
            ageGroup: '11-16 years',
            duration: '75 minutes',
            classSize: '6-8 students',
            price: 'HK$1200/month',
            description: 'Advanced training for serious gymnasts looking to perfect their skills and techniques.',
            objectives: [
                'Perfect advanced gymnastics skills',
                'Learn complex tumbling passes',
                'Develop competitive routines',
                'Mental preparation and focus',
                'Leadership and mentoring skills'
            ],
            schedule: [
                { day: 'Monday', time: '6:00 PM - 7:15 PM', location: 'Cyberport' },
                { day: 'Wednesday', time: '6:00 PM - 7:15 PM', location: 'Wan Chai' },
                { day: 'Saturday', time: '2:00 PM - 3:15 PM', location: 'Both Locations' }
            ]
        },
        {
            level: 'Competitive',
            ageGroup: '8+ years',
            duration: '90 minutes',
            classSize: '4-6 students',
            price: 'HK$1500/month',
            description: 'Elite training program for gymnasts competing at local and international levels.',
            objectives: [
                'Master competition-level skills',
                'Develop championship routines',
                'Mental toughness and resilience',
                'Competition preparation',
                'Elite performance standards'
            ],
            schedule: [
                { day: 'Tuesday', time: '6:30 PM - 8:00 PM', location: 'Cyberport' },
                { day: 'Thursday', time: '6:30 PM - 8:00 PM', location: 'Wan Chai' },
                { day: 'Saturday', time: '3:30 PM - 5:00 PM', location: 'Both Locations' }
            ]
        }
    ]

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50">
                {/* Page Hero */}
                <PageHero
                    title="School Gymnastics Programs"
                    subtitle="Comprehensive gymnastics training for all skill levels. From first-time gymnasts to competitive athletes, we provide structured programs that build skills, confidence, and character."
                    backgroundImage="/images/pages/school-gymnastics-hero.jpg"
                    fallbackGradient="from-blue-600 to-green-600"
                    height="xlarge"
                />

                {/* Program Levels */}
                <section className="section-padding bg-gradient-to-b from-white via-blue-50 to-white relative overflow-hidden">
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div
                            className="absolute w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"
                            style={{ top: '-100px', left: '-100px' }}
                            animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
                            transition={{ duration: 8, repeat: Infinity }}
                        />
                        <motion.div
                            className="absolute w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"
                            style={{ bottom: '-100px', right: '-100px' }}
                            animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
                            transition={{ duration: 10, repeat: Infinity }}
                        />
                    </div>

                    <div className="container-max relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <div className="inline-block mb-4">
                                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                                    PROGRAM LEVELS
                                </span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mb-4">
                                Choose Your Path
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Our structured progression system ensures every student receives appropriate
                                training for their age, skill level, and goals.
                            </p>
                        </motion.div>

                        <div className="space-y-12">
                            {programLevels.map((program, index) => (
                                <motion.div
                                    key={program.level}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.6 }}
                                    viewport={{ once: true }}
                                    className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-blue-100 hover:border-blue-300 p-8"
                                >
                                    {/* Gradient Border Animation */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

                                    {/* Level Badge */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                                        {/* Program Info */}
                                        <div className="lg:col-span-2">
                                            <div className="flex items-center space-x-4 mb-6">
                                                <div className="flex-shrink-0">
                                                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg">
                                                        {index + 1}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-heading font-bold text-gray-900">
                                                        {program.level} Level
                                                    </h3>
                                                    <span className="inline-block mt-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                                        {program.ageGroup}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 mb-6 leading-relaxed">
                                                {program.description}
                                            </p>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    className="flex items-center space-x-2 text-sm text-gray-600 bg-blue-50 rounded-lg p-3 hover:bg-blue-100 transition-colors duration-300"
                                                >
                                                    <FiClock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                                    <span className="font-medium">{program.duration}</span>
                                                </motion.div>
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    className="flex items-center space-x-2 text-sm text-gray-600 bg-green-50 rounded-lg p-3 hover:bg-green-100 transition-colors duration-300"
                                                >
                                                    <FiUsers className="w-5 h-5 text-green-600 flex-shrink-0" />
                                                    <span className="font-medium">{program.classSize}</span>
                                                </motion.div>
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    className="flex items-center space-x-2 text-sm text-gray-600 bg-purple-50 rounded-lg p-3 hover:bg-purple-100 transition-colors duration-300"
                                                >
                                                    <FiTarget className="w-5 h-5 text-purple-600 flex-shrink-0" />
                                                    <span className="font-medium">{program.ageGroup}</span>
                                                </motion.div>
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    className="flex items-center space-x-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-3 hover:shadow-lg transition-all duration-300"
                                                >
                                                    <FiStar className="w-5 h-5 flex-shrink-0" />
                                                    <span>{program.price}</span>
                                                </motion.div>
                                            </div>

                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                                                    <span className="inline-block w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3"></span>
                                                    Learning Objectives
                                                </h4>
                                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {program.objectives.map((objective, objIndex) => (
                                                        <motion.li
                                                            key={objective}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            whileInView={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: objIndex * 0.05, duration: 0.4 }}
                                                            viewport={{ once: true }}
                                                            className="flex items-start space-x-3 text-sm text-gray-600 group/item"
                                                        >
                                                            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2 flex-shrink-0 group-hover/item:scale-150 transition-transform duration-300"></div>
                                                            <span className="group-hover/item:text-gray-900 transition-colors duration-300">{objective}</span>
                                                        </motion.li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Schedule */}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                                                <FiCalendar className="w-5 h-5 mr-2 text-blue-600" />
                                                Class Schedule
                                            </h4>
                                            <div className="space-y-3">
                                                {program.schedule.map((slot, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        whileInView={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.08, duration: 0.4 }}
                                                        viewport={{ once: true }}
                                                        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all duration-300 group/schedule"
                                                    >
                                                        <div className="font-semibold text-gray-900 text-sm group-hover/schedule:text-blue-600 transition-colors duration-300">
                                                            {slot.day}
                                                        </div>
                                                        <div className="text-sm text-gray-600 mt-1">
                                                            {slot.time}
                                                        </div>
                                                        <div className="flex items-center text-xs text-gray-500 mt-2">
                                                            <FiMapPin className="w-3 h-3 mr-1 text-blue-600" />
                                                            {slot.location}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <Link
                                                    href="/book-trial"
                                                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-lg text-center block hover:shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-indigo-700"
                                                >
                                                    Book Trial Class
                                                </Link>
                                            </motion.div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Team Preview Component */}
                <TeamPreview />

                {/* CTA Section */}
                <section className="section-padding bg-gradient-to-r from-primary-600 to-secondary-500 text-white">
                    <div className="container-max text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-heading font-bold mb-4">
                                Ready to Start Your Gymnastics Journey?
                            </h2>
                            <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
                                Join our school gymnastics programs and discover the joy of movement,
                                the thrill of achievement, and the confidence that comes with mastering new skills.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                                <Link href="/book-trial" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
                                    Book Free Trial
                                </Link>
                                <Link href="/contact" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                                    Get More Info
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

export default SchoolGymnasticsPage
