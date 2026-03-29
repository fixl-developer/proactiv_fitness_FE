'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Image, Star, Layers, MessageSquare, Users, Info, Zap,
    ClipboardList, BookOpen, PartyPopper, GraduationCap, Tent,
    MapPin, FileText, Briefcase, Phone, HelpCircle, BarChart3
} from 'lucide-react'

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
]

export default function AdminCMSPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
                <p className="text-gray-500 mt-2">
                    Manage all website content from here. Changes will reflect on the live website immediately.
                </p>
            </div>

            {/* Module Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cmsModules.map((module, index) => (
                    <motion.div
                        key={module.href}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
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
    )
}
