'use client';

import { Dumbbell, Users, Sun } from 'lucide-react';

interface SelectProgramProps {
    selectedProgram: string;
    onSelect: (program: string) => void;
}

export default function SelectProgram({ selectedProgram, onSelect }: SelectProgramProps) {
    const programs = [
        {
            id: 'gymnastics',
            name: 'Gymnastics',
            icon: Dumbbell,
            description: 'Build strength, flexibility, and coordination through fun gymnastics activities',
            ageRange: '3-12 years',
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-50'
        },
        {
            id: 'multi-sports',
            name: 'Multi-Sports',
            icon: Users,
            description: 'Explore various sports and develop fundamental movement skills',
            ageRange: '4-10 years',
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-50'
        },
        {
            id: 'camps',
            name: 'Holiday Camps',
            icon: Sun,
            description: 'Action-packed camps during school breaks with diverse activities',
            ageRange: '5-12 years',
            color: 'from-orange-500 to-red-500',
            bgColor: 'bg-orange-50'
        }
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Select a Program
            </h2>
            <p className="text-gray-600 mb-8">
                Choose the program you'd like your child to be assessed for
            </p>

            <div className="grid md:grid-cols-3 gap-6">
                {programs.map((program) => {
                    const IconComponent = program.icon;
                    const isSelected = selectedProgram === program.id;

                    return (
                        <button
                            key={program.id}
                            onClick={() => onSelect(program.id)}
                            className={`text-left p-6 rounded-2xl border-2 transition-all duration-300 ${isSelected
                                    ? 'border-blue-600 shadow-lg scale-105'
                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                }`}
                        >
                            {/* Icon */}
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${program.color} flex items-center justify-center mb-4`}>
                                <IconComponent className="w-7 h-7 text-white" />
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {program.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                                {program.description}
                            </p>
                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${program.bgColor} text-gray-700`}>
                                Ages {program.ageRange}
                            </div>

                            {/* Selected Indicator */}
                            {isSelected && (
                                <div className="mt-4 flex items-center gap-2 text-blue-600 font-medium">
                                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    Selected
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}