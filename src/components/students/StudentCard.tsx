'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Student } from '@/types/student';

interface StudentCardProps {
    student: Student;
    onUpdate: () => void;
}

export default function StudentCard({ student, onUpdate }: StudentCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-gray-100 text-gray-800';
            case 'suspended':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getSkillLevelColor = (level: string) => {
        switch (level) {
            case 'beginner':
                return 'bg-blue-100 text-blue-800';
            case 'intermediate':
                return 'bg-yellow-100 text-yellow-800';
            case 'advanced':
                return 'bg-orange-100 text-orange-800';
            case 'elite':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Link href={`/students/${student.id}`}>
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer">
                <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {student.profileImage ? (
                            <Image
                                src={student.profileImage}
                                alt={`${student.firstName} ${student.lastName}`}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
                                {student.firstName[0]}{student.lastName[0]}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {student.firstName} {student.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">Age: {student.age}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                                {student.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(student.skillLevel)}`}>
                                {student.skillLevel}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-600">Attendance</p>
                            <p className="font-semibold text-gray-900">{student.attendanceRate}%</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Programs</p>
                            <p className="font-semibold text-gray-900">{student.programs.length}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-xs text-gray-500">
                        Parent: {student.parentFirstName} {student.parentLastName}
                    </p>
                    <p className="text-xs text-gray-500">{student.parentEmail}</p>
                </div>
            </div>
        </Link>
    );
}
