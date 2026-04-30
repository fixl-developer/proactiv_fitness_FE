'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, User, Mail, Heart } from 'lucide-react';
import { useState } from 'react';

import {
    registerStep5Schema,
    type RegisterStep5Data,
} from '@/lib/validations/auth';
import {
    validateFirstName,
    validateLastName,
    validateEmail,
    validateRequired,
    filterFirstNameInput,
    filterLastNameInput,
    FORMAT_HINTS,
} from '@/utils/validation';
import { FormFieldHint } from '@/components/ui/FormFieldHint';
import { PhoneInput } from '@/components/ui/PhoneInput';

interface RegisterStep5Props {
    onComplete: (data: RegisterStep5Data) => void;
    onBack: () => void;
    initialData?: Partial<RegisterStep5Data>;
}

export function RegisterStep5({
    onComplete,
    onBack,
    initialData,
}: RegisterStep5Props) {
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterStep5Data>({
        resolver: zodResolver(registerStep5Schema),
        defaultValues: initialData || {
            guardians: [
                {
                    firstName: '',
                    lastName: '',
                    relationship: '',
                    phone: '',
                    email: '',
                    isEmergencyContact: true,
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'guardians',
    });

    const addGuardian = () => {
        append({
            firstName: '',
            lastName: '',
            relationship: '',
            phone: '',
            email: '',
            isEmergencyContact: false,
        });
    };

    const handleSkip = () => {
        onComplete({ guardians: [] });
    };

    const validateField = (index: number, field: string, value: string) => {
        const key = `guardians.${index}.${field}`;
        let error: string | null = null;
        switch (field) {
            case 'firstName':
                error = validateFirstName(value, 'First name');
                break;
            case 'lastName':
                error = validateLastName(value, 'Last name');
                break;
            case 'email':
                error = validateEmail(value);
                break;
            case 'relationship':
                error = validateRequired(value, 'Relationship');
                break;
        }
        setFieldErrors((prev) => {
            const next = { ...prev };
            if (error) {
                next[key] = error;
            } else {
                delete next[key];
            }
            return next;
        });
    };

    const handleFormSubmit = (data: RegisterStep5Data) => {
        const errs: Record<string, string> = {};
        (data.guardians ?? []).forEach((guardian, index) => {
            const fnErr = validateFirstName(guardian.firstName, 'First name');
            if (fnErr) errs[`guardians.${index}.firstName`] = fnErr;
            const lnErr = validateLastName(guardian.lastName, 'Last name');
            if (lnErr) errs[`guardians.${index}.lastName`] = lnErr;
            const relErr = validateRequired(guardian.relationship, 'Relationship');
            if (relErr) errs[`guardians.${index}.relationship`] = relErr;
            const emErr = validateEmail(guardian.email);
            if (emErr) errs[`guardians.${index}.email`] = emErr;
            // Phone validation handled by Zod (country-aware) — surfaces via errors.guardians[i].phone
        });

        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs);
            return;
        }
        onComplete(data);
    };

    return (
        <form id="form-components-auth-RegisterStep5" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Guardian & Emergency Contacts
                </h2>
                <p className="text-gray-600 mt-2">
                    Add guardians and emergency contacts
                </p>
                <button id="auth-register-step5-btn-skip-this-step-add-contacts-la"
                    type="button"
                    onClick={handleSkip}
                    className="text-sm text-primary hover:underline mt-2"
                >
                    Skip this step (add contacts later)
                </button>
            </div>

            {/* Guardians */}
            <div className="space-y-6">
                {fields.map((field, index) => (
                    <div
                        key={field.id}
                        className="p-6 border-2 border-gray-200 rounded-lg relative"
                    >
                        {/* Remove Button */}
                        {fields.length > 1 && (
                            <button id="auth-register-step5-btn"
                                type="button"
                                onClick={() => remove(index)}
                                className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}

                        <h3 className="font-semibold text-gray-900 mb-4">
                            Guardian {index + 1}
                        </h3>

                        {/* Name */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        {...register(`guardians.${index}.firstName`, {
                                            onChange: (e) => validateField(index, 'firstName', e.target.value),
                                        })}
                                        onKeyDown={filterFirstNameInput}
                                        maxLength={50}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                                            errors.guardians?.[index]?.firstName || fieldErrors[`guardians.${index}.firstName`] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="First name"
                                    />
                                </div>
                                {errors.guardians?.[index]?.firstName && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.guardians[index]?.firstName?.message}
                                    </p>
                                )}
                                <FormFieldHint hint={FORMAT_HINTS.firstName} error={fieldErrors[`guardians.${index}.firstName`]} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        {...register(`guardians.${index}.lastName`, {
                                            onChange: (e) => validateField(index, 'lastName', e.target.value),
                                        })}
                                        onKeyDown={filterLastNameInput}
                                        maxLength={50}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                                            errors.guardians?.[index]?.lastName || fieldErrors[`guardians.${index}.lastName`] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Last name"
                                    />
                                </div>
                                {errors.guardians?.[index]?.lastName && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.guardians[index]?.lastName?.message}
                                    </p>
                                )}
                                <FormFieldHint hint={FORMAT_HINTS.lastName} error={fieldErrors[`guardians.${index}.lastName`]} />
                            </div>
                        </div>

                        {/* Relationship */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Relationship
                            </label>
                            <div className="relative">
                                <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select id="select-components-auth-RegisterStep5-1"
                                    {...register(`guardians.${index}.relationship`, {
                                        onChange: (e) => validateField(index, 'relationship', e.target.value),
                                    })}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none ${
                                        errors.guardians?.[index]?.relationship || fieldErrors[`guardians.${index}.relationship`] ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">Select relationship</option>
                                    <option value="parent">Parent</option>
                                    <option value="guardian">Guardian</option>
                                    <option value="grandparent">Grandparent</option>
                                    <option value="sibling">Sibling</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            {errors.guardians?.[index]?.relationship && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.guardians[index]?.relationship?.message}
                                </p>
                            )}
                            <FormFieldHint hint={FORMAT_HINTS.relationship} error={fieldErrors[`guardians.${index}.relationship`]} />
                        </div>

                        {/* Phone & Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <Controller
                                    control={control}
                                    name={`guardians.${index}.phone`}
                                    render={({ field }) => (
                                        <PhoneInput
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                            error={errors.guardians?.[index]?.phone?.message}
                                            placeholder="9876543210"
                                        />
                                    )}
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
                                        {...register(`guardians.${index}.email`, {
                                            onChange: (e) => validateField(index, 'email', e.target.value),
                                        })}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                                            errors.guardians?.[index]?.email || fieldErrors[`guardians.${index}.email`] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="email@example.com"
                                    />
                                </div>
                                {errors.guardians?.[index]?.email && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.guardians[index]?.email?.message}
                                    </p>
                                )}
                                <FormFieldHint hint={FORMAT_HINTS.email} error={fieldErrors[`guardians.${index}.email`]} />
                            </div>
                        </div>

                        {/* Emergency Contact Checkbox */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                {...register(`guardians.${index}.isEmergencyContact`)}
                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <label className="ml-2 text-sm text-gray-700">
                                Set as emergency contact
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Guardian Button */}
            <button id="auth-register-step5-btn-2"
                type="button"
                onClick={addGuardian}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Add Another Guardian
            </button>

            {/* Buttons */}
            <div className="flex gap-4">
                <button id="auth-register-step5-btn-back"
                    type="button"
                    onClick={onBack}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                    Back
                </button>
                <button id="auth-register-step5-btn-continue"
                    type="submit"
                    className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    Continue
                </button>
            </div>
        </form>
    );
}
