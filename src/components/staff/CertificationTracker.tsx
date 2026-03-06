'use client';

import type { Certification } from '@/types/staff';

interface CertificationTrackerProps {
    certifications: Certification[];
}

export default function CertificationTracker({ certifications }: CertificationTrackerProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'expired':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Certifications</h2>

            {certifications.length > 0 ? (
                <div className="space-y-3">
                    {certifications.map((cert) => (
                        <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="font-medium text-gray-900">{cert.name}</h3>
                                    <p className="text-sm text-gray-600">Issued by: {cert.issuedBy}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cert.status)}`}>
                                    {cert.status}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Issue Date</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(cert.issueDate).toLocaleDateString()}
                                    </p>
                                </div>
                                {cert.expiryDate && (
                                    <div>
                                        <p className="text-gray-600">Expiry Date</p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(cert.expiryDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-600">No certifications added</p>
                </div>
            )}
        </div>
    );
}
