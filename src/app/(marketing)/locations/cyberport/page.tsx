'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { FiMapPin, FiClock, FiPhone, FiMail, FiTruck, FiWifi, FiShield, FiStar, FiArrowRight } from 'react-icons/fi'
import TeamPreview from '@/components/sections/TeamPreview'
import Services from '@/components/sections/Services'
import { useCMSData } from '@/hooks/useCMSData'
import { CMSService, LocationDetailData } from '@/services/cmsService'

const staticLocationData = {
    address: 'Shop 123, Cyberport 3, 100 Cyberport Road, Cyberport, Hong Kong',
    phone: '+852 2234 5678',
    email: 'cyberport@proactivsports.net',
    hours: [
        { day: 'Mon-Fri', time: '3:30PM-8:30PM' },
        { day: 'Sat-Sun', time: '9:00AM-6:00PM' },
    ],
    facilities: [
        {
            name: 'Main Gymnasium',
            description: 'Spacious training area with professional gymnastics equipment',
            features: ['Olympic standard apparatus', 'Safety foam pits', 'Sprung floors', 'Mirrored walls']
        },
        {
            name: 'Reception & Viewing Area',
            description: 'Comfortable space for parents and visitors',
            features: ['Seating area', 'Clear viewing windows', 'Refreshment area', 'Free WiFi']
        },
        {
            name: 'Changing Rooms',
            description: 'Clean and secure facilities for students',
            features: ['Separate boys/girls areas', 'Lockers available', 'Baby changing facilities', 'Shower facilities']
        },
        {
            name: 'Party Room',
            description: 'Dedicated space for birthday celebrations',
            features: ['Tables and chairs', 'Decorations setup', 'Sound system', 'Kitchen access']
        }
    ],
    schedule: [
        {
            day: 'Monday',
            classes: [
                { time: '4:00 PM - 4:45 PM', program: 'Beginner (3-5 years)', spots: 'Available' },
                { time: '5:00 PM - 6:00 PM', program: 'Intermediate (6-9 years)', spots: 'Available' },
                { time: '6:15 PM - 7:30 PM', program: 'Advanced (10+ years)', spots: 'Limited' }
            ]
        },
        {
            day: 'Tuesday',
            classes: [
                { time: '4:30 PM - 5:30 PM', program: 'Beginner (4-6 years)', spots: 'Available' },
                { time: '5:45 PM - 7:00 PM', program: 'Competitive Team', spots: 'Full' },
                { time: '7:15 PM - 8:15 PM', program: 'Adult Classes', spots: 'Available' }
            ]
        },
        {
            day: 'Wednesday',
            classes: [
                { time: '4:00 PM - 4:45 PM', program: 'Toddler Gym (2-3 years)', spots: 'Available' },
                { time: '5:00 PM - 6:00 PM', program: 'Intermediate (7-10 years)', spots: 'Available' },
                { time: '6:15 PM - 7:30 PM', program: 'Advanced (11+ years)', spots: 'Available' }
            ]
        },
        {
            day: 'Thursday',
            classes: [
                { time: '4:30 PM - 5:30 PM', program: 'Beginner (5-7 years)', spots: 'Limited' },
                { time: '5:45 PM - 7:00 PM', program: 'Competitive Team', spots: 'Full' },
                { time: '7:15 PM - 8:15 PM', program: 'Teen Classes', spots: 'Available' }
            ]
        },
        {
            day: 'Friday',
            classes: [
                { time: '4:00 PM - 5:00 PM', program: 'Mixed Ages (4-8 years)', spots: 'Available' },
                { time: '5:15 PM - 6:30 PM', program: 'Advanced Skills', spots: 'Available' }
            ]
        },
        {
            day: 'Saturday',
            classes: [
                { time: '9:00 AM - 9:45 AM', program: 'Toddler Gym (2-3 years)', spots: 'Available' },
                { time: '10:00 AM - 11:00 AM', program: 'Beginner (4-6 years)', spots: 'Limited' },
                { time: '11:15 AM - 12:15 PM', program: 'Intermediate (7-10 years)', spots: 'Available' },
                { time: '12:30 PM - 1:45 PM', program: 'Advanced (11+ years)', spots: 'Available' },
                { time: '2:00 PM - 3:15 PM', program: 'Competitive Team', spots: 'Full' }
            ]
        },
        {
            day: 'Sunday',
            classes: [
                { time: '9:00 AM - 10:00 AM', program: 'Family Gym', spots: 'Available' },
                { time: '10:15 AM - 11:15 AM', program: 'Beginner (5-8 years)', spots: 'Available' },
                { time: '11:30 AM - 12:30 PM', program: 'Intermediate Skills', spots: 'Available' }
            ]
        }
    ],
}

const CyberportLocationPage = () => {
    const { data: dynamicLocation } = useCMSData<LocationDetailData | null>(
        () => CMSService.getLocationBySlug('cyberport'),
        null,
        []
    )

    const locationData = dynamicLocation
        ? {
            ...staticLocationData,
            address: dynamicLocation.address || staticLocationData.address,
            phone: dynamicLocation.phone || staticLocationData.phone,
            email: dynamicLocation.email || staticLocationData.email,
            hours: dynamicLocation.hours?.length ? dynamicLocation.hours : staticLocationData.hours,
            facilities: dynamicLocation.facilities?.length ? dynamicLocation.facilities : staticLocationData.facilities,
            schedule: dynamicLocation.schedule?.length
                ? dynamicLocation.schedule.map(s => ({
                    day: s.day,
                    classes: s.slots.map(slot => ({
                        time: slot.time,
                        program: slot.program,
                        spots: slot.spots,
                    })),
                }))
                : staticLocationData.schedule,
        }
        : staticLocationData

    const { facilities, schedule } = locationData

    return (
        <div>
            {/* Hero Section */}
            <section className="relative h-[400px] sm:h-[450px] md:h-[500px] text-white overflow-hidden flex items-center justify-center">
                {/* Animated Gradient Background - Cyberport Specific */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-900">
                    {/* Base Animated Gradient */}
                    <motion.div
                        className="absolute inset-0"
                        animate={{
                            background: [
                                'linear-gradient(135deg, #0891b2 0%, #0369a1 50%, #312e81 100%)',
                                'linear-gradient(135deg, #0369a1 0%, #312e81 50%, #0891b2 100%)',
                                'linear-gradient(135deg, #312e81 0%, #0891b2 50%, #0369a1 100%)',
                                'linear-gradient(135deg, #0891b2 0%, #0369a1 50%, #312e81 100%)',
                            ]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* Animated Mesh Gradient - Cyberport Tech Feel */}
                    <motion.div
                        className="absolute inset-0 opacity-40"
                        animate={{
                            background: [
                                'radial-gradient(circle at 30% 40%, rgba(6, 182, 212, 0.4) 0%, transparent 50%)',
                                'radial-gradient(circle at 70% 60%, rgba(99, 102, 241, 0.4) 0%, transparent 50%)',
                                'radial-gradient(circle at 50% 30%, rgba(59, 130, 246, 0.4) 0%, transparent 50%)',
                                'radial-gradient(circle at 30% 40%, rgba(6, 182, 212, 0.4) 0%, transparent 50%)',
                            ]
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* Tech Grid Pattern - Cyberport Theme */}
                    <motion.div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: `
                                linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%, transparent),
                                linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%, transparent)
                            `,
                            backgroundSize: '50px 50px',
                        }}
                        animate={{
                            backgroundPosition: ['0px 0px', '50px 50px'],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    />
                </div>

                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Floating Particles */}
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                opacity: Math.random() * 0.5 + 0.2,
                            }}
                            animate={{
                                y: [0, -100, 0],
                                opacity: [0.2, 0.8, 0.2],
                                scale: [0.5, 1.5, 0.5],
                            }}
                            transition={{
                                duration: 5 + Math.random() * 5,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                                ease: 'easeInOut',
                            }}
                        />
                    ))}

                    {/* Animated Lines */}
                    <motion.svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 1000 1000"
                        preserveAspectRatio="xMidYMid slice"
                    >
                        <motion.line
                            x1="0"
                            y1="500"
                            x2="1000"
                            y2="500"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="2"
                            animate={{
                                strokeDasharray: [0, 1000],
                                opacity: [0, 0.5, 0],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                    </motion.svg>
                </div>

                {/* Content */}
                <div className="container-max relative z-10 px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-6 sm:mb-8"
                        >
                            <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                className="inline-block mr-2"
                            >
                                ?
                            </motion.span>
                            <span className="text-white/90 text-xs sm:text-sm font-semibold uppercase tracking-wider">
                                Flagship Location
                            </span>
                        </motion.div>

                        {/* Main Heading */}
                        <motion.h1
                            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-black mb-2 sm:mb-4 leading-tight"
                        >
                            {['ProGym', 'Cyberport'].map((word, index) => (
                                <motion.span
                                    key={word}
                                    className="inline-block mr-3"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: 0.3 + index * 0.2,
                                        duration: 0.6,
                                        type: "spring",
                                        stiffness: 100
                                    }}
                                >
                                    <motion.span
                                        animate={{
                                            backgroundPosition: ['0%', '100%', '0%'],
                                        }}
                                        transition={{ duration: 5, repeat: Infinity, delay: index * 0.3 }}
                                        style={{
                                            backgroundImage: 'linear-gradient(90deg, #ffffff, #e0f2fe, #ffffff)',
                                            backgroundSize: '200% 100%',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                            display: 'inline-block'
                                        }}
                                    >
                                        {word}
                                    </motion.span>
                                </motion.span>
                            ))}
                        </motion.h1>

                        {/* Subheading */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.8 }}
                            className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto px-2"
                        >
                            Our flagship location in the heart of Cyberport, featuring state-of-the-art facilities
                            and comprehensive gymnastics programs for the whole family.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-2 mb-6"
                        >
                            {/* Primary Button */}
                            <motion.div
                                whileHover={{ scale: 1.05, y: -3 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link id="marketing-locations-cyberport-nav-book-trial"
                                    href="/book-trial"
                                    className="group relative overflow-hidden bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-2xl flex items-center justify-center space-x-2 w-full sm:w-auto"
                                >
                                    <span className="relative z-10">Book Free Trial</span>
                                    <motion.span
                                        className="relative z-10"
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        ?
                                    </motion.span>
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 opacity-0 group-hover:opacity-100"
                                        initial={{ x: '-100%' }}
                                        whileHover={{ x: 0 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </Link>
                            </motion.div>

                            {/* Secondary Button */}
                            <motion.div
                                whileHover={{ scale: 1.05, y: -3 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link id="marketing-locations-cyberport-nav-contact-info"
                                    href="#contact-info"
                                    className="group relative overflow-hidden border-2 border-white text-white hover:bg-white hover:text-primary-600 px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center space-x-2 w-full sm:w-auto backdrop-blur-sm bg-white/5 hover:bg-white"
                                >
                                    <span className="relative z-10">Visit Us Today</span>
                                    <motion.span
                                        className="relative z-10"
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
                                    >
                                        ?
                                    </motion.span>
                                </Link>
                            </motion.div>
                        </motion.div>

                        {/* Scroll Indicator */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 0.8 }}
                            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                        >
                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="flex flex-col items-center"
                            >
                                <span className="text-white/60 text-xs sm:text-sm mb-2">Scroll to explore</span>
                                <svg
                                    className="w-5 h-5 sm:w-6 sm:h-6 text-white/60"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                    />
                                </svg>
                            </motion.div>
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
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.6 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-6"
                            >
                                <FiMapPin className="w-4 h-4 text-primary-600 mr-2" />
                                <span className="text-primary-600 text-sm font-semibold">LOCATION DETAILS</span>
                            </motion.div>

                            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">
                                Prime Cyberport Location
                            </h2>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Located in the prestigious Cyberport development, our facility offers easy access
                                via public transport and ample parking. The modern, purpose-built space provides
                                the perfect environment for gymnastics training and development.
                            </p>

                            <div className="space-y-4">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2, duration: 0.6 }}
                                    viewport={{ once: true }}
                                    className="flex items-start space-x-3 p-4 rounded-lg hover:bg-blue-50 transition-colors duration-300"
                                >
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FiMapPin className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">Address</div>
                                        <div className="text-gray-600 text-sm">{locationData.address}</div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                    viewport={{ once: true }}
                                    className="flex items-start space-x-3 p-4 rounded-lg hover:bg-blue-50 transition-colors duration-300"
                                >
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FiTruck className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">Parking</div>
                                        <div className="text-gray-600 text-sm">Free parking available in Cyberport parking garage</div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4, duration: 0.6 }}
                                    viewport={{ once: true }}
                                    className="flex items-start space-x-3 p-4 rounded-lg hover:bg-blue-50 transition-colors duration-300"
                                >
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FiWifi className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">Amenities</div>
                                        <div className="text-gray-600 text-sm">Free WiFi, air conditioning, viewing area for parents</div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5, duration: 0.6 }}
                                    viewport={{ once: true }}
                                    className="flex items-start space-x-3 p-4 rounded-lg hover:bg-blue-50 transition-colors duration-300"
                                >
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FiShield className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">Safety</div>
                                        <div className="text-gray-600 text-sm">24/7 security, CCTV monitoring, first aid certified staff</div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <motion.div
                                className="relative rounded-2xl overflow-hidden shadow-2xl"
                                whileHover={{ scale: 1.02, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="aspect-[4/3] bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center relative overflow-hidden">
                                    {/* Animated Background */}
                                    <motion.div
                                        className="absolute inset-0 opacity-20"
                                        animate={{
                                            background: [
                                                'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                                                'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                                                'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                                            ]
                                        }}
                                        transition={{ duration: 8, repeat: Infinity }}
                                    />

                                    <div className="text-white text-center relative z-10">
                                        <motion.div
                                            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                                            transition={{ duration: 4, repeat: Infinity }}
                                            className="text-7xl mb-4"
                                        >
                                            🏢
                                        </motion.div>
                                        <p className="text-xl font-bold">Cyberport Location</p>
                                        <p className="text-sm text-white/80 mt-2">Hong Kong's Premier Gymnastics Hub</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Floating Badge */}
                            <motion.div
                                className="absolute -bottom-4 -right-4 bg-white rounded-full p-4 shadow-lg"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary-600">24/7</div>
                                    <div className="text-xs text-gray-600 font-semibold">Open</div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Our Services Section */}
            <Services />

            {/* Facilities */}
            <section className="section-padding bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
                {/* Background Animations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                        className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-indigo-200/20 to-blue-200/20 rounded-full blur-3xl"
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
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1, duration: 0.6 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-6"
                        >
                            <span className="text-blue-600 text-sm font-semibold">? PREMIUM FACILITIES</span>
                        </motion.div>

                        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mb-4">
                            World-Class Facilities
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Our purpose-built facility features professional-grade equipment and
                            amenities designed for optimal training and comfort.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {facilities.map((facility, index) => (
                            <motion.div
                                key={facility.name}
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: index * 0.15, duration: 0.6, type: "spring", stiffness: 100 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="group"
                            >
                                <div className="relative h-full bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 overflow-hidden">
                                    {/* Gradient Background on Hover */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50 group-hover:to-indigo-50 transition-all duration-300"
                                        initial={{ opacity: 0 }}
                                        whileHover={{ opacity: 1 }}
                                    />

                                    {/* Icon Background */}
                                    <motion.div
                                        className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/40 to-indigo-100/40 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"
                                    />

                                    <div className="relative z-10">
                                        <motion.div
                                            initial={{ rotate: 0 }}
                                            whileHover={{ rotate: 10, scale: 1.1 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                            className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg"
                                        >
                                            <span className="text-2xl">
                                                {index === 0 ? '🤸' : index === 1 ? '👁️' : index === 2 ? '🚪' : '🎉'}
                                            </span>
                                        </motion.div>

                                        <h3 className="text-xl font-heading font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                                            {facility.name}
                                        </h3>
                                        <p className="text-gray-600 mb-5 leading-relaxed">
                                            {facility.description}
                                        </p>

                                        <div className="grid grid-cols-2 gap-3">
                                            {facility.features.map((feature, idx) => (
                                                <motion.div
                                                    key={feature}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    viewport={{ once: true }}
                                                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors duration-300"
                                                >
                                                    <motion.div
                                                        className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                                                        whileHover={{ scale: 1.5 }}
                                                    />
                                                    <span>{feature}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Class Schedule */}
            <section className="section-padding bg-gradient-to-br from-gray-50 via-white to-blue-50/20 relative overflow-hidden">
                {/* Background Animations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{ rotate: -360, scale: [1, 1.15, 1] }}
                        transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-to-r from-blue-200/15 to-cyan-200/15 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
                        className="absolute -bottom-32 -right-32 w-64 h-64 bg-gradient-to-r from-indigo-200/15 to-blue-200/15 rounded-full blur-3xl"
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
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1, duration: 0.6 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-6"
                        >
                            <span className="text-blue-600 text-sm font-semibold">📅 CLASS SCHEDULE</span>
                        </motion.div>

                        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mb-4">
                            Weekly Class Schedule
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Find the perfect class time for your schedule. We offer programs throughout
                            the week to accommodate busy families.
                        </p>
                    </motion.div>

                    <div className="space-y-6">
                        {schedule.map((day, index) => (
                            <motion.div
                                key={day.day}
                                initial={{ opacity: 0, y: 20, x: -20 }}
                                whileInView={{ opacity: 1, y: 0, x: 0 }}
                                transition={{ delay: index * 0.08, duration: 0.6, type: "spring", stiffness: 100 }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.01 }}
                                className="group"
                            >
                                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 overflow-hidden relative">
                                    {/* Day Header Background */}
                                    <motion.div
                                        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                                        initial={{ scaleX: 0 }}
                                        whileInView={{ scaleX: 1 }}
                                        transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                                        viewport={{ once: true }}
                                    />

                                    <div className="relative z-10">
                                        <motion.h3
                                            className="text-2xl font-heading font-bold text-gray-900 mb-6 flex items-center"
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            viewport={{ once: true }}
                                        >
                                            <motion.span
                                                className="inline-block w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mr-3"
                                                animate={{ scale: [1, 1.3, 1] }}
                                                transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                                            />
                                            {day.day}
                                        </motion.h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {day.classes.map((classItem, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    viewport={{ once: true }}
                                                    whileHover={{ y: -4, scale: 1.02 }}
                                                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-all duration-300 group/card cursor-pointer"
                                                >
                                                    <motion.div
                                                        className="font-bold text-blue-600 text-sm mb-2 flex items-center"
                                                        whileHover={{ x: 5 }}
                                                    >
                                                        <span className="mr-2">🕐</span>
                                                        {classItem.time}
                                                    </motion.div>
                                                    <div className="font-semibold text-gray-900 text-sm mb-3 group-hover/card:text-blue-600 transition-colors">
                                                        {classItem.program}
                                                    </div>
                                                    <motion.div
                                                        className={`text-xs px-3 py-1.5 rounded-full inline-flex items-center font-semibold transition-all duration-300 ${classItem.spots === 'Available'
                                                            ? 'bg-green-100 text-green-700 group-hover/card:bg-green-200'
                                                            : classItem.spots === 'Limited'
                                                                ? 'bg-yellow-100 text-yellow-700 group-hover/card:bg-yellow-200'
                                                                : 'bg-red-100 text-red-700 group-hover/card:bg-red-200'
                                                            }`}
                                                        whileHover={{ scale: 1.1 }}
                                                    >
                                                        <span className="mr-1">
                                                            {classItem.spots === 'Available' ? '?' : classItem.spots === 'Limited' ? '?' : '?'}
                                                        </span>
                                                        {classItem.spots}
                                                    </motion.div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        viewport={{ once: true }}
                        className="text-center mt-16"
                    >
                        <motion.div
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link id="marketing-locations-cyberport-nav-book-trial-2"
                                href="/book-trial"
                                className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-2xl"
                            >
                                <span className="mr-2">🚀</span>
                                Book Your Class Today
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Team Section - Same as Home Page */}
            <TeamPreview />

            {/* Contact Info */}
            <section id="contact-info" className="section-padding bg-primary-600 text-white">
                <div className="container-max">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-heading font-bold mb-4">
                            Visit Our Cyberport Location
                        </h2>
                        <p className="text-primary-100 max-w-2xl mx-auto">
                            Ready to start your gymnastics journey? Contact us today to schedule
                            a visit or book your first class.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.6 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiMapPin className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold mb-2">Address</h3>
                            <p className="text-primary-100 text-sm">
                                {locationData.address}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiPhone className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold mb-2">Phone</h3>
                            <p className="text-primary-100 text-sm">
                                {locationData.phone}<br />
                                <span className="text-xs">{locationData.hours.map(h => `${h.day}: ${h.time}`).join(' | ')}</span>
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiMail className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold mb-2">Email</h3>
                            <p className="text-primary-100 text-sm">
                                {locationData.email}<br />
                                <span className="text-xs">We reply within 24 hours</span>
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiClock className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold mb-2">Hours</h3>
                            <p className="text-primary-100 text-sm">
                                {locationData.hours.map((h, i) => (
                                    <span key={i}>{h.day}: {h.time}<br /></span>
                                ))}
                                <span className="text-xs">Holiday hours may vary</span>
                            </p>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mt-12"
                    >
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link id="book-trial" href="/book-trial" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
                                Book Free Trial
                            </Link>
                            <Link id="contact" href="/contact" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                                Contact Us
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}

export default CyberportLocationPage
