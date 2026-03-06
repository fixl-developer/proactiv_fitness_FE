'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { staffApi } from '@/lib/api/staff';
import type { Staff } from '@/types/staff';
import { toast } from 'sonner';
import CertificationTracker from '@/components/staff/CertificationTracker';
import AvailabilitySchedule from '@/components/staff/AvailabilitySchedule';
import PerformanceMetrics from '@/components/staff/PerformanceMetrics';

export default function StaffDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [staff, setStaff] = useState<Staff | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStaff();
    }, [params.id]);

    const loadStaff = async () => {
        try {
            setLoading(true);
            const data = await staffApi.getById(params.id as string);
            setStaff(data);
        } catch (error) {
            toast.error('Failed to load staff member');
            router.push('/staff');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!staff) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Staff member not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {staff.firstName} {staff.lastName}
                </h1>
                <p className="text-gray-600">{staff.email} • {staff.phone}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div>
                        <p className="text-sm text-gray-600">Role</p>
                        <p className="font-medium text-gray-900 capitalize">{staff.role}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="font-medium text-gray-900 capitalize">{staff.status}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Employment Type</p>
                        <p className="font-medium text-gray-900 capitalize">{staff.employmentType}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Hire Date</p>
                        <p className="font-medium text-gray-900">
                            {new Date(staff.hireDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            <PerformanceMetrics metrics={staff.performanceMetrics} />
            <CertificationTracker certifications={staff.certifications} />
            <AvailabilitySchedule availability={staff.availability} />
        </div>
    );
}
