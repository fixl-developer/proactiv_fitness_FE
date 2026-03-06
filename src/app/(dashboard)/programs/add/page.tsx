import ProgramForm from '@/components/programs/ProgramForm';

export default function AddProgramPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Add New Program</h1>
                <p className="text-gray-600 mt-1">Create a new program or class</p>
            </div>

            <ProgramForm />
        </div>
    );
}
