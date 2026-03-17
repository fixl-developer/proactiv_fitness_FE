'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { pageStyles } from '@/lib/pageStyles'

interface BeautifulCardProps {
    children: ReactNode
    title?: string
    subtitle?: string
    icon?: ReactNode
    gradient?: string
    hover?: boolean
    delay?: number
    className?: string
}

export default function BeautifulCard({
    children,
    title,
    subtitle,
    icon,
    gradient = 'from-blue-50 to-cyan-50',
    hover = true,
    delay = 0,
    className = ''
}: BeautifulCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={hover ? { scale: 1.02, y: -5 } : {}}
            className={`${pageStyles.card.base} ${hover ? pageStyles.card.hover : ''} ${className}`}
        >
            {/* Header */}
            {(title || icon) && (
                <div className={`bg-gradient-to-r ${gradient} p-6 md:p-8 border-b border-gray-200/50`}>
                    <div className="flex items-start gap-4">
                        {icon && (
                            <div className="flex-shrink-0">
                                {icon}
                            </div>
                        )}
                        <div className="flex-1">
                            {title && (
                                <h3 className={`${pageStyles.text.h3} mb-2`}>
                                    {title}
                                </h3>
                            )}
                            {subtitle && (
                                <p className={`${pageStyles.text.small} text-gray-600`}>
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className={pageStyles.card.padding}>
                {children}
            </div>
        </motion.div>
    )
}
