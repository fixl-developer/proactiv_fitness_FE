'use client';

import type { StaffAvailability } from '@/types/staff';

interface AvailabilityScheduleProps {
    availability: StaffAvailability[];
}

export default function AvailabilitySchedule({ availability }: AvailabilityScheduleProps) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Availability Schedule</h2>

            <div className="space-y-2">
                {daysOfWeek.map((day, index) => {
                    const dayAvailability = availability.find(a => a.dayOfWeek === index);

                    return (
                        <div key={day} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <span className="font-medium text-gray-900">{day}</span>
                            {dayAvailability && dayAvailability.isAvailable ? (
                                <span className="text-sm text-green-600">
                                    {dayAvailability.startTime} - {dayAvailability.endTime}
                                </span>
                            ) : (
                                <span className="text-sm text-gray-500">Not Available</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
