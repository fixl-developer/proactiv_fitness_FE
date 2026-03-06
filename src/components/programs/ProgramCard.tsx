'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Program } from '@/types/program';

interface ProgramCardProps {
    program: Program;
    onUpdate: () => void;
}

export default function ProgramCard({ program, onUpdate }: ProgramCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-gray-100 text-gray-800';
            case 'archived':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'regular':
                return 'bg-blue-100 text-blue-800';
            case 'camp':
                return 'bg-purple-100 text-purple-800';
            case 'event':
                return 'bg-yellow-100 text-yellow-800';
            case 'private':
                return 'bg-pink-100 text-pink-800';
            case 'assessment':
                return 'bg-orange-100 text-orange-800';
            case 'party':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const capacityPercentage = (program.currentEnrollment / program.maxCapacity) * 100;
    const lowestPrice = Math.min(...program.pricing.map(p => p.price));

    return (
        <Link href={`/programs/${program.id}`}>
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
                {program.images.length > 0 && (
                    <div className="relative w-full h-48 bg-gray-200">
                        <Image
                            src={program.images[0]}
                            alt={program.name}
                            fill
                            className="object-cover"
                        />
                        {program.isFeatured && (
                            <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded">
                                FEATURED
                            </div>
                        )}
                    </div>
                )}

                <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {program.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(program.status)}`}>
                            {program.status}
                        </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {program.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(program.type)}`}>
                            {program.type}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                            {program.category}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium capitalize">
                            {program.skillLevel}
                        </span>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Age Range</span>
                            <span className="font-medium text-gray-900">
                                {program.ageGroup.min}-{program.ageGroup.max} years
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Duration</span>
                            <span className="font-medium text-gray-900">{program.duration} min</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Starting at</span>
                            <span className="font-bold text-blue-600">${lowestPrice}</span>
                        </div>

                        <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600">Capacity</span>
                                <span className="font-medium text-gray-900">
                                    {program.currentEnrollment}/{program.maxCapacity}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 ${capacityPercentage >= 90 ? 'bg-red-600' :
                                            capacityPercentage >= 70 ? 'bg-yellow-600' :
                                                'bg-green-600'
                                        }`}
                                    style={{ width: `${capacityPercentage}%` }}
                                />
                            </div>
                        </div>

                        {program.waitlistCount > 0 && (
                            <div className="flex items-center gap-2 text-sm text-orange-600">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                <span>{program.waitlistCount} on waitlist</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
