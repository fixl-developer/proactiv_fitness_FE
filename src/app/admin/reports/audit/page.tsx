'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  LogIn,
  Database,
  AlertTriangle,
  Download,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Pencil,
  Trash2,
  Globe,
  Activity,
  Calendar,
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userRole: string;
  action: 'Login' | 'Create' | 'Update' | 'Delete';
  resource: string;
  details: string;
  ipAddress: string;
  status: 'Success' | 'Failed';
}

const auditLogs: AuditLog[] = [
  { id: 'LOG-001', timestamp: '2026-03-19T10:30:00', user: 'Admin User', userRole: 'Super Admin', action: 'Login', resource: 'Auth System', details: 'Admin dashboard login', ipAddress: '192.168.1.1', status: 'Success' },
  { id: 'LOG-002', timestamp: '2026-03-19T10:25:00', user: 'Admin User', userRole: 'Super Admin', action: 'Update', resource: 'Student Profile #234', details: 'Updated contact information and emergency details', ipAddress: '192.168.1.1', status: 'Success' },
  { id: 'LOG-003', timestamp: '2026-03-19T10:20:00', user: 'Coach Sarah', userRole: 'Coach', action: 'Update', resource: 'Attendance Log', details: 'Marked attendance for GYMTOTS class (12 students)', ipAddress: '192.168.1.15', status: 'Success' },
  { id: 'LOG-004', timestamp: '2026-03-19T10:15:00', user: 'System', userRole: 'System', action: 'Create', resource: 'Backup', details: 'Auto-backup completed successfully (2.4GB)', ipAddress: '10.0.0.1', status: 'Success' },
  { id: 'LOG-005', timestamp: '2026-03-19T09:45:00', user: 'Unknown', userRole: 'Unknown', action: 'Login', resource: 'Auth System', details: 'Failed login attempt - invalid credentials (3rd attempt)', ipAddress: '103.25.67.89', status: 'Failed' },
  { id: 'LOG-006', timestamp: '2026-03-19T09:30:00', user: 'Admin User', userRole: 'Super Admin', action: 'Create', resource: 'Programs', details: 'Created new program "Summer Camp 2026"', ipAddress: '192.168.1.1', status: 'Success' },
  { id: 'LOG-007', timestamp: '2026-03-19T09:15:00', user: 'Manager Lily', userRole: 'Manager', action: 'Delete', resource: 'Draft Invoice #DRF-089', details: 'Deleted draft invoice for cancelled booking', ipAddress: '192.168.1.8', status: 'Success' },
  { id: 'LOG-008', timestamp: '2026-03-19T09:00:00', user: 'Coach Mike', userRole: 'Coach', action: 'Update', resource: 'Schedule', details: 'Rescheduled Junior Gym from 3PM to 4PM', ipAddress: '192.168.1.20', status: 'Success' },
];

const actionConfig: Record<string, { icon: React.ElementType; className: string }> = {
  Login: { icon: LogIn, className: 'bg-blue-100 text-blue-700' },
  Create: { icon: Plus, className: 'bg-emerald-100 text-emerald-700' },
  Update: { icon: Pencil, className: 'bg-amber-100 text-amber-700' },
  Delete: { icon: Trash2, className: 'bg-red-100 text-red-700' },
};

const statusConfig: Record<string, { className: string }> = {
  Success: { className: 'bg-emerald-100 text-emerald-700' },
  Failed: { className: 'bg-red-100 text-red-700' },
};

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isLive, setIsLive] = useState(true);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setPulse((p) => !p);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLive]);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'All' || log.action === actionFilter;
    const matchesStatus = statusFilter === 'All' || log.status === statusFilter;
    const logDate = log.timestamp.slice(0, 10);
    const matchesDateFrom = !dateFrom || logDate >= dateFrom;
    const matchesDateTo = !dateTo || logDate <= dateTo;
    return matchesSearch && matchesAction && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const totalEvents = auditLogs.length;
  const loginEvents = auditLogs.filter((l) => l.action === 'Login').length;
  const dataChanges = auditLogs.filter((l) => ['Create', 'Update', 'Delete'].includes(l.action)).length;
  const securityAlerts = auditLogs.filter((l) => l.status === 'Failed').length;

  const stats = [
    { label: 'Total Events (24h)', value: totalEvents.toString(), icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Login Events', value: loginEvents.toString(), icon: LogIn, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Data Changes', value: dataChanges.toString(), icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Security Alerts', value: securityAlerts.toString(), icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const handleExport = () => {
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Resource', 'Details', 'IP Address', 'Status'];
    const rows = filteredLogs.map((log) => [
      log.timestamp,
      log.user,
      log.userRole,
      log.action,
      log.resource,
      `"${log.details}"`,
      log.ipAddress,
      log.status,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const successRate = totalEvents > 0 ? Math.round(((totalEvents - securityAlerts) / totalEvents) * 100) : 100;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-500 text-sm mt-1">System activity monitoring and security events</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <motion.div
              animate={{ scale: pulse ? 1.3 : 1, opacity: pulse ? 0.6 : 1 }}
              transition={{ duration: 1 }}
              className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-gray-400'}`}
            />
            <span className={`text-xs font-medium ${isLive ? 'text-emerald-600' : 'text-gray-500'}`}>
              {isLive ? 'Live' : 'Paused'}
            </span>
            <button
              onClick={() => setIsLive(!isLive)}
              className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                isLive ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {isLive ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export Audit Log
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
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">{stat.value}</p>
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

      {/* Success Rate */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Event Success Rate (24h)</span>
              <span className="text-sm font-semibold text-gray-900">{successRate}%</span>
            </div>
            <Progress value={successRate} className="h-2" />
            {securityAlerts > 0 && (
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {securityAlerts} failed event(s) detected - review recommended
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters & Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-500" />
                Activity Log
              </CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    className="pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-[200px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-1 border rounded-lg p-1">
                  <Filter className="h-3.5 w-3.5 text-gray-400 ml-1.5" />
                  {['All', 'Login', 'Create', 'Update', 'Delete'].map((a) => (
                    <button
                      key={a}
                      onClick={() => setActionFilter(a)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        actionFilter === a ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 border rounded-lg p-1">
                  {['All', 'Success', 'Failed'].map((s) => (
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
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    className="text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                  <span className="text-gray-400 text-sm">to</span>
                  <input
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
                    <th className="text-left p-3 font-medium text-gray-600">Timestamp</th>
                    <th className="text-left p-3 font-medium text-gray-600">User</th>
                    <th className="text-left p-3 font-medium text-gray-600">Action</th>
                    <th className="text-left p-3 font-medium text-gray-600">Resource</th>
                    <th className="text-left p-3 font-medium text-gray-600">Details</th>
                    <th className="text-left p-3 font-medium text-gray-600">IP Address</th>
                    <th className="text-left p-3 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredLogs.map((log, i) => {
                      const actionCfg = actionConfig[log.action];
                      const ActionIcon = actionCfg.icon;
                      const time = new Date(log.timestamp);
                      const timeStr = time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                      const dateStr = time.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

                      return (
                        <motion.tr
                          key={log.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ delay: i * 0.03 }}
                          className={`border-b hover:bg-gray-50/50 transition-colors ${
                            log.status === 'Failed' ? 'bg-red-50/30' : ''
                          }`}
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-gray-400" />
                              <div>
                                <span className="font-medium text-gray-900">{timeStr}</span>
                                <span className="text-gray-400 ml-1 text-xs">{dateStr}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                log.user === 'System' ? 'bg-gray-200 text-gray-600' :
                                log.user === 'Unknown' ? 'bg-red-100 text-red-600' :
                                'bg-blue-100 text-blue-600'
                              }`}>
                                {log.user === 'System' ? 'SYS' : log.user === 'Unknown' ? '?' : log.user.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-xs">{log.user}</p>
                                <p className="text-[10px] text-gray-400">{log.userRole}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge className={`${actionCfg.className} gap-1`}>
                              <ActionIcon className="h-3 w-3" />
                              {log.action}
                            </Badge>
                          </td>
                          <td className="p-3 font-medium text-gray-700">{log.resource}</td>
                          <td className="p-3 text-gray-600 max-w-[250px] truncate">{log.details}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5 font-mono text-xs text-gray-500">
                              <Globe className="h-3 w-3" />
                              {log.ipAddress}
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge className={`${statusConfig[log.status].className} gap-1`}>
                              {log.status === 'Success' ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                              {log.status}
                            </Badge>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
              {filteredLogs.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  <Shield className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No audit events match the selected filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
