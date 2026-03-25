'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { FiStar, FiChevronLeft, FiChevronRight, FiMessageCircle } from 'react-icons/fi'
import { getRandomPersonImage } from '@/utils/imageUtils'

const Testimonials = () => {
    const [currentTestimonial, setCurrentTestimonial] = useState(0)
    const [particles, setParticles] = useState<Array<{ id: number; left: number; top: number; fontSize: number; duration: number; delay: number }>>([])
    const [testimonials, setTestimonials] = useState<any[]>([])

    useEffect(() => {
        // Generate particles and testimonials only on client side to avoid hydration mismatch
        const generatedParticles = [...Array(10)].map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            fontSize: 20 + Math.random() * 20,
            duration: 8 + Math.random() * 4,
            delay: Math.random() * 3
        }))
        setParticles(generatedParticles)

        const generatedTestimonials = [
            {
                id: 1,
                name: 'Jennifer Wong',
                role: 'Parent of Emma (Age 7)',
                rating: 5,
                text: "ProActive Sports has been amazing for my daughter Emma. She started as a shy 5-year-old and now she's confident, strong, and absolutely loves gymnastics. The coaches are patient, professional, and really know how to work with children.",
                image: getRandomPersonImage('female'),
                fallback: 'bg-gradient-to-br from-pink-400 to-purple-500',
                program: 'School Gymnastics Program'
            },
            {
                id: 2,
                name: 'David Chen',
                role: 'Parent of Lucas (Age 10)',
                rating: 5,
                text: "We've tried several gymnastics schools, but ProActive Sports stands out. The facilities are excellent, the coaching is top-notch, and most importantly, my son Lucas has developed not just physical skills but also discipline and confidence.",
                image: getRandomPersonImage('male'),
                fallback: 'bg-gradient-to-br from-blue-400 to-cyan-500',
                program: 'Advanced Training Program'
            },
            {
                id: 3,
                name: 'Sarah Mitchell',
                role: 'Parent of Sophia (Age 6)',
                rating: 5,
                text: "The holiday camps at ProActive Sports are fantastic! Sophia always comes home excited about what she learned. The coaches make it fun while still teaching proper techniques. It's the perfect balance of learning and enjoyment.",
                image: getRandomPersonImage('female'),
                fallback: 'bg-gradient-to-br from-green-400 to-teal-500',
                program: 'Holiday Camps'
            },
            {
                id: 4,
                name: 'Michael Johnson',
                role: 'Parent of Alex (Age 8)',
                rating: 5,
                text: "We had Alex's birthday party at ProActive Sports and it was incredible! The staff handled everything perfectly, the kids had a blast, and Alex still talks about it months later. Highly recommend for parties!",
                image: getRandomPersonImage('male'),
                fallback: 'bg-gradient-to-br from-orange-400 to-red-500',
                program: 'Birthday Party'
            },
            {
                id: 5,
                name: 'Lisa Zhang',
                role: 'Parent of Chloe (Age 9)',
                rating: 5,
                text: "The progress Chloe has made at ProActive Sports is remarkable. From basic tumbling to advanced routines, the structured approach and individual attention from coaches has helped her excel beyond our expectations.",
                image: getRandomPersonImage('female'),
                fallback: 'bg-gradient-to-br from-purple-400 to-pink-500',
                program: 'Competitive Training'
            }
        ]
        setTestimonials(generatedTestimonials)
    }, [])

    // Auto-advance testimonials
    useEffect(() => {
        if (testimonials.length === 0) return

        const timer = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
        }, 6000) // Change every 6 seconds

        return () => clearInterval(timer)
    }, [testimonials.length])

    const goToPrevious = () => {
        setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    }

    const goToNext = () => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }

    const goToTestimonial = (index: number) => {
        setCurrentTestimonial(index)
    }

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <FiStar
                key={i}
                className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
        ))
    }

    return (
        <section className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 overflow-hidden">
            {/* Only render if testimonials are loaded */}
            {testimonials.length === 0 ? (
                <div className="container-max px-4 py-20 text-center">
                    <div className="animate-pulse">Loading testimonials...</div>
                </div>
            ) : (
                <>
                    {/* Ultra-Modern Background Elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div
                            animate={{
                                rotate: 360,
                                scale: [1, 1.2, 1]
                            }}
                            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                            className="absolute top-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"
                        />
                        <motion.div
                            animate={{
                                rotate: -360,
                                scale: [1, 1.3, 1]
                            }}
                            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                            className="absolute bottom-0 left-0 w-64 h-64 sm:w-[500px] sm:h-[500px] bg-gradient-to-r from-green-200/20 to-cyan-200/20 rounded-full blur-3xl"
                        />

                        {/* Floating Quote Icons */}
                        {particles.map((particle) => (
                            <motion.div
                                key={particle.id}
                                className="absolute text-blue-200/30"
                                style={{
                                    left: `${particle.left}%`,
                                    top: `${particle.top}%`,
                                    fontSize: `${particle.fontSize}px`
                                }}
                                animate={{
                                    y: [0, -50, 0],
                                    opacity: [0.1, 0.3, 0.1],
                                    rotate: [0, 360, 0],
                                }}
                                transition={{
                                    duration: particle.duration,
                                    repeat: Infinity,
                                    delay: particle.delay,
                                }}
                            >
                                <FiMessageCircle />
                            </motion.div>
                        ))}
                    </div>

                    <div className="container-max px-4 relative z-10">
                        {/* Ultra-Modern Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                            viewport={{ once: true }}
                            className="text-center mb-20"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
                                viewport={{ once: true }}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-200/30 rounded-2xl mb-6"
                            >
                                <FiStar className="w-5 h-5 text-blue-600 mr-2" />
                                <span className="text-blue-600 font-bold text-sm uppercase tracking-wider">
                                    Testimonials
                                </span>
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                viewport={{ once: true }}
                                className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-gray-900 mb-6 leading-tight"
                            >
                                What Parents Say
                                <motion.span
                                    className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                                    animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                                    transition={{ duration: 5, repeat: Infinity }}
                                >
                                    About Our Programs
                                </motion.span>
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.8 }}
                                viewport={{ once: true }}
                                className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed"
                            >
                                Don't just take our word for it. Here's what parents and students have to say about
                                their experience with ProActive Sports.
                            </motion.p>
                        </motion.div>

                        {/* Ultra-Modern Testimonial Slider */}
                        <div className="relative max-w-6xl mx-auto mb-16">
                            <motion.div
                                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 backdrop-blur-xl border border-gradient-to-r from-blue-200/50 via-purple-200/50 to-pink-200/50 shadow-2xl hover:shadow-3xl transition-all duration-500"
                                whileHover={{ scale: 1.02, y: -5 }}
                                transition={{ duration: 0.3 }}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentTestimonial}
                                        initial={{ opacity: 0, x: 100, rotateY: 15 }}
                                        animate={{ opacity: 1, x: 0, rotateY: 0 }}
                                        exit={{ opacity: 0, x: -100, rotateY: -15 }}
                                        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                                        className="p-12 md:p-16"
                                    >
                                        <div className="grid md:grid-cols-3 gap-12 items-center">
                                            {/* Enhanced Customer Photo */}
                                            <div className="text-center md:text-left">
                                                <motion.div
                                                    className="relative w-40 h-40 mx-auto md:mx-0 mb-6"
                                                    whileHover={{ scale: 1.15, rotate: 8 }}
                                                    transition={{ type: "spring", stiffness: 300 }}
                                                >
                                                    <motion.div
                                                        className={`w-full h-full rounded-full ${testimonials[currentTestimonial].fallback} p-1 shadow-2xl`}
                                                        animate={{
                                                            background: [
                                                                testimonials[currentTestimonial].fallback,
                                                                testimonials[currentTestimonial].fallback.replace('from-', 'from-').replace('to-', 'via-white to-'),
                                                                testimonials[currentTestimonial].fallback
                                                            ]
                                                        }}
                                                        transition={{ duration: 4, repeat: Infinity }}
                                                    >
                                                        <div className="w-full h-full rounded-full overflow-hidden bg-white border-4 border-white">
                                                            <Image
                                                                src={testimonials[currentTestimonial].image}
                                                                alt={testimonials[currentTestimonial].name}
                                                                fill
                                                                className="object-cover"
                                                                onError={(e) => e.currentTarget.style.display = 'none'}
                                                            />
                                                        </div>
                                                    </motion.div>

                                                    {/* Verified Badge */}
                                                    <motion.div
                                                        className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full p-2 shadow-lg border-2 border-white"
                                                        animate={{ scale: [1, 1.1, 1] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                    >
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </motion.div>

                                                    {/* Floating Stars */}
                                                    {[...Array(3)].map((_, i) => (
                                                        <motion.div
                                                            key={i}
                                                            className="absolute text-yellow-400"
                                                            style={{
                                                                left: `${20 + i * 30}%`,
                                                                top: `${10 + i * 20}%`,
                                                            }}
                                                            animate={{
                                                                y: [0, -10, 0],
                                                                rotate: [0, 180, 360],
                                                                scale: [0.8, 1.2, 0.8],
                                                            }}
                                                            transition={{
                                                                duration: 2 + i * 0.5,
                                                                repeat: Infinity,
                                                                delay: i * 0.3,
                                                            }}
                                                        >
                                                            <FiStar className="w-4 h-4" />
                                                        </motion.div>
                                                    ))}
                                                </motion.div>

                                                <motion.h4
                                                    className="text-2xl font-black text-gray-800 mb-2"
                                                    animate={{
                                                        color: ['#1f2937', '#3b82f6', '#1f2937']
                                                    }}
                                                    transition={{ duration: 4, repeat: Infinity }}
                                                >
                                                    {testimonials[currentTestimonial].name}
                                                </motion.h4>
                                                <p className="text-gray-600 text-sm mb-4 font-medium">
                                                    {testimonials[currentTestimonial].role}
                                                </p>

                                                <motion.div
                                                    className="flex justify-center md:justify-start space-x-1 mb-4"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.3, type: "spring" }}
                                                >
                                                    {renderStars(testimonials[currentTestimonial].rating)}
                                                </motion.div>

                                                <motion.div
                                                    className="text-xs text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-2xl inline-block border border-blue-200/50"
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    {testimonials[currentTestimonial].program}
                                                </motion.div>
                                            </div>

                                            {/* Enhanced Testimonial Content */}
                                            <div className="md:col-span-2">
                                                <div className="relative">
                                                    <motion.div
                                                        className="absolute -top-8 -left-4 w-16 h-16 text-blue-200/50 text-6xl font-serif"
                                                        animate={{
                                                            rotate: [0, 10, -10, 0],
                                                            scale: [1, 1.1, 1]
                                                        }}
                                                        transition={{ duration: 4, repeat: Infinity }}
                                                    >
                                                        "
                                                    </motion.div>
                                                    <motion.blockquote
                                                        className="text-xl md:text-2xl text-gray-700 leading-relaxed italic pl-8 font-medium"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.2, duration: 0.8 }}
                                                    >
                                                        "{testimonials[currentTestimonial].text}"
                                                    </motion.blockquote>
                                                    <motion.div
                                                        className="absolute -bottom-4 -right-4 w-12 h-12 text-blue-200/50 text-4xl font-serif rotate-180"
                                                        animate={{
                                                            rotate: [180, 190, 170, 180],
                                                            scale: [1, 1.1, 1]
                                                        }}
                                                        transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                                                    >
                                                        "
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Enhanced Navigation Arrows */}
                                <motion.button
                                    id="testimonials-prev-btn"
                                    onClick={goToPrevious}
                                    className="absolute left-6 top-1/2 transform -translate-y-1/2 w-14 h-14 bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-2xl flex items-center justify-center text-gray-600 hover:bg-white hover:text-blue-600 transition-all duration-500 shadow-xl group"
                                    aria-label="Previous testimonial"
                                    whileHover={{ scale: 1.1, rotate: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FiChevronLeft className="w-6 h-6 group-hover:scale-125 group-hover:-translate-x-1 transition-all duration-300" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </motion.button>

                                <motion.button
                                    id="testimonials-next-btn"
                                    onClick={goToNext}
                                    className="absolute right-6 top-1/2 transform -translate-y-1/2 w-14 h-14 bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-2xl flex items-center justify-center text-gray-600 hover:bg-white hover:text-blue-600 transition-all duration-500 shadow-xl group"
                                    aria-label="Next testimonial"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FiChevronRight className="w-6 h-6 group-hover:scale-125 group-hover:translate-x-1 transition-all duration-300" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </motion.button>
                            </motion.div>

                            {/* Enhanced Dots Indicator */}
                            <motion.div
                                className="flex justify-center space-x-3 mt-12"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                {testimonials.map((_, index) => (
                                    <motion.button
                                        id={`testimonials-dot-${index}-btn`}
                                        key={index}
                                        onClick={() => goToTestimonial(index)}
                                        className={`relative overflow-hidden rounded-full transition-all duration-500 ${index === currentTestimonial
                                            ? 'w-12 h-4 bg-blue-600 shadow-lg'
                                            : 'w-4 h-4 bg-gray-300 hover:bg-gray-400 hover:scale-125'
                                            }`}
                                        aria-label={`Go to testimonial ${index + 1}`}
                                        whileHover={{ scale: index === currentTestimonial ? 1.05 : 1.25 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        {index === currentTestimonial && (
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                                                layoutId="activeTestimonialIndicator"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                    </motion.button>
                                ))}
                            </motion.div>
                        </div>

                        {/* Ultra-Modern Stats Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                            viewport={{ once: true }}
                            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-12 max-w-3xl mx-auto"
                        >
                            {[
                                { number: "4.9/5", label: "Average Rating", sublabel: "Based on reviews", color: "from-blue-500 to-cyan-500", bg: "from-blue-50 to-cyan-50", icon: "?" },
                                { number: "98%", label: "Satisfaction Rate", sublabel: "Based on parent feedback", color: "from-green-500 to-emerald-500", bg: "from-green-50 to-emerald-50", icon: "??" },
                                { number: "200+", label: "Happy Families", sublabel: "Across both locations", color: "from-purple-500 to-pink-500", bg: "from-purple-50 to-pink-50", icon: "???????????" }
                            ].map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, scale: 0.5, rotateY: 45 }}
                                    whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                                    transition={{
                                        delay: index * 0.2,
                                        duration: 0.8,
                                        type: "spring",
                                        stiffness: 100
                                    }}
                                    viewport={{ once: true }}
                                    className="group"
                                >
                                    <motion.div
                                        className={`bg-gradient-to-br ${stat.bg} rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-500 border border-white/50 cursor-pointer relative overflow-hidden h-full flex flex-col items-center justify-center`}
                                        whileHover={{ scale: 1.05, y: -8 }}
                                    >
                                        <motion.div
                                            className="text-4xl mb-2"
                                            animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                                            transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                                        >
                                            {stat.icon}
                                        </motion.div>
                                        <motion.div
                                            className={`text-3xl font-black mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                                            animate={{ scale: [1, 1.08, 1] }}
                                            transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                                        >
                                            {stat.number}
                                        </motion.div>
                                        <div className="text-gray-700 font-bold text-sm mb-1">{stat.label}</div>
                                        {index === 0 && (
                                            <motion.div
                                                className="flex justify-center space-x-0.5 mb-1"
                                                animate={{ scale: [1, 1.08, 1] }}
                                                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                                            >
                                                {renderStars(5)}
                                            </motion.div>
                                        )}
                                        <div className="text-xs text-gray-500 font-medium text-center">{stat.sublabel}</div>

                                        {/* Animated Background */}
                                        <motion.div
                                            className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`}
                                        />
                                    </motion.div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Ultra-Modern CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <motion.div
                                className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500"
                                whileHover={{ scale: 1.03, y: -5 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Animated Background Pattern */}
                                <div className="absolute inset-0 opacity-10">
                                    <div className="w-full h-full" style={{
                                        backgroundImage: `
                                    linear-gradient(rgba(255,255,255,0.1) 2px, transparent 2px),
                                    linear-gradient(90deg, rgba(255,255,255,0.1) 2px, transparent 2px)
                                `,
                                        backgroundSize: '40px 40px'
                                    }}></div>
                                </div>

                                {/* Floating Orbs */}
                                <motion.div
                                    className="absolute top-8 right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.3, 0.5, 0.3]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                />
                                <motion.div
                                    className="absolute bottom-8 left-8 w-40 h-40 bg-yellow-300/10 rounded-full blur-2xl"
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
                                        className="text-3xl sm:text-4xl font-black mb-6"
                                    >
                                        Ready to Join Our Happy Families?
                                    </motion.h3>
                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3, duration: 0.8 }}
                                        viewport={{ once: true }}
                                        className="text-lg text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed"
                                    >
                                        Experience the ProActive Sports difference for yourself. Book a free trial class
                                        and see why parents choose us for their children's gymnastics journey.
                                    </motion.p>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4, duration: 0.8 }}
                                        viewport={{ once: true }}
                                        className="flex flex-col sm:flex-row gap-6 justify-center"
                                    >
                                        <motion.div whileHover={{ scale: 1.08, y: -5 }} whileTap={{ scale: 0.95 }}>
                                            <a id="sections-testimonials-link-book-trial"
                                                href="/book-trial"
                                                className="group relative overflow-hidden bg-white text-blue-600 hover:bg-gray-50 px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center space-x-2 border-2 border-white"
                                            >
                                                <span>?? Book Free Trial</span>
                                                <FiStar className="w-5 h-5 group-hover:rotate-180 group-hover:scale-125 transition-all duration-500" />
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-purple-100/50"
                                                    initial={{ x: '-100%' }}
                                                    whileHover={{ x: '100%' }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </a>
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.08, y: -5 }} whileTap={{ scale: 0.95 }}>
                                            <a id="sections-testimonials-link-contact"
                                                href="/contact"
                                                className="group border-2 border-white text-white hover:bg-white hover:text-blue-600 px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center space-x-2 hover:shadow-2xl"
                                            >
                                                <span>?? Contact Us</span>
                                                <FiMessageCircle className="w-5 h-5 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
                                            </a>
                                        </motion.div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </>
            )}
        </section>
    )
}

export default Testimonials
