'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { paymentsApi } from '@/lib/api/payments';
import type { Invoice, InvoiceItem } from '@/types/payment';
import { toast } from 'sonner';

export default function InvoiceForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        studentId: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        items: [] as Omit<InvoiceItem, 'id'>[],
        tax: 0,
        discount: 0,
    });

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }],
        });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const items = [...formData.items];
        items[index] = { ...items[index], [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
            items[index].total = items[index].quantity * items[index].unitPrice;
        }
        setFormData({ ...formData, items });
    };

    const removeItem = (index: number) => {
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index),
        });
    };

    const calculateSubtotal = () => {
        return formData.items.reduce((sum, item) => sum + item.total, 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        return subtotal + formData.tax - formData.discount;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const subtotal = calculateSubtotal();
            const total = calculateTotal();

            await paymentsApi.createInvoice({
                ...formData,
                subtotal,
                total,
                amountPaid: 0,
                amountDue: total,
                status: 'draft',
            });
            toast.success('Invoice created successfully');
            router.push('/billing/invoices');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create invoice');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                        <select
                            required
                            value={formData.studentId}
                            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select Student</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date *</label>
                        <input
                            type="date"
                            required
                            value={formData.issueDate}
                            onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                        <input
                            type="date"
                            required
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Line Items</h2>
                    <button
                        type="button"
                        onClick={addItem}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Add Item
                    </button>
                </div>

                <div className="space-y-4">
                    {formData.items.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <input
                                        type="text"
                                        required
                                        value={item.description}
                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={item.unitPrice}
                                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex items-end gap-2">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                                        <input
                                            type="text"
                                            readOnly
                                            value={`$${item.total.toFixed(2)}`}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="px-3 py-2 text-red-600 hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 border-t border-gray-200 pt-4">
                    <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-semibold">${calculateSubtotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Tax:</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.tax}
                                    onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                                    className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Discount:</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.discount}
                                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                                    className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                                />
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                                <span>Total:</span>
                                <span>${calculateTotal().toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Creating...' : 'Create Invoice'}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
