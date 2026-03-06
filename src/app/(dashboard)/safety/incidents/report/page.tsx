import IncidentReportForm from '@/components/safety/IncidentReportForm';

export default function ReportIncidentPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Report Incident</h1>
                <p className="text-gray-600 mt-1">Document safety incidents and actions taken</p>
            </div>

            <IncidentReportForm />
        </div>
    );
}
