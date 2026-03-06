'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Staff } from '@/types/staff';

interface StaffCardProps {
    staff: Staff;
    onUpdate: () => void;
}

export default function StaffCard({ staff, onUpdate }: StaffCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-gray-100 text-gray-800';
            case 'on-leave':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'instructor':
                return 'bg-blue-100 text-blue-800';
            case 'coach':
                return 'bg-purple-100 text-purple-800';
            case 'manager':
                return 'bg-orange-100 text-orange-800';
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'support':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Link href={`/staff/${staff.id}`}>
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer">
                <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {staff.profileImage ? (
                            <Image
                                src={staff.profileImage}
                                alt={`${staff.firstName} ${staff.lastName}`}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
                                {staff.firstName[0]}{staff.lastName[0]}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {staff.firstName} {staff.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{staff.email}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(staff.role)}`}>
                                {staff.role}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(staff.status)}`}>
                                {staff.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Classes Taught</span>
                        <span className="font-semibold text-gray-900">{staff.performanceMetrics.classesTaught}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Rating</span>
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-semibold text-gray-900">{staff.performanceMetrics.averageRating.toFixed(1)}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Certifications</span>
                        <span className="font-semibold text-gray-900">{staff.certifications.length}</span>
                    </div>
                </div>

                {staff.backgroundCheckStatus === 'expired' && (
                    <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                        Background check expired
                    </div>
                )}
            </div>
        </Link>
    );
}
