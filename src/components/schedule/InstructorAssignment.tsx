'use client';

import { useState } from 'react';

interface Instructor {
    id: string;
    name: string;
    certifications: string[];
    available: boolean;
}

interface InstructorAssignmentProps {
    selectedInstructors: string[];
    onChange: (instructorIds: string[]) => void;
}

export default function InstructorAssignment({ selectedInstructors, onChange }: InstructorAssignmentProps) {
    const [instructors] = useState<Instructor[]>([
        // Mock data - will be loaded from API
        { id: '1', name: 'John Doe', certifications: ['Gymnastics Level 1'], available: true },
        { id: '2', name: 'Jane Smith', certifications: ['Gymnastics Level 2'], available: true },
        { id: '3', name: 'Mike Johnson', certifications: ['Multi-Activity'], available: false },
    ]);

    const toggleInstructor = (instructorId: string) => {
        if (selectedInstructors.includes(instructorId)) {
            onChange(selectedInstructors.filter(id => id !== instructorId));
        } else {
            onChange([...selectedInstructors, instructorId]);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructor Assignment</h2>

            <div className="space-y-3">
                {instructors.map((instructor) => (
                    <div
                        key={instructor.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedInstructors.includes(instructor.id)
                                ? 'border-blue-600 bg-blue-50'
                                : instructor.available
                                    ? 'border-gray-200 hover:border-gray-300'
                                    : 'border-gray-200 opacity-50 cursor-not-allowed'
                            }`}
                        onClick={() => instructor.available && toggleInstructor(instructor.id)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedInstructors.includes(instructor.id)
                                        ? 'border-blue-600 bg-blue-600'
                                        : 'border-gray-300'
                                    }`}>
                                    {selectedInstructors.includes(instructor.id) && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{instructor.name}</p>
                                    <p className="text-sm text-gray-600">
                                        {instructor.certifications.join(', ')}
                                    </p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${instructor.available
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                {instructor.available ? 'Available' : 'Unavailable'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {selectedInstructors.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                        {selectedInstructors.length} instructor(s) selected
                    </p>
                </div>
            )}
        </div>
    );
}
