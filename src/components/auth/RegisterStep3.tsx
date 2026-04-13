'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Building2, Map, Hash, Globe } from 'lucide-react';
import { useState } from 'react';

import {
    registerStep3Schema,
    type RegisterStep3Data,
} from '@/lib/validations/auth';
import {
    validateAddress,
    validateName,
    validateZipCode,
    validateSelect,
    filterNameInput,
    FORMAT_HINTS,
} from '@/utils/validation';
import { FormFieldHint } from '@/components/ui/FormFieldHint';

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
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterStep3Data>({
        resolver: zodResolver(registerStep3Schema),
        defaultValues: initialData,
    });

    const validateField = (field: string, value: string) => {
        let error: string | null = null;
        switch (field) {
            case 'street':
                error = validateAddress(value, 'Street address');
                break;
            case 'city':
                error = validateName(value, 'City');
                break;
            case 'state':
                error = validateName(value, 'State');
                break;
            case 'zipCode':
                error = validateZipCode(value);
                break;
            case 'country':
                error = validateName(value, 'Country');
                break;
        }
        setFieldErrors((prev) => {
            const next = { ...prev };
            if (error) {
                next[field] = error;
            } else {
                delete next[field];
            }
            return next;
        });
    };

    const handleFormSubmit = (data: RegisterStep3Data) => {
        const errs: Record<string, string> = {};
        const streetErr = validateAddress(data.address.street, 'Street address');
        if (streetErr) errs.street = streetErr;
        const cityErr = validateName(data.address.city, 'City');
        if (cityErr) errs.city = cityErr;
        const stateErr = validateName(data.address.state, 'State');
        if (stateErr) errs.state = stateErr;
        const zipErr = validateZipCode(data.address.zipCode);
        if (zipErr) errs.zipCode = zipErr;
        const countryErr = validateName(data.address.country, 'Country');
        if (countryErr) errs.country = countryErr;

        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs);
            return;
        }
        onComplete(data);
    };

    return (
        <form id="form-components-auth-RegisterStep3" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
                        {...register('address.street', {
                            onChange: (e) => validateField('street', e.target.value),
                        })}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                            errors.address?.street || fieldErrors.street ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="123 Main Street"
                    />
                </div>
                {errors.address?.street && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.address.street.message}
                    </p>
                )}
                <FormFieldHint hint={FORMAT_HINTS.address} error={fieldErrors.street} />
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
                            {...register('address.city', {
                                onChange: (e) => validateField('city', e.target.value),
                            })}
                            onKeyDown={filterNameInput}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                                errors.address?.city || fieldErrors.city ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="New York"
                        />
                    </div>
                    {errors.address?.city && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.address.city.message}
                        </p>
                    )}
                    <FormFieldHint hint={FORMAT_HINTS.city} error={fieldErrors.city} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                    </label>
                    <div className="relative">
                        <Map className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            {...register('address.state', {
                                onChange: (e) => validateField('state', e.target.value),
                            })}
                            onKeyDown={filterNameInput}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                                errors.address?.state || fieldErrors.state ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="NY"
                        />
                    </div>
                    {errors.address?.state && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.address.state.message}
                        </p>
                    )}
                    <FormFieldHint hint={FORMAT_HINTS.state} error={fieldErrors.state} />
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
                            {...register('address.zipCode', {
                                onChange: (e) => validateField('zipCode', e.target.value),
                            })}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                                errors.address?.zipCode || fieldErrors.zipCode ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="10001"
                        />
                    </div>
                    {errors.address?.zipCode && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.address.zipCode.message}
                        </p>
                    )}
                    <FormFieldHint hint={FORMAT_HINTS.zipCode} error={fieldErrors.zipCode} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                    </label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            {...register('address.country', {
                                onChange: (e) => validateField('country', e.target.value),
                            })}
                            onKeyDown={filterNameInput}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                                errors.address?.country || fieldErrors.country ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="United States"
                        />
                    </div>
                    {errors.address?.country && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.address.country.message}
                        </p>
                    )}
                    <FormFieldHint hint={FORMAT_HINTS.country} error={fieldErrors.country} />
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
                <button id="auth-register-step3-btn-back"
                    type="button"
                    onClick={onBack}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                    Back
                </button>
                <button id="auth-register-step3-btn-continue"
                    type="submit"
                    className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    Continue
                </button>
            </div>
        </form>
    );
}
