import StaffForm from '@/components/staff/StaffForm';

export default function AddStaffPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Add Staff Member</h1>
                <p className="text-gray-600 mt-1">Create a new staff member profile</p>
            </div>

            <StaffForm />
        </div>
    );
}
