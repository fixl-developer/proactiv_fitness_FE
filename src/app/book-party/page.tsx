'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { FiUsers, FiClock, FiCalendar, FiGift, FiCamera, FiMusic, FiCheck, FiArrowRight } from 'react-icons/fi'

const BookPartyPage = () => {
    const [selectedPackage, setSelectedPackage] = useState('premium')
    const [selectedAddons, setSelectedAddons] = useState<string[]>([])
    const [formData, setFormData] = useState({
        parentName: '',
        childName: '',
        childAge: '',
        email: '',
        phone: '',
        partyDate: '',
        partyTime: '',
        numberOfChildren: '',
        location: '',
        specialRequests: ''
    })

    const packages = [
        {
            id: 'basic',
            name: 'Basic Party',
            duration: '1.5 hours',
            maxKids: 10,
            price: 800,
            coaches: 1,
            partyRoom: '30 minutes',
            features: [
                'Up to 10 children',
                '1 professional coach',
                'Basic gymnastics equipment',
                'Party room for 30 minutes',
                'Birthday child gets special recognition',
                'Basic decorations included'
            ]
        },
        {
            id: 'premium',
            name: 'Premium Party',
            duration: '2 hours',
            maxKids: 15,
            price: 1200,
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
            ]
        },
        {
            id: 'deluxe',
            name: 'Deluxe Party',
            duration: '2.5 hours',
            maxKids: 20,
            price: 1600,
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
            ]
        }
    ]

    const addons = [
        {
            id: 'photography',
            name: 'Professional Photography',
            price: 300,
            description: 'Professional photographer for the entire party with digital gallery',
            icon: FiCamera
        },
        {
            id: 'decorations',
            name: 'Custom Decorations',
            price: 200,
            description: 'Personalized theme decorations and balloon arrangements',
            icon: FiGift
        },
        {
            id: 'catering',
            name: 'Catering Service',
            price: 15,
            description: 'Per child - includes snacks, drinks, and birthday cake',
            icon: FiMusic,
            perChild: true
        }
    ]

    const selectedPackageData = packages.find(pkg => pkg.id === selectedPackage)
    const totalPrice = selectedPackageData ? selectedPackageData.price +
        selectedAddons.reduce((total, addonId) => {
            const addon = addons.find(a => a.id === addonId)
            if (addon) {
                return total + (addon.perChild ? addon.price * parseInt(formData.numberOfChildren || '0') : addon.price)
            }
            return total
        }, 0) : 0

    const handleAddonToggle = (addonId: string) => {
        setSelectedAddons(prev =>
            prev.includes(addonId)
                ? prev.filter(id => id !== addonId)
                : [...prev, addonId]
        )
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle form submission
        console.log('Party booking:', { formData, selectedPackage, selectedAddons, totalPrice })
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative h-96 bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <div className="w-full h-full bg-gradient-to-br from-pink-500 to-purple-600"></div>
                    <Image
                        src="/images/pages/book-party-hero.jpg"
                        alt="Book Birthday Party"
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
                        Book Your Party
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl max-w-2xl mx-auto"
                    >
                        Create unforgettable memories with our gymnastics birthday parties
                    </motion.p>
                </div>
            </section>

            <div className="container-max px-4 py-16">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Package Selection */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose Your Package</h2>

                            <div className="grid md:grid-cols-3 gap-6 mb-8">
                                {packages.map((pkg) => (
                                    <div
                                        key={pkg.id}
                                        className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all duration-300 ${selectedPackage === pkg.id
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 hover:border-purple-300'
                                            } ${pkg.popular ? 'ring-2 ring-purple-500' : ''}`}
                                        onClick={() => setSelectedPackage(pkg.id)}
                                    >
                                        {pkg.popular && (
                                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                                <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                    Most Popular
                                                </span>
                                            </div>
                                        )}

                                        <div className="text-center mb-4">
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">{pkg.name}</h3>
                                            <div className="text-3xl font-bold text-purple-600 mb-1">
                                                HK${pkg.price}
                                            </div>
                                            <p className="text-gray-600 text-sm">{pkg.duration}</p>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <FiUsers className="w-4 h-4 mr-2 text-purple-500" />
                                                Up to {pkg.maxKids} children
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <FiClock className="w-4 h-4 mr-2 text-purple-500" />
                                                {pkg.duration} total
                                            </div>
                                        </div>

                                        <ul className="space-y-1">
                                            {pkg.features.slice(0, 3).map((feature, idx) => (
                                                <li key={idx} className="flex items-start text-sm text-gray-600">
                                                    <FiCheck className="w-3 h-3 mr-2 mt-1 text-green-500 flex-shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            {/* Add-ons */}
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Add-On Services</h3>
                            <div className="grid md:grid-cols-3 gap-4 mb-8">
                                {addons.map((addon) => (
                                    <div
                                        key={addon.id}
                                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 ${selectedAddons.includes(addon.id)
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 hover:border-purple-300'
                                            }`}
                                        onClick={() => handleAddonToggle(addon.id)}
                                    >
                                        <div className="flex items-center mb-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                                <addon.icon className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">{addon.name}</h4>
                                                <p className="text-purple-600 font-bold text-sm">
                                                    +HK${addon.price}{addon.perChild ? ' per child' : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm">{addon.description}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Booking Form */}
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Party Details</h3>
                            <form data-testid="form-book-party" onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Parent/Guardian Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="parentName"
                                            value={formData.parentName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Birthday Child's Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="childName"
                                            value={formData.childName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Child's Age *
                                        </label>
                                        <select data-testid="select-book-party-1"
                                            name="childAge"
                                            value={formData.childAge}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select age</option>
                                            {Array.from({ length: 15 }, (_, i) => i + 3).map(age => (
                                                <option key={age} value={age}>{age} years old</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Number of Children *
                                        </label>
                                        <select data-testid="select-book-party-2"
                                            name="numberOfChildren"
                                            value={formData.numberOfChildren}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select number</option>
                                            {Array.from({ length: selectedPackageData?.maxKids || 20 }, (_, i) => i + 1).map(num => (
                                                <option key={num} value={num}>{num} children</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Preferred Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="partyDate"
                                            value={formData.partyDate}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Preferred Time *
                                        </label>
                                        <select data-testid="select-book-party-3"
                                            name="partyTime"
                                            value={formData.partyTime}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select time</option>
                                            <option value="10:00">10:00 AM</option>
                                            <option value="12:00">12:00 PM</option>
                                            <option value="14:00">2:00 PM</option>
                                            <option value="16:00">4:00 PM</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Location *
                                        </label>
                                        <select data-testid="select-book-party-4"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select location</option>
                                            <option value="cyberport">Cyberport</option>
                                            <option value="wan-chai">Wan Chai</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Special Requests or Themes
                                    </label>
                                    <textarea
                                        name="specialRequests"
                                        value={formData.specialRequests}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Any special themes, dietary requirements, or other requests..."
                                    />
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Booking Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Booking Summary</h3>

                            {selectedPackageData && (
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center pb-2 border-b">
                                        <span className="font-medium">{selectedPackageData.name}</span>
                                        <span className="font-bold">HK${selectedPackageData.price}</span>
                                    </div>

                                    {selectedAddons.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-gray-700">Add-ons:</h4>
                                            {selectedAddons.map(addonId => {
                                                const addon = addons.find(a => a.id === addonId)
                                                if (!addon) return null
                                                const price = addon.perChild ? addon.price * parseInt(formData.numberOfChildren || '0') : addon.price
                                                return (
                                                    <div key={addonId} className="flex justify-between text-sm">
                                                        <span>{addon.name}</span>
                                                        <span>HK${price}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pt-4 border-t font-bold text-lg">
                                        <span>Total:</span>
                                        <span className="text-purple-600">HK${totalPrice}</span>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center"
                            >
                                <span>Book Party Now</span>
                                <FiArrowRight className="w-5 h-5 ml-2" />
                            </button>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600 mb-2">
                                    Need help choosing?
                                </p>
                                <Link data-testid="link-contact" href="/contact" className="text-purple-600 hover:text-purple-700 font-medium">
                                    Contact us for assistance
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BookPartyPage
