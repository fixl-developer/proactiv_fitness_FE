'use client';

import { useState, useEffect } from 'react';
import { schedulesApi } from '@/lib/api/schedules';
import type { Schedule, ScheduleFilters } from '@/types/schedule';
import { toast } from 'sonner';

type ViewMode = 'day' | 'week' | 'month';

export default function ScheduleCalendar() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [filters, setFilters] = useState<ScheduleFilters>({});

    useEffect(() => {
        loadSchedules();
    }, [currentDate, viewMode, filters]);

    const loadSchedules = async () => {
        try {
            setLoading(true);
            const { startDate, endDate } = getDateRange();
            const result = await schedulesApi.getAll({
                ...filters,
                startDate,
                endDate,
            });
            setSchedules(result.schedules);
        } catch (error) {
            toast.error('Failed to load schedules');
        } finally {
            setLoading(false);
        }
    };

    const getDateRange = () => {
        const start = new Date(currentDate);
        const end = new Date(currentDate);

        switch (viewMode) {
            case 'day':
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                break;
            case 'week':
                start.setDate(start.getDate() - start.getDay());
                end.setDate(start.getDate() + 6);
                break;
            case 'month':
                start.setDate(1);
                end.setMonth(end.getMonth() + 1, 0);
                break;
        }

        return {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
        };
    };

    const navigateDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);

        switch (viewMode) {
            case 'day':
                newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
                break;
            case 'week':
                newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
                break;
            case 'month':
                newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
                break;
        }

        setCurrentDate(newDate);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'in-progress':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'completed':
                return 'bg-gray-100 text-gray-800 border-gray-300';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
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
            {/* Calendar Header */}
            <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigateDate('prev')}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <h2 className="text-xl font-semibold text-gray-900">
                            {currentDate.toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric',
                                ...(viewMode === 'day' && { day: 'numeric' }),
                            })}
                        </h2>

                        <button
                            onClick={() => navigateDate('next')}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                            Today
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('day')}
                            className={`px-4 py-2 text-sm rounded-lg ${viewMode === 'day'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Day
                        </button>
                        <button
                            onClick={() => setViewMode('week')}
                            className={`px-4 py-2 text-sm rounded-lg ${viewMode === 'week'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => setViewMode('month')}
                            className={`px-4 py-2 text-sm rounded-lg ${viewMode === 'month'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Month
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-lg shadow-sm p-4">
                {schedules.length > 0 ? (
                    <div className="space-y-2">
                        {schedules.map((schedule) => (
                            <div
                                key={schedule.id}
                                className={`p-4 border-l-4 rounded-lg ${getStatusColor(schedule.status)}`}
                            >
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
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">
                                            {schedule.enrolled}/{schedule.maxCapacity}
                                        </p>
                                        <p className="text-xs text-gray-500">enrolled</p>
                                        {schedule.waitlist > 0 && (
                                            <p className="text-xs text-orange-600 mt-1">
                                                {schedule.waitlist} waitlist
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {schedule.hasConflicts && (
                                    <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <span>Has conflicts</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-600">No schedules for this period</p>
                    </div>
                )}
            </div>
        </div>
    );
}
