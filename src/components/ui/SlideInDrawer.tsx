'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface SlideInDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showOverlay?: boolean;
}

const sizeClasses = {
    sm: 'w-96',
    md: 'w-[500px]',
    lg: 'w-[600px]',
    xl: 'w-[700px]',
};

export const SlideInDrawer: React.FC<SlideInDrawerProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showOverlay = true,
}) => {
    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            {showOverlay && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed right-0 top-0 h-full ${sizeClasses[size]} bg-white shadow-lg z-50 flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8"
                        aria-label="Close drawer"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </>
    );
};

export default SlideInDrawer;
