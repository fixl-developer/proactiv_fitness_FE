'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Plus,
    Edit,
    Trash2,
    Users,
    Clock,
    MapPin,
    Filter,
    Download,
    Upload,
    Settings,
    AlertCircle,
    CheckCircle,
    Eye,
    BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ScheduleSlot {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    programType: 'class' | 'trial' | 'assessment' | 'party' | 'private';
    programName: string;
    coach: string;
    location: string;
    ageGroup: string;
    capacity: number;
    booked: number;
    waitlist: number;
    price: number;
    level: string;
    status: 'active' | 'cancelled' | 'full';
    recurring: boolean;
    recurringPattern?: 'weekly' | 'monthly';
    notes?: string;
}

interface AdminScheduleManagerProps {
    userRole: 'ADMIN' | 'OUTLET_MANAGER';
    locationAccess?: string[];
}

const AdminScheduleManager: React.FC<AdminScheduleManagerProps> = ({
    userRole,
    locationAccess = []
}) => {
    const [schedules, setSchedules] = useState<ScheduleSlot[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);
    const [filters, setFilters] = useState({
        location: 'all',
        coach: 'all',
        programType: 'all',
        status: 'all'
    });

    // Mock data - Replace with actual API
    useEffect(() => {
        const mockSchedules: ScheduleSlot[] = [
            {
                id: '1',
                date: '2024-01-15',
                startTime: '09:00',
                endTime: '10:00',
                programType: 'class',
                programName: 'Beginner Gymnastics',
                coach: 'Sarah Chen',
                location: 'Cyberport',
                ageGroup: '3-5 years',
                capacity: 10,
                booked: 8,
                waitlist: 2,
                price: 350,
                level: 'Beginner',
                status: 'active',
                recurring: true,
                recurringPattern: 'weekly',
                notes: 'Popular class, consider increasing capacity'
            },
            {
                id: '2',
                date: '2024-01-15',
                startTime: '10:30',
                endTime: '11:30',
                programType: 'assessment',
                programName: 'Skills Assessment',
                coach: 'Will Murray',
                location: 'Cyberport',
                ageGroup: '6-12 years',
                capacity: 8,
                booked: 8,
                waitlist: 5,
                price: 0,
                level: 'Assessment',
                status: 'full',
                recurring: false,
                notes: 'High demand - consider adding more slots'
            },
            {
                id: '3',
                date: '2024-01-15',
                startTime: '14:00',
                endTime: '15:00',
                programType: 'private',
                programName: 'Private Coaching',
                coach: 'Monica',
                location: 'Wan Chai',
                ageGroup: '8-16 years',
                capacity: 2,
                booked: 1,
                waitlist: 0,
                price: 800,
                level: 'Advanced',
                status: 'active',
                recurring: false
            }
        ];

        setTimeout(() => {
            setSchedules(mockSchedules);
            setIsLoading(false);
        }, 1000);
    }, [filters]);

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'text-green-600 bg-green-50 border-green-200',
            cancelled: 'text-red-600 bg-red-50 border-red-200',
            full: 'text-yellow-600 bg-yellow-50 border-yellow-200'
        };
        return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200';
    };

    const getProgramTypeColor = (type: string) => {
        const colors = {
            class: 'bg-blue-100 text-blue-800',
            trial: 'bg-green-100 text-green-800',
            assessment: 'bg-purple-100 text-purple-800',
            party: 'bg-pink-100 text-pink-800',
            private: 'bg-orange-100 text-orange-800'
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const filteredSchedules = schedules.filter(schedule => {
        return (
            (filters.location === 'all' || schedule.location === filters.location) &&
            (filters.coach === 'all' || schedule.coach === filters.coach) &&
            (filters.programType === 'all' || schedule.programType === filters.programType) &&
            (filters.status === 'all' || schedule.status === filters.status)
        );
    });

    const ScheduleCard = ({ schedule }: { schedule: ScheduleSlot }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="cursor-pointer"
        >
            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProgramTypeColor(schedule.programType)}`}>
                                    {schedule.programType.toUpperCase()}
                                </span>
                                {schedule.recurring && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                        RECURRING
                                    </span>
                                )}
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">{schedule.programName}</h4>
                            <p className="text-sm text-gray-600">{schedule.startTime} - {schedule.endTime}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(schedule.status)}`}>
                            {schedule.status.toUpperCase()}
                        </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{schedule.location}</span>
                        </div>
                        <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            <span>{schedule.coach} • {schedule.ageGroup}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>{schedule.booked}/{schedule.capacity} booked</span>
                            </div>
                            {schedule.waitlist > 0 && (
                                <span className="text-xs text-yellow-600 font-medium">
                                    {schedule.waitlist} waitlisted
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Capacity Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Capacity</span>
                            <span>{Math.round((schedule.booked / schedule.capacity) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                                className={`h-2 rounded-full ${schedule.booked / schedule.capacity >= 0.9 ? 'bg-red-500' :
                                    schedule.booked / schedule.capacity >= 0.7 ? 'bg-yellow-500' :
                                        'bg-green-500'
                                    }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${(schedule.booked / schedule.capacity) * 100}%` }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            />
                        </div>
                    </div>

                    {schedule.notes && (
                        <div className="mb-4 p-2 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-700">{schedule.notes}</p>
                        </div>
                    )}

                    <div className="flex justify-between items-center">
                        <div className="text-lg font-bold text-gray-900">
                            {schedule.price === 0 ? 'FREE' : `HK$${schedule.price}`}
                        </div>
                        <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => setSelectedSlot(schedule)}>
                                <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setSelectedSlot(schedule)}>
                                <Edit className="w-4 h-4" />
                            </Button>
                            {(userRole === 'ADMIN') && (
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Schedule Manager</h1>
                    <p className="text-gray-600">Manage classes, assessments, and bookings</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                    </Button>
                    <Button size="sm" onClick={() => setShowCreateModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Schedule
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    {
                        title: "Total Classes",
                        value: filteredSchedules.length,
                        change: "+12%",
                        icon: Calendar,
                        color: "text-blue-600"
                    },
                    {
                        title: "Total Bookings",
                        value: filteredSchedules.reduce((sum, s) => sum + s.booked, 0),
                        change: "+8%",
                        icon: Users,
                        color: "text-green-600"
                    },
                    {
                        title: "Waitlisted",
                        value: filteredSchedules.reduce((sum, s) => sum + s.waitlist, 0),
                        change: "+15%",
                        icon: Clock,
                        color: "text-yellow-600"
                    },
                    {
                        title: "Revenue",
                        value: `HK$${filteredSchedules.reduce((sum, s) => sum + (s.booked * s.price), 0).toLocaleString()}`,
                        change: "+22%",
                        icon: BarChart3,
                        color: "text-purple-600"
                    }
                ].map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                        <p className="text-xs text-green-600">{stat.change} from last week</p>
                                    </div>
                                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filters & View Options
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
                            <div className="flex space-x-1">
                                {['day', 'week', 'month'].map((mode) => (
                                    <Button
                                        key={mode}
                                        size="sm"
                                        variant={viewMode === mode ? 'default' : 'outline'}
                                        onClick={() => setViewMode(mode as any)}
                                        className="capitalize"
                                    >
                                        {mode}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                            <select
                                value={filters.location}
                                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Locations</option>
                                <option value="Cyberport">Cyberport</option>
                                <option value="Wan Chai">Wan Chai</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Coach</label>
                            <select
                                value={filters.coach}
                                onChange={(e) => setFilters({ ...filters, coach: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Coaches</option>
                                <option value="Sarah Chen">Sarah Chen</option>
                                <option value="Will Murray">Will Murray</option>
                                <option value="Monica">Monica</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Program Type</label>
                            <select
                                value={filters.programType}
                                onChange={(e) => setFilters({ ...filters, programType: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Programs</option>
                                <option value="class">Classes</option>
                                <option value="trial">Trials</option>
                                <option value="assessment">Assessments</option>
                                <option value="party">Parties</option>
                                <option value="private">Private</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="full">Full</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Schedule Grid */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Schedules ({filteredSchedules.length})
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            Active
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                            Full
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            Cancelled
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ staggerChildren: 0.1 }}
                    >
                        {filteredSchedules.map((schedule) => (
                            <ScheduleCard key={schedule.id} schedule={schedule} />
                        ))}
                    </motion.div>
                </AnimatePresence>

                {filteredSchedules.length === 0 && (
                    <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No schedules found</h3>
                        <p className="text-gray-600 mb-4">Try adjusting your filters or create a new schedule.</p>
                        <Button onClick={() => setShowCreateModal(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Schedule
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminScheduleManager;
