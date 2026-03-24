'use client';

interface ChildDetailsProps {
    childName: string;
    childAge: string;
    childGender: string;
    onUpdate: (data: { childName?: string; childAge?: string; childGender?: string }) => void;
}

export default function ChildDetails({ childName, childAge, childGender, onUpdate }: ChildDetailsProps) {
    const ageOptions = Array.from({ length: 10 }, (_, i) => i + 3); // Ages 3-12

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Tell Us About Your Child
            </h2>
            <p className="text-gray-600 mb-8">
                Help us prepare for your child's assessment
            </p>

            <div className="space-y-6">
                {/* Child Name */}
                <div>
                    <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-2">
                        Child's Name *
                    </label>
                    <input
                        type="text"
                        id="childName"
                        value={childName}
                        onChange={(e) => onUpdate({ childName: e.target.value })}
                        placeholder="Enter your child's first name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>

                {/* Child Age */}
                <div>
                    <label htmlFor="childAge" className="block text-sm font-medium text-gray-700 mb-2">
                        Child's Age *
                    </label>
                    <select
                        id="childAge"
                        value={childAge}
                        onChange={(e) => onUpdate({ childAge: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                        <option value="">Select age</option>
                        {ageOptions.map((age) => (
                            <option key={age} value={age.toString()}>
                                {age} years old
                            </option>
                        ))}
                    </select>
                </div>

                {/* Child Gender (Optional) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender (Optional)
                    </label>
                    <div className="flex gap-4">
                        {['Boy', 'Girl', 'Prefer not to say'].map((option) => (
                            <button id={`child-details-gender-${option.toLowerCase().replace(/\s+/g, '-')}-btn`}
                                key={option}
                                onClick={() => onUpdate({ childGender: option })}
                                className={`px-6 py-3 rounded-xl border-2 font-medium transition-all ${childGender === option
                                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                        Why do we ask for this information?
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Helps our coaches prepare age-appropriate activities</li>
                        <li>• Ensures we have the right equipment ready</li>
                        <li>• Allows us to create a comfortable environment for your child</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
