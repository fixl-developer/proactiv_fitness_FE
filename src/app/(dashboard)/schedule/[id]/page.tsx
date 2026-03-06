'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { schedulesApi } from '@/lib/api/schedules';
import type { Schedule } from '@/types/schedule';
import { toast } from 'sonner';
import ConflictDetector from '@/components/schedule/ConflictDetector';

export default function ScheduleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [schedule, setSchedule] = useState<Schedule | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSchedule();
    }, [params.id]);

    const loadSchedule = async () => {
        try {
            setLoading(true);
            const data = await schedulesApi.getById(params.id as string);
            setSchedule(data);
        } catch (error) {
            toast.error('Failed to load schedule');
            router.push('/schedule');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!schedule) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Schedule not found</p>
            </div>
        );
    }

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
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{schedule.programName}</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Location & Room</h3>
                        <p className="text-gray-900">{schedule.locationName}</p>
                        <p className="text-gray-600">{schedule.roomName}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Date & Time</h3>
                        <p className="text-gray-900">{new Date(schedule.date).toLocaleDateString()}</p>
                        <p className="text-gray-600">{schedule.startTime} - {schedule.endTime}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Instructors</h3>
                        <p className="text-gray-900">{schedule.instructorNames.join(', ')}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Capacity</h3>
                        <p className="text-gray-900">{schedule.enrolled}/{schedule.maxCapacity}</p>
                        {schedule.waitlist > 0 && (
                            <p className="text-orange-600">{schedule.waitlist} on waitlist</p>
                        )}
                    </div>
                </div>

                {schedule.notes && (
                    <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
                        <p className="text-gray-900">{schedule.notes}</p>
                    </div>
                )}
            </div>

            {schedule.hasConflicts && (
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Conflicts</h2>
                    <ConflictDetector conflicts={schedule.conflicts} />
                </div>
            )}
        </div>
    );
}
