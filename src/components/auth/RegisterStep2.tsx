'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Calendar, Users } from 'lucide-react';
import { useState } from 'react';

import {
    registerStep2Schema,
    type RegisterStep2Data,
} from '@/lib/validations/auth';
import {
    validateFirstName,
    validateLastName,
    validateDateOfBirth,
    validateSelect,
    filterFirstNameInput,
    filterLastNameInput,
    FORMAT_HINTS,
} from '@/utils/validation';
import { FormFieldHint } from '@/components/ui/FormFieldHint';
import { PhoneInput } from '@/components/ui/PhoneInput';

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
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterStep2Data>({
        resolver: zodResolver(registerStep2Schema),
        defaultValues: initialData,
    });

    const validateField = (field: string, value: string) => {
        let error: string | null = null;
        switch (field) {
            case 'firstName':
                error = validateFirstName(value, 'First name');
                break;
            case 'lastName':
                error = validateLastName(value, 'Last name');
                break;
            case 'dateOfBirth':
                error = validateDateOfBirth(value);
                break;
            case 'gender':
                error = validateSelect(value, 'Gender');
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

    const handleFormSubmit = (data: RegisterStep2Data) => {
        const errs: Record<string, string> = {};
        const fnErr = validateFirstName(data.firstName, 'First name');
        if (fnErr) errs.firstName = fnErr;
        const lnErr = validateLastName(data.lastName, 'Last name');
        if (lnErr) errs.lastName = lnErr;
        const dobErr = validateDateOfBirth(data.dateOfBirth);
        if (dobErr) errs.dateOfBirth = dobErr;
        const gErr = validateSelect(data.gender, 'Gender');
        if (gErr) errs.gender = gErr;
        // Phone validation is handled by Zod (country-aware) — no need to duplicate here

        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs);
            return;
        }
        onComplete(data);
    };

    return (
        <form id="form-components-auth-RegisterStep2" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
            <div className="text-center mb-3">
                <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
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
                            {...register('firstName', {
                                onChange: (e) => validateField('firstName', e.target.value),
                            })}
                            onKeyDown={filterFirstNameInput}
                            maxLength={50}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                                errors.firstName || fieldErrors.firstName ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="John"
                        />
                    </div>
                    {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.firstName.message}
                        </p>
                    )}
                    <FormFieldHint hint={FORMAT_HINTS.firstName} error={fieldErrors.firstName} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            {...register('lastName', {
                                onChange: (e) => validateField('lastName', e.target.value),
                            })}
                            onKeyDown={filterLastNameInput}
                            maxLength={50}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                                errors.lastName || fieldErrors.lastName ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Doe"
                        />
                    </div>
                    {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.lastName.message}
                        </p>
                    )}
                    <FormFieldHint hint={FORMAT_HINTS.lastName} error={fieldErrors.lastName} />
                </div>
            </div>

            {/* Phone */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                </label>
                <Controller
                    control={control}
                    name="phone"
                    render={({ field }) => (
                        <PhoneInput
                            value={field.value || ''}
                            onChange={field.onChange}
                            error={errors.phone?.message}
                            placeholder="9876543210"
                        />
                    )}
                />
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
                            {...register('dateOfBirth', {
                                onChange: (e) => validateField('dateOfBirth', e.target.value),
                            })}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                                errors.dateOfBirth || fieldErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                    </div>
                    {errors.dateOfBirth && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.dateOfBirth.message}
                        </p>
                    )}
                    <FormFieldHint hint={FORMAT_HINTS.dateOfBirth} error={fieldErrors.dateOfBirth} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                    </label>
                    <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select id="select-components-auth-RegisterStep2-1"
                            {...register('gender', {
                                onChange: (e) => validateField('gender', e.target.value),
                            })}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none ${
                                errors.gender || fieldErrors.gender ? 'border-red-500' : 'border-gray-300'
                            }`}
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
                    <FormFieldHint hint={FORMAT_HINTS.gender} error={fieldErrors.gender} />
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
                <button id="auth-register-step2-btn-back"
                    type="button"
                    onClick={onBack}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                    Back
                </button>
                <button id="auth-register-step2-btn-continue"
                    type="submit"
                    className="flex-1 bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    Continue
                </button>
            </div>
        </form>
    );
}
