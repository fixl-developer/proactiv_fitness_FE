import BulkScheduleCreator from '@/components/schedule/BulkScheduleCreator';

export default function BulkSchedulePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Bulk Schedule Creation</h1>
                <p className="text-gray-600 mt-1">Create multiple schedules at once using templates</p>
            </div>

            <BulkScheduleCreator />
        </div>
    );
}
