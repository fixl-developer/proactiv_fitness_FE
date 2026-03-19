'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Save, X } from 'lucide-react'

interface LogoutModalProps {
    isOpen: boolean
    onClose: () => void
    onSaveAndLogout: () => void
    onPermanentLogout: () => void
    userName?: string
}

export default function LogoutModal({ isOpen, onClose, onSaveAndLogout, onPermanentLogout, userName }: LogoutModalProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!isOpen || !mounted) return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', duration: 0.4 }}
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors z-10"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>

                        {/* Header */}
                        <div className="px-6 pt-6 pb-4 text-center">
                            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LogOut className="w-7 h-7 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Logout</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {userName ? `Hey ${userName}, ` : ''}Do you want to save your account for quick access?
                            </p>
                        </div>

                        {/* Options */}
                        <div className="px-6 pb-6 space-y-2.5">
                            {/* Save & Logout */}
                            <button
                                onClick={onSaveAndLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors group"
                            >
                                <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                                    <Save className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-blue-900">Save & Logout</p>
                                    <p className="text-xs text-blue-600">Quick login next time</p>
                                </div>
                            </button>

                            {/* Permanent Logout */}
                            <button
                                onClick={onPermanentLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors group"
                            >
                                <div className="w-10 h-10 bg-red-100 group-hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors">
                                    <LogOut className="w-5 h-5 text-red-600" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-red-900">Logout Permanently</p>
                                    <p className="text-xs text-red-600">Remove all saved data</p>
                                </div>
                            </button>

                            {/* Cancel */}
                            <button
                                onClick={onClose}
                                className="w-full py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    )
}
