'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { studentsApi } from '@/lib/api/students';
import StudentProfile from '@/components/students/StudentProfile';
import type { Student } from '@/types/student';
import { toast } from 'sonner';
import Link from 'next/link';

export default function StudentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStudent();
    }, [params.id]);

    const loadStudent = async () => {
        try {
            setLoading(true);
            const data = await studentsApi.getById(params.id as string);
            setStudent(data);
        } catch (error) {
            toast.error('Failed to load student');
            router.push('/students');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this student?')) return;

        try {
            await studentsApi.delete(params.id as string);
            toast.success('Student deleted successfully');
            router.push('/students');
        } catch (error) {
            toast.error('Failed to delete student');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Student not found</p>
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

                <div className="flex gap-2">
                    <Link href={`/students/${student.id}/edit`}>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                            Edit
                        </button>
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>

            <StudentProfile student={student} />
        </div>
    );
}
