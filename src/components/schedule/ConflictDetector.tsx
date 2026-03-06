'use client';

import type { ScheduleConflict } from '@/types/schedule';

interface ConflictDetectorProps {
    conflicts: ScheduleConflict[];
}

export default function ConflictDetector({ conflicts }: ConflictDetectorProps) {
    if (conflicts.length === 0) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">No conflicts detected</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {conflicts.map((conflict, index) => (
                <div
                    key={index}
                    className={`border rounded-lg p-4 ${conflict.severity === 'error'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-yellow-50 border-yellow-200'
                        }`}
                >
                    <div className="flex items-start gap-2">
                        <svg
                            className={`w-5 h-5 mt-0.5 ${conflict.severity === 'error' ? 'text-red-600' : 'text-yellow-600'
                                }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                            <p className={`font-medium ${conflict.severity === 'error' ? 'text-red-800' : 'text-yellow-800'
                                }`}>
                                {conflict.type === 'instructor' && 'Instructor Conflict'}
                                {conflict.type === 'room' && 'Room Conflict'}
                                {conflict.type === 'capacity' && 'Capacity Issue'}
                            </p>
                            <p className={`text-sm mt-1 ${conflict.severity === 'error' ? 'text-red-700' : 'text-yellow-700'
                                }`}>
                                {conflict.message}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
