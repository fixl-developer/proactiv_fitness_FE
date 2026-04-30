'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiMapPin, FiClock, FiPhone, FiMail, FiTruck, FiWifi, FiShield, FiNavigation, FiAlertCircle } from 'react-icons/fi'
import TeamPreview from '@/components/sections/TeamPreview'
import Services from '@/components/sections/Services'
import { LocationService } from '@/services/businessConfigService'

interface PublicLocation {
    id: string
    name: string
    slug: string
    address: string
    city: string
    state?: string
    country: string
    postalCode?: string
    phone?: string
    email?: string
    capacity?: number
    facilities?: string[]
    amenities?: string[]
    images?: string[]
    coverImage?: string
    operatingHours?: Record<string, { isOpen?: boolean; openTime?: string; closeTime?: string; open?: string; close?: string; closed?: boolean }>
}

// Deterministic theme per slug so every dynamic location gets a stable colour
// scheme but pages don't all look identical.
const themes = [
    {
        gradientFrom: 'from-cyan-600',
        gradientVia: 'via-blue-700',
        gradientTo: 'to-indigo-900',
        animatedGradients: [
            'linear-gradient(135deg, #0891b2 0%, #0369a1 50%, #312e81 100%)',
            'linear-gradient(135deg, #0369a1 0%, #312e81 50%, #0891b2 100%)',
            'linear-gradient(135deg, #312e81 0%, #0891b2 50%, #0369a1 100%)',
            'linear-gradient(135deg, #0891b2 0%, #0369a1 50%, #312e81 100%)',
        ],
        meshA: 'rgba(6, 182, 212, 0.4)',
        meshB: 'rgba(99, 102, 241, 0.4)',
        meshC: 'rgba(59, 130, 246, 0.4)',
        cardGradient: 'from-blue-500 to-indigo-600',
        accentBg: 'bg-blue-100',
        accentText: 'text-blue-600',
        sectionBg: 'from-white via-blue-50/30 to-indigo-50/20',
        scheduleBg: 'from-gray-50 via-white to-blue-50/20',
        primaryButton: 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
        ctaButton: 'from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700',
        contactBg: 'bg-primary-600',
    },
    {
        gradientFrom: 'from-emerald-600',
        gradientVia: 'via-teal-700',
        gradientTo: 'to-cyan-900',
        animatedGradients: [
            'linear-gradient(135deg, #059669 0%, #0f766e 50%, #164e63 100%)',
            'linear-gradient(135deg, #0f766e 0%, #164e63 50%, #059669 100%)',
            'linear-gradient(135deg, #164e63 0%, #059669 50%, #0f766e 100%)',
            'linear-gradient(135deg, #059669 0%, #0f766e 50%, #164e63 100%)',
        ],
        meshA: 'rgba(16, 185, 129, 0.4)',
        meshB: 'rgba(45, 212, 191, 0.4)',
        meshC: 'rgba(34, 211, 238, 0.4)',
        cardGradient: 'from-emerald-500 to-teal-600',
        accentBg: 'bg-emerald-100',
        accentText: 'text-emerald-600',
        sectionBg: 'from-white via-emerald-50/30 to-teal-50/20',
        scheduleBg: 'from-gray-50 via-white to-emerald-50/20',
        primaryButton: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700',
        ctaButton: 'from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600',
        contactBg: 'bg-emerald-700',
    },
    {
        gradientFrom: 'from-purple-600',
        gradientVia: 'via-pink-700',
        gradientTo: 'to-rose-900',
        animatedGradients: [
            'linear-gradient(135deg, #9333ea 0%, #be185d 50%, #881337 100%)',
            'linear-gradient(135deg, #be185d 0%, #881337 50%, #9333ea 100%)',
            'linear-gradient(135deg, #881337 0%, #9333ea 50%, #be185d 100%)',
            'linear-gradient(135deg, #9333ea 0%, #be185d 50%, #881337 100%)',
        ],
        meshA: 'rgba(168, 85, 247, 0.4)',
        meshB: 'rgba(236, 72, 153, 0.4)',
        meshC: 'rgba(244, 114, 182, 0.4)',
        cardGradient: 'from-purple-500 to-pink-600',
        accentBg: 'bg-purple-100',
        accentText: 'text-purple-600',
        sectionBg: 'from-white via-purple-50/30 to-pink-50/20',
        scheduleBg: 'from-gray-50 via-white to-purple-50/20',
        primaryButton: 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
        ctaButton: 'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
        contactBg: 'bg-purple-700',
    },
    {
        gradientFrom: 'from-orange-600',
        gradientVia: 'via-red-700',
        gradientTo: 'to-rose-900',
        animatedGradients: [
            'linear-gradient(135deg, #ea580c 0%, #b91c1c 50%, #881337 100%)',
            'linear-gradient(135deg, #b91c1c 0%, #881337 50%, #ea580c 100%)',
            'linear-gradient(135deg, #881337 0%, #ea580c 50%, #b91c1c 100%)',
            'linear-gradient(135deg, #ea580c 0%, #b91c1c 50%, #881337 100%)',
        ],
        meshA: 'rgba(249, 115, 22, 0.4)',
        meshB: 'rgba(239, 68, 68, 0.4)',
        meshC: 'rgba(244, 63, 94, 0.4)',
        cardGradient: 'from-orange-500 to-red-600',
        accentBg: 'bg-orange-100',
        accentText: 'text-orange-600',
        sectionBg: 'from-white via-orange-50/30 to-red-50/20',
        scheduleBg: 'from-gray-50 via-white to-orange-50/20',
        primaryButton: 'from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700',
        ctaButton: 'from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
        contactBg: 'bg-red-700',
    },
]

const pickTheme = (slug: string) => {
    let hash = 0
    for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) | 0
    return themes[Math.abs(hash) % themes.length]
}

// Map a raw facility name (admin enters single strings like "Gym", "Pool") to
// an enriched card with description and feature list. Anything we don't have
// a preset for falls back to a generic description so the section never looks
// half-empty for new locations.
const facilityPresets: Record<string, { description: string; features: string[]; emoji: string }> = {
    gym: {
        description: 'Spacious training area with professional gymnastics equipment and apparatus.',
        features: ['Olympic standard apparatus', 'Safety foam pits', 'Sprung floors', 'Mirrored walls'],
        emoji: '🤸',
    },
    pool: {
        description: 'Indoor swimming pool with dedicated lanes and trained lifeguards.',
        features: ['Heated water', 'Multiple lanes', 'Lifeguard on duty', 'Kids shallow area'],
        emoji: '🏊',
    },
    parking: {
        description: 'Convenient on-site parking for parents and visitors.',
        features: ['Free parking', 'Easy access', 'Well-lit area', 'CCTV monitored'],
        emoji: '🅿️',
    },
    'locker rooms': {
        description: 'Clean and secure locker rooms with changing facilities.',
        features: ['Separate boys/girls areas', 'Lockers available', 'Shower facilities', 'Family rooms'],
        emoji: '🚪',
    },
    cafeteria: {
        description: 'On-site cafeteria serving healthy snacks and refreshments.',
        features: ['Healthy menu', 'Comfortable seating', 'Refreshments', 'Child-friendly'],
        emoji: '☕',
    },
    'training area': {
        description: 'Dedicated training space for skill development and practice.',
        features: ['Professional equipment', 'Coaching support', 'Flexible setup', 'Safety mats'],
        emoji: '🏋️',
    },
    'training rooms': {
        description: 'Multiple training rooms for group classes and private sessions.',
        features: ['Climate controlled', 'Audio system', 'Mirrored walls', 'Flexible layout'],
        emoji: '🏠',
    },
}

const enrichFacility = (name: string, index: number) => {
    const key = name.trim().toLowerCase()
    const preset = facilityPresets[key]
    if (preset) return { name, ...preset }
    const emojis = ['🏟️', '⭐', '🎯', '🚀', '💪', '🎉']
    return {
        name,
        description: `Premium ${name.toLowerCase()} available at this location for our students and families.`,
        features: ['Modern equipment', 'Professional staff', 'Safe environment', 'Well maintained'],
        emoji: emojis[index % emojis.length],
    }
}

const dayOrder = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
]

const formatHourRow = (key: string, label: string, operatingHours?: PublicLocation['operatingHours']): { day: string; time: string } | null => {
    if (!operatingHours) return null
    const entry = operatingHours[key] || operatingHours[key.toLowerCase()]
    if (!entry) return null
    const open = entry.openTime ?? entry.open
    const close = entry.closeTime ?? entry.close
    const closed = entry.closed === true || entry.isOpen === false
    if (closed || !open || !close) return { day: label, time: 'Closed' }
    return { day: label, time: `${open} - ${close}` }
}

export default function LocationDetailPage() {
    const params = useParams<{ slug: string }>()
    const slug = String(params?.slug || '')
    const [location, setLocation] = useState<PublicLocation | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        LocationService.getPublic()
            .then((items: any[]) => {
                if (cancelled) return
                const match = (items || []).find((l: any) => String(l.slug || '').toLowerCase() === slug.toLowerCase())
                if (!match) {
                    setError('We could not find that location. It may have been removed or renamed.')
                } else {
                    setLocation(match as PublicLocation)
                }
            })
            .catch((err) => {
                if (cancelled) return
                console.error('Failed to load location detail', err)
                setError('Unable to load this location right now. Please try again shortly.')
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => { cancelled = true }
    }, [slug])

    const theme = useMemo(() => pickTheme(slug), [slug])

    const fullAddress = location
        ? [location.address, location.city, location.state, location.postalCode, location.country].filter(Boolean).join(', ')
        : ''

    const mapUrl = location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress || location.name)}` : '#'

    const enrichedFacilities = useMemo(() => {
        const list = Array.isArray(location?.facilities) ? location!.facilities : []
        if (list.length === 0) {
            // Default facility set so new locations still show a populated section.
            return [
                enrichFacility('Training Hall', 0),
                enrichFacility('Reception & Viewing Area', 1),
                enrichFacility('Locker Rooms', 2),
                enrichFacility('Multi-Purpose Room', 3),
            ]
        }
        return list.map((name, i) => enrichFacility(name, i))
    }, [location])

    const hourRows = useMemo(() => {
        if (!location) return []
        return dayOrder
            .map(({ key, label }) => formatHourRow(key, label, location.operatingHours))
            .filter(Boolean) as Array<{ day: string; time: string }>
    }, [location])

    const summaryHours = useMemo(() => {
        if (hourRows.length === 0) {
            return [
                { day: 'Mon-Fri', time: '4:00 PM - 8:00 PM' },
                { day: 'Sat-Sun', time: '9:00 AM - 5:00 PM' },
            ]
        }
        return hourRows
    }, [hourRows])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="mt-4 text-gray-600">Loading location...</p>
                </div>
            </div>
        )
    }

    if (error || !location) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md text-center bg-white rounded-2xl shadow p-8">
                    <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Location Not Found</h1>
                    <p className="text-gray-600 mb-6">{error || 'We could not find that location.'}</p>
                    <Link href="/locations" className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                        View All Locations
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div>
            {/* Hero Section */}
            <section className="relative h-[400px] sm:h-[450px] md:h-[500px] text-white overflow-hidden flex items-center justify-center">
                <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientVia} ${theme.gradientTo}`}>
                    <motion.div
                        className="absolute inset-0"
                        animate={{ background: theme.animatedGradients }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    <motion.div
                        className="absolute inset-0 opacity-40"
                        animate={{
                            background: [
                                `radial-gradient(circle at 30% 40%, ${theme.meshA} 0%, transparent 50%)`,
                                `radial-gradient(circle at 70% 60%, ${theme.meshB} 0%, transparent 50%)`,
                                `radial-gradient(circle at 50% 30%, ${theme.meshC} 0%, transparent 50%)`,
                                `radial-gradient(circle at 30% 40%, ${theme.meshA} 0%, transparent 50%)`,
                            ],
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    <motion.div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: `
                                linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%, transparent),
                                linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%, transparent)
                            `,
                            backgroundSize: '50px 50px',
                        }}
                        animate={{ backgroundPosition: ['0px 0px', '50px 50px'] }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    />
                </div>

                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"
                            style={{
                                left: `${(i * 13 + 7) % 100}%`,
                                top: `${(i * 17 + 11) % 100}%`,
                                opacity: 0.4,
                            }}
                            animate={{
                                y: [0, -100, 0],
                                opacity: [0.2, 0.8, 0.2],
                                scale: [0.5, 1.5, 0.5],
                            }}
                            transition={{
                                duration: 5 + (i % 5),
                                repeat: Infinity,
                                delay: i * 0.3,
                                ease: 'easeInOut',
                            }}
                        />
                    ))}
                </div>

                <div className="container-max relative z-10 px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-6 sm:mb-8"
                        >
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
                            <span className="text-white/90 text-xs sm:text-sm font-semibold uppercase tracking-wider">
                                ProGym Location
                            </span>
                        </motion.div>

                        <motion.h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-black mb-2 sm:mb-4 leading-tight">
                            {['ProGym', location.name].map((word, index) => (
                                <motion.span
                                    key={`${word}-${index}`}
                                    className="inline-block mr-3"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.2, duration: 0.6, type: 'spring', stiffness: 100 }}
                                >
                                    <motion.span
                                        animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 5, repeat: Infinity, delay: index * 0.3 }}
                                        style={{
                                            backgroundImage: 'linear-gradient(90deg, #ffffff, #e0f2fe, #ffffff)',
                                            backgroundSize: '200% 100%',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                            display: 'inline-block',
                                        }}
                                    >
                                        {word}
                                    </motion.span>
                                </motion.span>
                            ))}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.8 }}
                            className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto px-2"
                        >
                            Modern facility in {[location.city, location.country].filter(Boolean).join(', ') || 'your neighbourhood'} offering
                            comprehensive gymnastics programs and state-of-the-art training spaces for the whole family.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-2"
                        >
                            <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    href="/book-trial"
                                    className={`group relative overflow-hidden bg-gradient-to-r ${theme.ctaButton} text-white px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-2xl flex items-center justify-center space-x-2 w-full sm:w-auto`}
                                >
                                    <span className="relative z-10">Book Free Trial</span>
                                </Link>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    href="#contact-info"
                                    className="group relative overflow-hidden border-2 border-white text-white hover:bg-white hover:text-primary-600 px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center space-x-2 w-full sm:w-auto backdrop-blur-sm bg-white/5 hover:bg-white"
                                >
                                    <span className="relative z-10">Visit Us Today</span>
                                </Link>
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
                                className={`inline-flex items-center px-4 py-2 ${theme.accentBg} rounded-full mb-6`}
                            >
                                <FiMapPin className={`w-4 h-4 ${theme.accentText} mr-2`} />
                                <span className={`${theme.accentText} text-sm font-semibold`}>LOCATION DETAILS</span>
                            </motion.div>

                            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">
                                {location.name} ProGym Centre
                            </h2>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Conveniently located in {[location.city, location.country].filter(Boolean).join(', ') || 'a great neighbourhood'}, our
                                facility offers easy access via public transport with modern amenities designed for safe, professional gymnastics
                                training and family-friendly visits.
                            </p>

                            <div className="space-y-4">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2, duration: 0.6 }}
                                    viewport={{ once: true }}
                                    className="flex items-start space-x-3 p-4 rounded-lg hover:bg-blue-50 transition-colors duration-300"
                                >
                                    <div className={`w-10 h-10 ${theme.accentBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                        <FiMapPin className={`w-5 h-5 ${theme.accentText}`} />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">Address</div>
                                        <div className="text-gray-600 text-sm">{fullAddress || 'Address coming soon'}</div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                    viewport={{ once: true }}
                                    className="flex items-start space-x-3 p-4 rounded-lg hover:bg-blue-50 transition-colors duration-300"
                                >
                                    <div className={`w-10 h-10 ${theme.accentBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                        <FiTruck className={`w-5 h-5 ${theme.accentText}`} />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">Parking & Transport</div>
                                        <div className="text-gray-600 text-sm">On-site parking and convenient public transport links nearby</div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4, duration: 0.6 }}
                                    viewport={{ once: true }}
                                    className="flex items-start space-x-3 p-4 rounded-lg hover:bg-blue-50 transition-colors duration-300"
                                >
                                    <div className={`w-10 h-10 ${theme.accentBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                        <FiWifi className={`w-5 h-5 ${theme.accentText}`} />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">Amenities</div>
                                        <div className="text-gray-600 text-sm">
                                            {(location.amenities && location.amenities.length > 0)
                                                ? location.amenities.join(', ')
                                                : 'Free WiFi, air conditioning, viewing area for parents'}
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5, duration: 0.6 }}
                                    viewport={{ once: true }}
                                    className="flex items-start space-x-3 p-4 rounded-lg hover:bg-blue-50 transition-colors duration-300"
                                >
                                    <div className={`w-10 h-10 ${theme.accentBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                        <FiShield className={`w-5 h-5 ${theme.accentText}`} />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">Safety</div>
                                        <div className="text-gray-600 text-sm">CCTV monitored facility, first aid certified staff and secure access</div>
                                    </div>
                                </motion.div>
                            </div>

                            <motion.a
                                href={mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className={`mt-6 inline-flex items-center gap-2 bg-gradient-to-r ${theme.primaryButton} text-white px-5 py-3 rounded-lg font-semibold shadow-lg transition`}
                            >
                                <FiNavigation className="w-4 h-4" />
                                Get Directions
                            </motion.a>
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
                                <div className={`aspect-[4/3] bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientVia} ${theme.gradientTo} flex items-center justify-center relative overflow-hidden`}>
                                    <motion.div
                                        className="absolute inset-0 opacity-20"
                                        animate={{
                                            background: [
                                                'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                                                'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                                                'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                                            ],
                                        }}
                                        transition={{ duration: 8, repeat: Infinity }}
                                    />

                                    {location.coverImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={location.coverImage} alt={location.name} className="w-full h-full object-cover relative z-10" />
                                    ) : (
                                        <div className="text-white text-center relative z-10">
                                            <motion.div
                                                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                                                transition={{ duration: 4, repeat: Infinity }}
                                                className="text-7xl mb-4"
                                            >
                                                🏢
                                            </motion.div>
                                            <p className="text-xl font-bold">{location.name} Location</p>
                                            <p className="text-sm text-white/80 mt-2">Premier Gymnastics Centre</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            <motion.div
                                className="absolute -bottom-4 -right-4 bg-white rounded-full p-4 shadow-lg"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                <div className="text-center">
                                    <div className={`text-2xl font-bold ${theme.accentText}`}>
                                        {location.capacity ? location.capacity : '7'}
                                    </div>
                                    <div className="text-xs text-gray-600 font-semibold">
                                        {location.capacity ? 'Capacity' : 'Days'}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Our Services Section */}
            <Services />

            {/* Facilities */}
            <section className={`section-padding bg-gradient-to-br ${theme.sectionBg} relative overflow-hidden`}>
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                        className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
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
                            className={`inline-flex items-center px-4 py-2 ${theme.accentBg} rounded-full mb-6`}
                        >
                            <span className={`${theme.accentText} text-sm font-semibold`}>PREMIUM FACILITIES</span>
                        </motion.div>

                        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mb-4">
                            World-Class Facilities
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Our purpose-built facility features professional-grade equipment and amenities designed for optimal training and comfort.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {enrichedFacilities.map((facility, index) => (
                            <motion.div
                                key={`${facility.name}-${index}`}
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: index * 0.15, duration: 0.6, type: 'spring', stiffness: 100 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="group"
                            >
                                <div className="relative h-full bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 overflow-hidden">
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50 group-hover:to-indigo-50 transition-all duration-300"
                                        initial={{ opacity: 0 }}
                                        whileHover={{ opacity: 1 }}
                                    />

                                    <motion.div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/40 to-indigo-100/40 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />

                                    <div className="relative z-10">
                                        <motion.div
                                            initial={{ rotate: 0 }}
                                            whileHover={{ rotate: 10, scale: 1.1 }}
                                            transition={{ type: 'spring', stiffness: 300 }}
                                            className={`w-14 h-14 bg-gradient-to-br ${theme.cardGradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
                                        >
                                            <span className="text-2xl">{facility.emoji}</span>
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
                                                        className={`w-2 h-2 bg-gradient-to-r ${theme.cardGradient} rounded-full`}
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

            {/* Weekly Hours / Schedule */}
            <section className={`section-padding bg-gradient-to-br ${theme.scheduleBg} relative overflow-hidden`}>
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{ rotate: -360, scale: [1, 1.15, 1] }}
                        transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
                        className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-to-r from-blue-200/15 to-cyan-200/15 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                        transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
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
                            className={`inline-flex items-center px-4 py-2 ${theme.accentBg} rounded-full mb-6`}
                        >
                            <span className={`${theme.accentText} text-sm font-semibold`}>WEEKLY HOURS</span>
                        </motion.div>

                        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mb-4">
                            Plan Your Visit
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Drop by during opening hours or browse our full class schedule online to book your spot.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {(hourRows.length > 0 ? hourRows : dayOrder.map(d => ({ day: d.label, time: 'Contact for hours' }))).map((row, index) => (
                            <motion.div
                                key={row.day}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.5 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -6, scale: 1.02 }}
                                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 relative overflow-hidden"
                            >
                                <motion.div
                                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.cardGradient}`}
                                    initial={{ scaleX: 0 }}
                                    whileInView={{ scaleX: 1 }}
                                    transition={{ delay: index * 0.05 + 0.2, duration: 0.6 }}
                                    viewport={{ once: true }}
                                />
                                <div className="flex items-center mb-3">
                                    <motion.span
                                        className={`inline-block w-3 h-3 bg-gradient-to-r ${theme.cardGradient} rounded-full mr-2`}
                                        animate={{ scale: [1, 1.3, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                                    />
                                    <h3 className="text-lg font-heading font-bold text-gray-900">{row.day}</h3>
                                </div>
                                <div className={`text-sm font-semibold ${row.time === 'Closed' ? 'text-red-600' : theme.accentText}`}>
                                    <FiClock className="inline w-4 h-4 mr-1" />
                                    {row.time}
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
                        <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                            <Link
                                href="/book-now"
                                className={`inline-flex items-center justify-center bg-gradient-to-r ${theme.primaryButton} text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-2xl`}
                            >
                                View Class Schedule & Book
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Team Section */}
            <TeamPreview />

            {/* Contact Info */}
            <section id="contact-info" className={`section-padding ${theme.contactBg} text-white`}>
                <div className="container-max">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-heading font-bold mb-4">
                            Visit Our {location.name} Location
                        </h2>
                        <p className="text-white/80 max-w-2xl mx-auto">
                            Ready to start your gymnastics journey? Contact us today to schedule a visit or book your first class.
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
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiMapPin className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold mb-2">Address</h3>
                            <p className="text-white/80 text-sm">{fullAddress || 'Address coming soon'}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiPhone className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold mb-2">Phone</h3>
                            <p className="text-white/80 text-sm">
                                {location.phone || 'Phone coming soon'}
                                <br />
                                <span className="text-xs">
                                    {summaryHours.slice(0, 2).map(h => `${h.day}: ${h.time}`).join(' | ')}
                                </span>
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiMail className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold mb-2">Email</h3>
                            <p className="text-white/80 text-sm">
                                {location.email || 'Email coming soon'}
                                <br />
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
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiClock className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold mb-2">Hours</h3>
                            <p className="text-white/80 text-sm">
                                {summaryHours.map((h, i) => (
                                    <span key={i}>
                                        {h.day}: {h.time}
                                        <br />
                                    </span>
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
                            <Link href="/book-trial" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
                                Book Free Trial
                            </Link>
                            <Link href="/contact" className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                                Contact Us
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
