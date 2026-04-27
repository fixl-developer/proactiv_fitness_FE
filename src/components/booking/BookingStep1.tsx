'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader, AlertCircle, Plus, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api/client';
import { validateName, filterNameInput } from '@/utils/validation';

interface BookingStep1Props {
    onNext: (studentId: string, studentName: string) => void;
    onBack: () => void;
}

interface StudentOption {
    id: string;
    name: string;
    age?: number;
    skillLevel?: string;
    isSelf?: boolean;
}

export default function BookingStep1({ onNext, onBack }: BookingStep1Props) {
    const { user } = useAuth();
    const router = useRouter();
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [students, setStudents] = useState<StudentOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [manualName, setManualName] = useState('');
    const [manualNameError, setManualNameError] = useState<string | null>(null);
    const [showManual, setShowManual] = useState(false);

    const role = String((user as any)?.role || '').toLowerCase();
    const isParent = role === 'parent';

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setLoadError(null);
            try {
                if (isParent) {
                    // Fetch parent's registered children
                    const res: any = await apiClient.get('/parent/children');
                    const list: any[] = res?.data || [];
                    const mapped: StudentOption[] = list.map((c: any) => ({
                        id: c.id || c._id,
                        name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Child',
                        age: typeof c.age === 'number' ? c.age : undefined,
                        skillLevel: c.level || 'Beginner',
                    }));
                    if (cancelled) return;
                    setStudents(mapped);
                    // If parent has no kids, default to manual entry
                    if (mapped.length === 0) setShowManual(true);
                } else {
                    // Regular USER books for themselves
                    const selfName = user?.name || (user as any)?.firstName || 'You';
                    setStudents([
                        {
                            id: user?.id || 'self',
                            name: selfName,
                            isSelf: true,
                            skillLevel: 'Beginner',
                        },
                    ]);
                    setSelectedStudentId(user?.id || 'self');
                }
            } catch (err: any) {
                if (cancelled) return;
                console.warn('Failed to load students:', err);
                setLoadError('Could not load registered children. You can still book by entering a name.');
                setShowManual(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [isParent, user]);

    const handleNext = () => {
        if (showManual) {
            const err = validateName(manualName, "Student's name");
            if (err) {
                setManualNameError(err);
                toast.error(err);
                return;
            }
            onNext('manual', manualName.trim());
            return;
        }
        if (!selectedStudentId) {
            toast.error('Please select a student to continue');
            return;
        }
        const picked = students.find(s => s.id === selectedStudentId);
        onNext(selectedStudentId, picked?.name || '');
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">
                    {isParent ? 'Select Student' : 'Confirm Booking For'}
                </h2>
                <p className="mt-2 text-gray-600">
                    {isParent
                        ? "Choose which child will attend this class"
                        : 'This booking will be made under your account'}
                </p>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="ml-3 text-gray-600">Loading...</span>
                </div>
            )}

            {/* Load error banner */}
            {!loading && loadError && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 text-sm text-amber-800">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{loadError}</span>
                </div>
            )}

            {/* Students List */}
            {!loading && !showManual && students.length > 0 && (
                <div className="space-y-3">
                    {students.map((student) => (
                        <div
                            id={`booking-step1-student-${student.id}-btn`}
                            key={student.id}
                            onClick={() => setSelectedStudentId(student.id)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedStudentId === student.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                        {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {student.name}
                                            {student.isSelf && <span className="ml-2 text-xs font-normal text-gray-500">(You)</span>}
                                        </h3>
                                        {student.age !== undefined && student.age > 0 && (
                                            <p className="text-sm text-gray-600">Age: {student.age} years</p>
                                        )}
                                        {student.skillLevel && (
                                            <p className="text-sm text-gray-600 capitalize">Level: {student.skillLevel}</p>
                                        )}
                                    </div>
                                </div>
                                <div
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedStudentId === student.id
                                        ? 'border-blue-500 bg-blue-500'
                                        : 'border-gray-300'
                                        }`}
                                >
                                    {selectedStudentId === student.id && (
                                        <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                            <path d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Manual name entry (parent has no kids OR opted to type manually) */}
            {!loading && showManual && (
                <div>
                    <label htmlFor="manualStudentName" className="block text-sm font-medium text-gray-700 mb-2">
                        Student's Name *
                    </label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            id="manualStudentName"
                            value={manualName}
                            onChange={(e) => {
                                setManualName(e.target.value);
                                if (manualNameError) setManualNameError(null);
                            }}
                            onKeyDown={filterNameInput}
                            maxLength={50}
                            autoComplete="off"
                            placeholder="Enter the student's name"
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${manualNameError ? 'border-red-500' : 'border-gray-300'}`}
                        />
                    </div>
                    <p className={`text-xs mt-1 ${manualNameError ? 'text-red-600' : 'text-gray-500'}`}>
                        {manualNameError || 'Only letters, spaces, hyphens and apostrophes allowed'}
                    </p>
                    {isParent && (
                        <button
                            type="button"
                            onClick={() => router.push('/parent/children')}
                            className="mt-3 text-sm text-blue-600 hover:text-blue-700 underline"
                        >
                            Or register your child profile in My Children →
                        </button>
                    )}
                </div>
            )}

            {/* Add child / switch to manual entry — parent only, only when has children */}
            {!loading && isParent && !showManual && students.length > 0 && (
                <button
                    id="booking-step1-add-student-btn"
                    type="button"
                    onClick={() => setShowManual(true)}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Use a different name
                </button>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
                <button
                    id="booking-step1-back-btn"
                    type="button"
                    onClick={onBack}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Back to Class
                </button>
                <button
                    id="booking-step1-continue-btn"
                    type="button"
                    onClick={handleNext}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    Continue to Packages
                </button>
            </div>
        </div>
    );
}
