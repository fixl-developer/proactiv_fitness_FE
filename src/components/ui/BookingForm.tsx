'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiClock, FiCheck, FiX } from 'react-icons/fi'

interface BookingFormProps {
    type: 'trial' | 'assessment' | 'camp' | 'party'
    title?: string
    subtitle?: string
    onSubmit?: (data: any) => void
    className?: string
}

const BookingForm = ({
    type,
    title,
    subtitle,
    onSubmit,
    className = ''
}: BookingFormProps) => {
    const [formData, setFormData] = useState({
        parentName: '',
        childName: '',
        childAge: '',
        email: '',
        phone: '',
        program: '',
        location: '',
        preferredDate: '',
        preferredTime: '',
        experience: '',
        specialNeeds: '',
        hearAboutUs: '',
        newsletter: false,
        // Assessment specific fields
        skillLevel: '',
        assessmentType: '',
        goals: '',
        medicalInfo: '',
        // Camp specific fields
        campId: '',
        emergencyContact: '',
        emergencyPhone: '',
        // Party specific fields
        partyDate: '',
        partyTime: '',
        guestCount: '',
        partyTheme: '',
        cateringNeeds: ''
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Form configuration based on type
    const getFormConfig = () => {
        switch (type) {
            case 'trial':
                return {
                    title: title || 'Book Your Free Trial Class',
                    subtitle: subtitle || 'Experience our world-class gymnastics programs with a complimentary trial session.',
                    submitText: 'Book Free Trial',
                    successMessage: 'Trial class booked successfully!'
                }
            case 'assessment':
                return {
                    title: title || 'Book Skills Assessment',
                    subtitle: subtitle || 'Get a comprehensive evaluation of your child\'s gymnastics abilities.',
                    submitText: 'Book Assessment',
                    successMessage: 'Assessment booked successfully!'
                }
            case 'camp':
                return {
                    title: title || 'Book Holiday Camp',
                    subtitle: subtitle || 'Secure your spot in our exciting holiday gymnastics camps.',
                    submitText: 'Book Camp',
                    successMessage: 'Camp booking submitted successfully!'
                }
            case 'party':
                return {
                    title: title || 'Book Birthday Party',
                    subtitle: subtitle || 'Create an unforgettable birthday celebration with gymnastics fun.',
                    submitText: 'Book Party',
                    successMessage: 'Party booking submitted successfully!'
                }
            default:
                return {
                    title: 'Book Now',
                    subtitle: 'Complete the form below to make your booking.',
                    submitText: 'Submit Booking',
                    successMessage: 'Booking submitted successfully!'
                }
        }
    }

    const config = getFormConfig()

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

    const partyThemes = [
        'Gymnastics Adventure',
        'Superhero Training',
        'Princess Gymnastics',
        'Ninja Warrior',
        'Olympic Champions',
        'Custom Theme'
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

        // Common validations
        if (!formData.parentName.trim()) newErrors.parentName = 'Parent name is required'
        if (!formData.childName.trim()) newErrors.childName = 'Child name is required'
        if (!formData.childAge) newErrors.childAge = 'Child age is required'
        if (!formData.email.trim()) newErrors.email = 'Email is required'
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required'

        // Type-specific validations
        if (type === 'trial' || type === 'assessment') {
            if (!formData.program) newErrors.program = 'Program selection is required'
            if (!formData.location) newErrors.location = 'Location selection is required'
            if (!formData.preferredDate) newErrors.preferredDate = 'Preferred date is required'
            if (!formData.preferredTime) newErrors.preferredTime = 'Preferred time is required'
        }

        if (type === 'camp') {
            if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'Emergency contact is required'
            if (!formData.emergencyPhone.trim()) newErrors.emergencyPhone = 'Emergency phone is required'
        }

        if (type === 'party') {
            if (!formData.partyDate) newErrors.partyDate = 'Party date is required'
            if (!formData.partyTime) newErrors.partyTime = 'Party time is required'
            if (!formData.guestCount) newErrors.guestCount = 'Guest count is required'
            if (!formData.partyTheme) newErrors.partyTheme = 'Party theme is required'
        }

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
            // Call the onSubmit prop if provided, otherwise use default API call
            if (onSubmit) {
                await onSubmit(formData)
            } else {
                // TODO: Replace with actual API calls based on type
                // await apiEndpoints.bookTrial(formData) // for trial
                // await apiEndpoints.bookAssessment(formData) // for assessment
                // await apiEndpoints.bookCamp(formData) // for camp
                // await apiEndpoints.bookParty(formData) // for party

                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 2000))
                console.log(`${type} booking submitted:`, formData)
            }

            setIsSubmitted(true)
        } catch (error) {
            console.error(`Error submitting ${type} booking:`, error)
            // Handle error (show error message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setIsSubmitted(false)
        setFormData({
            parentName: '', childName: '', childAge: '', email: '', phone: '',
            program: '', location: '', preferredDate: '', preferredTime: '',
            experience: '', specialNeeds: '', hearAboutUs: '', newsletter: false,
            skillLevel: '', assessmentType: '', goals: '', medicalInfo: '',
            campId: '', emergencyContact: '', emergencyPhone: '',
            partyDate: '', partyTime: '', guestCount: '', partyTheme: '', cateringNeeds: ''
        })
        setErrors({})
    }

    if (isSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className={`bg-white rounded-2xl shadow-xl p-8 text-center ${className}`}
            >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiCheck className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                    {config.successMessage}
                </h2>
                <p className="text-gray-600 mb-6">
                    Thank you for your booking. We'll contact you within 24 hours to confirm
                    your appointment and provide additional details.
                </p>
                <button
                    onClick={resetForm}
                    className="btn-primary"
                >
                    Make Another Booking
                </button>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`bg-white rounded-2xl shadow-xl p-8 ${className}`}
        >
            <div className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                    {config.title}
                </h2>
                <p className="text-gray-600">
                    {config.subtitle}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
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

                {/* Contact Information */}
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

                {/* Type-specific fields */}
                {(type === 'trial' || type === 'assessment') && (
                    <>
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
                    </>
                )}

                {/* Camp-specific fields */}
                {type === 'camp' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Emergency Contact Name *
                            </label>
                            <input
                                type="text"
                                name="emergencyContact"
                                value={formData.emergencyContact}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${errors.emergencyContact ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Emergency contact name"
                            />
                            {errors.emergencyContact && (
                                <p className="text-red-500 text-sm mt-1">{errors.emergencyContact}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Emergency Contact Phone *
                            </label>
                            <input
                                type="tel"
                                name="emergencyPhone"
                                value={formData.emergencyPhone}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${errors.emergencyPhone ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="+852 1234 5678"
                            />
                            {errors.emergencyPhone && (
                                <p className="text-red-500 text-sm mt-1">{errors.emergencyPhone}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Party-specific fields */}
                {type === 'party' && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Party Date *
                                </label>
                                <input
                                    type="date"
                                    name="partyDate"
                                    value={formData.partyDate}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${errors.partyDate ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.partyDate && (
                                    <p className="text-red-500 text-sm mt-1">{errors.partyDate}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Party Time *
                                </label>
                                <select
                                    name="partyTime"
                                    value={formData.partyTime}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${errors.partyTime ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select time</option>
                                    {timeSlots.map(time => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                </select>
                                {errors.partyTime && (
                                    <p className="text-red-500 text-sm mt-1">{errors.partyTime}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Number of Guests *
                                </label>
                                <select
                                    name="guestCount"
                                    value={formData.guestCount}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${errors.guestCount ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select count</option>
                                    {Array.from({ length: 20 }, (_, i) => i + 5).map(count => (
                                        <option key={count} value={count}>{count} guests</option>
                                    ))}
                                </select>
                                {errors.guestCount && (
                                    <p className="text-red-500 text-sm mt-1">{errors.guestCount}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Party Theme *
                            </label>
                            <select
                                name="partyTheme"
                                value={formData.partyTheme}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${errors.partyTheme ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            >
                                <option value="">Select theme</option>
                                {partyThemes.map(theme => (
                                    <option key={theme} value={theme}>{theme}</option>
                                ))}
                            </select>
                            {errors.partyTheme && (
                                <p className="text-red-500 text-sm mt-1">{errors.partyTheme}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Catering Requirements
                            </label>
                            <textarea
                                name="cateringNeeds"
                                value={formData.cateringNeeds}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                placeholder="Any specific catering needs, dietary restrictions, or preferences..."
                            />
                        </div>
                    </>
                )}

                {/* Assessment-specific fields */}
                {type === 'assessment' && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Skill Level
                                </label>
                                <select
                                    name="skillLevel"
                                    value={formData.skillLevel || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                >
                                    <option value="">Select skill level</option>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Assessment Type
                                </label>
                                <select
                                    name="assessmentType"
                                    value={formData.assessmentType || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                >
                                    <option value="">Select assessment type</option>
                                    <option value="individual">Individual Assessment (HK$500)</option>
                                    <option value="group">Group Assessment (HK$350)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Specific Goals & Objectives
                            </label>
                            <textarea
                                name="goals"
                                value={formData.goals || ''}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                placeholder="What are your child's gymnastics goals? (e.g., improve flexibility, learn specific skills, competitive training, etc.)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Medical Considerations
                            </label>
                            <textarea
                                name="medicalInfo"
                                value={formData.medicalInfo || ''}
                                onChange={handleInputChange}
                                rows={2}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                placeholder="Any injuries, medical conditions, or physical limitations we should be aware of..."
                            />
                        </div>
                    </>
                )}

                {/* Common additional fields */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Previous Experience
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
                            <span>Submitting...</span>
                        </>
                    ) : (
                        <span>{config.submitText}</span>
                    )}
                </button>
            </form>
        </motion.div>
    )
}

export default BookingForm