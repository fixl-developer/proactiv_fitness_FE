'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { programsApi } from '@/lib/api/programs';
import type { ProgramFormData } from '@/types/program';
import { toast } from 'sonner';
import AgeGroupConfig from './AgeGroupConfig';
import SkillLevelConfig from './SkillLevelConfig';
import PricingTiers from './PricingTiers';

interface ProgramFormProps {
    initialData?: Partial<ProgramFormData>;
    programId?: string;
}

export default function ProgramForm({ initialData, programId }: ProgramFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<ProgramFormData>({
        name: initialData?.name || '',
        description: initialData?.description || '',
        type: initialData?.type || 'regular',
        category: initialData?.category || 'gymnastics',
        ageGroup: initialData?.ageGroup || { min: 3, max: 18 },
        skillLevel: initialData?.skillLevel || 'all',
        prerequisites: initialData?.prerequisites || [],
        duration: initialData?.duration || 60,
        sessionsPerWeek: initialData?.sessionsPerWeek || 1,
        totalSessions: initialData?.totalSessions || 12,
        termBased: initialData?.termBased || false,
        minCapacity: initialData?.minCapacity || 5,
        maxCapacity: initialData?.maxCapacity || 15,
        pricing: initialData?.pricing || [],
        locationIds: initialData?.locationIds || [],
        roomRequirements: initialData?.roomRequirements || [],
        equipmentRequired: initialData?.equipmentRequired || [],
        minInstructors: initialData?.minInstructors || 1,
        maxInstructors: initialData?.maxInstructors || 2,
        certificationRequired: initialData?.certificationRequired || [],
        skillsToLearn: initialData?.skillsToLearn || [],
        certificationsOffered: initialData?.certificationsOffered || [],
        images: initialData?.images || [],
        videos: initialData?.videos || [],
        status: initialData?.status || 'active',
        isPublic: initialData?.isPublic ?? true,
        isFeatured: initialData?.isFeatured ?? false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (programId) {
                await programsApi.update(programId, formData);
                toast.success('Program updated successfully');
            } else {
                await programsApi.create(formData);
                toast.success('Program created successfully');
            }
            router.push('/programs');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save program');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Program Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => handleChange('type', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="regular">Regular</option>
                                <option value="camp">Camp</option>
                                <option value="event">Event</option>
                                <option value="private">Private</option>
                                <option value="assessment">Assessment</option>
                                <option value="party">Party</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="gymnastics">Gymnastics</option>
                                <option value="multi-activity">Multi-Activity</option>
                                <option value="camps">Camps</option>
                                <option value="parties">Parties</option>
                                <option value="elite">Elite</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                            <select
                                required
                                value={formData.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.isPublic}
                                onChange={(e) => handleChange('isPublic', e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Public (visible on website)</span>
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.isFeatured}
                                onChange={(e) => handleChange('isFeatured', e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Featured</span>
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.termBased}
                                onChange={(e) => handleChange('termBased', e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Term Based</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Age Group & Skill Level */}
            <AgeGroupConfig
                ageGroup={formData.ageGroup}
                onChange={(ageGroup) => handleChange('ageGroup', ageGroup)}
            />

            <SkillLevelConfig
                skillLevel={formData.skillLevel}
                onChange={(skillLevel) => handleChange('skillLevel', skillLevel)}
            />

            {/* Schedule Configuration */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule Configuration</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
                        <input
                            type="number"
                            required
                            min="15"
                            value={formData.duration}
                            onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sessions Per Week *</label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={formData.sessionsPerWeek}
                            onChange={(e) => handleChange('sessionsPerWeek', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Sessions *</label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={formData.totalSessions}
                            onChange={(e) => handleChange('totalSessions', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Capacity Configuration */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Capacity Configuration</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Capacity *</label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={formData.minCapacity}
                            onChange={(e) => handleChange('minCapacity', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Capacity *</label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={formData.maxCapacity}
                            onChange={(e) => handleChange('maxCapacity', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Pricing Tiers */}
            <PricingTiers
                pricing={formData.pricing}
                onChange={(pricing) => handleChange('pricing', pricing)}
            />

            {/* Staff Requirements */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Staff Requirements</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Instructors *</label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={formData.minInstructors}
                            onChange={(e) => handleChange('minInstructors', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Instructors *</label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={formData.maxInstructors}
                            onChange={(e) => handleChange('maxInstructors', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving...' : programId ? 'Update Program' : 'Create Program'}
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
