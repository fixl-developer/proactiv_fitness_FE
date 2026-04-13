'use client';

import { useRouter } from 'next/navigation';
import { Clock, MapPin, Users, Calendar, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Class } from '@/types/booking';

interface ClassCardProps {
    classItem: Class;
}

export function ClassCard({ classItem }: ClassCardProps) {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const availabilityPercentage =
        (classItem.capacity.booked / classItem.capacity.total) * 100;
    const isAlmostFull = availabilityPercentage >= 80;
    const isFull = classItem.capacity.available === 0;

    const handleBookClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            router.push(`/login?redirectTo=${encodeURIComponent(`/classes/${classItem.id}/book`)}`);
            return;
        }

        router.push(`/classes/${classItem.id}/book`);
    };

    const handleCardClick = () => {
        router.push(`/classes/${classItem.id}/book`);
    };

    return (
        <div
            onClick={handleCardClick}
            className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden group cursor-pointer"
        >
            {/* Image */}
            <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                {classItem.image ? (
                    <img
                        src={classItem.image}
                        alt={classItem.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-primary/40" />
                    </div>
                )}

                {/* Program Badge */}
                <div
                    className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-sm font-semibold"
                    style={{ backgroundColor: classItem.program.color }}
                >
                    {classItem.program.name}
                </div>

                {/* Trial Badge */}
                {classItem.isTrial && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-green-500 rounded-full text-white text-sm font-semibold">
                        Trial Available
                    </div>
                )}

                {/* Availability Badge */}
                {isFull ? (
                    <div className="absolute bottom-3 right-3 px-3 py-1 bg-red-500 rounded-full text-white text-sm font-semibold">
                        Full - Waitlist
                    </div>
                ) : isAlmostFull ? (
                    <div className="absolute bottom-3 right-3 px-3 py-1 bg-orange-500 rounded-full text-white text-sm font-semibold">
                        Almost Full
                    </div>
                ) : null}
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {classItem.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {classItem.description}
                </p>

                {/* Details */}
                <div className="space-y-2 mb-4">
                    {/* Instructor */}
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{classItem.instructor.name}</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{classItem.location.name}</span>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>
                            {classItem.schedule.dayOfWeek} {classItem.schedule.startTime} -{' '}
                            {classItem.schedule.endTime}
                        </span>
                    </div>

                    {/* Capacity */}
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>
                            {classItem.capacity.available} spots available (
                            {classItem.capacity.total} total)
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                        <p className="text-2xl font-bold text-primary">
                            ${classItem.pricing.singleClass}
                        </p>
                        <p className="text-xs text-gray-500">per class</p>
                    </div>

                    <button
                        id="booking-class-card-btn"
                        onClick={handleBookClick}
                        className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                        {isFull ? 'Join Waitlist' : 'Book Now'}
                    </button>
                </div>
            </div>
        </div>
    );
}
