'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Calendar, User, Mail, MapPin, Users, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { filterNameInput, FORMAT_HINTS, PATTERNS, validateName, validateEmail, validateNotes } from '@/utils/validation';
import { FormFieldHint } from '@/components/ui/FormFieldHint';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { findByDialCode, validatePhoneForCountry } from '@/utils/countryCodes';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api/client';

const NAME_REGEX = PATTERNS.nameOnly;

const bookTrialSchema = z.object({
    parentName: z
        .string()
        .superRefine((val, ctx) => {
            const err = validateName(val, 'Name');
            if (err) ctx.addIssue({ code: z.ZodIssueCode.custom, message: err });
        }),
    email: z
        .string()
        .superRefine((val, ctx) => {
            const err = validateEmail(val);
            if (err) ctx.addIssue({ code: z.ZodIssueCode.custom, message: err });
        }),
    phone: z
        .string()
        .min(1, 'Phone number is required')
        .superRefine((val, ctx) => {
            const country = findByDialCode(val);
            if (!country) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please select a valid country code',
                });
                return;
            }
            const national = val.slice(country.dialCode.length).replace(/\D/g, '');
            const err = validatePhoneForCountry(national, country);
            if (err) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: err });
            }
        }),
    childName: z
        .string()
        .superRefine((val, ctx) => {
            const err = validateName(val, "Child's name");
            if (err) ctx.addIssue({ code: z.ZodIssueCode.custom, message: err });
        }),
    childAge: z
        .string()
        .min(1, 'Please select age')
        .refine((v) => {
            const n = Number(v);
            return Number.isInteger(n) && n >= 3 && n <= 18;
        }, 'Age must be between 3 and 18'),
    location: z.enum(['Cyberport', 'Wan Chai'], { required_error: 'Please select a location' }),
    program: z.string().min(1, 'Please select a program'),
    preferredDate: z
        .string()
        .min(1, 'Please select a date')
        .refine((v) => {
            const d = new Date(v);
            if (isNaN(d.getTime())) return false;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return d >= today;
        }, 'Preferred date cannot be in the past'),
    preferredTime: z.enum(['morning', 'afternoon', 'evening'], {
        required_error: 'Please select a time',
    }),
    comments: z
        .string()
        .max(500, 'Comments must be 500 characters or fewer')
        .optional()
        .superRefine((val, ctx) => {
            if (!val || val.trim().length === 0) return;
            const err = validateNotes(val, 'Comments', false, 500);
            if (err) ctx.addIssue({ code: z.ZodIssueCode.custom, message: err });
        }),
});

type BookTrialFormData = z.infer<typeof bookTrialSchema>;

const TIME_SLOT_LABEL_TO_VALUE: Record<string, string> = {
    morning: '10:00',
    afternoon: '14:00',
    evening: '17:00',
};

export default function BookTrialPage() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [confirmation, setConfirmation] = useState<{ confirmationNumber: string; childName: string; date: string } | null>(null);

    const TRIAL_STORAGE_KEY = 'proactiv:bookTrialDraft';

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm<BookTrialFormData>({
        resolver: zodResolver(bookTrialSchema),
        mode: 'onBlur',
        defaultValues: {
            parentName: user?.name || '',
            email: user?.email || '',
            phone: '',
        },
    });

    // Restore form from sessionStorage on mount (survives tab refresh)
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem(TRIAL_STORAGE_KEY);
            if (raw) {
                const draft = JSON.parse(raw);
                Object.entries(draft).forEach(([k, v]) => {
                    if (v !== undefined && v !== null) setValue(k as keyof BookTrialFormData, v as any);
                });
            }
        } catch { /* ignore */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Persist on every change so the tab refresh doesn't lose data
    const watchedValues = watch();
    useEffect(() => {
        try {
            sessionStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(watchedValues));
        } catch { /* ignore quota */ }
    }, [watchedValues]);

    const onSubmit = async (data: BookTrialFormData) => {
        if (!isAuthenticated) {
            router.push(`/login?redirectTo=${encodeURIComponent('/book-trial')}`);
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                program: data.program,
                childName: data.childName,
                childAge: Number(data.childAge),
                location: data.location,
                date: data.preferredDate,
                timeSlot: TIME_SLOT_LABEL_TO_VALUE[data.preferredTime] || data.preferredTime,
                parentName: data.parentName,
                parentEmail: data.email,
                parentPhone: data.phone,
                comments: data.comments,
            };

            const res: any = await apiClient.post('/bookings/trial', payload);
            const created = res?.data ?? res;

            toast.success('Trial class booked successfully!');
            try { sessionStorage.removeItem(TRIAL_STORAGE_KEY); } catch { /* ignore */ }
            setConfirmation({
                confirmationNumber: created?.confirmationNumber || created?.bookingId || '',
                childName: data.childName,
                date: data.preferredDate,
            });
            reset();
        } catch (err: any) {
            if (err?.response?.status === 401) {
                toast.error('Your session expired — please log in again.');
                router.push(`/login?redirectTo=${encodeURIComponent('/book-trial')}`);
                return;
            }
            const msg =
                err?.response?.data?.message ||
                (Array.isArray(err?.response?.data?.errors) && err.response.data.errors.join(', ')) ||
                err?.message ||
                'Failed to book trial. Please try again.';
            toast.error(msg);
            console.error('Trial booking failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (confirmation) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20">
                <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-10 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Trial Booked!</h2>
                    <p className="text-gray-600 mb-6">
                        We've received your trial class request for <strong>{confirmation.childName}</strong>{' '}
                        on <strong>{confirmation.date}</strong>. Our team will email you to confirm the slot.
                    </p>
                    {confirmation.confirmationNumber && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6">
                            <div className="text-xs text-blue-700 uppercase tracking-wide">Confirmation Number</div>
                            <div className="text-lg font-mono font-semibold text-blue-900">{confirmation.confirmationNumber}</div>
                        </div>
                    )}
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => setConfirmation(null)}
                            className="px-5 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                        >
                            Book Another
                        </button>
                        <button
                            onClick={() => router.push('/parent/bookings')}
                            className="px-5 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
                        >
                            View My Bookings
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">Book A Free Trial</h1>
                    <p className="text-xl max-w-3xl mx-auto">
                        Experience ProActiv Fitness with a complimentary trial class. No
                        commitment required!
                    </p>
                </div>
            </section>

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
                                {!isAuthenticated && (
                                    <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
                                        You'll need to log in to confirm a trial booking. We'll redirect you on submit.
                                    </div>
                                )}
                            </div>

                            <form id="form-(marketing)-book-trial" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                                                    onKeyDown={filterNameInput}
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.parentName ? 'border-red-500' : 'border-gray-300'}`}
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <FormFieldHint hint={FORMAT_HINTS.name} error={errors.parentName?.message} />
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
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                            <FormFieldHint hint={FORMAT_HINTS.email} error={errors.email?.message} />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number
                                            </label>
                                            <Controller
                                                control={control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <PhoneInput
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        defaultCountry="HK"
                                                        error={errors.phone?.message}
                                                        placeholder="Enter phone number"
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

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
                                                    onKeyDown={filterNameInput}
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.childName ? 'border-red-500' : 'border-gray-300'}`}
                                                    placeholder="Child's name"
                                                />
                                            </div>
                                            <FormFieldHint hint={FORMAT_HINTS.name} error={errors.childName?.message} />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Child's Age
                                            </label>
                                            <select id="select-(marketing)-book-trial-1"
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
                                                <select id="select-(marketing)-book-trial-2"
                                                    {...register('location')}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                                                >
                                                    <option value="">Select location</option>
                                                    <option value="Cyberport">Cyberport</option>
                                                    <option value="Wan Chai">Wan Chai</option>
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
                                            <select id="select-(marketing)-book-trial-3"
                                                {...register('program')}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">Select program</option>
                                                <option value="Gymnastics">Gymnastics</option>
                                                <option value="Recreational">Recreational</option>
                                                <option value="Competitive">Competitive</option>
                                                <option value="Multi-Activity">Multi-Activity</option>
                                                <option value="Holiday Camps">Holiday Camps</option>
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
                                                    min={new Date().toISOString().split('T')[0]}
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
                                            <select id="select-(marketing)-book-trial-4"
                                                {...register('preferredTime')}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">Select time</option>
                                                <option value="morning">Morning (10:00 AM)</option>
                                                <option value="afternoon">Afternoon (2:00 PM)</option>
                                                <option value="evening">Evening (5:00 PM)</option>
                                            </select>
                                            {errors.preferredTime && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.preferredTime.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Additional Comments (Optional)
                                    </label>
                                    <textarea
                                        {...register('comments')}
                                        rows={4}
                                        maxLength={500}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.comments ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Any special requirements or questions?"
                                    />
                                    <FormFieldHint
                                        hint="Up to 500 characters"
                                        error={errors.comments?.message}
                                    />
                                </div>

                                <button id="marketing-book-trial-btn"
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

            {isLoading && (
                <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center">
                    <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 text-center">
                        <div className="mx-auto mb-4 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-800 font-semibold">Confirming your trial booking...</p>
                        <p className="text-sm text-gray-500 mt-1">Please don't close this window.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
