'use client';

import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import type { AttendanceData } from '@/types/dashboard';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface AttendanceChartProps {
    data: AttendanceData[];
    title?: string;
}

export default function AttendanceChart({ data, title = 'Attendance Overview' }: AttendanceChartProps) {
    const chartData = {
        labels: data.map((d) => d.date),
        datasets: [
            {
                label: 'Present',
                data: data.map((d) => d.present),
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
            },
            {
                label: 'Absent',
                data: data.map((d) => d.absent),
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: false,
            },
        },
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            <div className="h-80">
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
}
