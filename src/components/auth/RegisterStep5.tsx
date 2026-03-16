'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, User, Phone, Mail, Heart } from 'lucide-react';

import {
    registerStep5Schema,
    type RegisterStep5Data,
} from '@/lib/validations/auth';

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

    return (
        <form onSubmit={handleSubmit(onComplete)} className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Guardian & Emergency Contacts
                </h2>
                <p className="text-gray-600 mt-2">
                    Add guardians and emergency contacts
                </p>
                <button
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
                            <button
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
                                        {...register(`guardians.${index}.firstName`)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="First name"
                                    />
                                </div>
                                {errors.guardians?.[index]?.firstName && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.guardians[index]?.firstName?.message}
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
                                        {...register(`guardians.${index}.lastName`)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Last name"
                                    />
                                </div>
                                {errors.guardians?.[index]?.lastName && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.guardians[index]?.lastName?.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Relationship */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Relationship
                            </label>
                            <div className="relative">
                                <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    {...register(`guardians.${index}.relationship`)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
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
                        </div>

                        {/* Phone & Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        {...register(`guardians.${index}.phone`)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="+1234567890"
                                    />
                                </div>
                                {errors.guardians?.[index]?.phone && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.guardians[index]?.phone?.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        {...register(`guardians.${index}.email`)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="email@example.com"
                                    />
                                </div>
                                {errors.guardians?.[index]?.email && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.guardians[index]?.email?.message}
                                    </p>
                                )}
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
            <button
                type="button"
                onClick={addGuardian}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Add Another Guardian
            </button>

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
