'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiFilter, FiX } from 'react-icons/fi'
import { SearchFilters as SearchFiltersType } from '@/services/enhancedBookingService'

interface SearchFiltersProps {
    onSearch: (filters: SearchFiltersType) => void
    onReset: () => void
}

export default function SearchFilters({ onSearch, onReset }: SearchFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [filters, setFilters] = useState<SearchFiltersType>({
        availableOnly: true
    })

    const handleSearch = () => {
        onSearch(filters)
    }

    const handleReset = () => {
        setFilters({ availableOnly: true })
        onReset()
    }

    const programTypes = [
        'REGULAR_CLASS',
        'TRIAL',
        'DROP_IN',
        'CAMP',
        'PRIVATE_LESSON',
        'EVENT'
    ]

    const skillLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE']

    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            {/* Search Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <FiSearch className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">Search Classes</h3>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                    <FiFilter className="w-4 h-4" />
                    <span>{isExpanded ? 'Hide' : 'Show'} Filters</span>
                </button>
            </div>

            {/* Quick Search */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Program Type
                    </label>
                    <select data-testid="select-components-booking-SearchFilters-1"
                        value={filters.programType || ''}
                        onChange={(e) => setFilters({ ...filters, programType: e.target.value || undefined })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Types</option>
                        {programTypes.map(type => (
                            <option key={type} value={type}>{type.replace('_', ' ')}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                    </label>
                    <input
                        type="date"
                        value={filters.startDate || ''}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                    </label>
                    <input
                        type="date"
                        value={filters.endDate || ''}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Advanced Filters */}
            {isExpanded && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-4 border-t border-gray-200"
                >
                    {/* Skill Level */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Skill Level
                        </label>
                        <select data-testid="select-components-booking-SearchFilters-2"
                            value={filters.skillLevel || ''}
                            onChange={(e) => setFilters({ ...filters, skillLevel: e.target.value || undefined })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Levels</option>
                            {skillLevels.map(level => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                    </div>

                    {/* Age Group */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Min Age
                            </label>
                            <input
                                type="number"
                                min="3"
                                max="18"
                                value={filters.ageGroup?.min || ''}
                                onChange={(e) => setFilters({
                                    ...filters,
                                    ageGroup: {
                                        min: parseInt(e.target.value) || 3,
                                        max: filters.ageGroup?.max || 18
                                    }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="3"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max Age
                            </label>
                            <input
                                type="number"
                                min="3"
                                max="18"
                                value={filters.ageGroup?.max || ''}
                                onChange={(e) => setFilters({
                                    ...filters,
                                    ageGroup: {
                                        min: filters.ageGroup?.min || 3,
                                        max: parseInt(e.target.value) || 18
                                    }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="18"
                            />
                        </div>
                    </div>

                    {/* Days of Week */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preferred Days
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {daysOfWeek.map(day => (
                                <button
                                    key={day}
                                    onClick={() => {
                                        const currentDays = filters.dayOfWeek || []
                                        const newDays = currentDays.includes(day)
                                            ? currentDays.filter(d => d !== day)
                                            : [...currentDays, day]
                                        setFilters({ ...filters, dayOfWeek: newDays.length > 0 ? newDays : undefined })
                                    }}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${filters.dayOfWeek?.includes(day)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {day.slice(0, 3)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Min Price ($)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={filters.minPrice || ''}
                                onChange={(e) => setFilters({ ...filters, minPrice: parseInt(e.target.value) || undefined })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max Price ($)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={filters.maxPrice || ''}
                                onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) || undefined })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="1000"
                            />
                        </div>
                    </div>

                    {/* Available Only Toggle */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="availableOnly"
                            checked={filters.availableOnly || false}
                            onChange={(e) => setFilters({ ...filters, availableOnly: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="availableOnly" className="text-sm font-medium text-gray-700">
                            Show only available classes
                        </label>
                    </div>
                </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 mt-6">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSearch}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                >
                    Search Classes
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReset}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                    <FiX className="w-5 h-5" />
                </motion.button>
            </div>
        </div>
    )
}
