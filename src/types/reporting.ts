// Reporting & Analytics types

export interface Report {
    id: string;
    name: string;
    description: string;
    type: 'revenue' | 'student' | 'attendance' | 'staff' | 'custom';
    templateId?: string;

    // Configuration
    filters: ReportFilter[];
    columns: ReportColumn[];
    groupBy: string[];
    sortBy: ReportSort[];

    // Schedule
    schedule?: ReportSchedule;

    // Output
    format: 'pdf' | 'excel' | 'csv' | 'json';

    // Metadata
    createdBy: string;
    createdAt: string;
    lastRunAt?: string;
    status: 'draft' | 'active' | 'archived';
}

export interface ReportFilter {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in';
    value: any;
}

export interface ReportColumn {
    field: string;
    label: string;
    type: 'string' | 'number' | 'date' | 'boolean';
    format?: string;
    aggregate?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface ReportSort {
    field: string;
    direction: 'asc' | 'desc';
}

export interface ReportSchedule {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
    enabled: boolean;
}

export interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    previewImage?: string;
    defaultFilters: ReportFilter[];
    defaultColumns: ReportColumn[];
}

export interface ReportExecution {
    id: string;
    reportId: string;
    reportName: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startedAt: string;
    completedAt?: string;
    downloadUrl?: string;
    error?: string;
    rowCount?: number;
}

export interface AnalyticsDashboard {
    id: string;
    name: string;
    description: string;
    widgets: DashboardWidget[];
    layout: DashboardLayout[];
    isDefault: boolean;
    createdAt: string;
}

export interface DashboardWidget {
    id: string;
    type: 'chart' | 'metric' | 'table' | 'map';
    title: string;
    dataSource: string;
    config: WidgetConfig;
}

export interface WidgetConfig {
    chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
    metrics: string[];
    dimensions: string[];
    filters: ReportFilter[];
    refreshInterval?: number;
}

export interface DashboardLayout {
    widgetId: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface AnalyticsMetric {
    name: string;
    value: number;
    change: number;
    changeType: 'increase' | 'decrease' | 'neutral';
    trend: number[];
}
