'use client';

import Image from 'next/image';
import type { Student } from '@/types/student';
import ParentInfo from './ParentInfo';
import MedicalInfo from './MedicalInfo';
import EmergencyContacts from './EmergencyContacts';
import EnrollmentHistory from './EnrollmentHistory';

interface StudentProfileProps {
    student: Student;
}

export default function StudentProfile({ student }: StudentProfileProps) {
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

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start gap-6">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {student.profileImage ? (
                            <Image
                                src={student.profileImage}
                                alt={`${student.firstName} ${student.lastName}`}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-gray-500">
                                {student.firstName[0]}{student.lastName[0]}
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {student.firstName} {student.lastName}
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    {student.age} years old • {student.gender}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(student.status)}`}>
                                {student.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div>
                                <p className="text-sm text-gray-600">Skill Level</p>
                                <p className="text-lg font-semibold text-gray-900 capitalize">{student.skillLevel}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Attendance Rate</p>
                                <p className="text-lg font-semibold text-gray-900">{student.attendanceRate}%</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Classes Attended</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {student.attendedClasses}/{student.totalClasses}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Enrolled Since</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {new Date(student.enrollmentDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Address</h2>
                <p className="text-gray-700">
                    {student.address.street}<br />
                    {student.address.city}, {student.address.state} {student.address.zipCode}<br />
                    {student.address.country}
                </p>
            </div>

            {/* Parent Information */}
            <ParentInfo student={student} />

            {/* Emergency Contacts */}
            <EmergencyContacts contacts={student.emergencyContacts} />

            {/* Medical Information */}
            <MedicalInfo medicalInfo={student.medicalInfo} />

            {/* Enrollment History */}
            <EnrollmentHistory programs={student.programs} />

            {/* Progress & Achievements */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Progress & Achievements</h2>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Current Level</h3>
                        <p className="text-gray-900">{student.currentLevel}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Skills Achieved</h3>
                        <div className="flex flex-wrap gap-2">
                            {student.skillsAchieved.map((skill, index) => (
                                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Certifications Earned</h3>
                        <div className="flex flex-wrap gap-2">
                            {student.certificationsEarned.map((cert, index) => (
                                <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                    {cert}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Summary</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Total Paid</p>
                        <p className="text-2xl font-bold text-green-600">${student.totalPaid.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Outstanding Balance</p>
                        <p className="text-2xl font-bold text-red-600">${student.outstandingBalance.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {student.notes && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{student.notes}</p>
                </div>
            )}
        </div>
    );
}
