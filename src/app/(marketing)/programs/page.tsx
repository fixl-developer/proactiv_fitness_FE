import Link from 'next/link';
import { Users, Calendar, Zap, PartyPopper, ArrowRight } from 'lucide-react';

export const metadata = {
    title: 'Our Programs - ProActiv Fitness',
    description:
        'Explore our range of gymnastics and fitness programs for all ages and skill levels.',
};

interface Program {
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    features: string[];
    ageRange: string;
    link: string;
}

const programs: Program[] = [
    {
        id: 1,
        title: 'Gymnastics Programs',
        description:
            'Comprehensive gymnastics training from beginner to advanced levels',
        icon: <Users className="w-16 h-16" />,
        color: 'text-green-600',
        bgColor: 'bg-green-500',
        ageRange: '3-18 years',
        features: [
            'Beginner to Advanced levels',
            'Professional coaching',
            'Skill progression tracking',
            'Competition preparation',
            'Flexible scheduling',
        ],
        link: '/programs/gymnastics',
    },
    {
        id: 2,
        title: 'Holiday Camps',
        description: 'Fun-filled camps during school holidays with exciting activities',
        icon: <Calendar className="w-16 h-16" />,
        color: 'text-red-600',
        bgColor: 'bg-red-500',
        ageRange: '5-14 years',
        features: [
            'Full day & half day options',
            'Variety of activities',
            'Qualified supervision',
            'Healthy snacks included',
            'New friends & fun',
        ],
        link: '/programs/camps',
    },
    {
        id: 3,
        title: 'Multi-Activity Programs',
        description: 'Diverse sports and activities for overall development',
        icon: <Zap className="w-16 h-16" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-500',
        ageRange: '4-12 years',
        features: [
            'Multiple sports exposure',
            'Motor skills development',
            'Team building activities',
            'Confidence building',
            'Fun & engaging',
        ],
        link: '/programs/multi-activity',
    },
    {
        id: 4,
        title: 'Birthday Parties',
        description: 'Unforgettable birthday celebrations with exciting activities',
        icon: <PartyPopper className="w-16 h-16" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-900',
        ageRange: 'All ages',
        features: [
            'Private party room',
            'Dedicated party host',
            'Exciting activities',
            'Party decorations',
            'Hassle-free setup',
        ],
        link: '/parties',
    },
];

export default function ProgramsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Programs</h1>
                    <p className="text-xl max-w-3xl mx-auto">
                        Discover the perfect program for your child's fitness journey. From
                        gymnastics to multi-activity programs, we have something for everyone.
                    </p>
                </div>
            </section>

            {/* Programs Grid */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {programs.map((program) => (
                            <div
                                key={program.id}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
                            >
                                {/* Header */}
                                <div className={`${program.bgColor} text-white p-8`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="mb-4">{program.icon}</div>
                                            <h2 className="text-3xl font-bold mb-2">{program.title}</h2>
                                            <p className="text-white/90 mb-4">{program.description}</p>
                                            <div className="inline-block bg-white/20 px-4 py-2 rounded-full text-sm font-semibold">
                                                Ages: {program.ageRange}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                        Program Features:
                                    </h3>
                                    <ul className="space-y-3 mb-8">
                                        {program.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <div className={`${program.color} mt-1`}>
                                                    <svg
                                                        className="w-5 h-5"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        href={program.link}
                                        className={`inline-flex items-center gap-2 ${program.color} font-semibold hover:gap-3 transition-all`}
                                    >
                                        Learn More
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">
                        Not Sure Which Program is Right?
                    </h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Book a free trial class and let our expert coaches help you find the
                        perfect fit!
                    </p>
                    <Link
                        href="/book-trial"
                        className="inline-block bg-white text-primary px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-105"
                    >
                        Book A Free Trial
                    </Link>
                </div>
            </section>
        </div>
    );
}
