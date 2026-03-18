'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Filter,
    MapPin,
    Users,
    Clock,
    Star,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TimeSlot {
    id: string;
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
    status: 'available' | 'full' | 'waitlist' | 'cancelled';
    date: string;
}

interface ScheduleCalendarProps {
    onSlotSelect: (slot: TimeSlot) => void;
    selectedLocation?: string;
    selectedProgram?: string;
    selectedAgeGroup?: string;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
    onSlotSelect,
    selectedLocation,
    selectedProgram,
    selectedAgeGroup
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        location: selectedLocation || 'all',
        program: selectedProgram || 'all',
        ageGroup: selectedAgeGroup || 'all',
        coach: 'all'
    });

    // Load time slots from API
    useEffect(() => {
        const mockSlots: TimeSlot[] = [
            {
                id: '1',
                startTime: '09:00',
                endTime: '10:00',
                programType: 'class',
                programName: 'Beginner Gymnastics',
                coach: 'Sarah Chen',
                location: 'Cyberport',
                ageGroup: '3-5 years',
                capacity: 10,
                booked: 7,
                waitlist: 2,
                price: 350,
                level: 'Beginner',
                status: 'available',
                date: '2024-01-15'
            },
            {
                id: '2',
                startTime: '10:30',
                endTime: '11:30',
                programType: 'assessment',
                programName: 'Skills Assessment',
                coach: 'Will Murray',
                location: 'Cyberport',
                ageGroup: '6-12 years',
                capacity: 8,
                booked: 8,
                waitlist: 3,
                price: 0,
                level: 'Assessment',
                status: 'waitlist',
                date: '2024-01-15'
            },
            {
                id: '3',
                startTime: '14:00',
                endTime: '15:00',
                programType: 'private',
                programName: 'Private Coaching',
                coach: 'Monica',
                location: 'Wan Chai',
                ageGroup: '8-16 years',
                capacity: 2,
                booked: 0,
                waitlist: 0,
                price: 800,
                level: 'Advanced',
                status: 'available',
                date: '2024-01-15'
            }
        ]

        const loadTimeSlots = async () => {
            setIsLoading(true)
            try {
                const { apiClient } = await import('@/services/api/client')
                const params: Record<string, string> = {}
                if (filters.location !== 'all') params.location = filters.location
                if (filters.program !== 'all') params.programType = filters.program
                if (filters.ageGroup !== 'all') params.ageGroup = filters.ageGroup
                if (filters.coach !== 'all') params.coach = filters.coach

                const result = await apiClient.get('/scheduling/schedules/available', { params })
                if (result.success) {
                    setTimeSlots(result.data)
                } else {
                    setTimeSlots(mockSlots)
                }
            } catch (error) {
                console.error('Error loading time slots:', error)
                setTimeSlots(mockSlots)
            } finally {
                setIsLoading(false)
            }
        }

        loadTimeSlots()
    }, [filters])

    const getProgramImage = (type: string) => {
        const images = {
            class: '/images/services/school-gymnastics.jpg',
            trial: '/images/hero/gymnastics-2.jpg',
            assessment: '/images/hero/gymnastics-4.png',
            party: '/images/services/birthday-parties.jpg',
            private: '/images/services/private-coaching.jpg'
        }
        return images[type as keyof typeof images] || '/images/hero/gymnastics-1.jpg'
    }

    const getProgramTypeColor = (type: string) => {
        const colors = {
            class: 'bg-blue-100 text-blue-800',
            trial: 'bg-green-100 text-green-800',
            assessment: 'bg-purple-100 text-purple-800',
            party: 'bg-pink-100 text-pink-800',
            private: 'bg-orange-100 text-orange-800'
        }
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    }

    const getProgramColor = (type: string) => {
        const colors = {
            class: 'from-blue-500 to-blue-600',
            trial: 'from-green-500 to-green-600',
            assessment: 'from-purple-500 to-purple-600',
            party: 'from-pink-500 to-pink-600',
            private: 'from-orange-500 to-orange-600'
        };
        return colors[type as keyof typeof colors] || 'from-gray-500 to-gray-600';
    };

    const getStatusColor = (status: string) => {
        const colors = {
            available: 'text-green-600 bg-green-50',
            full: 'text-red-600 bg-red-50',
            waitlist: 'text-yellow-600 bg-yellow-50',
            cancelled: 'text-gray-600 bg-gray-50'
        };
        return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50';
    };

    const filteredSlots = timeSlots.filter(slot => {
        return (
            (filters.location === 'all' || slot.location === filters.location) &&
            (filters.program === 'all' || slot.programType === filters.program) &&
            (filters.ageGroup === 'all' || slot.ageGroup === filters.ageGroup) &&
            (filters.coach === 'all' || slot.coach === filters.coach)
        );
    });

    const SlotCard = ({ slot }: { slot: TimeSlot }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer"
            onClick={() => onSlotSelect(slot)}
        >
            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className={`h-2 bg-gradient-to-r ${getProgramColor(slot.programType)}`} />
                <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-1">{slot.programName}</h4>
                            <p className="text-sm text-gray-600">{slot.startTime} - {slot.endTime}</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(slot.status)}`}>
                            {slot.status === 'available' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                            {slot.status === 'waitlist' && <AlertCircle className="w-3 h-3 inline mr-1" />}
                            {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
                        </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{slot.location}</span>
                        </div>
                        <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            <span>{slot.coach} • {slot.ageGroup}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>{slot.booked}/{slot.capacity} booked</span>
                            </div>
                            {slot.waitlist > 0 && (
                                <span className="text-xs text-yellow-600">
                                    {slot.waitlist} on waitlist
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="text-lg font-bold text-gray-900">
                            {slot.price === 0 ? 'FREE' : `HK$${slot.price}`}
                        </div>
                        <Button
                            size="sm"
                            className={`${slot.status === 'available' ? 'bg-green-600 hover:bg-green-700' :
                                slot.status === 'waitlist' ? 'bg-yellow-600 hover:bg-yellow-700' :
                                    'bg-gray-400 cursor-not-allowed'}`}
                            disabled={slot.status === 'cancelled'}
                        >
                            {slot.status === 'available' ? 'Book Now' :
                                slot.status === 'waitlist' ? 'Join Waitlist' :
                                    'Unavailable'}
                        </Button>
                    </div>

                    {/* Capacity Bar */}
                    <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Capacity</span>
                            <span>{Math.round((slot.booked / slot.capacity) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                                className={`h-2 rounded-full ${slot.booked / slot.capacity >= 0.8 ? 'bg-red-500' :
                                    slot.booked / slot.capacity >= 0.6 ? 'bg-yellow-500' :
                                        'bg-green-500'
                                    }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${(slot.booked / slot.capacity) * 100}%` }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            />
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
                            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const newDate = new Date(currentDate);
                            newDate.setDate(newDate.getDate() - 7);
                            setCurrentDate(newDate);
                        }}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h2 className="text-xl font-semibold text-gray-900">
                        {currentDate.toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                            day: 'numeric'
                        })}
                    </h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const newDate = new Date(currentDate);
                            newDate.setDate(newDate.getDate() + 7);
                            setCurrentDate(newDate);
                        }}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant={viewMode === 'week' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('week')}
                    >
                        Week
                    </Button>
                    <Button
                        variant={viewMode === 'month' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('month')}
                    >
                        Month
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Program Type</label>
                            <select
                                value={filters.program}
                                onChange={(e) => setFilters({ ...filters, program: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Programs</option>
                                <option value="class">Classes</option>
                                <option value="trial">Trials</option>
                                <option value="assessment">Assessments</option>
                                <option value="party">Parties</option>
                                <option value="private">Private Lessons</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
                            <select
                                value={filters.ageGroup}
                                onChange={(e) => setFilters({ ...filters, ageGroup: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Ages</option>
                                <option value="2-3 years">2-3 years</option>
                                <option value="3-5 years">3-5 years</option>
                                <option value="6-12 years">6-12 years</option>
                                <option value="8-16 years">8-16 years</option>
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
                    </div>
                </CardContent>
            </Card>

            {/* Available Slots */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Available Slots ({filteredSlots.length})
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            Available
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                            Waitlist
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            Full
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
                        {filteredSlots.map((slot) => (
                            <SlotCard key={slot.id} slot={slot} />
                        ))}
                    </motion.div>
                </AnimatePresence>

                {filteredSlots.length === 0 && (
                    <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No slots available</h3>
                        <p className="text-gray-600">Try adjusting your filters or selecting a different date.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScheduleCalendar;
