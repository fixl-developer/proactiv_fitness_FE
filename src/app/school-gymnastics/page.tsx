'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiClock, FiUsers, FiTarget, FiStar, FiMapPin, FiCalendar } from 'react-icons/fi'
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
        <div className="min-h-screen bg-gray-50">
            {/* Page Hero */}
            <PageHero
                title="School Gymnastics Programs"
                subtitle="Comprehensive gymnastics training for all skill levels. From first-time gymnasts to competitive athletes, we provide structured programs that build skills, confidence, and character."
                backgroundImage="/images/pages/school-gymnastics-hero.jpg"
                fallbackGradient="from-blue-600 to-green-600"
                height="large"
            />

            {/* Program Levels */}
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
                            Program Levels
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
                                className="card p-8"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Program Info */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <h3 className="text-2xl font-heading font-bold text-gray-900">
                                                {program.level} Level
                                            </h3>
                                            <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                                                {program.ageGroup}
                                            </span>
                                        </div>

                                        <p className="text-gray-600 mb-6 leading-relaxed">
                                            {program.description}
                                        </p>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <FiClock className="w-4 h-4 text-primary-600" />
                                                <span>{program.duration}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <FiUsers className="w-4 h-4 text-primary-600" />
                                                <span>{program.classSize}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <FiTarget className="w-4 h-4 text-primary-600" />
                                                <span>{program.ageGroup}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm font-semibold text-primary-600">
                                                <FiStar className="w-4 h-4" />
                                                <span>{program.price}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">Learning Objectives:</h4>
                                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {program.objectives.map((objective) => (
                                                    <li key={objective} className="flex items-start space-x-2 text-sm text-gray-600">
                                                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                                                        <span>{objective}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Schedule */}
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                                            <FiCalendar className="w-4 h-4 mr-2 text-primary-600" />
                                            Class Schedule
                                        </h4>
                                        <div className="space-y-3">
                                            {program.schedule.map((slot, idx) => (
                                                <div key={idx} className="bg-gray-50 rounded-lg p-3">
                                                    <div className="font-medium text-gray-900 text-sm">
                                                        {slot.day}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {slot.time}
                                                    </div>
                                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                                        <FiMapPin className="w-3 h-3 mr-1" />
                                                        {slot.location}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Link
                                            href="/book-trial"
                                            className="w-full mt-4 btn-primary text-center block"
                                        >
                                            Book Trial Class
                                        </Link>
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
        </div>
    )
}

export default SchoolGymnasticsPage