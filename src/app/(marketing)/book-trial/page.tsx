'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Calendar, User, Mail, Phone, MapPin, Users, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const bookTrialSchema = z.object({
    parentName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    childName: z.string().min(2, 'Child name must be at least 2 characters'),
    childAge: z.string().min(1, 'Please select age'),
    location: z.string().min(1, 'Please select a location'),
    program: z.string().min(1, 'Please select a program'),
    preferredDate: z.string().min(1, 'Please select a date'),
    preferredTime: z.string().min(1, 'Please select a time'),
    comments: z.string().optional(),
});

type BookTrialFormData = z.infer<typeof bookTrialSchema>;

export default function BookTrialPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<BookTrialFormData>({
        resolver: zodResolver(bookTrialSchema),
    });

    const onSubmit = async (data: BookTrialFormData) => {
        setIsLoading(true);

        try {
            // TODO: Integrate with backend API
            await new Promise((resolve) => setTimeout(resolve, 1500));
            toast.success('Trial class booked successfully! Check your email for confirmation.');
            router.push('/');
        } catch (error) {
            toast.error('Failed to book trial. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">Book A Free Trial</h1>
                    <p className="text-xl max-w-3xl mx-auto">
                        Experience ProActiv Fitness with a complimentary trial class. No
                        commitment required!
                    </p>
                </div>
            </section>

            {/* Form Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                    Trial Class Registration
                                </h2>
                                <p className="text-gray-600">
                                    Fill out the form below and we'll contact you to confirm your
                                    trial class booking.
                                </p>
                            </div>

                            <form data-testid="form-(marketing)-book-trial" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Parent Information */}
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                        Parent/Guardian Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Full Name
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    {...register('parentName')}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            {errors.parentName && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.parentName.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="email"
                                                    {...register('email')}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.email.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    {...register('phone')}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="+1234567890"
                                                />
                                            </div>
                                            {errors.phone && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.phone.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Child Information */}
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                        Child Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Child's Name
                                            </label>
                                            <div className="relative">
                                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    {...register('childName')}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="Child's name"
                                                />
                                            </div>
                                            {errors.childName && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.childName.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Child's Age
                                            </label>
                                            <select data-testid="select-(marketing)-book-trial-1"
                                                {...register('childAge')}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">Select age</option>
                                                {[...Array(16)].map((_, i) => (
                                                    <option key={i} value={i + 3}>
                                                        {i + 3} years
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.childAge && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.childAge.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Class Details */}
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                        Class Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Location
                                            </label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <select data-testid="select-(marketing)-book-trial-2"
                                                    {...register('location')}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                                                >
                                                    <option value="">Select location</option>
                                                    <option value="downtown">Downtown Center</option>
                                                    <option value="westside">Westside Center</option>
                                                    <option value="eastside">Eastside Center</option>
                                                    <option value="northside">Northside Center</option>
                                                </select>
                                            </div>
                                            {errors.location && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.location.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Program
                                            </label>
                                            <select data-testid="select-(marketing)-book-trial-3"
                                                {...register('program')}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">Select program</option>
                                                <option value="gymnastics">Gymnastics</option>
                                                <option value="multi-activity">Multi-Activity</option>
                                                <option value="camps">Holiday Camps</option>
                                            </select>
                                            {errors.program && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.program.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Preferred Date
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="date"
                                                    {...register('preferredDate')}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </div>
                                            {errors.preferredDate && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.preferredDate.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Preferred Time
                                            </label>
                                            <select data-testid="select-(marketing)-book-trial-4"
                                                {...register('preferredTime')}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">Select time</option>
                                                <option value="morning">Morning (9AM - 12PM)</option>
                                                <option value="afternoon">Afternoon (12PM - 4PM)</option>
                                                <option value="evening">Evening (4PM - 8PM)</option>
                                            </select>
                                            {errors.preferredTime && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.preferredTime.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Comments */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Additional Comments (Optional)
                                    </label>
                                    <textarea
                                        {...register('comments')}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Any special requirements or questions?"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-primary text-white py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Booking...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Book Free Trial
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
