'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { apiClient } from '@/services/api/client';
import { toast } from 'sonner';
import {
  DollarSign,
  Clock,
  AlertTriangle,
  RotateCcw,
  FileText,
  Bell,
  Download,
  Search,
  Filter,
  MoreHorizontal,
  CreditCard,
  Building2,
  Banknote,
  CheckCircle2,
  XCircle,
  Eye,
  Send,
  Trash2,
  Loader2,
  WifiOff,
  X,
  Plus,
  User,
  CalendarDays,
} from 'lucide-react';

interface Invoice {
  id: string;
  student: string;
  description: string;
  amount: number;
  date: string;
  method: string;
  status: string;
}

interface PaymentStats {
  totalRevenue: string;
  pendingCount: number;
  pendingAmount: string;
  overdueCount: number;
  overdueAmount: string;
  refundsTotal: string;
  refundsCount: number;
  collectionRate: number;
  collectionCurrent: string;
  collectionTarget: string;
}

const fallbackInvoices: Invoice[] = [
  { id: 'INV-001', student: 'Sarah Johnson', description: 'Term Fee Spring 2026', amount: 1200, date: '2026-03-15', method: 'Credit Card', status: 'Paid' },
  { id: 'INV-002', student: 'Tom Chen', description: 'GYMTOTS Term Registration', amount: 800, date: '2026-03-17', method: 'Bank Transfer', status: 'Pending' },
  { id: 'INV-003', student: 'Amy Wong', description: 'Holiday Camp Package', amount: 2500, date: '2026-03-10', method: 'Credit Card', status: 'Paid' },
  { id: 'INV-004', student: 'Jack Liu', description: 'Private Lesson (4 Sessions)', amount: 375, date: '2026-02-28', method: 'Cash', status: 'Overdue' },
  { id: 'INV-005', student: 'Emily Park', description: 'Camp Refund', amount: 625, date: '2026-03-05', method: '-', status: 'Refunded' },
];

const fallbackStats: PaymentStats = {
  totalRevenue: 'HK$48,250',
  pendingCount: 8,
  pendingAmount: 'HK$6,400',
  overdueCount: 3,
  overdueAmount: 'HK$1,750',
  refundsTotal: 'HK$1,250',
  refundsCount: 2,
  collectionRate: 78,
  collectionCurrent: 'HK$48,250',
  collectionTarget: 'HK$62,000',
};

const statusConfig: Record<string, { className: string }> = {
  Paid: { className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' },
  Pending: { className: 'bg-amber-100 text-amber-700 hover:bg-amber-100' },
  Overdue: { className: 'bg-red-100 text-red-700 hover:bg-red-100' },
  Refunded: { className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
};

const methodConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; className: string }> = {
  'Credit Card': { icon: CreditCard, className: 'bg-purple-100 text-purple-700' },
  'Bank Transfer': { icon: Building2, className: 'bg-indigo-100 text-indigo-700' },
  Cash: { icon: Banknote, className: 'bg-green-100 text-green-700' },
  '-': { icon: RotateCcw, className: 'bg-gray-100 text-gray-500' },
};

export default function PaymentsBillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStats>(fallbackStats);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    studentName: '',
    description: '',
    amount: '',
    currency: 'HKD',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    billingPeriod: 'monthly' as 'monthly' | 'quarterly' | 'annual' | 'one-time',
    notes: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setUsingFallback(false);

    // Fetch invoices
    try {
      const res: any = await apiClient.get('/billing');
      // apiClient.get returns axios response.data = { success: true, data: [...] }
      const raw = res?.data ?? res;
      const items = Array.isArray(raw) ? raw : [];
      setInvoices(items.map((item: any) => ({
        id: item.billingId || item._id || item.id || `INV-${Math.random().toString(36).slice(2, 6)}`,
        student: item.studentName || item.userId || 'Unknown',
        description: item.notes || item.items?.[0]?.description || item.description || '',
        amount: Number(item.amount) || 0,
        date: item.createdAt || item.dueDate || new Date().toISOString().slice(0, 10),
        method: item.paymentMethod || item.method || '-',
        status: (item.status || 'pending').charAt(0).toUpperCase() + (item.status || 'pending').slice(1),
      })));
    } catch (err: any) {
      console.error('Billing fetch error:', err?.message);
      setInvoices([]);
      setUsingFallback(true);
    }

    // Fetch stats
    try {
      const statsRes: any = await apiClient.get('/payments/stats');
      const sd = statsRes?.data ?? statsRes;
      setPaymentStats({
        totalRevenue: `$${(sd?.totalAmount || 0).toLocaleString()}`,
        pendingCount: sd?.pendingPayments || 0,
        pendingAmount: `$${((sd?.pendingPayments || 0) * 100).toLocaleString()}`,
        overdueCount: 0,
        overdueAmount: '$0',
        refundsTotal: '$0',
        refundsCount: 0,
        collectionRate: sd?.totalPayments > 0 ? Math.round(((sd?.completedPayments || 0) / sd.totalPayments) * 100) : 0,
        collectionCurrent: `$${(sd?.totalAmount || 0).toLocaleString()}`,
        collectionTarget: `$${Math.round(Math.max((sd?.totalAmount || 0) * 1.3, 1000)).toLocaleString()}`,
      });
    } catch (err: any) {
      console.error('Stats fetch error:', err?.message);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetInvoiceForm = () => {
    setInvoiceForm({
      studentName: '',
      description: '',
      amount: '',
      currency: 'HKD',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      billingPeriod: 'monthly',
      notes: '',
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    });
  };

  const addLineItem = () => {
    setInvoiceForm((prev) => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0 }],
    }));
  };

  const removeLineItem = (index: number) => {
    if (invoiceForm.items.length <= 1) return;
    setInvoiceForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateLineItem = (index: number, field: string, value: string | number) => {
    setInvoiceForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  const calculatedTotal = invoiceForm.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const handleCreateInvoice = async () => {
    if (!invoiceForm.studentName.trim()) {
      toast.error('Student / Parent name is required');
      return;
    }
    if (invoiceForm.items.every((item) => !item.description.trim())) {
      toast.error('At least one line item with a description is required');
      return;
    }
    if (calculatedTotal <= 0 && !invoiceForm.amount) {
      toast.error('Invoice amount must be greater than 0');
      return;
    }

    setCreatingInvoice(true);
    try {
      const totalAmount = invoiceForm.amount ? Number(invoiceForm.amount) : calculatedTotal;
      const payload = {
        userId: invoiceForm.studentName,
        studentName: invoiceForm.studentName,
        description: invoiceForm.description || invoiceForm.items[0]?.description || 'Invoice',
        amount: totalAmount,
        currency: invoiceForm.currency,
        dueDate: invoiceForm.dueDate,
        billingPeriod: invoiceForm.billingPeriod,
        notes: invoiceForm.notes,
        items: invoiceForm.items
          .filter((item) => item.description.trim())
          .map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
      };
      await apiClient.post('/billing', payload);
      toast.success('Invoice created successfully!');
      setShowInvoiceModal(false);
      resetInvoiceForm();
      fetchData();
    } catch {
      toast.error('Failed to create invoice');
    } finally {
      setCreatingInvoice(false);
    }
  };

  const handleUpdateStatus = async (invoiceId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/billing/${invoiceId}/status`, { status: newStatus });
      toast.success(`Invoice ${invoiceId} marked as ${newStatus}`);
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: newStatus } : inv))
      );
    } catch {
      toast.error('Failed to update invoice status. Backend endpoint may not be available.');
    }
    setActionMenuOpen(null);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelect = (id: string) => {
    setSelectedInvoices((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedInvoices.length === filteredInvoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(filteredInvoices.map((i) => i.id));
    }
  };

  const stats = [
    { label: 'Total Revenue (MTD)', value: paymentStats.totalRevenue, icon: DollarSign, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100', change: '+12.5%' },
    { label: 'Pending Payments', value: paymentStats.pendingCount.toString(), icon: Clock, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100', change: paymentStats.pendingAmount },
    { label: 'Overdue', value: paymentStats.overdueCount.toString(), icon: AlertTriangle, gradient: 'from-red-500 to-red-600', bgGradient: 'from-red-50 to-red-100', change: paymentStats.overdueAmount },
    { label: 'Refunds (MTD)', value: paymentStats.refundsTotal, icon: RotateCcw, gradient: 'from-red-500 to-red-600', bgGradient: 'from-red-50 to-red-100', change: `${paymentStats.refundsCount} issued` },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {usingFallback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3"
        >
          <WifiOff className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Backend endpoint not available - showing sample data. Connect the backend for live payment data.
          </p>
          <Button variant="outline" size="sm" onClick={fetchData} className="ml-auto gap-1.5 text-amber-700 border-amber-300 hover:bg-amber-100">
            <RotateCcw className="h-3.5 w-3.5" /> Retry
          </Button>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments &amp; Billing</h1>
          <p className="text-gray-500 text-sm mt-1">Manage invoices, track payments, and handle refunds</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-2">
            <Bell className="h-4 w-4" />
            Send Reminder
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowInvoiceModal(true)}
          >
            <FileText className="h-4 w-4" />
            Generate Invoice
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className={`rounded-lg border-0 bg-gradient-to-br ${stat.bgGradient} p-4 hover:shadow-lg transition-all`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`bg-gradient-to-br ${stat.gradient} p-2.5 rounded-lg shadow-md`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs text-gray-600 font-medium mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Collection Progress */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Monthly Collection Target</span>
              <span className="text-sm font-semibold text-gray-900">
                {paymentStats.collectionRate}% ({paymentStats.collectionCurrent} / {paymentStats.collectionTarget})
              </span>
            </div>
            <Progress value={paymentStats.collectionRate} className="h-2" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters & Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-lg">Recent Payments</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    className="pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-[220px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-1 border rounded-lg p-1">
                  <Filter className="h-3.5 w-3.5 text-gray-400 ml-1.5" />
                  {['All', 'Paid', 'Pending', 'Overdue', 'Refunded'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        statusFilter === s ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left p-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="text-left p-3 font-medium text-gray-600">Invoice #</th>
                    <th className="text-left p-3 font-medium text-gray-600">Student / Parent</th>
                    <th className="text-left p-3 font-medium text-gray-600">Description</th>
                    <th className="text-right p-3 font-medium text-gray-600">Amount (HK$)</th>
                    <th className="text-left p-3 font-medium text-gray-600">Date</th>
                    <th className="text-left p-3 font-medium text-gray-600">Method</th>
                    <th className="text-left p-3 font-medium text-gray-600">Status</th>
                    <th className="text-center p-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredInvoices.map((inv, i) => {
                      const method = methodConfig[inv.method] || methodConfig['-'];
                      const MethodIcon = method.icon;
                      return (
                        <motion.tr
                          key={inv.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ delay: i * 0.04 }}
                          className="border-b hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedInvoices.includes(inv.id)}
                              onChange={() => toggleSelect(inv.id)}
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="p-3 font-mono font-medium text-blue-600">{inv.id}</td>
                          <td className="p-3 font-medium text-gray-900">{inv.student}</td>
                          <td className="p-3 text-gray-600">{inv.description}</td>
                          <td className="p-3 text-right font-semibold text-gray-900">
                            {inv.status === 'Refunded' ? '-' : ''}${inv.amount.toLocaleString()}
                          </td>
                          <td className="p-3 text-gray-600">
                            {new Date(inv.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="p-3">
                            {inv.method !== '-' ? (
                              <Badge className={`${method.className} gap-1 font-normal`}>
                                <MethodIcon className="h-3 w-3" />
                                {inv.method}
                              </Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-3">
                            <Badge className={(statusConfig[inv.status] || statusConfig['Pending']).className}>
                              {inv.status === 'Paid' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              {inv.status === 'Overdue' && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {inv.status === 'Refunded' && <XCircle className="h-3 w-3 mr-1" />}
                              {inv.status === 'Pending' && <Clock className="h-3 w-3 mr-1" />}
                              {inv.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-center relative">
                            <button
                              onClick={() => setActionMenuOpen(actionMenuOpen === inv.id ? null : inv.id)}
                              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                            >
                              <MoreHorizontal className="h-4 w-4 text-gray-500" />
                            </button>
                            {actionMenuOpen === inv.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute right-8 top-2 z-10 bg-white border rounded-lg shadow-lg py-1 w-44"
                              >
                                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                  <Eye className="h-3.5 w-3.5" /> View Details
                                </button>
                                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                  <Send className="h-3.5 w-3.5" /> Send Receipt
                                </button>
                                {inv.status === 'Pending' && (
                                  <button
                                    onClick={() => handleUpdateStatus(inv.id, 'Paid')}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark as Paid
                                  </button>
                                )}
                                {inv.status === 'Overdue' && (
                                  <button
                                    onClick={() => handleUpdateStatus(inv.id, 'Paid')}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark as Paid
                                  </button>
                                )}
                                <button
                                  onClick={() => handleUpdateStatus(inv.id, 'Refunded')}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" /> Void Invoice
                                </button>
                              </motion.div>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
              {filteredInvoices.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No invoices found matching your criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedInvoices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-xl px-5 py-3 flex items-center gap-4 shadow-xl z-50"
          >
            <span className="text-sm font-medium">{selectedInvoices.length} selected</span>
            <Button size="sm" variant="secondary" className="gap-1.5">
              <Send className="h-3.5 w-3.5" /> Send Reminders
            </Button>
            <Button size="sm" variant="secondary" className="gap-1.5">
              <Download className="h-3.5 w-3.5" /> Export Selected
            </Button>
            <button
              onClick={() => setSelectedInvoices([])}
              className="text-gray-400 hover:text-white ml-1"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Generate Invoice Modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {showInvoiceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowInvoiceModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Generate Invoice</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Create a new invoice for a student or parent</p>
                </div>
                <button onClick={() => { setShowInvoiceModal(false); resetInvoiceForm(); }} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Student / Parent Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <User className="h-4 w-4 inline mr-1.5 text-gray-400" />
                    Student / Parent Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={invoiceForm.studentName}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, studentName: e.target.value })}
                    placeholder="e.g. Sarah Johnson"
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Invoice Description
                  </label>
                  <input
                    type="text"
                    value={invoiceForm.description}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                    placeholder="e.g. Term Fee Spring 2026, Holiday Camp, etc."
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Line Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Line Items</label>
                    <button
                      type="button"
                      onClick={addLineItem}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add Item
                    </button>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="text-left px-3 py-2 font-medium text-gray-600">Description</th>
                          <th className="text-center px-3 py-2 font-medium text-gray-600 w-20">Qty</th>
                          <th className="text-right px-3 py-2 font-medium text-gray-600 w-28">Unit Price</th>
                          <th className="text-right px-3 py-2 font-medium text-gray-600 w-28">Total</th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceForm.items.map((item, idx) => (
                          <tr key={idx} className="border-b last:border-0">
                            <td className="px-2 py-1.5">
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                                placeholder="Item description"
                                className="w-full border-0 bg-transparent text-sm focus:outline-none focus:ring-0 px-1 py-1"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => updateLineItem(idx, 'quantity', Number(e.target.value))}
                                className="w-full border rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                value={item.unitPrice || ''}
                                onChange={(e) => updateLineItem(idx, 'unitPrice', Number(e.target.value))}
                                placeholder="0.00"
                                className="w-full border rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-3 py-1.5 text-right text-sm font-medium text-gray-700">
                              ${(item.quantity * item.unitPrice).toLocaleString()}
                            </td>
                            <td className="px-1 py-1.5">
                              {invoiceForm.items.length > 1 && (
                                <button
                                  onClick={() => removeLineItem(idx)}
                                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 border-t">
                          <td colSpan={3} className="px-3 py-2 text-sm font-semibold text-gray-700 text-right">
                            Total:
                          </td>
                          <td className="px-3 py-2 text-sm font-bold text-gray-900 text-right">
                            ${calculatedTotal.toLocaleString()}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Or Manual Amount Override */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <DollarSign className="h-4 w-4 inline mr-1.5 text-gray-400" />
                    Amount Override <span className="text-xs text-gray-400">(leave blank to use line items total)</span>
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={invoiceForm.amount}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                      placeholder={calculatedTotal > 0 ? `Auto: $${calculatedTotal}` : '0.00'}
                      className="flex-1 border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={invoiceForm.currency}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, currency: e.target.value })}
                      className="border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-24"
                    >
                      <option value="HKD">HKD</option>
                      <option value="USD">USD</option>
                      <option value="CNY">CNY</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>

                {/* Due Date + Billing Period */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <CalendarDays className="h-4 w-4 inline mr-1.5 text-gray-400" />
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={invoiceForm.dueDate}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Billing Period
                    </label>
                    <select
                      value={invoiceForm.billingPeriod}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, billingPeriod: e.target.value as any })}
                      className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="one-time">One-time</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                  <textarea
                    value={invoiceForm.notes}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                    placeholder="Any additional notes for this invoice..."
                    rows={2}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t sticky bottom-0 bg-white">
                <div className="text-sm text-gray-500">
                  Invoice Total: <span className="font-bold text-gray-900 text-lg">${invoiceForm.amount ? Number(invoiceForm.amount).toLocaleString() : calculatedTotal.toLocaleString()}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowInvoiceModal(false); resetInvoiceForm(); }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateInvoice}
                    disabled={creatingInvoice}
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {creatingInvoice ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" /> Generate Invoice
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
