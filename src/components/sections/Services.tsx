'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiArrowRight, FiStar, FiCheck } from 'react-icons/fi'
import { useCMSData } from '@/hooks/useCMSData'
import { CMSService, ServiceCardData } from '@/services/cmsService'

const staticServices = [
    {
        title: 'GYMNASTICS PROGRAMS',
        description: 'Comprehensive gymnastics programs designed for schools, bringing professional coaching directly to your educational institution.',
        features: ['Ages 3-16 Programs', 'Professional Coaches', 'School Integration', 'Progress Tracking'],
        href: '/locations/wan-chai',
        image: '/images/services/school-gymnastics.jpg',
        emoji: '🤸‍♀️',
        color: 'green',
        gradient: 'from-green-400 to-green-600'
    },
    {
        title: 'GYMNASTICS CAMPS',
        description: 'Fun-filled holiday camps that combine skill development with exciting activities and games during school breaks.',
        features: ['Daily Activities', 'Skill Development', 'Fun Games', 'Professional Supervision'],
        href: '/camps/gymnastics',
        image: '/images/services/holiday-camps.jpg',
        emoji: '🏕️',
        color: 'red',
        gradient: 'from-red-400 to-red-600'
    },
    {
        title: 'PRIVATE COACHING',
        description: 'One-on-one personalized coaching sessions tailored to individual needs and skill levels for accelerated progress.',
        features: ['Personalized Training', 'Flexible Schedule', 'Individual Attention', 'Rapid Progress'],
        href: '/private-coaching',
        image: '/images/services/private-coaching.jpg',
        emoji: '👨‍🏫',
        color: 'blue',
        gradient: 'from-blue-400 to-blue-600'
    },
    {
        title: 'BIRTHDAY PARTIES',
        description: 'Unforgettable birthday celebrations with gymnastics activities, games, and professional hosting for memorable experiences.',
        features: ['Party Hosting', 'Gymnastics Fun', 'Games & Activities', 'Memorable Experience'],
        href: '/birthday-parties',
        image: '/images/services/birthday-parties.jpg',
        emoji: '🎉',
        color: 'darkblue',
        gradient: 'from-blue-800 to-blue-900'
    }
]

const Services = () => {
    const [flippedCard, setFlippedCard] = useState<number | null>(null)
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
    const [particles, setParticles] = useState<Array<{ id: number; left: number; top: number; duration: number; delay: number }>>([])

    useEffect(() => {
        // Generate particles only on client side to avoid hydration mismatch
        const generatedParticles = [...Array(10)].map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            duration: 5 + Math.random() * 3,
            delay: Math.random() * 2
        }))
        setParticles(generatedParticles)
    }, [])

    const { data: dynamicServices } = useCMSData<ServiceCardData[]>(
        () => CMSService.getServices(),
        [],
        []
    )

    const services = dynamicServices.length > 0
        ? dynamicServices.map(s => ({
            title: s.title,
            description: s.description,
            features: s.features,
            href: s.href,
            image: s.image,
            emoji: s.emoji,
            color: s.color,
            gradient: s.gradient,
        }))
        : staticServices

    // Ripple effect
    const createRipple = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const id = Date.now()

        setRipples(prev => [...prev, { x, y, id }])
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== id))
        }, 600)

        setFlippedCard(flippedCard === index ? null : index)
    }



    return (
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ rotate: -360, scale: [1, 1.3, 1] }}
                    transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-green-200/20 to-blue-200/20 rounded-full blur-3xl"
                />

                {/* Floating Particles */}
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full"
                        style={{
                            left: `${particle.left}%`,
                            top: `${particle.top}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.8, 0.2],
                            scale: [0.5, 1.5, 0.5],
                        }}
                        transition={{
                            duration: particle.duration,
                            repeat: Infinity,
                            delay: particle.delay,
                        }}
                    />
                ))}
            </div>

            <div className="w-full max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-12 sm:mb-16"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
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
                        transition={{ delay: 0.3 }}
                        viewport={{ once: true }}
                        className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-black text-gray-900 mb-4 sm:mb-6 leading-tight px-2 pb-2"
                        style={{ lineHeight: '1.3' }}
                    >
                        Comprehensive Programs
                        <motion.span
                            className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent pb-2"
                            style={{ lineHeight: '1.3' }}
                        >
                            For Every Need
                        </motion.span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        viewport={{ once: true }}
                        className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-4"
                    >
                        From structured gymnastics programs to exciting holiday camps and memorable birthday parties,
                        we offer comprehensive services that cater to diverse needs and interests.
                    </motion.p>
                </motion.div>

                {/* Services Grid with Card Shuffle Animation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.title}
                            initial={{ opacity: 0, y: 100, rotate: -10 }}
                            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                            transition={{
                                delay: index * 0.2,
                                duration: 0.8,
                                type: "spring",
                                stiffness: 100
                            }}
                            viewport={{ once: true }}
                            className="group"
                            style={{ perspective: '1000px', minHeight: '400px' }}
                        >
                            <motion.div
                                className="relative w-full min-h-[400px]"
                                style={{ transformStyle: 'preserve-3d' }}
                                animate={{ rotateY: flippedCard === index ? 180 : 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                {/* Front Side */}
                                <motion.div
                                    className={`absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden ${service.color === 'green' ? 'bg-green-500' :
                                        service.color === 'red' ? 'bg-red-500' :
                                            service.color === 'blue' ? 'bg-blue-400' :
                                                'bg-blue-900'
                                        } text-white shadow-2xl cursor-pointer min-h-[400px]`}
                                    style={{
                                        backfaceVisibility: 'hidden'
                                    }}
                                    onClick={(e) => createRipple(e, index)}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    {/* Ripple Effects */}
                                    {ripples.filter((_, i) => i === index).map((ripple) => (
                                        <motion.div
                                            key={ripple.id}
                                            className="absolute rounded-full bg-white/30"
                                            style={{ left: ripple.x, top: ripple.y, width: 0, height: 0 }}
                                            animate={{
                                                width: 300,
                                                height: 300,
                                                opacity: [0.5, 0],
                                                x: -150,
                                                y: -150,
                                            }}
                                            transition={{ duration: 0.6 }}
                                        />
                                    ))}

                                    {/* Animated Glow Effect */}
                                    <motion.div
                                        className={`absolute inset-0 bg-gradient-to-r ${service.gradient} opacity-0 group-hover:opacity-30 blur-xl`}
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0, 0.3, 0]
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />

                                    {/* Circular Image - Fixed Position, Larger Size */}
                                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
                                        <motion.div
                                            className="w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white"
                                            whileHover={{ scale: 1.1 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <img
                                                src={service.image}
                                                alt={service.title}
                                                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                                            />
                                        </motion.div>
                                    </div>

                                    {/* Content */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                                        <h3 className="text-lg font-bold mb-4">{service.title}</h3>

                                        {/* Learn More Button - Reveals on Hover */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        >
                                            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
                                                <span>Click to flip</span>
                                                <FiArrowRight className="w-4 h-4" />
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Floating Particles */}
                                    {[...Array(3)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-1.5 h-1.5 bg-white/50 rounded-full"
                                            style={{ left: `${30 + i * 20}%`, bottom: '30%' }}
                                            animate={{
                                                y: [0, -40, 0],
                                                opacity: [0, 1, 0],
                                                scale: [0, 2, 0],
                                            }}
                                            transition={{
                                                duration: 2.5,
                                                repeat: Infinity,
                                                delay: i * 0.4,
                                            }}
                                        />
                                    ))}
                                </motion.div>

                                {/* Back Side */}
                                <motion.div
                                    className={`absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden bg-white border-2 ${service.color === 'green' ? 'border-green-500' :
                                        service.color === 'red' ? 'border-red-500' :
                                            service.color === 'blue' ? 'border-blue-400' :
                                                'border-blue-900'
                                        } shadow-2xl cursor-pointer min-h-[400px] p-6`}
                                    style={{
                                        backfaceVisibility: 'hidden',
                                        transform: 'rotateY(180deg)'
                                    }}
                                    onClick={(e) => createRipple(e, index)}
                                >
                                    <div className="h-full flex flex-col justify-center">
                                        <div className={`w-16 h-16 ${service.color === 'green' ? 'bg-green-500' :
                                            service.color === 'red' ? 'bg-red-500' :
                                                service.color === 'blue' ? 'bg-blue-400' :
                                                    'bg-blue-900'
                                            } rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                                            <span className="text-3xl">{service.emoji}</span>
                                        </div>

                                        <h3 className="font-heading font-bold text-lg text-gray-900 mb-3 text-center">
                                            {service.title}
                                        </h3>

                                        <p className="text-gray-600 text-xs text-center leading-relaxed mb-4 px-2">
                                            {service.description}
                                        </p>

                                        {/* Features List */}
                                        <div className="space-y-2 mb-4">
                                            {service.features.map((feature, idx) => (
                                                <motion.div
                                                    key={feature}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="flex items-center space-x-2 text-xs text-gray-700"
                                                >
                                                    <FiCheck className={`w-4 h-4 ${service.color === 'green' ? 'text-green-500' :
                                                        service.color === 'red' ? 'text-red-500' :
                                                            service.color === 'blue' ? 'text-blue-400' :
                                                                'text-blue-900'
                                                        }`} />
                                                    <span>{feature}</span>
                                                </motion.div>
                                            ))}
                                        </div>

                                        <Link id="sections-services-nav"
                                            href={service.href}
                                            className={`inline-flex items-center justify-center space-x-2 ${service.color === 'green' ? 'bg-green-500 hover:bg-green-600' :
                                                service.color === 'red' ? 'bg-red-500 hover:bg-red-600' :
                                                    service.color === 'blue' ? 'bg-blue-400 hover:bg-blue-500' :
                                                        'bg-blue-900 hover:bg-blue-950'
                                                } text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl`}
                                        >
                                            <span>Learn More</span>
                                            <FiArrowRight className="w-4 h-4" />
                                        </Link>

                                        <motion.div
                                            className="text-center text-[10px] text-gray-500 font-semibold mt-3"
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            ← Click to flip back
                                        </motion.div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1 }}
                    viewport={{ once: true }}
                    className="text-center mt-12 sm:mt-16 md:mt-20"
                >
                    <motion.div
                        className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 text-white overflow-hidden shadow-2xl"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="absolute inset-0 opacity-10">
                            <div className="w-full h-full" style={{
                                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                                backgroundSize: '30px 30px'
                            }}></div>
                        </div>

                        <motion.div
                            className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                            transition={{ duration: 4, repeat: Infinity }}
                        />

                        <div className="relative z-10">
                            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-black mb-4 sm:mb-6">
                                🚀 Ready to Start Your Journey?
                            </h3>
                            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed">
                                Join hundreds of satisfied families who have chosen ProActive Sports for their gymnastics training needs.
                                Book your free trial class today!
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                                <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                                    <Link id="sections-services-nav-book-trial"
                                        href="/book-trial"
                                        className="group bg-white text-blue-600 hover:bg-gray-50 px-6 py-3 sm:px-10 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 shadow-xl flex items-center space-x-2"
                                    >
                                        <span>Book Free Trial</span>
                                        <FiArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                    </Link>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                                    <Link id="sections-services-nav-contact"
                                        href="/contact"
                                        className="group border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 sm:px-10 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center space-x-2"
                                    >
                                        <span>Contact Us</span>
                                        <FiArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                    </Link>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}

export default Services
