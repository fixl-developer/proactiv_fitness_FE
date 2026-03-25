'use client';

import Link from 'next/link';
import { Users, Calendar, Zap, PartyPopper } from 'lucide-react';

interface Service {
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    link: string;
}

const services: Service[] = [
    {
        id: 1,
        title: 'Gymnastics Programs',
        description: 'Professional gymnastics training for all skill levels and ages',
        icon: <Users className="w-12 h-12" />,
        color: 'text-green-600',
        bgColor: 'bg-green-500',
        link: '/programs/gymnastics',
    },
    {
        id: 2,
        title: 'Gymnastics Camps',
        description: 'Exciting holiday camps with fun activities and skill development',
        icon: <Calendar className="w-12 h-12" />,
        color: 'text-red-600',
        bgColor: 'bg-red-500',
        link: '/programs/camps',
    },
    {
        id: 3,
        title: 'Multi-Activity',
        description: 'Diverse sports and activities to develop overall fitness',
        icon: <Zap className="w-12 h-12" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-500',
        link: '/programs/multi-activity',
    },
    {
        id: 4,
        title: 'Birthday Parties',
        description: 'Unforgettable birthday celebrations with exciting activities',
        icon: <PartyPopper className="w-12 h-12" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-900',
        link: '/parties',
    },
];

export function ServicesSection() {
    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Our Services
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Discover our range of programs designed to inspire, challenge, and
                        develop young athletes
                    </p>
                </div>

                {/* Service Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service) => (
                        <Link id="marketing-services-section-nav"
                            key={service.id}
                            href={service.link}
                            className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                        >
                            {/* Colored Top Bar */}
                            <div className={`h-2 ${service.bgColor}`} />

                            {/* Card Content */}
                            <div className="p-8">
                                {/* Icon */}
                                <div
                                    className={`${service.color} mb-6 transform group-hover:scale-110 transition-transform duration-300`}
                                >
                                    {service.icon}
                                </div>

                                {/* Title */}
                                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors">
                                    {service.title}
                                </h3>

                                {/* Description */}
                                <p className="text-gray-600 leading-relaxed">
                                    {service.description}
                                </p>

                                {/* Learn More Arrow */}
                                <div className="mt-6 flex items-center text-primary font-semibold group-hover:gap-2 transition-all">
                                    <span>Learn More</span>
                                    <svg
                                        className="w-5 h-5 transform group-hover:translate-x-2 transition-transform"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Hover Effect Overlay */}
                            <div
                                className={`absolute inset-0 ${service.bgColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                            />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
