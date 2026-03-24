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
  Loader2,
  RotateCcw,
  AlertCircle,
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

const ACTION_MAP: Record<string, AuditLog['action']> = {
  CREATE: 'Create', UPDATE: 'Update', DELETE: 'Delete', LOGIN: 'Login',
  LOGOUT: 'Login', READ: 'Update', UNKNOWN: 'Update',
  Create: 'Create', Update: 'Update', Delete: 'Delete', Login: 'Login',
};

const actionConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; className: string }> = {
  Login: { icon: LogIn, className: 'bg-blue-100 text-blue-700' },
  Create: { icon: Plus, className: 'bg-emerald-100 text-emerald-700' },
  Update: { icon: Pencil, className: 'bg-amber-100 text-amber-700' },
  Delete: { icon: Trash2, className: 'bg-red-100 text-red-700' },
};

const statusConfig: Record<string, { className: string }> = {
  Success: { className: 'bg-emerald-100 text-emerald-700' },
  Failed: { className: 'bg-red-100 text-red-700' },
};

function mapAuditItem(item: any): AuditLog {
  const rawAction = (item.action as string) || 'Update';
  return {
    id: item.auditId || item.id || item._id || `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: item.timestamp || item.createdAt || new Date().toISOString(),
    user: item.user || item.userName || item.performedBy || item.userId || 'System',
    userRole: item.userRole || item.role || 'Unknown',
    action: ACTION_MAP[rawAction] || ACTION_MAP[rawAction.toUpperCase()] || 'Update',
    resource: item.resource || item.entityType || item.entity || item.target || 'System',
    details: item.details || item.reason || item.description || item.message || `${rawAction} on ${item.entityType || 'system'}`,
    ipAddress: item.ipAddress || item.ip || item.metadata?.ipAddress || '',
    status: (item.status === 'Failed' || item.status === 'FAILED') ? 'Failed' : 'Success',
  };
}

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isLive, setIsLive] = useState(true);
  const [pulse, setPulse] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (actionFilter !== 'All') params.action = actionFilter;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (dateFrom) params.startDate = dateFrom;
      if (dateTo) params.endDate = dateTo;
      if (searchTerm) params.search = searchTerm;

      // apiClient.get returns response.data directly
      const result: any = await apiClient.get('/audit/logs', { params });
      const payload = result?.data || result;

      if (Array.isArray(payload)) {
        setAuditLogs(payload.map(mapAuditItem));
        setError(null);
      } else if (Array.isArray(result)) {
        setAuditLogs(result.map(mapAuditItem));
        setError(null);
      } else {
        // API responded but no array data - empty state, not an error
        setAuditLogs([]);
        setError(null);
      }
    } catch (err: any) {
      console.error('Audit logs fetch error:', err);
      setError('Failed to load audit logs. Please ensure the backend server is running.');
      setAuditLogs([]);
    }
    setLoading(false);
  }, [actionFilter, statusFilter, dateFrom, dateTo, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Live polling
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setPulse((p) => !p);
    }, 2000);

    const pollInterval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(pollInterval);
    };
  }, [isLive, fetchData]);

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

  const statCards = [
    { label: 'Total Events (24h)', value: totalEvents.toString(), icon: Activity, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
    { label: 'Login Events', value: loginEvents.toString(), icon: LogIn, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100' },
    { label: 'Data Changes', value: dataChanges.toString(), icon: Database, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' },
    { label: 'Security Alerts', value: securityAlerts.toString(), icon: AlertTriangle, gradient: 'from-red-500 to-red-600', bgGradient: 'from-red-50 to-red-100' },
  ];

  const handleExport = () => {
    if (filteredLogs.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Resource', 'Details', 'IP Address', 'Status'];
    const rows = filteredLogs.map((log) => [
      log.timestamp,
      log.user,
      log.userRole,
      log.action,
      log.resource,
      `"${log.details.replace(/"/g, '""')}"`,
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
    toast.success('Audit log exported to CSV');
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setActionFilter('All');
    setStatusFilter('All');
    setDateFrom('');
    setDateTo('');
  };

  const successRate = totalEvents > 0 ? Math.round(((totalEvents - securityAlerts) / totalEvents) * 100) : 100;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading audit logs...</p>
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
          <Button id={`btn-fetch-data-admin-reports-audit-${row}`} variant="outline" size="sm" onClick={fetchData} className="ml-auto gap-1.5 text-red-700 border-red-300 hover:bg-red-100">
            <RotateCcw className="h-3.5 w-3.5" /> Retry
          </Button>
        </motion.div>
      )}

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
            <button id="btn-admin-reports-audit-6"
              onClick={() => setIsLive(!isLive)}
              className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                isLive ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {isLive ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button id="btn-export-admin-reports-audit" variant="outline" size="sm" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export Audit Log
          </Button>
          <Button id="btn-fetch-data-admin-reports-audit" variant="outline" size="sm" className="gap-1.5" onClick={fetchData}>
            <RotateCcw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
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
              </div>
            </motion.div>
          );
        })}
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-gray-500" />
                  Activity Log
                  <Badge className="bg-gray-100 text-gray-600 ml-2">{filteredLogs.length} entries</Badge>
                </CardTitle>
                {(searchTerm || actionFilter !== 'All' || statusFilter !== 'All' || dateFrom || dateTo) && (
                  <Button id="btn-clear-filters-admin-reports-audit" variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs text-gray-500">
                    Clear Filters
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input id="input-text-admin-reports-audit"
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
                    <button id="admin-reports-audit-btn"
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
                    <button id="admin-reports-audit-btn-2"
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
                <input id="input-date-admin-reports-audit-from"
                    type="date"
                    className="text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                  <span className="text-gray-400 text-sm">to</span>
                  <input id="input-date-admin-reports-audit"
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
                      const actionCfg = actionConfig[log.action] || actionConfig['Update'];
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
                                log.user === 'System' || log.user === 'system' ? 'bg-gray-200 text-gray-600' :
                                log.user === 'Unknown' ? 'bg-red-100 text-red-600' :
                                'bg-blue-100 text-blue-600'
                              }`}>
                                {log.user === 'System' || log.user === 'system' ? 'SYS' : log.user === 'Unknown' ? '?' : log.user.charAt(0).toUpperCase()}
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
                            {log.ipAddress ? (
                              <div className="flex items-center gap-1.5 font-mono text-xs text-gray-500">
                                <Globe className="h-3 w-3" />
                                {log.ipAddress}
                              </div>
                            ) : (
                              <span className="text-gray-300 text-xs">-</span>
                            )}
                          </td>
                          <td className="p-3">
                            <Badge className={`${(statusConfig[log.status] || statusConfig['Success']).className} gap-1`}>
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
                  <p className="text-sm">
                    {auditLogs.length === 0
                      ? 'No audit events recorded yet. Events will appear here as users interact with the system.'
                      : 'No audit events match the selected filters'}
                  </p>
                  {auditLogs.length > 0 && (
                    <Button id="btn-clear-filters-admin-reports-audit" variant="ghost" size="sm" onClick={handleClearFilters} className="mt-2 text-blue-600">
                      Clear all filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
