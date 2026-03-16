'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { FiStar, FiTrendingUp, FiAward, FiUsers } from 'react-icons/fi'
import { useAIAnimations } from '@/hooks/useAIAnimations'

const ClientLogos = () => {
    const [floatingIcons, setFloatingIcons] = useState<Array<{ id: number; left: number; top: number; fontSize: number; duration: number; delay: number }>>([])

    useEffect(() => {
        // Generate floating icons only on client side to avoid hydration mismatch
        const generatedIcons = [...Array(6)].map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            fontSize: 16 + Math.random() * 12,
            duration: 6 + Math.random() * 4,
            delay: Math.random() * 3
        }))
        setFloatingIcons(generatedIcons)
    }, [])

    const clients = [
        {
            name: 'Hong Kong International School',
            logo: '/images/clients/client-1.png',
            fallback: 'HKIS',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            name: 'Discovery Bay International School',
            logo: '/images/clients/client-2.png',
            fallback: 'DBIS',
            color: 'from-green-500 to-emerald-500'
        },
        {
            name: 'German Swiss International School',
            logo: '/images/clients/client-3.png',
            fallback: 'GSIS',
            color: 'from-purple-500 to-pink-500'
        },
        {
            name: 'Kellett School',
            logo: '/images/clients/client-4.png',
            fallback: 'KS',
            color: 'from-orange-500 to-red-500'
        },
        {
            name: 'Hong Kong Academy',
            logo: '/images/clients/client-5.png',
            fallback: 'HKA',
            color: 'from-teal-500 to-cyan-500'
        },
        {
            name: 'Canadian International School',
            logo: '/images/clients/client-6.png',
            fallback: 'CDNIS',
            color: 'from-indigo-500 to-purple-500'
        },
        {
            name: 'Harrow International School',
            logo: '/images/clients/client-7.png',
            fallback: 'HIS',
            color: 'from-pink-500 to-rose-500'
        },
        {
            name: 'French International School',
            logo: '/images/clients/client-8.png',
            fallback: 'FIS',
            color: 'from-yellow-500 to-orange-500'
        }
    ]

    return (
        <section className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 overflow-hidden">
            {/* Ultra-Modern Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        rotate: 360,
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        rotate: -360,
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-0 left-0 w-64 h-64 sm:w-[500px] sm:h-[500px] bg-gradient-to-r from-green-200/20 to-cyan-200/20 rounded-full blur-3xl"
                />

                {/* Floating School Icons */}
                {floatingIcons.map((icon) => (
                    <motion.div
                        key={icon.id}
                        className="absolute text-blue-200/20"
                        style={{
                            left: `${icon.left}%`,
                            top: `${icon.top}%`,
                            fontSize: `${icon.fontSize}px`
                        }}
                        animate={{
                            y: [0, -40, 0],
                            opacity: [0.1, 0.3, 0.1],
                            rotate: [0, 180, 360],
                        }}
                        transition={{
                            duration: icon.duration,
                            repeat: Infinity,
                            delay: icon.delay,
                        }}
                    >
                        🏫
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
                        <FiAward className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-blue-600 font-bold text-sm uppercase tracking-wider">
                            Our Partners
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-gray-900 mb-6 leading-tight"
                    >
                        Trusted by Leading
                        <motion.span
                            className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                            animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                            transition={{ duration: 5, repeat: Infinity }}
                        >
                            International Schools
                        </motion.span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed"
                    >
                        We're proud to partner with Hong Kong's top international schools,
                        providing quality gymnastics programs and training services that inspire excellence.
                    </motion.p>
                </motion.div>

                {/* Ultra-Modern Logos Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 items-center mb-20">
                    {clients.map((client, index) => (
                        <motion.div
                            key={client.name}
                            initial={{ opacity: 0, scale: 0.5, rotateY: 45 }}
                            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                            transition={{
                                delay: index * 0.1,
                                duration: 0.8,
                                type: "spring",
                                stiffness: 100
                            }}
                            viewport={{ once: true }}
                            className="group"
                        >
                            <motion.div
                                className="relative h-20 w-full flex items-center justify-center p-6 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg transition-all duration-500"
                                whileHover={{
                                    scale: 1.1,
                                    y: -8,
                                    rotateY: 5,
                                    boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.15)"
                                }}
                            >
                                {/* Enhanced Fallback with gradient */}
                                <motion.div
                                    className="absolute inset-0 flex items-center justify-center"
                                    animate={{
                                        background: [
                                            `linear-gradient(135deg, ${client.color.split(' ')[1]}, ${client.color.split(' ')[3]})`,
                                            `linear-gradient(135deg, ${client.color.split(' ')[3]}, ${client.color.split(' ')[1]})`,
                                            `linear-gradient(135deg, ${client.color.split(' ')[1]}, ${client.color.split(' ')[3]})`
                                        ]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                >
                                    <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                                        <span className="text-sm font-black text-gray-700">
                                            {client.fallback}
                                        </span>
                                    </div>
                                </motion.div>

                                {/* Actual logo (will show when images are added) */}
                                <Image
                                    src={client.logo}
                                    alt={client.name}
                                    width={140}
                                    height={70}
                                    className="object-contain filter grayscale hover:grayscale-0 transition-all duration-500 relative z-10"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                    }}
                                />

                                {/* Animated Border */}
                                <motion.div
                                    className="absolute inset-0 border-2 border-transparent rounded-2xl"
                                    animate={{
                                        borderColor: [
                                            'rgba(59,130,246,0)',
                                            'rgba(59,130,246,0.3)',
                                            'rgba(139,92,246,0.3)',
                                            'rgba(59,130,246,0)'
                                        ]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                                />

                                {/* Floating Particles */}
                                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                                    {[...Array(3)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-1 h-1 bg-blue-400/50 rounded-full"
                                            style={{
                                                left: `${30 + i * 20}%`,
                                                bottom: '20%',
                                            }}
                                            animate={{
                                                y: [0, -30, 0],
                                                opacity: [0, 1, 0],
                                                scale: [0, 1.5, 0],
                                            }}
                                            transition={{
                                                duration: 2 + (i * 0.3),
                                                repeat: Infinity,
                                                delay: i * 0.3,
                                            }}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>

                {/* Ultra-Modern Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                    viewport={{ once: true }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-20 max-w-5xl mx-auto"
                >
                    {[
                        { number: "25+", label: "Partner Schools", icon: FiUsers, color: "from-blue-500 to-cyan-500", bg: "from-blue-50 to-cyan-50" },
                        { number: "500+", label: "Happy Students", icon: FiStar, color: "from-green-500 to-emerald-500", bg: "from-green-50 to-emerald-50" },
                        { number: "8+", label: "Years Experience", icon: FiTrendingUp, color: "from-purple-500 to-pink-500", bg: "from-purple-50 to-pink-50" },
                        { number: "98%", label: "Satisfaction Rate", icon: FiAward, color: "from-orange-500 to-red-500", bg: "from-orange-50 to-red-50" }
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.5, rotateY: 45 }}
                            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
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
                                className={`bg-gradient-to-br ${stat.bg} rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50`}
                                whileHover={{ scale: 1.05, y: -10 }}
                            >
                                <motion.div
                                    className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: index * 0.5 }}
                                >
                                    <stat.icon className="w-6 h-6 text-white" />
                                </motion.div>

                                <motion.div
                                    className={`text-2xl sm:text-3xl font-black mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                                >
                                    {stat.number}
                                </motion.div>
                                <div className="text-gray-700 font-bold text-sm">{stat.label}</div>

                                {/* Animated Background */}
                                <motion.div
                                    className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-500`}
                                />
                            </motion.div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Ultra-Modern Partnership CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <motion.div
                        className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white overflow-hidden shadow-2xl"
                        whileHover={{ scale: 1.02 }}
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
                                🤝 Interested in Partnership?
                            </motion.h3>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                viewport={{ once: true }}
                                className="text-lg text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed"
                            >
                                We offer customized gymnastics programs for schools and organizations.
                                Contact us to discuss how we can bring professional gymnastics training to your institution.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                <motion.a
                                    href="mailto:partnerships@proactivsports.net"
                                    className="group relative overflow-hidden bg-white text-blue-600 hover:bg-gray-50 px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl inline-flex items-center space-x-2"
                                    whileHover={{ scale: 1.05, y: -3 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span>Contact for Partnership</span>
                                    <FiUsers className="w-5 h-5 group-hover:scale-125 transition-transform duration-300" />
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-purple-100/50"
                                        initial={{ x: '-100%' }}
                                        whileHover={{ x: '100%' }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </motion.a>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}

export default ClientLogos
