'use client';

import type { Student } from '@/types/student';

interface ParentInfoProps {
    student: Student;
}

export default function ParentInfo({ student }: ParentInfoProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Parent/Guardian Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="text-lg font-medium text-gray-900">
                        {student.parentFirstName} {student.parentLastName}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <a
                        href={`mailto:${student.parentEmail}`}
                        className="text-lg font-medium text-blue-600 hover:text-blue-700"
                    >
                        {student.parentEmail}
                    </a>
                </div>
                <div>
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <a
                        href={`tel:${student.parentPhone}`}
                        className="text-lg font-medium text-blue-600 hover:text-blue-700"
                    >
                        {student.parentPhone}
                    </a>
                </div>
                <div>
                    <p className="text-sm text-gray-600 mb-1">Parent ID</p>
                    <p className="text-lg font-medium text-gray-900">{student.parentId}</p>
                </div>
            </div>
        </div>
    );
}
