'use client';

import { useState } from 'react';
import { User, Mail, Phone, Shield } from 'lucide-react';
import {
    validateName,
    validateEmail,
    validatePhone10,
    filterNameInput,
    filterPhoneInput,
    FORMAT_HINTS,
} from '@/utils/validation';

interface ParentDetailsProps {
    parentName: string;
    parentEmail: string;
    parentPhone: string;
    emergencyContact?: string;
    agreeToReceive?: boolean;
    onUpdate: (data: { parentName?: string; parentEmail?: string; parentPhone?: string; emergencyContact?: string; agreeToReceive?: boolean }) => void;
    errors?: { parentName?: string; parentEmail?: string; parentPhone?: string; emergencyContact?: string; agreeToReceive?: string };
}

export default function ParentDetails({ parentName, parentEmail, parentPhone, emergencyContact, agreeToReceive, onUpdate, errors }: ParentDetailsProps) {
    const [touched, setTouched] = useState<{ name?: boolean; email?: boolean; phone?: boolean; emergency?: boolean }>({});

    const nameErr = errors?.parentName ?? (touched.name ? validateName(parentName, 'Parent name') : null);
    const emailErr = errors?.parentEmail ?? (touched.email ? validateEmail(parentEmail) : null);
    const phoneErr = errors?.parentPhone ?? (touched.phone ? validatePhone10(parentPhone, true, 'Phone number') : null);
    const emergencyErr = errors?.emergencyContact ?? (touched.emergency && emergencyContact ? validatePhone10(emergencyContact, false, 'Emergency contact') : null);
    const consentErr = errors?.agreeToReceive ?? null;

    const onPasteName = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData('text');
        const cleaned = pasted.replace(/[^A-Za-z\s'-]/g, '').replace(/\s{2,}/g, ' ');
        if (cleaned !== pasted) {
            e.preventDefault();
            onUpdate({ parentName: cleaned });
        }
    };

    const onPastePhone = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData('text');
        const cleaned = pasted.replace(/[^0-9+]/g, '');
        if (cleaned !== pasted) {
            e.preventDefault();
            // Set on whichever field was being pasted into
            const target = e.target as HTMLInputElement;
            if (target.id === 'emergencyContact') onUpdate({ emergencyContact: cleaned });
            else onUpdate({ parentPhone: cleaned });
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Parent Contact Details
            </h2>
            <p className="text-gray-600 mb-8">
                We'll use this information to confirm your booking and send updates
            </p>

            <div className="space-y-6">
                {/* Parent Name */}
                <div>
                    <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-2">
                        Parent/Guardian Name *
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            id="parentName"
                            value={parentName}
                            onChange={(e) => onUpdate({ parentName: e.target.value })}
                            onBlur={() => setTouched(t => ({ ...t, name: true }))}
                            onKeyDown={filterNameInput}
                            onPaste={onPasteName}
                            maxLength={80}
                            placeholder="Enter your full name"
                            autoComplete="name"
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${nameErr ? 'border-red-500' : 'border-gray-300'}`}
                        />
                    </div>
                    <p className={`text-xs mt-1 ${nameErr ? 'text-red-600' : 'text-gray-500'}`}>
                        {nameErr || FORMAT_HINTS.name}
                    </p>
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            id="parentEmail"
                            value={parentEmail}
                            onChange={(e) => onUpdate({ parentEmail: e.target.value.replace(/\s/g, '') })}
                            onBlur={() => setTouched(t => ({ ...t, email: true }))}
                            onKeyDown={(e) => { if (e.key === ' ') e.preventDefault(); }}
                            maxLength={120}
                            placeholder="your.email@example.com"
                            autoComplete="email"
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${emailErr ? 'border-red-500' : 'border-gray-300'}`}
                        />
                    </div>
                    <p className={`text-xs mt-1 ${emailErr ? 'text-red-600' : 'text-gray-500'}`}>
                        {emailErr || FORMAT_HINTS.email}
                    </p>
                </div>

                {/* Phone — strict 10 digits, no spaces, no alphabets */}
                <div>
                    <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number * <span className="text-xs text-gray-400">(10 digits)</span>
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="tel"
                            id="parentPhone"
                            value={parentPhone}
                            onChange={(e) => onUpdate({ parentPhone: e.target.value.replace(/[^\d+]/g, '').slice(0, 14) })}
                            onBlur={() => setTouched(t => ({ ...t, phone: true }))}
                            onKeyDown={(e) => {
                                // Allow digits, +, backspace, delete, arrows, tab; block spaces and letters
                                const allowed = /^[0-9+]$/;
                                if (e.key.length === 1 && !allowed.test(e.key)) e.preventDefault();
                                if (e.key === ' ') e.preventDefault();
                            }}
                            onPaste={onPastePhone}
                            maxLength={14}
                            placeholder="9876543210"
                            inputMode="numeric"
                            autoComplete="tel"
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${phoneErr ? 'border-red-500' : 'border-gray-300'}`}
                        />
                    </div>
                    <p className={`text-xs mt-1 ${phoneErr ? 'text-red-600' : 'text-gray-500'}`}>
                        {phoneErr || 'Exactly 10 digits (optional +country code allowed)'}
                    </p>
                </div>

                {/* Emergency Contact (optional) */}
                <div>
                    <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="tel"
                            id="emergencyContact"
                            value={emergencyContact || ''}
                            onChange={(e) => onUpdate({ emergencyContact: e.target.value.replace(/[^\d+]/g, '').slice(0, 14) })}
                            onBlur={() => setTouched(t => ({ ...t, emergency: true }))}
                            onKeyDown={(e) => {
                                const allowed = /^[0-9+]$/;
                                if (e.key.length === 1 && !allowed.test(e.key)) e.preventDefault();
                                if (e.key === ' ') e.preventDefault();
                            }}
                            onPaste={onPastePhone}
                            maxLength={14}
                            placeholder="Alternate contact number"
                            inputMode="numeric"
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${emergencyErr ? 'border-red-500' : 'border-gray-300'}`}
                        />
                    </div>
                    <p className={`text-xs mt-1 ${emergencyErr ? 'text-red-600' : 'text-gray-500'}`}>
                        {emergencyErr || 'Exactly 10 digits if provided'}
                    </p>
                </div>

                {/* Privacy Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="font-medium text-blue-900 mb-2">
                                Your Privacy Matters
                            </h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• We only use your information for booking and communication</li>
                                <li>• Your details are stored securely and never shared with third parties</li>
                                <li>• You can request to update or delete your information anytime</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Consent Checkboxes */}
                <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={agreeToReceive ?? true}
                            onChange={(e) => onUpdate({ agreeToReceive: e.target.checked })}
                            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                            I agree to receive booking confirmations and important updates via email and SMS *
                        </span>
                    </label>
                    {consentErr && <p className="text-xs text-red-600 ml-7">{consentErr}</p>}

                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                            I'd like to receive newsletters and promotional offers (optional)
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
}
