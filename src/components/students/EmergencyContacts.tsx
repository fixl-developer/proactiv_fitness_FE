'use client';

import type { EmergencyContact } from '@/types/student';

interface EmergencyContactsProps {
    contacts: EmergencyContact[];
}

export default function EmergencyContacts({ contacts }: EmergencyContactsProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Contacts</h2>

            {contacts.length > 0 ? (
                <div className="space-y-4">
                    {contacts.map((contact) => (
                        <div
                            key={contact.id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                                    <p className="text-sm text-gray-600">{contact.relationship}</p>
                                </div>
                                <div className="flex gap-2">
                                    {contact.isPrimary && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                            Primary
                                        </span>
                                    )}
                                    {contact.canPickup && (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                            Can Pickup
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <a
                                        href={`tel:${contact.phone}`}
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        {contact.phone}
                                    </a>
                                </div>

                                {contact.email && (
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <a
                                            href={`mailto:${contact.email}`}
                                            className="text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            {contact.email}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-600">No emergency contacts added</p>
                    <p className="text-sm text-gray-500 mt-1">Add emergency contacts to ensure student safety</p>
                </div>
            )}
        </div>
    );
}
