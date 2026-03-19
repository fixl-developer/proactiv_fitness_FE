'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
} from 'lucide-react';

const invoices = [
  {
    id: 'INV-001',
    student: 'Sarah Johnson',
    description: 'Term Fee Spring 2026',
    amount: 1200,
    date: '2026-03-15',
    method: 'Credit Card',
    status: 'Paid',
  },
  {
    id: 'INV-002',
    student: 'Tom Chen',
    description: 'GYMTOTS Term Registration',
    amount: 800,
    date: '2026-03-17',
    method: 'Bank Transfer',
    status: 'Pending',
  },
  {
    id: 'INV-003',
    student: 'Amy Wong',
    description: 'Holiday Camp Package',
    amount: 2500,
    date: '2026-03-10',
    method: 'Credit Card',
    status: 'Paid',
  },
  {
    id: 'INV-004',
    student: 'Jack Liu',
    description: 'Private Lesson (4 Sessions)',
    amount: 375,
    date: '2026-02-28',
    method: 'Cash',
    status: 'Overdue',
  },
  {
    id: 'INV-005',
    student: 'Emily Park',
    description: 'Camp Refund',
    amount: 625,
    date: '2026-03-05',
    method: '-',
    status: 'Refunded',
  },
];

const stats = [
  { label: 'Total Revenue (MTD)', value: 'HK$48,250', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', change: '+12.5%' },
  { label: 'Pending Payments', value: '8', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', change: 'HK$6,400' },
  { label: 'Overdue', value: '3', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', change: 'HK$1,750' },
  { label: 'Refunds (MTD)', value: 'HK$1,250', icon: RotateCcw, color: 'text-blue-600', bg: 'bg-blue-50', change: '2 issued' },
];

const statusConfig: Record<string, { className: string }> = {
  Paid: { className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' },
  Pending: { className: 'bg-amber-100 text-amber-700 hover:bg-amber-100' },
  Overdue: { className: 'bg-red-100 text-red-700 hover:bg-red-100' },
  Refunded: { className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
};

const methodConfig: Record<string, { icon: React.ElementType; className: string }> = {
  'Credit Card': { icon: CreditCard, className: 'bg-purple-100 text-purple-700' },
  'Bank Transfer': { icon: Building2, className: 'bg-indigo-100 text-indigo-700' },
  Cash: { icon: Banknote, className: 'bg-green-100 text-green-700' },
  '-': { icon: RotateCcw, className: 'bg-gray-100 text-gray-500' },
};

export default function PaymentsBillingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

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

  const collectionRate = 78;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
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
          <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
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
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">{stat.value}</p>
                    <p className={`text-xs mt-1 ${stat.color}`}>{stat.change}</p>
                  </div>
                  <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Collection Progress */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Monthly Collection Target</span>
              <span className="text-sm font-semibold text-gray-900">{collectionRate}% (HK$48,250 / HK$62,000)</span>
            </div>
            <Progress value={collectionRate} className="h-2" />
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
                      const method = methodConfig[inv.method];
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
                            <Badge className={statusConfig[inv.status].className}>
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
                                className="absolute right-8 top-2 z-10 bg-white border rounded-lg shadow-lg py-1 w-40"
                              >
                                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                  <Eye className="h-3.5 w-3.5" /> View Details
                                </button>
                                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                  <Send className="h-3.5 w-3.5" /> Send Receipt
                                </button>
                                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50">
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
    </div>
  );
}
