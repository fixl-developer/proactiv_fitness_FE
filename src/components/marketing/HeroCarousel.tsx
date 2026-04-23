'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useCMSData } from '@/hooks/useCMSData';
import { CMSService, HeroSlide } from '@/services/cmsService';

interface Slide {
    id: number | string;
    image: string;
    title: string;
    subtitle: string;
    cta: string;
    ctaLink: string;
    fallbackGradient?: string;
}

const staticSlides: Slide[] = [
    {
        id: 1,
        image: '/images/hero/gymnastics-1.jpg',
        title: 'Welcome to ProActiv Fitness',
        subtitle: 'Building Confidence Through Movement',
        cta: 'JOIN NOW',
        ctaLink: '/register',
    },
    {
        id: 2,
        image: '/images/hero/gymnastics-2.jpg',
        title: 'Expert Coaching Programs',
        subtitle: 'Professional Training for All Ages',
        cta: 'EXPLORE PROGRAMS',
        ctaLink: '/programs',
    },
    {
        id: 3,
        image: '/images/hero/gymnastics-3.jpg',
        title: 'State-of-the-Art Facilities',
        subtitle: 'Safe & Modern Training Environment',
        cta: 'BOOK A TRIAL',
        ctaLink: '/book-trial',
    },
];

function mapCMSSlide(s: HeroSlide): Slide {
    return {
        id: s.id,
        image: s.image,
        title: s.title,
        subtitle: s.subtitle || '',
        cta: s.ctaText || 'LEARN MORE',
        ctaLink: s.ctaLink || '/',
        fallbackGradient: s.fallbackGradient,
    };
}

export function HeroCarousel() {
    const { data: cmsSlides } = useCMSData<HeroSlide[]>(
        () => CMSService.getHeroSlides(),
        [],
        []
    );

    const slides: Slide[] = cmsSlides.length > 0
        ? cmsSlides.map(mapCMSSlide)
        : staticSlides;

    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Reset current slide if slides change
    useEffect(() => {
        setCurrentSlide(0);
    }, [slides.length]);

    // Auto-rotate every 4 seconds
    useEffect(() => {
        if (!isAutoPlaying || slides.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, slides.length]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    return (
        <div className="relative h-[600px] overflow-hidden">
            {/* Slides */}
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    {/* Background Image */}
                    <div
                        className={`absolute inset-0 bg-cover bg-center ${!slide.image || slide.image.startsWith('/images/') ? (slide.fallbackGradient || 'bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800') : ''}`}
                        style={
                            slide.image && !slide.image.startsWith('/images/')
                                ? { backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${slide.image})` }
                                : { backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${slide.image})` }
                        }
                    />

                    {/* Content */}
                    <div className="relative h-full flex items-center justify-center text-center px-4">
                        <div className="max-w-4xl">
                            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 animate-fade-in">
                                {slide.title}
                            </h1>
                            <p className="text-xl md:text-2xl text-white mb-8 animate-fade-in-delay">
                                {slide.subtitle}
                            </p>
                            <Link id="marketing-hero-carousel-nav"
                                href={slide.ctaLink}
                                className="inline-block bg-primary hover:bg-primary/90 text-white px-12 py-4 rounded-full text-lg font-bold transition-all transform hover:scale-105 animate-fade-in-delay-2"
                            >
                                {slide.cta}
                            </Link>
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Arrows */}
            {slides.length > 1 && (
                <>
                    <button id="marketing-hero-carousel-btn-previous-slide"
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button id="marketing-hero-carousel-btn-next-slide"
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                        {slides.map((_, index) => (
                            <button id="marketing-hero-carousel-btn"
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all ${index === currentSlide
                                    ? 'bg-white w-8'
                                    : 'bg-white/50 hover:bg-white/75'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
