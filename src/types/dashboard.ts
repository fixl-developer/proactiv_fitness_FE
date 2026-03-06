// Dashboard types and interfaces

export interface DashboardMetrics {
    totalRevenue: number;
    revenueChange: number;
    totalStudents: number;
    studentsChange: number;
    totalClasses: number;
    classesChange: number;
    attendanceRate: number;
    attendanceChange: number;
}

export interface RevenueData {
    date: string;
    amount: number;
    label: string;
}

export interface AttendanceData {
    date: string;
    present: number;
    absent: number;
    total: number;
}

export interface StudentGrowthData {
    month: string;
    active: number;
    new: number;
    churned: number;
}

export interface ProgramPopularity {
    id: string;
    name: string;
    enrollments: number;
    revenue: number;
    capacity: number;
    utilizationRate: number;
}

export interface LocationPerformance {
    id: string;
    name: string;
    revenue: number;
    students: number;
    classes: number;
    attendanceRate: number;
    rating: number;
}

export interface StaffPerformance {
    id: string;
    name: string;
    classesCount: number;
    studentsCount: number;
    attendanceRate: number;
    rating: number;
    image: string;
}

export interface RecentActivity {
    id: string;
    type: 'booking' | 'payment' | 'cancellation' | 'inquiry' | 'registration';
    title: string;
    description: string;
    timestamp: string;
    user: {
        name: string;
        image?: string;
    };
}

export interface Notification {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    actionUrl?: string;
}

export interface QuickAction {
    id: string;
    title: string;
    description: string;
    icon: string;
    url: string;
    color: string;
}

export interface DashboardFilters {
    dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
    startDate?: string;
    endDate?: string;
    locationId?: string;
    programId?: string;
}

export interface ExportOptions {
    format: 'pdf' | 'excel' | 'csv';
    dateRange: string;
    includeCharts: boolean;
    includeDetails: boolean;
}
