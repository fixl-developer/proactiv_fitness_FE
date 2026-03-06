import PaymentList from '@/components/payments/PaymentList';

export default function PaymentsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
                <p className="text-gray-600 mt-1">Manage payment transactions</p>
            </div>

            <PaymentList />
        </div>
    );
}
