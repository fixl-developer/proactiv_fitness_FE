'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { schedulesApi } from '@/lib/api/schedules';
import type { Schedule } from '@/types/schedule';
import { toast } from 'sonner';

interface ScheduleFormProps {
    initialData?: Partial<Schedule>;
    scheduleId?: string;
}

export default function ScheduleForm({ initialData, scheduleId }: ScheduleFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        programId: initialData?.programId || '',
        locationId: initialData?.locationId || '',
        roomId: initialData?.roomId || '',
        date: initialData?.date || '',
        startTime: initialData?.startTime || '',
        endTime: initialData?.endTime || '',
        instructorIds: initialData?.instructorIds || [],
        assistantIds: initialData?.assistantIds || [],
        maxCapacity: initialData?.maxCapacity || 15,
        isRecurring: initialData?.isRecurring || false,
        recurrencePattern: initialData?.recurrencePattern || {
            frequency: 'weekly' as const,
            interval: 1,
            daysOfWeek: [],
        },
        notes: initialData?.notes || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Check for conflicts first
            const conflictCheck = await schedulesApi.checkConflicts(formData);

            if (conflictCheck.hasConflicts) {
                const proceed = confirm(
                    `This schedule has conflicts:\n${conflictCheck.conflicts.map(c => c.message).join('\n')}\n\nDo you want to proceed anyway?`
                );
                if (!proceed) {
                    setLoading(false);
                    return;
                }
            }

            if (scheduleId) {
                await schedulesApi.update(scheduleId, formData);
                toast.success('Schedule updated successfully');
            } else {
                await schedulesApi.create(formData);
                toast.success('Schedule created successfully');
            }
            router.push('/schedule');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save schedule');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Program *</label>
                        <select
                            required
                            value={formData.programId}
                            onChange={(e) => handleChange('programId', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select Program</option>
                            {/* Programs will be loaded dynamically */}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                        <select
                            required
                            value={formData.locationId}
                            onChange={(e) => handleChange('locationId', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select Location</option>
                            {/* Locations will be loaded dynamically */}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Room *</label>
                        <select
                            required
                            value={formData.roomId}
                            onChange={(e) => handleChange('roomId', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select Room</option>
                            {/* Rooms will be loaded dynamically */}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity *</label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={formData.maxCapacity}
                            onChange={(e) => handleChange('maxCapacity', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Date & Time */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Date & Time</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                        <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={(e) => handleChange('date', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                        <input
                            type="time"
                            required
                            value={formData.startTime}
                            onChange={(e) => handleChange('startTime', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                        <input
                            type="time"
                            required
                            value={formData.endTime}
                            onChange={(e) => handleChange('endTime', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Recurrence */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Recurrence</h2>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.isRecurring}
                            onChange={(e) => handleChange('isRecurring', e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Recurring Schedule</span>
                    </label>
                </div>

                {formData.isRecurring && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                                <select
                                    value={formData.recurrencePattern.frequency}
                                    onChange={(e) => handleChange('recurrencePattern', {
                                        ...formData.recurrencePattern,
                                        frequency: e.target.value,
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Interval</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.recurrencePattern.interval}
                                    onChange={(e) => handleChange('recurrencePattern', {
                                        ...formData.recurrencePattern,
                                        interval: parseInt(e.target.value),
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {formData.recurrencePattern.frequency === 'weekly' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Days of Week</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => {
                                                const days = formData.recurrencePattern.daysOfWeek || [];
                                                const newDays = days.includes(index)
                                                    ? days.filter(d => d !== index)
                                                    : [...days, index];
                                                handleChange('recurrencePattern', {
                                                    ...formData.recurrencePattern,
                                                    daysOfWeek: newDays,
                                                });
                                            }}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium ${formData.recurrencePattern.daysOfWeek?.includes(index)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Notes</h2>
                <textarea
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any additional information about this schedule..."
                />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving...' : scheduleId ? 'Update Schedule' : 'Create Schedule'}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
