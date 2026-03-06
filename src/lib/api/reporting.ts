import axios from 'axios';
import type {
    Report,
    ReportTemplate,
    ReportExecution,
    AnalyticsDashboard,
    AnalyticsMetric,
} from '@/types/reporting';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Reports
export const getReports = async (): Promise<Report[]> => {
    const response = await axios.get(`${API_URL}/reports`);
    return response.data;
};

export const getReport = async (reportId: string): Promise<Report> => {
    const response = await axios.get(`${API_URL}/reports/${reportId}`);
    return response.data;
};

export const createReport = async (data: Omit<Report, 'id' | 'createdAt'>): Promise<Report> => {
    const response = await axios.post(`${API_URL}/reports`, data);
    return response.data;
};

export const updateReport = async (
    reportId: string,
    data: Partial<Report>
): Promise<Report> => {
    const response = await axios.put(`${API_URL}/reports/${reportId}`, data);
    return response.data;
};

export const deleteReport = async (reportId: string): Promise<void> => {
    await axios.delete(`${API_URL}/reports/${reportId}`);
};

export const executeReport = async (reportId: string): Promise<ReportExecution> => {
    const response = await axios.post(`${API_URL}/reports/${reportId}/execute`);
    return response.data;
};

export const getReportExecutions = async (reportId: string): Promise<ReportExecution[]> => {
    const response = await axios.get(`${API_URL}/reports/${reportId}/executions`);
    return response.data;
};

export const downloadReport = async (executionId: string): Promise<Blob> => {
    const response = await axios.get(`${API_URL}/reports/executions/${executionId}/download`, {
        responseType: 'blob',
    });
    return response.data;
};

// Templates
export const getReportTemplates = async (): Promise<ReportTemplate[]> => {
    const response = await axios.get(`${API_URL}/reports/templates`);
    return response.data;
};

export const createReportFromTemplate = async (
    templateId: string,
    data: Partial<Report>
): Promise<Report> => {
    const response = await axios.post(`${API_URL}/reports/templates/${templateId}/create`, data);
    return response.data;
};

// Analytics Dashboards
export const getDashboards = async (): Promise<AnalyticsDashboard[]> => {
    const response = await axios.get(`${API_URL}/analytics/dashboards`);
    return response.data;
};

export const getDashboard = async (dashboardId: string): Promise<AnalyticsDashboard> => {
    const response = await axios.get(`${API_URL}/analytics/dashboards/${dashboardId}`);
    return response.data;
};

export const createDashboard = async (
    data: Omit<AnalyticsDashboard, 'id' | 'createdAt'>
): Promise<AnalyticsDashboard> => {
    const response = await axios.post(`${API_URL}/analytics/dashboards`, data);
    return response.data;
};

export const updateDashboard = async (
    dashboardId: string,
    data: Partial<AnalyticsDashboard>
): Promise<AnalyticsDashboard> => {
    const response = await axios.put(`${API_URL}/analytics/dashboards/${dashboardId}`, data);
    return response.data;
};

// Analytics Metrics
export const getAnalyticsMetrics = async (
    category: string,
    period: string
): Promise<AnalyticsMetric[]> => {
    const response = await axios.get(`${API_URL}/analytics/metrics`, {
        params: { category, period },
    });
    return response.data;
};

export const getRevenueAnalytics = async (startDate: string, endDate: string): Promise<any> => {
    const response = await axios.get(`${API_URL}/analytics/revenue`, {
        params: { startDate, endDate },
    });
    return response.data;
};

export const getStudentAnalytics = async (startDate: string, endDate: string): Promise<any> => {
    const response = await axios.get(`${API_URL}/analytics/students`, {
        params: { startDate, endDate },
    });
    return response.data;
};
