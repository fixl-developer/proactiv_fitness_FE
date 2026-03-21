'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { apiClient } from '@/services/api/client';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Target,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

interface MonthlyRevenue {
  month: string;
  actual: number;
  target: number;
}

interface ProgramRevenue {
  program: string;
  revenue: number;
  fill: string;
}

interface LocationRevenue {
  name: string;
  value: number;
  revenue: number;
  fill: string;
}

interface BreakdownRow {
  program: string;
  students: number;
  revenue: number;
  avg: number;
  growth: number;
}

interface RevenueStat {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  bgGradient: string;
  change: string;
  up: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
const PROGRAM_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

export default function RevenueReportsPage() {
  const [period, setPeriod] = useState<'6m' | '1y' | 'all'>('6m');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [monthlyRevenueData, setMonthlyRevenueData] = useState<MonthlyRevenue[]>([]);
  const [programRevenueData, setProgramRevenueData] = useState<ProgramRevenue[]>([]);
  const [locationData, setLocationData] = useState<LocationRevenue[]>([]);
  const [breakdownTable, setBreakdownTable] = useState<BreakdownRow[]>([]);
  const [stats, setStats] = useState<RevenueStat[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {};
      if (dateFrom) params.startDate = dateFrom;
      if (dateTo) params.endDate = dateTo;
      if (!dateFrom && !dateTo) params.period = period;

      const result: any = await apiClient.get('/analytics/revenue', { params });
      const data = result?.data || result;

      if (data && typeof data === 'object') {
        // Monthly revenue
        if (Array.isArray(data.monthly)) {
          setMonthlyRevenueData(data.monthly.map((m: any) => ({
            month: m.month || '',
            actual: Number(m.actual || m.revenue) || 0,
            target: Number(m.target) || 0,
          })));
        } else {
          setMonthlyRevenueData([]);
        }

        // Program revenue
        if (Array.isArray(data.byProgram)) {
          setProgramRevenueData(data.byProgram.map((p: any, i: number) => ({
            program: p.program || p.name || 'Other',
            revenue: Number(p.revenue) || 0,
            fill: PROGRAM_COLORS[i % PROGRAM_COLORS.length],
          })));
        } else {
          setProgramRevenueData([]);
        }

        // Location revenue
        if (Array.isArray(data.byLocation)) {
          setLocationData(data.byLocation.map((l: any, i: number) => ({
            name: l.name || l.location || 'Unknown',
            value: Number(l.value || l.percentage) || 0,
            revenue: Number(l.revenue) || 0,
            fill: COLORS[i % COLORS.length],
          })));
        } else {
          setLocationData([]);
        }

        // Breakdown table
        if (Array.isArray(data.breakdown)) {
          setBreakdownTable(data.breakdown.map((b: any) => ({
            program: b.program || b.name || '',
            students: Number(b.students) || 0,
            revenue: Number(b.revenue) || 0,
            avg: Number(b.avg || b.averagePerStudent) || 0,
            growth: Number(b.growth) || 0,
          })));
        } else {
          setBreakdownTable([]);
        }

        // Summary stats
        if (data.summary) {
          const s = data.summary;
          setStats([
            {
              label: 'Total Revenue (YTD)',
              value: s.totalRevenue || 'HK$0',
              icon: DollarSign,
              gradient: 'from-blue-500 to-blue-600',
              bgGradient: 'from-blue-50 to-blue-100',
              change: s.totalRevenueChange || '0%',
              up: !(s.totalRevenueChange || '').startsWith('-'),
            },
            {
              label: 'Monthly Average',
              value: s.monthlyAverage || 'HK$0',
              icon: Calendar,
              gradient: 'from-green-500 to-emerald-600',
              bgGradient: 'from-green-50 to-emerald-100',
              change: s.monthlyAverageChange || '0%',
              up: !(s.monthlyAverageChange || '').startsWith('-'),
            },
            {
              label: 'Growth Rate',
              value: s.growthRate || '0%',
              icon: TrendingUp,
              gradient: 'from-purple-500 to-purple-600',
              bgGradient: 'from-purple-50 to-purple-100',
              change: s.growthRateChange || '0%',
              up: !(s.growthRateChange || '').startsWith('-'),
            },
            {
              label: 'Projected Annual',
              value: s.projectedAnnual || 'HK$0',
              icon: Target,
              gradient: 'from-orange-500 to-orange-600',
              bgGradient: 'from-orange-50 to-orange-100',
              change: s.projectedStatus || '-',
              up: (s.projectedStatus || '').includes('track'),
            },
          ]);
        } else {
          setStats([]);
        }
      }
    } catch (err: any) {
      console.error('Revenue fetch error:', err);
      setError('Failed to load revenue data. Please ensure the backend server is running.');
    }

    setLoading(false);
  }, [period, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    if (breakdownTable.length === 0 && monthlyRevenueData.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Program', 'Students', 'Revenue (HK$)', 'Avg/Student', 'Growth %'];
    const rows = breakdownTable.map((row) => [
      row.program, row.students, row.revenue, row.avg, row.growth,
    ]);
    const monthHeaders = ['', '', 'Month', 'Actual Revenue', 'Target'];
    const monthRows = monthlyRevenueData.map((m) => ['', '', m.month, m.actual, m.target]);
    const allRows = [headers, ...rows, [], monthHeaders, ...monthRows];
    const csv = allRows.map((row) => (row as (string | number)[]).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Revenue report exported to CSV');
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  // Find max revenue for progress bar scaling
  const maxRevenue = breakdownTable.length > 0 ? Math.max(...breakdownTable.map((r) => r.revenue)) : 1;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-3"
        >
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
          <Button data-testid="btn-fetch-data-admin-finance-revenue" variant="outline" size="sm" onClick={fetchData} className="ml-auto gap-1.5 text-red-700 border-red-300 hover:bg-red-100">
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
          <h1 className="text-2xl font-bold text-gray-900">Revenue Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Financial performance and revenue analytics</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <input data-testid="input-date-admin-finance-revenue"
              type="date"
              className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <span className="text-gray-400 text-sm">to</span>
            <input data-testid="input-date-admin-finance-revenue"
              type="date"
              className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="flex border rounded-lg p-0.5">
            {(['6m', '1y', 'all'] as const).map((p) => (
              <button
                key={p}
                onClick={() => { setPeriod(p); setDateFrom(''); setDateTo(''); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  period === p && !dateFrom && !dateTo ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p === '6m' ? '6 Months' : p === '1y' ? '1 Year' : 'All Time'}
              </button>
            ))}
          </div>
          <Button data-testid="btn-export-admin-finance-revenue" variant="outline" size="sm" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button data-testid="btn-fetch-data-admin-finance-revenue" variant="outline" size="sm" className="gap-1.5" onClick={fetchData}>
            <RotateCcw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const IconComp = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className={`rounded-lg border-0 bg-gradient-to-br ${stat.bgGradient} p-4 hover:shadow-lg transition-all`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`bg-gradient-to-br ${stat.gradient} p-2.5 rounded-lg shadow-md`}>
                      <IconComp className="w-5 h-5 text-white" />
                    </div>
                    <Badge className={`text-[10px] ${stat.up ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {stat.change}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 font-medium mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Monthly Revenue Line Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    formatter={(value: number) => [`HK$${value.toLocaleString()}`, '']}
                    labelStyle={{ fontWeight: 600 }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6' }} name="Actual Revenue" />
                  <Line type="monotone" dataKey="target" stroke="#d1d5db" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#d1d5db' }} name="Previous Period" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-gray-400 text-sm">
                No monthly revenue data available
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Bar + Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Revenue by Program</CardTitle>
            </CardHeader>
            <CardContent>
              {programRevenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={programRevenueData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                    <YAxis type="category" dataKey="program" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip
                      formatter={(value: number) => [`HK$${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Bar dataKey="revenue" radius={[0, 6, 6, 0]} barSize={28}>
                      {programRevenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
                  No program revenue data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Revenue by Location</CardTitle>
            </CardHeader>
            <CardContent>
              {locationData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={locationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, value }) => `${name} ${value}%`}
                      >
                        {locationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, _name: string, props: any) => [
                          `${value}% (HK$${(props.payload.revenue || 0).toLocaleString()})`,
                          'Share',
                        ]}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-2">
                    {locationData.map((loc) => (
                      <div key={loc.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: loc.fill }} />
                        <span className="text-xs text-gray-600">{loc.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
                  No location revenue data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Revenue Breakdown Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Breakdown by Program</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left p-3 font-medium text-gray-600">Program</th>
                    <th className="text-right p-3 font-medium text-gray-600">Students</th>
                    <th className="text-right p-3 font-medium text-gray-600">Revenue (HK$)</th>
                    <th className="text-right p-3 font-medium text-gray-600">Avg / Student</th>
                    <th className="text-right p-3 font-medium text-gray-600">Growth %</th>
                    <th className="p-3 font-medium text-gray-600">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdownTable.length > 0 ? breakdownTable.map((row, i) => (
                    <motion.tr
                      key={row.program}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.55 + i * 0.04 }}
                      className="border-b hover:bg-gray-50/50"
                    >
                      <td className="p-3 font-medium text-gray-900">{row.program}</td>
                      <td className="p-3 text-right text-gray-600">{row.students}</td>
                      <td className="p-3 text-right font-semibold text-gray-900">${row.revenue.toLocaleString()}</td>
                      <td className="p-3 text-right text-gray-600">${row.avg.toLocaleString()}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {row.growth >= 0 ? (
                            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                          )}
                          <span className={`font-medium ${row.growth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {row.growth > 0 ? '+' : ''}{row.growth}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3 w-32">
                        <Progress value={maxRevenue > 0 ? Math.round((row.revenue / maxRevenue) * 100) : 0} className="h-1.5" />
                      </td>
                    </motion.tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-400">
                        <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No revenue breakdown data available yet</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
