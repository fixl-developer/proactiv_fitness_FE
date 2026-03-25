'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    User,
    Award,
    DollarSign,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { bookingApi } from '@/lib/api/booking';
import { toast } from 'sonner';
import type { Class } from '@/types/booking';
import Link from 'next/link';

export default function ClassDetailPage() {
    const params = useParams();
    const router = useRouter();
    const classId = params.id as string;

    const [classData, setClassData] = useState<Class | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [availability, setAvailability] = useState<{
        available: boolean;
        spotsLeft: number;
        waitlistCount: number;
    } | null>(null);

    useEffect(() => {
        fetchClassDetails();
        checkAvailability();
    }, [classId]);

    const fetchClassDetails = async () => {
        try {
            const data = await bookingApi.getClassById(classId);
            setClassData(data);
        } catch (error: any) {
            toast.error('Failed to load class details');
            router.push('/classes');
        } finally {
            setIsLoading(false);
        }
    };

    const checkAvailability = async () => {
        try {
            const data = await bookingApi.checkAvailability(classId);
            setAvailability(data);
        } catch (error) {
            console.error('Failed to check availability');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading class details...</p>
                </div>
            </div>
        );
    }

    if (!classData) {
        return null;
    }

    const isFull = classData.capacity.available === 0;
    const isAlmostFull = (classData.capacity.booked / classData.capacity.total) >= 0.8;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative h-96 bg-gradient-to-br from-primary/20 to-secondary/20">
                {classData.image ? (
                    <img
                        src={classData.image}
                        alt={classData.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="w-32 h-32 text-primary/40" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <div className="container mx-auto">
                        <div className="flex items-center gap-3 mb-3">
                            <span
                                className="px-4 py-2 rounded-full text-sm font-semibold"
                                style={{ backgroundColor: classData.program.color }}
                            >
                                {classData.program.name}
                            </span>
                            {classData.isTrial && (
                                <span className="px-4 py-2 bg-green-500 rounded-full text-sm font-semibold">
                                    Trial Available
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">
                            {classData.name}
                        </h1>
                        <p className="text-xl text-white/90">{classData.description}</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Class Info */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Class Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Instructor */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Instructor</p>
                                        <p className="font-semibold text-gray-900">
                                            {classData.instructor.name}
                                        </p>
                                        {classData.instructor.bio && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                {classData.instructor.bio}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Location</p>
                                        <p className="font-semibold text-gray-900">
                                            {classData.location.name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {classData.location.address}
                                        </p>
                                    </div>
                                </div>

                                {/* Schedule */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Calendar className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Schedule</p>
                                        <p className="font-semibold text-gray-900">
                                            {classData.schedule.dayOfWeek}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {classData.schedule.startTime} - {classData.schedule.endTime}
                                        </p>
                                    </div>
                                </div>

                                {/* Duration */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Duration</p>
                                        <p className="font-semibold text-gray-900">
                                            {classData.duration} minutes
                                        </p>
                                    </div>
                                </div>

                                {/* Skill Level */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Award className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Skill Level</p>
                                        <p className="font-semibold text-gray-900 capitalize">
                                            {classData.skillLevel}
                                        </p>
                                    </div>
                                </div>

                                {/* Age Range */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Users className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Age Range</p>
                                        <p className="font-semibold text-gray-900">
                                            {classData.ageRange.min} - {classData.ageRange.max} years
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* What You'll Learn */}
                        {classData.tags && classData.tags.length > 0 && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    What You'll Learn
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {classData.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-xl p-6 sticky top-4">
                            {/* Availability Status */}
                            <div className="mb-6">
                                {isFull ? (
                                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                                        <AlertCircle className="w-5 h-5" />
                                        <span className="font-semibold">Class Full - Join Waitlist</span>
                                    </div>
                                ) : isAlmostFull ? (
                                    <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-lg">
                                        <AlertCircle className="w-5 h-5" />
                                        <span className="font-semibold">Almost Full - Book Now!</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-semibold">Spots Available</span>
                                    </div>
                                )}
                            </div>

                            {/* Capacity */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-600">Capacity</span>
                                    <span className="font-semibold">
                                        {classData.capacity.booked} / {classData.capacity.total}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all"
                                        style={{
                                            width: `${(classData.capacity.booked / classData.capacity.total) * 100}%`,
                                        }}
                                    />
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    {classData.capacity.available} spots remaining
                                </p>
                                {classData.capacity.waitlist > 0 && (
                                    <p className="text-sm text-orange-600 mt-1">
                                        {classData.capacity.waitlist} on waitlist
                                    </p>
                                )}
                            </div>

                            {/* Pricing */}
                            <div className="mb-6 pb-6 border-b">
                                <div className="flex items-center gap-2 mb-4">
                                    <DollarSign className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-600">Pricing</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-700">Single Class</span>
                                        <span className="text-2xl font-bold text-primary">
                                            ${classData.pricing.singleClass}
                                        </span>
                                    </div>

                                    {classData.pricing.package.map((pkg, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">
                                                {pkg.sessions} Sessions Package
                                            </span>
                                            <span className="font-semibold text-gray-900">
                                                ${pkg.price}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="space-y-3">
                                <Link id="booking-classes-id-nav"
                                    href={`/classes/${classId}/book`}
                                    className="block w-full bg-primary text-white py-4 rounded-lg font-semibold text-center hover:bg-primary/90 transition-colors"
                                >
                                    {isFull ? 'Join Waitlist' : 'Book This Class'}
                                </Link>

                                <Link id="booking-classes-id-nav-classes"
                                    href="/classes"
                                    className="block w-full bg-gray-100 text-gray-700 py-4 rounded-lg font-semibold text-center hover:bg-gray-200 transition-colors"
                                >
                                    Browse More Classes
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
