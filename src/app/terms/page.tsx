'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiArrowLeft, FiShield, FiFileText, FiUsers, FiAlertCircle } from 'react-icons/fi'

export default function TermsAndConditionsPage() {
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="container-max px-4 py-6">
                    <div className="flex items-center space-x-4">
                        <Link
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
            <section className="relative py-24 overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    {/* Fallback gradient background */}
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800"></div>

                    {/* Actual hero image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: 'url(/images/pages/terms-hero.jpg)'
                        }}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
                    <div className="absolute inset-0 bg-black/30"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 container-max px-4 text-center text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        className="max-w-4xl mx-auto"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-sm font-semibold mb-8"
                        >
                            <FiFileText className="w-4 h-4 mr-2" />
                            Legal Information & Policies
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight"
                        >
                            Terms &
                            <span className="block text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text">
                                Conditions
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="text-xl sm:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed"
                        >
                            Please read these terms carefully before enrolling in our programs.
                            These conditions ensure a safe and positive experience for all participants.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8"
                        >
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3">
                                <div className="text-sm text-gray-300">Last Updated</div>
                                <div className="font-semibold">December 2024</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3">
                                <div className="text-sm text-gray-300">Effective From</div>
                                <div className="font-semibold">January 1, 2024</div>
                            </div>
                        </motion.div>

                        {/* Scroll Indicator */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.8 }}
                            className="flex justify-center"
                        >
                            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                                <div className="w-1 h-3 bg-white rounded-full mt-2 animate-bounce"></div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Floating Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            y: [0, -20, 0],
                            rotate: [0, 5, 0],
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-1/4 left-10 w-20 h-20 bg-white/5 rounded-full backdrop-blur-sm"
                    ></motion.div>
                    <motion.div
                        animate={{
                            y: [0, 30, 0],
                            rotate: [0, -5, 0],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-1/3 right-16 w-16 h-16 bg-yellow-400/10 rounded-full backdrop-blur-sm"
                    ></motion.div>
                </div>
            </section>

            {/* Terms Content */}
            <section className="pb-16">
                <div className="container-max px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Table of Contents */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="bg-white rounded-2xl shadow-lg p-8 mb-12"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Table of Contents</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {sections.map((section, index) => (
                                    <a
                                        key={section.id}
                                        href={`#${section.id}`}
                                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                                    >
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                                            <section.icon className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                                                {index + 1}. {section.title}
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </motion.div>

                        {/* Terms Sections */}
                        <div className="space-y-8">
                            {sections.map((section, index) => (
                                <motion.div
                                    key={section.id}
                                    id={section.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.8 }}
                                    viewport={{ once: true }}
                                    className="bg-white rounded-2xl shadow-lg p-8"
                                >
                                    <div className="flex items-start space-x-4 mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <section.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                                {index + 1}. {section.title}
                                            </h2>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {section.content.map((paragraph, pIndex) => (
                                            <p key={pIndex} className="text-gray-700 leading-relaxed">
                                                • {paragraph}
                                            </p>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Contact Information */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center"
                        >
                            <h2 className="text-2xl font-bold mb-4">Questions About Our Terms?</h2>
                            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                                If you have any questions about these Terms and Conditions, please don't hesitate to contact us.
                                We're here to help ensure you have a clear understanding of our policies.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/contact"
                                    className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
                                >
                                    Contact Us
                                </Link>
                                <Link
                                    href="/about"
                                    className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                                >
                                    Learn More About Us
                                </Link>
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
        </div>
    )
}