'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { FiMapPin, FiClock, FiPhone, FiMail, FiTruck, FiWifi, FiShield, FiUsers, FiStar, FiArrowRight } from 'react-icons/fi'
import TeamPreview from '@/components/sections/TeamPreview'
import { getRandomImage } from '@/utils/imageUtils'

const CyberportLocationPage = () => {
    const services = [
        {
            title: 'Gymnastics Programs',
            description: 'Complete range of gymnastics classes for all ages and skill levels',
            icon: '🤸‍♀️',
            programs: ['Beginner Classes', 'Intermediate Training', 'Advanced Programs', 'Competitive Teams']
        },
        {
            title: 'Holiday Camps',
            description: 'Fun-filled camps during school holidays with diverse activities',
            icon: '🏕️',
            programs: ['Gymnastics Camps', 'Multi-Activity Camps', 'Themed Camps', 'Day Camps']
        },
        {
            title: 'Birthday Parties',
            description: 'Memorable birthday celebrations with gymnastics activities',
            icon: '🎉',
            programs: ['Party Packages', 'Custom Themes', 'Professional Hosting', 'Take-home Gifts']
        }
    ]

    const facilities = [
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
    ]

    const schedule = [
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
    ]

    const teamMembers = [
        {
            name: 'Sarah Johnson',
            role: 'Location Manager & Head Coach',
            specialization: 'Competitive Training',
            experience: '15+ years',
            image: '👩‍🏫'
        },
        {
            name: 'Michael Chen',
            role: 'Senior Coach',
            specialization: 'Youth Development',
            experience: '12+ years',
            image: '👨‍🏫'
        },
        {
            name: 'Emma Wilson',
            role: 'Assistant Coach',
            specialization: 'Beginner Programs',
            experience: '8+ years',
            image: '👩‍💼'
        }
    ]

    return (
        <div className="pt-20">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white section-padding overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <Image
                        src={getRandomImage('cyberport location')}
                        alt="Cyberport Location Background"
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
                            ProGym Cyberport
                        </h1>
                        <p className="text-xl text-primary-100 mb-8 leading-relaxed">
                            Our flagship location in the heart of Cyberport, featuring state-of-the-art facilities
                            and comprehensive gymnastics programs for the whole family.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link href="/book-trial" className="btn-secondary">
                                Book Free Trial
                            </Link>
                            <Link href="#contact-info" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600">
                                Visit Us Today
                            </Link>
                        </div>
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
                                Prime Cyberport Location
                            </h2>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Located in the prestigious Cyberport development, our facility offers easy access
                                via public transport and ample parking. The modern, purpose-built space provides
                                the perfect environment for gymnastics training and development.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <FiMapPin className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium text-gray-900">Address</div>
                                        <div className="text-gray-600 text-sm">Shop 123, Cyberport 3, 100 Cyberport Road, Cyberport, Hong Kong</div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <FiTruck className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium text-gray-900">Parking</div>
                                        <div className="text-gray-600 text-sm">Free parking available in Cyberport parking garage</div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <FiWifi className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium text-gray-900">Amenities</div>
                                        <div className="text-gray-600 text-sm">Free WiFi, air conditioning, viewing area for parents</div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <FiShield className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium text-gray-900">Safety</div>
                                        <div className="text-gray-600 text-sm">24/7 security, CCTV monitoring, first aid certified staff</div>
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
                                <div className="aspect-[4/3] bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                                    <div className="text-white text-center">
                                        <div className="text-6xl mb-4">🏢</div>
                                        <p className="text-lg font-medium">Cyberport Location</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Our Services Section - Same as Home Page */}
            <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 overflow-hidden">
                {/* Mobile-Optimized Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            rotate: 360,
                            scale: [1, 1.2, 1]
                        }}
                        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{
                            rotate: -360,
                            scale: [1, 1.3, 1]
                        }}
                        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                        className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-green-200/20 to-blue-200/20 rounded-full blur-3xl"
                    />

                    {/* Reduced Floating Particles for Mobile */}
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                y: [0, -30, 0],
                                opacity: [0.2, 0.8, 0.2],
                                scale: [0.5, 1.5, 0.5],
                            }}
                            transition={{
                                duration: 5 + Math.random() * 3,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}
                </div>

                <div className="w-full max-w-7xl mx-auto relative z-10">
                    {/* Mobile-First Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                        viewport={{ once: true }}
                        className="text-center mb-12 sm:mb-16 md:mb-20"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
                            viewport={{ once: true }}
                            className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-200/30 rounded-xl sm:rounded-2xl mb-4 sm:mb-6"
                        >
                            <FiStar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" />
                            <span className="text-blue-600 font-bold text-xs sm:text-sm uppercase tracking-wider">
                                Our Services
                            </span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            viewport={{ once: true }}
                            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-black text-gray-900 mb-4 sm:mb-6 leading-tight px-2"
                        >
                            Comprehensive Programs
                            <motion.span
                                className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                                animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                                transition={{ duration: 5, repeat: Infinity }}
                            >
                                For Every Need
                            </motion.span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            viewport={{ once: true }}
                            className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-4"
                        >
                            From structured gymnastics programs to exciting holiday camps and memorable birthday parties,
                            we offer comprehensive services that cater to diverse needs and interests.
                        </motion.p>
                    </motion.div>

                    {/* Mobile-First Services Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {[
                            {
                                title: 'GYMNASTICS PROGRAMS',
                                description: 'Comprehensive gymnastics programs designed for schools, bringing professional coaching directly to your educational institution.',
                                features: ['Ages 3-16 Programs', 'Professional Coaches', 'School Integration', 'Progress Tracking'],
                                href: '/locations/wan-chai',
                                image: '/images/services/school-gymnastics.jpg',
                                fallbackGradient: 'from-green-400 to-green-600',
                                emoji: '🤸‍♀️',
                                buttonText: 'Learn More',
                                color: 'green'
                            },
                            {
                                title: 'GYMNASTICS CAMPS',
                                description: 'Fun-filled holiday camps that combine skill development with exciting activities and games during school breaks.',
                                features: ['Daily Activities', 'Skill Development', 'Fun Games', 'Professional Supervision'],
                                href: '/holiday-camps',
                                image: '/images/services/holiday-camps.jpg',
                                fallbackGradient: 'from-red-400 to-red-600',
                                emoji: '🏕️',
                                buttonText: 'Learn More',
                                color: 'red'
                            },
                            {
                                title: 'MULTI-ACTIVITY CAMPS',
                                description: 'Diverse camps featuring gymnastics, sports, arts and crafts, and outdoor adventures for a well-rounded experience.',
                                features: ['Multiple Sports', 'Arts & Crafts', 'Outdoor Activities', 'Team Building'],
                                href: '/camps/multi-activity',
                                image: '/images/services/private-coaching.jpg',
                                fallbackGradient: 'from-blue-400 to-blue-600',
                                emoji: '🎨',
                                buttonText: 'Learn More',
                                color: 'blue'
                            },
                            {
                                title: 'BIRTHDAY PARTIES',
                                description: 'Unforgettable birthday celebrations with gymnastics activities, games, and professional hosting for memorable experiences.',
                                features: ['Party Hosting', 'Gymnastics Fun', 'Games & Activities', 'Memorable Experience'],
                                href: '/birthday-parties',
                                image: '/images/services/birthday-parties.jpg',
                                fallbackGradient: 'from-blue-800 to-blue-900',
                                emoji: '🎉',
                                buttonText: 'Learn More',
                                color: 'darkblue'
                            }
                        ].map((service, index) => (
                            <motion.div
                                key={service.title}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: index * 0.15,
                                    duration: 0.8,
                                    type: "spring",
                                    stiffness: 100
                                }}
                                viewport={{ once: true }}
                                className="group"
                            >
                                <motion.div
                                    className={`relative rounded-2xl sm:rounded-3xl overflow-hidden h-80 sm:h-96 ${service.color === 'green' ? 'bg-green-500' :
                                        service.color === 'red' ? 'bg-red-500' :
                                            service.color === 'blue' ? 'bg-blue-400' :
                                                'bg-blue-900'
                                        } text-white shadow-xl transition-all duration-500`}
                                    whileHover={{
                                        y: -8,
                                        scale: 1.02,
                                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                                    }}
                                >
                                    {/* AI Glow Effect on Hover */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    />

                                    {/* Mobile-Optimized Circular Image */}
                                    <motion.div
                                        className="absolute top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-10"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <motion.div
                                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-3 sm:border-4 border-white shadow-2xl"
                                            animate={{
                                                boxShadow: [
                                                    "0 10px 30px rgba(0,0,0,0.2)",
                                                    "0 15px 40px rgba(0,0,0,0.3)",
                                                    "0 10px 30px rgba(0,0,0,0.2)"
                                                ]
                                            }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <Image
                                                src={service.image}
                                                alt={service.title}
                                                width={128}
                                                height={128}
                                                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-125 group-hover:rotate-6"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    const parent = target.parentElement;
                                                    if (parent) {
                                                        parent.innerHTML = `
                                                            <div class="w-full h-full bg-white flex items-center justify-center">
                                                                <span class="text-2xl sm:text-4xl">${service.emoji}</span>
                                                            </div>
                                                        `;
                                                    }
                                                }}
                                            />
                                            {/* Fallback */}
                                            <div className="w-full h-full bg-white flex items-center justify-center">
                                                <span className="text-2xl sm:text-4xl">{service.emoji}</span>
                                            </div>
                                        </motion.div>
                                    </motion.div>

                                    {/* Mobile-Optimized Content */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-center">
                                        <motion.h3
                                            className="text-base sm:text-lg font-bold mb-2 sm:mb-4 leading-tight px-2"
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 + index * 0.1 }}
                                        >
                                            {service.title}
                                        </motion.h3>
                                    </div>

                                    {/* Reduced Floating Particles for Mobile */}
                                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                        {[...Array(2)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="absolute w-1 h-1 bg-white/50 rounded-full"
                                                style={{
                                                    left: `${30 + i * 40}%`,
                                                    bottom: '20%',
                                                }}
                                                animate={{
                                                    y: [0, -40, 0],
                                                    opacity: [0, 1, 0],
                                                    scale: [0, 1.5, 0],
                                                }}
                                                transition={{
                                                    duration: 2 + Math.random(),
                                                    repeat: Infinity,
                                                    delay: i * 0.5,
                                                }}
                                            />
                                        ))}
                                    </div>

                                    {/* Click overlay */}
                                    <Link href={service.href} className="absolute inset-0 z-20">
                                        <span className="sr-only">{service.title}</span>
                                    </Link>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Mobile-First CTA Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                        viewport={{ once: true }}
                        className="text-center mt-12 sm:mt-16 md:mt-20"
                    >
                        <motion.div
                            className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 text-white overflow-hidden shadow-2xl"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Mobile-Optimized Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="w-full h-full" style={{
                                    backgroundImage: `
                                        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                                    `,
                                    backgroundSize: '30px 30px'
                                }}></div>
                            </div>

                            {/* Mobile-Optimized Floating Orbs */}
                            <motion.div
                                className="absolute top-4 sm:top-10 right-4 sm:right-10 w-16 h-16 sm:w-32 sm:h-32 bg-white/10 rounded-full blur-2xl"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.5, 0.3]
                                }}
                                transition={{ duration: 4, repeat: Infinity }}
                            />
                            <motion.div
                                className="absolute bottom-4 sm:bottom-10 left-4 sm:left-10 w-20 h-20 sm:w-40 sm:h-40 bg-yellow-300/10 rounded-full blur-2xl"
                                animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [0.2, 0.4, 0.2]
                                }}
                                transition={{ duration: 5, repeat: Infinity }}
                            />

                            <div className="relative z-10">
                                <motion.h3
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.8 }}
                                    viewport={{ once: true }}
                                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-black mb-4 sm:mb-6 px-2"
                                >
                                    🚀 Ready to Start Your Journey?
                                </motion.h3>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.8 }}
                                    viewport={{ once: true }}
                                    className="text-base sm:text-lg md:text-xl text-white/90 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4"
                                >
                                    Join hundreds of satisfied families who have chosen ProActive Sports for their gymnastics training needs.
                                    Book your free trial class today and experience the difference!
                                </motion.p>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.8 }}
                                    viewport={{ once: true }}
                                    className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 px-4"
                                >
                                    <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                                        <Link
                                            href="/book-trial"
                                            className="group relative overflow-hidden bg-white text-blue-600 hover:bg-gray-50 px-6 py-3 sm:px-10 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-xl flex items-center space-x-2 w-full sm:w-auto justify-center"
                                        >
                                            <span>Book Free Trial</span>
                                            <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform duration-300" />
                                        </Link>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                                        <Link
                                            href="/contact"
                                            className="group border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 sm:px-10 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center space-x-2 w-full sm:w-auto justify-center"
                                        >
                                            <span>Contact Us</span>
                                            <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform duration-300" />
                                        </Link>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Facilities */}
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
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                viewport={{ once: true }}
                                className="card p-6"
                            >
                                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">
                                    {facility.name}
                                </h3>
                                <p className="text-gray-600 mb-4 leading-relaxed">
                                    {facility.description}
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {facility.features.map((feature) => (
                                        <div key={feature} className="flex items-center space-x-2 text-sm text-gray-500">
                                            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Class Schedule */}
            <section className="section-padding bg-gray-50">
                <div className="container-max">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
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
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                viewport={{ once: true }}
                                className="card p-6"
                            >
                                <h3 className="text-xl font-heading font-bold text-gray-900 mb-4">
                                    {day.day}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {day.classes.map((classItem, idx) => (
                                        <div key={idx} className="bg-gray-50 rounded-lg p-4">
                                            <div className="font-medium text-primary-600 text-sm mb-1">
                                                {classItem.time}
                                            </div>
                                            <div className="font-medium text-gray-900 text-sm mb-2">
                                                {classItem.program}
                                            </div>
                                            <div className={`text-xs px-2 py-1 rounded-full inline-block ${classItem.spots === 'Available'
                                                ? 'bg-green-100 text-green-700'
                                                : classItem.spots === 'Limited'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {classItem.spots}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mt-12"
                    >
                        <Link href="/book-trial" className="btn-primary">
                            Book Your Class Today
                        </Link>
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
                                Shop 123, Cyberport 3<br />
                                100 Cyberport Road<br />
                                Cyberport, Hong Kong
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
                                +852 2234 5678<br />
                                <span className="text-xs">Mon-Fri: 9AM-8PM<br />Sat-Sun: 9AM-6PM</span>
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
                                cyberport@proactivsports.net<br />
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
                                Mon-Fri: 3:30PM-8:30PM<br />
                                Sat-Sun: 9:00AM-6:00PM<br />
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
                            <Link href="/book-trial" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
                                Book Free Trial
                            </Link>
                            <Link href="/contact" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold transition-all duration-300">
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