'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiMapPin, FiClock, FiPhone, FiMail, FiNavigation, FiWifi, FiShield } from 'react-icons/fi'
import TeamPreview from '@/components/sections/TeamPreview'

const WanChaiLocationPage = () => {
    const services = [
        {
            title: 'Gymnastics Programs',
            description: 'Comprehensive gymnastics training for all ages and abilities',
            icon: '??',
            programs: ['Toddler Classes', 'Youth Programs', 'Teen Training', 'Adult Classes']
        },
        {
            title: 'Holiday Camps',
            description: 'Exciting holiday programs with gymnastics and activities',
            icon: '???',
            programs: ['Summer Camps', 'Winter Programs', 'Easter Camps', 'Special Events']
        },
        {
            title: 'Birthday Parties',
            description: 'Unforgettable gymnastics-themed birthday celebrations',
            icon: '??',
            programs: ['Standard Packages', 'Premium Parties', 'Custom Themes', 'Group Bookings']
        }
    ]

    const facilities = [
        {
            name: 'Training Hall',
            description: 'Large, well-equipped gymnastics training space',
            features: ['Professional apparatus', 'Safety equipment', 'Mirrored walls', 'Sound system']
        },
        {
            name: 'Parent Lounge',
            description: 'Comfortable waiting area with great views',
            features: ['Comfortable seating', 'Viewing windows', 'Refreshments', 'Free WiFi']
        },
        {
            name: 'Changing Facilities',
            description: 'Modern and clean changing rooms',
            features: ['Separate facilities', 'Secure lockers', 'Family rooms', 'Accessibility features']
        },
        {
            name: 'Multi-Purpose Room',
            description: 'Flexible space for parties and events',
            features: ['Party setup', 'Audio/visual equipment', 'Catering space', 'Decoration options']
        }
    ]

    const schedule = [
        {
            day: 'Monday',
            classes: [
                { time: '4:15 PM - 5:00 PM', program: 'Toddler Gym (2-3 years)', spots: 'Available' },
                { time: '5:15 PM - 6:15 PM', program: 'Beginner (4-6 years)', spots: 'Limited' },
                { time: '6:30 PM - 7:45 PM', program: 'Intermediate (7-10 years)', spots: 'Available' }
            ]
        },
        {
            day: 'Tuesday',
            classes: [
                { time: '4:00 PM - 5:00 PM', program: 'Mixed Ages (5-8 years)', spots: 'Available' },
                { time: '5:15 PM - 6:30 PM', program: 'Advanced (11+ years)', spots: 'Available' },
                { time: '6:45 PM - 7:45 PM', program: 'Teen Classes', spots: 'Available' }
            ]
        },
        {
            day: 'Wednesday',
            classes: [
                { time: '4:15 PM - 5:00 PM', program: 'Beginner (3-5 years)', spots: 'Available' },
                { time: '5:15 PM - 6:15 PM', program: 'Intermediate (6-9 years)', spots: 'Limited' },
                { time: '6:30 PM - 7:45 PM', program: 'Competitive Team', spots: 'Full' }
            ]
        },
        {
            day: 'Thursday',
            classes: [
                { time: '4:00 PM - 5:00 PM', program: 'Toddler & Parent', spots: 'Available' },
                { time: '5:15 PM - 6:30 PM', program: 'Advanced Skills', spots: 'Available' },
                { time: '6:45 PM - 7:45 PM', program: 'Adult Gymnastics', spots: 'Available' }
            ]
        },
        {
            day: 'Friday',
            classes: [
                { time: '4:15 PM - 5:15 PM', program: 'Mixed Levels (4-8 years)', spots: 'Available' },
                { time: '5:30 PM - 6:45 PM', program: 'Competitive Prep', spots: 'Limited' }
            ]
        },
        {
            day: 'Saturday',
            classes: [
                { time: '9:00 AM - 9:45 AM', program: 'Toddler Gym (2-3 years)', spots: 'Available' },
                { time: '10:00 AM - 11:00 AM', program: 'Beginner (4-6 years)', spots: 'Available' },
                { time: '11:15 AM - 12:15 PM', program: 'Intermediate (7-10 years)', spots: 'Limited' },
                { time: '12:30 PM - 1:45 PM', program: 'Advanced (11+ years)', spots: 'Available' },
                { time: '2:00 PM - 3:15 PM', program: 'Competitive Team', spots: 'Full' },
                { time: '3:30 PM - 4:30 PM', program: 'Open Gym', spots: 'Available' }
            ]
        }
    ]

    const teamMembers = [
        {
            name: 'Sarah Wong',
            role: 'Location Manager',
            specialization: 'Program Development',
            experience: '8+ years',
            image: ''
        },
        {
            name: 'Michael Liu',
            role: 'Head Coach',
            specialization: 'Youth Development',
            experience: '12+ years',
            image: ''
        },
        {
            name: 'Emma Chen',
            role: 'Senior Coach',
            specialization: 'Beginner Programs',
            experience: '6+ years',
            image: ''
        },
        {
            name: 'James Chen',
            role: 'Senior Coach',
            specialization: 'Competitive Gymnastics',
            experience: '11+ years',
            image: ''
        }
    ]

    return (
        <div>
            {/* Hero Section */}
            <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
                {/* Background Video */}
                <div className="absolute inset-0">
                    {/* Fallback gradient background */}
                    <div className="w-full h-full bg-gradient-to-br from-secondary-500 to-secondary-700"></div>

                    {/* Video Background - Cropped to hide right side icons */}
                    <div className="absolute inset-0 overflow-hidden">
                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="absolute inset-0 w-[120%] h-full object-cover -translate-x-[10%]"
                            style={{
                                filter: 'blur(1px) brightness(0.7)',
                                transform: 'scale(1.2) translateX(-8%)'
                            }}
                            onError={(e) => e.currentTarget.style.display = 'none'}
                        >
                            <source src="/videos/wan-chai-hero.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>

                    {/* Strong overlay to hide video text and make our content stand out */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/70"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>

                    {/* Additional overlay to completely mask video content */}
                    <div className="absolute inset-0 bg-blue-900/30"></div>
                </div>

                <div className="container-max relative z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto text-center text-white"
                    >
                        {/* Location Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-sm font-semibold mb-6"
                        >
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
                            ?? WAN CHAI LOCATION
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="text-5xl sm:text-6xl lg:text-7xl font-heading font-black mb-6 text-white drop-shadow-2xl"
                            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
                        >
                            ProGym
                            <span className="block text-transparent bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text">
                                Wan Chai
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="text-xl sm:text-2xl text-white mb-8 leading-relaxed max-w-3xl mx-auto"
                            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                        >
                            ?? Central Hong Kong Location � ?? 3 mins from MTR � ?? Professional Training
                            <br />
                            <span className="text-lg text-gray-200 mt-2 block">Modern facility in the heart of Wan Chai district</span>
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
                        >
                            <Link
                                href="/book-trial"
                                className="group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center space-x-3"
                            >
                                <span>?? Book Free Trial</span>
                            </Link>
                            <Link
                                href="#contact-info"
                                className="group bg-white/20 backdrop-blur-md border-2 border-white text-white hover:bg-white hover:text-gray-900 px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center space-x-3"
                            >
                                <span>?? Visit Us Today</span>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Location Info */}
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
                                Central Wan Chai Location
                            </h2>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Strategically located in Wan Chai, one of Hong Kong's most accessible districts.
                                Our facility is just minutes from Wan Chai MTR station and multiple bus routes,
                                making it convenient for families across Hong Kong Island.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <FiMapPin className="w-5 h-5 text-secondary-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium text-gray-900">Address</div>
                                        <div className="text-gray-600 text-sm">Unit 456, Wan Chai Tower, 183 Queen's Road East, Wan Chai, Hong Kong</div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <FiNavigation className="w-5 h-5 text-secondary-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium text-gray-900">Transportation</div>
                                        <div className="text-gray-600 text-sm">3 minutes walk from Wan Chai MTR Station (Exit A3)</div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <FiClock className="w-5 h-5 text-secondary-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium text-gray-900">Operating Hours</div>
                                        <div className="text-gray-600 text-sm">
                                            Mon-Fri: 4:00 PM - 8:00 PM<br />
                                            Sat: 9:00 AM - 5:00 PM<br />
                                            Sun: Closed
                                        </div>
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
                            <div className="bg-gradient-to-br from-secondary-500 to-secondary-700 rounded-2xl p-8 text-white">
                                <h3 className="text-2xl font-bold mb-6">Quick Contact</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <FiPhone className="w-5 h-5" />
                                        <span>+852 2234 5678</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <FiMail className="w-5 h-5" />
                                        <span>wanchai@proactivsports.net</span>
                                    </div>
                                </div>
                                <Link
                                    href="/book-trial"
                                    className="inline-block bg-white text-secondary-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold mt-6 transition-colors duration-300"
                                >
                                    Book Free Trial
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="section-padding bg-gray-50">
                <div className="container-max">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                            Our Services
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Comprehensive gymnastics programs and services available at our Wan Chai location.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {services.map((service, index) => (
                            <motion.div
                                key={service.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className="text-4xl mb-4">{service.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                                <p className="text-gray-600 mb-4">{service.description}</p>
                                <ul className="space-y-2">
                                    {service.programs.map((program, idx) => (
                                        <li key={idx} className="text-sm text-gray-500 flex items-center">
                                            <span className="w-2 h-2 bg-secondary-500 rounded-full mr-2"></span>
                                            {program}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Facilities Section */}
            <section className="section-padding bg-white">
                <div className="container-max">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                            World-Class Facilities
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Our Wan Chai location features modern, safe, and well-equipped facilities designed for optimal training.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {facilities.map((facility, index) => (
                            <motion.div
                                key={facility.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                viewport={{ once: true }}
                                className="bg-gray-50 rounded-xl p-6"
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{facility.name}</h3>
                                <p className="text-gray-600 mb-4">{facility.description}</p>
                                <ul className="grid grid-cols-2 gap-2">
                                    {facility.features.map((feature, idx) => (
                                        <li key={idx} className="text-sm text-gray-500 flex items-center">
                                            <FiShield className="w-3 h-3 mr-2 text-secondary-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Schedule Section */}
            <section className="section-padding bg-gray-50">
                <div className="container-max">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                            Weekly Schedule
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Find the perfect class time for your child with our flexible weekly schedule.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {schedule.map((day, index) => (
                            <motion.div
                                key={day.day}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-xl shadow-lg overflow-hidden"
                            >
                                <div className="bg-secondary-600 text-white p-4">
                                    <h3 className="text-lg font-bold">{day.day}</h3>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-3">
                                        {day.classes.map((classItem, idx) => (
                                            <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                                <div>
                                                    <div className="font-medium text-gray-900 text-sm">{classItem.time}</div>
                                                    <div className="text-gray-600 text-xs">{classItem.program}</div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${classItem.spots === 'Available' ? 'bg-green-100 text-green-800' :
                                                    classItem.spots === 'Limited' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {classItem.spots}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Preview Component */}
            <TeamPreview />

            {/* Contact Section */}
            <section id="contact-info" className="section-padding bg-secondary-600 text-white">
                <div className="container-max">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-heading font-bold mb-6">
                                Visit ProGym Wan Chai
                            </h2>
                            <p className="text-secondary-100 mb-8 leading-relaxed">
                                Ready to start your gymnastics journey? Visit our Wan Chai location or get in touch
                                to learn more about our programs and schedule a free trial class.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <FiMapPin className="w-5 h-5 text-secondary-200" />
                                    <span className="text-secondary-100">Unit 456, Wan Chai Tower, 183 Queen's Road East</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <FiPhone className="w-5 h-5 text-secondary-200" />
                                    <span className="text-secondary-100">+852 2234 5678</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <FiMail className="w-5 h-5 text-secondary-200" />
                                    <span className="text-secondary-100">wanchai@proactivsports.net</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-2xl p-8 text-gray-900"
                        >
                            <h3 className="text-2xl font-bold mb-6">Book Your Free Trial</h3>
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Parent Name</label>
                                    <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Child Name</label>
                                    <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Child Age</label>
                                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent">
                                        <option>2-3 years</option>
                                        <option>4-6 years</option>
                                        <option>7-10 years</option>
                                        <option>11+ years</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                                    <input type="tel" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent" />
                                </div>
                                <button type="submit" className="w-full bg-secondary-600 text-white py-3 rounded-lg font-semibold hover:bg-secondary-700 transition-colors duration-300">
                                    Book Free Trial
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default WanChaiLocationPage
