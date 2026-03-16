'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FiPhone, FiMail, FiMapPin, FiFacebook, FiInstagram, FiYoutube, FiMessageCircle } from 'react-icons/fi'

const Footer = () => {
    const currentYear = new Date().getFullYear()

    const quickLinks = [
        { label: 'Home', href: '/' },
        { label: 'About Us', href: '/about' },
        { label: 'Our Team', href: '/team' },
        { label: 'Contact', href: '/contact' }
    ]

    const programs = [
        { label: 'School Gymnastics', href: '/school-gymnastics' },
        { label: 'Holiday Camps', href: '/holiday-camps' },
        { label: 'Birthday Parties', href: '/birthday-parties' },
        { label: 'Private Coaching', href: '/private-coaching' }
    ]

    const locations = [
        { label: 'Cyberport', href: '/locations/cyberport' },
        { label: 'Wan Chai', href: '/locations/wan-chai' }
    ]

    const socialLinks = [
        {
            icon: FiFacebook,
            href: 'https://facebook.com/proactivsports',
            label: 'Facebook',
            color: 'hover:text-blue-600'
        },
        {
            icon: FiInstagram,
            href: 'https://instagram.com/proactivsports',
            label: 'Instagram',
            color: 'hover:text-pink-600'
        },
        {
            icon: FiYoutube,
            href: 'https://youtube.com/proactivsports',
            label: 'YouTube',
            color: 'hover:text-red-600'
        },
        {
            icon: FiMessageCircle,
            href: 'https://wa.me/85212345678',
            label: 'WhatsApp',
            color: 'hover:text-green-600'
        }
    ]

    return (
        <footer className="bg-gray-900 text-white">
            {/* Main Footer Content */}
            <div className="container-max px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Company Info */}
                    <div className="lg:col-span-2">
                        <div className="mb-6">
                            <Image
                                src="/images/colorlogo.webp"
                                alt="ProActive Sports"
                                width={150}
                                height={40}
                                className="h-10 w-auto brightness-0 invert"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                    if (fallback) fallback.style.display = 'block'
                                }}
                            />
                            {/* Fallback text logo */}
                            <div className="hidden">
                                <h3 className="text-2xl font-bold">ProActive Sports</h3>
                            </div>
                        </div>
                        <p className="text-gray-300 mb-6 leading-relaxed">
                            Hong Kong's premier gymnastics training center, dedicated to building confidence,
                            strength, and character through professional coaching and quality programs.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <FiPhone className="w-5 h-5 text-blue-400" />
                                <a href="tel:+85212345678" className="text-gray-300 hover:text-white transition-colors duration-200">
                                    +852 1234 5678
                                </a>
                            </div>
                            <div className="flex items-center space-x-3">
                                <FiMail className="w-5 h-5 text-blue-400" />
                                <a href="mailto:info@proactivsports.net" className="text-gray-300 hover:text-white transition-colors duration-200">
                                    info@proactivsports.net
                                </a>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex space-x-4 mt-6">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 ${social.color} transition-all duration-300 hover:scale-110`}
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-300 hover:text-white transition-colors duration-200"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Programs */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6">Programs</h4>
                        <ul className="space-y-3">
                            {programs.map((program) => (
                                <li key={program.href}>
                                    <Link
                                        href={program.href}
                                        className="text-gray-300 hover:text-white transition-colors duration-200"
                                    >
                                        {program.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Locations */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6">Locations</h4>
                        <div className="space-y-6">
                            <div>
                                <h5 className="font-medium text-white mb-2">Cyberport</h5>
                                <div className="text-gray-300 text-sm space-y-1">
                                    <div className="flex items-start space-x-2">
                                        <FiMapPin className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                                        <span>Shop G01, Cyberport 1<br />100 Cyberport Road</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <FiPhone className="w-4 h-4 text-blue-400" />
                                        <a href="tel:+85222345678" className="hover:text-white transition-colors duration-200">
                                            +852 2234 5678
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h5 className="font-medium text-white mb-2">Wan Chai</h5>
                                <div className="text-gray-300 text-sm space-y-1">
                                    <div className="flex items-start space-x-2">
                                        <FiMapPin className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                                        <span>3/F, 123 Hennessy Road<br />Wan Chai</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <FiPhone className="w-4 h-4 text-blue-400" />
                                        <a href="tel:+85223456789" className="hover:text-white transition-colors duration-200">
                                            +852 2345 6789
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Newsletter Section */}
            <div className="border-t border-gray-800">
                <div className="container-max px-4 py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="mb-4 md:mb-0">
                            <h4 className="text-lg font-semibold mb-2">Stay Updated</h4>
                            <p className="text-gray-300 text-sm">
                                Subscribe to our newsletter for the latest news and updates.
                            </p>
                        </div>
                        <div className="flex w-full md:w-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 md:w-64 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                            />
                            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-r-lg font-semibold transition-colors duration-300">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-gray-800">
                <div className="container-max px-4 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
                        <div className="mb-4 md:mb-0">
                            <p>&copy; {currentYear} ProActive Sports. All rights reserved.</p>
                        </div>
                        <div className="flex space-x-6">
                            <Link href="/privacy" className="hover:text-white transition-colors duration-200">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="hover:text-white transition-colors duration-200">
                                Terms of Service
                            </Link>
                            <Link href="/careers" className="hover:text-white transition-colors duration-200">
                                Careers
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer