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
} from 'lucide-react';

const monthlyRevenueData = [
  { month: 'Jan', actual: 52000, target: 50000 },
  { month: 'Feb', actual: 48000, target: 52000 },
  { month: 'Mar', actual: 61000, target: 55000 },
  { month: 'Apr', actual: 58000, target: 57000 },
  { month: 'May', actual: 67000, target: 60000 },
  { month: 'Jun', actual: 72000, target: 62000 },
];

const programRevenueData = [
  { program: 'Regular Classes', revenue: 185000, fill: '#3b82f6' },
  { program: 'Camps', revenue: 95000, fill: '#10b981' },
  { program: 'Events', revenue: 42000, fill: '#f59e0b' },
  { program: 'Private Lessons', revenue: 36000, fill: '#8b5cf6' },
];

const locationData = [
  { name: 'Cyberport', value: 55, revenue: 196900, fill: '#3b82f6' },
  { name: 'Wan Chai', value: 35, revenue: 125300, fill: '#10b981' },
  { name: 'School Programs', value: 10, revenue: 35800, fill: '#f59e0b' },
];

const breakdownTable = [
  { program: 'GYMTOTS', students: 45, revenue: 54000, avg: 1200, growth: 15.2 },
  { program: 'Junior Gymnastics', students: 62, revenue: 86800, avg: 1400, growth: 8.5 },
  { program: 'Advanced Training', students: 28, revenue: 50400, avg: 1800, growth: 22.1 },
  { program: 'Holiday Camps', students: 85, revenue: 95000, avg: 1118, growth: -3.2 },
  { program: 'Private Lessons', students: 18, revenue: 36000, avg: 2000, growth: 12.0 },
  { program: 'Birthday Events', students: 32, revenue: 42000, avg: 1313, growth: 5.8 },
];

const stats = [
  { label: 'Total Revenue (YTD)', value: 'HK$358,000', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', change: '+18.5%', up: true },
  { label: 'Monthly Average', value: 'HK$59,667', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', change: '+12.3%', up: true },
  { label: 'Growth Rate', value: '18.5%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', change: '+3.2pp', up: true },
  { label: 'Projected Annual', value: 'HK$716,000', icon: Target, color: 'text-amber-600', bg: 'bg-amber-50', change: 'On track', up: true },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

export default function RevenueReportsPage() {
  const [period, setPeriod] = useState<'6m' | '1y' | 'all'>('6m');

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Financial performance and revenue analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg p-0.5">
            {(['6m', '1y', 'all'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  period === p ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p === '6m' ? '6 Months' : p === '1y' ? '1 Year' : 'All Time'}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Export
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
                    <div className="flex items-center gap-1 mt-1">
                      {stat.up ? (
                        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <span className={`text-xs font-medium ${stat.up ? 'text-emerald-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                    </div>
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

      {/* Monthly Revenue Line Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
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
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#3b82f6' }}
                  name="Actual Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#d1d5db"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3, fill: '#d1d5db' }}
                  name="Target"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bar + Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Revenue by Program Type</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Revenue by Location</CardTitle>
            </CardHeader>
            <CardContent>
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
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, _name: string, props: { payload: { revenue: number } }) => [
                      `${value}% (HK$${props.payload.revenue.toLocaleString()})`,
                      'Share',
                    ]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2">
                {locationData.map((loc, i) => (
                  <div key={loc.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-xs text-gray-600">{loc.name}</span>
                  </div>
                ))}
              </div>
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
                  {breakdownTable.map((row, i) => (
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
                        <Progress value={Math.min(100, (row.revenue / 100000) * 100)} className="h-1.5" />
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
