'use client';

interface AgeGroupConfigProps {
    ageGroup: { min: number; max: number };
    onChange: (ageGroup: { min: number; max: number }) => void;
}

export default function AgeGroupConfig({ ageGroup, onChange }: AgeGroupConfigProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Age Group Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Age *</label>
                    <input
                        type="number"
                        required
                        min="1"
                        max="100"
                        value={ageGroup.min}
                        onChange={(e) => onChange({ ...ageGroup, min: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum age requirement for enrollment</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Age *</label>
                    <input
                        type="number"
                        required
                        min="1"
                        max="100"
                        value={ageGroup.max}
                        onChange={(e) => onChange({ ...ageGroup, max: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum age allowed for enrollment</p>
                </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="text-sm font-medium text-blue-900">Age Group: {ageGroup.min}-{ageGroup.max} years</p>
                        <p className="text-xs text-blue-700 mt-1">
                            Students must be within this age range to enroll in this program
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
