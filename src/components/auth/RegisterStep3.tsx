'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Building2, Map, Hash, Globe } from 'lucide-react';

import {
    registerStep3Schema,
    type RegisterStep3Data,
} from '@/lib/validations/auth';

interface RegisterStep3Props {
    onComplete: (data: RegisterStep3Data) => void;
    onBack: () => void;
    initialData?: Partial<RegisterStep3Data>;
}

export function RegisterStep3({
    onComplete,
    onBack,
    initialData,
}: RegisterStep3Props) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterStep3Data>({
        resolver: zodResolver(registerStep3Schema),
        defaultValues: initialData,
    });

    return (
        <form data-testid="form-components-auth-RegisterStep3" onSubmit={handleSubmit(onComplete)} className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Address Details</h2>
                <p className="text-gray-600 mt-2">Where are you located?</p>
            </div>

            {/* Street Address */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                </label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        {...register('address.street')}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="123 Main Street"
                    />
                </div>
                {errors.address?.street && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.address.street.message}
                    </p>
                )}
            </div>

            {/* City & State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                    </label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            {...register('address.city')}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="New York"
                        />
                    </div>
                    {errors.address?.city && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.address.city.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                    </label>
                    <div className="relative">
                        <Map className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            {...register('address.state')}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="NY"
                        />
                    </div>
                    {errors.address?.state && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.address.state.message}
                        </p>
                    )}
                </div>
            </div>

            {/* Zip Code & Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zip Code
                    </label>
                    <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            {...register('address.zipCode')}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="10001"
                        />
                    </div>
                    {errors.address?.zipCode && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.address.zipCode.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                    </label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            {...register('address.country')}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="United States"
                        />
                    </div>
                    {errors.address?.country && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.address.country.message}
                        </p>
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
