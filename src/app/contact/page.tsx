'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiCheck } from 'react-icons/fi'
import { getRandomImage } from '@/utils/imageUtils'

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        location: '',
        message: '',
        newsletter: false
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const contactInfo = [
        {
            location: 'Cyberport Location',
            address: 'Shop 123, Cyberport 3, 100 Cyberport Road, Cyberport, Hong Kong',
            phone: '+852 2234 5678',
            email: 'cyberport@proactivsports.net',
            hours: {
                weekdays: 'Mon-Fri: 3:30PM-8:30PM',
                weekends: 'Sat-Sun: 9:00AM-6:00PM'
            },
            icon: '🏢'
        },
        {
            location: 'Wan Chai Location',
            address: 'Unit 456, Wan Chai Tower, 183 Queen\'s Road East, Wan Chai, Hong Kong',
            phone: '+852 2345 6789',
            email: 'wanchai@proactivsports.net',
            hours: {
                weekdays: 'Mon-Fri: 4:00PM-8:00PM',
                weekends: 'Sat-Sun: 9:00AM-6:00PM'
            },
            icon: '🏙️'
        }
    ]

    const inquiryTypes = [
        'General Information',
        'Class Enrollment',
        'Trial Class Booking',
        'Holiday Camps',
        'Birthday Parties',
        'Competitive Programs',
        'Pricing & Packages',
        'Facility Tour',
        'Career Opportunities',
        'Partnership Inquiry',
        'Other'
    ]

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        const checked = (e.target as HTMLInputElement).checked

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

        if (!formData.name.trim()) newErrors.name = 'Name is required'
        if (!formData.email.trim()) newErrors.email = 'Email is required'
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
        if (!formData.subject) newErrors.subject = 'Subject is required'
        if (!formData.message.trim()) newErrors.message = 'Message is required'

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)

        try {
            // TODO: Replace with actual API call
            // await apiEndpoints.submitContact(formData)

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000))

            console.log('Contact form submitted:', formData)
            setIsSubmitted(true)
        } catch (error) {
            console.error('Error submitting contact form:', error)
            // Handle error (show error message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setIsSubmitted(false)
        setFormData({
            name: '', email: '', phone: '', subject: '', location: '', message: '', newsletter: false
        })
        setErrors({})
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
                        Message Sent Successfully!
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Thank you for contacting us. We'll get back to you within 24 hours
                        during business days.
                    </p>
                    <button
                        onClick={resetForm}
                        className="btn-primary"
                    >
                        Send Another Message
                    </button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="pt-20">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white section-padding overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <Image
                        src={getRandomImage('contact us')}
                        alt="Contact Us Background"
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
                        className="max-w-4xl mx-auto text-center"
                    >
                        <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-6">
                            Get in Touch
                        </h1>
                        <p className="text-xl text-primary-100 mb-8 leading-relaxed">
                            Have questions about our programs? Want to schedule a visit?
                            We're here to help and would love to hear from you!
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Form & Info */}
            <section className="section-padding bg-gray-50">
                <div className="container-max">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="bg-white rounded-2xl shadow-xl p-8"
                            >
                                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                                    Send Us a Message
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Name & Email */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${errors.name ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="Your full name"
                                            />
                                            {errors.name && (
                                                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="your.email@example.com"
                                            />
                                            {errors.email && (
                                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Phone & Subject */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${errors.phone ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="+852 1234 5678"
                                            />
                                            {errors.phone && (
                                                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Subject *
                                            </label>
                                            <select
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${errors.subject ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                            >
                                                <option value="">Select a subject</option>
                                                {inquiryTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                            {errors.subject && (
                                                <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Preferred Location */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Preferred Location (Optional)
                                        </label>
                                        <select
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                        >
                                            <option value="">No preference</option>
                                            <option value="cyberport">Cyberport Location</option>
                                            <option value="wan-chai">Wan Chai Location</option>
                                        </select>
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Message *
                                        </label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            rows={5}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${errors.message ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Please tell us how we can help you..."
                                        />
                                        {errors.message && (
                                            <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                                        )}
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
                                                <span>Sending...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiSend className="w-5 h-5" />
                                                <span>Send Message</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        </div>

                        {/* Contact Information */}
                        <div className="lg:col-span-1">
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="space-y-6"
                            >
                                {/* Quick Contact */}
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="font-heading font-bold text-lg text-gray-900 mb-4">
                                        Quick Contact
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <FiPhone className="w-5 h-5 text-primary-600 flex-shrink-0" />
                                            <div>
                                                <div className="font-medium text-gray-900">General Inquiries</div>
                                                <a href="tel:+85212345678" className="text-primary-600 hover:text-primary-700 text-sm">
                                                    +852 1234 5678
                                                </a>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <FiMail className="w-5 h-5 text-primary-600 flex-shrink-0" />
                                            <div>
                                                <div className="font-medium text-gray-900">Email</div>
                                                <a href="mailto:info@proactivsports.net" className="text-primary-600 hover:text-primary-700 text-sm">
                                                    info@proactivsports.net
                                                </a>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <FiClock className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <div className="font-medium text-gray-900">Response Time</div>
                                                <div className="text-sm text-gray-600">Within 24 hours</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* FAQ */}
                                <div className="bg-primary-50 rounded-2xl p-6">
                                    <h3 className="font-heading font-bold text-lg text-gray-900 mb-4">
                                        Frequently Asked
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <div className="font-medium text-gray-900">What age groups do you serve?</div>
                                            <div className="text-gray-600">We offer programs for ages 2-18, from toddler classes to competitive teams.</div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">Do you offer trial classes?</div>
                                            <div className="text-gray-600">Yes! We offer free trial classes for new students to experience our programs.</div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">What should my child wear?</div>
                                            <div className="text-gray-600">Comfortable athletic clothing and bare feet or gymnastics shoes.</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Location Information */}
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
                            Visit Our Locations
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            We have two convenient locations across Hong Kong.
                            Visit us to see our facilities and meet our team!
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {contactInfo.map((location, index) => (
                            <motion.div
                                key={location.location}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2, duration: 0.6 }}
                                viewport={{ once: true }}
                                className="card p-8"
                            >
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="text-4xl">{location.icon}</div>
                                    <h3 className="text-2xl font-heading font-bold text-gray-900">
                                        {location.location}
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <FiMapPin className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <div className="font-medium text-gray-900 mb-1">Address</div>
                                            <div className="text-gray-600 text-sm">{location.address}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <FiPhone className="w-5 h-5 text-primary-600 flex-shrink-0" />
                                        <div>
                                            <div className="font-medium text-gray-900 mb-1">Phone</div>
                                            <a href={`tel:${location.phone}`} className="text-primary-600 hover:text-primary-700 text-sm">
                                                {location.phone}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <FiMail className="w-5 h-5 text-primary-600 flex-shrink-0" />
                                        <div>
                                            <div className="font-medium text-gray-900 mb-1">Email</div>
                                            <a href={`mailto:${location.email}`} className="text-primary-600 hover:text-primary-700 text-sm">
                                                {location.email}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <FiClock className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <div className="font-medium text-gray-900 mb-1">Hours</div>
                                            <div className="text-gray-600 text-sm">
                                                <div>{location.hours.weekdays}</div>
                                                <div>{location.hours.weekends}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <Link
                                        href={`/locations/${location.location.toLowerCase().includes('cyberport') ? 'cyberport' : 'wan-chai'}`}
                                        className="btn-outline w-full text-center block"
                                    >
                                        View Location Details
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-padding bg-gradient-to-r from-primary-600 to-secondary-500 text-white">
                <div className="container-max text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-heading font-bold mb-4">
                            Ready to Get Started?
                        </h2>
                        <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
                            Don't wait! Book your free trial class today and discover why
                            families across Hong Kong choose ProActive Sports for their gymnastics training.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link href="/book-trial" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
                                Book Free Trial
                            </Link>
                            <a href="tel:+85212345678" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                                Call Us Now
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}

export default ContactPage