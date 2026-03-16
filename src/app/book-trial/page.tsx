'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiClock, FiCheck } from 'react-icons/fi'
import { getRandomImage } from '@/utils/imageUtils'

const BookTrialPage = () => {
    const [formData, setFormData] = useState({
        parentName: '',
        childName: '',
        childAge: '',
        childGender: '',
        email: '',
        phone: '',
        program: '',
        location: '',
        preferredDate: '',
        preferredTime: '',
        experience: '',
        specialNeeds: '',
        hearAboutUs: '',
        newsletter: false
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const programs = [
        { value: 'beginner', label: 'Beginner (3-6 years)' },
        { value: 'intermediate', label: 'Intermediate (7-10 years)' },
        { value: 'advanced', label: 'Advanced (11-16 years)' },
        { value: 'competitive', label: 'Competitive (8+ years)' }
    ]

    const locations = [
        { value: 'cyberport', label: 'Cyberport Location' },
        { value: 'wan-chai', label: 'Wan Chai Location' }
    ]

    const timeSlots = [
        '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'
    ]

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const target = e.target as HTMLInputElement
        const { name, value, type } = target
        const checked = target.checked
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.parentName.trim()) newErrors.parentName = 'Parent name is required'
        if (!formData.childName.trim()) newErrors.childName = 'Child name is required'
        if (!formData.childAge) newErrors.childAge = 'Child age is required'
        if (!formData.email.trim()) newErrors.email = 'Email is required'
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
        if (!formData.program) newErrors.program = 'Program selection is required'
        if (!formData.location) newErrors.location = 'Location selection is required'
        if (!formData.preferredDate) newErrors.preferredDate = 'Preferred date is required'
        if (!formData.preferredTime) newErrors.preferredTime = 'Preferred time is required'

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address'
        }

        // Phone validation
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/
        if (formData.phone && !phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)

        try {
            const payload = {
                program: formData.program,
                childName: formData.childName,
                childAge: parseInt(formData.childAge),
                childGender: formData.childGender || 'Prefer not to say',
                location: formData.location,
                date: formData.preferredDate,
                timeSlot: formData.preferredTime,
                parentName: formData.parentName,
                parentEmail: formData.email,
                parentPhone: formData.phone
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/bookings/trial`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            })

            const result = await response.json()

            if (result.success) {
                console.log('Trial booking submitted:', result)
                setIsSubmitted(true)
            } else {
                setErrors({ general: result.message || 'Failed to book trial. Please try again.' })
            }
        } catch (error) {
            console.error('Error submitting trial booking:', error)
            setErrors({ general: 'Network error. Please try again.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="pt-20 min-h-screen flex items-center justify-center bg-gray-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-xl p-8"
                >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiCheck className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                        Trial Booked Successfully!
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Thank you for booking a trial class. We'll contact you within 24 hours to confirm
                        your appointment and provide additional details.
                    </p>
                    <button
                        onClick={() => {
                            setIsSubmitted(false)
                            setFormData({
                                parentName: '', childName: '', childAge: '', childGender: '', email: '', phone: '',
                                program: '', location: '', preferredDate: '', preferredTime: '',
                                experience: '', specialNeeds: '', hearAboutUs: '', newsletter: false
                            })
                        }}
                        className="btn-primary"
                    >
                        Book Another Trial
                    </button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="pt-20 min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 overflow-hidden relative">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <Image
                        src={getRandomImage('book trial class')}
                        alt="Book Trial Class Background"
                        fill
                        className="object-cover opacity-20"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                </div>

                <div className="container-max relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-3xl mx-auto text-center"
                    >
                        <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-6">
                            Book Your Free Trial Class
                        </h1>
                        <p className="text-xl text-primary-100 leading-relaxed">
                            Experience our world-class gymnastics programs with a complimentary trial session.
                            No commitment required – just come and see what we're all about!
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Form Section */}
            <section className="section-padding">
                <div className="container-max max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Form */}
                        <div className="lg:col-span-2">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="bg-white rounded-2xl shadow-xl p-8"
                            >
                                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                                    Trial Class Information
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Parent & Child Info */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Parent/Guardian Name *
                                            </label>
                                            <div className="relative">
                                                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="text"
                                                    name="parentName"
                                                    value={formData.parentName}
                                                    onChange={handleInputChange}
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${errors.parentName ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    placeholder="Your full name"
                                                />
                                            </div>
                                            {errors.parentName && (
                                                <p className="text-red-500 text-sm mt-1">{errors.parentName}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Child's Name *
                                            </label>
                                            <div className="relative">
                                                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="text"
                                                    name="childName"
                                                    value={formData.childName}
                                                    onChange={handleInputChange}
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${errors.childName ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    placeholder="Child's full name"
                                                />
                                            </div>
                                            {errors.childName && (
                                                <p className="text-red-500 text-sm mt-1">{errors.childName}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Child's Age *
                                            </label>
                                            <select
                                                name="childAge"
                                                value={formData.childAge}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${errors.childAge ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                            >
                                                <option value="">Select age</option>
                                                {Array.from({ length: 15 }, (_, i) => i + 3).map(age => (
                                                    <option key={age} value={age}>{age} years old</option>
                                                ))}
                                            </select>
                                            {errors.childAge && (
                                                <p className="text-red-500 text-sm mt-1">{errors.childAge}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address *
                                            </label>
                                            <div className="relative">
                                                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    placeholder="your.email@example.com"
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number *
                                        </label>
                                        <div className="relative">
                                            <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${errors.phone ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="+852 1234 5678"
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                                        )}
                                    </div>

                                    {/* Program & Location */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Program Level *
                                            </label>
                                            <select
                                                name="program"
                                                value={formData.program}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${errors.program ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                            >
                                                <option value="">Select program</option>
                                                {programs.map(program => (
                                                    <option key={program.value} value={program.value}>
                                                        {program.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.program && (
                                                <p className="text-red-500 text-sm mt-1">{errors.program}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Preferred Location *
                                            </label>
                                            <div className="relative">
                                                <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <select
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleInputChange}
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${errors.location ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                >
                                                    <option value="">Select location</option>
                                                    {locations.map(location => (
                                                        <option key={location.value} value={location.value}>
                                                            {location.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {errors.location && (
                                                <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Date & Time */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Preferred Date *
                                            </label>
                                            <div className="relative">
                                                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="date"
                                                    name="preferredDate"
                                                    value={formData.preferredDate}
                                                    onChange={handleInputChange}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${errors.preferredDate ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                />
                                            </div>
                                            {errors.preferredDate && (
                                                <p className="text-red-500 text-sm mt-1">{errors.preferredDate}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Preferred Time *
                                            </label>
                                            <div className="relative">
                                                <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <select
                                                    name="preferredTime"
                                                    value={formData.preferredTime}
                                                    onChange={handleInputChange}
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${errors.preferredTime ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                >
                                                    <option value="">Select time</option>
                                                    {timeSlots.map(time => (
                                                        <option key={time} value={time}>{time}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {errors.preferredTime && (
                                                <p className="text-red-500 text-sm mt-1">{errors.preferredTime}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Previous Gymnastics Experience
                                        </label>
                                        <textarea
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                            placeholder="Please describe any previous gymnastics or sports experience..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Special Needs or Considerations
                                        </label>
                                        <textarea
                                            name="specialNeeds"
                                            value={formData.specialNeeds}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                            placeholder="Any medical conditions, allergies, or special requirements we should know about..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            How did you hear about us?
                                        </label>
                                        <select
                                            name="hearAboutUs"
                                            value={formData.hearAboutUs}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                        >
                                            <option value="">Please select</option>
                                            <option value="google">Google Search</option>
                                            <option value="facebook">Facebook</option>
                                            <option value="instagram">Instagram</option>
                                            <option value="friend">Friend/Family Referral</option>
                                            <option value="school">School Recommendation</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    {/* Newsletter */}
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            name="newsletter"
                                            checked={formData.newsletter}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                        />
                                        <label className="text-sm text-gray-700">
                                            Subscribe to our newsletter for updates and special offers
                                        </label>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="spinner w-5 h-5"></div>
                                                <span>Booking Trial...</span>
                                            </>
                                        ) : (
                                            <span>Book Free Trial</span>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="space-y-6"
                            >
                                {/* What to Expect */}
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="font-heading font-bold text-lg text-gray-900 mb-4">
                                        What to Expect
                                    </h3>
                                    <ul className="space-y-3 text-sm text-gray-600">
                                        <li className="flex items-start space-x-2">
                                            <FiCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>45-60 minute trial session</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FiCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>Meet our certified coaches</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FiCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>Experience our teaching methods</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FiCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>Tour our facilities</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FiCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>No commitment required</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* What to Bring */}
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="font-heading font-bold text-lg text-gray-900 mb-4">
                                        What to Bring
                                    </h3>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li>• Comfortable athletic clothing</li>
                                        <li>• Hair tied back (if long)</li>
                                        <li>• Water bottle</li>
                                        <li>• Bare feet or gymnastics shoes</li>
                                        <li>• Positive attitude!</li>
                                    </ul>
                                </div>

                                {/* Contact Info */}
                                <div className="bg-primary-50 rounded-2xl p-6">
                                    <h3 className="font-heading font-bold text-lg text-gray-900 mb-4">
                                        Questions?
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Our team is here to help! Contact us if you have any questions about the trial class.
                                    </p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center space-x-2 text-gray-600">
                                            <FiPhone className="w-4 h-4 text-primary-600" />
                                            <span>+852 1234 5678</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-gray-600">
                                            <FiMail className="w-4 h-4 text-primary-600" />
                                            <span>info@proactivsports.net</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default BookTrialPage