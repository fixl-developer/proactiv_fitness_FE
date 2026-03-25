'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Save, X, AlertTriangle } from 'lucide-react'

interface LogoutModalProps {
    isOpen: boolean
    onClose: () => void
    onSaveAndLogout: () => void
    onPermanentLogout: () => void
    userName?: string
    unsavedPages?: string[]
}

export default function LogoutModal({ isOpen, onClose, onSaveAndLogout, onPermanentLogout, userName, unsavedPages = [] }: LogoutModalProps) {
    const [mounted, setMounted] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!isOpen || !mounted) return null

    const handleSaveAndLogout = async () => {
        setIsSaving(true)
        try {
            await onSaveAndLogout()
        } finally {
            setIsSaving(false)
        }
    }

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div id="modal-logout" className="fixed inset-0 z-[9999] flex items-center justify-center">
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
                            id="btn-close-logout-modal"
                            onClick={onClose}
                            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors z-10"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>

                        {/* Header */}
                        <div className="px-6 pt-6 pb-4 text-center">
                            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-7 h-7 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Unsaved Changes</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {userName ? `Hey ${userName}, ` : ''}You have unsaved changes that will be lost if you don&apos;t save.
                            </p>
                        </div>

                        {/* Unsaved pages list */}
                        {unsavedPages.length > 0 && (
                            <div className="mx-6 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                <p className="text-xs font-semibold text-amber-800 mb-1.5">Changes pending in:</p>
                                <ul className="space-y-1">
                                    {unsavedPages.map((page, i) => (
                                        <li key={i} className="text-xs text-amber-700 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                                            {page}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Options */}
                        <div className="px-6 pb-6 space-y-2.5">
                            {/* Save & Logout */}
                            <button
                                id="btn-save-logout"
                                onClick={handleSaveAndLogout}
                                disabled={isSaving}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors group disabled:opacity-60"
                            >
                                <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                                    {isSaving ? (
                                        <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                                    ) : (
                                        <Save className="w-5 h-5 text-blue-600" />
                                    )}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-blue-900">
                                        {isSaving ? 'Saving...' : 'Save & Logout'}
                                    </p>
                                    <p className="text-xs text-blue-600">Save your changes before logging out</p>
                                </div>
                            </button>

                            {/* Logout without saving */}
                            <button
                                id="btn-permanent-logout"
                                onClick={onPermanentLogout}
                                disabled={isSaving}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors group disabled:opacity-60"
                            >
                                <div className="w-10 h-10 bg-red-100 group-hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors">
                                    <LogOut className="w-5 h-5 text-red-600" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-red-900">Logout Without Saving</p>
                                    <p className="text-xs text-red-600">Your unsaved changes will be lost</p>
                                </div>
                            </button>

                            {/* Cancel */}
                            <button
                                id="btn-cancel-logout"
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
