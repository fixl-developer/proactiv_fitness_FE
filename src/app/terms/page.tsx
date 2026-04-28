'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiArrowLeft, FiShield, FiFileText, FiUsers, FiAlertCircle } from 'react-icons/fi'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { usePageHero } from '@/hooks/usePageHero'

export default function TermsAndConditionsPage() {
    const { hero } = usePageHero('terms', {
        title: 'Terms & Conditions',
        subtitle: 'Please read these terms carefully before enrolling in our programs. These conditions ensure a safe and positive experience for all participants.',
        backgroundImage: '/images/pages/terms-hero.jpg',
        fallbackGradient: 'from-blue-600 via-purple-600 to-pink-600',
        ctaText: '',
        ctaLink: '',
        height: 'medium',
    })

    const sections = [
        {
            id: 'acceptance',
            title: 'Acceptance of Terms',
            icon: FiFileText,
            content: [
                'By enrolling in any ProActive Sports program or using our services, you agree to be bound by these Terms and Conditions.',
                'These terms apply to all students, parents, guardians, and visitors to our facilities.',
                'We reserve the right to modify these terms at any time with reasonable notice.'
            ]
        },
        {
            id: 'enrollment',
            title: 'Enrollment and Registration',
            icon: FiUsers,
            content: [
                'All students must complete a registration form and medical questionnaire before participating.',
                'Registration fees are non-refundable and must be paid in full before the first class.',
                'Class schedules are subject to change based on enrollment numbers and facility availability.',
                'We reserve the right to cancel classes with insufficient enrollment with full refund.'
            ]
        },
        {
            id: 'payment',
            title: 'Payment Terms',
            icon: FiShield,
            content: [
                'All fees must be paid in advance according to the payment schedule provided.',
                'Late payment fees may apply for overdue accounts.',
                'Refunds are only available in exceptional circumstances and at management discretion.',
                'No refunds will be given for missed classes due to student absence.'
            ]
        },
        {
            id: 'safety',
            title: 'Safety and Liability',
            icon: FiAlertCircle,
            content: [
                'Gymnastics involves inherent risks. Participation is at your own risk.',
                'All students must follow safety instructions and facility rules at all times.',
                'ProActive Sports maintains comprehensive insurance but participants should have their own coverage.',
                'Parents/guardians must inform us of any medical conditions or injuries that may affect participation.'
            ]
        },
        {
            id: 'conduct',
            title: 'Code of Conduct',
            icon: FiUsers,
            content: [
                'All participants must treat coaches, staff, and other students with respect.',
                'Inappropriate behavior, including bullying or harassment, will not be tolerated.',
                'We reserve the right to suspend or terminate enrollment for violations of our code of conduct.',
                'Parents are responsible for their children\'s behavior in our facilities.'
            ]
        },
        {
            id: 'facilities',
            title: 'Facility Use',
            icon: FiShield,
            content: [
                'Our facilities are for enrolled students and authorized personnel only.',
                'Proper gymnastics attire is required for all classes.',
                'Personal belongings are left at your own risk - we are not responsible for lost or stolen items.',
                'Photography and video recording are restricted without written permission.'
            ]
        },
        {
            id: 'cancellation',
            title: 'Cancellation Policy',
            icon: FiFileText,
            content: [
                'Class cancellations due to weather or unforeseen circumstances will be made up or credited.',
                'Students may withdraw with 30 days written notice.',
                'No refunds for partial months or missed classes.',
                'Holiday camps and birthday parties have separate cancellation policies.'
            ]
        },
        {
            id: 'privacy',
            title: 'Privacy and Data Protection',
            icon: FiShield,
            content: [
                'We collect and use personal information in accordance with Hong Kong privacy laws.',
                'Student information is kept confidential and used only for program administration.',
                'We may use photos/videos for promotional purposes unless you opt out in writing.',
                'You have the right to access and correct your personal information.'
            ]
        }
    ]

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="container-max px-4 py-6">
                        <div className="flex items-center space-x-4">
                            <Link id="terms-nav"
                                href="/"
                                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                            >
                                <FiArrowLeft className="w-5 h-5" />
                                <span>Back to Home</span>
                            </Link>
                            <div className="w-px h-6 bg-gray-300"></div>
                            <h1 className="text-2xl font-bold text-gray-900">Terms & Conditions</h1>
                        </div>
                    </div>
                </div>

                {/* Hero Section with Background Image */}
                <section className="relative py-16 overflow-hidden">
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        {/* Fallback gradient background */}
                        <div className={`w-full h-full bg-gradient-to-br ${hero.fallbackGradient}`}></div>

                        {/* Actual hero image */}
                        {hero.backgroundImage && (
                            <div
                                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
                                style={{
                                    backgroundImage: `url(${hero.backgroundImage})`
                                }}
                            />
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-pink-600/90"></div>
                    </div>

                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div
                            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full backdrop-blur-sm"
                        />
                        <motion.div
                            animate={{ y: [0, 30, 0], rotate: [0, -5, 0] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-20 right-16 w-16 h-16 bg-yellow-400/10 rounded-full backdrop-blur-sm"
                        />
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute bottom-10 left-1/4 w-24 h-24 bg-white/5 rounded-full backdrop-blur-sm"
                        />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 container-max px-4 text-center text-white max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="inline-flex items-center px-5 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-sm font-semibold mb-6"
                            >
                                <FiFileText className="w-4 h-4 mr-2" />
                                Legal Information & Policies
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
                            >
                                {hero.title}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.8 }}
                                className="text-base md:text-lg text-white/90 mb-6 leading-relaxed"
                            >
                                {hero.subtitle}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="flex flex-col sm:flex-row items-center justify-center gap-4"
                            >
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-2">
                                    <div className="text-xs text-white/70">Last Updated</div>
                                    <div className="font-semibold text-sm">December 2024</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-2">
                                    <div className="text-xs text-white/70">Effective From</div>
                                    <div className="font-semibold text-sm">January 1, 2024</div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Terms Content */}
                <section className="pb-16">
                    <div className="container-max px-4">
                        <div className="max-w-4xl mx-auto">
                            {/* Table of Contents */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                                className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl shadow-lg p-8 mb-12 border border-blue-100"
                            >
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                        <FiFileText className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Table of Contents</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {sections.map((section, index) => (
                                        <motion.a
                                            key={section.id}
                                            href={`#${section.id}`}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05, duration: 0.5 }}
                                            viewport={{ once: true }}
                                            whileHover={{ x: 5 }}
                                            className="flex items-center space-x-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group border border-transparent hover:border-blue-200"
                                        >
                                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-600 transition-all duration-300">
                                                <section.icon className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors duration-300" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                                                    {index + 1}. {section.title}
                                                </div>
                                            </div>
                                        </motion.a>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Terms Sections */}
                            <div className="space-y-8">
                                {sections.map((section, index) => {
                                    // Alternate gradient colors for each section
                                    const gradients = [
                                        'from-blue-50 via-white to-blue-50',
                                        'from-purple-50 via-white to-purple-50',
                                        'from-pink-50 via-white to-pink-50',
                                        'from-indigo-50 via-white to-indigo-50',
                                        'from-cyan-50 via-white to-cyan-50',
                                        'from-violet-50 via-white to-violet-50',
                                        'from-fuchsia-50 via-white to-fuchsia-50',
                                        'from-rose-50 via-white to-rose-50'
                                    ]
                                    const borderColors = [
                                        'border-blue-100',
                                        'border-purple-100',
                                        'border-pink-100',
                                        'border-indigo-100',
                                        'border-cyan-100',
                                        'border-violet-100',
                                        'border-fuchsia-100',
                                        'border-rose-100'
                                    ]

                                    return (
                                        <motion.div
                                            key={section.id}
                                            id={section.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05, duration: 0.6 }}
                                            viewport={{ once: true }}
                                            whileHover={{ y: -5 }}
                                            className={`bg-gradient-to-br ${gradients[index % gradients.length]} rounded-2xl shadow-lg hover:shadow-xl p-8 border ${borderColors[index % borderColors.length]} transition-all duration-300`}
                                        >
                                            <div className="flex items-start space-x-4 mb-6">
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    whileInView={{ scale: 1 }}
                                                    transition={{ delay: index * 0.05 + 0.2, type: 'spring' }}
                                                    viewport={{ once: true }}
                                                    className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                                                >
                                                    <section.icon className="w-7 h-7 text-white" />
                                                </motion.div>
                                                <div className="flex-1">
                                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                                        {index + 1}. {section.title}
                                                    </h2>
                                                </div>
                                            </div>

                                            <div className="space-y-3 pl-18">
                                                {section.content.map((paragraph, pIndex) => (
                                                    <motion.p
                                                        key={pIndex}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        whileInView={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 + pIndex * 0.1, duration: 0.5 }}
                                                        viewport={{ once: true }}
                                                        className="text-gray-700 leading-relaxed flex items-start"
                                                    >
                                                        <span className="text-blue-500 mr-3 mt-1">•</span>
                                                        <span>{paragraph}</span>
                                                    </motion.p>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>

                            {/* Contact Information */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                                className="mt-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center relative overflow-hidden"
                            >
                                {/* Animated Background */}
                                <div className="absolute inset-0 overflow-hidden">
                                    <motion.div
                                        animate={{ y: [0, -20, 0] }}
                                        transition={{ duration: 6, repeat: Infinity }}
                                        className="absolute top-0 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl"
                                    />
                                    <motion.div
                                        animate={{ y: [0, 20, 0] }}
                                        transition={{ duration: 8, repeat: Infinity }}
                                        className="absolute bottom-0 right-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl"
                                    />
                                </div>

                                <div className="relative z-10">
                                    <motion.h2
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-2xl md:text-3xl font-bold mb-4"
                                    >
                                        Questions About Our Terms?
                                    </motion.h2>
                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-white/90 mb-6 max-w-2xl mx-auto leading-relaxed"
                                    >
                                        If you have any questions about these Terms and Conditions, please don't hesitate to contact us.
                                        We're here to help ensure you have a clear understanding of our policies.
                                    </motion.p>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="flex flex-col sm:flex-row gap-4 justify-center"
                                    >
                                        <Link id="terms-nav-contact"
                                            href="/contact"
                                            className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                                        >
                                            Contact Us
                                        </Link>
                                        <Link id="terms-nav-about"
                                            href="/about"
                                            className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                                        >
                                            Learn More About Us
                                        </Link>
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Legal Notice */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                                className="mt-8 text-center text-sm text-gray-500"
                            >
                                <p className="mb-2">
                                    These Terms and Conditions are governed by the laws of Hong Kong SAR.
                                </p>
                                <p>
                                    ProActive Sports reserves the right to update these terms with reasonable notice to all participants.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
