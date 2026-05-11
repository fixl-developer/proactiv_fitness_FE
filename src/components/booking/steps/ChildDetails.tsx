'use client';

import { useState } from 'react';
import { validateName, validateSelect, validateAge, filterNameInput, FORMAT_HINTS, todayISODate } from '@/utils/validation';

interface ChildDetailsProps {
    childName: string;
    childAge: string;
    childGender: string;
    childDOB?: string;
    onUpdate: (data: { childName?: string; childAge?: string; childGender?: string; childDOB?: string }) => void;
    errors?: { childName?: string; childAge?: string; childGender?: string; childDOB?: string };
}

export default function ChildDetails({ childName, childAge, childGender, childDOB, onUpdate, errors }: ChildDetailsProps) {
    const ageOptions = Array.from({ length: 16 }, (_, i) => i + 3); // Ages 3-18

    const [touched, setTouched] = useState<{ name?: boolean; age?: boolean; gender?: boolean; dob?: boolean }>({});

    // Inline errors: prefer errors prop (driven by BookingFlow), else compute on touch
    const nameErr = errors?.childName ?? (touched.name ? validateName(childName, "Child's name") : null);
    const ageErr = errors?.childAge ?? (touched.age ? (childAge ? validateAge(childAge, 3, 18) : validateSelect(childAge, "Child's age")) : null);
    const genderErr = errors?.childGender ?? (touched.gender ? validateSelect(childGender, "Gender") : null);
    const dobErr = errors?.childDOB ?? (touched.dob && childDOB ? (() => {
        const d = new Date(childDOB);
        const today = new Date(); today.setHours(23, 59, 59, 999);
        if (isNaN(d.getTime())) return 'Please enter a valid date of birth';
        if (d > today) return 'Date of birth cannot be in the future';
        return null;
    })() : null);

    const onPasteName = (e: React.ClipboardEvent<HTMLInputElement>) => {
        // Strip invalid characters from pasted input before it lands in the field
        const pasted = e.clipboardData.getData('text');
        const cleaned = pasted.replace(/[^A-Za-z\s'-]/g, '').replace(/\s{2,}/g, ' ');
        if (cleaned !== pasted) {
            e.preventDefault();
            onUpdate({ childName: cleaned });
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Tell Us About Your Child
            </h2>
            <p className="text-gray-600 mb-8">
                Help us prepare for your child's assessment
            </p>

            <div className="space-y-6">
                {/* Child Name */}
                <div>
                    <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-2">
                        Child's Name *
                    </label>
                    <input
                        type="text"
                        id="childName"
                        value={childName}
                        onChange={(e) => onUpdate({ childName: e.target.value })}
                        onBlur={() => setTouched(t => ({ ...t, name: true }))}
                        onKeyDown={filterNameInput}
                        onPaste={onPasteName}
                        maxLength={50}
                        placeholder="Enter your child's first name"
                        autoComplete="off"
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${nameErr ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <p className={`text-xs mt-1 ${nameErr ? 'text-red-600' : 'text-gray-500'}`}>
                        {nameErr || FORMAT_HINTS.name}
                    </p>
                </div>

                {/* Child Age */}
                <div>
                    <label htmlFor="childAge" className="block text-sm font-medium text-gray-700 mb-2">
                        Child's Age *
                    </label>
                    <select
                        id="childAge"
                        value={childAge}
                        onChange={(e) => onUpdate({ childAge: e.target.value })}
                        onBlur={() => setTouched(t => ({ ...t, age: true }))}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${ageErr ? 'border-red-500' : 'border-gray-300'}`}
                    >
                        <option value="">Select age</option>
                        {ageOptions.map((age) => (
                            <option key={age} value={age.toString()}>
                                {age} years old
                            </option>
                        ))}
                    </select>
                    <p className={`text-xs mt-1 ${ageErr ? 'text-red-600' : 'text-gray-500'}`}>
                        {ageErr || 'Required for age-appropriate activities (3-18 years)'}
                    </p>
                </div>

                {/* Child Date of Birth (optional, cross-validates with age) */}
                <div>
                    <label htmlFor="childDOB" className="block text-sm font-medium text-gray-700 mb-2">
                        Child's Date of Birth <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <input
                        type="date"
                        id="childDOB"
                        value={childDOB || ''}
                        max={todayISODate()}
                        onChange={(e) => onUpdate({ childDOB: e.target.value })}
                        onBlur={() => setTouched(t => ({ ...t, dob: true }))}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${dobErr ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <p className={`text-xs mt-1 ${dobErr ? 'text-red-600' : 'text-gray-500'}`}>
                        {dobErr || 'Used to verify the age you selected above'}
                    </p>
                </div>

                {/* Child Gender */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender *
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {['Boy', 'Girl', 'Prefer not to say'].map((option) => (
                            <button
                                id={`child-details-gender-${option.toLowerCase().replace(/\s+/g, '-')}-btn`}
                                type="button"
                                key={option}
                                onClick={() => {
                                    onUpdate({ childGender: option });
                                    setTouched(t => ({ ...t, gender: true }));
                                }}
                                className={`px-6 py-3 rounded-xl border-2 font-medium transition-all ${childGender === option
                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                    : genderErr
                                        ? 'border-red-300 text-gray-700 hover:border-red-400'
                                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                    {genderErr && <p className="text-xs mt-2 text-red-600">{genderErr}</p>}
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                        Why do we ask for this information?
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Helps our coaches prepare age-appropriate activities</li>
                        <li>• Ensures we have the right equipment ready</li>
                        <li>• Allows us to create a comfortable environment for your child</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
