import InvoiceForm from '@/components/billing/InvoiceForm';

export default function CreateInvoicePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
                <p className="text-gray-600 mt-1">Generate a new invoice for a student</p>
            </div>

            <InvoiceForm />
        </div>
    );
}
