'use client';

import Link from 'next/link';
import { Calendar, Phone } from 'lucide-react';

export function CTASection() {
    return (
        <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    Ready to Get Started?
                </h2>
                <p className="text-xl mb-10 max-w-2xl mx-auto text-white/90">
                    Book a free trial class today and experience the ProActiv difference!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link id="marketing-ctasection-nav-book-trial"
                        href="/book-trial"
                        className="inline-flex items-center justify-center gap-3 bg-white text-primary px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-105"
                    >
                        <Calendar className="w-6 h-6" />
                        Book A Trial
                    </Link>

                    <Link id="marketing-ctasection-nav-contact"
                        href="/contact"
                        className="inline-flex items-center justify-center gap-3 bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-white hover:text-primary transition-all transform hover:scale-105"
                    >
                        <Phone className="w-6 h-6" />
                        Contact Us
                    </Link>
                </div>
            </div>
        </section>
    );
}
