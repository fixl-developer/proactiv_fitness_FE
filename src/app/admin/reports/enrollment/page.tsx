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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  UserPlus,
  RefreshCw,
  UserMinus,
  Download,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Loader2,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

interface EnrollmentTrendPoint {
  month: string;
  enrolled: number;
}

interface ProgramByAge {
  program: string;
  age2_4: number;
  age5_7: number;
  age8_10: number;
}

interface ProgramRow {
  program: string;
  enrolled: number;
  new: number;
  dropped: number;
  retention: number;
  waitlist: number;
}

interface EnrollmentStat {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  bgGradient: string;
  sub: string;
}

function computeStats(table: ProgramRow[]): EnrollmentStat[] {
  const totalEnrolled = table.reduce((s, r) => s + r.enrolled, 0);
  const totalNew = table.reduce((s, r) => s + r.new, 0);
  const totalDropped = table.reduce((s, r) => s + r.dropped, 0);
  const avgRetention = table.length > 0 ? (table.reduce((s, r) => s + r.retention, 0) / table.length).toFixed(1) : '0';
  const churnRate = (100 - parseFloat(avgRetention)).toFixed(1);

  return [
    { label: 'Total Enrolled', value: totalEnrolled.toString(), icon: Users, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100', sub: 'Across all programs' },
    { label: 'New This Month', value: `+${totalNew}`, icon: UserPlus, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100', sub: 'Current period' },
    { label: 'Retention Rate', value: `${avgRetention}%`, icon: RefreshCw, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100', sub: 'Average across programs' },
    { label: 'Churn Rate', value: `${churnRate}%`, icon: UserMinus, gradient: 'from-red-500 to-red-600', bgGradient: 'from-red-50 to-red-100', sub: `${totalDropped} students dropped` },
  ];
}

export default function EnrollmentReportsPage() {
  const [dateRange, setDateRange] = useState<'3m' | '6m' | '1y'>('6m');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [enrollmentTrend, setEnrollmentTrend] = useState<EnrollmentTrendPoint[]>([]);
  const [programByAge, setProgramByAge] = useState<ProgramByAge[]>([]);
  const [programTable, setProgramTable] = useState<ProgramRow[]>([]);
  const [stats, setStats] = useState<EnrollmentStat[]>(computeStats([]));

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // apiClient.get returns response.data directly (the JSON body)
      const result: any = await apiClient.get('/analytics/enrollment-trends', { params: { period: dateRange } });
      // result = { success: true, data: { trend, programs, byAge } }
      const payload = result?.data || result;

      // Trend data
      if (Array.isArray(payload?.trend)) {
        setEnrollmentTrend(payload.trend.map((t: any) => ({
          month: t.month || '',
          enrolled: Number(t.enrolled || t.count || t.total) || 0,
        })));
      } else {
        setEnrollmentTrend([]);
      }

      // Age group data
      if (Array.isArray(payload?.byAge)) {
        setProgramByAge(payload.byAge.map((p: any) => ({
          program: p.program || '',
          age2_4: Number(p.age2_4 || p['2-4']) || 0,
          age5_7: Number(p.age5_7 || p['5-7']) || 0,
          age8_10: Number(p.age8_10 || p['8-10']) || 0,
        })));
      } else {
        setProgramByAge([]);
      }

      // Program table data
      if (Array.isArray(payload?.programs) && payload.programs.length > 0) {
        const mapped = payload.programs.map((p: any) => ({
          program: p.program || p.name || '',
          enrolled: Number(p.enrolled || p.totalEnrolled) || 0,
          new: Number(p.new || p.newEnrollments) || 0,
          dropped: Number(p.dropped || p.dropouts) || 0,
          retention: Number(p.retention || p.retentionRate) || 0,
          waitlist: Number(p.waitlist || p.waitlistCount) || 0,
        }));
        setProgramTable(mapped);
        setStats(computeStats(mapped));
      } else {
        // Try secondary endpoint for program data
        try {
          const progResult: any = await apiClient.get('/programs/statistics');
          const progData = progResult?.data || progResult;
          if (Array.isArray(progData) && progData.length > 0) {
            const mapped = progData.map((p: any) => ({
              program: p.name || p.program || '',
              enrolled: Number(p.enrolled || p.totalStudents || p.activeStudents) || 0,
              new: Number(p.newEnrollments || p.new) || 0,
              dropped: Number(p.dropped || p.dropouts) || 0,
              retention: Number(p.retentionRate || p.retention) || 95,
              waitlist: Number(p.waitlistCount || p.waitlist) || 0,
            }));
            setProgramTable(mapped);
            setStats(computeStats(mapped));
          } else {
            setProgramTable([]);
            setStats(computeStats([]));
          }
        } catch {
          setProgramTable([]);
          setStats(computeStats([]));
        }
      }
    } catch (err: any) {
      console.error('Enrollment fetch error:', err);
      setError('Failed to load enrollment data. Please ensure the backend server is running.');
      setEnrollmentTrend([]);
      setProgramByAge([]);
      setProgramTable([]);
      setStats(computeStats([]));
    }

    setLoading(false);
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    if (programTable.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Program', 'Total Enrolled', 'New', 'Dropped', 'Net Change', 'Retention %', 'Waitlist'];
    const rows = programTable.map((row) => [
      row.program,
      row.enrolled,
      row.new,
      row.dropped,
      row.new - row.dropped,
      row.retention,
      row.waitlist,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enrollment_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Enrollment report exported to CSV');
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading enrollment data...</p>
        </div>
      </div>
    );
  }

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
          <Button data-testid="btn-fetch-data-admin-reports-enrollment" variant="outline" size="sm" onClick={fetchData} className="ml-auto gap-1.5 text-red-700 border-red-300 hover:bg-red-100">
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
          <h1 className="text-2xl font-bold text-gray-900">Enrollment Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Track student enrollment, retention, and program capacity</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg p-0.5">
            {(['3m', '6m', '1y'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setDateRange(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  dateRange === p ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p === '3m' ? '3 Months' : p === '6m' ? '6 Months' : '1 Year'}
              </button>
            ))}
          </div>
          <Button data-testid="btn-export-admin-reports-enrollment" variant="outline" size="sm" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export Report
          </Button>
          <Button data-testid="btn-fetch-data-admin-reports-enrollment" variant="outline" size="sm" className="gap-1.5" onClick={fetchData}>
            <RotateCcw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
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
                </div>
                <p className="text-xs text-gray-600 font-medium mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-[10px] text-gray-500 mt-1">{stat.sub}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Enrollment Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enrollmentTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={enrollmentTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip
                      formatter={(value: number) => [value, 'Students']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="enrolled"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                      name="Total Enrolled"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
                  No enrollment trend data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Enrollment by Program (Stacked by Age) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                Enrollment by Program &amp; Age
              </CardTitle>
            </CardHeader>
            <CardContent>
              {programByAge.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={programByAge}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="program" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                    <Legend />
                    <Bar dataKey="age2_4" stackId="a" fill="#3b82f6" name="Age 2-4" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="age5_7" stackId="a" fill="#10b981" name="Age 5-7" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="age8_10" stackId="a" fill="#f59e0b" name="Age 8-10" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
                  No age group data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Program Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Program Enrollment Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left p-3 font-medium text-gray-600">Program</th>
                    <th className="text-right p-3 font-medium text-gray-600">Total Enrolled</th>
                    <th className="text-right p-3 font-medium text-gray-600">New</th>
                    <th className="text-right p-3 font-medium text-gray-600">Dropped</th>
                    <th className="text-right p-3 font-medium text-gray-600">Net Change</th>
                    <th className="text-right p-3 font-medium text-gray-600">Retention %</th>
                    <th className="text-right p-3 font-medium text-gray-600">Waitlist</th>
                    <th className="p-3 font-medium text-gray-600">Capacity</th>
                  </tr>
                </thead>
                <tbody>
                  {programTable.length > 0 ? programTable.map((row, i) => {
                    const net = row.new - row.dropped;
                    const capacityPct = Math.min(100, Math.round((row.enrolled / (row.enrolled + 10)) * 100));
                    return (
                      <motion.tr
                        key={row.program}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + i * 0.04 }}
                        className="border-b hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="p-3 font-medium text-gray-900">{row.program}</td>
                        <td className="p-3 text-right font-semibold text-gray-900">{row.enrolled}</td>
                        <td className="p-3 text-right">
                          <span className="text-emerald-600 font-medium flex items-center justify-end gap-0.5">
                            <ArrowUpRight className="h-3.5 w-3.5" />+{row.new}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {row.dropped > 0 ? (
                            <span className="text-red-600 font-medium flex items-center justify-end gap-0.5">
                              <ArrowDownRight className="h-3.5 w-3.5" />-{row.dropped}
                            </span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <Badge className={net > 0 ? 'bg-emerald-100 text-emerald-700' : net < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}>
                            {net > 0 ? '+' : ''}{net}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <span className={`font-semibold ${row.retention >= 98 ? 'text-emerald-600' : row.retention >= 95 ? 'text-blue-600' : 'text-amber-600'}`}>
                            {row.retention}%
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {row.waitlist > 0 ? (
                            <Badge className="bg-amber-100 text-amber-700 gap-1">
                              <Clock className="h-3 w-3" />{row.waitlist}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-3 w-32">
                          <div className="flex items-center gap-2">
                            <Progress value={capacityPct} className="h-1.5 flex-1" />
                            <span className="text-xs text-gray-500 w-8">{capacityPct}%</span>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-gray-400">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No program enrollment data available yet</p>
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
