'use client'

import Link from 'next/link';
import { Users, Calendar, Zap, PartyPopper, ArrowRight, BookOpen, MapPin, DollarSign } from 'lucide-react';
import { useCMSData } from '@/hooks/useCMSData';
import { CMSService, ServiceCardData } from '@/services/cmsService';
import { apiClient } from '@/services/api/client';

// Shape returned by the public Programs endpoint (subset of the full Program doc)
interface AdminProgram {
    _id: string
    name: string
    description?: string
    shortDescription?: string
    category?: string
    programType?: string
    skillLevels?: string[]
    ageGroups?: Array<{ minAge?: number; maxAge?: number; ageType?: string; description?: string }>
    pricingModel?: { basePrice?: number; currency?: string }
    isActive?: boolean
    isPublic?: boolean
}

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

const staticPrograms: Program[] = [
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

const emojiToIconMap: Record<string, React.ReactNode> = {
    '🤸': <Users className="w-16 h-16" />,
    '🏕️': <Calendar className="w-16 h-16" />,
    '⚡': <Zap className="w-16 h-16" />,
    '🎉': <PartyPopper className="w-16 h-16" />,
    '👥': <Users className="w-16 h-16" />,
    '📅': <Calendar className="w-16 h-16" />,
    '🎂': <PartyPopper className="w-16 h-16" />,
};

const defaultColorCycle = [
    { color: 'text-green-600', bgColor: 'bg-green-500' },
    { color: 'text-red-600', bgColor: 'bg-red-500' },
    { color: 'text-blue-600', bgColor: 'bg-blue-500' },
    { color: 'text-purple-600', bgColor: 'bg-purple-900' },
];

function mapServiceToProgram(service: ServiceCardData, index: number): Program {
    const style = defaultColorCycle[index % defaultColorCycle.length];
    return {
        id: index + 1,
        title: service.title,
        description: service.description,
        icon: emojiToIconMap[service.emoji] || <Users className="w-16 h-16" />,
        color: service.color ? `text-${service.color}-600` : style.color,
        bgColor: service.gradient ? service.gradient : style.bgColor,
        ageRange: '',
        features: service.features || [],
        link: service.href || '#',
    };
}

export default function ProgramsPage() {
    const { data: services } = useCMSData<ServiceCardData[]>(
        () => CMSService.getServices(),
        [],
        []
    );

    const programs: Program[] = services.length > 0
        ? services.map(mapServiceToProgram)
        : staticPrograms;

    // Real bookable programs created by admin in /admin/programs/catalog.
    // Public listing returns only isActive=true && isPublic=true programs.
    const { data: adminPrograms } = useCMSData<AdminProgram[]>(
        async () => {
            const res: any = await apiClient.get('/programs/public', { params: { limit: 50 } });
            const raw = res?.data ?? res;
            // Server may return { programs: [...], pagination: {...} } or just an array
            const list = Array.isArray(raw) ? raw : (raw?.programs ?? raw?.data ?? []);
            return Array.isArray(list) ? list : [];
        },
        [],
        []
    );

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
                                            {program.ageRange && (
                                                <div className="inline-block bg-white/20 px-4 py-2 rounded-full text-sm font-semibold">
                                                    Ages: {program.ageRange}
                                                </div>
                                            )}
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

                                    <Link id="marketing-programs-nav-learn-more"
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

            {/* Admin-managed Programs (real bookable programs) */}
            {adminPrograms.length > 0 && (
                <section className="py-16 bg-white border-t border-gray-200">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-3">
                                <BookOpen className="w-4 h-4" />
                                Currently Available
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Bookable Programs</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Live programs you can enrol in right now. Pricing and details are managed by our admin team.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {adminPrograms.map((p) => {
                                const ag = (p.ageGroups && p.ageGroups[0]) || null
                                const ageLabel = ag?.description
                                    ? ag.description
                                    : (ag?.minAge !== undefined && ag?.maxAge !== undefined
                                        ? `Ages ${ag.minAge}–${ag.maxAge}${ag.ageType ? ' ' + ag.ageType : ''}`
                                        : '')
                                const price = p.pricingModel?.basePrice
                                const currency = p.pricingModel?.currency || ''
                                const skill = (p.skillLevels && p.skillLevels[0]) || ''
                                return (
                                    <div
                                        key={p._id}
                                        className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all overflow-hidden"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-start justify-between gap-2 mb-3">
                                                <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{p.name}</h3>
                                                {skill && (
                                                    <span className="inline-block px-2.5 py-1 bg-purple-50 text-purple-700 text-xs rounded-full font-semibold capitalize whitespace-nowrap">
                                                        {skill}
                                                    </span>
                                                )}
                                            </div>
                                            {(p.shortDescription || p.description) && (
                                                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                                    {p.shortDescription || p.description}
                                                </p>
                                            )}

                                            <div className="space-y-2 mb-4 text-sm">
                                                {ageLabel && (
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <Users className="w-4 h-4 text-gray-400" />
                                                        <span>{ageLabel}</span>
                                                    </div>
                                                )}
                                                {p.category && (
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <MapPin className="w-4 h-4 text-gray-400" />
                                                        <span className="capitalize">{p.category}</span>
                                                    </div>
                                                )}
                                                {price !== undefined && price !== null && (
                                                    <div className="flex items-center gap-2 text-gray-900 font-semibold">
                                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                                        <span>{currency} {price}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <Link
                                                id={`programs-bookable-${p._id}-link`}
                                                href="/book-now"
                                                className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all"
                                            >
                                                Book Now <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>
            )}

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
                    <Link id="marketing-programs-nav-book-trial"
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
