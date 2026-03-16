'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BookingStep1 from '@/components/booking/BookingStep1';
import BookingStep2 from '@/components/booking/BookingStep2';
import BookingStep3 from '@/components/booking/BookingStep3';
import BookingStep4 from '@/components/booking/BookingStep4';

export default function BookClassPage() {
    const params = useParams();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [bookingData, setBookingData] = useState({
        studentId: '',
        packageId: '',
        paymentData: null as any,
        bookingId: '',
    });

    // Mock class data - replace with API call
    const classDetails = {
        id: params.id as string,
        name: 'Beginner Gymnastics',
        date: '2026-03-15',
        time: '10:00 AM',
        location: 'Downtown Center',
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

        // TODO: Call booking API
        // const response = await createBooking({
        //     classId: classDetails.id,
        //     studentId: bookingData.studentId,
        //     packageId: bookingData.packageId,
        //     paymentData,
        // });

        // Mock booking ID
        const mockBookingId = 'BK' + Date.now().toString().slice(-8);
        setBookingData((prev) => ({ ...prev, bookingId: mockBookingId }));
        setCurrentStep(4);
    };

    const handleBackToClass = () => {
        router.push(`/classes/${classDetails.id}`);
    };

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
                            studentName="John Doe"
                            packageName="8 Sessions Package"
                            amount={320}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
