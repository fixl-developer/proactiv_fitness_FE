'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FiSearch, FiChevronDown, FiUser, FiBell, FiLogOut } from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'

const BookingHeader = () => {
    const router = useRouter()
    const [selectedLanguage, setSelectedLanguage] = useState('EN')
    const [isLanguageOpen, setIsLanguageOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const { user, isAuthenticated, logout } = useAuth()

    const languageOptions = [
        { code: 'EN', label: 'English', flag: '🇬🇧' },
        { code: 'ZH', label: '中文', flag: '🇨🇳' },
        { code: 'HK', label: '繁體中文', flag: '🇭🇰' }
    ]

    const handleLanguageSelect = (langCode: string) => {
        setSelectedLanguage(langCode)
        setIsLanguageOpen(false)
    }

    const handleSectionNavigation = (section: string) => {
        const currentUrl = new URL(window.location.href)
        currentUrl.searchParams.set('section', section)
        router.push(currentUrl.pathname + currentUrl.search)
        setIsUserMenuOpen(false) // Close dropdown
    }

    const getDashboardRoute = () => {
        if (!user) return '/parent/dashboard'

        const dashboards: Record<string, string> = {
            PARENT: '/parent/dashboard',
            COACH: '/coach/dashboard',
            ADMIN: '/admin/dashboard',
            MANAGER: '/manager/dashboard'
        }

        return dashboards[user.role] || '/parent/dashboard'
    }

    return (
        <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo - Left */}
                    <div className="flex items-center">
                        {isAuthenticated ? (
                            <div className="flex items-center cursor-not-allowed">
                                <Image
                                    src="/images/colorlogo.webp"
                                    alt="ProActive Sports"
                                    width={120}
                                    height={38}
                                    className="h-9 w-auto opacity-70"
                                    priority
                                />
                            </div>
                        ) : (
                            <Link id="booking-header-link-home" href="/" className="flex items-center">
                                <Image
                                    src="/images/colorlogo.webp"
                                    alt="ProActive Sports"
                                    width={120}
                                    height={38}
                                    className="h-9 w-auto"
                                    priority
                                />
                            </Link>
                        )}
                    </div>

                    {/* Right Side - Search, Language, Notifications, User */}
                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>

                        {/* Language Selector */}
                        <div
                            className="relative"
                            onMouseEnter={() => setIsLanguageOpen(true)}
                            onMouseLeave={() => setIsLanguageOpen(false)}
                        >
                            <button id="layout-booking-header-btn" className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 px-2 py-2">
                                <div className="w-6 h-4 rounded-sm flex items-center justify-center">
                                    <span className="text-base">
                                        {languageOptions.find(lang => lang.code === selectedLanguage)?.flag}
                                    </span>
                                </div>
                                <span className="font-medium">{selectedLanguage}</span>
                                <FiChevronDown className="w-3 h-3" />
                            </button>

                            {/* Language Dropdown */}
                            {isLanguageOpen && (
                                <div className="absolute top-full right-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                                    {languageOptions.map((language) => (
                                        <button id="layout-booking-header-btn-2"
                                            key={language.code}
                                            onClick={() => handleLanguageSelect(language.code)}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 flex items-center space-x-3 ${selectedLanguage === language.code ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                                                }`}
                                        >
                                            <span className="text-base">{language.flag}</span>
                                            <div>
                                                <div className="font-medium">{language.code}</div>
                                                <div className="text-xs text-gray-500">{language.label}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Notifications */}
                        <button id="layout-booking-header-btn-3" className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors">
                            <FiBell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* User Account - Only show for PARENT role or when not authenticated */}
                        {(!isAuthenticated || (isAuthenticated && user?.role === 'PARENT')) && (
                            <div
                                className="relative"
                                onMouseEnter={() => setIsUserMenuOpen(true)}
                                onMouseLeave={() => setIsUserMenuOpen(false)}
                            >
                                <button id="layout-booking-header-btn-4" className="flex items-center space-x-3 p-2 text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-50">
                                    {isAuthenticated && user ? (
                                        <>
                                            {/* Profile Avatar with Initials */}
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                            <div className="hidden md:block text-left">
                                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
                                            </div>
                                            <FiChevronDown className="w-3 h-3" />
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                <FiUser className="w-4 h-4" />
                                            </div>
                                            <span className="hidden md:block text-sm font-medium">Sign In</span>
                                            <FiChevronDown className="w-3 h-3" />
                                        </>
                                    )}
                                </button>

                                {/* User Dropdown Menu */}
                                {isUserMenuOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                                        {isAuthenticated && user ? (
                                            <>
                                                {/* User Info Header */}
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                                            <p className="text-xs text-gray-500">{user.email}</p>
                                                            <p className="text-xs text-blue-600 capitalize font-medium">{user.role.toLowerCase()}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Menu Items for Parent */}
                                                {user.role === 'PARENT' && (
                                                    <>
                                                        <button id="layout-booking-header-btn-5"
                                                            onClick={() => handleSectionNavigation('profile')}
                                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                                                        >
                                                            <FiUser className="w-4 h-4 mr-3" />
                                                            <span>My Profile</span>
                                                        </button>
                                                        <button id="layout-booking-header-btn-6"
                                                            onClick={() => handleSectionNavigation('bookings')}
                                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                                                        >
                                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <span>My Bookings</span>
                                                        </button>
                                                        <button id="layout-booking-header-btn-7"
                                                            onClick={() => handleSectionNavigation('children')}
                                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                                                        >
                                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                            </svg>
                                                            <span>My Children</span>
                                                        </button>
                                                        <button id="layout-booking-header-btn-8"
                                                            onClick={() => handleSectionNavigation('payments')}
                                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                                                        >
                                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                            </svg>
                                                            <span>Payments</span>
                                                        </button>
                                                        <button id="layout-booking-header-btn-9"
                                                            onClick={() => handleSectionNavigation('dashboard')}
                                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                                                        >
                                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                            </svg>
                                                            <span>Dashboard</span>
                                                        </button>

                                                        <div className="border-t border-gray-100 my-2"></div>

                                                        <button id="layout-booking-header-btn-10"
                                                            onClick={() => handleSectionNavigation('settings')}
                                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                                        >
                                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            <span>Settings</span>
                                                        </button>
                                                    </>
                                                )}

                                                <button id="layout-booking-header-btn-11"
                                                    onClick={logout}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                                                >
                                                    <FiLogOut className="w-4 h-4 mr-3" />
                                                    <span>Sign Out</span>
                                                </button>
                                            </>
                                        ) : (
                                            <Link id="layout-booking-header-nav-login"
                                                href="/login"
                                                className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                                            >
                                                <FiUser className="w-4 h-4 mr-3" />
                                                <span>Sign In</span>
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default BookingHeader
