'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ClassCard } from './ClassCard';
import type { WeekDay } from '@/types/booking';

interface WeekViewProps {
    weekData: WeekDay[];
    currentWeek: Date;
    onWeekChange: (direction: 'prev' | 'next') => void;
    isLoading?: boolean;
}

export function WeekView({
    weekData,
    currentWeek,
    onWeekChange,
    isLoading,
}: WeekViewProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div>
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-6">
                <button id="booking-week-view-btn"
                    onClick={() => onWeekChange('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <h3 className="text-lg font-semibold">
                    Week of {currentWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>

                <button id="booking-week-view-btn-2"
                    onClick={() => onWeekChange('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Week Days */}
            <div className="space-y-6">
                {weekData.map((dayData) => (
                    <div key={dayData.date} className="bg-white rounded-lg shadow-md p-6">
                        {/* Day Header */}
                        <div className="flex items-center justify-between mb-4 pb-4 border-b">
                            <div>
                                <h4 className="text-xl font-bold text-gray-900">{dayData.day}</h4>
                                <p className="text-sm text-gray-600">{dayData.date}</p>
                            </div>
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                                {dayData.classes.length} classes
                            </span>
                        </div>

                        {/* Classes */}
                        {dayData.classes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {dayData.classes.map((classItem) => (
                                    <ClassCard key={classItem.id} classItem={classItem} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No classes scheduled</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
