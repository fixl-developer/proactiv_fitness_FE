'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { FiChevronLeft, FiChevronRight, FiX, FiMail, FiMapPin, FiStar, FiArrowRight, FiUsers } from 'react-icons/fi'
import { TeamService } from '@/services/teamService'

const TeamPreview = () => {
    const [selectedMember, setSelectedMember] = useState<any>(null)
    const [carouselIndex, setCarouselIndex] = useState(0)
    const [teamMembers, setTeamMembers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Load team members from backend
    useEffect(() => {
        const loadTeamMembers = async () => {
            try {
                setIsLoading(true)
                const members = await TeamService.getPublicTeam()

                // Transform backend data to match component structure
                const transformedMembers = members.map(member => ({
                    id: member.id,
                    name: member.name.toUpperCase(),
                    role: member.position.toUpperCase(),
                    experience: member.experience,
                    specialization: member.specializations.join(', '),
                    image: member.profileImage || '/images/team/coach-1.jpg',
                    fallback: 'bg-gradient-to-br from-blue-500 to-purple-600',
                    achievements: member.certifications,
                    bio: member.bio,
                    location: 'ProActive Sports',
                    email: `${member.name.toLowerCase().replace(' ', '.')}@proactivesports.net`,
                    phone: '+852 2234 5678',
                    qualifications: member.certifications,
                    excellence: [
                        `${member.experience} of coaching experience`,
                        `Specialized in ${member.specializations.join(' and ')}`,
                        'Certified professional coach'
                    ]
                }))

                setTeamMembers(transformedMembers)
            } catch (error) {
                // Silently fail - will use fallback mock data below

                // Fallback to mock data if API fails
                setTeamMembers([
                    {
                        id: 1,
                        name: 'MONICA',
                        role: 'DIRECTOR OF SPORTS',
                        experience: '15 years',
                        specialization: 'Competitive gymnastics, program development',
                        image: '/images/team/coach-1.jpg',
                        fallback: 'bg-gradient-to-br from-blue-500 to-purple-600',
                        achievements: ['Former National Team Member', 'Level 4 Certified Coach', 'Sports Science Degree'],
                        bio: 'Coach Monica, originally from Italy, has dedicated nearly 19 years to coaching gymnastics for children and teenagers. Her journey began as a gymnast at the age of 7, continuing until 14 when a knee injury necessitated a shift from high-level training. Discovering her true passion in coaching at 15, she embarked on her coaching career. By 17, she achieved her level 2 coaching qualification in Italy, followed by her level 2 judging certification at 25.',
                        location: 'Cyberport',
                        email: 'monica@proactivsports.net',
                        phone: '+852 2234 5678',
                        qualifications: [
                            'Laurea in Physical Activity and Sports Science, University of Verona',
                            'Level 2 Gymnastics coaching certificate',
                            'Regional WAG Judge',
                            'Emergency first response first aid certification'
                        ],
                        excellence: [
                            'Monica was 2 times Master Italian Champion',
                            'Regional Junior Apparatus Medalist',
                            'Served as Competitive Coach Supervisor in Dubai'
                        ]
                    },
                    {
                        id: 2,
                        name: 'JUAN',
                        role: 'GYMNASTICS COACH',
                        experience: '10 years',
                        specialization: 'School programs, beginner classes',
                        image: '/images/team/coach-2.jpg',
                        fallback: 'bg-gradient-to-br from-green-500 to-blue-600',
                        achievements: ['Level 3 Certified Coach', 'Physical Education Degree', 'Child Development Expert'],
                        bio: 'Juan loves working with young children and has a patient, encouraging teaching approach. He specializes in building foundational skills and confidence in gymnastics.',
                        location: 'Wan Chai',
                        email: 'juan@proactivsports.net',
                        phone: '+852 2345 6789',
                        qualifications: [
                            'Level 3 Gymnastics Coach',
                            'Physical Education Degree',
                            'Child Development Specialist',
                            'First Aid Certified'
                        ],
                        excellence: [
                            'Trained over 200 young gymnasts',
                            'Specialized in beginner programs',
                            'Expert in child psychology'
                        ]
                    },
                    {
                        id: 3,
                        name: 'SAMI',
                        role: 'GYMNASTICS COACH',
                        experience: '5 years',
                        specialization: 'Holiday camps, birthday parties',
                        image: '/images/team/coach-3.jpg',
                        fallback: 'bg-gradient-to-br from-purple-500 to-pink-600',
                        achievements: ['Level 2 Certified Coach', 'First Aid Certified', 'Recreation Leadership'],
                        bio: 'Sami is energetic and fun-loving, creating engaging activities that make learning gymnastics enjoyable for children of all ages.',
                        location: 'Both Locations',
                        email: 'sami@proactivsports.net',
                        phone: '+852 2234 5678',
                        qualifications: [
                            'Level 2 Gymnastics Coach',
                            'Recreation Leadership Certificate',
                            'First Aid Certified',
                            'Youth Development Specialist'
                        ],
                        excellence: [
                            'Holiday camp specialist',
                            'Birthday party expert',
                            'Creative activity designer'
                        ]
                    },
                    {
                        id: 4,
                        name: 'JOANNA',
                        role: 'HEAD OF CUSTOMER SERVICE & OPERATIONS',
                        experience: '8 years',
                        specialization: 'Customer service, operations management',
                        image: '/images/team/coach-4.jpg',
                        fallback: 'bg-gradient-to-br from-orange-500 to-red-600',
                        achievements: ['Operations Management', 'Customer Service Excellence', 'Business Administration'],
                        bio: 'Joanna ensures smooth operations and exceptional customer service. She manages all administrative aspects and maintains high standards of service delivery.',
                        location: 'Both Locations',
                        email: 'joanna@proactivsports.net',
                        phone: '+852 2234 5678',
                        qualifications: [
                            'Business Administration Degree',
                            'Customer Service Excellence',
                            'Operations Management Certificate',
                            'Team Leadership Training'
                        ],
                        excellence: [
                            'Streamlined operations efficiency',
                            '95% customer satisfaction rate',
                            'Team management expert'
                        ]
                    }
                ])
            } finally {
                setIsLoading(false)
            }
        }

        loadTeamMembers()
    }, [])

    // Responsive carousel settings
    const getItemsPerView = () => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth < 640) return 1; // Mobile: 1 card
            if (window.innerWidth < 1024) return 2; // Tablet: 2 cards
            return 4; // Desktop: 4 cards
        }
        return 4; // Default for SSR
    };

    const [itemsPerView, setItemsPerView] = useState(4);

    // Update items per view on window resize
    useEffect(() => {
        const handleResize = () => {
            const newItemsPerView = getItemsPerView();
            setItemsPerView(newItemsPerView);
            // Reset carousel index if it's out of bounds
            setCarouselIndex(prev => Math.min(prev, Math.max(0, teamMembers.length - newItemsPerView)));
        };

        if (typeof window !== 'undefined') {
            setItemsPerView(getItemsPerView());
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, [teamMembers.length]);

    const maxIndex = Math.max(0, teamMembers.length - itemsPerView) // Max slide index

    const openMemberModal = (member: any) => {
        setSelectedMember(member)
    }

    const closeMemberModal = () => {
        setSelectedMember(null)
    }

    const navigateCarouselNext = () => {
        setCarouselIndex(prev => Math.min(prev + 1, maxIndex))
    }

    const navigateCarouselPrev = () => {
        setCarouselIndex(prev => Math.max(prev - 1, 0))
    }

    return (
        <section className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 overflow-hidden">
            {/* Ultra-Modern Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        rotate: 360,
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        rotate: -360,
                        scale: [1, 1.3, 1]
                    }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-0 left-0 w-64 h-64 sm:w-[500px] sm:h-[500px] bg-gradient-to-r from-green-200/20 to-cyan-200/20 rounded-full blur-3xl"
                />

                {/* Floating Particles */}
                {[...Array(10)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        suppressHydrationWarning
                        animate={{
                            y: [0, -60, 0],
                            opacity: [0.2, 0.8, 0.2],
                            scale: [0.5, 1.5, 0.5],
                        }}
                        transition={{
                            duration: 4 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
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
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500/10 to-pink-500/10 backdrop-blur-sm border border-red-200/30 rounded-2xl mb-6"
                    >
                        <FiUsers className="w-5 h-5 text-red-600 mr-2" />
                        <span className="text-red-600 font-bold text-sm uppercase tracking-wider">
                            Our Team
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-gray-900 mb-6 leading-tight"
                    >
                        Meet Our Expert
                        <motion.span
                            className="block bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent"
                            animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                            transition={{ duration: 5, repeat: Infinity }}
                        >
                            Coaching Team
                        </motion.span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed"
                    >
                        Our sports coaches play a pivotal role in driving the success of our business through their expertise, leadership, and guidance. They serve as the architects of students development, honing the skills and talents of our students to their fullest potential.
                    </motion.p>
                </motion.div>

                {/* Ultra-Modern Team Carousel */}
                <div className="relative mb-20 py-12">
                    {/* Enhanced Navigation Arrows */}
                    <motion.button
                        id="team-preview-prev-btn"
                        onClick={navigateCarouselPrev}
                        disabled={carouselIndex === 0}
                        className={`absolute left-2 sm:left-4 lg:left-8 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${carouselIndex === 0
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-white hover:scale-110 hover:shadow-2xl'
                            }`}
                        whileHover={{ scale: carouselIndex === 0 ? 1 : 1.1, rotate: -5 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 text-gray-600" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl sm:rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    </motion.button>

                    <motion.button
                        id="team-preview-next-btn"
                        onClick={navigateCarouselNext}
                        disabled={carouselIndex >= maxIndex}
                        className={`absolute right-2 sm:right-4 lg:right-8 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${carouselIndex >= maxIndex
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-white hover:scale-110 hover:shadow-2xl'
                            }`}
                        whileHover={{ scale: carouselIndex >= maxIndex ? 1 : 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 text-gray-600" />
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl sm:rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    </motion.button>

                    {/* Enhanced Team Members Carousel - Separate Cards with Proper Spacing */}
                    <div className="mx-auto max-w-7xl">
                        <div className="overflow-visible px-16 sm:px-20 lg:px-24">
                            <motion.div
                                className="flex gap-6 transition-transform duration-700 ease-out"
                                style={{
                                    transform: `translateX(-${carouselIndex * (100 / itemsPerView)}%)`
                                }}
                            >
                                {teamMembers.map((member, index) => (
                                    <div
                                        key={member.id}
                                        className="flex-shrink-0"
                                        style={{ width: `calc(${100 / itemsPerView}% - 24px)` }}
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, y: 50 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{
                                                delay: index * 0.15,
                                                duration: 0.8,
                                                type: "spring",
                                                stiffness: 100
                                            }}
                                            viewport={{ once: true }}
                                            className="text-center group h-full"
                                        >
                                            {/* Card Container with Fixed Equal Height */}
                                            <div className="relative flex flex-col items-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 h-[420px]">
                                                {/* Circular Image - No Zoom Effect */}
                                                <div id="sections-team-preview-div-clickable"
                                                    className="relative w-32 h-32 sm:w-40 sm:h-40 mb-4 cursor-pointer"
                                                    onClick={() => openMemberModal(member)}
                                                >
                                                    {/* Animated Border Ring */}
                                                    <div
                                                        className="absolute -inset-1 rounded-full opacity-75 group-hover:opacity-100 blur-sm transition-opacity duration-300"
                                                        style={{
                                                            background: member.fallback.includes('blue') ? 'linear-gradient(45deg, #3b82f6, #8b5cf6)' :
                                                                member.fallback.includes('green') ? 'linear-gradient(45deg, #22c55e, #3b82f6)' :
                                                                    member.fallback.includes('purple') ? 'linear-gradient(45deg, #a855f7, #ec4899)' :
                                                                        'linear-gradient(45deg, #f97316, #ef4444)'
                                                        }}
                                                    />

                                                    {/* Image Container - Fixed, No Zoom */}
                                                    <div className="relative w-full h-full rounded-full overflow-hidden bg-white shadow-xl border-4 border-white">
                                                        {/* Gradient Background Fallback */}
                                                        <div className={`absolute inset-0 ${member.fallback}`}></div>
                                                        {/* Actual Image - No Hover Scale */}
                                                        <img
                                                            src={member.image}
                                                            alt={member.name}
                                                            className="relative w-full h-full object-cover z-10"
                                                            onError={(e) => {
                                                                console.log('❌ Image failed for:', member.name, member.image)
                                                                e.currentTarget.style.display = 'none'
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Experience Badge */}
                                                    <motion.div
                                                        className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-20"
                                                        initial={{ scale: 0 }}
                                                        whileInView={{ scale: 1 }}
                                                        transition={{ delay: index * 0.15 + 0.3, type: "spring" }}
                                                    >
                                                        ⭐ {member.experience}
                                                    </motion.div>
                                                </div>

                                                {/* Member Info - Fixed Layout */}
                                                <div className="text-center w-full flex-1 flex flex-col">
                                                    <h3
                                                        className="text-base sm:text-lg font-black text-gray-900 mb-1"
                                                        style={{ lineHeight: '1.3', paddingBottom: '0.25rem' }}
                                                    >
                                                        {member.name}
                                                    </h3>
                                                    <p
                                                        className="font-bold text-xs sm:text-sm uppercase tracking-wide mb-3"
                                                        style={{
                                                            background: member.fallback.includes('blue') ? 'linear-gradient(to right, #3b82f6, #8b5cf6)' :
                                                                member.fallback.includes('green') ? 'linear-gradient(to right, #22c55e, #3b82f6)' :
                                                                    member.fallback.includes('purple') ? 'linear-gradient(to right, #a855f7, #ec4899)' :
                                                                        'linear-gradient(to right, #f97316, #ef4444)',
                                                            WebkitBackgroundClip: 'text',
                                                            WebkitTextFillColor: 'transparent',
                                                            backgroundClip: 'text'
                                                        }}
                                                    >
                                                        {member.role}
                                                    </p>

                                                    {/* Specialization - Fixed Height */}
                                                    <div className="flex flex-wrap gap-1 justify-center mb-4 min-h-[50px]">
                                                        {member.specialization.split(',').slice(0, 2).map((spec: string, idx: number) => (
                                                            <span
                                                                key={idx}
                                                                className="text-[10px] px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full font-semibold"
                                                            >
                                                                {spec.trim()}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {/* View Profile Button - At Bottom */}
                                                    <div className="mt-auto">
                                                        <motion.button
                                                            id={`team-preview-view-profile-${member.id}-btn`}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                openMemberModal(member)
                                                            }}
                                                            className="w-full px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
                                                            style={{
                                                                background: member.fallback.includes('blue') ? 'linear-gradient(to right, #3b82f6, #8b5cf6)' :
                                                                    member.fallback.includes('green') ? 'linear-gradient(to right, #22c55e, #3b82f6)' :
                                                                        member.fallback.includes('purple') ? 'linear-gradient(to right, #a855f7, #ec4899)' :
                                                                            'linear-gradient(to right, #f97316, #ef4444)'
                                                            }}
                                                            whileHover={{ scale: 1.05, y: -2 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            View Profile
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </div >
                </div >

                {/* Compact Team Stats */}
                < motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                    viewport={{ once: true }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12 max-w-4xl mx-auto"
                >
                    {
                        [
                            { number: "15+", label: "Expert Coaches", sublabel: "Certified professionals", color: "from-blue-500 to-cyan-500", bg: "from-blue-50 to-cyan-50" },
                            { number: "100+", label: "Years Combined", sublabel: "Total experience", color: "from-green-500 to-emerald-500", bg: "from-green-50 to-emerald-50" },
                            { number: "500+", label: "Students Trained", sublabel: "Across all programs", color: "from-purple-500 to-pink-500", bg: "from-purple-50 to-pink-50" }
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{
                                    delay: index * 0.1,
                                    duration: 0.5,
                                    type: "spring"
                                }}
                                viewport={{ once: true }}
                                className="group"
                            >
                                <motion.div
                                    className={`text-center bg-gradient-to-br ${stat.bg} rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-white/50`}
                                    whileHover={{ scale: 1.03, y: -5 }}
                                >
                                    <motion.div
                                        className={`text-2xl sm:text-3xl font-black mb-1 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                                    >
                                        {stat.number}
                                    </motion.div>
                                    <div className="text-gray-700 font-bold text-sm mb-0.5">{stat.label}</div>
                                    <div className="text-xs text-gray-500">{stat.sublabel}</div>
                                </motion.div>
                            </motion.div>
                        ))
                    }
                </motion.div >

                {/* Ultra-Modern CTA Section */}
                < motion.div
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
                                className="text-2xl sm:text-3xl lg:text-4xl font-black mb-4 sm:mb-6"
                            >
                                🤝 Want to Meet Our Team?
                            </motion.h3>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                viewport={{ once: true }}
                                className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4"
                            >
                                Get to know our coaches better and learn about their backgrounds, specializations,
                                and passion for gymnastics education. Experience the difference expert coaching makes!
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.8 }}
                                viewport={{ once: true }}
                                className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4"
                            >
                                <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                                    <Link id="sections-team-preview-nav-team"
                                        href="/team"
                                        className="group relative overflow-hidden bg-white text-blue-600 hover:bg-gray-50 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-xl flex items-center justify-center space-x-2 w-full sm:w-auto"
                                    >
                                        <span>Meet Full Team</span>
                                        <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform duration-300" />
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-purple-100/50"
                                            initial={{ x: '-100%' }}
                                            whileHover={{ x: '100%' }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </Link>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                                    <Link id="sections-team-preview-nav-book-trial"
                                        href="/book-trial"
                                        className="group border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center space-x-2 w-full sm:w-auto"
                                    >
                                        <span>Book Free Trial</span>
                                        <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform duration-300" />
                                    </Link>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div >
            </div >

            {/* Team Member Detail Modal */}
            <AnimatePresence>
                {
                    selectedMember && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                            onClick={closeMemberModal}
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Close Button Only */}
                                <button id="sections-team-preview-btn"
                                    onClick={closeMemberModal}
                                    className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-all duration-200"
                                >
                                    <FiX className="w-6 h-6 text-gray-700" />
                                </button>

                                <div className="grid grid-cols-1 lg:grid-cols-2">
                                    {/* Left Side - Circular Image */}
                                    <div className="relative p-8 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                        {/* Experience Badge */}
                                        <div className="absolute top-6 left-6">
                                            <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 font-semibold text-gray-800">
                                                {selectedMember.experience} Experience
                                            </div>
                                        </div>

                                        {/* Circular Profile Image */}
                                        <div className="w-64 h-64 rounded-full overflow-hidden bg-white p-2">
                                            <div className="w-full h-full rounded-full overflow-hidden relative">
                                                <div className={`absolute inset-0 ${selectedMember.fallback}`}></div>
                                                <img
                                                    src={selectedMember.image}
                                                    alt={selectedMember.name}
                                                    className="relative w-full h-full object-cover z-10"
                                                    onError={(e) => {
                                                        console.log('Modal image failed:', selectedMember.name)
                                                        e.currentTarget.style.display = 'none'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side - Details */}
                                    <div className="p-8">
                                        <div className="mb-6">
                                            <h2 className="text-3xl font-bold text-blue-900 mb-2">{selectedMember.name}</h2>
                                            <p className="text-xl text-blue-500 font-semibold mb-4">{selectedMember.role}</p>

                                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                                                <div className="flex items-center space-x-1">
                                                    <FiMapPin className="w-4 h-4" />
                                                    <span>{selectedMember.location}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <FiMail className="w-4 h-4" />
                                                    <span>{selectedMember.email}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bio */}
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">About {selectedMember.name.split(' ')[0]}</h3>
                                            <p className="text-gray-600 leading-relaxed text-sm">{selectedMember.bio}</p>
                                        </div>

                                        {/* Specialization */}
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialization</h3>
                                            <p className="text-gray-600 text-sm">{selectedMember.specialization}</p>
                                        </div>

                                        {/* Qualifications */}
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Qualifications</h3>
                                            <div className="space-y-2">
                                                {selectedMember.qualifications?.map((qualification: string, idx: number) => (
                                                    <div key={idx} className="flex items-start space-x-2">
                                                        <span className="text-gray-400 mt-1">•</span>
                                                        <span className="text-gray-600 text-sm">{qualification}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Examples of Excellence */}
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Examples of Excellence</h3>
                                            <div className="space-y-2">
                                                {selectedMember.excellence?.map((example: string, idx: number) => (
                                                    <div key={idx} className="flex items-start space-x-2">
                                                        <span className="text-gray-400 mt-1">•</span>
                                                        <span className="text-gray-600 text-sm">{example}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Contact Info */}
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <FiMail className="w-4 h-4 text-gray-500" />
                                                    <span className="text-gray-600">{selectedMember.email}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <FiMapPin className="w-4 h-4 text-gray-500" />
                                                    <span className="text-gray-600">{selectedMember.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </section >
    )
}

export default TeamPreview
