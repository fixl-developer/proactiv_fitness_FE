'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiGift, FiUsers, FiClock, FiStar, FiHeart, FiCamera, FiMusic, FiAward } from 'react-icons/fi'
import { useCMSData } from '@/hooks/useCMSData'
import { CMSService, PartyPackageData } from '@/services/cmsService'

const PartiesPage = () => {
    // CMS-driven packages with static fallback below
    const { data: cmsPackages } = useCMSData<PartyPackageData[]>(
        () => CMSService.getPartyPackages(),
        [],
        []
    )

    const fallbackPackages = [
        {
            name: 'Basic Party Package',
            duration: '1.5 hours',
            price: 'HK$2,800',
            maxGuests: '12 children',
            ageRange: '3-12 years',
            includes: [
                '1 hour gymnastics activities',
                '30 minutes party room time',
                'Professional party host',
                'Basic decorations',
                'Party invitations',
                'Birthday child gets special gift'
            ],
            popular: false
        },
        {
            name: 'Premium Party Package',
            duration: '2 hours',
            price: 'HK$3,800',
            maxGuests: '16 children',
            ageRange: '3-15 years',
            includes: [
                '1.5 hours gymnastics activities',
                '30 minutes party room time',
                'Professional party host',
                'Themed decorations',
                'Party invitations & thank you cards',
                'Birthday child gets special gift',
                'Take-home goodie bags',
                'Professional photos'
            ],
            popular: true
        },
        {
            name: 'Deluxe Party Package',
            duration: '2.5 hours',
            price: 'HK$4,800',
            maxGuests: '20 children',
            ageRange: '4-16 years',
            includes: [
                '2 hours gymnastics activities',
                '30 minutes party room time',
                'Two professional party hosts',
                'Premium themed decorations',
                'Custom party invitations',
                'Birthday child gets premium gift',
                'Deluxe goodie bags for all',
                'Professional photo package',
                'Cake cutting ceremony',
                'Special birthday performance'
            ],
            popular: false
        }
    ]

    interface DisplayPackage {
        name: string
        duration: string
        price: string
        maxGuests: string
        ageRange: string
        includes: string[]
        popular: boolean
    }

    // Map CMS packages onto the display shape the page already renders.
    // The middle item in CMS list (or first if just one) is flagged "popular" to match the UI accent.
    const partyPackages: DisplayPackage[] = cmsPackages.length > 0
        ? cmsPackages.map((p, idx, arr) => ({
            name: p.name || '',
            duration: p.duration || '',
            price: p.price || 'Contact for pricing',
            maxGuests: typeof p.maxKids === 'number' ? `${p.maxKids} children` : 'See details',
            ageRange: 'All ages',
            includes: Array.isArray(p.features) ? p.features : [],
            popular: arr.length > 1 ? idx === Math.floor(arr.length / 2) : idx === 0,
        }))
        : fallbackPackages

    const partyThemes = [
        {
            name: 'Gymnastics Adventure',
            description: 'Classic gymnastics fun with apparatus exploration',
            icon: '🤸‍♀️',
            activities: ['Apparatus rotations', 'Skill challenges', 'Team games', 'Medal ceremony']
        },
        {
            name: 'Superhero Training',
            description: 'Train like superheroes with obstacle courses',
            icon: '🦸‍♀️',
            activities: ['Hero training course', 'Power skill challenges', 'Cape decorating', 'Hero certificates']
        },
        {
            name: 'Princess Gymnastics',
            description: 'Royal gymnastics with grace and elegance',
            icon: '👸',
            activities: ['Royal routines', 'Tiara decorating', 'Princess poses', 'Royal ceremony']
        },
        {
            name: 'Ninja Warrior',
            description: 'Ninja-themed obstacle courses and challenges',
            icon: '🥷',
            activities: ['Ninja course', 'Stealth challenges', 'Martial arts basics', 'Ninja graduation']
        },
        {
            name: 'Olympic Champions',
            description: 'Olympic-style competition and medal ceremonies',
            icon: '🏆',
            activities: ['Mini competitions', 'Podium ceremonies', 'National anthems', 'Gold medals']
        },
        {
            name: 'Animal Kingdom',
            description: 'Animal-inspired movements and games',
            icon: '🦁',
            activities: ['Animal movements', 'Jungle adventures', 'Animal masks', 'Safari games']
        }
    ]

    const partyFeatures = [
        {
            icon: FiUsers,
            title: 'Professional Hosting',
            description: 'Experienced party hosts manage everything so parents can relax and enjoy'
        },
        {
            icon: FiStar,
            title: 'Age-Appropriate Activities',
            description: 'Customized activities based on the age group and skill levels of guests'
        },
        {
            icon: FiHeart,
            title: 'Safe Environment',
            description: 'Fully supervised activities in our safe, professional gymnastics facility'
        },
        {
            icon: FiCamera,
            title: 'Memory Making',
            description: 'Professional photos and videos to capture all the special moments'
        },
        {
            icon: FiMusic,
            title: 'Fun Atmosphere',
            description: 'Upbeat music, games, and activities keep the energy high throughout'
        },
        {
            icon: FiAward,
            title: 'Special Recognition',
            description: 'Birthday child receives special attention and memorable keepsakes'
        }
    ]

    const partySchedule = [
        { time: '0-15 min', activity: 'Guest Arrival & Welcome Circle' },
        { time: '15-45 min', activity: 'Gymnastics Activities - Session 1' },
        { time: '45-60 min', activity: 'Gymnastics Activities - Session 2' },
        { time: '60-75 min', activity: 'Special Birthday Activities' },
        { time: '75-90 min', activity: 'Party Room Time & Refreshments' },
        { time: '90-105 min', activity: 'Cake Cutting & Singing' },
        { time: '105-120 min', activity: 'Gift Opening & Goodbyes' }
    ]

    const addOns = [
        { name: 'Extra 30 minutes', price: 'HK$500' },
        { name: 'Additional 5 guests', price: 'HK$400' },
        { name: 'Premium goodie bags', price: 'HK$150/child' },
        { name: 'Professional videography', price: 'HK$800' },
        { name: 'Custom cake ordering', price: 'HK$600+' },
        { name: 'Face painting', price: 'HK$600' },
        { name: 'Balloon decorations', price: 'HK$400' },
        { name: 'Take-home medals', price: 'HK$80/child' }
    ]

    return (
        <div className="pt-20">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-pink-600 to-pink-800 text-white section-padding">
                <div className="container-max">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-6">
                            Unforgettable Birthday Parties
                        </h1>
                        <p className="text-xl text-pink-100 mb-8 leading-relaxed">
                            Create magical memories with our gymnastics-themed birthday parties.
                            Professional hosting, exciting activities, and stress-free celebration for the whole family.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link id="packages" href="#packages" className="btn-secondary">
                                View Packages
                            </Link>
                            <Link id="contact" href="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-pink-600">
                                Book Your Party
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Party Features */}
            <section className="section-padding bg-white">
                <div className="container-max">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mb-4">
                            Why Choose Our Parties?
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            We handle all the details so you can focus on celebrating. Our experienced team
                            ensures every party is safe, fun, and memorable for everyone involved.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {partyFeatures.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                viewport={{ once: true }}
                                className="text-center group"
                            >
                                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-pink-600 transition-colors duration-300">
                                    <feature.icon className="w-8 h-8 text-pink-600 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <h3 className="font-heading font-semibold text-lg text-gray-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Party Packages */}
            <section id="packages" className="section-padding bg-gray-50">
                <div className="container-max">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mb-4">
                            Party Packages
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Choose from our carefully designed packages, each offering different levels
                            of activities and services to match your celebration needs.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {partyPackages.map((pkg, index) => (
                            <motion.div
                                key={pkg.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                viewport={{ once: true }}
                                className={`card p-8 relative ${pkg.popular ? 'ring-2 ring-pink-500 transform scale-105' : ''}`}
                            >
                                {pkg.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                                        {pkg.name}
                                    </h3>
                                    <div className="text-3xl font-bold text-pink-600 mb-1">
                                        {pkg.price}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {pkg.duration} • Up to {pkg.maxGuests}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Ages {pkg.ageRange}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8">
                                    {pkg.includes.map((item: string) => (
                                        <div key={item} className="flex items-start space-x-2 text-sm text-gray-600">
                                            <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link id="parties-nav-book-package"
                                    href={`/book-party?package=${encodeURIComponent(pkg.name)}`}
                                    className={`w-full text-center block ${pkg.popular ? 'btn-primary' : 'btn-outline'
                                        }`}
                                >
                                    Select Package
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Party Themes */}
            <section className="section-padding bg-white">
                <div className="container-max">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mb-4">
                            Exciting Party Themes
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Choose from our popular themes or let us create a custom theme
                            based on your child's interests and favorite characters.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {partyThemes.map((theme, index) => (
                            <motion.div
                                key={theme.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                viewport={{ once: true }}
                                className="card p-6 text-center hover:shadow-2xl transition-all duration-500"
                            >
                                <div className="text-6xl mb-4">{theme.icon}</div>
                                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">
                                    {theme.name}
                                </h3>
                                <p className="text-gray-600 mb-4 leading-relaxed">
                                    {theme.description}
                                </p>
                                <div className="space-y-2">
                                    {theme.activities.map((activity) => (
                                        <div key={activity} className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                                            <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
                                            <span>{activity}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Party Schedule */}
            <section className="section-padding bg-gray-50">
                <div className="container-max">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">
                                Typical Party Schedule
                            </h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Our parties follow a structured timeline to ensure maximum fun while
                                keeping everything organized. We handle all transitions so you can
                                enjoy the celebration with your child.
                            </p>

                            <div className="space-y-4">
                                {partySchedule.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.4 }}
                                        viewport={{ once: true }}
                                        className="flex items-center space-x-4 p-3 bg-white rounded-lg shadow-sm"
                                    >
                                        <div className="w-20 text-sm font-medium text-pink-600">
                                            {item.time}
                                        </div>
                                        <div className="text-gray-700 text-sm">
                                            {item.activity}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="bg-pink-50 rounded-2xl p-8"
                        >
                            <h3 className="text-xl font-heading font-bold text-gray-900 mb-6">
                                Add-On Options
                            </h3>

                            <div className="space-y-4">
                                {addOns.map((addon, index) => (
                                    <motion.div
                                        key={addon.name}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05, duration: 0.3 }}
                                        viewport={{ once: true }}
                                        className="flex items-center justify-between p-3 bg-white rounded-lg"
                                    >
                                        <span className="text-sm text-gray-700">{addon.name}</span>
                                        <span className="text-sm font-medium text-pink-600">{addon.price}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-6 p-4 bg-pink-100 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Custom Options Available</h4>
                                <p className="text-sm text-gray-600">
                                    Have something special in mind? We can customize decorations,
                                    activities, and themes to make your party truly unique.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Booking Info */}
            <section className="section-padding bg-white">
                <div className="container-max">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                            Ready to Book Your Party?
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                            Booking is easy! Contact us to check availability and customize your perfect party.
                            We recommend booking at least 2-3 weeks in advance, especially for weekends.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.6 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-pink-600 font-bold text-lg">1</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Choose Your Package</h3>
                            <p className="text-sm text-gray-600">Select the package that best fits your needs and budget</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-pink-600 font-bold text-lg">2</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Contact Us</h3>
                            <p className="text-sm text-gray-600">Call or email to check availability and discuss details</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-pink-600 font-bold text-lg">3</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Enjoy Your Party</h3>
                            <p className="text-sm text-gray-600">Relax and enjoy while we handle everything for you</p>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link id="contact" href="/contact" className="btn-primary">
                                Book Your Party
                            </Link>
                            <Link id="book-trial" href="/book-trial" className="btn-outline">
                                Try a Class First
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-padding bg-gradient-to-r from-pink-600 to-pink-700 text-white">
                <div className="container-max text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-heading font-bold mb-4">
                            Create Magical Birthday Memories
                        </h2>
                        <p className="text-pink-100 mb-8 max-w-2xl mx-auto">
                            Give your child the birthday party of their dreams! Our professional team
                            will create an unforgettable celebration that your family will treasure forever.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link id="contact" href="/contact" className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
                                Book Now
                            </Link>
                            <a id="parties-link-tel85212345678" href="tel:+85212345678" className="border-2 border-white text-white hover:bg-white hover:text-pink-600 px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                                Call Us Today
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}

export default PartiesPage
