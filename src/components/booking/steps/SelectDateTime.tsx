'use client';

import { useState, useMemo } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface SelectDateTimeProps {
    selectedDate: string;
    selectedTime: string;
    onSelect: (date: string, timeSlot: string) => void;
}

const ALL_SLOTS = [
    { id: '09:00', time: '9:00 AM', hour: 9 },
    { id: '10:00', time: '10:00 AM', hour: 10 },
    { id: '11:00', time: '11:00 AM', hour: 11 },
    { id: '14:00', time: '2:00 PM', hour: 14 },
    { id: '15:00', time: '3:00 PM', hour: 15 },
    { id: '16:00', time: '4:00 PM', hour: 16 },
    { id: '17:00', time: '5:00 PM', hour: 17 },
    { id: '18:00', time: '6:00 PM', hour: 18 },
];

export default function SelectDateTime({ selectedDate, selectedTime, onSelect }: SelectDateTimeProps) {
    // 14 days visible by default; clicking "Show more" reveals up to 60 days
    const [visibleDays, setVisibleDays] = useState(14);

    const dates = useMemo(() => {
        const list: Date[] = [];
        const today = new Date();
        for (let i = 0; i < 60; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            list.push(d);
        }
        return list;
    }, []);

    const today = new Date();
    const formatDate = (date: Date) => {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().split('T')[0];
    };
    const isToday = (date: Date) => date.toDateString() === today.toDateString();
    const isTomorrow = (date: Date) => {
        const t = new Date(today); t.setDate(today.getDate() + 1);
        return date.toDateString() === t.toDateString();
    };
    const getDateLabel = (date: Date) => {
        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    // A slot is unavailable when:
    //   • the chosen date is today and the slot hour <= current hour, or
    //   • we want to mark certain slots fully unavailable (e.g. fully-booked)
    const isSlotAvailable = (slotHour: number): boolean => {
        if (!selectedDate) return true;
        const picked = new Date(selectedDate);
        if (picked.toDateString() === today.toDateString()) {
            // Disable any slot whose start hour has passed
            return slotHour > today.getHours();
        }
        return true;
    };

    const handleShowMore = () => {
        setVisibleDays((v) => Math.min(v + 14, 60));
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
                        {dates.slice(0, visibleDays).map((date, index) => {
                            const dateStr = formatDate(date);
                            const isSelected = selectedDate === dateStr;
                            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                            return (
                                <button id={`select-datetime-date-${index}-btn`}
                                    type="button"
                                    key={dateStr}
                                    onClick={() => {
                                        // Reset time slot when changing date (avoid mismatched past-slot state)
                                        onSelect(dateStr, '');
                                    }}
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

                    {/* Show more dates button — reveals 14 more days each click, up to 60 */}
                    {visibleDays < 60 && (
                        <button
                            id="select-datetime-show-more-btn"
                            type="button"
                            onClick={handleShowMore}
                            className="w-full mt-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-sm rounded-xl transition-colors"
                        >
                            Show more dates → ({60 - visibleDays} more days)
                        </button>
                    )}
                </div>

                {/* Time Selection */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Select Time
                    </h3>

                    {selectedDate ? (
                        <div className="grid grid-cols-2 gap-3">
                            {ALL_SLOTS.map((slot) => {
                                const isSelected = selectedTime === slot.id;
                                const available = isSlotAvailable(slot.hour);

                                return (
                                    <button id={`select-datetime-time-${slot.id}-btn`}
                                        type="button"
                                        key={slot.id}
                                        onClick={() => available && onSelect(selectedDate, slot.id)}
                                        disabled={!available}
                                        title={!available ? 'This time has already passed for today' : undefined}
                                        className={`p-4 rounded-xl font-medium transition-all ${!available
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                                            : isSelected
                                                ? 'bg-blue-600 text-white shadow-lg'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                    >
                                        {slot.time}
                                        {!available && (
                                            <div className="text-xs mt-1 not-italic no-underline">Past</div>
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
                        })} at {ALL_SLOTS.find(slot => slot.id === selectedTime)?.time}
                    </p>
                </div>
            )}
        </div>
    );
}
