'use client'

import { motion } from 'framer-motion'

const FixedBookNowButton = () => {

    return (
        <>
            {/* Fixed Book Now Button - Right Side - Smaller & Higher Position */}
            <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="fixed right-0 top-1/4 -translate-y-1/2 z-50 hidden md:block"
            >
                <motion.button
                    onClick={() => window.location.href = '/book-now'}
                    className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-l-3xl shadow-2xl transition-all duration-300 flex flex-col items-center justify-center group"
                    style={{
                        width: '45px',
                        height: '200px',
                        paddingTop: '15px',
                        paddingBottom: '15px'
                    }}
                    whileHover={{ x: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {/* Vertical Text "BOOK NOW" - Anticlockwise Rotation */}
                    <div
                        className="flex items-center justify-center"
                        style={{
                            transform: 'rotate(-90deg)',
                            transformOrigin: 'center'
                        }}
                    >
                        <span className="text-base font-black tracking-[0.15em] leading-none whitespace-nowrap">
                            BOOK NOW
                        </span>
                    </div>

                    {/* Animated Glow Effect */}
                    <motion.div
                        className="absolute inset-0 rounded-l-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                            background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
                            boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
                        }}
                    />
                </motion.button>
            </motion.div>

            {/* Mobile Book Now Button - Bottom Fixed */}
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
            >
                <motion.button
                    onClick={() => window.location.href = '/book-now'}
                    className="w-full bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-2xl shadow-2xl transition-all duration-300 flex items-center justify-center py-4 group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <span className="text-lg font-black tracking-[0.1em]">
                        📅 BOOK NOW
                    </span>

                    {/* Mobile Glow Effect */}
                    <motion.div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                            background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
                            boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
                        }}
                    />
                </motion.button>
            </motion.div>
        </>
    )
}

export default FixedBookNowButton
