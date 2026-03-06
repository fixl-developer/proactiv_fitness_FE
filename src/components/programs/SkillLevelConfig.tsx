'use client';

interface SkillLevelConfigProps {
    skillLevel: string;
    onChange: (skillLevel: string) => void;
}

export default function SkillLevelConfig({ skillLevel, onChange }: SkillLevelConfigProps) {
    const skillLevels = [
        { value: 'all', label: 'All Levels', description: 'Open to students of any skill level', color: 'bg-gray-100 text-gray-800' },
        { value: 'beginner', label: 'Beginner', description: 'For students new to the activity', color: 'bg-blue-100 text-blue-800' },
        { value: 'intermediate', label: 'Intermediate', description: 'For students with basic skills', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'advanced', label: 'Advanced', description: 'For experienced students', color: 'bg-orange-100 text-orange-800' },
        { value: 'elite', label: 'Elite', description: 'For competitive level students', color: 'bg-purple-100 text-purple-800' },
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Skill Level Requirement</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skillLevels.map((level) => (
                    <button
                        key={level.value}
                        type="button"
                        onClick={() => onChange(level.value)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${skillLevel === level.value
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${skillLevel === level.value ? 'border-blue-600' : 'border-gray-300'
                                }`}>
                                {skillLevel === level.value && (
                                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                                )}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${level.color}`}>
                                {level.label}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600">{level.description}</p>
                    </button>
                ))}
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="text-sm font-medium text-blue-900">
                            Selected: {skillLevels.find(l => l.value === skillLevel)?.label}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                            {skillLevels.find(l => l.value === skillLevel)?.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
