'use client'

import { motion } from 'framer-motion'

interface SectionDividerProps {
    title: string
    icon?: string
    color?: string
}

const SectionDivider = ({ title, icon = '✨', color = 'from-blue-500 to-purple-500' }: SectionDividerProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative py-8 sm:py-12 flex items-center justify-center overflow-hidden"
        >
            {/* Animated Background Lines */}
            <motion.div
                className="absolute left-0 top-1/2 w-1/4 h-0.5 bg-gradient-to-r from-transparent to-blue-300"
                animate={{ scaleX: [0, 1] }}
                transition={{ duration: 1, delay: 0.2 }}
            />
            <motion.div
                className="absolute right-0 top-1/2 w-1/4 h-0.5 bg-gradient-to-l from-transparent to-purple-300"
                animate={{ scaleX: [0, 1] }}
                transition={{ duration: 1, delay: 0.2 }}
            />

            {/* Center Badge */}
            <motion.div
                className={`relative z-10 flex items-center space-x-3 px-6 py-3 bg-gradient-to-r ${color} rounded-full shadow-lg`}
                animate={{
                    scale: [1, 1.05, 1],
                    boxShadow: [
                        '0 0 20px rgba(59, 130, 246, 0.3)',
                        '0 0 40px rgba(59, 130, 246, 0.6)',
                        '0 0 20px rgba(59, 130, 246, 0.3)'
                    ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <motion.span
                    className="text-2xl"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                    {icon}
                </motion.span>
                <span className="text-white font-bold text-sm sm:text-base uppercase tracking-wider">
                    {title}
                </span>
                <motion.span
                    className="text-2xl"
                    animate={{ rotate: [360, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                    {icon}
                </motion.span>
            </motion.div>

            {/* Floating Particles */}
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-blue-400 rounded-full"
                    style={{
                        left: `${20 + i * 30}%`,
                        top: '50%'
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0, 1, 0]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3
                    }}
                />
            ))}
        </motion.div>
    )
}

export default SectionDivider
