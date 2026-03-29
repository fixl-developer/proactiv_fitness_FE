'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { FiUsers, FiClock, FiStar, FiGift, FiCamera, FiMusic } from 'react-icons/fi'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getRandomImage } from '@/utils/imageUtils'
import { useCMSData } from '@/hooks/useCMSData'
import { CMSService, PartyPackageData, FAQItemData } from '@/services/cmsService'

const staticPackages = [
    {
        id: 'basic',
        name: 'Basic Party',
        duration: '1.5 hours',
        maxKids: 10,
        coaches: 1,
        partyRoom: '30 minutes',
        features: [
            'Up to 10 children',
            '1 professional coach',
            'Basic gymnastics equipment',
            'Party room for 30 minutes',
            'Birthday child gets special recognition',
            'Basic decorations included'
        ],
        notIncluded: [
            'Food and drinks',
            'Photography',
            'Custom decorations'
        ]
    },
    {
        id: 'premium',
        name: 'Premium Party',
        duration: '2 hours',
        maxKids: 15,
        coaches: 2,
        partyRoom: '45 minutes',
        popular: true,
        features: [
            'Up to 15 children',
            '2 professional coaches',
            'Full equipment access',
            'Party room for 45 minutes',
            'Themed decorations included',
            'Birthday child gets medal',
            'Group photo session',
            'Party games and activities'
        ],
        notIncluded: [
            'Food and drinks',
            'Professional photography'
        ]
    },
    {
        id: 'deluxe',
        name: 'Deluxe Party',
        duration: '2.5 hours',
        maxKids: 20,
        coaches: 3,
        partyRoom: '1 hour',
        features: [
            'Up to 20 children',
            '3 professional coaches',
            'Full facility access',
            'Party room for 1 hour',
            'Premium decorations & setup',
            'Birthday child gets trophy',
            'Professional group photos',
            'Cake cutting ceremony',
            'Party favors for all children',
            'Dedicated party coordinator'
        ],
        notIncluded: [
            'Food and drinks (catering available)'
        ]
    }
]

const staticFAQs = [
    {
        question: 'How do I book a Birthday Party?',
        answer: 'Drop us a message on WhatsApp with your preferred date and time request and we will get back to you as soon as possible to help book your party.'
    },
    {
        question: 'How much does the party cost?',
        answer: 'Party pricing varies based on the package selected, number of children, and any additional services. Please contact us for a detailed quote tailored to your needs.'
    },
    {
        question: 'Where are you located?',
        answer: 'We have two locations: Cyberport and Wan Chai. Both venues are fully equipped for amazing birthday parties!'
    },
    {
        question: 'What is the minimum age to attend a party?',
        answer: 'Children from 3 years old and above can attend our birthday parties. We tailor activities to suit different age groups.'
    },
    {
        question: 'Do I need to bring my own food and drinks?',
        answer: 'Food and drinks are not included in the base package, but we offer catering services as an add-on. You\'re also welcome to bring your own refreshments.'
    },
    {
        question: 'What if I need to reschedule my party?',
        answer: 'We understand plans can change. Please contact us as soon as possible if you need to reschedule, and we\'ll do our best to accommodate your new date.'
    }
]

const BirthdayPartiesPage = () => {
    const [selectedPackage, setSelectedPackage] = useState('basic')

    const { data: dynamicPackages } = useCMSData<PartyPackageData[]>(
        () => CMSService.getPartyPackages(),
        [],
        []
    )

    const { data: dynamicFAQs } = useCMSData<FAQItemData[]>(
        () => CMSService.getFAQs('birthday-parties'),
        [],
        []
    )

    const packages = dynamicPackages.length > 0 ? dynamicPackages : staticPackages
    const faqs = dynamicFAQs.length > 0
        ? dynamicFAQs.map(f => ({ question: f.question, answer: f.answer }))
        : staticFAQs

    const addOns = [
        {
            id: 'photography',
            name: 'Professional Photography',
            description: 'Professional photographer for the entire party',
            icon: FiCamera
        },
        {
            id: 'decorations',
            name: 'Custom Decorations',
            description: 'Personalized theme decorations and setup',
            icon: FiGift
        },
        {
            id: 'catering',
            name: 'Catering Service',
            description: 'Includes snacks, drinks, and birthday cake',
            icon: FiMusic
        }
    ]

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <section className="relative h-96 bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center overflow-hidden">
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <Image
                            src="/images/pages/birthday-parties-hero.jpg"
                            alt="Birthday Parties"
                            fill
                            className="object-cover opacity-40"
                            onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                    </div>
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="relative z-10 text-center text-white px-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold mb-4"
                        >
                            Gymnastics Birthday Parties
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl max-w-2xl mx-auto"
                        >
                            Make your child's birthday unforgettable with our action-packed gymnastics parties
                        </motion.p>
                    </div>
                </section>

                {/* Let Us Organise Section */}
                <section className="py-16 px-4 bg-white">
                    <div className="container-max">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h2 className="text-3xl font-bold text-red-600 mb-6">
                                    LET US ORGANISE THE ULTIMATE PARTY!
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <p className="text-gray-700">
                                            Turn your child's birthday into an unforgettable gymnastics adventure with professional coaching, fun activities, and safe supervision.
                                        </p>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <p className="text-gray-700">
                                            Our experienced coaches will lead age-appropriate activities, games, and gymnastics skills that will keep all the children engaged and entertained.
                                        </p>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <p className="text-gray-700">
                                            We provide all equipment, decorations, and setup - you just need to bring the birthday child and their friends for an amazing celebration!
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-8">
                                    <Link id="birthday-parties-nav-contact"
                                        href="/contact"
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-colors inline-block"
                                    >
                                        ENQUIRE ABOUT BIRTHDAY PARTIES
                                    </Link>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="relative"
                            >
                                <div className="bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl p-8 text-white text-center">
                                    <div className="text-6xl mb-4">🎉</div>
                                    <h3 className="text-2xl font-bold mb-4">Happy Birthday!</h3>
                                    <p className="text-lg opacity-90">
                                        Create magical memories with our gymnastics birthday parties
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* 4 Simple Steps Section */}
                <section className="py-16 px-4 bg-gradient-to-b from-blue-50 to-white">
                    <div className="container-max">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-blue-900 mb-4">4 SIMPLE STEPS TO YOUR CHILD'S DREAM PARTY</h2>
                        </div>

                        <div className="grid md:grid-cols-4 gap-8">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-center"
                            >
                                <div className="relative mb-6">
                                    <div className="w-32 h-32 mx-auto bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg">
                                        <div className="text-center">
                                            <div className="text-4xl mb-1">🎈</div>
                                            <div className="text-sm font-bold">STEP 1</div>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-gray-300"></div>
                                </div>
                                <h3 className="font-bold text-lg mb-2">Choose Date & Time</h3>
                                <p className="text-gray-600 text-sm">Select your preferred party date and time slot</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-center"
                            >
                                <div className="relative mb-6">
                                    <div className="w-32 h-32 mx-auto bg-yellow-500 rounded-full flex items-center justify-center text-white shadow-lg">
                                        <div className="text-center">
                                            <div className="text-4xl mb-1">🎈</div>
                                            <div className="text-sm font-bold">STEP 2</div>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-gray-300"></div>
                                </div>
                                <h3 className="font-bold text-lg mb-2">Select Your Party</h3>
                                <p className="text-gray-600 text-sm">Choose the perfect package for your celebration</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-center"
                            >
                                <div className="relative mb-6">
                                    <div className="w-32 h-32 mx-auto bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg">
                                        <div className="text-center">
                                            <div className="text-4xl mb-1">🎈</div>
                                            <div className="text-sm font-bold">STEP 3</div>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-gray-300"></div>
                                </div>
                                <h3 className="font-bold text-lg mb-2">Book Your Party</h3>
                                <p className="text-gray-600 text-sm">Complete your booking and secure your date</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-center"
                            >
                                <div className="relative mb-6">
                                    <div className="w-32 h-32 mx-auto bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg">
                                        <div className="text-center">
                                            <div className="text-4xl mb-1">🎈</div>
                                            <div className="text-sm font-bold">STEP 4</div>
                                        </div>
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg mb-2">Have a Blast!</h3>
                                <p className="text-gray-600 text-sm">Enjoy an unforgettable party experience</p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Package Selection */}
                <section className="py-16 px-4">
                    <div className="container-max">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">CHOOSE YOUR PARTY!</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                All packages include professional coaching, equipment usage, and a memorable experience
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {packages.map((pkg, index) => (
                                <motion.div
                                    key={pkg.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.15, duration: 0.6 }}
                                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                    className={`relative bg-white rounded-2xl overflow-visible transition-all duration-300 ${pkg.popular
                                        ? 'ring-2 ring-purple-500 md:scale-105 shadow-2xl'
                                        : 'shadow-lg hover:shadow-2xl'
                                        }`}
                                >
                                    {pkg.popular && (
                                        <motion.div
                                            className="absolute -top-4 left-1/3 transform -translate-x-1/2 z-20"
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: index * 0.15 + 0.3, type: "spring", stiffness: 200 }}
                                        >
                                            <motion.span
                                                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg inline-block whitespace-nowrap"
                                                animate={{ y: [0, -3, 0] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                ⭐ Most Popular
                                            </motion.span>
                                        </motion.div>
                                    )}

                                    <div className="p-6 flex flex-col h-full">
                                        <div className="text-center mb-6">
                                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{pkg.name}</h3>
                                            <div className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                                                Contact for Pricing
                                            </div>
                                            <p className="text-gray-600">{pkg.duration} party</p>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <motion.div
                                                className="flex items-center text-sm text-gray-600 bg-purple-50 p-3 rounded-lg"
                                                whileHover={{ x: 4 }}
                                            >
                                                <FiUsers className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" />
                                                Up to {pkg.maxKids} children
                                            </motion.div>
                                            <motion.div
                                                className="flex items-center text-sm text-gray-600 bg-pink-50 p-3 rounded-lg"
                                                whileHover={{ x: 4 }}
                                            >
                                                <FiClock className="w-4 h-4 mr-2 text-pink-500 flex-shrink-0" />
                                                {pkg.duration} total duration
                                            </motion.div>
                                            <motion.div
                                                className="flex items-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg"
                                                whileHover={{ x: 4 }}
                                            >
                                                <FiStar className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                                                {pkg.coaches} professional coach{pkg.coaches > 1 ? 'es' : ''}
                                            </motion.div>
                                        </div>

                                        <div className="mb-6 flex-grow">
                                            <h4 className="font-semibold mb-3 text-green-600 flex items-center">
                                                <span className="text-lg mr-2">✓</span> What's Included:
                                            </h4>
                                            <ul className="text-sm text-gray-600 space-y-2">
                                                {pkg.features.map((feature, idx) => (
                                                    <motion.li
                                                        key={idx}
                                                        className="flex items-start"
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.15 + idx * 0.05 }}
                                                    >
                                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                                                        {feature}
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>

                                        {pkg.notIncluded.length > 0 && (
                                            <div className="mb-6">
                                                <h4 className="font-semibold mb-3 text-gray-500">Not Included:</h4>
                                                <ul className="text-sm text-gray-500 space-y-1">
                                                    {pkg.notIncluded.map((item, idx) => (
                                                        <li key={idx} className="flex items-start">
                                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <motion.button
                                            id={`birthday-parties-select-package-${pkg.id}-btn`}
                                            onClick={() => setSelectedPackage(pkg.id)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 mt-auto ${selectedPackage === pkg.id
                                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-purple-100 border-2 border-transparent hover:border-purple-300'
                                                }`}
                                        >
                                            {selectedPackage === pkg.id ? '✓ Selected' : 'Select Package'}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Add-Ons Section */}
                <section className="py-16 bg-white">
                    <div className="container-max px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">Enhance Your Party</h2>
                            <p className="text-gray-600">Add these optional services to make the celebration even more special</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {addOns.map((addon, index) => (
                                <motion.div
                                    key={addon.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.15, duration: 0.5 }}
                                    whileHover={{ y: -8, scale: 1.05 }}
                                    className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-100 hover:border-purple-300 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
                                >
                                    <div className="flex items-center mb-4">
                                        <motion.div
                                            className="w-14 h-14 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center mr-4 group-hover:shadow-lg"
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.6 }}
                                        >
                                            <addon.icon className="w-7 h-7 text-purple-600" />
                                        </motion.div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 group-hover:text-purple-600 transition-colors">{addon.name}</h3>
                                            <p className="text-purple-600 font-semibold text-sm">
                                                Available on Request
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">{addon.description}</p>
                                    <motion.div
                                        className="mt-4 pt-4 border-t border-purple-200 text-purple-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        initial={{ y: 10 }}
                                        whileHover={{ y: 0 }}
                                    >
                                        Learn more →
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* What to Expect */}
                <section className="py-16 bg-gray-50">
                    <div className="container-max px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">What to Expect</h2>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { icon: FiUsers, title: 'Safe Supervision', desc: 'Professional coaches ensure safety and fun for all children', color: 'purple' },
                                { icon: FiStar, title: 'Age-Appropriate Activities', desc: 'Activities tailored to the birthday child\'s age group', color: 'pink' },
                                { icon: FiGift, title: 'Special Recognition', desc: 'Birthday child receives special attention and recognition', color: 'blue' },
                                { icon: FiClock, title: 'Stress-Free Setup', desc: 'We handle all setup and cleanup - you just enjoy the party', color: 'green' }
                            ].map((item, index) => {
                                const colorMap = {
                                    purple: { bg: 'bg-purple-100', text: 'text-purple-600', hover: 'hover:bg-purple-200' },
                                    pink: { bg: 'bg-pink-100', text: 'text-pink-600', hover: 'hover:bg-pink-200' },
                                    blue: { bg: 'bg-blue-100', text: 'text-blue-600', hover: 'hover:bg-blue-200' },
                                    green: { bg: 'bg-green-100', text: 'text-green-600', hover: 'hover:bg-green-200' }
                                }
                                const colors = colorMap[item.color as keyof typeof colorMap]
                                const Icon = item.icon

                                return (
                                    <motion.div
                                        key={index}
                                        className="text-center group"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                        whileHover={{ y: -8 }}
                                    >
                                        <motion.div
                                            className={`w-20 h-20 ${colors.bg} rounded-full flex items-center justify-center mx-auto mb-4 shadow-md group-hover:shadow-lg transition-all ${colors.hover}`}
                                            whileHover={{ scale: 1.1, rotate: 10 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <Icon className={`w-10 h-10 ${colors.text}`} />
                                        </motion.div>
                                        <h3 className="font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">{item.title}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-16 px-4 bg-blue-900 text-white">
                    <div className="container-max">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">FREQUENTLY ASKED QUESTIONS</h2>
                        </div>

                        <div className="max-w-3xl mx-auto space-y-4">
                            {faqs.map((faq, index) => (
                                <details key={index} className="bg-white/10 rounded-lg p-4 cursor-pointer hover:bg-white/20 transition-colors">
                                    <summary className="font-semibold text-lg">{faq.question}</summary>
                                    <p className="mt-3 text-white/90">
                                        {faq.answer}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Booking CTA */}
                <section className="py-16 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white relative overflow-hidden">
                    {/* Animated Background */}
                    <motion.div
                        className="absolute inset-0 opacity-10"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                    </motion.div>

                    <div className="container-max px-4 text-center relative z-10">
                        <motion.h2
                            className="text-3xl md:text-4xl font-bold mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            🎉 Ready to Plan the Perfect Party?
                        </motion.h2>
                        <motion.p
                            className="text-xl mb-8 opacity-95 max-w-2xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            Book now to secure your preferred date and make your child's birthday unforgettable!
                        </motion.p>
                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link id="birthday-parties-nav-contact-2"
                                    href="/contact"
                                    className="inline-block bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl"
                                >
                                    Get Quote & Book Party
                                </Link>
                            </motion.div>
                            <motion.a
                                id="birthday-parties-whatsapp-link"
                                href="https://wa.me/85212345678"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 rounded-full font-bold text-lg transition-all"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                💬 WhatsApp Us
                            </motion.a>
                        </motion.div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}

export default BirthdayPartiesPage
