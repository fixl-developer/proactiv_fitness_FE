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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Building2,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  TrendingDown,
  Download,
  BarChart3,
  Target,
  Loader2,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

interface KPI {
  label: string;
  value: string;
  trend: string;
  up: boolean;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  bgGradient: string;
}

interface PerformanceCategory {
  category: string;
  score: number;
  target: number;
  color: string;
}

interface LocationRow {
  location: string;
  occupancy: number;
  revenue: number;
  students: number;
  satisfaction: number;
  score: number;
}

interface MonthlyKPIPoint {
  month: string;
  occupancy: number;
  satisfaction: number;
  utilization: number;
}

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

function ScoreRing({ score, color, size = 64 }: { score: number; color: string; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth="4" />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </svg>
  );
}

export default function PerformanceAnalyticsPage() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [kpis, setKpis] = useState<KPI[]>([]);
  const [performanceCategories, setPerformanceCategories] = useState<PerformanceCategory[]>([]);
  const [locationData, setLocationData] = useState<LocationRow[]>([]);
  const [monthlyKPI, setMonthlyKPI] = useState<MonthlyKPIPoint[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    let gotData = false;

    // Try dedicated performance endpoint first
    try {
      const result: any = await apiClient.get('/analytics/performance');
      const payload = result?.data || result;

      if (payload && typeof payload === 'object') {
        gotData = true;

        // KPIs
        if (payload.kpis) {
          const k = payload.kpis;
          setKpis([
            { label: 'Occupancy Rate', value: k.occupancyRate || '0%', trend: k.occupancyTrend || '+0%', up: true, icon: Building2, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
            { label: 'Revenue / Student', value: k.revenuePerStudent || 'HK$0', trend: k.revenueTrend || '+0%', up: true, icon: DollarSign, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100' },
            { label: 'Staff Utilization', value: k.staffUtilization || '0%', trend: k.staffTrend || '+0%', up: true, icon: Users, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' },
            { label: 'Customer Satisfaction', value: k.satisfaction || '0/5', trend: k.satisfactionTrend || '+0', up: true, icon: Star, gradient: 'from-orange-500 to-orange-600', bgGradient: 'from-orange-50 to-orange-100' },
          ]);
        }

        // Categories
        if (Array.isArray(payload.categories)) {
          setPerformanceCategories(payload.categories.map((c: any, i: number) => ({
            category: c.category || c.name || '',
            score: Number(c.score) || 0,
            target: Number(c.target) || 0,
            color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
          })));
        }

        // Locations
        if (Array.isArray(payload.locations)) {
          setLocationData(payload.locations.map((l: any) => ({
            location: l.location || l.name || '',
            occupancy: Number(l.occupancy) || 0,
            revenue: Number(l.revenue) || 0,
            students: Number(l.students) || 0,
            satisfaction: Number(l.satisfaction) || 0,
            score: Number(l.score) || 0,
          })));
        }

        // Monthly trend
        if (Array.isArray(payload.monthlyTrend)) {
          setMonthlyKPI(payload.monthlyTrend.map((m: any) => ({
            month: m.month || '',
            occupancy: Number(m.occupancy) || 0,
            satisfaction: Number(m.satisfaction) || 0,
            utilization: Number(m.utilization) || 0,
          })));
        }
      }
    } catch {
      // Fall through to dashboard endpoint
    }

    // Fallback to analytics/dashboard for KPI data
    if (!gotData) {
      try {
        const result: any = await apiClient.get('/analytics/dashboard');
        const payload = result?.data || result;

        if (payload && typeof payload === 'object') {
          gotData = true;

          const totalStudents = Number(payload.totalStudents) || 0;
          const totalRevenue = Number(payload.totalRevenue) || 0;
          const revenuePerStudent = totalStudents > 0 ? Math.round(totalRevenue / totalStudents) : 0;
          const occupancy = Number(payload.attendanceRate) || 0;
          const staffUtil = Number(payload.staffUtilization) || 0;
          const satisfaction = Number(payload.customerSatisfaction) || 0;

          setKpis([
            { label: 'Occupancy Rate', value: `${occupancy}%`, trend: `${payload.enrollmentTrend >= 0 ? '+' : ''}${payload.enrollmentTrend || 0}%`, up: (payload.enrollmentTrend || 0) >= 0, icon: Building2, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
            { label: 'Revenue / Student', value: `HK$${revenuePerStudent}`, trend: `${payload.revenueGrowth >= 0 ? '+' : ''}${payload.revenueGrowth || 0}%`, up: (payload.revenueGrowth || 0) >= 0, icon: DollarSign, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100' },
            { label: 'Staff Utilization', value: `${staffUtil}%`, trend: '+0%', up: true, icon: Users, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' },
            { label: 'Customer Satisfaction', value: `${satisfaction}/5`, trend: '+0', up: true, icon: Star, gradient: 'from-orange-500 to-orange-600', bgGradient: 'from-orange-50 to-orange-100' },
          ]);

          // Generate categories from available data
          setPerformanceCategories([
            { category: 'Financial', score: Math.min(100, Math.round(totalRevenue > 0 ? 80 + (payload.revenueGrowth || 0) : 0)), target: 85, color: '#3b82f6' },
            { category: 'Operational', score: occupancy || 0, target: 80, color: '#10b981' },
            { category: 'Customer', score: Math.round(satisfaction * 20) || 0, target: 90, color: '#f59e0b' },
            { category: 'Staff', score: staffUtil || 0, target: 82, color: '#8b5cf6' },
            { category: 'Growth', score: Math.min(100, Math.max(0, 75 + (payload.enrollmentTrend || 0))), target: 75, color: '#ef4444' },
          ]);
        }
      } catch {
        // Continue
      }
    }

    // Try to enrich with staff and attendance data
    try {
      const staffResult: any = await apiClient.get('/staff/statistics/overview');
      const staffPayload = staffResult?.data || staffResult;
      if (staffPayload?.utilization !== undefined) {
        setKpis((prev) => prev.map((k) =>
          k.label === 'Staff Utilization'
            ? { ...k, value: `${staffPayload.utilization}%`, trend: staffPayload.utilizationChange || k.trend }
            : k
        ));
      }
    } catch { /* optional enrichment */ }

    try {
      const attResult: any = await apiClient.get('/attendance/statistics');
      const attPayload = attResult?.data || attResult;
      if (attPayload?.occupancyRate !== undefined) {
        gotData = true;
        setKpis((prev) => prev.map((k) =>
          k.label === 'Occupancy Rate'
            ? { ...k, value: `${attPayload.occupancyRate}%`, trend: attPayload.occupancyChange || k.trend }
            : k
        ));
      }
    } catch { /* optional enrichment */ }

    if (!gotData) {
      setError('Failed to load performance data. Please ensure the backend server is running.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const overallScore = performanceCategories.length > 0
    ? Math.round(performanceCategories.reduce((s, c) => s + c.score, 0) / performanceCategories.length)
    : 0;

  const handleExport = () => {
    if (locationData.length === 0 && performanceCategories.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Location', 'Occupancy %', 'Revenue (HK$)', 'Student Count', 'Satisfaction', 'Overall Score'];
    const rows = locationData.map((loc) => [
      loc.location, loc.occupancy, loc.revenue, loc.students, loc.satisfaction, loc.score,
    ]);
    const catHeaders = ['', '', 'Performance Category', 'Score', 'Target', 'Status'];
    const catRows = performanceCategories.map((cat) => [
      '', '', cat.category, cat.score, cat.target, cat.score >= cat.target ? 'Above Target' : 'Below Target',
    ]);
    const allRows = [headers, ...rows, [], catHeaders, ...catRows];
    const csv = allRows.map((row) => (row as (string | number)[]).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Performance report exported to CSV');
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading performance data...</p>
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
          <Button id="btn-fetch-data-admin-reports-performance" variant="outline" size="sm" onClick={fetchData} className="ml-auto gap-1.5 text-red-700 border-red-300 hover:bg-red-100">
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
          <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Key performance indicators and operational metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button id="btn-export-admin-reports-performance" variant="outline" size="sm" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export Report
          </Button>
          <Button id="btn-fetch-data-admin-reports-performance" variant="outline" size="sm" className="gap-1.5" onClick={fetchData}>
            <RotateCcw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      {kpis.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => {
            const IconComp = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className={`rounded-lg border-0 bg-gradient-to-br ${kpi.bgGradient} p-4 hover:shadow-lg transition-all`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`bg-gradient-to-br ${kpi.gradient} p-2.5 rounded-lg shadow-md`}>
                      <IconComp className="w-5 h-5 text-white" />
                    </div>
                    <Badge className={`text-[10px] ${kpi.up ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {kpi.trend}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 font-medium mb-1">{kpi.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Performance Categories + Overall Score */}
      {performanceCategories.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-gray-500" />
                  Performance by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {performanceCategories.map((cat, i) => (
                  <motion.div
                    key={cat.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">Target: {cat.target}</span>
                        <span className="text-sm font-bold" style={{ color: cat.color }}>{cat.score}/100</span>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={cat.score} className="h-2.5" />
                      <div
                        className="absolute top-0 h-2.5 w-0.5 bg-gray-900/30"
                        style={{ left: `${cat.target}%` }}
                        title={`Target: ${cat.target}`}
                      />
                    </div>
                    {cat.score >= cat.target ? (
                      <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> Above target by {cat.score - cat.target} points
                      </p>
                    ) : (
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" /> Below target by {cat.target - cat.score} points
                      </p>
                    )}
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-gray-500" />
                  Overall Score
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6">
                <div className="relative">
                  <ScoreRing score={overallScore} color="#3b82f6" size={160} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-gray-900">{overallScore}</span>
                    <span className="text-xs text-gray-500">out of 100</span>
                  </div>
                </div>
                <Badge className="mt-4 bg-emerald-100 text-emerald-700 text-sm px-3 py-1">
                  {overallScore >= 85 ? 'Excellent Performance' : overallScore >= 70 ? 'Good Performance' : 'Needs Improvement'}
                </Badge>
                <div className="grid grid-cols-2 gap-3 mt-6 w-full">
                  {performanceCategories.map((cat) => (
                    <div key={cat.category} className="text-center">
                      <div className="relative mx-auto w-fit">
                        <ScoreRing score={cat.score} color={cat.color} size={48} />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">
                          {cat.score}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">{cat.category}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Monthly KPI Trend Chart */}
      {monthlyKPI.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">KPI Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyKPI}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                  <Legend />
                  <Line type="monotone" dataKey="occupancy" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Occupancy %" />
                  <Line type="monotone" dataKey="utilization" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} name="Staff Utilization %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Location Comparison Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Location Comparison</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left p-3 font-medium text-gray-600">Location</th>
                    <th className="text-right p-3 font-medium text-gray-600">Occupancy %</th>
                    <th className="text-right p-3 font-medium text-gray-600">Revenue (HK$)</th>
                    <th className="text-right p-3 font-medium text-gray-600">Student Count</th>
                    <th className="text-right p-3 font-medium text-gray-600">Satisfaction</th>
                    <th className="text-right p-3 font-medium text-gray-600">Overall Score</th>
                    <th className="p-3 font-medium text-gray-600">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {locationData.length > 0 ? locationData.map((loc, i) => (
                    <motion.tr
                      id={`admin-reports-performance-location-${i}-row`}
                      key={loc.location}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 + i * 0.05 }}
                      className={`border-b hover:bg-gray-50/50 transition-colors cursor-pointer ${
                        selectedLocation === loc.location ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => setSelectedLocation(selectedLocation === loc.location ? null : loc.location)}
                    >
                      <td className="p-3 font-medium text-gray-900 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        {loc.location}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={loc.occupancy} className="h-1.5 w-16" />
                          <span className="font-medium text-gray-900 w-10">{loc.occupancy}%</span>
                        </div>
                      </td>
                      <td className="p-3 text-right font-semibold text-gray-900">${loc.revenue > 1000 ? `${(loc.revenue / 1000).toFixed(0)}K` : loc.revenue}</td>
                      <td className="p-3 text-right text-gray-700">{loc.students}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          <span className="font-medium">{loc.satisfaction}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right font-bold text-gray-900">{loc.score}/100</td>
                      <td className="p-3">
                        <Badge
                          className={
                            loc.score >= 90
                              ? 'bg-emerald-100 text-emerald-700'
                              : loc.score >= 80
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                          }
                        >
                          {loc.score >= 90 ? 'Excellent' : loc.score >= 80 ? 'Good' : 'Average'}
                        </Badge>
                      </td>
                    </motion.tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-400">
                        <Building2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No location data available yet</p>
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
