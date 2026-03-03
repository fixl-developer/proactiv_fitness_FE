'use client';

import { Users, Award, MapPin, Star } from 'lucide-react';

interface Stat {
    id: number;
    icon: React.ReactNode;
    value: string;
    label: string;
    color: string;
}

const stats: Stat[] = [
    {
        id: 1,
        icon: <Users className="w-8 h-8" />,
        value: '5000+',
        label: 'Active Students',
        color: 'text-blue-600',
    },
    {
        id: 2,
        icon: <Award className="w-8 h-8" />,
        value: '50+',
        label: 'Expert Coaches',
        color: 'text-green-600',
    },
    {
        id: 3,
        icon: <MapPin className="w-8 h-8" />,
        value: '15+',
        label: 'Locations',
        color: 'text-red-600',
    },
    {
        id: 4,
        icon: <Star className="w-8 h-8" />,
        value: '10+',
        label: 'Years Experience',
        color: 'text-yellow-600',
    },
];

export function StatsSection() {
    return (
        <section className="py-16 bg-primary text-white">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat) => (
                        <div key={stat.id} className="text-center">
                            <div className="flex justify-center mb-4">{stat.icon}</div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">
                                {stat.value}
                            </div>
                            <div className="text-lg text-white/90">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
