'use client';

import Link from 'next/link';
import { Clock, MapPin, Users, User } from 'lucide-react';
import type { TimeSlot } from '@/types/booking';

interface ScheduleViewProps {
    timeSlots: TimeSlot[];
    isLoading?: boolean;
}

export function ScheduleView({ timeSlots, isLoading }: ScheduleViewProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-lg h-24 animate-pulse" />
                ))}
            </div>
        );
    }

    if (timeSlots.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No classes scheduled for this time.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {timeSlots.map((slot) => (
                <div key={slot.time} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Time Header */}
                    <div className="bg-primary text-white px-6 py-3 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        <span className="font-semibold text-lg">{slot.time}</span>
                        <span className="ml-auto text-sm">
                            {slot.classes.length} {slot.classes.length === 1 ? 'class' : 'classes'}
                        </span>
                    </div>

                    {/* Classes List */}
                    <div className="divide-y">
                        {slot.classes.map((classItem) => (
                            <Link id="booking-schedule-view-nav"
                                key={classItem.id}
                                href={`/classes/${classItem.id}`}
                                className="block p-6 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    {/* Class Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="text-lg font-bold text-gray-900">
                                                {classItem.name}
                                            </h4>
                                            <span
                                                className="px-2 py-1 rounded-full text-xs font-semibold text-white"
                                                style={{ backgroundColor: classItem.program.color }}
                                            >
                                                {classItem.program.name}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                <span>{classItem.instructor.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                <span>{classItem.location.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                <span>
                                                    {classItem.capacity.available} spots available
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price & CTA */}
                                    <div className="text-right ml-6">
                                        <p className="text-2xl font-bold text-primary mb-2">
                                            ${classItem.pricing.singleClass}
                                        </p>
                                        <button id="booking-schedule-view-btn" className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                                            {classItem.capacity.available === 0 ? 'Waitlist' : 'Book'}
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
