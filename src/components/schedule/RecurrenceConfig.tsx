'use client';

import type { RecurrencePattern } from '@/types/schedule';

interface RecurrenceConfigProps {
    pattern: RecurrencePattern;
    onChange: (pattern: RecurrencePattern) => void;
}

export default function RecurrenceConfig({ pattern, onChange }: RecurrenceConfigProps) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const toggleDay = (dayIndex: number) => {
        const currentDays = pattern.daysOfWeek || [];
        const newDays = currentDays.includes(dayIndex)
            ? currentDays.filter(d => d !== dayIndex)
            : [...currentDays, dayIndex].sort();

        onChange({ ...pattern, daysOfWeek: newDays });
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                    <select
                        value={pattern.frequency}
                        onChange={(e) => onChange({ ...pattern, frequency: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Repeat Every</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="1"
                            value={pattern.interval}
                            onChange={(e) => onChange({ ...pattern, interval: parseInt(e.target.value) })}
                            className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-gray-600">
                            {pattern.frequency === 'daily' && 'day(s)'}
                            {pattern.frequency === 'weekly' && 'week(s)'}
                            {pattern.frequency === 'monthly' && 'month(s)'}
                        </span>
                    </div>
                </div>
            </div>

            {pattern.frequency === 'weekly' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Repeat On</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {daysOfWeek.map((day, index) => (
                            <button
                                key={day}
                                type="button"
                                onClick={() => toggleDay(index)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pattern.daysOfWeek?.includes(index)
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {day.substring(0, 3)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {pattern.frequency === 'monthly' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Day of Month</label>
                    <input
                        type="number"
                        min="1"
                        max="31"
                        value={pattern.dayOfMonth || 1}
                        onChange={(e) => onChange({ ...pattern, dayOfMonth: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                        type="date"
                        value={pattern.endDate || ''}
                        onChange={(e) => onChange({ ...pattern, endDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Or After Occurrences</label>
                    <input
                        type="number"
                        min="1"
                        value={pattern.occurrences || ''}
                        onChange={(e) => onChange({ ...pattern, occurrences: parseInt(e.target.value) })}
                        placeholder="Leave empty for no limit"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <span className="font-medium">Summary: </span>
                    Repeats every {pattern.interval} {pattern.frequency === 'daily' ? 'day' : pattern.frequency === 'weekly' ? 'week' : 'month'}
                    {pattern.frequency === 'weekly' && pattern.daysOfWeek && pattern.daysOfWeek.length > 0 &&
                        ` on ${pattern.daysOfWeek.map(d => daysOfWeek[d].substring(0, 3)).join(', ')}`}
                    {pattern.endDate && ` until ${new Date(pattern.endDate).toLocaleDateString()}`}
                    {pattern.occurrences && ` for ${pattern.occurrences} occurrences`}
                </p>
            </div>
        </div>
    );
}
