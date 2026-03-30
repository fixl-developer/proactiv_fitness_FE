'use client';

import { Star, Quote } from 'lucide-react';
import { useCMSData } from '@/hooks/useCMSData';
import { CMSService, TestimonialData } from '@/services/cmsService';

interface Testimonial {
    id: number | string;
    name: string;
    role: string;
    content: string;
    rating: number;
    avatar: string;
    image?: string;
}

const staticTestimonials: Testimonial[] = [
    {
        id: 1,
        name: 'Sarah Johnson',
        role: 'Parent',
        content:
            'My daughter has been attending ProActiv for 2 years now. The coaches are amazing and she has grown so much in confidence!',
        rating: 5,
        avatar: 'SJ',
    },
    {
        id: 2,
        name: 'Michael Chen',
        role: 'Parent',
        content:
            'Best decision we made! The facilities are top-notch and the staff truly care about each child\'s development.',
        rating: 5,
        avatar: 'MC',
    },
    {
        id: 3,
        name: 'Emma Williams',
        role: 'Parent',
        content:
            'The birthday party we had here was incredible! All the kids had a blast and the organization was perfect.',
        rating: 5,
        avatar: 'EW',
    },
];

function getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function mapCMSTestimonial(t: TestimonialData): Testimonial {
    return {
        id: t.id,
        name: t.name,
        role: t.role,
        content: t.text,
        rating: t.rating,
        avatar: getInitials(t.name),
        image: t.image,
    };
}

export function TestimonialsSection() {
    const { data: cmsTestimonials } = useCMSData<TestimonialData[]>(
        () => CMSService.getTestimonials(),
        [],
        []
    );

    const testimonials: Testimonial[] = cmsTestimonials.length > 0
        ? cmsTestimonials.map(mapCMSTestimonial)
        : staticTestimonials;

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        What Parents Say
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Don't just take our word for it - hear from our amazing community
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="bg-gray-50 rounded-2xl p-8 relative hover:shadow-xl transition-shadow"
                        >
                            {/* Quote Icon */}
                            <Quote className="absolute top-6 right-6 w-12 h-12 text-primary/10" />

                            {/* Rating */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                                    />
                                ))}
                            </div>

                            {/* Content */}
                            <p className="text-gray-700 mb-6 leading-relaxed">
                                &ldquo;{testimonial.content}&rdquo;
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                {testimonial.image ? (
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                                        {testimonial.avatar}
                                    </div>
                                )}
                                <div>
                                    <div className="font-semibold text-gray-900">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {testimonial.role}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
