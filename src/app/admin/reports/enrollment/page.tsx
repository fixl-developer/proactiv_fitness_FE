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
} from 'lucide-react';

const enrollmentTrend = [
  { month: 'Oct', enrolled: 112 },
  { month: 'Nov', enrolled: 118 },
  { month: 'Dec', enrolled: 108 },
  { month: 'Jan', enrolled: 125 },
  { month: 'Feb', enrolled: 130 },
  { month: 'Mar', enrolled: 135 },
];

const programByAge = [
  { program: 'GYMTOTS', age2_4: 20, age5_7: 18, age8_10: 7 },
  { program: 'Junior Gym', age2_4: 0, age5_7: 35, age8_10: 27 },
  { program: 'Advanced', age2_4: 0, age5_7: 8, age8_10: 20 },
  { program: 'Camps', age2_4: 10, age5_7: 22, age8_10: 15 },
];

const programTable = [
  { program: 'GYMTOTS', enrolled: 45, new: 8, dropped: 2, retention: 95.6, waitlist: 5 },
  { program: 'Junior Gymnastics', enrolled: 62, new: 5, dropped: 1, retention: 98.4, waitlist: 8 },
  { program: 'Advanced Training', enrolled: 28, new: 3, dropped: 0, retention: 100, waitlist: 3 },
  { program: 'Holiday Camps', enrolled: 47, new: 12, dropped: 3, retention: 93.6, waitlist: 0 },
  { program: 'Private Lessons', enrolled: 18, new: 2, dropped: 1, retention: 94.4, waitlist: 2 },
];

const totalEnrolled = programTable.reduce((s, r) => s + r.enrolled, 0);
const totalNew = programTable.reduce((s, r) => s + r.new, 0);
const avgRetention = (programTable.reduce((s, r) => s + r.retention, 0) / programTable.length).toFixed(1);
const churnRate = (100 - parseFloat(avgRetention)).toFixed(1);

const stats = [
  { label: 'Total Enrolled', value: totalEnrolled.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', sub: 'Across all programs' },
  { label: 'New This Month', value: `+${totalNew}`, icon: UserPlus, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Mar 2026' },
  { label: 'Retention Rate', value: `${avgRetention}%`, icon: RefreshCw, color: 'text-purple-600', bg: 'bg-purple-50', sub: 'vs 94.2% prev month' },
  { label: 'Churn Rate', value: `${churnRate}%`, icon: UserMinus, color: 'text-amber-600', bg: 'bg-amber-50', sub: '7 students dropped' },
];

export default function EnrollmentReportsPage() {
  const [dateRange, setDateRange] = useState<'3m' | '6m' | '1y'>('6m');

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
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
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Export Report
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
                    <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
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
                  {programTable.map((row, i) => {
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
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
