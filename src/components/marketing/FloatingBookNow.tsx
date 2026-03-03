'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

export function FloatingBookNow() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show button after scrolling 300px
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <Link
            href="/book-trial"
            className={`fixed right-6 top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
                }`}
        >
            <div className="bg-primary hover:bg-primary/90 text-white px-6 py-4 rounded-l-full shadow-2xl flex items-center gap-3 group">
                <Calendar className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-lg whitespace-nowrap">BOOK NOW</span>
            </div>
        </Link>
    );
}
