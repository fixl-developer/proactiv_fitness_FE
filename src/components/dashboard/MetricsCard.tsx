'use client';

interface MetricsCardProps {
    title: string;
    value: string | number;
    change: number;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'purple' | 'orange';
}

export default function MetricsCard({ title, value, change, icon, color }: MetricsCardProps) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
    };

    const isPositive = change >= 0;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                    <div className="flex items-center mt-2">
                        <span
                            className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'
                                }`}
                        >
                            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
                        </span>
                        <span className="text-sm text-gray-500 ml-2">vs last period</span>
                    </div>
                </div>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
