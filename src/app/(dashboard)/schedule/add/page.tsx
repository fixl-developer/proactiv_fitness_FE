import ScheduleForm from '@/components/schedule/ScheduleForm';

export default function AddSchedulePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Add New Schedule</h1>
                <p className="text-gray-600 mt-1">Create a new class schedule</p>
            </div>

            <ScheduleForm />
        </div>
    );
}
