'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FiTarget, FiHeart, FiAward, FiUsers, FiStar, FiChevronLeft, FiChevronRight, FiCheck } from 'react-icons/fi'

// Animated Counter Component (same as Hero)
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

const About = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [flippedCard, setFlippedCard] = useState<number | null>(null)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
    const [confetti, setConfetti] = useState<Array<{ x: number; y: number; id: number; color: string }>>([])

    // Image carousel - Using images from about folder
    const images = [
        '/images/about/img3.jpg',
        '/images/about/img5.jpg',
        '/images/about/img6.jpg',
        '/images/about/img7.jpg'
    ]

    // Auto-rotate images
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [images.length])

    const values = [
        {
            icon: FiTarget,
            title: 'Excellence',
            description: 'We strive for the highest standards in coaching and training methodologies.',
            details: 'Our coaches undergo continuous training and certification to ensure world-class instruction quality. We maintain state-of-the-art equipment and follow international safety standards.',
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
            cardBg: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10',
            hoverBg: 'group-hover:from-blue-600 group-hover:to-cyan-600',
            borderColor: 'border-blue-200',
            iconBg: 'bg-blue-500',
            slideFrom: 'left'
        },
        {
            icon: FiHeart,
            title: 'Passion',
            description: 'Our love for gymnastics drives us to inspire and nurture every student.',
            details: 'We create an environment where students develop a genuine love for movement and sport. Every coach brings enthusiasm and dedication to each session.',
            color: 'from-red-500 to-pink-500',
            bgColor: 'bg-gradient-to-br from-red-50 to-pink-50',
            cardBg: 'bg-gradient-to-br from-red-500/10 to-pink-500/10',
            hoverBg: 'group-hover:from-red-600 group-hover:to-pink-600',
            borderColor: 'border-red-200',
            iconBg: 'bg-red-500',
            slideFrom: 'top'
        },
        {
            icon: FiAward,
            title: 'Achievement',
            description: 'Celebrating every milestone and building confidence through success.',
            details: 'From first cartwheel to competitive medals, we celebrate every step of the journey. Our structured programs ensure consistent progress and achievement.',
            color: 'from-yellow-500 to-orange-500',
            bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
            cardBg: 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10',
            hoverBg: 'group-hover:from-yellow-600 group-hover:to-orange-600',
            borderColor: 'border-yellow-200',
            iconBg: 'bg-yellow-500',
            slideFrom: 'top'
        },
        {
            icon: FiUsers,
            title: 'Community',
            description: 'Creating a supportive environment where everyone feels welcome and valued.',
            details: 'Our gym is more than a training facility - it\'s a family where lifelong friendships are formed. We foster a culture of support and encouragement.',
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
            cardBg: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10',
            hoverBg: 'group-hover:from-green-600 group-hover:to-emerald-600',
            borderColor: 'border-green-200',
            iconBg: 'bg-green-500',
            slideFrom: 'right'
        }
    ]

    // Certifications/Awards
    const certifications = [
        { icon: '🏆', label: 'ISO Certified', color: 'from-yellow-400 to-orange-500' },
        { icon: '⭐', label: 'Award Winning', color: 'from-blue-400 to-cyan-500' },
        { icon: '✓', label: 'Verified Coaches', color: 'from-green-400 to-emerald-500' }
    ]

    // Timeline achievements
    const timeline = [
        { year: '2010', event: 'Founded in Hong Kong' },
        { year: '2015', event: '500+ Students Milestone' },
        { year: '2020', event: 'Expanded to 2 Locations' },
        { year: '2024', event: '1000+ Students Trained' }
    ]

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setMousePosition({
            x: (e.clientX - rect.left - rect.width / 2) / 20,
            y: (e.clientY - rect.top - rect.height / 2) / 20
        })
    }

    // Ripple effect on click
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

    // Confetti on hover
    const createConfetti = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const colors = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6']

        for (let i = 0; i < 5; i++) {
            const id = Date.now() + i
            const x = Math.random() * rect.width
            const y = Math.random() * rect.height
            const color = colors[Math.floor(Math.random() * colors.length)]

            setConfetti(prev => [...prev, { x, y, id, color }])
            setTimeout(() => {
                setConfetti(prev => prev.filter(c => c.id !== id))
            }, 1000)
        }
    }

    // Get slide direction
    const getSlideDirection = (direction: string) => {
        switch (direction) {
            case 'left': return { x: -100, y: 0 }
            case 'right': return { x: 100, y: 0 }
            case 'top': return { x: 0, y: -100 }
            default: return { x: 0, y: 0 }
        }
    }

    return (
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 overflow-hidden w-full max-w-full">
            {/* Enhanced Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none w-full max-w-full">
                <motion.div
                    animate={{
                        rotate: 360,
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        rotate: -360,
                        scale: [1, 1.4, 1],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-0 left-0 w-64 h-64 sm:w-[500px] sm:h-[500px] bg-gradient-to-r from-orange-200/20 to-pink-200/20 rounded-full blur-3xl"
                />

                {/* Floating particles */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-gradient-to-r from-blue-400/40 to-purple-400/40 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        suppressHydrationWarning
                        animate={{
                            y: [0, -100, 0],
                            opacity: [0.2, 1, 0.2],
                            scale: [0.5, 2, 0.5],
                        }}
                        transition={{
                            duration: 6 + Math.random() * 4,
                            repeat: Infinity,
                            delay: Math.random() * 3,
                        }}
                    />
                ))}
            </div>

            <div className="container-max relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Content Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -80 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
                                viewport={{ once: true }}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-200/30 rounded-2xl shadow-lg"
                            >
                                <FiStar className="w-5 h-5 text-blue-600 mr-2" />
                                <span className="text-blue-600 font-bold text-sm uppercase tracking-wider">
                                    🏆 Who We Are
                                </span>
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 1 }}
                                viewport={{ once: true }}
                                className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-gray-900 leading-tight pb-2"
                                style={{ lineHeight: '1.3' }}
                            >
                                <motion.span className="block pb-1">
                                    Building Champions
                                </motion.span>
                                <motion.span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent pb-2" style={{ lineHeight: '1.3' }}>
                                    Through Excellence
                                </motion.span>
                            </motion.h2>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            viewport={{ once: true }}
                            className="space-y-4 text-gray-600 leading-relaxed text-base sm:text-lg"
                        >
                            <p>
                                ProActive Sports has been Hong Kong's premier gymnastics training center for over a decade.
                                We believe that gymnastics is more than just physical training – it's about building character,
                                confidence, and life skills that extend far beyond the gym.
                            </p>
                            <p>
                                Our experienced team of certified coaches provides personalized instruction for students of all
                                ages and abilities.
                            </p>
                        </motion.div>

                        {/* Animated Stats with Counter */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.8 }}
                            viewport={{ once: true }}
                            className="grid grid-cols-2 gap-4 sm:gap-6"
                        >
                            {[
                                { number: 10, suffix: "+", label: "Years of Excellence", color: "from-blue-500 to-cyan-500" },
                                { number: 1000, suffix: "+", label: "Students Trained", color: "from-purple-500 to-pink-500" }
                            ].map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.9 + index * 0.2, duration: 0.8, type: "spring" }}
                                    viewport={{ once: true }}
                                    className="group"
                                    whileHover={{ scale: 1.05, y: -5 }}
                                >
                                    <div className="relative bg-white/90 backdrop-blur-xl border-2 border-gray-200/50 rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
                                        {/* Pulsing glow effect */}
                                        <motion.div
                                            className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0, 0.1, 0]
                                            }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />

                                        <motion.div
                                            className={`text-3xl sm:text-4xl font-black mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                                        >
                                            <AnimatedCounter end={stat.number} duration={2.5} suffix={stat.suffix} />
                                        </motion.div>
                                        <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                            {stat.label}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Floating Certification Badges */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.1, duration: 0.8 }}
                            viewport={{ once: true }}
                            className="flex flex-wrap gap-3"
                        >
                            {certifications.map((cert, index) => (
                                <motion.div
                                    key={cert.label}
                                    initial={{ opacity: 0, scale: 0 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 1.3 + index * 0.1, type: "spring" }}
                                    viewport={{ once: true }}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r ${cert.color} rounded-full shadow-lg text-white text-sm font-semibold`}
                                >
                                    <span className="text-lg">{cert.icon}</span>
                                    <span>{cert.label}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Enhanced Image Section with 3D Tilt & Carousel */}
                    <motion.div
                        initial={{ opacity: 0, x: 80 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <motion.div
                            className="relative rounded-3xl overflow-hidden shadow-2xl max-w-md mx-auto"
                            onMouseMove={handleMouseMove}
                            onMouseLeave={() => setMousePosition({ x: 0, y: 0 })}
                            style={{
                                transform: `perspective(1000px) rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg)`,
                                transition: 'transform 0.1s ease-out'
                            }}
                        >
                            {/* Image Carousel */}
                            <div className="aspect-[3/4] relative overflow-hidden">
                                {images.map((img, index) => (
                                    <motion.img
                                        key={img}
                                        src={img}
                                        alt={`Gymnastics Training ${index + 1}`}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: index === currentImageIndex ? 1 : 0 }}
                                        transition={{ duration: 0.5 }}
                                    />
                                ))}

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                                {/* Carousel Controls */}
                                <button id="sections-about-btn"
                                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all z-10"
                                >
                                    <FiChevronLeft className="w-5 h-5" />
                                </button>
                                <button id="sections-about-btn-2"
                                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all z-10"
                                >
                                    <FiChevronRight className="w-5 h-5" />
                                </button>

                                {/* Image Indicators */}
                                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                                    {images.map((_, index) => (
                                        <button id="sections-about-btn-3"
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                                                }`}
                                        />
                                    ))}
                                </div>

                                {/* Professional Training Badge - Glass Morphism */}
                                <div className="absolute bottom-6 left-6 right-6">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/20"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <motion.div
                                                className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg"
                                                animate={{ rotate: [0, 360] }}
                                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                            >
                                                <FiAward className="w-6 h-6 text-white" />
                                            </motion.div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm">Professional Training</div>
                                                <div className="text-xs text-gray-600">Certified Coaches</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Decorative floating element */}
                            <motion.div
                                animate={{
                                    y: [0, -20, 0],
                                    rotate: [0, 180, 360],
                                }}
                                transition={{
                                    duration: 8,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-full backdrop-blur-sm border border-white/30 shadow-xl"
                            />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Interactive Timeline */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    viewport={{ once: true }}
                    className="mt-20"
                >
                    <div className="text-center mb-12">
                        <motion.h3
                            className="text-3xl sm:text-4xl font-heading font-black text-gray-900 mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            Our Journey
                        </motion.h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {timeline.map((item, index) => (
                            <motion.div
                                key={item.year}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all"
                            >
                                <div className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                    {item.year}
                                </div>
                                <div className="text-sm text-gray-600 font-medium">{item.event}</div>
                                <motion.div
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <FiCheck className="w-3 h-3 text-white" />
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Enhanced Values Section with Expandable Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    viewport={{ once: true }}
                    className="mt-24"
                >
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            viewport={{ once: true }}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-200/30 rounded-2xl mb-6"
                        >
                            <FiHeart className="w-5 h-5 text-purple-600 mr-2" />
                            <span className="text-purple-600 font-bold text-sm uppercase tracking-wider">
                                Our Values
                            </span>
                        </motion.div>

                        <motion.h3
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            viewport={{ once: true }}
                            className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-gray-900 mb-4 pb-2"
                            style={{ lineHeight: '1.3' }}
                        >
                            What Drives Us
                            <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent pb-2" style={{ lineHeight: '1.3' }}>
                                Every Single Day
                            </span>
                        </motion.h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, index) => {
                            const slideDir = getSlideDirection(value.slideFrom)
                            return (
                                <motion.div
                                    key={value.title}
                                    initial={{ opacity: 0, ...slideDir, scale: 0.8 }}
                                    whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                                    transition={{
                                        delay: index * 0.2,
                                        type: "spring",
                                        stiffness: 100,
                                        damping: 15
                                    }}
                                    viewport={{ once: true }}
                                    className="group"
                                    style={{ perspective: '1000px', minHeight: '320px' }}
                                >
                                    <motion.div
                                        className="relative w-full min-h-[320px]"
                                        style={{ transformStyle: 'preserve-3d' }}
                                        animate={{ rotateY: flippedCard === index ? 180 : 0 }}
                                        transition={{ duration: 0.6 }}
                                        onMouseEnter={createConfetti}
                                    >
                                        {/* Front Side */}
                                        <motion.div
                                            className={`absolute inset-0 ${value.cardBg} backdrop-blur-xl border-2 ${value.borderColor} rounded-3xl p-5 shadow-2xl cursor-pointer min-h-[320px]`}
                                            style={{ backfaceVisibility: 'hidden' }}
                                            onClick={(e) => createRipple(e, index)}
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            {/* Ripple Effects */}
                                            {ripples.filter((_, i) => i === index).map((ripple) => (
                                                <motion.div
                                                    key={ripple.id}
                                                    className="absolute rounded-full bg-white/30"
                                                    style={{
                                                        left: ripple.x,
                                                        top: ripple.y,
                                                        width: 0,
                                                        height: 0,
                                                    }}
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

                                            {/* Confetti */}
                                            {confetti.map((conf) => (
                                                <motion.div
                                                    key={conf.id}
                                                    className="absolute w-2 h-2 rounded-full"
                                                    style={{
                                                        left: conf.x,
                                                        top: conf.y,
                                                        backgroundColor: conf.color,
                                                    }}
                                                    animate={{
                                                        y: [0, -100],
                                                        x: [0, (Math.random() - 0.5) * 100],
                                                        opacity: [1, 0],
                                                        scale: [1, 0],
                                                        rotate: [0, 360],
                                                    }}
                                                    transition={{ duration: 1 }}
                                                />
                                            ))}

                                            {/* Animated gradient background */}
                                            <motion.div
                                                className={`absolute inset-0 bg-gradient-to-r ${value.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}
                                                animate={{
                                                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                                                }}
                                                transition={{ duration: 5, repeat: Infinity }}
                                            />

                                            {/* Icon with enhanced animation */}
                                            <motion.div
                                                className="relative w-16 h-16 mx-auto mb-3"
                                                whileHover={{
                                                    scale: 1.2,
                                                    rotate: [0, -10, 10, -10, 0],
                                                }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                <motion.div
                                                    className={`absolute inset-0 bg-gradient-to-r ${value.color} rounded-2xl opacity-20 blur-md`}
                                                    animate={{
                                                        scale: [1, 1.2, 1],
                                                        rotate: 360
                                                    }}
                                                    transition={{
                                                        scale: { duration: 2, repeat: Infinity },
                                                        rotate: { duration: 8, repeat: Infinity, ease: "linear" }
                                                    }}
                                                />
                                                <motion.div
                                                    className={`relative w-full h-full ${value.iconBg} rounded-2xl flex items-center justify-center shadow-xl`}
                                                    whileHover={{
                                                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                                                    }}
                                                >
                                                    <value.icon className="w-8 h-8 text-white" />
                                                </motion.div>
                                            </motion.div>

                                            <motion.h4
                                                className="font-heading font-bold text-lg text-gray-900 mb-2 text-center"
                                                animate={{
                                                    backgroundPosition: ['0%', '100%', '0%'],
                                                }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                            >
                                                {value.title}
                                            </motion.h4>
                                            <p className="text-gray-700 text-xs text-center leading-relaxed font-medium px-1">
                                                {value.description}
                                            </p>

                                            {/* Click to flip indicator */}
                                            <motion.div
                                                className="mt-3 text-center text-[10px] text-gray-500 font-semibold"
                                                animate={{ opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                Click to flip →
                                            </motion.div>

                                            {/* Floating particles */}
                                            {[...Array(3)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    className={`absolute w-1.5 h-1.5 rounded-full`}
                                                    style={{
                                                        left: `${30 + i * 20}%`,
                                                        bottom: '20%',
                                                        background: `linear-gradient(to right, ${value.color.split(' ')[1]}, ${value.color.split(' ')[3]})`,
                                                    }}
                                                    animate={{
                                                        y: [0, -50, 0],
                                                        opacity: [0, 1, 0],
                                                        scale: [0, 2, 0],
                                                    }}
                                                    transition={{
                                                        duration: 2 + Math.random(),
                                                        repeat: Infinity,
                                                        delay: i * 0.4,
                                                    }}
                                                />
                                            ))}
                                        </motion.div>

                                        {/* Back Side */}
                                        <motion.div
                                            className={`absolute inset-0 ${value.bgColor} backdrop-blur-xl border-2 ${value.borderColor} rounded-3xl p-5 shadow-2xl cursor-pointer min-h-[320px]`}
                                            style={{
                                                backfaceVisibility: 'hidden',
                                                transform: 'rotateY(180deg)'
                                            }}
                                            onClick={(e) => createRipple(e, index)}
                                        >
                                            <div className="h-full flex flex-col justify-center">
                                                <motion.div
                                                    className={`w-14 h-14 ${value.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg`}
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                >
                                                    <value.icon className="w-7 h-7 text-white" />
                                                </motion.div>

                                                <h4 className="font-heading font-bold text-base text-gray-900 mb-2 text-center">
                                                    {value.title}
                                                </h4>

                                                <p className="text-gray-700 text-xs text-center leading-relaxed font-medium mb-3 px-2">
                                                    {value.details}
                                                </p>

                                                <motion.div
                                                    className="text-center text-[10px] text-gray-500 font-semibold"
                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                >
                                                    ← Click to flip back
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            )
                        })}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default About
