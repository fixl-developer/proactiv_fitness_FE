'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { FiChevronLeft, FiChevronRight, FiX, FiMail, FiMapPin, FiStar, FiArrowRight } from 'react-icons/fi'

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
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-700 flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700"></div>
                    <Image
                        src="/images/pages/team-hero.jpg"
                        alt="ProActive Sports Team"
                        fill
                        className="object-cover opacity-30"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                </div>

                <div className="relative z-10 text-center text-white px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-4"
                    >
                        Meet Our Expert Team
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl max-w-2xl mx-auto"
                    >
                        Qualified professionals dedicated to your child's development and success
                    </motion.p>
                </div>
            </section>

            {/* THE PROACTIV SPORTS TEAM Introduction */}
            <section className="py-16 bg-white">
                <div className="container-max px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <span className="text-red-500 font-semibold text-sm uppercase tracking-wide">
                            THE PROACTIV SPORTS TEAM
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mt-2 mb-6">
                            MEET THE TEAM
                        </h2>
                        <p className="text-gray-600 max-w-4xl mx-auto leading-relaxed">
                            Our sports coaches play a pivotal role in driving the success of our business through their expertise, leadership, and guidance. They serve as the architects of students development, honing the skills and talents of our students to their fullest potential. Coaches instill discipline, teamwork, and a winning mindset that extends beyond the playing field.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Leadership Team Section */}
            {leadershipTeam.length > 0 && (
                <section className="py-16 bg-gray-50">
                    <div className="container-max px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h3 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-4">
                                LEADERSHIP TEAM
                            </h3>
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
                    <div className="container-max px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h3 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-4">
                                THE HK OFFICE TEAM
                            </h3>
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
            <section className="py-16 bg-gray-50">
                <div className="container-max px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h3 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-4">
                            SUPERSTAR COACHES
                        </h3>
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
                <div className="container-max px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                            <div className="text-3xl font-bold text-blue-600 mb-2">15+</div>
                            <div className="text-gray-600 font-medium">Expert Coaches</div>
                            <div className="text-sm text-gray-500 mt-1">Certified professionals</div>
                        </div>
                        <div className="text-center bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6">
                            <div className="text-3xl font-bold text-green-600 mb-2">100+</div>
                            <div className="text-gray-600 font-medium">Years Combined</div>
                            <div className="text-sm text-gray-500 mt-1">Total experience</div>
                        </div>
                        <div className="text-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                            <div className="text-3xl font-bold text-purple-600 mb-2">500+</div>
                            <div className="text-gray-600 font-medium">Students Trained</div>
                            <div className="text-sm text-gray-500 mt-1">Across all programs</div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Join Our Team CTA */}
            <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
                <div className="container-max px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Want to Join Our Team?</h2>
                    <p className="text-xl mb-8 opacity-90">
                        We're always looking for passionate, qualified coaches to join our growing team.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/careers" className="btn-secondary">
                            View Open Positions
                        </Link>
                        <Link href="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-blue-600">
                            Contact Us
                        </Link>
                    </div>
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
        </div>
    )
}

export default TeamPage