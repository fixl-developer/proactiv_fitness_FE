'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { FiUsers, FiClock, FiMapPin, FiStar, FiCheckCircle, FiArrowRight } from 'react-icons/fi'
import BookingForm from '@/components/ui/BookingForm'

const SchoolGymnasticsPage = () => {
    const programLevels = [
        {
            title: 'Early Years (Ages 3-5)',
            description: 'Fun-based introduction to gymnastics with focus on basic movement skills and safety.',
            features: [
                'Basic movement patterns',
                'Balance and coordination',
                'Following instructions',
                'Social interaction',
                'Safety awareness'
            ],
            duration: '45 minutes',
            classSize: '6-8 children',
            color: 'from-blue-400 to-blue-600'
        },
        {
            title: 'Primary (Ages 6-8)',
            description: 'Fundamental gymnastics skills development with equipment introduction and coordination training.',
            features: [
                'Equipment introduction',
                'Basic gymnastics skills',
                'Strength development',
                'Flexibility training',
                'Confidence building'
            ],
            duration: '60 minutes',
            classSize: '8-10 children',
            color: 'from-green-400 to-green-600'
        },
        {
            title: 'Intermediate (Ages 9-12)',
            description: 'Advanced skills training with focus on strength, flexibility, and competition preparation.',
            features: [
                'Advanced techniques',
                'Strength and conditioning',
                'Routine development',
                'Competition preparation',
                'Leadership skills'
            ],
            duration: '75 minutes',
            classSize: '6-8 children',
            color: 'from-purple-400 to-purple-600'
        },
        {
            title: 'Advanced (Ages 13+)',
            description: 'Elite level training for serious gymnasts with competition participation and leadership development.',
            features: [
                'Elite level skills',
                'Competition participation',
                'Advanced conditioning',
                'Mentoring younger students',
                'Performance excellence'
            ],
            duration: '90 minutes',
            classSize: '4-6 children',
            color: 'from-red-400 to-red-600'
        }
    ]

    const benefits = [
        {
            icon: FiUsers,
            title: 'Physical Development',
            description: 'Improves strength, flexibility, coordination, and overall fitness levels.'
        },
        {
            icon: FiStar,
            title: 'Mental Confidence',
            description: 'Builds self-esteem, discipline, and mental resilience through achievement.'
        },
        {
            icon: FiCheckCircle,
            title: 'Social Skills',
            description: 'Develops teamwork, communication, and leadership abilities.'
        },
        {
            icon: FiClock,
            title: 'Academic Performance',
            description: 'Enhances focus, concentration, and academic achievement.'
        }
    ]

    return (
        <div className="pt-16">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    {/* Background gradient as fallback */}
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700"></div>

                    {/* Hero Image */}
                    <Image
                        src="/images/pages/school-gymnastics-hero.jpg"
                        alt="School Gymnastics Programs"
                        fill
                        className="object-cover"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                    />

                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                </div>

                <div className="relative z-10 text-center text-white px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-6xl font-heading font-bold mb-6"
                    >
                        School Gymnastics Programs
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
                    >
                        Bringing professional gymnastics coaching directly to your school with comprehensive programs for all ages
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
                    >
                        <Link
                            href="#programs"
                            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300 transform hover:scale-105"
                        >
                            View Programs
                        </Link>
                        <Link
                            href="#booking"
                            className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold transition-all duration-300"
                        >
                            Book Assessment
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Program Levels Section */}
            <section id="programs" className="section-padding bg-gray-50">
                <div className="container-max">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
                            Program Levels
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Our structured programs are designed to meet the developmental needs of each age group,
                            ensuring safe and effective progression in gymnastics skills.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {programLevels.map((level, index) => (
                            <motion.div
                                key={level.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className={`h-2 bg-gradient-to-r ${level.color}`}></div>
                                <div className="p-8">
                                    <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">
                                        {level.title}
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        {level.description}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                            <FiClock className="w-4 h-4" />
                                            <span>{level.duration}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                            <FiUsers className="w-4 h-4" />
                                            <span>{level.classSize}</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-2">
                                        {level.features.map((feature) => (
                                            <li key={feature} className="flex items-center text-sm text-gray-600">
                                                <FiCheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
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
                            Why Choose Our School Programs?
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Our gymnastics programs provide comprehensive benefits that extend far beyond physical fitness,
                            contributing to overall child development and academic success.
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

            {/* Locations Section */}
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
                            Available Locations
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Our school programs are available at both of our premium locations,
                            each equipped with professional gymnastics equipment and facilities.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-2xl shadow-lg p-8"
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <FiMapPin className="w-6 h-6 text-primary-600" />
                                <h3 className="text-xl font-heading font-bold text-gray-900">
                                    Cyberport Location
                                </h3>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Modern facility with state-of-the-art gymnastics equipment and spacious training areas.
                            </p>
                            <Link
                                href="/locations/cyberport"
                                className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold"
                            >
                                <span>View Location Details</span>
                                <FiArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-2xl shadow-lg p-8"
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <FiMapPin className="w-6 h-6 text-primary-600" />
                                <h3 className="text-xl font-heading font-bold text-gray-900">
                                    Wan Chai Location
                                </h3>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Centrally located facility with easy MTR access and comprehensive gymnastics equipment.
                            </p>
                            <Link
                                href="/locations/wan-chai"
                                className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold"
                            >
                                <span>View Location Details</span>
                                <FiArrowRight className="w-4 h-4" />
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
                            Book Your School Program
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Ready to bring professional gymnastics to your school? Book an assessment
                            or contact us to discuss your school's specific needs.
                        </p>
                    </motion.div>

                    <div className="max-w-4xl mx-auto">
                        <BookingForm
                            type="assessment"
                            title="Book School Program Assessment"
                            subtitle="Let us assess your school's needs and create a customized gymnastics program."
                        />
                    </div>
                </div>
            </section>
        </div>
    )
}

export default SchoolGymnasticsPage