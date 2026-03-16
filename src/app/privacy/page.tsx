'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiArrowLeft, FiShield, FiEye, FiLock, FiDatabase, FiMail } from 'react-icons/fi'

export default function PrivacyPolicyPage() {
    const sections = [
        {
            id: 'information-collection',
            title: 'Information We Collect',
            icon: FiDatabase,
            content: [
                'Personal information including names, contact details, and emergency contacts',
                'Medical information relevant to safe participation in gymnastics programs',
                'Payment and billing information for program fees and services',
                'Photos and videos taken during classes and events (with consent)',
                'Website usage data and cookies for improving user experience'
            ]
        },
        {
            id: 'information-use',
            title: 'How We Use Your Information',
            icon: FiEye,
            content: [
                'Program administration and class scheduling',
                'Emergency contact and medical safety purposes',
                'Payment processing and account management',
                'Communication about programs, events, and important updates',
                'Marketing and promotional activities (with your consent)',
                'Improving our services and facilities'
            ]
        },
        {
            id: 'information-sharing',
            title: 'Information Sharing',
            icon: FiMail,
            content: [
                'We do not sell, trade, or rent your personal information to third parties',
                'Information may be shared with authorized staff for program delivery',
                'Emergency contacts will be used only in case of medical emergencies',
                'We may share information when required by law or legal process',
                'Service providers (payment processors) may access relevant information under strict confidentiality'
            ]
        },
        {
            id: 'data-security',
            title: 'Data Security',
            icon: FiLock,
            content: [
                'We implement appropriate security measures to protect your information',
                'Physical files are stored in locked, secure locations',
                'Digital information is protected with encryption and secure systems',
                'Access to personal information is limited to authorized personnel only',
                'Regular security reviews and updates are conducted'
            ]
        },
        {
            id: 'your-rights',
            title: 'Your Privacy Rights',
            icon: FiShield,
            content: [
                'Right to access your personal information we hold',
                'Right to request correction of inaccurate information',
                'Right to request deletion of your information (subject to legal requirements)',
                'Right to opt-out of marketing communications',
                'Right to withdraw consent for photos/videos use',
                'Right to file a complaint with privacy authorities'
            ]
        },
        {
            id: 'cookies',
            title: 'Cookies and Website Data',
            icon: FiDatabase,
            content: [
                'We use cookies to improve website functionality and user experience',
                'Analytics cookies help us understand how visitors use our website',
                'You can control cookie settings through your browser preferences',
                'Some website features may not work properly if cookies are disabled'
            ]
        },
        {
            id: 'children-privacy',
            title: 'Children\'s Privacy',
            icon: FiShield,
            content: [
                'We take special care with information about children under 18',
                'Parent/guardian consent is required for all data collection',
                'Children\'s information is used only for program participation and safety',
                'Photos/videos of children require explicit parental consent',
                'Parents have the right to review and request deletion of their child\'s information'
            ]
        },
        {
            id: 'updates',
            title: 'Policy Updates',
            icon: FiEye,
            content: [
                'This privacy policy may be updated from time to time',
                'Significant changes will be communicated to all participants',
                'Continued use of our services constitutes acceptance of updates',
                'You can always access the current version on our website'
            ]
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-blue-50/30">
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
                        <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
                    </div>
                </div>
            </div>

            {/* Hero Section with Background Image */}
            <section className="relative py-24 overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    {/* Fallback gradient background */}
                    <div className="w-full h-full bg-gradient-to-br from-green-600 via-blue-600 to-purple-800"></div>

                    {/* Actual hero image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: 'url(/images/pages/privacy-hero.jpg)'
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
                            <FiShield className="w-4 h-4 mr-2" />
                            Privacy Protection & Data Security
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight"
                        >
                            Privacy
                            <span className="block text-transparent bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text">
                                Policy
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="text-xl sm:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed"
                        >
                            Your privacy is important to us. This policy explains how we collect, use,
                            and protect your personal information when you use our services.
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
                        className="absolute top-1/3 right-16 w-16 h-16 bg-green-400/10 rounded-full backdrop-blur-sm"
                    ></motion.div>
                </div>
            </section>

            {/* Privacy Content */}
            <section className="pb-16">
                <div className="container-max px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Quick Summary */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="bg-white rounded-2xl shadow-lg p-8 mb-12"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy at a Glance</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <FiShield className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">We Protect</h3>
                                    <p className="text-sm text-gray-600">Your personal information is secured with industry-standard protection</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <FiEye className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">We're Transparent</h3>
                                    <p className="text-sm text-gray-600">Clear information about what we collect and how we use it</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <FiLock className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">You Control</h3>
                                    <p className="text-sm text-gray-600">You have rights over your information and how it's used</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Privacy Sections */}
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
                                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <section.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                                {section.title}
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
                            className="mt-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white text-center"
                        >
                            <h2 className="text-2xl font-bold mb-4">Privacy Questions or Concerns?</h2>
                            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
                                If you have any questions about this Privacy Policy or how we handle your information,
                                please contact us. We're committed to protecting your privacy.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/contact"
                                    className="bg-white text-green-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
                                >
                                    Contact Privacy Officer
                                </Link>
                                <Link
                                    href="/terms"
                                    className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                                >
                                    View Terms & Conditions
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
                                This Privacy Policy complies with the Personal Data (Privacy) Ordinance of Hong Kong SAR.
                            </p>
                            <p>
                                For questions about your privacy rights, you may contact the Privacy Commissioner for Personal Data, Hong Kong.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    )
}
