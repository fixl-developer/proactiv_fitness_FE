'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { FiChevronLeft, FiChevronRight, FiX, FiMail, FiMapPin, FiStar, FiArrowRight } from 'react-icons/fi'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

// Team Member Card Component
const TeamMemberCard = ({ member, index, onOpenModal }: { member: any, index: number, onOpenModal: () => void }) => (
    <div
        className="flex-shrink-0 px-4"
        style={{ width: `${100 / 4}%` }}
    >
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
        >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 cursor-pointer">
                {/* Circular Profile Image */}
                <div className="relative h-64 overflow-hidden flex items-center justify-center p-8">
                    <div className="w-48 h-48 rounded-full overflow-hidden bg-white p-2">
                        <div className="w-full h-full rounded-full overflow-hidden relative">
                            <div className={`w-full h-full ${member.fallback}`}></div>
                            <Image
                                src={member.image}
                                alt={member.name}
                                fill
                                className="object-cover"
                                onError={(e) => e.currentTarget.style.display = 'none'}
                            />
                        </div>
                    </div>

                    {/* Experience Badge */}
                    <div className="absolute top-4 right-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-gray-800">
                            {member.experience}
                        </div>
                    </div>
                </div>

                {/* Member Info */}
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                    <p className="text-blue-600 font-medium text-sm mb-3">{member.role}</p>

                    <div className="mb-4">
                        <h4 className="font-semibold text-gray-700 text-sm mb-2">Specialization:</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{member.specialization}</p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                            <FiStar className="w-4 h-4 mr-2 text-yellow-500" />
                            <span>{member.achievements.length} Certifications</span>
                        </div>

                        {/* Read More Button */}
                        <button
                            onClick={onOpenModal}
                            className="text-red-500 font-semibold text-xs uppercase tracking-wide hover:text-red-600 transition-colors duration-200"
                        >
                            READ MORE →
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    </div>

)

// Team Carousel Component
const TeamCarousel = ({
    members,
    carouselIndex,
    onNext,
    onPrev,
    maxIndex,
    onOpenModal,
    teamMembers
}: {
    members: any[],
    carouselIndex: number,
    onNext: () => void,
    onPrev: () => void,
    maxIndex: number,
    onOpenModal: (member: any, index: number) => void,
    teamMembers: any[]
}) => (
    <div className="relative">
        {/* Navigation Arrows */}
        <button
            onClick={onPrev}
            disabled={carouselIndex === 0}
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center transition-all duration-200 ${carouselIndex === 0
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:border-blue-500 hover:bg-blue-50'
                }`}
        >
            <FiChevronLeft className="w-6 h-6 text-gray-600" />
        </button>

        <button
            onClick={onNext}
            disabled={carouselIndex >= maxIndex}
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center transition-all duration-200 ${carouselIndex >= maxIndex
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:border-blue-500 hover:bg-blue-50'
                }`}
        >
            <FiChevronRight className="w-6 h-6 text-gray-600" />
        </button>

        {/* Team Members Carousel */}
        <div className="overflow-hidden mx-16">
            <motion.div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                    transform: `translateX(-${carouselIndex * (100 / 4)}%)`
                }}
            >
                {members.map((member, index) => (
                    <TeamMemberCard
                        key={member.id}
                        member={member}
                        index={index}
                        onOpenModal={() => onOpenModal(member, teamMembers.findIndex(m => m.id === member.id))}
                    />
                ))}
            </motion.div>
        </div>
    </div>
)

const TeamPage = () => {
    const [selectedMember, setSelectedMember] = useState<any>(null)
    const [modalIndex, setModalIndex] = useState(0)
    const [leadershipCarouselIndex, setLeadershipCarouselIndex] = useState(0)
    const [officeCarouselIndex, setOfficeCarouselIndex] = useState(0)
    const [coachesCarouselIndex, setCoachesCarouselIndex] = useState(0)

    // Using the same team data structure as TeamPreview component
    const teamMembers = [
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
            ],
            category: 'leadership'
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
            ],
            category: 'coaches'
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
            ],
            category: 'coaches'
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
            ],
            category: 'office'
        },
        {
            id: 7,
            name: 'DAVID',
            role: 'OPERATIONS MANAGER',
            experience: '6 years',
            specialization: 'Facility management, scheduling',
            image: '/images/team/coach-1.jpg',
            fallback: 'bg-gradient-to-br from-indigo-500 to-blue-600',
            achievements: ['Facility Management', 'Scheduling Expert', 'Safety Compliance'],
            bio: 'David manages all facility operations and ensures smooth scheduling across both locations. He maintains safety standards and coordinates logistics.',
            location: 'Both Locations',
            email: 'david@proactivsports.net',
            phone: '+852 2234 5678',
            qualifications: [
                'Facility Management Certificate',
                'Safety Compliance Training',
                'Scheduling Software Expert',
                'Team Coordination Specialist'
            ],
            excellence: [
                'Zero safety incidents record',
                'Optimized facility utilization',
                'Efficient scheduling systems'
            ],
            category: 'office'
        },
        {
            id: 8,
            name: 'SARAH',
            role: 'MARKETING & COMMUNICATIONS',
            experience: '5 years',
            specialization: 'Digital marketing, social media',
            image: '/images/team/coach-2.jpg',
            fallback: 'bg-gradient-to-br from-rose-500 to-pink-600',
            achievements: ['Digital Marketing', 'Social Media Management', 'Content Creation'],
            bio: 'Sarah leads our marketing initiatives and manages all communications. She creates engaging content and builds our brand presence.',
            location: 'Both Locations',
            email: 'sarah@proactivsports.net',
            phone: '+852 2234 5678',
            qualifications: [
                'Digital Marketing Degree',
                'Social Media Management Certificate',
                'Content Creation Specialist',
                'Brand Strategy Training'
            ],
            excellence: [
                'Increased social media engagement by 300%',
                'Award-winning campaign designer',
                'Community building expert'
            ],
            category: 'office'
        },
        {
            id: 9,
            name: 'MICHAEL',
            role: 'SENIOR COACH & PROGRAM DIRECTOR',
            experience: '14 years',
            specialization: 'Program development, competitive training',
            image: '/images/team/coach-3.jpg',
            fallback: 'bg-gradient-to-br from-cyan-500 to-teal-600',
            achievements: ['Program Development', 'Competitive Training', 'Coach Mentoring'],
            bio: 'Michael oversees program development and mentors junior coaches. He brings extensive experience in competitive gymnastics training.',
            location: 'Cyberport',
            email: 'michael@proactivsports.net',
            phone: '+852 2234 5678',
            qualifications: [
                'Level 4 Gymnastics Coach',
                'Program Development Specialist',
                'Coach Mentoring Certificate',
                'Sports Management Degree'
            ],
            excellence: [
                'Developed 5 successful programs',
                'Mentored 20+ coaches',
                'Competitive team success record'
            ],
            category: 'leadership'
        },
        {
            id: 5,
            name: 'ALEX',
            role: 'ASSISTANT COACH',
            experience: '3 years',
            specialization: 'Toddler classes, basic skills',
            image: '/images/team/coach-5.jpg',
            fallback: 'bg-gradient-to-br from-teal-500 to-cyan-600',
            achievements: ['Level 1 Certified Coach', 'Sports Science Student', 'Youth Leadership'],
            bio: 'Alex is young and enthusiastic, with a special talent for working with nervous beginners and helping them build confidence.',
            location: 'Cyberport',
            email: 'alex@proactivsports.net',
            phone: '+852 2234 5678',
            qualifications: [
                'Level 1 Gymnastics Coach',
                'Sports Science Student',
                'Youth Leadership Certificate',
                'Child Safety Training'
            ],
            excellence: [
                'Toddler program specialist',
                'Beginner skill development',
                'Confidence building expert'
            ],
            category: 'coaches'
        },
        {
            id: 10,
            name: 'EMMA',
            role: 'GYMNASTICS COACH',
            experience: '7 years',
            specialization: 'Artistic gymnastics, flexibility training',
            image: '/images/team/coach-4.jpg',
            fallback: 'bg-gradient-to-br from-amber-500 to-orange-600',
            achievements: ['Level 3 Certified Coach', 'Flexibility Specialist', 'Artistic Gymnastics'],
            bio: 'Emma specializes in artistic gymnastics and flexibility training. She creates personalized programs for each student.',
            location: 'Wan Chai',
            email: 'emma@proactivsports.net',
            phone: '+852 2345 6789',
            qualifications: [
                'Level 3 Gymnastics Coach',
                'Flexibility Training Specialist',
                'Artistic Gymnastics Expert',
                'Injury Prevention Certificate'
            ],
            excellence: [
                'Flexibility program developer',
                'Student achievement rate 95%',
                'Artistic gymnastics specialist'
            ],
            category: 'coaches'
        },
        {
            id: 6,
            name: 'LISA',
            role: 'SENIOR COACH',
            experience: '12 years',
            specialization: 'Advanced training, competitive preparation',
            image: '/images/team/coach-6.jpg',
            fallback: 'bg-gradient-to-br from-pink-500 to-rose-600',
            achievements: ['Level 4 Certified Coach', 'Competition Judge', 'Advanced Training'],
            bio: 'Lisa focuses on advanced skill development and mental preparation for competitive gymnastics, helping athletes reach their full potential.',
            location: 'Wan Chai',
            email: 'lisa@proactivsports.net',
            phone: '+852 2345 6789',
            qualifications: [
                'Level 4 Gymnastics Coach',
                'Certified Competition Judge',
                'Advanced Training Specialist',
                'Sports Psychology Certificate'
            ],
            excellence: [
                'Competitive team coach',
                'Advanced skill specialist',
                'Mental preparation expert'
            ],
            category: 'coaches'
        }
    ]

    // Categorize team members
    const leadershipTeam = teamMembers.filter(member => member.category === 'leadership')
    const officeTeam = teamMembers.filter(member => member.category === 'office')
    const coachesTeam = teamMembers.filter(member => member.category === 'coaches')

    const openMemberModal = (member: any, index: number) => {
        setSelectedMember(member)
        setModalIndex(index)
    }

    const closeMemberModal = () => {
        setSelectedMember(null)
    }

    const navigateModalNext = () => {
        const nextIndex = (modalIndex + 1) % teamMembers.length
        setModalIndex(nextIndex)
        setSelectedMember(teamMembers[nextIndex])
    }

    const navigateModalPrev = () => {
        const prevIndex = modalIndex === 0 ? teamMembers.length - 1 : modalIndex - 1
        setModalIndex(prevIndex)
        setSelectedMember(teamMembers[prevIndex])
    }

    // Carousel navigation functions
    const itemsPerView = 4 // Show 4 team members at once

    // Leadership carousel
    const leadershipMaxIndex = Math.max(0, leadershipTeam.length - itemsPerView)
    const navigateLeadershipNext = () => {
        setLeadershipCarouselIndex(prev => Math.min(prev + 1, leadershipMaxIndex))
    }
    const navigateLeadershipPrev = () => {
        setLeadershipCarouselIndex(prev => Math.max(prev - 1, 0))
    }

    // Office carousel
    const officeMaxIndex = Math.max(0, officeTeam.length - itemsPerView)
    const navigateOfficeNext = () => {
        setOfficeCarouselIndex(prev => Math.min(prev + 1, officeMaxIndex))
    }
    const navigateOfficePrev = () => {
        setOfficeCarouselIndex(prev => Math.max(prev - 1, 0))
    }

    // Coaches carousel
    const coachesMaxIndex = Math.max(0, coachesTeam.length - itemsPerView)
    const navigateCoachesNext = () => {
        setCoachesCarouselIndex(prev => Math.min(prev + 1, coachesMaxIndex))
    }
    const navigateCoachesPrev = () => {
        setCoachesCarouselIndex(prev => Math.max(prev - 1, 0))
    }

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <section className="relative h-96 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center overflow-hidden">
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"></div>
                        <Image
                            src="/images/pages/team-hero.jpg"
                            alt="ProActive Sports Team"
                            fill
                            className="object-cover opacity-20"
                            onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                    </div>

                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 6, repeat: Infinity }}
                            className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"
                        />
                        <motion.div
                            animate={{ y: [0, 20, 0] }}
                            transition={{ duration: 8, repeat: Infinity }}
                            className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
                        />
                    </div>

                    <div className="relative z-10 text-center text-white px-4 max-w-3xl">
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-4xl md:text-5xl font-bold mb-4"
                        >
                            Meet Our Expert Team
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
                        >
                            Qualified professionals dedicated to your child's development and success
                        </motion.p>
                    </div>
                </section>

                {/* THE PROACTIV SPORTS TEAM Introduction */}
                <section className="py-16 bg-white">
                    <div className="container-max px-4 max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <motion.span
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-red-500 font-semibold text-sm uppercase tracking-widest"
                            >
                                THE PROACTIV SPORTS TEAM
                            </motion.span>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-3xl md:text-4xl font-bold text-blue-900 mt-3 mb-6"
                            >
                                MEET THE TEAM
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-gray-600 text-base md:text-lg leading-relaxed"
                            >
                                Our sports coaches play a pivotal role in driving the success of our business through their expertise, leadership, and guidance. They serve as the architects of students development, honing the skills and talents of our students to their fullest potential. Coaches instill discipline, teamwork, and a winning mindset that extends beyond the playing field.
                            </motion.p>
                        </motion.div>
                    </div>
                </section>

                {/* Leadership Team Section */}
                {leadershipTeam.length > 0 && (
                    <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
                        <div className="container-max px-4 max-w-6xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                                className="text-center mb-12"
                            >
                                <motion.h3
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                                >
                                    LEADERSHIP TEAM
                                </motion.h3>
                            </motion.div>

                            <TeamCarousel
                                members={leadershipTeam}
                                carouselIndex={leadershipCarouselIndex}
                                onNext={navigateLeadershipNext}
                                onPrev={navigateLeadershipPrev}
                                maxIndex={leadershipMaxIndex}
                                onOpenModal={openMemberModal}
                                teamMembers={teamMembers}
                            />
                        </div>
                    </section>
                )}

                {/* THE HK OFFICE TEAM Section */}
                {officeTeam.length > 0 && (
                    <section className="py-16 bg-white">
                        <div className="container-max px-4 max-w-6xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                                className="text-center mb-12"
                            >
                                <motion.h3
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
                                >
                                    THE HK OFFICE TEAM
                                </motion.h3>
                            </motion.div>

                            <TeamCarousel
                                members={officeTeam}
                                carouselIndex={officeCarouselIndex}
                                onNext={navigateOfficeNext}
                                onPrev={navigateOfficePrev}
                                maxIndex={officeMaxIndex}
                                onOpenModal={openMemberModal}
                                teamMembers={teamMembers}
                            />
                        </div>
                    </section>
                )}

                {/* SUPERSTAR COACHES Section */}
                <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
                    <div className="container-max px-4 max-w-6xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <motion.h3
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                            >
                                SUPERSTAR COACHES
                            </motion.h3>
                        </motion.div>

                        <TeamCarousel
                            members={coachesTeam}
                            carouselIndex={coachesCarouselIndex}
                            onNext={navigateCoachesNext}
                            onPrev={navigateCoachesPrev}
                            maxIndex={coachesMaxIndex}
                            onOpenModal={openMemberModal}
                            teamMembers={teamMembers}
                        />
                    </div>
                </section>

                {/* Team Stats */}
                <section className="py-16 bg-white">
                    <div className="container-max px-4 max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                whileHover={{ y: -5 }}
                                className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border border-blue-200 hover:shadow-lg transition-all duration-300"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: 'spring' }}
                                    className="text-4xl font-bold text-blue-600 mb-3"
                                >
                                    15+
                                </motion.div>
                                <div className="text-gray-700 font-semibold text-lg mb-1">Expert Coaches</div>
                                <div className="text-sm text-gray-600">Certified professionals</div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                whileHover={{ y: -5 }}
                                className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 border border-green-200 hover:shadow-lg transition-all duration-300"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    transition={{ delay: 0.3, type: 'spring' }}
                                    className="text-4xl font-bold text-green-600 mb-3"
                                >
                                    100+
                                </motion.div>
                                <div className="text-gray-700 font-semibold text-lg mb-1">Years Combined</div>
                                <div className="text-sm text-gray-600">Total experience</div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                whileHover={{ y: -5 }}
                                className="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 border border-purple-200 hover:shadow-lg transition-all duration-300"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    transition={{ delay: 0.4, type: 'spring' }}
                                    className="text-4xl font-bold text-purple-600 mb-3"
                                >
                                    500+
                                </motion.div>
                                <div className="text-gray-700 font-semibold text-lg mb-1">Students Trained</div>
                                <div className="text-sm text-gray-600">Across all programs</div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Join Our Team CTA */}
                <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{ y: [0, -30, 0] }}
                            transition={{ duration: 8, repeat: Infinity }}
                            className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                        />
                        <motion.div
                            animate={{ y: [0, 30, 0] }}
                            transition={{ duration: 10, repeat: Infinity }}
                            className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl"
                        />
                    </div>

                    <div className="container-max px-4 max-w-3xl mx-auto text-center relative z-10">
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-3xl md:text-4xl font-bold mb-4"
                        >
                            Want to Join Our Team?
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="text-lg md:text-xl mb-8 opacity-95 leading-relaxed"
                        >
                            We're always looking for passionate, qualified coaches to join our growing team.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Link data-testid="link-careers" href="/careers" className="btn-secondary hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                                View Open Positions
                            </Link>
                            <Link data-testid="link-contact" href="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105">
                                Contact Us
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* Team Member Detail Modal */}
                <AnimatePresence>
                    {selectedMember && (
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
                                {/* Close Button */}
                                <button
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
                                                <div className={`w-full h-full ${selectedMember.fallback}`}></div>
                                                <Image
                                                    src={selectedMember.image}
                                                    alt={selectedMember.name}
                                                    fill
                                                    className="object-cover"
                                                    onError={(e) => e.currentTarget.style.display = 'none'}
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
                    )}
                </AnimatePresence>
            </main>
            <Footer />
        </>
    )
}

export default TeamPage
