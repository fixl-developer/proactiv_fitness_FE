'use client';

import { useState } from 'react';
import { attendanceApi } from '@/lib/api/attendance';
import { toast } from 'sonner';

export default function CheckInInterface() {
    const [studentId, setStudentId] = useState('');
    const [scheduleId, setScheduleId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCheckIn = async () => {
        if (!studentId || !scheduleId) {
            toast.error('Please select student and schedule');
            return;
        }

        try {
            setLoading(true);
            await attendanceApi.checkIn({ studentId, scheduleId });
            toast.success('Student checked in successfully');
            setStudentId('');
            setScheduleId('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to check in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Check-In</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                    <select
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select Student</option>
                        {/* Students will be loaded dynamically */}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class Schedule</label>
                    <select
                        value={scheduleId}
                        onChange={(e) => setScheduleId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select Schedule</option>
                        {/* Schedules will be loaded dynamically */}
                    </select>
                </div>

                <button
                    onClick={handleCheckIn}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {loading ? 'Checking In...' : 'Check In Student'}
                </button>
            </div>
        </div>
    );
}
