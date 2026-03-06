'use client';

import type { Invoice } from '@/types/payment';

interface InvoiceDetailProps {
    invoice: Invoice;
}

export default function InvoiceDetail({ invoice }: InvoiceDetailProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                    <p className="text-gray-600 mt-1">#{invoice.invoiceNumber}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                    }`}>
                    {invoice.status.toUpperCase()}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Bill To:</h3>
                    <p className="font-semibold text-gray-900">{invoice.studentName}</p>
                    <p className="text-gray-600">{invoice.parentEmail}</p>
                </div>
                <div className="text-right">
                    <div className="mb-2">
                        <p className="text-sm text-gray-600">Issue Date</p>
                        <p className="font-medium text-gray-900">
                            {new Date(invoice.issueDate).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Due Date</p>
                        <p className="font-medium text-gray-900">
                            {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="border-t border-b border-gray-200 py-4 mb-8">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-sm text-gray-600">
                            <th className="pb-2">Description</th>
                            <th className="pb-2 text-center">Quantity</th>
                            <th className="pb-2 text-right">Unit Price</th>
                            <th className="pb-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item) => (
                            <tr key={item.id} className="border-t border-gray-100">
                                <td className="py-3">{item.description}</td>
                                <td className="py-3 text-center">{item.quantity}</td>
                                <td className="py-3 text-right">${item.unitPrice.toFixed(2)}</td>
                                <td className="py-3 text-right font-medium">${item.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end">
                <div className="w-64 space-y-2">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal:</span>
                        <span>${invoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Tax:</span>
                        <span>${invoice.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Discount:</span>
                        <span>-${invoice.discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-900 border-t border-gray-200 pt-2">
                        <span>Total:</span>
                        <span>${invoice.total.toFixed(2)}</span>
                    </div>
                    {invoice.amountPaid > 0 && (
                        <>
                            <div className="flex justify-between text-green-600">
                                <span>Paid:</span>
                                <span>-${invoice.amountPaid.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-red-600">
                                <span>Amount Due:</span>
                                <span>${invoice.amountDue.toFixed(2)}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
