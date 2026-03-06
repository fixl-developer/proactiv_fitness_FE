'use client';

import { useState } from 'react';

interface WaitlistStudent {
    id: string;
    name: string;
    program: string;
    waitingSince: string;
    priority: number;
    alternativeSlots: string[];
}

export default function WaitlistOptimizer() {
    const [students] = useState<WaitlistStudent[]>([
        {
            id: '1',
            name: 'Emma Johnson',
            program: 'Advanced Gymnastics',
            waitingSince: '2026-02-15',
            priority: 1,
            alternativeSlots: ['Tuesday 5PM', 'Thursday 4PM'],
        },
        {
            id: '2',
            name: 'Liam Smith',
            program: 'Beginner Multi-Activity',
            waitingSince: '2026-02-20',
            priority: 2,
            alternativeSlots: ['Monday 4PM', 'Wednesday 5PM'],
        },
    ]);

    const handleMove = (studentId: string, slot: string) => {
        console.log(`Moving student ${studentId} to ${slot}`);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Waitlist Optimization</h3>

            <div className="space-y-4">
                {students.map((student) => (
                    <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h4 className="font-medium text-gray-900">{student.name}</h4>
                                <p className="text-sm text-gray-600">{student.program}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Waiting since {new Date(student.waitingSince).toLocaleDateString()}
                                </p>
                            </div>
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                                Priority {student.priority}
                            </span>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Available Alternative Slots:</p>
                            <div className="flex flex-wrap gap-2">
                                {student.alternativeSlots.map((slot, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleMove(student.id, slot)}
                                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm"
                                    >
                                        Move to {slot}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {students.length === 0 && (
                <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-600">No students on waitlist</p>
                </div>
            )}
        </div>
    );
}
