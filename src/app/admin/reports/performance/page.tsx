'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  ArrowUpRight,
  ArrowDownRight,
  Download,
  BarChart3,
  Target,
} from 'lucide-react';

const kpis = [
  { label: 'Occupancy Rate', value: '82.5%', trend: '+3.2%', up: true, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Revenue / Student', value: 'HK$375', trend: '+8.1%', up: true, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Staff Utilization', value: '85%', trend: '+2.5%', up: true, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Customer Satisfaction', value: '4.7/5', trend: '+0.2', up: true, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
];

const performanceCategories = [
  { category: 'Financial', score: 88, target: 85, color: '#3b82f6' },
  { category: 'Operational', score: 82, target: 80, color: '#10b981' },
  { category: 'Customer', score: 94, target: 90, color: '#f59e0b' },
  { category: 'Staff', score: 85, target: 82, color: '#8b5cf6' },
  { category: 'Growth', score: 78, target: 75, color: '#ef4444' },
];

const locationData = [
  { location: 'Cyberport', occupancy: 85, revenue: 185000, students: 680, satisfaction: 4.8, score: 92 },
  { location: 'Wan Chai', occupancy: 78, revenue: 145000, students: 420, satisfaction: 4.5, score: 85 },
  { location: 'School Programs', occupancy: 75, revenue: 65000, students: 150, satisfaction: 4.6, score: 80 },
];

const monthlyKPI = [
  { month: 'Jan', occupancy: 78, satisfaction: 4.5, utilization: 80 },
  { month: 'Feb', occupancy: 80, satisfaction: 4.6, utilization: 82 },
  { month: 'Mar', occupancy: 82.5, satisfaction: 4.7, utilization: 85 },
  { month: 'Apr', occupancy: 81, satisfaction: 4.6, utilization: 83 },
  { month: 'May', occupancy: 84, satisfaction: 4.7, utilization: 86 },
  { month: 'Jun', occupancy: 86, satisfaction: 4.8, utilization: 88 },
];

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
  const overallScore = Math.round(performanceCategories.reduce((s, c) => s + c.score, 0) / performanceCategories.length);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Key performance indicators and operational metrics</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" /> Export Report
        </Button>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">{kpi.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {kpi.up ? (
                        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <span className={`text-xs font-medium ${kpi.up ? 'text-emerald-600' : 'text-red-600'}`}>
                        {kpi.trend}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className={`p-2.5 rounded-lg ${kpi.bg}`}>
                    <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Performance Categories + Overall Score */}
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
                Excellent Performance
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

      {/* Monthly KPI Trend Chart */}
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
                <YAxis tick={{ fontSize: 12 }} domain={[70, 100]} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Legend />
                <Line type="monotone" dataKey="occupancy" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Occupancy %" />
                <Line type="monotone" dataKey="utilization" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} name="Staff Utilization %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

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
                  {locationData.map((loc, i) => (
                    <motion.tr
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
                      <td className="p-3 text-right font-semibold text-gray-900">${(loc.revenue / 1000).toFixed(0)}K</td>
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
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
