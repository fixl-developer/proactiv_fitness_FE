'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api/client';
import BookingStep1 from '@/components/booking/BookingStep1';
import BookingStep2 from '@/components/booking/BookingStep2';
import BookingStep3 from '@/components/booking/BookingStep3';
import BookingStep4 from '@/components/booking/BookingStep4';

interface ClassDetails {
    id: string;
    name: string;
    date: string;
    time: string;
    location: string;
    coach?: string;
    duration?: string;
    price?: number;
}

const PACKAGE_PRICES: Record<string, { name: string; price: number }> = {
    '1': { name: 'Single Session', price: 50 },
    '2': { name: '4 Sessions', price: 180 },
    '3': { name: '8 Sessions', price: 320 },
    '4': { name: '12 Sessions', price: 420 },
};

export default function BookClassPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, user, isLoading: authLoading } = useAuth();
    const classId = params.id as string;

    const [currentStep, setCurrentStep] = useState(1);
    const [isBooking, setIsBooking] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);

    const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
    const [classLoading, setClassLoading] = useState(true);
    const [classLoadError, setClassLoadError] = useState<string | null>(null);

    const [bookingData, setBookingData] = useState({
        studentId: '',
        studentName: '',
        packageId: '',
        packageName: '',
        packagePrice: 0,
        paymentData: null as any,
        bookingId: '',
    });

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push(`/login?redirectTo=${encodeURIComponent(`/classes/${classId}/book`)}`);
        }
    }, [authLoading, isAuthenticated, router, classId]);

    // Fetch real class details by classId. Tries the authenticated /bookings/browse
    // (which merges Sessions + Programs the same way the parent dashboard does) and
    // matches by id. Falls back to a minimal record so a stale link doesn't dead-end.
    useEffect(() => {
        if (!isAuthenticated || !classId) return;
        let cancelled = false;
        const load = async () => {
            setClassLoading(true);
            setClassLoadError(null);
            try {
                const res: any = await apiClient.get('/bookings/browse');
                const list: any[] = Array.isArray(res?.data) ? res.data : (res?.data?.data || []);
                const match = list.find((c: any) => String(c.id) === String(classId));
                if (cancelled) return;
                if (match) {
                    setClassDetails({
                        id: String(match.id),
                        name: match.program || match.className || 'Class',
                        date: match.date ? new Date(match.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                        time: match.time || '10:00',
                        location: match.location || 'TBA',
                        coach: match.coach || '',
                        duration: match.duration || '60 min',
                        price: typeof match.price === 'number' ? match.price : 0,
                    });
                } else {
                    setClassDetails({
                        id: classId,
                        name: 'Class Booking',
                        date: new Date().toISOString().split('T')[0],
                        time: '10:00',
                        location: 'TBA',
                    });
                    setClassLoadError("We couldn't find this class — proceeding with a generic booking.");
                }
            } catch (err: any) {
                if (cancelled) return;
                console.warn('Class details fetch failed:', err);
                setClassDetails({
                    id: classId,
                    name: 'Class Booking',
                    date: new Date().toISOString().split('T')[0],
                    time: '10:00',
                    location: 'TBA',
                });
                setClassLoadError('Could not load class details. You can still confirm the booking.');
            } finally {
                if (!cancelled) setClassLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [isAuthenticated, classId]);

    const handleStep1Next = (studentId: string, studentName: string) => {
        setBookingData((prev) => ({ ...prev, studentId, studentName }));
        setCurrentStep(2);
    };

    const handleStep2Next = (packageId: string) => {
        const pkg = PACKAGE_PRICES[packageId];
        setBookingData((prev) => ({
            ...prev,
            packageId,
            packageName: pkg?.name || 'Package',
            packagePrice: pkg?.price || 0,
        }));
        setCurrentStep(3);
    };

    const handleStep3Next = async (paymentData: any) => {
        if (!classDetails) {
            toast.error('Class details are still loading. Please wait a moment.');
            return;
        }

        setBookingData((prev) => ({ ...prev, paymentData }));
        setIsBooking(true);
        setBookingError(null);

        try {
            const childName = bookingData.studentName || user?.name || '';
            const paymentMethodLabel =
                paymentData.paymentMethod === 'cash' ? 'Cash on arrival'
                    : paymentData.paymentMethod === 'bank_transfer' ? 'Bank transfer'
                        : 'Card';

            const result = await apiClient.post('/bookings/class', {
                classId: classDetails.id,
                className: classDetails.name,
                classDate: classDetails.date,
                classTime: classDetails.time,
                location: classDetails.location,
                price: bookingData.packagePrice,
                childName,
                notes: `Package: ${bookingData.packageName} | Payment: ${paymentMethodLabel}`,
            });

            if (result.success) {
                setBookingData((prev) => ({
                    ...prev,
                    bookingId: result.data.bookingId || result.data.confirmationNumber || '',
                }));
                setCurrentStep(4);
                toast.success('Booking confirmed!');
            } else {
                const msg = result.message || 'Failed to create booking';
                setBookingError(msg);
                toast.error(msg);
            }
        } catch (err: any) {
            console.error('Booking error:', err);
            if (err.response?.status === 401) {
                toast.error('Your session expired — please log in again.');
                router.push(`/login?redirectTo=${encodeURIComponent(`/classes/${classId}/book`)}`);
            } else {
                const msg = err.response?.data?.message || err.message || 'Failed to create booking. Please try again.';
                setBookingError(msg);
                toast.error(msg);
            }
        } finally {
            setIsBooking(false);
        }
    };

    const handleBackToClass = () => {
        router.push(`/classes`);
    };

    // Show loading while checking auth or fetching class
    if (authLoading || (isAuthenticated && classLoading)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    // Don't render if not authenticated (will redirect)
    if (!isAuthenticated || !classDetails) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Class Summary Card (shows actual class info that's being booked) */}
                {currentStep < 4 && (
                    <div className="mb-6 bg-white rounded-lg shadow p-5 border border-gray-200">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{classDetails.name}</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {classDetails.date} • {classDetails.time}
                                    {classDetails.coach ? ` • Coach ${classDetails.coach}` : ''}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    📍 {classDetails.location}{classDetails.duration ? ` • ${classDetails.duration}` : ''}
                                </p>
                            </div>
                            {classLoadError && (
                                <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
                                    {classLoadError}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Progress Steps */}
                {currentStep < 4 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            {[1, 2, 3].map((step) => (
                                <div key={step} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center flex-1">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep >= step
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-600'
                                                }`}
                                        >
                                            {step}
                                        </div>
                                        <span
                                            className={`mt-2 text-sm ${currentStep >= step
                                                ? 'text-blue-600 font-medium'
                                                : 'text-gray-500'
                                                }`}
                                        >
                                            {step === 1 && 'Student'}
                                            {step === 2 && 'Package'}
                                            {step === 3 && 'Payment'}
                                        </span>
                                    </div>
                                    {step < 3 && (
                                        <div
                                            className={`h-1 flex-1 mx-4 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                                                }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Booking Error */}
                {bookingError && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        <p className="font-medium">Booking Error</p>
                        <p className="text-sm">{bookingError}</p>
                    </div>
                )}

                {/* Booking Form Card */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    {currentStep === 1 && (
                        <BookingStep1
                            onNext={handleStep1Next}
                            onBack={handleBackToClass}
                        />
                    )}

                    {currentStep === 2 && (
                        <BookingStep2
                            onNext={handleStep2Next}
                            onBack={() => setCurrentStep(1)}
                        />
                    )}

                    {currentStep === 3 && (
                        <BookingStep3
                            onNext={handleStep3Next}
                            onBack={() => setCurrentStep(2)}
                            totalAmount={bookingData.packagePrice || 0}
                        />
                    )}

                    {currentStep === 4 && (
                        <BookingStep4
                            bookingId={bookingData.bookingId}
                            classDetails={classDetails}
                            studentName={bookingData.studentName || user?.name || 'Student'}
                            packageName={bookingData.packageName || 'Package'}
                            amount={bookingData.packagePrice || 0}
                        />
                    )}

                    {/* Loading overlay during booking */}
                    {isBooking && (
                        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl p-8 text-center shadow-2xl">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                                <p className="text-gray-700 font-medium">Creating your booking...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
