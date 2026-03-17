'use client';

import { User, Mail, Phone, Shield } from 'lucide-react';

interface ParentDetailsProps {
    parentName: string;
    parentEmail: string;
    parentPhone: string;
    onUpdate: (data: { parentName?: string; parentEmail?: string; parentPhone?: string }) => void;
}

export default function ParentDetails({ parentName, parentEmail, parentPhone, onUpdate }: ParentDetailsProps) {
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
                            placeholder="Enter your full name"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
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
                            onChange={(e) => onUpdate({ parentEmail: e.target.value })}
                            placeholder="your.email@example.com"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        We'll send booking confirmation and reminders to this email
                    </p>
                </div>

                {/* Phone */}
                <div>
                    <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="tel"
                            id="parentPhone"
                            value={parentPhone}
                            onChange={(e) => onUpdate({ parentPhone: e.target.value })}
                            placeholder="+852 1234 5678"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        We may call to confirm details or provide updates
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
                            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            defaultChecked
                        />
                        <span className="text-sm text-gray-700">
                            I agree to receive booking confirmations and important updates via email and SMS
                        </span>
                    </label>

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
