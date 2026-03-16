'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { FiGift, FiUsers, FiClock, FiMapPin, FiStar } from 'react-icons/fi'

const BirthdayPartiesPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-16">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Birthday Parties
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Make your child's birthday unforgettable with our exciting gymnastics parties
                    </p>
                </motion.div>

                {/* Party Packages */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-lg shadow-lg p-6"
                    >
                        <div className="text-center mb-6">
                            <FiGift className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Basic Party</h3>
                            <p className="text-gray-600">Perfect for smaller celebrations</p>
                        </div>
                        <ul className="space-y-2 mb-6">
                            <li className="flex items-center text-gray-600">
                                <FiUsers className="w-4 h-4 mr-2 text-blue-600" />
                                Up to 10 children
                            </li>
                            <li className="flex items-center text-gray-600">
                                <FiClock className="w-4 h-4 mr-2 text-blue-600" />
                                90 minutes
                            </li>
                            <li className="flex items-center text-gray-600">
                                <FiMapPin className="w-4 h-4 mr-2 text-blue-600" />
                                Both locations
                            </li>
                        </ul>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 mb-4">HKD 1,200</div>
                            <Link href="/contact" className="btn-primary w-full">
                                Book Now
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-600"
                    >
                        <div className="text-center mb-6">
                            <FiStar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Party</h3>
                            <p className="text-gray-600">Most popular choice</p>
                        </div>
                        <ul className="space-y-2 mb-6">
                            <li className="flex items-center text-gray-600">
                                <FiUsers className="w-4 h-4 mr-2 text-blue-600" />
                                Up to 15 children
                            </li>
                            <li className="flex items-center text-gray-600">
                                <FiClock className="w-4 h-4 mr-2 text-blue-600" />
                                2 hours
                            </li>
                            <li className="flex items-center text-gray-600">
                                <FiMapPin className="w-4 h-4 mr-2 text-blue-600" />
                                Both locations
                            </li>
                        </ul>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 mb-4">HKD 1,800</div>
                            <Link href="/contact" className="btn-primary w-full">
                                Book Now
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-lg shadow-lg p-6"
                    >
                        <div className="text-center mb-6">
                            <FiGift className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Deluxe Party</h3>
                            <p className="text-gray-600">Ultimate birthday experience</p>
                        </div>
                        <ul className="space-y-2 mb-6">
                            <li className="flex items-center text-gray-600">
                                <FiUsers className="w-4 h-4 mr-2 text-blue-600" />
                                Up to 20 children
                            </li>
                            <li className="flex items-center text-gray-600">
                                <FiClock className="w-4 h-4 mr-2 text-blue-600" />
                                2.5 hours
                            </li>
                            <li className="flex items-center text-gray-600">
                                <FiMapPin className="w-4 h-4 mr-2 text-blue-600" />
                                Both locations
                            </li>
                        </ul>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 mb-4">HKD 2,500</div>
                            <Link href="/contact" className="btn-primary w-full">
                                Book Now
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default BirthdayPartiesPage
