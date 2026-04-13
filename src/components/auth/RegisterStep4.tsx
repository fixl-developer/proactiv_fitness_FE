'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, User, Calendar, Users, School, Heart } from 'lucide-react';
import { useState } from 'react';

import {
    registerStep4Schema,
    type RegisterStep4Data,
} from '@/lib/validations/auth';
import {
    validateName,
    validateDateOfBirth,
    validateSelect,
    filterNameInput,
    FORMAT_HINTS,
} from '@/utils/validation';
import { FormFieldHint } from '@/components/ui/FormFieldHint';

interface RegisterStep4Props {
    onComplete: (data: RegisterStep4Data) => void;
    onBack: () => void;
    initialData?: Partial<RegisterStep4Data>;
}

export function RegisterStep4({
    onComplete,
    onBack,
    initialData,
}: RegisterStep4Props) {
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterStep4Data>({
        resolver: zodResolver(registerStep4Schema),
        defaultValues: initialData || {
            students: [
                {
                    firstName: '',
                    lastName: '',
                    dateOfBirth: '',
                    gender: 'male',
                    school: '',
                    medicalConditions: '',
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'students',
    });

    const addStudent = () => {
        append({
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            gender: 'male',
            school: '',
            medicalConditions: '',
        });
    };

    const handleSkip = () => {
        onComplete({ students: [] });
    };

    const validateField = (index: number, field: string, value: string) => {
        const key = `students.${index}.${field}`;
        let error: string | null = null;
        switch (field) {
            case 'firstName':
                error = validateName(value, 'First name');
                break;
            case 'lastName':
                error = validateName(value, 'Last name');
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
                next[key] = error;
            } else {
                delete next[key];
            }
            return next;
        });
    };

    const handleFormSubmit = (data: RegisterStep4Data) => {
        const errs: Record<string, string> = {};
        data.students.forEach((student, index) => {
            const fnErr = validateName(student.firstName, 'First name');
            if (fnErr) errs[`students.${index}.firstName`] = fnErr;
            const lnErr = validateName(student.lastName, 'Last name');
            if (lnErr) errs[`students.${index}.lastName`] = lnErr;
            const dobErr = validateDateOfBirth(student.dateOfBirth);
            if (dobErr) errs[`students.${index}.dateOfBirth`] = dobErr;
            const gErr = validateSelect(student.gender, 'Gender');
            if (gErr) errs[`students.${index}.gender`] = gErr;
        });

        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs);
            return;
        }
        onComplete(data);
    };

    return (
        <form id="form-components-auth-RegisterStep4" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Student Information</h2>
                <p className="text-gray-600 mt-2">
                    Add students who will be attending classes
                </p>
                <button id="auth-register-step4-btn-skip-this-step-add-students-la"
                    type="button"
                    onClick={handleSkip}
                    className="text-sm text-primary hover:underline mt-2"
                >
                    Skip this step (add students later)
                </button>
            </div>

            {/* Students */}
            <div className="space-y-6">
                {fields.map((field, index) => (
                    <div
                        key={field.id}
                        className="p-6 border-2 border-gray-200 rounded-lg relative"
                    >
                        {/* Remove Button */}
                        {fields.length > 1 && (
                            <button id="auth-register-step4-btn"
                                type="button"
                                onClick={() => remove(index)}
                                className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}

                        <h3 className="font-semibold text-gray-900 mb-4">
                            Student {index + 1}
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
                                        {...register(`students.${index}.firstName`, {
                                            onChange: (e) => validateField(index, 'firstName', e.target.value),
                                        })}
                                        onKeyDown={filterNameInput}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                                            errors.students?.[index]?.firstName || fieldErrors[`students.${index}.firstName`] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="First name"
                                    />
                                </div>
                                {errors.students?.[index]?.firstName && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.students[index]?.firstName?.message}
                                    </p>
                                )}
                                <FormFieldHint hint={FORMAT_HINTS.firstName} error={fieldErrors[`students.${index}.firstName`]} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        {...register(`students.${index}.lastName`, {
                                            onChange: (e) => validateField(index, 'lastName', e.target.value),
                                        })}
                                        onKeyDown={filterNameInput}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                                            errors.students?.[index]?.lastName || fieldErrors[`students.${index}.lastName`] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Last name"
                                    />
                                </div>
                                {errors.students?.[index]?.lastName && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.students[index]?.lastName?.message}
                                    </p>
                                )}
                                <FormFieldHint hint={FORMAT_HINTS.lastName} error={fieldErrors[`students.${index}.lastName`]} />
                            </div>
                        </div>

                        {/* DOB & Gender */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        {...register(`students.${index}.dateOfBirth`, {
                                            onChange: (e) => validateField(index, 'dateOfBirth', e.target.value),
                                        })}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                                            errors.students?.[index]?.dateOfBirth || fieldErrors[`students.${index}.dateOfBirth`] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                </div>
                                {errors.students?.[index]?.dateOfBirth && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.students[index]?.dateOfBirth?.message}
                                    </p>
                                )}
                                <FormFieldHint hint={FORMAT_HINTS.dateOfBirth} error={fieldErrors[`students.${index}.dateOfBirth`]} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gender
                                </label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <select id="select-components-auth-RegisterStep4-1"
                                        {...register(`students.${index}.gender`, {
                                            onChange: (e) => validateField(index, 'gender', e.target.value),
                                        })}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none ${
                                            errors.students?.[index]?.gender || fieldErrors[`students.${index}.gender`] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <FormFieldHint hint={FORMAT_HINTS.gender} error={fieldErrors[`students.${index}.gender`]} />
                            </div>
                        </div>

                        {/* School */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                School (Optional)
                            </label>
                            <div className="relative">
                                <School className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    {...register(`students.${index}.school`)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="School name"
                                />
                            </div>
                            <FormFieldHint hint={FORMAT_HINTS.school} />
                        </div>

                        {/* Medical Conditions */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Medical Conditions (Optional)
                            </label>
                            <div className="relative">
                                <Heart className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <textarea
                                    {...register(`students.${index}.medicalConditions`)}
                                    rows={3}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Any allergies, medical conditions, or special needs..."
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Student Button */}
            <button id="auth-register-step4-btn-2"
                type="button"
                onClick={addStudent}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Add Another Student
            </button>

            {/* Buttons */}
            <div className="flex gap-4">
                <button id="auth-register-step4-btn-back"
                    type="button"
                    onClick={onBack}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                    Back
                </button>
                <button id="auth-register-step4-btn-continue"
                    type="submit"
                    className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    Continue
                </button>
            </div>
        </form>
    );
}
