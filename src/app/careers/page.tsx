'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiMapPin, FiClock, FiUsers, FiStar, FiHeart, FiTrendingUp, FiAward, FiSend } from 'react-icons/fi'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PageHero from '@/components/sections/PageHero'

const CareersPage = () => {
    const openPositions = [
        {
            id: 1,
            title: 'Gymnastics Coach',
            location: 'Cyberport',
            type: 'Full-time',
            experience: '2+ years',
            description: 'We are seeking a passionate gymnastics coach to join our Cyberport team. The ideal candidate will have experience working with children and a strong background in gymnastics.',
            requirements: [
                'Gymnastics coaching certification (Level 2 or higher)',
                'Minimum 2 years coaching experience',
                'Experience working with children ages 3-16',
                'First Aid and CPR certification',
                'Excellent communication skills',
                'Fluent in English and Cantonese'
            ],
            responsibilities: [
                'Conduct gymnastics classes for various age groups',
                'Develop lesson plans and track student progress',
                'Ensure safety protocols are followed',
                'Communicate with parents about student development',
                'Assist with events and competitions',
                'Maintain equipment and facility cleanliness'
            ],
            benefits: [
                'Competitive salary package',
                'Professional development opportunities',
                'Health insurance coverage',
                'Paid vacation and sick leave',
                'Staff training and certification support',
                'Friendly and supportive work environment'
            ]
        },
        {
            id: 2,
            title: 'Assistant Coach',
            location: 'Wan Chai',
            type: 'Part-time',
            experience: '1+ years',
            description: 'Join our Wan Chai team as an Assistant Coach and help create positive experiences for young gymnasts while developing your coaching skills.',
            requirements: [
                'Basic gymnastics knowledge and skills',
                'Minimum 1 year experience with children',
                'Enthusiastic and energetic personality',
                'First Aid certification preferred',
                'Good communication skills',
                'Available for evening and weekend classes'
            ],
            responsibilities: [
                'Assist lead coaches during classes',
                'Help with equipment setup and safety',
                'Support student learning and development',
                'Maintain positive classroom environment',
                'Assist with birthday parties and events',
                'Help with administrative tasks as needed'
            ],
            benefits: [
                'Flexible scheduling',
                'Training and mentorship provided',
                'Opportunity for advancement',
                'Staff discounts on programs',
                'Professional development support',
                'Fun and rewarding work environment'
            ]
        },
        {
            id: 3,
            title: 'Camp Coordinator',
            location: 'Both Locations',
            type: 'Seasonal/Full-time',
            experience: '3+ years',
            description: 'Lead our holiday camp programs and create memorable experiences for children during school breaks. Perfect for someone with camp or program management experience.',
            requirements: [
                'Experience in camp or program coordination',
                'Strong organizational and leadership skills',
                'Background in child development or education',
                'Event planning and management experience',
                'Creative and innovative mindset',
                'Excellent problem-solving abilities'
            ],
            responsibilities: [
                'Plan and coordinate holiday camp programs',
                'Manage camp staff and volunteers',
                'Develop age-appropriate activities and curricula',
                'Ensure safety and quality standards',
                'Communicate with parents and handle inquiries',
                'Manage camp logistics and resources'
            ],
            benefits: [
                'Leadership role with growth potential',
                'Seasonal flexibility',
                'Creative freedom in program development',
                'Comprehensive benefits package',
                'Professional development opportunities',
                'Make a positive impact on children\'s lives'
            ]
        }
    ]

    const benefits = [
        {
            icon: FiHeart,
            title: 'Meaningful Work',
            description: 'Make a positive impact on children\'s lives through gymnastics education'
        },
        {
            icon: FiTrendingUp,
            title: 'Career Growth',
            description: 'Clear advancement paths and professional development opportunities'
        },
        {
            icon: FiAward,
            title: 'Recognition',
            description: 'Performance-based rewards and recognition programs'
        },
        {
            icon: FiUsers,
            title: 'Great Team',
            description: 'Work with passionate, supportive colleagues who share your values'
        }
    ]

    const companyValues = [
        {
            title: 'Excellence',
            description: 'We strive for the highest standards in everything we do',
            icon: '⭐'
        },
        {
            title: 'Safety First',
            description: 'Student and staff safety is our top priority',
            icon: '🛡️'
        },
        {
            title: 'Continuous Learning',
            description: 'We invest in ongoing training and development',
            icon: '📚'
        },
        {
            title: 'Fun Environment',
            description: 'We believe work should be enjoyable and rewarding',
            icon: '🎉'
        }
    ]

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50">
                {/* Page Hero */}
                <PageHero
                    title="Join Our Team"
                    subtitle="Be part of Hong Kong's premier gymnastics training center. Help us inspire the next generation of gymnasts while building your own rewarding career."
                    backgroundImage="/images/pages/careers-hero.jpg"
                    fallbackGradient="from-purple-600 to-blue-600"
                    height="large"
                />

                {/* Why Work With Us */}
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
                                Why Choose ProActive Sports?
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Join a team that values excellence, growth, and making a positive impact
                                in the lives of children and families across Hong Kong.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                            {benefits.map((benefit, index) => (
                                <motion.div
                                    key={benefit.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.6 }}
                                    viewport={{ once: true }}
                                    className="text-center group"
                                >
                                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-600 transition-colors duration-300">
                                        <benefit.icon className="w-8 h-8 text-primary-600 group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <h3 className="font-heading font-semibold text-lg text-gray-900 mb-2">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {benefit.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Company Values */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="bg-gray-50 rounded-2xl p-8 sm:p-12"
                        >
                            <h3 className="text-2xl font-heading font-bold text-gray-900 mb-8 text-center">
                                Our Values
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {companyValues.map((value, index) => (
                                    <motion.div
                                        key={value.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.6 }}
                                        viewport={{ once: true }}
                                        className="text-center"
                                    >
                                        <div className="text-4xl mb-3">{value.icon}</div>
                                        <h4 className="font-semibold text-gray-900 mb-2">{value.title}</h4>
                                        <p className="text-gray-600 text-sm">{value.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Open Positions */}
                <section id="open-positions" className="section-padding bg-gradient-to-b from-gray-50 to-white">
                    <div className="container-max">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mb-4">
                                Open Positions
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Explore our current job opportunities and find the perfect role
                                to start or advance your career in gymnastics education.
                            </p>
                        </motion.div>

                        <div className="space-y-6">
                            {openPositions.map((position, index) => (
                                <motion.div
                                    key={position.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.15, duration: 0.6 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -4, transition: { duration: 0.3 } }}
                                    className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                                >
                                    {/* Header with gradient */}
                                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 sm:p-8">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                                            <div>
                                                <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                                                    {position.title}
                                                </h3>
                                                <p className="text-blue-100 text-sm">Join our team</p>
                                            </div>
                                            <motion.div
                                                className="flex items-center space-x-2 text-blue-100"
                                                whileHover={{ x: 4 }}
                                            >
                                                <FiMapPin className="w-5 h-5 flex-shrink-0" />
                                                <span className="font-medium">{position.location}</span>
                                            </motion.div>
                                            <motion.div
                                                className="flex items-center space-x-2 text-blue-100"
                                                whileHover={{ x: 4 }}
                                            >
                                                <FiClock className="w-5 h-5 flex-shrink-0" />
                                                <span className="font-medium">{position.type}</span>
                                            </motion.div>
                                            <motion.div
                                                className="flex items-center space-x-2 text-blue-100"
                                                whileHover={{ x: 4 }}
                                            >
                                                <FiStar className="w-5 h-5 flex-shrink-0" />
                                                <span className="font-medium">{position.experience}</span>
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 sm:p-8">
                                        <p className="text-gray-700 mb-8 leading-relaxed text-base">
                                            {position.description}
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                                            {/* Requirements */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.15 + 0.1 }}
                                                viewport={{ once: true }}
                                                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200"
                                            >
                                                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                                                    <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">✓</span>
                                                    Requirements
                                                </h4>
                                                <ul className="space-y-3">
                                                    {position.requirements.map((req, idx) => (
                                                        <motion.li
                                                            key={idx}
                                                            className="flex items-start space-x-3 text-sm text-gray-700"
                                                            initial={{ opacity: 0, x: -10 }}
                                                            whileInView={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.15 + idx * 0.05 }}
                                                            viewport={{ once: true }}
                                                        >
                                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                                            <span>{req}</span>
                                                        </motion.li>
                                                    ))}
                                                </ul>
                                            </motion.div>

                                            {/* Responsibilities */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.15 + 0.2 }}
                                                viewport={{ once: true }}
                                                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200"
                                            >
                                                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                                                    <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">→</span>
                                                    Responsibilities
                                                </h4>
                                                <ul className="space-y-3">
                                                    {position.responsibilities.map((resp, idx) => (
                                                        <motion.li
                                                            key={idx}
                                                            className="flex items-start space-x-3 text-sm text-gray-700"
                                                            initial={{ opacity: 0, x: -10 }}
                                                            whileInView={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.15 + idx * 0.05 }}
                                                            viewport={{ once: true }}
                                                        >
                                                            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                                                            <span>{resp}</span>
                                                        </motion.li>
                                                    ))}
                                                </ul>
                                            </motion.div>

                                            {/* Benefits */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.15 + 0.3 }}
                                                viewport={{ once: true }}
                                                className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 border border-pink-200"
                                            >
                                                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                                                    <span className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">★</span>
                                                    Benefits
                                                </h4>
                                                <ul className="space-y-3">
                                                    {position.benefits.map((benefit, idx) => (
                                                        <motion.li
                                                            key={idx}
                                                            className="flex items-start space-x-3 text-sm text-gray-700"
                                                            initial={{ opacity: 0, x: -10 }}
                                                            whileInView={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.15 + idx * 0.05 }}
                                                            viewport={{ once: true }}
                                                        >
                                                            <div className="w-2 h-2 bg-pink-600 rounded-full mt-2 flex-shrink-0"></div>
                                                            <span>{benefit}</span>
                                                        </motion.li>
                                                    ))}
                                                </ul>
                                            </motion.div>
                                        </div>

                                        {/* Apply Button */}
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex justify-center"
                                        >
                                            <Link
                                                href="#contact"
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-xl inline-block"
                                            >
                                                Apply Now
                                            </Link>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Application Process */}
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
                                Application Process
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Our hiring process is designed to be thorough yet efficient,
                                ensuring the best fit for both candidates and our team.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {[
                                {
                                    step: '1',
                                    title: 'Submit Application',
                                    description: 'Send your resume and cover letter through our contact form or email'
                                },
                                {
                                    step: '2',
                                    title: 'Initial Review',
                                    description: 'Our HR team reviews applications and contacts qualified candidates'
                                },
                                {
                                    step: '3',
                                    title: 'Interview Process',
                                    description: 'Phone/video interview followed by in-person interview and practical demonstration'
                                },
                                {
                                    step: '4',
                                    title: 'Welcome Aboard',
                                    description: 'Background check, onboarding, and comprehensive training program'
                                }
                            ].map((step, index) => (
                                <motion.div
                                    key={step.step}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.6 }}
                                    viewport={{ once: true }}
                                    className="text-center"
                                >
                                    <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                                        {step.step}
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                                    <p className="text-gray-600 text-sm">{step.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section id="contact" className="section-padding bg-primary-600 text-white">
                    <div className="container-max">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl font-heading font-bold mb-4">
                                Ready to Apply?
                            </h2>
                            <p className="text-primary-100 max-w-2xl mx-auto">
                                We'd love to hear from you! Send us your resume and tell us why
                                you'd be a great addition to our team.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Contact Info */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                <h3 className="text-xl font-heading font-semibold mb-6">
                                    Get in Touch
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-2">Email Your Resume</h4>
                                        <a href="mailto:careers@proactivsports.net" className="text-primary-200 hover:text-white transition-colors duration-200">
                                            careers@proactivsports.net
                                        </a>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">Call Us</h4>
                                        <a href="tel:+85212345678" className="text-primary-200 hover:text-white transition-colors duration-200">
                                            +852 1234 5678
                                        </a>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">Visit Our Locations</h4>
                                        <div className="text-primary-200 text-sm">
                                            <p>Cyberport: Shop 123, Cyberport 3</p>
                                            <p>Wan Chai: Unit 456, Wan Chai Tower</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Quick Application Form */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
                            >
                                <h3 className="text-xl font-heading font-semibold mb-6">
                                    Quick Application
                                </h3>
                                <form className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                                        />
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                                    />
                                    <select className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-white/50">
                                        <option value="">Select Position</option>
                                        <option value="gymnastics-coach">Gymnastics Coach</option>
                                        <option value="assistant-coach">Assistant Coach</option>
                                        <option value="camp-coordinator">Camp Coordinator</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <textarea
                                        rows={4}
                                        placeholder="Tell us about yourself and why you're interested in joining our team..."
                                        className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full bg-secondary-500 hover:bg-secondary-600 text-white py-3 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center space-x-2"
                                    >
                                        <FiSend className="w-5 h-5" />
                                        <span>Submit Application</span>
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}

export default CareersPage
