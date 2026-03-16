'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface PageHeroProps {
    title: string;
    subtitle?: string;
    backgroundImage: string;
    fallbackGradient?: string;
    height?: 'small' | 'medium' | 'large' | 'xlarge';
    overlay?: 'light' | 'dark' | 'none';
}

const PageHero = ({
    title,
    subtitle,
    backgroundImage,
    fallbackGradient = 'from-blue-600 to-purple-600',
    height = 'medium',
    overlay = 'dark'
}: PageHeroProps) => {
    const heightClasses = {
        small: 'h-64',
        medium: 'h-80',
        large: 'h-96',
        xlarge: 'h-[500px]'
    };

    const overlayClasses = {
        light: 'bg-white/30',
        dark: 'bg-black/50',
        none: ''
    };

    return (
        <section className={`relative ${heightClasses[height]} flex items-center justify-center overflow-hidden`}>
            {/* Background Image */}
            <div className="absolute inset-0">
                {/* Fallback Gradient */}
                <div className={`w-full h-full bg-gradient-to-br ${fallbackGradient}`}></div>

                {/* Actual Image */}
                <Image
                    src={backgroundImage}
                    alt={title}
                    fill
                    className="object-cover"
                    priority
                    quality={85}
                    onError={(e) => {
                        console.log(`Failed to load hero image: ${backgroundImage}`);
                        // Image will fallback to gradient background
                        e.currentTarget.style.display = 'none';
                    }}
                />

                {/* Overlay */}
                {overlay !== 'none' && (
                    <div className={`absolute inset-0 ${overlayClasses[overlay]}`}></div>
                )}
            </div>

            {/* Content */}
            <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
                >
                    {title}
                </motion.h1>

                {subtitle && (
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto"
                    >
                        {subtitle}
                    </motion.p>
                )}
            </div>

            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Animated Particles */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white/20 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -50, 0],
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                        }}
                        transition={{
                            duration: 4 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>
        </section>
    );
};

export default PageHero;
