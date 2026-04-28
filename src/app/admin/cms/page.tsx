'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Image, Star, Layers, MessageSquare, Users, Info, Zap,
    ClipboardList, BookOpen, PartyPopper, GraduationCap, Tent,
    MapPin, FileText, Briefcase, Phone, HelpCircle, BarChart3,
    Database, RefreshCw, Loader2, CheckCircle, AlertTriangle,
    Menu as MenuIcon, Globe, Shield, Calendar, UserCheck, Mountain, Users2,
} from 'lucide-react'
import { toast } from 'sonner'
import { CMSAdminService } from '@/services/cmsService'

// Header navigation pages — names match exactly what admins see in the public site header
// so there's no confusion when locating a page to edit.
const headerPageModules = [
    { title: 'Header Navigation', description: 'Manage the items shown in the top header (ProGym Locations, About Us dropdown, etc.)', icon: MenuIcon, href: '/admin/cms/header-navigation', color: 'from-slate-600 to-gray-800', group: 'header' },
    { title: 'Cyberport', description: 'Edit the Cyberport location page hero & SEO', icon: MapPin, href: '/admin/cms/pages/cyberport', color: 'from-blue-500 to-cyan-500', group: 'header' },
    { title: 'Wan Chai', description: 'Edit the Wan Chai location page hero & SEO', icon: MapPin, href: '/admin/cms/pages/wan-chai', color: 'from-emerald-500 to-teal-500', group: 'header' },
    { title: 'School Gymnastics', description: 'Edit the School Gymnastics page hero & SEO', icon: GraduationCap, href: '/admin/cms/pages/school-gymnastics', color: 'from-blue-600 to-purple-600', group: 'header' },
    { title: 'Gymnastics Camps', description: 'Edit the Gymnastics Camps page hero & SEO', icon: Tent, href: '/admin/cms/pages/gymnastics-camps', color: 'from-orange-500 to-red-500', group: 'header' },
    { title: 'Multi-Activity Camps', description: 'Edit the Multi-Activity Camps page hero & SEO', icon: Mountain, href: '/admin/cms/pages/multi-activity-camps', color: 'from-purple-500 to-pink-500', group: 'header' },
    { title: 'Shenzhen Competitive', description: 'Edit the Shenzhen Competitive page hero & SEO', icon: Shield, href: '/admin/cms/pages/shenzhen-competitive', color: 'from-rose-600 to-red-700', group: 'header' },
    { title: 'Parties', description: 'Edit the Birthday Parties page hero & SEO', icon: PartyPopper, href: '/admin/cms/pages/parties', color: 'from-pink-500 to-rose-500', group: 'header' },
    { title: 'About', description: 'Edit the About page hero & SEO', icon: Info, href: '/admin/cms/pages/about', color: 'from-sky-600 to-blue-700', group: 'header' },
    { title: 'Careers', description: 'Edit the Careers page hero & SEO', icon: Briefcase, href: '/admin/cms/pages/careers', color: 'from-gray-700 to-gray-900', group: 'header' },
    { title: 'Team', description: 'Edit the Team page hero & SEO', icon: Users2, href: '/admin/cms/pages/team', color: 'from-indigo-600 to-purple-700', group: 'header' },
    { title: 'Blog', description: 'Edit the Blog page hero & SEO', icon: FileText, href: '/admin/cms/pages/blog', color: 'from-cyan-600 to-blue-700', group: 'header' },
    { title: 'Terms & Conditions', description: 'Edit the Terms & Conditions page hero & content', icon: FileText, href: '/admin/cms/pages/terms', color: 'from-slate-600 to-slate-900', group: 'header' },
    { title: 'Contact Us', description: 'Edit the Contact page hero & SEO', icon: Phone, href: '/admin/cms/pages/contact', color: 'from-emerald-600 to-green-700', group: 'header' },
]

const cmsModules = [
    {
        title: 'Hero Slides',
        description: 'Manage landing page hero carousel images and text',
        icon: Image,
        href: '/admin/cms/hero-slides',
        color: 'from-blue-500 to-cyan-500',
        count: 'Slides'
    },
    {
        title: 'Site Statistics',
        description: 'Manage counters shown on landing page (Students, Years, Locations)',
        icon: BarChart3,
        href: '/admin/cms/stats',
        color: 'from-green-500 to-emerald-500',
        count: 'Stats'
    },
    {
        title: 'Services',
        description: 'Manage service cards (Gymnastics, Camps, Coaching, Parties)',
        icon: Layers,
        href: '/admin/cms/services',
        color: 'from-purple-500 to-pink-500',
        count: 'Services'
    },
    {
        title: 'Testimonials',
        description: 'Manage customer reviews and testimonials',
        icon: MessageSquare,
        href: '/admin/cms/testimonials',
        color: 'from-orange-500 to-red-500',
        count: 'Reviews'
    },
    {
        title: 'Client Partners',
        description: 'Manage partner/school logos shown on landing page',
        icon: Users,
        href: '/admin/cms/partners',
        color: 'from-teal-500 to-cyan-500',
        count: 'Partners'
    },
    {
        title: 'AI Features',
        description: 'Manage AI-powered features section on landing page',
        icon: Zap,
        href: '/admin/cms/ai-features',
        color: 'from-violet-500 to-purple-500',
        count: 'Features'
    },
    {
        title: 'Assessments',
        description: 'Manage assessment listings (FREE assessments for booking)',
        icon: ClipboardList,
        href: '/admin/cms/assessments',
        color: 'from-red-500 to-pink-500',
        count: 'Assessments'
    },
    {
        title: 'Class Sessions',
        description: 'Manage class listings (paid classes for booking)',
        icon: BookOpen,
        href: '/admin/cms/classes',
        color: 'from-blue-600 to-indigo-600',
        count: 'Classes'
    },
    {
        title: 'Party Packages',
        description: 'Manage birthday party packages and pricing',
        icon: PartyPopper,
        href: '/admin/cms/party-packages',
        color: 'from-pink-500 to-rose-500',
        count: 'Packages'
    },
    {
        title: 'Program Levels',
        description: 'Manage gymnastics program levels and schedules',
        icon: GraduationCap,
        href: '/admin/cms/programs',
        color: 'from-amber-500 to-orange-500',
        count: 'Programs'
    },
    {
        title: 'Camp Programs',
        description: 'Manage holiday camp programs and activities',
        icon: Tent,
        href: '/admin/cms/camps',
        color: 'from-green-600 to-teal-600',
        count: 'Camps'
    },
    {
        title: 'Location Details',
        description: 'Manage location pages (Cyberport, Wan Chai) - facilities, schedules, team',
        icon: MapPin,
        href: '/admin/cms/locations',
        color: 'from-indigo-500 to-blue-500',
        count: 'Locations'
    },
    {
        title: 'Blog Posts',
        description: 'Create and manage blog articles',
        icon: FileText,
        href: '/admin/cms/blog',
        color: 'from-cyan-500 to-blue-500',
        count: 'Posts'
    },
    {
        title: 'Job Positions',
        description: 'Manage careers page - job listings and requirements',
        icon: Briefcase,
        href: '/admin/cms/careers',
        color: 'from-gray-600 to-gray-800',
        count: 'Jobs'
    },
    {
        title: 'About Page',
        description: 'Manage about page content - mission, vision, values, history',
        icon: Info,
        href: '/admin/cms/about',
        color: 'from-sky-500 to-blue-500',
        count: 'Content'
    },
    {
        title: 'Contact Info',
        description: 'Manage contact details - phone, email, address, hours',
        icon: Phone,
        href: '/admin/cms/contact',
        color: 'from-emerald-500 to-green-500',
        count: 'Info'
    },
    {
        title: 'FAQs',
        description: 'Manage frequently asked questions by category',
        icon: HelpCircle,
        href: '/admin/cms/faqs',
        color: 'from-yellow-500 to-amber-500',
        count: 'FAQs'
    },
    {
        title: 'Team Members',
        description: 'Manage coach profiles shown on the public Team page',
        icon: Users2,
        href: '/admin/cms/team',
        color: 'from-indigo-500 to-purple-500',
        count: 'Members'
    },
]

export default function AdminCMSPage() {
    const [seeding, setSeeding] = useState(false)
    const [resetting, setResetting] = useState(false)
    const [seedResult, setSeedResult] = useState<{ seeded: string[]; skipped: string[] } | null>(null)
    const [showResetConfirm, setShowResetConfirm] = useState(false)

    const handleSeedData = async () => {
        try {
            setSeeding(true)
            setSeedResult(null)
            const result = await CMSAdminService.seedDefaultData()
            setSeedResult(result)
            toast.success('Default data seeded successfully')
        } catch (error) {
            console.error('Seed failed:', error)
            toast.error('Failed to seed data. Please check if the backend is running.')
        } finally {
            setSeeding(false)
        }
    }

    const handleResetAndSeed = async () => {
        try {
            setResetting(true)
            setSeedResult(null)
            setShowResetConfirm(false)
            const result = await CMSAdminService.resetAndSeedData()
            setSeedResult({ seeded: result.seeded, skipped: result.skipped })
            toast.success('Data reset and re-seeded successfully')
        } catch (error) {
            console.error('Reset failed:', error)
            toast.error('Failed to reset and seed data.')
        } finally {
            setResetting(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
                    <p className="text-gray-500 mt-2">
                        Manage all website content from here. Changes will reflect on the live website immediately.
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSeedData}
                        disabled={seeding || resetting}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 text-sm"
                    >
                        {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                        {seeding ? 'Seeding...' : 'Seed Default Data'}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowResetConfirm(true)}
                        disabled={seeding || resetting}
                        className="flex items-center gap-2 bg-white border border-red-300 text-red-600 px-4 py-2.5 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:opacity-50 text-sm"
                    >
                        {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        {resetting ? 'Resetting...' : 'Reset & Re-seed'}
                    </motion.button>
                </div>
            </div>

            {/* Reset Confirmation Dialog */}
            {showResetConfirm && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
                >
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-semibold text-red-800">Are you sure?</h4>
                        <p className="text-sm text-red-600 mt-1">
                            This will delete ALL existing CMS content and replace it with default data. This action cannot be undone.
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                            <button
                                onClick={handleResetAndSeed}
                                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg font-medium hover:bg-red-700 transition-colors"
                            >
                                Yes, Reset Everything
                            </button>
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Seed Result */}
            {seedResult && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 rounded-xl p-4"
                >
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-green-800">Seed Complete!</h4>
                            {seedResult.seeded.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-sm text-green-700 font-medium">Seeded:</p>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        {seedResult.seeded.map(item => (
                                            <span key={item} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{item}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {seedResult.skipped.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-sm text-gray-600 font-medium">Skipped (already has data):</p>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        {seedResult.skipped.map(item => (
                                            <span key={item} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{item}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={() => setSeedResult(null)} className="text-green-400 hover:text-green-600 transition-colors">
                            <span className="text-lg">&times;</span>
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Header Navigation Pages — exact names matching the public site header */}
            <div className="space-y-4">
                <div className="flex items-baseline justify-between border-b border-gray-200 pb-2">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-600" />
                        Header Navigation Pages
                    </h2>
                    <span className="text-xs text-gray-500">Same names as the public website header</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {headerPageModules.map((module, index) => (
                        <motion.div
                            key={module.href}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                        >
                            <Link href={module.href}>
                                <div className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-300 h-full">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                            <module.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {module.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                {module.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Other CMS Sections */}
            <div className="space-y-4">
                <div className="flex items-baseline justify-between border-b border-gray-200 pb-2">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-purple-600" />
                        Other CMS Sections
                    </h2>
                    <span className="text-xs text-gray-500">Reusable content collections</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cmsModules.map((module, index) => (
                        <motion.div
                            key={module.href}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                        >
                            <Link href={module.href}>
                                <div className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-300 h-full">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                            <module.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {module.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                {module.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
