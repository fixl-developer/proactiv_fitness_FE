'use client';

import { useState, useEffect } from 'react';
import { schedulesApi } from '@/lib/api/schedules';
import type { Schedule, ScheduleFilters } from '@/types/schedule';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ScheduleList() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<ScheduleFilters>({});

    useEffect(() => {
        loadSchedules();
    }, [filters]);

    const loadSchedules = async () => {
        try {
            setLoading(true);
            const result = await schedulesApi.getAll(filters);
            setSchedules(result.schedules);
        } catch (error) {
            toast.error('Failed to load schedules');
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async (id: string) => {
        try {
            await schedulesApi.publish(id);
            toast.success('Schedule published successfully');
            loadSchedules();
        } catch (error) {
            toast.error('Failed to publish schedule');
        }
    };

    const handleCancel = async (id: string) => {
        const reason = prompt('Enter cancellation reason:');
        if (!reason) return;

        try {
            await schedulesApi.cancel(id, reason);
            toast.success('Schedule cancelled successfully');
            loadSchedules();
        } catch (error) {
            toast.error('Failed to cancel schedule');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {schedules.map((schedule) => (
                <div key={schedule.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{schedule.programName}</h3>
                            <p className="text-sm text-gray-600">{schedule.locationName} - {schedule.roomName}</p>
                            <p className="text-sm text-gray-600 mt-1">
                                {new Date(schedule.date).toLocaleDateString()} • {schedule.startTime} - {schedule.endTime}
                            </p>
                            <p className="text-sm text-gray-600">
                                Instructors: {schedule.instructorNames.join(', ')}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${schedule.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                    schedule.status === 'in-progress' ? 'bg-green-100 text-green-800' :
                                        schedule.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                            'bg-red-100 text-red-800'
                                }`}>
                                {schedule.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${schedule.publishStatus === 'published'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {schedule.publishStatus}
                            </span>
                            <p className="text-sm text-gray-600">
                                {schedule.enrolled}/{schedule.maxCapacity} enrolled
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                        <Link href={`/schedule/${schedule.id}`}>
                            <button className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50">
                                View
                            </button>
                        </Link>
                        {schedule.publishStatus === 'draft' && (
                            <button
                                onClick={() => handlePublish(schedule.id)}
                                className="px-3 py-1 text-sm text-green-600 border border-green-300 rounded hover:bg-green-50"
                            >
                                Publish
                            </button>
                        )}
                        {schedule.status === 'scheduled' && (
                            <button
                                onClick={() => handleCancel(schedule.id)}
                                className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
