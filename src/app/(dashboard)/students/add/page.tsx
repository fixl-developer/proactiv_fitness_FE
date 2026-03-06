import StudentForm from '@/components/students/StudentForm';

export default function AddStudentPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Add New Student</h1>
                <p className="text-gray-600 mt-1">Create a new student profile</p>
            </div>

            <StudentForm />
        </div>
    );
}
