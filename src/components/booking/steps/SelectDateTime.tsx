'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';

interface SelectDateTimeProps {
    selectedDate: string;
    selectedTime: string;
    onSelect: (date: string, timeSlot: string) => void;
}

export default function SelectDateTime({ selectedDate, selectedTime, onSelect }: SelectDateTimeProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Generate next 30 days
    const generateDates = () => {
        const dates = [];
        const today = new Date();

        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const timeSlots = [
        { id: '09:00', time: '9:00 AM', available: true },
        { id: '10:00', time: '10:00 AM', available: true },
        { id: '11:00', time: '11:00 AM', available: false },
        { id: '14:00', time: '2:00 PM', available: true },
        { id: '15:00', time: '3:00 PM', available: true },
        { id: '16:00', time: '4:00 PM', available: true },
        { id: '17:00', time: '5:00 PM', available: false },
        { id: '18:00', time: '6:00 PM', available: true }
    ];

    const dates = generateDates();
    const today = new Date();

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const isToday = (date: Date) => {
        return date.toDateString() === today.toDateString();
    };

    const isTomorrow = (date: Date) => {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return date.toDateString() === tomorrow.toDateString();
    };

    const getDateLabel = (date: Date) => {
        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Select Date & Time
            </h2>
            <p className="text-gray-600 mb-8">
                Choose your preferred assessment date and time slot
            </p>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Date Selection */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Select Date
                    </h3>

                    <div className="grid grid-cols-7 gap-2">
                        {dates.slice(0, 14).map((date) => {
                            const dateStr = formatDate(date);
                            const isSelected = selectedDate === dateStr;
                            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                            return (
                                <button
                                    key={dateStr}
                                    onClick={() => onSelect(dateStr, selectedTime)}
                                    className={`p-3 rounded-xl text-center transition-all ${isSelected
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : isWeekend
                                                ? 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="text-xs font-medium mb-1">
                                        {getDateLabel(date)}
                                    </div>
                                    <div className="text-lg font-bold">
                                        {date.getDate()}
                                    </div>
                                    <div className="text-xs">
                                        {date.toLocaleDateString('en-US', { month: 'short' })}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Show more dates button */}
                    <button className="w-full mt-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Show more dates →
                    </button>
                </div>

                {/* Time Selection */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Select Time
                    </h3>

                    {selectedDate ? (
                        <div className="grid grid-cols-2 gap-3">
                            {timeSlots.map((slot) => {
                                const isSelected = selectedTime === slot.id;

                                return (
                                    <button
                                        key={slot.id}
                                        onClick={() => slot.available && onSelect(selectedDate, slot.id)}
                                        disabled={!slot.available}
                                        className={`p-4 rounded-xl font-medium transition-all ${!slot.available
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : isSelected
                                                    ? 'bg-blue-600 text-white shadow-lg'
                                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                    >
                                        {slot.time}
                                        {!slot.available && (
                                            <div className="text-xs mt-1">Unavailable</div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Please select a date first</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Selected Summary */}
            {selectedDate && selectedTime && (
                <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <h4 className="font-medium text-green-900 mb-2">
                        ✅ Assessment Scheduled
                    </h4>
                    <p className="text-green-700">
                        {new Date(selectedDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })} at {timeSlots.find(slot => slot.id === selectedTime)?.time}
                    </p>
                </div>
            )}
        </div>
    );
}