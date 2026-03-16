'use client';

import { motion } from 'framer-motion';

interface AILoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
    progress?: number;
}

const AILoadingSpinner = ({ size = 'md', message = 'AI Processing...', progress }: AILoadingSpinnerProps) => {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16'
    };

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            {/* AI Spinner */}
            <div className="relative">
                <div className={`ai-spinner ${sizeClasses[size]}`}></div>

                {/* Inner glow effect */}
                <motion.div
                    className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-20`}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            {/* Progress Bar */}
            {progress !== undefined && (
                <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>
            )}

            {/* Loading Message */}
            <motion.p
                className={`${textSizeClasses[size]} text-gray-600 font-medium`}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                {message}
            </motion.p>

            {/* Floating Particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-blue-400 rounded-full"
                        style={{
                            left: `${20 + Math.random() * 60}%`,
                            top: `${20 + Math.random() * 60}%`,
                        }}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default AILoadingSpinner;
