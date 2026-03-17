'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import Link from 'next/link'
import { FiPlay, FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2, suffix = '' }: { end: number; duration?: number; suffix?: string }) => {
    const [count, setCount] = useState(0)
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    useEffect(() => {
        if (!isInView) return

        let startTime: number | null = null
        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime
            const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)

            setCount(Math.floor(progress * end))

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        requestAnimationFrame(animate)
    }, [end, duration, isInView])

    return <span ref={ref}>{count}{suffix}</span>
}

const Hero = () => {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [imageLoadStatus, setImageLoadStatus] = useState<Record<string, boolean>>({})
    const [currentWordIndex, setCurrentWordIndex] = useState(0)
    const [displayText, setDisplayText] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)

    const rotatingWords = ['Strength', 'Confidence', 'Character', 'Excellence', 'Champions']

    // Hero images - Updated with new professional images
    const heroImages = [
        {
            src: '/images/hero/img1.png',
            alt: 'Professional gymnastics training facility',
            fallback: 'bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800'
        },
        {
            src: '/images/hero/img2.jpg',
            alt: 'Children excelling in gymnastics',
            fallback: 'bg-gradient-to-br from-green-600 via-blue-600 to-purple-800'
        },
        {
            src: '/images/hero/img3.jpg',
            alt: 'Expert coaching and guidance',
            fallback: 'bg-gradient-to-br from-purple-600 via-pink-600 to-red-800'
        },
        {
            src: '/images/hero/img4.jpg',
            alt: 'Dynamic gymnastics sessions',
            fallback: 'bg-gradient-to-br from-orange-600 via-red-600 to-pink-800'
        },
        {
            src: '/images/hero/gymnastics-1.jpg',
            alt: 'Children practicing gymnastics',
            fallback: 'bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-800'
        },
        {
            src: '/images/hero/gymnastics-2.jpg',
            alt: 'Gymnastics training session',
            fallback: 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-800'
        },
        {
            src: '/images/hero/gymnastics-3.jpg',
            alt: 'Professional gymnastics coaching',
            fallback: 'bg-gradient-to-br from-rose-600 via-orange-600 to-yellow-800'
        },
        {
            src: '/images/hero/gymnastics-4.png',
            alt: 'Kids enjoying gymnastics class',
            fallback: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-800'
        },
        {
            src: '/images/hero/gymnastics-5.jpg',
            alt: 'Competitive gymnastics training',
            fallback: 'bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-800'
        }
    ]

    // Typewriter effect
    useEffect(() => {
        const currentWord = rotatingWords[currentWordIndex]
        const typingSpeed = isDeleting ? 50 : 100
        const pauseTime = isDeleting ? 500 : 2000

        const timer = setTimeout(() => {
            if (!isDeleting) {
                // Typing
                if (displayText.length < currentWord.length) {
                    setDisplayText(currentWord.slice(0, displayText.length + 1))
                } else {
                    // Pause before deleting
                    setTimeout(() => setIsDeleting(true), pauseTime)
                }
            } else {
                // Deleting
                if (displayText.length > 0) {
                    setDisplayText(currentWord.slice(0, displayText.length - 1))
                } else {
                    // Move to next word
                    setIsDeleting(false)
                    setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length)
                }
            }
        }, typingSpeed)

        return () => clearTimeout(timer)
    }, [displayText, isDeleting, currentWordIndex, rotatingWords])

    // Auto-slide functionality
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroImages.length)
        }, 9000) // Change slide every 9 seconds

        return () => clearInterval(timer)
    }, [heroImages.length])

    const handleImageLoad = (src: string) => {
        setImageLoadStatus(prev => ({ ...prev, [src]: true }))
    }

    const handleImageError = (src: string) => {
        setImageLoadStatus(prev => ({ ...prev, [src]: false }))
        console.log(`Failed to load image: ${src}`)
    }

    const goToSlide = (index: number) => {
        setCurrentSlide(index)
    }

    const goToPrevious = () => {
        console.log('Previous clicked, current:', currentSlide)
        setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)
    }

    const goToNext = () => {
        console.log('Next clicked, current:', currentSlide)
        setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }

    return (
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-20 sm:pt-24 pb-12 sm:pb-16 lg:pb-20">
            {/* Mobile-First Background with Parallax Effect */}
            <div className="absolute inset-0 z-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{
                            duration: 1,
                            ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        className="absolute inset-0"
                    >
                        {/* Advanced Gradient Overlay */}
                        <div className={`w-full h-full ${heroImages[currentSlide].fallback} opacity-95`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-black/50"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
                        </div>

                        {/* Enhanced Image Loading - Full Cover with Smart Positioning */}
                        <motion.div
                            className="absolute inset-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                        >
                            <img
                                src={heroImages[currentSlide].src}
                                alt={heroImages[currentSlide].alt}
                                className="absolute inset-0 w-full h-full object-cover"
                                style={{
                                    display: imageLoadStatus[heroImages[currentSlide].src] === false ? 'none' : 'block',
                                    objectPosition: 'center 40%'
                                }}
                                onLoad={() => handleImageLoad(heroImages[currentSlide].src)}
                                onError={() => handleImageError(heroImages[currentSlide].src)}
                            />



                            {/* Image Failed to Load Indicator */}
                            {imageLoadStatus[heroImages[currentSlide].src] === false && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center text-white/80 px-4">
                                        <div className="text-4xl sm:text-6xl mb-4">🤸‍♀️</div>
                                        <p className="text-base sm:text-lg font-medium">Gymnastics Excellence</p>
                                        <p className="text-sm opacity-75">Professional Training</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Enhanced Overlay for Better Text Readability */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60"></div>
                        <div className="absolute inset-0 backdrop-blur-[0.5px]"></div>
                    </motion.div>
                </AnimatePresence>

                {/* Mobile-Optimized Slide Indicators */}
                <motion.div
                    className="absolute bottom-16 sm:bottom-24 left-1/2 transform -translate-x-1/2 -translate-x-8 sm:-translate-x-12 z-20 flex space-x-2 sm:space-x-3"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                >
                    {heroImages.map((_, index) => (
                        <motion.button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`relative overflow-hidden rounded-full transition-all duration-500 ${index === currentSlide
                                ? 'w-8 h-3 sm:w-12 sm:h-4 bg-white shadow-lg'
                                : 'w-3 h-3 sm:w-4 sm:h-4 bg-white/40 hover:bg-white/70 hover:scale-110'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                            whileHover={{ scale: index === currentSlide ? 1.05 : 1.2 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {index === currentSlide && (
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                                    layoutId="activeIndicator"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </motion.button>
                    ))}
                </motion.div>
            </div>

            {/* Navigation Arrows - Outside background div for proper z-index */}
            <button
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    goToPrevious()
                }}
                className="absolute left-4 sm:left-8 top-[55%] -translate-y-1/2 z-50 w-12 h-12 sm:w-16 sm:h-16 bg-white/20 hover:bg-white/30 backdrop-blur-md border-2 border-white/40 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 pointer-events-auto"
                aria-label="Previous image"
                type="button"
            >
                <FiChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 pointer-events-none" />
            </button>

            <button
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    goToNext()
                }}
                className="absolute right-4 sm:right-8 top-[55%] -translate-y-1/2 z-50 w-12 h-12 sm:w-16 sm:h-16 bg-white/20 hover:bg-white/30 backdrop-blur-md border-2 border-white/40 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 pointer-events-auto"
                aria-label="Next image"
                type="button"
            >
                <FiChevronRight className="w-6 h-6 sm:w-8 sm:h-8 pointer-events-none" />
            </button>

            {/* Mobile-First Content */}
            <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8 text-center text-white pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="max-w-5xl mx-auto"
                >
                    {/* Mobile-Optimized Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
                        className="inline-flex items-center px-3 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-xl border border-white/30 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold mb-6 sm:mb-8 shadow-2xl"
                    >
                        <motion.span
                            className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mr-2 sm:mr-3"
                            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        ></motion.span>
                        <span className="hidden sm:inline">🏆 Building Champions Through Excellence</span>
                        <span className="sm:hidden">🏆 Professional Training</span>
                    </motion.div>

                    {/* Main Heading with Typewriter Effect */}
                    <motion.h1
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-black mb-6 sm:mb-8 leading-tight px-2"
                    >
                        <motion.span
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7, duration: 0.8 }}
                            className="block mb-2"
                        >
                            Build{' '}
                            <span className="relative inline-block">
                                <span className="text-transparent bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 bg-clip-text animate-gradient">
                                    {displayText}
                                </span>
                                <motion.span
                                    className="inline-block w-1 h-12 sm:h-16 md:h-20 lg:h-24 bg-gradient-to-b from-yellow-300 to-pink-500 ml-1"
                                    animate={{ opacity: [1, 0, 1] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                />
                            </span>
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9, duration: 0.8 }}
                            className="block text-white drop-shadow-2xl"
                        >
                            Through Gymnastics
                        </motion.span>
                    </motion.h1>

                    {/* Mobile-Optimized Subtitle - Reduced Size */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1, duration: 0.8 }}
                        className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-100 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed font-light px-4"
                    >
                        Professional gymnastics training for all ages and skill levels in Hong Kong
                        <br className="hidden sm:block" />
                        <span className="text-xs sm:text-sm md:text-base text-gray-300 mt-2 block">Professional training • Safe environment • Individual attention</span>
                    </motion.p>

                    {/* Mobile-First CTA Buttons - Optimized Size */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3, duration: 0.8 }}
                        className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12 sm:mb-16 px-4"
                    >
                        <motion.div
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link
                                href="/book-trial"
                                className="group relative overflow-hidden bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-400 hover:via-pink-400 hover:to-purple-500 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all duration-500 flex items-center space-x-2 sm:space-x-3 shadow-2xl hover:shadow-orange-500/25 w-full sm:w-auto justify-center pointer-events-auto"
                            >
                                <span className="relative z-10">🚀 Book Free Trial</span>
                                <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300 relative z-10" />
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </Link>
                        </motion.div>

                        <motion.button
                            className="group flex items-center space-x-3 text-white hover:text-yellow-300 transition-all duration-500 pointer-events-auto"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <motion.div
                                className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-xl border border-white/30 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-500 shadow-xl"
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.8 }}
                            >
                                <FiPlay className="w-5 h-5 sm:w-6 sm:h-6 ml-1 group-hover:scale-110 transition-transform duration-300" />
                            </motion.div>
                            <div className="text-left">
                                <div className="font-bold text-sm sm:text-base">Watch Programs</div>
                                <div className="text-xs sm:text-sm text-gray-300">See our training in action</div>
                            </div>
                        </motion.button>
                    </motion.div>

                    {/* Animated Statistics Counter - Compact Size */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, duration: 0.8 }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 max-w-xl mx-auto px-4"
                    >
                        {[
                            { number: 500, suffix: "+", label: "Happy Students", icon: "👨‍👩‍👧‍👦", color: "from-blue-400 to-cyan-400" },
                            { number: 10, suffix: "+", label: "Years Experience", icon: "🏆", color: "from-yellow-400 to-orange-400" },
                            { number: 2, suffix: "", label: "Premium Locations", icon: "📍", color: "from-green-400 to-emerald-400" }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.7 + index * 0.2, duration: 0.8, type: "spring" }}
                                className="text-center group"
                            >
                                <motion.div
                                    className="relative bg-white/15 backdrop-blur-xl border border-white/30 rounded-lg sm:rounded-xl p-2 sm:p-3 hover:bg-white/25 transition-all duration-500 shadow-2xl hover:shadow-white/20"
                                    whileHover={{ scale: 1.05, y: -8 }}
                                >
                                    <motion.div
                                        className="text-lg sm:text-xl mb-0.5"
                                        animate={{
                                            rotate: [0, 10, -10, 0],
                                            scale: [1, 1.1, 1]
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            delay: index * 0.5
                                        }}
                                    >
                                        {stat.icon}
                                    </motion.div>
                                    <motion.div
                                        className={`text-xl sm:text-2xl md:text-3xl font-black mb-0.5 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent drop-shadow-lg`}
                                    >
                                        <AnimatedCounter end={stat.number} duration={2.5} suffix={stat.suffix} />
                                    </motion.div>
                                    <div className="text-[9px] sm:text-xs font-bold text-white uppercase tracking-wider drop-shadow-md">{stat.label}</div>

                                    {/* Animated glow effect */}
                                    <motion.div
                                        className={`absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}
                                    />
                                </motion.div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>

            {/* Mobile-Optimized Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-10"
            >
                <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/30 rounded-full flex justify-center">
                    <div className="w-1 h-2 sm:h-3 bg-white rounded-full mt-2 animate-bounce-gentle"></div>
                </div>
            </motion.div>
        </section>
    )
}

export default Hero
