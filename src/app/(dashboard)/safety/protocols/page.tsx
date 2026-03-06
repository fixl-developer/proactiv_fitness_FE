import EmergencyProtocols from '@/components/safety/EmergencyProtocols';

export default function ProtocolsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Emergency Protocols</h1>
                <p className="text-gray-600 mt-1">View and activate emergency response protocols</p>
            </div>

            <EmergencyProtocols />
        </div>
    );
}
