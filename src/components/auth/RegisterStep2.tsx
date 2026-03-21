'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Phone, Calendar, Users } from 'lucide-react';

import {
    registerStep2Schema,
    type RegisterStep2Data,
} from '@/lib/validations/auth';

interface RegisterStep2Props {
    onComplete: (data: RegisterStep2Data) => void;
    onBack: () => void;
    initialData?: Partial<RegisterStep2Data>;
}

export function RegisterStep2({
    onComplete,
    onBack,
    initialData,
}: RegisterStep2Props) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterStep2Data>({
        resolver: zodResolver(registerStep2Schema),
        defaultValues: initialData,
    });

    return (
        <form data-testid="form-components-auth-RegisterStep2" onSubmit={handleSubmit(onComplete)} className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                <p className="text-gray-600 mt-2">Tell us about yourself</p>
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            {...register('firstName')}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="John"
                        />
                    </div>
                    {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.firstName.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            {...register('lastName')}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Doe"
                        />
                    </div>
                    {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.lastName.message}
                        </p>
                    )}
                </div>
            </div>

            {/* Phone */}
            <div>
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
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
            </div>

            {/* Date of Birth & Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                    </label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="date"
                            {...register('dateOfBirth')}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    {errors.dateOfBirth && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.dateOfBirth.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                    </label>
                    <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select data-testid="select-components-auth-RegisterStep2-1"
                            {...register('gender')}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                        >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    {errors.gender && (
                        <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                    )}
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                    Back
                </button>
                <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    Continue
                </button>
            </div>
        </form>
    );
}
