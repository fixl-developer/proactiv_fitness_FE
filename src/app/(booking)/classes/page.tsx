'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ClassFilters } from '@/components/booking/ClassFilters';
import { ViewToggle } from '@/components/booking/ViewToggle';
import { GridView } from '@/components/booking/GridView';
import { WeekView } from '@/components/booking/WeekView';
import { ScheduleView } from '@/components/booking/ScheduleView';
import { bookingApi } from '@/lib/api/booking';
import type { Class, BookingFilters, ViewMode, WeekDay, TimeSlot } from '@/types/booking';
import { toast } from 'sonner';

export default function ClassesPage() {
    const searchParams = useSearchParams();
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [classes, setClasses] = useState<Class[]>([]);
    const [weekData, setWeekData] = useState<WeekDay[]>([]);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentWeek, setCurrentWeek] = useState(new Date());

    const [filters, setFilters] = useState<BookingFilters>({
        location: searchParams.get('location') || undefined,
        program: searchParams.get('program') || undefined,
        day: undefined,
        time: undefined,
        staff: undefined,
        date: undefined,
        skillLevel: undefined,
    });

    // Fetch classes based on view mode
    useEffect(() => {
        fetchClasses();
    }, [filters, viewMode, currentWeek]);

    const fetchClasses = async () => {
        setIsLoading(true);
        try {
            if (viewMode === 'grid') {
                const response = await bookingApi.getClasses(filters);
                setClasses(response.classes);
            } else if (viewMode === 'week') {
                const startDate = currentWeek.toISOString().split('T')[0];
                const response = await bookingApi.getWeekSchedule(
                    filters.location || 'all',
                    startDate
                );
                setWeekData(response);
            } else if (viewMode === 'schedule') {
                const date = filters.date || new Date().toISOString().split('T')[0];
                const response = await bookingApi.getTimeSlots(
                    filters.location || 'all',
                    date
                );
                setTimeSlots(response);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load classes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (newFilters: BookingFilters) => {
        setFilters(newFilters);
    };

    const handleClearFilters = () => {
        setFilters({});
    };

    const handleWeekChange = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentWeek);
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        setCurrentWeek(newDate);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse Classes</h1>
                    <p className="text-xl text-white/90">
                        Find the perfect class for your schedule and skill level
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {/* Filters */}
                <div className="mb-6">
                    <ClassFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                    />
                </div>

                {/* View Toggle & Results Count */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-gray-600">
                            {viewMode === 'grid' && (
                                <>
                                    Showing <span className="font-semibold">{classes.length}</span> classes
                                </>
                            )}
                            {viewMode === 'week' && (
                                <>
                                    Week of{' '}
                                    <span className="font-semibold">
                                        {currentWeek.toLocaleDateString()}
                                    </span>
                                </>
                            )}
                            {viewMode === 'schedule' && (
                                <>
                                    Schedule for{' '}
                                    <span className="font-semibold">
                                        {filters.date || 'today'}
                                    </span>
                                </>
                            )}
                        </p>
                    </div>

                    <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
                </div>

                {/* Views */}
                <div>
                    {viewMode === 'grid' && (
                        <GridView classes={classes} isLoading={isLoading} />
                    )}
                    {viewMode === 'week' && (
                        <WeekView
                            weekData={weekData}
                            currentWeek={currentWeek}
                            onWeekChange={handleWeekChange}
                            isLoading={isLoading}
                        />
                    )}
                    {viewMode === 'schedule' && (
                        <ScheduleView timeSlots={timeSlots} isLoading={isLoading} />
                    )}
                </div>
            </div>
        </div>
    );
}
