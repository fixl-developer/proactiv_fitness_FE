'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Calendar,
    CreditCard,
    CheckCircle,
    ArrowLeft,
    ArrowRight,
    MapPin,
    Clock,
    Users,
    AlertCircle,
    Phone,
    Mail,
    Baby
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/services/api/client';
import { toast } from 'sonner';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface TimeSlot {
    id: string;
    startTime: string;
    endTime: string;
    programType: 'class' | 'trial' | 'assessment' | 'party' | 'private';
    programName: string;
    coach: string;
    location: string;
    ageGroup: string;
    capacity: number;
    booked: number;
    price: number;
    level: string;
    date: string;
}

interface Child {
    id?: string;
    name: string;
    age: number;
    dateOfBirth: string;
    medicalNotes?: string;
    emergencyContact?: string;
}

interface BookingData {
    slot: TimeSlot;
    child: Child;
    parentInfo: {
        name: string;
        email: string;
        phone: string;
        emergencyContact: string;
    };
    paymentMethod: 'card' | 'package' | 'trial';
    specialRequests?: string;
}

interface BookingFlowProps {
    selectedSlot: TimeSlot;
    onComplete: (bookingData: BookingData) => void;
    onCancel: () => void;
    existingChildren?: Child[];
}

const BookingFlow: React.FC<BookingFlowProps> = ({
    selectedSlot,
    onComplete,
    onCancel,
    existingChildren = []
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [bookingData, setBookingData] = useState<Partial<BookingData>>({
        slot: selectedSlot
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const steps = [
        { number: 1, title: 'Child Information', icon: Baby },
        { number: 2, title: 'Parent Details', icon: User },
        { number: 3, title: 'Payment', icon: CreditCard },
        { number: 4, title: 'Confirmation', icon: CheckCircle }
    ];

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!bookingData.child?.name) newErrors.childName = 'Child name is required';
            if (!bookingData.child?.age) newErrors.childAge = 'Child age is required';
            if (!bookingData.child?.dateOfBirth) newErrors.childDob = 'Date of birth is required';
        }

        if (step === 2) {
            if (!bookingData.parentInfo?.name) newErrors.parentName = 'Parent name is required';
            if (!bookingData.parentInfo?.email) newErrors.parentEmail = 'Email is required';
            if (!bookingData.parentInfo?.phone) newErrors.parentPhone = 'Phone number is required';
            if (!bookingData.parentInfo?.emergencyContact) newErrors.emergencyContact = 'Emergency contact is required';
        }

        if (step === 3) {
            if (!bookingData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 4));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!validateStep(3)) return;

        // Hard auth gate — even though entry points already check, we double-check
        // here in case the token expired while the user was filling the form.
        if (!isAuthenticated) {
            const back = encodeURIComponent(pathname || '/book-now');
            router.push(`/login?redirectTo=${back}`);
            return;
        }

        setIsSubmitting(true);
        try {
            // Build the payload backend's createClassBooking expects.
            // The slot may be class/trial/assessment — route accordingly.
            const slot = selectedSlot;
            const isAssessment = slot.programType === 'assessment';

            const notesParts: string[] = [];
            if (bookingData.parentInfo?.name) notesParts.push(`parentName:${bookingData.parentInfo.name}`);
            if (bookingData.parentInfo?.email) notesParts.push(`parentEmail:${bookingData.parentInfo.email}`);
            if (bookingData.parentInfo?.phone) notesParts.push(`parentPhone:${bookingData.parentInfo.phone}`);
            if (bookingData.parentInfo?.emergencyContact) notesParts.push(`emergencyContact:${bookingData.parentInfo.emergencyContact}`);
            if (bookingData.paymentMethod) notesParts.push(`payment:${bookingData.paymentMethod}`);
            if (bookingData.specialRequests) notesParts.push(`requests:${bookingData.specialRequests}`);

            let res: any;
            if (isAssessment) {
                // Backend expects: program, childName, childAge, location, date, timeSlot, parentName, parentEmail, parentPhone
                res = await apiClient.post('/bookings/assessment', {
                    program: slot.programName,
                    childName: bookingData.child!.name,
                    childAge: Number(bookingData.child!.age) || 0,
                    location: slot.location,
                    date: slot.date,
                    timeSlot: slot.startTime,
                    parentName: bookingData.parentInfo!.name,
                    parentEmail: bookingData.parentInfo!.email,
                    parentPhone: bookingData.parentInfo!.phone,
                });
            } else {
                // Class/trial/party/private — use /bookings/class endpoint
                res = await apiClient.post('/bookings/class', {
                    classId: slot.id,
                    className: slot.programName,
                    classDate: slot.date,
                    classTime: slot.startTime,
                    location: slot.location,
                    price: slot.price || 0,
                    childName: bookingData.child!.name,
                    childAge: Number(bookingData.child!.age) || undefined,
                    notes: notesParts.join(' | '),
                });
            }

            const data = res?.data ?? res;
            const merged = { ...(bookingData as BookingData), bookingId: data?.confirmationNumber || data?.bookingId } as BookingData;
            onComplete(merged);
            setCurrentStep(4);
            toast.success('Booking confirmed!');
        } catch (error: any) {
            const msg =
                error?.response?.data?.message ||
                (Array.isArray(error?.response?.data?.errors) && error.response.data.errors.join(', ')) ||
                error?.message ||
                'Failed to create booking. Please try again.';
            // If unauthenticated, point user to login. apiClient already handles 401 refresh,
            // so a hard 401 here means refresh failed — bounce them to /login with redirectTo.
            if (error?.response?.status === 401) {
                const back = encodeURIComponent(pathname || '/book-now');
                toast.error('Your session expired — please log in again.');
                router.push(`/login?redirectTo=${back}`);
            } else {
                toast.error(msg);
            }
            console.error('Booking failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const StepIndicator = () => (
        <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                    <motion.div
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= step.number
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300 text-gray-400'
                            }`}
                        whileHover={{ scale: 1.05 }}
                        animate={{
                            backgroundColor: currentStep >= step.number ? '#2563eb' : '#ffffff',
                            borderColor: currentStep >= step.number ? '#2563eb' : '#d1d5db',
                            color: currentStep >= step.number ? '#ffffff' : '#9ca3af'
                        }}
                    >
                        <step.icon className="w-5 h-5" />
                    </motion.div>
                    {index < steps.length - 1 && (
                        <div className={`w-16 h-0.5 mx-2 ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                            }`} />
                    )}
                </div>
            ))}
        </div>
    );

    const SlotSummary = () => (
        <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Booking Summary</h3>
                <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{selectedSlot.programName}</span>
                    </div>
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{selectedSlot.date} • {selectedSlot.startTime} - {selectedSlot.endTime}</span>
                    </div>
                    <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{selectedSlot.location}</span>
                    </div>
                    <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Coach: {selectedSlot.coach}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                        <span className="font-semibold">Price:</span>
                        <span className="font-bold text-lg">
                            {selectedSlot.price === 0 ? 'FREE' : `HK$${selectedSlot.price}`}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <Button id="scheduling-booking-flow-back-btn" variant="ghost" onClick={onCancel}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Schedule
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Book Your Class</h1>
                <div></div>
            </div>

            <StepIndicator />
            <SlotSummary />

            <AnimatePresence mode="wait">
                {/* Step 1: Child Information */}
                {currentStep === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Baby className="w-5 h-5" />
                                    Child Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {existingChildren.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Existing Child
                                        </label>
                                        <div className="space-y-2">
                                            {existingChildren.map((child) => (
                                                <div id={`scheduling-booking-flow-child-${child.id}-btn`}
                                                    key={child.id}
                                                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${bookingData.child?.id === child.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                        }`}
                                                    onClick={() => setBookingData({ ...bookingData, child })}
                                                >
                                                    <div className="font-medium">{child.name}</div>
                                                    <div className="text-sm text-gray-600">Age: {child.age}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="text-center my-4">
                                            <span className="text-gray-500">or add a new child</span>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Child's Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={bookingData.child?.name || ''}
                                        onChange={(e) => setBookingData({
                                            ...bookingData,
                                            child: { ...bookingData.child, name: e.target.value } as Child
                                        })}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.childName ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter child's full name"
                                    />
                                    {errors.childName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.childName}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Age *
                                        </label>
                                        <input
                                            type="number"
                                            min="2"
                                            max="18"
                                            value={bookingData.child?.age || ''}
                                            onChange={(e) => setBookingData({
                                                ...bookingData,
                                                child: { ...bookingData.child, age: parseInt(e.target.value) } as Child
                                            })}
                                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.childAge ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {errors.childAge && (
                                            <p className="text-red-500 text-sm mt-1">{errors.childAge}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date of Birth *
                                        </label>
                                        <input
                                            type="date"
                                            value={bookingData.child?.dateOfBirth || ''}
                                            onChange={(e) => setBookingData({
                                                ...bookingData,
                                                child: { ...bookingData.child, dateOfBirth: e.target.value } as Child
                                            })}
                                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.childDob ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {errors.childDob && (
                                            <p className="text-red-500 text-sm mt-1">{errors.childDob}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Medical Notes (Optional)
                                    </label>
                                    <textarea
                                        value={bookingData.child?.medicalNotes || ''}
                                        onChange={(e) => setBookingData({
                                            ...bookingData,
                                            child: { ...bookingData.child, medicalNotes: e.target.value } as Child
                                        })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="Any medical conditions, allergies, or special needs we should know about..."
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Step 2: Parent Details */}
                {currentStep === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Parent Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Parent/Guardian Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={bookingData.parentInfo?.name || ''}
                                        onChange={(e) => setBookingData({
                                            ...bookingData,
                                            parentInfo: { ...bookingData.parentInfo, name: e.target.value } as any
                                        })}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.parentName ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter your full name"
                                    />
                                    {errors.parentName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.parentName}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            value={bookingData.parentInfo?.email || ''}
                                            onChange={(e) => setBookingData({
                                                ...bookingData,
                                                parentInfo: { ...bookingData.parentInfo, email: e.target.value } as any
                                            })}
                                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.parentEmail ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="your.email@example.com"
                                        />
                                        {errors.parentEmail && (
                                            <p className="text-red-500 text-sm mt-1">{errors.parentEmail}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            value={bookingData.parentInfo?.phone || ''}
                                            onChange={(e) => setBookingData({
                                                ...bookingData,
                                                parentInfo: { ...bookingData.parentInfo, phone: e.target.value } as any
                                            })}
                                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.parentPhone ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="+852 1234 5678"
                                        />
                                        {errors.parentPhone && (
                                            <p className="text-red-500 text-sm mt-1">{errors.parentPhone}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Emergency Contact *
                                    </label>
                                    <input
                                        type="text"
                                        value={bookingData.parentInfo?.emergencyContact || ''}
                                        onChange={(e) => setBookingData({
                                            ...bookingData,
                                            parentInfo: { ...bookingData.parentInfo, emergencyContact: e.target.value } as any
                                        })}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.emergencyContact ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Emergency contact name and phone number"
                                    />
                                    {errors.emergencyContact && (
                                        <p className="text-red-500 text-sm mt-1">{errors.emergencyContact}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Special Requests (Optional)
                                    </label>
                                    <textarea
                                        value={bookingData.specialRequests || ''}
                                        onChange={(e) => setBookingData({
                                            ...bookingData,
                                            specialRequests: e.target.value
                                        })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="Any special requests or additional information..."
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Step 3: Payment */}
                {currentStep === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Payment Method
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedSlot.price === 0 ? (
                                    <div className="text-center py-8">
                                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Free Assessment!</h3>
                                        <p className="text-gray-600">No payment required for this session.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div id="scheduling-booking-flow-pay-card-btn"
                                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${bookingData.paymentMethod === 'card'
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                                onClick={() => setBookingData({ ...bookingData, paymentMethod: 'card' })}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium">Pay by Card</h4>
                                                        <p className="text-sm text-gray-600">One-time payment</p>
                                                    </div>
                                                    <div className="text-lg font-bold">HK${selectedSlot.price}</div>
                                                </div>
                                            </div>

                                            <div id="scheduling-booking-flow-pay-package-btn"
                                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${bookingData.paymentMethod === 'package'
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                                onClick={() => setBookingData({ ...bookingData, paymentMethod: 'package' })}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium">Package Deal</h4>
                                                        <p className="text-sm text-gray-600">Save with bulk purchase</p>
                                                    </div>
                                                    <div className="text-lg font-bold text-green-600">
                                                        HK${Math.round(selectedSlot.price * 0.85)}
                                                        <span className="text-sm text-gray-500 line-through ml-2">
                                                            HK${selectedSlot.price}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div id="scheduling-booking-flow-pay-trial-btn"
                                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${bookingData.paymentMethod === 'trial'
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                                onClick={() => setBookingData({ ...bookingData, paymentMethod: 'trial' })}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium">Trial Session</h4>
                                                        <p className="text-sm text-gray-600">First-time students only</p>
                                                    </div>
                                                    <div className="text-lg font-bold text-blue-600">
                                                        HK${Math.round(selectedSlot.price * 0.5)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {errors.paymentMethod && (
                                            <p className="text-red-500 text-sm">{errors.paymentMethod}</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Step 4: Confirmation */}
                {currentStep === 4 && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="text-center">
                            <CardContent className="p-8">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                >
                                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                                </motion.div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
                                <p className="text-gray-600 mb-6">
                                    Your class has been successfully booked. You'll receive a confirmation email shortly.
                                </p>
                                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                                    <h3 className="font-semibold mb-2">Booking Details:</h3>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p><strong>Child:</strong> {bookingData.child?.name}</p>
                                        <p><strong>Class:</strong> {selectedSlot.programName}</p>
                                        <p><strong>Date & Time:</strong> {selectedSlot.date} • {selectedSlot.startTime} - {selectedSlot.endTime}</p>
                                        <p><strong>Location:</strong> {selectedSlot.location}</p>
                                        <p><strong>Coach:</strong> {selectedSlot.coach}</p>
                                    </div>
                                </div>
                                <Button id="scheduling-booking-flow-go-to-bookings-btn" onClick={() => window.location.href = '/parent/dashboard'} className="w-full">
                                    Go to My Bookings
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            {currentStep < 4 && (
                <div className="flex justify-between mt-8">
                    <Button id="scheduling-booking-flow-prev-btn"
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                    </Button>

                    {currentStep < 3 ? (
                        <Button id="scheduling-booking-flow-next-btn" onClick={nextStep}>
                            Next
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button id="scheduling-booking-flow-confirm-btn"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Confirm Booking
                                    <CheckCircle className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default BookingFlow;
