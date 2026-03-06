import CheckInInterface from '@/components/attendance/CheckInInterface';
import QRScanner from '@/components/attendance/QRScanner';
import AttendanceList from '@/components/attendance/AttendanceList';

export default function AttendancePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
                <p className="text-gray-600 mt-1">Track student attendance and check-ins</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CheckInInterface />
                <QRScanner />
            </div>

            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Today's Attendance</h2>
                <AttendanceList />
            </div>
        </div>
    );
}
