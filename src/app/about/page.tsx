'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { FiAward, FiUsers, FiTarget, FiHeart, FiShield, FiStar } from 'react-icons/fi'

const AboutPage = () => {
    const timeline = [
        {
            year: '2015',
            title: 'Company Founded',
            description: 'ProActive Sports was established with a vision to provide professional gymnastics training in Hong Kong.',
            image: '/images/about/timeline/2015-founding.jpg',
            fallback: 'bg-gradient-to-br from-blue-500 to-purple-600'
        },
        {
            year: '2018',
            title: 'Expansion to Wan Chai',
            description: 'Opened our second location in Wan Chai to serve more families across Hong Kong.',
            image: '/images/about/timeline/2018-expansion.jpg',
            fallback: 'bg-gradient-to-br from-green-500 to-blue-600'
        },
        {
            year: '2020',
            title: 'Growth & Recognition',
            description: 'Reached 300+ students and received Best Gymnastics School award.',
            image: '/images/about/timeline/2020-growth.jpg',
            fallback: 'bg-gradient-to-br from-purple-500 to-pink-600'
        },
        {
            year: '2023',
            title: 'Current Achievements',
            description: 'Now serving 500+ students with 15+ expert coaches across two premium locations.',
            image: '/images/about/timeline/2023-achievements.jpg',
            fallback: 'bg-gradient-to-br from-orange-500 to-red-600'
        }
    ]

    const values = [
        {
            icon: FiShield,
            title: 'Safety First',
            description: 'Our top priority is ensuring a safe training environment with proper equipment and supervision.',
            image: '/images/about/values/safety-first.jpg',
            fallback: 'bg-gradient-to-br from-green-400 to-blue-500'
        },
        {
            icon: FiStar,
            title: 'Professional Excellence',
            description: 'All our coaches are certified professionals with years of experience in gymnastics training.',
            image: '/images/about/values/professional-excellence.jpg',
            fallback: 'bg-gradient-to-br from-blue-400 to-purple-500'
        },
        {
            icon: FiUsers,
            title: 'Individual Attention',
            description: 'We maintain small class sizes to ensure each child receives personalized coaching.',
            image: '/images/about/values/individual-attention.jpg',
            fallback: 'bg-gradient-to-br from-purple-400 to-pink-500'
        },
        {
            icon: FiHeart,
            title: 'Fun Environment',
            description: 'Learning should be enjoyable! We create a positive, encouraging atmosphere for all students.',
            image: '/images/about/values/fun-environment.jpg',
            fallback: 'bg-gradient-to-br from-pink-400 to-orange-500'
        }
    ]

    const achievements = [
        { number: '500+', label: 'Happy Students' },
        { number: '15+', label: 'Expert Coaches' },
        { number: '2', label: 'Premium Locations' },
        { number: '8+', label: 'Years of Excellence' }
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-700 flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700"></div>
                    <Image
                        src="/images/pages/about-hero.jpg"
                        alt="ProActive Sports Team"
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
                        About ProActive Sports
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl max-w-2xl mx-auto"
                    >
                        Passionate about developing young athletes through professional gymnastics training
                    </motion.p>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-16 px-4">
                <div className="container-max">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Story</h2>
                        <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                            Founded in 2015, ProActive Sports has grown from a small gymnastics school to Hong Kong's
                            premier destination for youth gymnastics training. Our journey is built on passion,
                            dedication, and an unwavering commitment to excellence.
                        </p>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-12">
                        {timeline.map((item, index) => (
                            <motion.div
                                key={item.year}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.2 }}
                                className={`flex flex-col lg:flex-row items-center gap-8 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                                    }`}
                            >
                                <div className="lg:w-1/2">
                                    <div className="relative h-64 rounded-lg overflow-hidden">
                                        <div className={`w-full h-full ${item.fallback}`}></div>
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                            onError={(e) => e.currentTarget.style.display = 'none'}
                                        />
                                    </div>
                                </div>
                                <div className="lg:w-1/2">
                                    <div className="text-center lg:text-left">
                                        <div className="text-4xl font-bold text-blue-600 mb-2">{item.year}</div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-4">{item.title}</h3>
                                        <p className="text-gray-600 text-lg">{item.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Mission */}
            <section className="py-16 bg-white">
                <div className="container-max px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h2>
                        <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                            To develop physical skills, build confidence, foster teamwork, and promote a healthy
                            lifestyle through professional gymnastics training in a safe and fun environment.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {achievements.map((achievement, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg"
                            >
                                <div className="text-4xl font-bold text-blue-600 mb-2">{achievement.number}</div>
                                <div className="text-gray-600 font-medium">{achievement.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="py-16 bg-gray-50">
                <div className="container-max px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Values</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            These core values guide everything we do and shape the experience we provide to our students and families.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className="relative h-48">
                                    <div className={`w-full h-full ${value.fallback}`}></div>
                                    <Image
                                        src={value.image}
                                        alt={value.title}
                                        fill
                                        className="object-cover"
                                        onError={(e) => e.currentTarget.style.display = 'none'}
                                    />
                                    <div className="absolute inset-0 bg-black/20"></div>
                                    <div className="absolute bottom-4 left-4">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                            <value.icon className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                                    <p className="text-gray-600">{value.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-16 bg-white">
                <div className="container-max px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose ProActive Sports?</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiAward className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">Qualified Instructors</h3>
                            <p className="text-gray-600">All our coaches are certified professionals with extensive experience in gymnastics training and child development.</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiTarget className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">Proven Methodology</h3>
                            <p className="text-gray-600">Our structured curriculum is designed to develop skills progressively while building confidence and character.</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiShield className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">Safe Environment</h3>
                            <p className="text-gray-600">State-of-the-art facilities with professional equipment and comprehensive safety protocols for peace of mind.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
                <div className="container-max px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Join Our Community?</h2>
                    <p className="text-xl mb-8 opacity-90">
                        Experience the ProActive Sports difference with a free trial class.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/book-trial" className="btn-secondary">
                            Book Free Trial
                        </Link>
                        <Link href="/team" className="btn-outline border-white text-white hover:bg-white hover:text-blue-600">
                            Meet Our Team
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default AboutPage