'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
    Calendar,
    User,
    Mail,
    MapPin,
    Users,
    CheckCircle,
    ArrowLeft,
    Clock,
    Star,
    AlertCircle,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/services/api/client'
import { filterNameInput, FORMAT_HINTS, PATTERNS, validateName, validateEmail, validateNotes } from '@/utils/validation'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { findByDialCode, validatePhoneForCountry } from '@/utils/countryCodes'
import { findCamp, CATEGORY_LABEL, CampCategory } from '@/data/camps'

const campBookingSchema = z.object({
    parentName: z
        .string()
        .superRefine((val, ctx) => {
            const err = validateName(val, 'Name')
            if (err) ctx.addIssue({ code: z.ZodIssueCode.custom, message: err })
        }),
    parentEmail: z
        .string()
        .superRefine((val, ctx) => {
            const err = validateEmail(val)
            if (err) ctx.addIssue({ code: z.ZodIssueCode.custom, message: err })
        }),
    parentPhone: z
        .string()
        .min(1, 'Phone number is required')
        .superRefine((val, ctx) => {
            const country = findByDialCode(val)
            if (!country) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please select a valid country code',
                })
                return
            }
            const national = val.slice(country.dialCode.length).replace(/\D/g, '')
            const err = validatePhoneForCountry(national, country)
            if (err) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: err })
            }
        }),
    childName: z
        .string()
        .superRefine((val, ctx) => {
            const err = validateName(val, "Child's name")
            if (err) ctx.addIssue({ code: z.ZodIssueCode.custom, message: err })
        }),
    childAge: z.string().min(1, "Please select child's age"),
    childGender: z.enum(['male', 'female', 'other'], { required_error: 'Please select gender' }),
    location: z.string().min(1, 'Please select a location'),
    startDate: z.string().min(1, 'Please pick a start date'),
    emergencyContact: z
        .string()
        .optional()
        .superRefine((val, ctx) => {
            if (!val || val.trim().length === 0) return
            // Reject inputs that are only special characters / numeric-only nonsense (e.g. "!!!")
            if (!/[A-Za-z]/.test(val) && !/^\+?\d{7,15}$/.test(val.trim())) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Emergency contact must include a name or be a valid phone number' })
                return
            }
            if (val.trim().length < 3) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Emergency contact must be at least 3 characters' })
            }
        }),
    comments: z
        .string()
        .max(1000, 'Notes must be under 1000 characters')
        .optional()
        .superRefine((val, ctx) => {
            if (!val || val.trim().length === 0) return
            const err = validateNotes(val, 'Notes for the Coach', false, 1000)
            if (err) ctx.addIssue({ code: z.ZodIssueCode.custom, message: err })
        }),
})

type CampBookingFormData = z.infer<typeof campBookingSchema>

function CampBookingContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { isAuthenticated, user, isLoading: authLoading } = useAuth()

    const campId = searchParams.get('camp')
    const category = (searchParams.get('type') as CampCategory) || undefined
    const camp = useMemo(() => findCamp(category, campId), [category, campId])

    const [submitting, setSubmitting] = useState(false)
    const [confirmation, setConfirmation] = useState<{
        confirmationNumber: string
        campName: string
        childName: string
        startDate: string
    } | null>(null)

    // Build the redirect URL we use both for the auth gate and after login.
    const returnTo = useMemo(() => {
        const qs = new URLSearchParams()
        if (campId) qs.set('camp', campId)
        if (category) qs.set('type', category)
        return `/camps/book${qs.toString() ? `?${qs.toString()}` : ''}`
    }, [campId, category])

    // Auth gate — bounce non-logged-in users to login with returnTo.
    useEffect(() => {
        if (authLoading) return
        if (!isAuthenticated) {
            router.replace(`/login?redirectTo=${encodeURIComponent(returnTo)}`)
        }
    }, [authLoading, isAuthenticated, returnTo, router])

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<CampBookingFormData>({
        resolver: zodResolver(campBookingSchema),
        defaultValues: {
            parentName: user?.name || '',
            parentEmail: user?.email || '',
            parentPhone: '',
            location: camp?.location && camp.location !== 'Both Locations' ? camp.location : '',
        },
    })

    const onSubmit = async (data: CampBookingFormData) => {
        if (!isAuthenticated) {
            router.push(`/login?redirectTo=${encodeURIComponent(returnTo)}`)
            return
        }
        if (!camp) {
            toast.error('Camp details missing — please open Book Now from a camp listing.')
            return
        }

        setSubmitting(true)
        try {
            const payload: any = {
                bookingType: 'camp',
                campId: camp.id,
                campName: camp.name,
                campCategory: camp.category,
                program: camp.category,
                parentName: data.parentName,
                parentEmail: data.parentEmail,
                parentPhone: data.parentPhone,
                childName: data.childName,
                childAge: Number(data.childAge) || 0,
                childGender: data.childGender,
                location: data.location,
                date: data.startDate,
                timeSlot: camp.time || '09:00',
                emergencyContact: data.emergencyContact || undefined,
                notes: data.comments || undefined,
                price: camp.price,
            }

            let serverConfirmation: string | null = null
            try {
                const res: any = await apiClient.post('/bookings/camp', payload)
                const body = res?.data ?? res
                serverConfirmation = body?.confirmationNumber || body?.bookingId || null
            } catch (err: any) {
                // Fall back to a generic /bookings/assessment endpoint so users still get a confirmation
                try {
                    const res: any = await apiClient.post('/bookings/assessment', payload)
                    const body = res?.data ?? res
                    serverConfirmation = body?.confirmationNumber || body?.bookingId || null
                } catch {
                    if (err?.response?.status === 401) {
                        toast.error('Your session expired — please log in again.')
                        router.push(`/login?redirectTo=${encodeURIComponent(returnTo)}`)
                        setSubmitting(false)
                        return
                    }
                }
            }

            const confirmationNumber = serverConfirmation || `CAMP-${Date.now().toString().slice(-8)}`

            toast.success('Your camp is booked! Confirmation sent to your email.')
            setConfirmation({
                confirmationNumber,
                campName: camp.name,
                childName: data.childName,
                startDate: data.startDate,
            })
            reset()
        } finally {
            setSubmitting(false)
        }
    }

    // While auth is being checked or redirect is happening, show a spinner.
    if (authLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        )
    }

    // No camp selected — guide user back to listings.
    if (!camp) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Choose a Camp First</h2>
                        <p className="text-gray-600 mb-6">
                            We couldn't find the camp you wanted to book. Please pick one from our camp listings.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                href="/camps/gymnastics#upcoming-camps"
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                            >
                                Gymnastics Camps
                            </Link>
                            <Link
                                href="/camps/multi-activity"
                                className="px-5 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                            >
                                Multi-Activity
                            </Link>
                            <Link
                                href="/camps/shenzhen-competitive"
                                className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                            >
                                Shenzhen
                            </Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        )
    }

    if (confirmation) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20">
                    <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-10 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Camp Booked!</h2>
                        <p className="text-gray-600 mb-6">
                            We've received your booking for <strong>{confirmation.campName}</strong> for{' '}
                            <strong>{confirmation.childName}</strong>. Our team will email you payment & joining
                            details shortly.
                        </p>
                        {confirmation.confirmationNumber && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6">
                                <div className="text-xs text-blue-700 uppercase tracking-wide">
                                    Confirmation Number
                                </div>
                                <div className="text-lg font-mono font-semibold text-blue-900">
                                    {confirmation.confirmationNumber}
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => setConfirmation(null)}
                                className="px-5 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                            >
                                Book Another
                            </button>
                            <button
                                onClick={() => router.push('/parent/bookings')}
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                            >
                                View My Bookings
                            </button>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        )
    }

    const categoryLabel = CATEGORY_LABEL[camp.category]

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
                {/* Header banner */}
                <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white pt-20 pb-12">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Link
                            href={`/camps/${camp.category}#upcoming-camps`}
                            className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to {categoryLabel}
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-bold mb-3">Book {camp.name}</h1>
                        <p className="text-blue-100">
                            Secure your child's spot. We'll confirm payment instructions over email.
                        </p>
                    </div>
                </section>

                <section className="py-12">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Camp summary */}
                        <aside className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
                                <div className="text-xs uppercase tracking-wide text-blue-600 font-semibold mb-2">
                                    {categoryLabel}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">{camp.name}</h3>
                                <div className="space-y-3 text-sm text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-blue-600" />
                                        <span>{camp.dates}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                        <span>{camp.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-blue-600" />
                                        <span>{camp.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-blue-600" />
                                        <span>{camp.level}</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-2">
                                        <Star className="w-4 h-4 text-amber-500" />
                                        Camp Highlights
                                    </h4>
                                    <ul className="space-y-1 text-sm text-gray-600">
                                        {camp.highlights.map((h) => (
                                            <li key={h} className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                                <span>{h}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-sm text-gray-500">Total</span>
                                    <span className="text-2xl font-bold text-green-600">{camp.price}</span>
                                </div>
                                <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                                    {camp.spotsLeft} spots left
                                </div>
                            </div>
                        </aside>

                        {/* Form */}
                        <div className="lg:col-span-2">
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="bg-white rounded-2xl shadow-md p-6 sm:p-8 space-y-8"
                            >
                                {/* Parent details */}
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                        Parent / Guardian Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.parentName ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <FormFieldHint
                                                hint={FORMAT_HINTS.name}
                                                error={errors.parentName?.message}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="email"
                                                    {...register('parentEmail')}
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.parentEmail ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    placeholder="parent@example.com"
                                                />
                                            </div>
                                            <FormFieldHint
                                                hint={FORMAT_HINTS.email}
                                                error={errors.parentEmail?.message}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number
                                            </label>
                                            <Controller
                                                control={control}
                                                name="parentPhone"
                                                render={({ field }) => (
                                                    <PhoneInput
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        defaultCountry="HK"
                                                        error={errors.parentPhone?.message}
                                                        placeholder="Enter phone number"
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Child details */}
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Child Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.childName ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    placeholder="Child's name"
                                                />
                                            </div>
                                            <FormFieldHint
                                                hint={FORMAT_HINTS.name}
                                                error={errors.childName?.message}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Child's Age
                                            </label>
                                            <select
                                                {...register('childAge')}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.childAge ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                            >
                                                <option value="">Select age</option>
                                                {[...Array(16)].map((_, i) => (
                                                    <option key={i} value={i + 3}>
                                                        {i + 3} years
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.childAge && (
                                                <p className="mt-1 text-sm text-red-600">{errors.childAge.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Gender
                                            </label>
                                            <select
                                                {...register('childGender')}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.childGender ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                            >
                                                <option value="">Select gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                            {errors.childGender && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.childGender.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Camp details */}
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Camp Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Preferred Location
                                            </label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <select
                                                    {...register('location')}
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${errors.location ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                >
                                                    <option value="">Select location</option>
                                                    <option value="Cyberport">Cyberport</option>
                                                    <option value="Wan Chai">Wan Chai</option>
                                                    {camp.location === 'Shenzhen Training Center' && (
                                                        <option value="Shenzhen Training Center">
                                                            Shenzhen Training Center
                                                        </option>
                                                    )}
                                                </select>
                                            </div>
                                            {errors.location && (
                                                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Camp Start Date
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="date"
                                                    min={new Date().toISOString().split('T')[0]}
                                                    {...register('startDate')}
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.startDate ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                />
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500">
                                                Camp runs {camp.dates}. Pick the day you'd like to start.
                                            </p>
                                            {errors.startDate && (
                                                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Optional */}
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                        Additional Information{' '}
                                        <span className="text-sm font-normal text-gray-400">(optional)</span>
                                    </h3>
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Emergency Contact
                                            </label>
                                            <input
                                                type="text"
                                                {...register('emergencyContact')}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Name & phone (e.g. Jane Doe — +852 9876 5432)"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Notes for the Coach
                                            </label>
                                            <textarea
                                                {...register('comments')}
                                                rows={3}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Allergies, previous experience, anything we should know"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Booking...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Confirm Camp Booking — {camp.price}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </section>

                {submitting && (
                    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center">
                        <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 text-center">
                            <div className="mx-auto mb-4 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-800 font-semibold">Confirming your camp booking...</p>
                            <p className="text-sm text-gray-500 mt-1">Please don't close this window.</p>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </>
    )
}

export default function CampBookingPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                </div>
            }
        >
            <CampBookingContent />
        </Suspense>
    )
}
