'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface SlideInDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showOverlay?: boolean;
    footer?: React.ReactNode;
}

const sizeClasses = {
    sm: 'w-full sm:w-96',
    md: 'w-full sm:w-[500px]',
    lg: 'w-full sm:w-[600px]',
    xl: 'w-full sm:w-[720px]',
};

export const SlideInDrawer: React.FC<SlideInDrawerProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = 'md',
    showOverlay = true,
    footer,
}) => {
    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false);

    // Mount/unmount lifecycle to animate in and out smoothly
    useEffect(() => {
        if (isOpen) {
            setMounted(true);
            document.body.style.overflow = 'hidden';
            // Defer flipping visible so the browser paints the initial off-screen state first.
            // Double-rAF ensures React commit has rendered before we trigger the transform.
            let raf2: number | null = null;
            const raf1 = requestAnimationFrame(() => {
                raf2 = requestAnimationFrame(() => setVisible(true));
            });
            return () => {
                cancelAnimationFrame(raf1);
                if (raf2 !== null) cancelAnimationFrame(raf2);
            };
        } else {
            setVisible(false);
            document.body.style.overflow = 'unset';
            const t = setTimeout(() => setMounted(false), 300);
            return () => clearTimeout(t);
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    useEffect(() => () => { document.body.style.overflow = 'unset'; }, []);

    if (!mounted) return null;

    return (
        <>
            {showOverlay && (
                <div
                    className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside
                role="dialog"
                aria-modal="true"
                aria-labelledby="slide-drawer-title"
                className={`fixed right-0 top-0 h-full ${sizeClasses[size]} bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out ${visible ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-start justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex-1 min-w-0">
                        <h2 id="slide-drawer-title" className="text-xl font-semibold text-gray-900 truncate">{title}</h2>
                        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8 flex-shrink-0 ml-2"
                        aria-label="Close drawer"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>

                {footer && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                        {footer}
                    </div>
                )}
            </aside>
        </>
    );
};

export default SlideInDrawer;
