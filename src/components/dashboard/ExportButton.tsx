'use client';

import { useState } from 'react';
import { dashboardApi } from '@/lib/api/dashboard';
import type { DashboardFilters, ExportOptions } from '@/types/dashboard';
import { toast } from 'sonner';

interface ExportButtonProps {
    filters?: DashboardFilters;
}

export default function ExportButton({ filters }: ExportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [exportOptions, setExportOptions] = useState<ExportOptions>({
        format: 'pdf',
        dateRange: filters?.dateRange || 'month',
        includeCharts: true,
        includeDetails: true,
    });

    const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
        try {
            setLoading(true);
            const blob = await dashboardApi.exportReport(format, filters);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(`Report exported successfully as ${format.toUpperCase()}`);
            setIsOpen(false);
        } catch (error) {
            toast.error('Failed to export report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Report
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-20 p-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">
                            Export Dashboard Report
                        </h4>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Format
                                </label>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => handleExport('pdf')}
                                        disabled={loading}
                                        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-sm text-gray-900">PDF Document</span>
                                        </div>
                                        <span className="text-xs text-gray-500">Best for printing</span>
                                    </button>

                                    <button
                                        onClick={() => handleExport('excel')}
                                        disabled={loading}
                                        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className="text-sm text-gray-900">Excel Spreadsheet</span>
                                        </div>
                                        <span className="text-xs text-gray-500">Best for analysis</span>
                                    </button>

                                    <button
                                        onClick={() => handleExport('csv')}
                                        disabled={loading}
                                        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className="text-sm text-gray-900">CSV File</span>
                                        </div>
                                        <span className="text-xs text-gray-500">Best for import</span>
                                    </button>
                                </div>
                            </div>

                            {loading && (
                                <div className="flex items-center justify-center py-2">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    <span className="ml-2 text-sm text-gray-600">Generating report...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
