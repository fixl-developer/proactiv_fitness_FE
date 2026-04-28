'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FiMenu, FiX, FiChevronDown, FiLogOut, FiGrid } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { authService } from '@/services/modules/auth.service'
import LogoutModal from '@/components/ui/LogoutModal'
import { useLogout } from '@/hooks/useLogout'
import { CMSService, NavMenuTreeItem } from '@/services/cmsService'

const Header = ({ hideBookAssessment = false }: { hideBookAssessment?: boolean }) => {
    const router = useRouter()
    const { showLogoutModal, unsavedPages, handleLogoutClick: triggerLogout, handleSaveAndLogout, handlePermanentLogout, closeLogoutModal } = useLogout({ redirectTo: '/login' })
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
    const [mobileDropdowns, setMobileDropdowns] = useState<{ [key: string]: boolean }>({})
    const [isLanguageOpen, setIsLanguageOpen] = useState(false)
    const [selectedLanguage, setSelectedLanguage] = useState('EN')
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [loggedInUser, setLoggedInUser] = useState<any>(null)
    const profileRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const checkAuth = () => {
            const user = authService.getStoredUser()
            const token = authService.getStoredToken()
            if (user && token) {
                setLoggedInUser(user)
            } else {
                setLoggedInUser(null)
            }
        }
        checkAuth()
        const handleStorageChange = () => checkAuth()
        window.addEventListener('storage', handleStorageChange)
        const interval = setInterval(checkAuth, 1000)
        return () => {
            window.removeEventListener('storage', handleStorageChange)
            clearInterval(interval)
        }
    }, [])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setIsProfileOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogoutClick = () => {
        setIsProfileOpen(false)
        triggerLogout()
    }

    const getDashboardPath = (userObj: any) => {
        const role = String(userObj?.role || '').toLowerCase()
        switch (role) {
            case 'admin': return '/admin/dashboard'
            case 'parent': return '/parent/dashboard'
            case 'coach': return '/coach/dashboard'
            case 'manager': return '/manager/dashboard'
            case 'staff': return '/staff/dashboard'
            default: return '/user/dashboard'
        }
    }

    const getInitials = (userObj: any) => {
        if (!userObj) return 'U'
        // Use firstName + lastName if available
        const firstName = userObj.firstName || ''
        const lastName = userObj.lastName || ''
        if (firstName && lastName) {
            return (firstName[0] + lastName[0]).toUpperCase()
        }
        // Fallback to name split
        const name = userObj.name || userObj.email || ''
        if (!name) return 'U'
        const parts = name.trim().split(' ')
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        }
        return name[0].toUpperCase()
    }

    const toggleMobileDropdown = (itemLabel: string) => {
        setMobileDropdowns(prev => ({ ...prev, [itemLabel]: !prev[itemLabel] }))
    }

    // Default navigation — used as fallback while CMS is loading or unreachable.
    // Admins manage live header items at /admin/cms/header-navigation.
    const fallbackNavigationItems: NavMenuTreeItem[] = [
        {
            label: 'ProGym Locations', href: '#', order: 1,
            dropdown: [
                { label: 'Cyberport', href: '/locations/cyberport' },
                { label: 'Wan Chai', href: '/locations/wan-chai' }
            ]
        },
        { label: 'School Gymnastics', href: '/school-gymnastics', order: 2 },
        {
            label: 'Holiday Camps', href: '#', order: 3,
            dropdown: [
                { label: 'Gymnastics Camps', href: '/camps/gymnastics' },
                { label: 'Multi-Activity Camps', href: '/camps/multi-activity' },
                { label: 'Shenzhen Competitive', href: '/camps/shenzhen-competitive' }
            ]
        },
        { label: 'Parties', href: '/birthday-parties', order: 4 },
        {
            label: 'About Us', href: '#', order: 5,
            dropdown: [
                { label: 'About', href: '/about' },
                { label: 'Careers', href: '/careers' },
                { label: 'Team', href: '/team' },
                { label: 'Blog', href: '/blog' },
                { label: 'Terms & Conditions', href: '/terms' }
            ]
        },
        { label: 'Contact Us', href: '/contact', order: 6 }
    ]

    const [navigationItems, setNavigationItems] = useState<NavMenuTreeItem[]>(fallbackNavigationItems)

    useEffect(() => {
        let cancelled = false
        CMSService.getNavMenu()
            .then(items => {
                if (cancelled) return
                if (Array.isArray(items) && items.length > 0) {
                    setNavigationItems(items)
                }
            })
            .catch(() => {
                // keep fallback silently — public website should never break on CMS hiccups
            })
        return () => { cancelled = true }
    }, [])

    const languageOptions = [
        { code: 'EN', label: 'English', flag: '\uD83C\uDDEC\uD83C\uDDE7' },
        { code: 'ZH', label: '\u4E2D\u6587', flag: '\uD83C\uDDE8\uD83C\uDDF3' },
        { code: 'HK', label: '\u7E41\u9AD4\u4E2D\u6587', flag: '\uD83C\uDDED\uD83C\uDDF0' }
    ]

    const handleLanguageSelect = (langCode: string) => {
        setSelectedLanguage(langCode)
        setIsLanguageOpen(false)
    }

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100' : 'bg-white/90 backdrop-blur-md'}`}>
            <nav className="w-full">
                <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4">
                    <motion.div className="flex items-center" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                        <Link id="header-logo-home" href="/" className="flex items-center group">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400 }}>
                                <Image src="/images/colorlogo.webp" alt="ProActive Sports" width={100} height={32} className="h-7 sm:h-9 w-auto transition-all duration-300 group-hover:brightness-110" priority />
                            </motion.div>
                        </Link>
                    </motion.div>

                    <motion.div className="hidden lg:flex items-center justify-center flex-1" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                        <div className="flex items-center space-x-1">
                            {navigationItems.map((item, index) => (
                                <motion.div key={item.label} className="relative" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }} onMouseEnter={() => item.dropdown && setActiveDropdown(item.label)} onMouseLeave={() => setActiveDropdown(null)}>
                                    <Link id={`header-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`} href={item.href} className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium text-sm transition-all duration-300 px-3 py-2 rounded-lg hover:bg-blue-50/50 relative group">
                                        <span className="relative">
                                            {item.label}
                                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                                        </span>
                                        {item.dropdown && (
                                            <motion.div animate={{ rotate: activeDropdown === item.label ? 180 : 0 }} transition={{ duration: 0.3 }}>
                                                <FiChevronDown className="w-3 h-3" />
                                            </motion.div>
                                        )}
                                    </Link>
                                    {item.dropdown && (
                                        <AnimatePresence>
                                            {activeDropdown === item.label && (
                                                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden">
                                                    {item.dropdown.map((dropdownItem, idx) => (
                                                        <motion.div key={dropdownItem.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                                                            <Link id={`header-dropdown-${dropdownItem.label.toLowerCase().replace(/\s+/g, '-')}`} href={dropdownItem.href} className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-600 transition-all duration-200 font-medium relative group">
                                                                <span className="relative z-10">{dropdownItem.label}</span>
                                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-blue-600 group-hover:h-full transition-all duration-300 rounded-r"></span>
                                                            </Link>
                                                        </motion.div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div className="hidden lg:flex items-center space-x-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                        {!hideBookAssessment && (
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link id="header-link-book-assessment" href="/book-assessment" className="relative bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center shadow-md hover:shadow-lg overflow-hidden group">
                                    <span className="relative z-10">Book Assessment</span>
                                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                                </Link>
                            </motion.div>
                        )}

                        {loggedInUser ? (
                            <div className="relative" ref={profileRef}>
                                <motion.button id="header-btn-profile-toggle" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 px-1.5 py-1.5 rounded-full hover:bg-gray-100 transition-colors">
                                    <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                                        {getInitials(loggedInUser)}
                                    </div>
                                </motion.button>
                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 z-50 overflow-hidden">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                        {getInitials(loggedInUser)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">{loggedInUser.name || 'User'}</p>
                                                        <p className="text-xs text-gray-500 truncate">{loggedInUser.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button id="header-btn-my-dashboard" onClick={() => { setIsProfileOpen(false); router.push(getDashboardPath(loggedInUser)); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                <FiGrid className="w-4 h-4 text-blue-600" />
                                                <span className="font-medium">My Dashboard</span>
                                            </button>
                                            <button id="header-btn-logout" onClick={handleLogoutClick} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                                <FiLogOut className="w-4 h-4" />
                                                <span className="font-medium">Logout</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link id="header-link-login" href="/login" className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center shadow-md hover:shadow-lg overflow-hidden group">
                                    <span className="relative z-10">Login</span>
                                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                                </Link>
                            </motion.div>
                        )}

                        <div className="relative" onMouseEnter={() => setIsLanguageOpen(true)} onMouseLeave={() => setIsLanguageOpen(false)}>
                            <motion.div className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-all duration-300 px-3 py-2 rounded-lg hover:bg-gray-100" whileHover={{ scale: 1.05 }}>
                                <div className="w-6 h-4 rounded-sm flex items-center justify-center">
                                    <span className="text-base">{languageOptions.find(lang => lang.code === selectedLanguage)?.flag}</span>
                                </div>
                                <span className="font-semibold">{selectedLanguage}</span>
                                <motion.div animate={{ rotate: isLanguageOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                                    <FiChevronDown className="w-3 h-3" />
                                </motion.div>
                            </motion.div>
                            <AnimatePresence>
                                {isLanguageOpen && (
                                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute top-full right-0 mt-2 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden">
                                        {languageOptions.map((language, index) => (
                                            <motion.button id={`header-btn-lang-${language.code.toLowerCase()}`} key={language.code} onClick={() => handleLanguageSelect(language.code)} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-200 flex items-center space-x-3 ${selectedLanguage === language.code ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}>
                                                <span className="text-lg">{language.flag}</span>
                                                <div>
                                                    <div className="font-medium">{language.code}</div>
                                                    <div className="text-xs text-gray-500">{language.label}</div>
                                                </div>
                                                {selectedLanguage === language.code && (
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                                                )}
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    <motion.button id="header-btn-mobile-menu" onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 rounded-lg hover:bg-blue-50" aria-label="Toggle menu" whileTap={{ scale: 0.9 }}>
                        <motion.div animate={{ rotate: isMenuOpen ? 90 : 0 }} transition={{ duration: 0.3 }}>
                            {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                        </motion.div>
                    </motion.button>
                </div>

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-white border-t border-gray-100 max-h-screen overflow-y-auto">
                            <div className="py-4 space-y-2">
                                {navigationItems.map((item) => (
                                    <div key={item.label}>
                                        {item.dropdown ? (
                                            <div>
                                                <button id={`header-mobile-dropdown-${item.label.toLowerCase().replace(/\s+/g, '-')}`} onClick={() => toggleMobileDropdown(item.label)} className="flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                                                    <span>{item.label}</span>
                                                    <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileDropdowns[item.label] ? 'rotate-180' : ''}`} />
                                                </button>
                                                <AnimatePresence>
                                                    {mobileDropdowns[item.label] && (
                                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pl-4 space-y-1 bg-gray-50">
                                                            {item.dropdown.map((dropdownItem) => (
                                                                <Link id={`header-mobile-nav-${dropdownItem.label.toLowerCase().replace(/\s+/g, '-')}`} key={dropdownItem.label} href={dropdownItem.href} className="block px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>
                                                                    {dropdownItem.label}
                                                                </Link>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ) : (
                                            <Link id={`header-mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`} href={item.href} className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>
                                                {item.label}
                                            </Link>
                                        )}
                                    </div>
                                ))}
                                <div className="px-4 pt-4 space-y-2">
                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="text-sm font-medium text-gray-700 mb-2">Language</div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {languageOptions.map((language) => (
                                                <button id={`header-mobile-lang-${language.code.toLowerCase()}`} key={language.code} onClick={() => handleLanguageSelect(language.code)} className={`flex items-center justify-center space-x-2 px-3 py-2 rounded text-sm transition-colors duration-200 ${selectedLanguage === language.code ? 'bg-blue-100 text-blue-600 border border-blue-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                                    <span>{language.flag}</span>
                                                    <span className="font-medium">{language.code}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {!hideBookAssessment && (
                                        <Link id="header-mobile-link-book-assessment" href="/book-assessment" className="block w-full text-center bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg" onClick={() => setIsMenuOpen(false)}>
                                            Book Assessment
                                        </Link>
                                    )}
                                    <Link id="header-mobile-link-book-trial" href="/book-trial" className="block w-full text-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg" onClick={() => setIsMenuOpen(false)}>
                                        Book a Trial
                                    </Link>
                                    <div className="border-t border-gray-200 pt-4 mt-4">
                                        {loggedInUser ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3 px-2">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                        {getInitials(loggedInUser)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{loggedInUser.name || 'User'}</p>
                                                        <p className="text-xs text-gray-500">{loggedInUser.email}</p>
                                                    </div>
                                                </div>
                                                <button id="header-mobile-btn-dashboard" onClick={() => { router.push(getDashboardPath(loggedInUser)); setIsMenuOpen(false); }} className="block w-full text-center bg-blue-50 text-blue-600 px-4 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-blue-100">
                                                    My Dashboard
                                                </button>
                                                <button id="header-mobile-btn-logout" onClick={() => { handleLogoutClick(); setIsMenuOpen(false); }} className="block w-full text-center bg-red-50 text-red-600 px-4 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-red-100">
                                                    Logout
                                                </button>
                                            </div>
                                        ) : (
                                            <Link id="header-mobile-link-login" href="/login" className="block w-full text-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg" onClick={() => setIsMenuOpen(false)}>
                                                Login
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Logout Modal */}
            <LogoutModal
                isOpen={showLogoutModal}
                onClose={closeLogoutModal}
                onSaveAndLogout={handleSaveAndLogout}
                onPermanentLogout={handlePermanentLogout}
                userName={loggedInUser?.name?.split(' ')[0] || loggedInUser?.firstName}
                unsavedPages={unsavedPages}
            />
        </header>
    )
}

export default Header
