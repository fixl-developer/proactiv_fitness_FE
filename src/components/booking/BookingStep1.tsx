'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import type { Student } from '@/types/booking';

interface BookingStep1Props {
    onNext: (studentId: string) => void;
    onBack: () => void;
}

export default function BookingStep1({ onNext, onBack }: BookingStep1Props) {
    const { user } = useAuthStore();
    const [selectedStudent, setSelectedStudent] = useState<string>('');
    const [showAddStudent, setShowAddStudent] = useState(false);

    // Mock students - replace with API call
    const students: Student[] = [
        {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '2015-05-15',
            gender: 'male',
            skillLevel: 'beginner',
            medicalConditions: [],
            emergencyContact: {
                name: 'Jane Doe',
                relationship: 'Mother',
                phone: '+1234567890',
            },
        },
    ];

    const handleNext = () => {
        if (selectedStudent) {
            onNext(selectedStudent);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Select Student</h2>
                <p className="mt-2 text-gray-600">
                    Choose which student will attend this class
                </p>
            </div>

            {/* Students List */}
            <div className="space-y-4">
                {students.map((student) => (
                    <div
                        key={student.id}
                        onClick={() => setSelectedStudent(student.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedStudent === student.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    {student.firstName} {student.lastName}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Age: {new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear()} years
                                </p>
                                <p className="text-sm text-gray-600 capitalize">
                                    Skill Level: {student.skillLevel}
                                </p>
                            </div>
                            <div
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedStudent === student.id
                                        ? 'border-blue-500 bg-blue-500'
                                        : 'border-gray-300'
                                    }`}
                            >
                                {selectedStudent === student.id && (
                                    <svg
                                        className="w-4 h-4 text-white"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path d="M5 13l4 4L19 7"></path>
                                    </svg>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Student Button */}
            <button
                onClick={() => setShowAddStudent(true)}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
                + Add New Student
            </button>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
                <button
                    onClick={onBack}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Back to Class
                </button>
                <button
                    onClick={handleNext}
                    disabled={!selectedStudent}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    Continue to Packages
                </button>
            </div>
        </div>
    );
}
