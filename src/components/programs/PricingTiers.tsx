'use client';

import { useState } from 'react';
import type { ProgramPricing } from '@/types/program';

interface PricingTiersProps {
    pricing: Omit<ProgramPricing, 'id'>[];
    onChange: (pricing: Omit<ProgramPricing, 'id'>[]) => void;
}

export default function PricingTiers({ pricing, onChange }: PricingTiersProps) {
    const addPricingTier = () => {
        onChange([
            ...pricing,
            {
                name: '',
                type: 'single',
                sessions: 1,
                price: 0,
                validityDays: 30,
                discount: 0,
                isPopular: false,
                description: '',
            },
        ]);
    };

    const removePricingTier = (index: number) => {
        onChange(pricing.filter((_, i) => i !== index));
    };

    const updatePricingTier = (index: number, field: string, value: any) => {
        const updated = [...pricing];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Pricing Tiers</h2>
                <button
                    type="button"
                    onClick={addPricingTier}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Tier
                </button>
            </div>

            {pricing.length > 0 ? (
                <div className="space-y-4">
                    {pricing.map((tier, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-gray-900">Tier {index + 1}</h3>
                                <button
                                    type="button"
                                    onClick={() => removePricingTier(index)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tier Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={tier.name}
                                        onChange={(e) => updatePricingTier(index, 'name', e.target.value)}
                                        placeholder="e.g., Single Class"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                                    <select
                                        required
                                        value={tier.type}
                                        onChange={(e) => updatePricingTier(index, 'type', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="single">Single</option>
                                        <option value="package">Package</option>
                                        <option value="term">Term</option>
                                        <option value="membership">Membership</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sessions *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={tier.sessions}
                                        onChange={(e) => updatePricingTier(index, 'sessions', parseInt(e.target.value))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={tier.price}
                                        onChange={(e) => updatePricingTier(index, 'price', parseFloat(e.target.value))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Validity (days) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={tier.validityDays}
                                        onChange={(e) => updatePricingTier(index, 'validityDays', parseInt(e.target.value))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={tier.discount || 0}
                                        onChange={(e) => updatePricingTier(index, 'discount', parseInt(e.target.value))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={tier.description || ''}
                                    onChange={(e) => updatePricingTier(index, 'description', e.target.value)}
                                    rows={2}
                                    placeholder="Optional description for this pricing tier"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="mt-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={tier.isPopular || false}
                                        onChange={(e) => updatePricingTier(index, 'isPopular', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Mark as popular (recommended)</span>
                                </label>
                            </div>

                            {tier.sessions > 0 && tier.price > 0 && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                        Price per session: <span className="font-semibold text-gray-900">
                                            ${(tier.price / tier.sessions).toFixed(2)}
                                        </span>
                                    </p>
                                    {tier.discount && tier.discount > 0 && (
                                        <p className="text-sm text-green-600 mt-1">
                                            {tier.discount}% discount applied
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-600 mb-2">No pricing tiers added</p>
                    <p className="text-sm text-gray-500">Add at least one pricing tier for this program</p>
                </div>
            )}
        </div>
    );
}
