import Link from 'next/link';
import InvoiceList from '@/components/billing/InvoiceList';

export default function BillingPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Billing & Invoices</h1>
                    <p className="text-gray-600 mt-1">Manage invoices and billing</p>
                </div>
                <Link href="/billing/invoices/create">
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Invoice
                    </button>
                </Link>
            </div>

            <InvoiceList />
        </div>
    );
}
