'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { programsApi } from '@/lib/api/programs';
import type { Program } from '@/types/program';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

export default function ProgramDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [program, setProgram] = useState<Program | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProgram();
    }, [params.id]);

    const loadProgram = async () => {
        try {
            setLoading(true);
            const data = await programsApi.getById(params.id as string);
            setProgram(data);
        } catch (error) {
            toast.error('Failed to load program');
            router.push('/programs');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this program?')) return;

        try {
            await programsApi.delete(params.id as string);
            toast.success('Program deleted successfully');
            router.push('/programs');
        } catch (error) {
            toast.error('Failed to delete program');
        }
    };

    const handleDuplicate = async () => {
        try {
            const duplicated = await programsApi.duplicate(params.id as string);
            toast.success('Program duplicated successfully');
            router.push(`/programs/${duplicated.id}`);
        } catch (error) {
            toast.error('Failed to duplicate program');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!program) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Program not found</p>
            </div>
        );
    }

    const capacityPercentage = (program.currentEnrollment / program.maxCapacity) * 100;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                <div className="flex gap-2">
                    <button
                        onClick={handleDuplicate}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Duplicate
                    </button>
                    <Link href={`/programs/${program.id}/edit`}>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                            Edit
                        </button>
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* Program Header */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {program.images.length > 0 && (
                    <div className="relative w-full h-64 bg-gray-200">
                        <Image
                            src={program.images[0]}
                            alt={program.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}

                <div className="p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{program.name}</h1>
                    <p className="text-gray-600 mb-4">{program.description}</p>

                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {program.type}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                            {program.category}
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium capitalize">
                            {program.skillLevel}
                        </span>
                        {program.isFeatured && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                Featured
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Program Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Program Details</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Age Range</span>
                            <span className="font-medium text-gray-900">
                                {program.ageGroup.min}-{program.ageGroup.max} years
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Duration</span>
                            <span className="font-medium text-gray-900">{program.duration} minutes</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Sessions Per Week</span>
                            <span className="font-medium text-gray-900">{program.sessionsPerWeek}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Sessions</span>
                            <span className="font-medium text-gray-900">{program.totalSessions}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Term Based</span>
                            <span className="font-medium text-gray-900">{program.termBased ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Capacity</h2>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Current Enrollment</span>
                                <span className="font-medium text-gray-900">
                                    {program.currentEnrollment}/{program.maxCapacity}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full ${capacityPercentage >= 90 ? 'bg-red-600' :
                                            capacityPercentage >= 70 ? 'bg-yellow-600' :
                                                'bg-green-600'
                                        }`}
                                    style={{ width: `${capacityPercentage}%` }}
                                />
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Min Capacity</span>
                            <span className="font-medium text-gray-900">{program.minCapacity}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Max Capacity</span>
                            <span className="font-medium text-gray-900">{program.maxCapacity}</span>
                        </div>
                        {program.waitlistCount > 0 && (
                            <div className="flex justify-between text-orange-600">
                                <span>Waitlist</span>
                                <span className="font-medium">{program.waitlistCount} students</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing Options</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {program.pricing.map((price) => (
                        <div
                            key={price.id}
                            className={`border-2 rounded-lg p-4 ${price.isPopular ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                                }`}
                        >
                            {price.isPopular && (
                                <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded mb-2 inline-block">
                                    POPULAR
                                </span>
                            )}
                            <h3 className="text-lg font-semibold text-gray-900">{price.name}</h3>
                            <p className="text-3xl font-bold text-blue-600 my-2">${price.price}</p>
                            <p className="text-sm text-gray-600 mb-2">{price.sessions} sessions</p>
                            <p className="text-xs text-gray-500">Valid for {price.validityDays} days</p>
                            {price.discount && price.discount > 0 && (
                                <p className="text-sm text-green-600 mt-2">{price.discount}% discount</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills & Certifications */}
            {(program.skillsToLearn.length > 0 || program.certificationsOffered.length > 0) && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills & Certifications</h2>
                    {program.skillsToLearn.length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Skills to Learn</h3>
                            <div className="flex flex-wrap gap-2">
                                {program.skillsToLearn.map((skill, index) => (
                                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {program.certificationsOffered.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Certifications Offered</h3>
                            <div className="flex flex-wrap gap-2">
                                {program.certificationsOffered.map((cert, index) => (
                                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                        {cert}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
