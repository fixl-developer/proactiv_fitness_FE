'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { pageStyles } from '@/lib/pageStyles'

interface ResponsivePageLayoutProps {
    children: ReactNode
    title?: string
    subtitle?: string
    showHero?: boolean
    heroImage?: string
    heroGradient?: string
}

export default function ResponsivePageLayout({
    children,
    title,
    subtitle,
    showHero = false,
    heroImage,
    heroGradient = 'from-slate-900 via-blue-900 to-indigo-900'
}: ResponsivePageLayoutProps) {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            {showHero && (
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className={`${pageStyles.heroSection.container} ${pageStyles.heroSection.gradient} relative overflow-hidden`}
                >
                    {/* Background Image */}
                    {heroImage && (
                        <div className="absolute inset-0">
                            <img
                                src={heroImage}
                                alt="Hero Background"
                                className="w-full h-full object-cover opacity-20"
                            />
                        </div>
                    )}

                    {/* Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${heroGradient}`}></div>

                    {/* Content */}
                    <div className={pageStyles.heroSection.content}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="text-center"
                        >
                            {title && (
                                <h1 className={`${pageStyles.heroSection.title}`}>
                                    {title}
                                </h1>
                            )}
                            {subtitle && (
                                <p className={pageStyles.heroSection.subtitle}>
                                    {subtitle}
                                </p>
                            )}
                        </motion.div>
                    </div>
                </motion.section>
            )}

            {/* Main Content */}
            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className={`${pageStyles.responsivePadding.container} ${pageStyles.responsivePadding.section}`}
            >
                {children}
            </motion.main>
        </div>
    )
}
