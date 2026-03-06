'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { studentsApi } from '@/lib/api/students';
import type { StudentFormData } from '@/types/student';
import { toast } from 'sonner';

interface StudentFormProps {
    initialData?: Partial<StudentFormData>;
    studentId?: string;
}

export default function StudentForm({ initialData, studentId }: StudentFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<StudentFormData>({
        firstName: initialData?.firstName || '',
        lastName: initialData?.lastName || '',
        dateOfBirth: initialData?.dateOfBirth || '',
        gender: initialData?.gender || 'male',
        skillLevel: initialData?.skillLevel || 'beginner',
        parentFirstName: initialData?.parentFirstName || '',
        parentLastName: initialData?.parentLastName || '',
        parentEmail: initialData?.parentEmail || '',
        parentPhone: initialData?.parentPhone || '',
        address: initialData?.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'USA',
        },
        medicalInfo: initialData?.medicalInfo || {
            allergies: [],
            medications: [],
            conditions: [],
            bloodType: '',
            specialNeeds: '',
        },
        emergencyContacts: initialData?.emergencyContacts || [],
        notes: initialData?.notes || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (studentId) {
                await studentsApi.update(studentId, formData);
                toast.success('Student updated successfully');
            } else {
                await studentsApi.create(formData);
                toast.success('Student created successfully');
            }
            router.push('/students');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save student');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleNestedChange = (parent: string, field: string, value: any) => {
        setFormData({
            ...formData,
            [parent]: {
                ...(formData[parent as keyof StudentFormData] as any),
                [field]: value,
            },
        });
    };

    const addEmergencyContact = () => {
        setFormData({
            ...formData,
            emergencyContacts: [
                ...formData.emergencyContacts,
                {
                    name: '',
                    relationship: '',
                    phone: '',
                    email: '',
                    isPrimary: false,
                    canPickup: false,
                },
            ],
        });
    };

    const removeEmergencyContact = (index: number) => {
        setFormData({
            ...formData,
            emergencyContacts: formData.emergencyContacts.filter((_, i) => i !== index),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.firstName}
                            onChange={(e) => handleChange('firstName', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.lastName}
                            onChange={(e) => handleChange('lastName', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                        <input
                            type="date"
                            required
                            value={formData.dateOfBirth}
                            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                        <select
                            required
                            value={formData.gender}
                            onChange={(e) => handleChange('gender', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level *</label>
                        <select
                            required
                            value={formData.skillLevel}
                            onChange={(e) => handleChange('skillLevel', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="elite">Elite</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Parent Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Parent/Guardian Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent First Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.parentFirstName}
                            onChange={(e) => handleChange('parentFirstName', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Last Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.parentLastName}
                            onChange={(e) => handleChange('parentLastName', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Email *</label>
                        <input
                            type="email"
                            required
                            value={formData.parentEmail}
                            onChange={(e) => handleChange('parentEmail', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone *</label>
                        <input
                            type="tel"
                            required
                            value={formData.parentPhone}
                            onChange={(e) => handleChange('parentPhone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Address</h2>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                        <input
                            type="text"
                            required
                            value={formData.address.street}
                            onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                            <input
                                type="text"
                                required
                                value={formData.address.city}
                                onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                            <input
                                type="text"
                                required
                                value={formData.address.state}
                                onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code *</label>
                            <input
                                type="text"
                                required
                                value={formData.address.zipCode}
                                onChange={(e) => handleNestedChange('address', 'zipCode', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Emergency Contacts</h2>
                    <button
                        type="button"
                        onClick={addEmergencyContact}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Add Contact
                    </button>
                </div>
                <div className="space-y-4">
                    {formData.emergencyContacts.map((contact, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-gray-900">Contact {index + 1}</h3>
                                <button
                                    type="button"
                                    onClick={() => removeEmergencyContact(index)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={contact.name}
                                        onChange={(e) => {
                                            const updated = [...formData.emergencyContacts];
                                            updated[index].name = e.target.value;
                                            handleChange('emergencyContacts', updated);
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                                    <input
                                        type="text"
                                        value={contact.relationship}
                                        onChange={(e) => {
                                            const updated = [...formData.emergencyContacts];
                                            updated[index].relationship = e.target.value;
                                            handleChange('emergencyContacts', updated);
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={contact.phone}
                                        onChange={(e) => {
                                            const updated = [...formData.emergencyContacts];
                                            updated[index].phone = e.target.value;
                                            handleChange('emergencyContacts', updated);
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={contact.email}
                                        onChange={(e) => {
                                            const updated = [...formData.emergencyContacts];
                                            updated[index].email = e.target.value;
                                            handleChange('emergencyContacts', updated);
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Notes</h2>
                <textarea
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any additional information about the student..."
                />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving...' : studentId ? 'Update Student' : 'Create Student'}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
