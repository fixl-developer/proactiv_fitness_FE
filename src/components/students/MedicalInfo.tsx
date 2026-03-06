'use client';

import { useState } from 'react';
import type { Student } from '@/types/student';

interface MedicalInfoProps {
    medicalInfo: Student['medicalInfo'];
}

export default function MedicalInfo({ medicalInfo }: MedicalInfoProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Medical Information</h2>
                <button
                    onClick={() => setIsVisible(!isVisible)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                    {isVisible ? (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                            Hide
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Show
                        </>
                    )}
                </button>
            </div>

            {isVisible ? (
                <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-sm text-yellow-800">
                                This information is encrypted and should only be accessed when necessary for the student's safety and care.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Allergies</p>
                            {medicalInfo.allergies.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1">
                                    {medicalInfo.allergies.map((allergy, index) => (
                                        <li key={index} className="text-gray-900">{allergy}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">None reported</p>
                            )}
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Medications</p>
                            {medicalInfo.medications.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1">
                                    {medicalInfo.medications.map((medication, index) => (
                                        <li key={index} className="text-gray-900">{medication}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">None reported</p>
                            )}
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Medical Conditions</p>
                            {medicalInfo.conditions.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1">
                                    {medicalInfo.conditions.map((condition, index) => (
                                        <li key={index} className="text-gray-900">{condition}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">None reported</p>
                            )}
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Blood Type</p>
                            <p className="text-gray-900">{medicalInfo.bloodType || 'Not specified'}</p>
                        </div>

                        {medicalInfo.doctorName && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Primary Doctor</p>
                                <p className="text-gray-900">{medicalInfo.doctorName}</p>
                                {medicalInfo.doctorPhone && (
                                    <a
                                        href={`tel:${medicalInfo.doctorPhone}`}
                                        className="text-blue-600 hover:text-blue-700"
                                    >
                                        {medicalInfo.doctorPhone}
                                    </a>
                                )}
                            </div>
                        )}

                        {medicalInfo.insuranceProvider && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Insurance</p>
                                <p className="text-gray-900">{medicalInfo.insuranceProvider}</p>
                                {medicalInfo.insuranceNumber && (
                                    <p className="text-sm text-gray-600">Policy: {medicalInfo.insuranceNumber}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {medicalInfo.specialNeeds && (
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Special Needs</p>
                            <p className="text-gray-900 whitespace-pre-wrap">{medicalInfo.specialNeeds}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p className="text-gray-600">Medical information is hidden for privacy</p>
                    <p className="text-sm text-gray-500 mt-1">Click "Show" to view encrypted medical data</p>
                </div>
            )}
        </div>
    );
}
