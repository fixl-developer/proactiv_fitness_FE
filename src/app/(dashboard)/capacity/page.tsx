import CapacityDashboard from '@/components/capacity/CapacityDashboard';
import RebalanceRecommendations from '@/components/capacity/RebalanceRecommendations';

export default function CapacityPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Capacity Optimization</h1>
                <p className="text-gray-600 mt-1">Optimize class capacity and maximize revenue</p>
            </div>

            <CapacityDashboard />

            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Rebalance Recommendations</h2>
                <RebalanceRecommendations />
            </div>
        </div>
    );
}
