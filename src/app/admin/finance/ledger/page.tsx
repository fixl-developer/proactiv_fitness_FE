'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { apiClient } from '@/services/api/client';
import { toast } from 'sonner';
import {
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  Search,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Scale,
  Hash,
  Calendar,
  Loader2,
  WifiOff,
  RotateCcw,
} from 'lucide-react';

interface LedgerEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  account: string;
  debit: number;
  credit: number;
  category: 'Revenue' | 'Expense' | 'Refund' | 'Salary';
}

const fallbackLedgerEntries: LedgerEntry[] = [
  { id: 'TXN-001', date: '2026-03-01', reference: 'REF-2601', description: 'Term Fees Collected - Spring 2026', account: 'Accounts Receivable', debit: 0, credit: 45000, category: 'Revenue' },
  { id: 'TXN-002', date: '2026-03-05', reference: 'REF-2602', description: 'Coach Salaries - March', account: 'Payroll Expense', debit: 28000, credit: 0, category: 'Salary' },
  { id: 'TXN-003', date: '2026-03-08', reference: 'REF-2603', description: 'Equipment Purchase - Mats & Bars', account: 'Equipment', debit: 5200, credit: 0, category: 'Expense' },
  { id: 'TXN-004', date: '2026-03-10', reference: 'REF-2604', description: 'Camp Registration Fees', account: 'Accounts Receivable', debit: 0, credit: 12500, category: 'Revenue' },
  { id: 'TXN-005', date: '2026-03-12', reference: 'REF-2605', description: 'Rent Payment - Cyberport', account: 'Rent Expense', debit: 18000, credit: 0, category: 'Expense' },
  { id: 'TXN-006', date: '2026-03-15', reference: 'REF-2606', description: 'Refund - Amy Wong (Camp)', account: 'Refunds Payable', debit: 625, credit: 0, category: 'Refund' },
];

const categoryConfig: Record<string, { className: string }> = {
  Revenue: { className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' },
  Expense: { className: 'bg-red-100 text-red-700 hover:bg-red-100' },
  Refund: { className: 'bg-amber-100 text-amber-700 hover:bg-amber-100' },
  Salary: { className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
};

export default function FinancialLedgerPage() {
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (dateFrom) params.startDate = dateFrom;
      if (dateTo) params.endDate = dateTo;
      if (categoryFilter !== 'All') params.category = categoryFilter;

      const response = await apiClient.get('/financial-ledger/entries', { params });
      const raw = response?.data?.data ?? response?.data ?? response;
      const data = Array.isArray(raw) ? raw : raw?.entries ?? raw?.data ?? [];

      const categoryMap: Record<string, string> = { payment: 'Revenue', refund: 'Refund', fee: 'Expense', adjustment: 'Expense', commission: 'Expense' };
      setLedgerEntries(data.map((item: Record<string, unknown>) => ({
        id: (item.entryId as string) || (item.id as string) || (item._id as string) || `TXN-${Math.random().toString(36).slice(2, 6)}`,
        date: (item.createdAt as string) || (item.date as string) || new Date().toISOString().slice(0, 10),
        reference: (item.transactionId as string) || (item.reference as string) || '',
        description: (item.description as string) || '',
        account: (item.account as string) || (item.category as string) || '',
        debit: (item.type === 'debit' ? Number(item.amount) : Number(item.debit)) || 0,
        credit: (item.type === 'credit' ? Number(item.amount) : Number(item.credit)) || 0,
        category: (categoryMap[(item.category as string)] || (item.category as string) || 'Expense') as LedgerEntry['category'],
      })));
      setUsingFallback(false);
    } catch {
      setLedgerEntries(fallbackLedgerEntries);
      setUsingFallback(true);
    }
    setLoading(false);
  }, [dateFrom, dateTo, categoryFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredEntries = useMemo(() => {
    return ledgerEntries.filter((entry) => {
      const matchesSearch =
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.account.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || entry.category === categoryFilter;
      const matchesDateFrom = !dateFrom || entry.date >= dateFrom;
      const matchesDateTo = !dateTo || entry.date <= dateTo;
      return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo;
    });
  }, [ledgerEntries, searchTerm, categoryFilter, dateFrom, dateTo]);

  const runningBalances = useMemo(() => {
    let balance = 0;
    return filteredEntries.map((entry) => {
      balance = balance + entry.credit - entry.debit;
      return balance;
    });
  }, [filteredEntries]);

  const totalDebit = filteredEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = filteredEntries.reduce((sum, e) => sum + e.credit, 0);
  const netBalance = totalCredit - totalDebit;

  const stats = [
    { label: 'Total Debit', value: `HK$${totalDebit.toLocaleString()}`, icon: TrendingDown, gradient: 'from-red-500 to-red-600', bgGradient: 'from-red-50 to-red-100' },
    { label: 'Total Credit', value: `HK$${totalCredit.toLocaleString()}`, icon: TrendingUp, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100' },
    { label: 'Net Balance', value: `HK$${netBalance.toLocaleString()}`, icon: Scale, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' },
    { label: 'Entries (MTD)', value: ledgerEntries.length.toString(), icon: Hash, gradient: 'from-orange-500 to-orange-600', bgGradient: 'from-orange-50 to-orange-100' },
  ];

  const handleExportCSV = () => {
    const headers = ['Date', 'Reference', 'Description', 'Account', 'Debit (HK$)', 'Credit (HK$)', 'Balance', 'Category'];
    const rows = filteredEntries.map((entry, i) => [
      entry.date,
      entry.reference,
      `"${entry.description}"`,
      entry.account,
      entry.debit || '',
      entry.credit || '',
      runningBalances[i],
      entry.category,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Ledger exported to CSV');
  };

  const expenseRatio = totalDebit > 0 && totalCredit > 0 ? Math.round((totalDebit / totalCredit) * 100) : 0;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading ledger data...</p>
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
            Backend endpoint not available - showing sample data. Connect the backend for live ledger entries.
          </p>
          <Button id="btn-fetch-data-admin-finance-ledger" variant="outline" size="sm" onClick={fetchData} className="ml-auto gap-1.5 text-amber-700 border-amber-300 hover:bg-amber-100">
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
          <h1 className="text-2xl font-bold text-gray-900">Financial Ledger</h1>
          <p className="text-gray-500 text-sm mt-1">Double-entry bookkeeping and transaction records</p>
        </div>
        <Button id="btn-export-c-s-v-admin-finance-ledger" variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
          <Download className="h-4 w-4" /> Export to CSV
        </Button>
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

      {/* Expense Ratio */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Expense-to-Revenue Ratio</span>
              <span className="text-sm font-semibold text-gray-900">{expenseRatio}%</span>
            </div>
            <Progress value={expenseRatio} className="h-2" />
            <p className="text-xs text-gray-500 mt-2">
              {expenseRatio < 80
                ? 'Healthy ratio - expenses are well managed'
                : 'Warning - expenses approaching revenue levels'}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters & Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-gray-500" />
                Ledger Entries
              </CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input id="input-text-admin-finance-ledger"
                    type="text"
                    placeholder="Search entries..."
                    className="pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-[200px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-1 border rounded-lg p-1">
                  <Filter className="h-3.5 w-3.5 text-gray-400 ml-1.5" />
                  {['All', 'Revenue', 'Expense', 'Salary', 'Refund'].map((cat) => (
                    <button id="admin-finance-ledger-btn"
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        categoryFilter === cat ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <input id={`input-date-admin-finance-ledger-${cat}`}
                    type="date"
                    className="text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                  <span className="text-gray-400 text-sm">to</span>
                  <input id="input-date-admin-finance-ledger"
                    type="date"
                    className="text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left p-3 font-medium text-gray-600">Date</th>
                    <th className="text-left p-3 font-medium text-gray-600">Reference</th>
                    <th className="text-left p-3 font-medium text-gray-600">Description</th>
                    <th className="text-left p-3 font-medium text-gray-600">Account</th>
                    <th className="text-right p-3 font-medium text-gray-600">Debit (HK$)</th>
                    <th className="text-right p-3 font-medium text-gray-600">Credit (HK$)</th>
                    <th className="text-right p-3 font-medium text-gray-600">Balance</th>
                    <th className="text-left p-3 font-medium text-gray-600">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry, i) => (
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="p-3 text-gray-600">
                        {new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="p-3 font-mono text-xs text-blue-600">{entry.reference}</td>
                      <td className="p-3 text-gray-900 font-medium">{entry.description}</td>
                      <td className="p-3 text-gray-600">{entry.account}</td>
                      <td className="p-3 text-right">
                        {entry.debit > 0 ? (
                          <span className="text-red-600 font-semibold flex items-center justify-end gap-1">
                            <ArrowDownRight className="h-3.5 w-3.5" />
                            ${entry.debit.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {entry.credit > 0 ? (
                          <span className="text-emerald-600 font-semibold flex items-center justify-end gap-1">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            ${entry.credit.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-semibold">
                        <span className={runningBalances[i] >= 0 ? 'text-emerald-700' : 'text-red-700'}>
                          {runningBalances[i] >= 0 ? '' : '-'}${Math.abs(runningBalances[i]).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge className={(categoryConfig[entry.category] || categoryConfig['Expense']).className}>
                          {entry.category}
                        </Badge>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="p-3" colSpan={4}>
                      Totals
                    </td>
                    <td className="p-3 text-right text-red-600">${totalDebit.toLocaleString()}</td>
                    <td className="p-3 text-right text-emerald-600">${totalCredit.toLocaleString()}</td>
                    <td className="p-3 text-right">
                      <span className={netBalance >= 0 ? 'text-emerald-700' : 'text-red-700'}>
                        ${netBalance.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3"></td>
                  </tr>
                </tfoot>
              </table>
              {filteredEntries.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No ledger entries found for the selected filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
