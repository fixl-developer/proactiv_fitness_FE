'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import Link from 'next/link'
import { FiPlay, FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { CMSService, type HeroSlide as CMSHeroSlide, type SiteStat } from '@/services/cmsService'

// Typewriter hook — types `target` one char at a time. Restarts whenever target changes.
// `speedMs` is the per-character delay; the blinking caret is rendered by the caller.
function useTypewriter(target: string, speedMs = 55): { text: string; done: boolean } {
    const [text, setText] = useState('')
    const [done, setDone] = useState(false)

    useEffect(() => {
        setText('')
        setDone(false)
        if (!target) {
            setDone(true)
            return
        }
        let i = 0
        const id = setInterval(() => {
            i += 1
            setText(target.slice(0, i))
            if (i >= target.length) {
                clearInterval(id)
                setDone(true)
            }
        }, speedMs)
        return () => clearInterval(id)
    }, [target, speedMs])

    return { text, done }
}

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

// Unified slide shape used by the carousel — populated from CMS, with static fallback.
interface DisplaySlide {
    title: string
    subtitle: string
    image: string
    fallbackGradient: string
    ctaText: string
    ctaLink: string
}

const DEFAULT_GRADIENT = 'bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800'

// Static fallback data — used only when CMS has no slides or API is unreachable.
const staticHeroSlides: DisplaySlide[] = [
    {
        title: 'Build Strength Through Gymnastics',
        subtitle: 'Professional gymnastics training for all ages and skill levels in Hong Kong',
        image: '/images/hero/img1.png',
        fallbackGradient: 'bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800',
        ctaText: 'Book Free Trial',
        ctaLink: '/book-trial',
    },
    {
        title: 'Build Confidence Through Gymnastics',
        subtitle: 'Children excel with expert coaching and a safe, welcoming environment',
        image: '/images/hero/img2.jpg',
        fallbackGradient: 'bg-gradient-to-br from-green-600 via-blue-600 to-purple-800',
        ctaText: 'Book Free Trial',
        ctaLink: '/book-trial',
    },
    {
        title: 'Build Champions Through Gymnastics',
        subtitle: 'Expert coaching and individual attention from certified professionals',
        image: '/images/hero/img3.jpg',
        fallbackGradient: 'bg-gradient-to-br from-purple-600 via-pink-600 to-red-800',
        ctaText: 'Book Free Trial',
        ctaLink: '/book-trial',
    },
]

const staticStats: SiteStat[] = [
    { id: '1', label: 'Happy Students', value: 500, suffix: '+', icon: '👨‍👩‍👧‍👦', color: 'from-blue-400 to-cyan-400' },
    { id: '2', label: 'Years Experience', value: 10, suffix: '+', icon: '🏆', color: 'from-yellow-400 to-orange-400' },
    { id: '3', label: 'Premium Locations', value: 2, suffix: '', icon: '📍', color: 'from-green-400 to-emerald-400' },
]

// Map a CMS slide -> the local DisplaySlide shape with sensible defaults.
function adaptCmsSlide(s: CMSHeroSlide): DisplaySlide {
    return {
        title: s.title || '',
        subtitle: s.subtitle || '',
        image: s.image || '',
        fallbackGradient: s.fallbackGradient || DEFAULT_GRADIENT,
        ctaText: s.ctaText || 'Book Free Trial',
        ctaLink: s.ctaLink || '/book-trial',
    }
}

const Hero = () => {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [imageLoadStatus, setImageLoadStatus] = useState<Record<string, boolean>>({})

    const [heroSlides, setHeroSlides] = useState<DisplaySlide[]>(staticHeroSlides)
    const [stats, setStats] = useState<SiteStat[]>(staticStats)

    // Fetch CMS hero slides + stats. Retries with backoff if the backend is briefly
    // unavailable (e.g. during a seed/restart) so the carousel doesn't get stuck on the
    // 3-slide static fallback after a transient failure.
    useEffect(() => {
        let cancelled = false
        let timeoutId: ReturnType<typeof setTimeout> | null = null

        const load = async (attempt = 0): Promise<void> => {
            try {
                const [slidesRes, statsRes] = await Promise.allSettled([
                    CMSService.getHeroSlides(),
                    CMSService.getSiteStats(),
                ])
                if (cancelled) return

                let slidesLoaded = false
                let statsLoaded = false

                if (slidesRes.status === 'fulfilled' && Array.isArray(slidesRes.value) && slidesRes.value.length > 0) {
                    const adapted = slidesRes.value
                        .slice()
                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                        .map(adaptCmsSlide)
                        .filter(s => s.title || s.image)
                    if (adapted.length > 0) {
                        setHeroSlides(adapted)
                        setCurrentSlide(0)
                        slidesLoaded = true
                    }
                }

                if (statsRes.status === 'fulfilled' && Array.isArray(statsRes.value) && statsRes.value.length > 0) {
                    setStats(statsRes.value)
                    statsLoaded = true
                }

                // If either call failed/returned empty and we still have attempts left, retry.
                if ((!slidesLoaded || !statsLoaded) && attempt < 3) {
                    timeoutId = setTimeout(() => { if (!cancelled) load(attempt + 1) }, 1500 * (attempt + 1))
                }
            } catch (err) {
                console.warn('Hero CMS fetch failed:', err)
                if (attempt < 3) {
                    timeoutId = setTimeout(() => { if (!cancelled) load(attempt + 1) }, 1500 * (attempt + 1))
                }
            }
        }
        load()
        return () => {
            cancelled = true
            if (timeoutId) clearTimeout(timeoutId)
        }
    }, [])

    // Auto-slide functionality
    useEffect(() => {
        if (heroSlides.length <= 1) return
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
        }, 9000)
        return () => clearInterval(timer)
    }, [heroSlides.length])

    const handleImageLoad = (src: string) => {
        setImageLoadStatus(prev => ({ ...prev, [src]: true }))
    }

    const handleImageError = (src: string) => {
        setImageLoadStatus(prev => ({ ...prev, [src]: false }))
    }

    const goToSlide = (index: number) => {
        setCurrentSlide(index)
    }

    const goToPrevious = () => {
        setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
    }

    const goToNext = () => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }

    const slide = heroSlides[currentSlide] || staticHeroSlides[0]
    const isExternalLink = /^https?:\/\//.test(slide.ctaLink)

    // Per-slide typewriter: restarts whenever the active slide's title changes
    const typed = useTypewriter(slide.title || 'Build Champions Through Gymnastics', 55)

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
                        <div className={`w-full h-full ${slide.fallbackGradient} opacity-95`}>
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
                            {slide.image && (
                                <img
                                    src={slide.image}
                                    alt={slide.title || 'Hero slide'}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    style={{
                                        display: imageLoadStatus[slide.image] === false ? 'none' : 'block',
                                        objectPosition: 'center 40%'
                                    }}
                                    onLoad={() => handleImageLoad(slide.image)}
                                    onError={() => handleImageError(slide.image)}
                                />
                            )}

                            {/* Image Failed to Load Indicator */}
                            {slide.image && imageLoadStatus[slide.image] === false && (
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

            </div>

            {/* Slide Indicator Dots — placed at section level (outside bg div) so z-30 actually wins
                against the content's stacking context. Sits below the stat cards near the bottom edge. */}
            {heroSlides.length > 1 && (
                <motion.div
                    className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 -ml-12 sm:-ml-20 z-30 flex space-x-2 sm:space-x-3 pointer-events-auto"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                >
                    {heroSlides.map((_, index) => (
                        <motion.button
                            id={`hero-slide-dot-${index}-btn`}
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
            )}

            {/* Navigation Arrows - Outside background div for proper z-index */}
            {heroSlides.length > 1 && (
                <>
                    <button id="sections-hero-btn"
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

                    <button id="sections-hero-btn-2"
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
                </>
            )}

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

                    {/* Per-slide Title with typewriter effect (CMS-driven, restarts on slide change) */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-black mb-6 sm:mb-8 leading-tight px-2 min-h-[3.5em] sm:min-h-[3em] flex items-center justify-center"
                    >
                        <span className="block text-white drop-shadow-2xl bg-gradient-to-r from-yellow-200 via-white to-pink-200 bg-clip-text text-transparent">
                            {typed.text}
                            <motion.span
                                className="inline-block w-1 h-8 sm:h-12 md:h-16 lg:h-20 align-middle ml-1 bg-gradient-to-b from-yellow-300 to-pink-500"
                                animate={{ opacity: typed.done ? [1, 0, 1] : 1 }}
                                transition={typed.done ? { duration: 0.8, repeat: Infinity } : { duration: 0 }}
                            />
                        </span>
                    </motion.h1>

                    {/* Per-slide Subtitle (CMS-driven) */}
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={`subtitle-${currentSlide}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-100 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed font-light px-4"
                        >
                            {slide.subtitle || 'Professional gymnastics training for all ages and skill levels'}
                        </motion.p>
                    </AnimatePresence>

                    {/* Per-slide CTA (CMS-driven) */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3, duration: 0.8 }}
                        className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12 sm:mb-16 px-4"
                    >
                        <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
                            {isExternalLink ? (
                                <a
                                    id="sections-hero-cta-external"
                                    href={slide.ctaLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative overflow-hidden bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-400 hover:via-pink-400 hover:to-purple-500 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all duration-500 flex items-center space-x-2 sm:space-x-3 shadow-2xl hover:shadow-orange-500/25 w-full sm:w-auto justify-center pointer-events-auto"
                                >
                                    <span className="relative z-10">🚀 {slide.ctaText}</span>
                                    <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300 relative z-10" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </a>
                            ) : (
                                <Link
                                    id="sections-hero-cta-internal"
                                    href={slide.ctaLink || '/book-trial'}
                                    className="group relative overflow-hidden bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-400 hover:via-pink-400 hover:to-purple-500 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all duration-500 flex items-center space-x-2 sm:space-x-3 shadow-2xl hover:shadow-orange-500/25 w-full sm:w-auto justify-center pointer-events-auto"
                                >
                                    <span className="relative z-10">🚀 {slide.ctaText}</span>
                                    <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300 relative z-10" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </Link>
                            )}
                        </motion.div>

                        <motion.button
                            id="hero-watch-programs-btn"
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

                    {/* Animated Statistics Counter (CMS-driven, with static fallback) */}
                    {stats.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.5, duration: 0.8 }}
                            className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-3xl mx-auto px-4"
                        >
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={stat.id || index}
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
                                            className={`text-xl sm:text-2xl md:text-3xl font-black mb-0.5 bg-gradient-to-r ${stat.color || 'from-yellow-400 to-orange-400'} bg-clip-text text-transparent drop-shadow-lg`}
                                        >
                                            <AnimatedCounter end={stat.value} duration={2.5} suffix={stat.suffix || ''} />
                                        </motion.div>
                                        <div className="text-[9px] sm:text-xs font-bold text-white uppercase tracking-wider drop-shadow-md">{stat.label}</div>

                                        <motion.div
                                            className={`absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r ${stat.color || 'from-yellow-400 to-orange-400'} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}
                                        />
                                    </motion.div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </motion.div>
            </div>

            {/* Scroll indicator — pushed up so it doesn't collide with the slide dots at bottom-3/4. */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute bottom-12 sm:bottom-14 right-4 sm:right-8 z-30"
            >
                <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/30 rounded-full flex justify-center">
                    <div className="w-1 h-2 sm:h-3 bg-white rounded-full mt-2 animate-bounce-gentle"></div>
                </div>
            </motion.div>
        </section>
    )
}

export default Hero
