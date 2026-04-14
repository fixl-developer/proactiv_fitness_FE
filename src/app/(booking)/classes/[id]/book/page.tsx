'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api/client';
import BookingStep1 from '@/components/booking/BookingStep1';
import BookingStep2 from '@/components/booking/BookingStep2';
import BookingStep3 from '@/components/booking/BookingStep3';
import BookingStep4 from '@/components/booking/BookingStep4';

export default function BookClassPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, user, isLoading: authLoading } = useAuth();
    const classId = params.id as string;

    const [currentStep, setCurrentStep] = useState(1);
    const [isBooking, setIsBooking] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [bookingData, setBookingData] = useState({
        studentId: '',
        packageId: '',
        paymentData: null as any,
        bookingId: '',
    });

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push(`/login?redirectTo=${encodeURIComponent(`/classes/${classId}/book`)}`);
        }
    }, [authLoading, isAuthenticated, router, classId]);

    // Class details (in production, fetch from API)
    const classDetails = {
        id: classId,
        name: 'Gymnastics Class',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        location: 'ProGym Center',
    };

    const handleStep1Next = (studentId: string) => {
        setBookingData((prev) => ({ ...prev, studentId }));
        setCurrentStep(2);
    };

    const handleStep2Next = (packageId: string) => {
        setBookingData((prev) => ({ ...prev, packageId }));
        setCurrentStep(3);
    };

    const handleStep3Next = async (paymentData: any) => {
        setBookingData((prev) => ({ ...prev, paymentData }));
        setIsBooking(true);
        setBookingError(null);

        try {
            // Call actual booking API with auth token
            const result = await apiClient.post('/bookings/class', {
                classId: classDetails.id,
                className: classDetails.name,
                classDate: classDetails.date,
                classTime: classDetails.time,
                location: classDetails.location,
                price: 320,
                childName: user?.name || '',
                notes: paymentData.paymentMethod === 'cash' ? 'Payment: Cash' : 'Payment: Card',
            });

            if (result.success) {
                setBookingData((prev) => ({
                    ...prev,
                    bookingId: result.data.bookingId,
                }));
                setCurrentStep(4);
            } else {
                setBookingError(result.message || 'Failed to create booking');
            }
        } catch (err: any) {
            console.error('Booking error:', err);
            if (err.response?.status === 401) {
                router.push(`/login?redirectTo=${encodeURIComponent(`/classes/${classId}/book`)}`);
            } else {
                setBookingError(err.response?.data?.message || 'Failed to create booking. Please try again.');
            }
        } finally {
            setIsBooking(false);
        }
    };

    const handleBackToClass = () => {
        router.push(`/classes`);
    };

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    // Don't render if not authenticated (will redirect)
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
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
                            totalAmount={320}
                        />
                    )}

                    {currentStep === 4 && (
                        <BookingStep4
                            bookingId={bookingData.bookingId}
                            classDetails={classDetails}
                            studentName={user?.name || 'Student'}
                            packageName="8 Sessions Package"
                            amount={320}
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
