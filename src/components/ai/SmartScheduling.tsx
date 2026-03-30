'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Calendar,
    Clock,
    Users,
    MapPin,
    Star,
    CheckCircle,
    AlertCircle,
    Zap,
    Brain,
    TrendingUp,
    Filter
} from 'lucide-react';
import { smartSchedulerService } from '@/services/advancedAIServices';

interface TimeSlot {
    id: string;
    date: string;
    time: string;
    duration: number;
    coachId: string;
    coachName: string;
    programId: string;
    programName: string;
    locationId: string;
    locationName: string;
    spotsAvailable: number;
    totalSpots: number;
    recommendationScore: number;
    pricing: number;
    reasons: string[];
    coachRating: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface SchedulingFilters {
    childAge?: number;
    experienceLevel?: string;
    preferredDates?: string[];
    preferredTimes?: string[];
    location?: string;
    maxPrice?: number;
}

interface SmartSchedulingProps {
    onSlotSelect?: (slot: TimeSlot) => void;
    className?: string;
}

const SmartScheduling = ({ onSlotSelect, className = '' }: SmartSchedulingProps) => {
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [filteredSlots, setFilteredSlots] = useState<TimeSlot[]>([]);
    const [filters, setFilters] = useState<SchedulingFilters>({});
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadAvailableSlots();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [availableSlots, filters]);

    const loadAvailableSlots = async () => {
        setIsLoading(true);
        try {
            // Call Smart Scheduler AI to get optimized schedule
            const locationId = filters.location || 'default';
            const result = await smartSchedulerService.optimizeSchedule({ locationId });

            if (result?.data?.optimizedSchedule && Array.isArray(result.data.optimizedSchedule)) {
                const slots = result.data.optimizedSchedule.map((slot: any, idx: number) => ({
                    id: slot.id || `slot_${idx}`,
                    date: slot.date || new Date(Date.now() + (idx + 1) * 86400000).toISOString().split('T')[0],
                    time: slot.time || `${10 + idx * 2}:00 AM`,
                    duration: slot.duration || 60,
                    coachId: slot.coachId || `coach_${idx}`,
                    coachName: slot.coachName || `Coach ${idx + 1}`,
                    programId: slot.programId || `prog_${idx}`,
                    programName: slot.programName || 'Gymnastics Class',
                    locationId: slot.locationId || locationId,
                    locationName: slot.locationName || 'Main Center',
                    spotsAvailable: slot.spotsAvailable || 5,
                    totalSpots: slot.totalSpots || 8,
                    recommendationScore: slot.recommendationScore || 0.85,
                    pricing: slot.pricing || 350,
                    coachRating: slot.coachRating || 4.5,
                    difficulty: slot.difficulty || 'beginner',
                    reasons: slot.reasons || ['AI-optimized time slot', 'Based on demand patterns'],
                }));
                setAvailableSlots(slots);
            } else {
                // Use default slots from AI analysis or fallback
                setAvailableSlots(getDefaultSlots(filters));
            }
        } catch (error) {
            console.error('Error loading slots:', error);
            setAvailableSlots(getDefaultSlots(filters));
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...availableSlots];

        if (filters.childAge) {
            filtered = filtered.filter(slot => {
                // Filter based on age-appropriate programs
                if (filters.childAge! <= 6) return slot.difficulty === 'beginner';
                if (filters.childAge! <= 10) return slot.difficulty === 'beginner' || slot.difficulty === 'intermediate';
                return true;
            });
        }

        if (filters.experienceLevel) {
            filtered = filtered.filter(slot => slot.difficulty === filters.experienceLevel);
        }

        if (filters.location) {
            filtered = filtered.filter(slot => slot.locationId === filters.location);
        }

        if (filters.maxPrice) {
            filtered = filtered.filter(slot => slot.pricing <= filters.maxPrice!);
        }

        // Sort by recommendation score
        filtered.sort((a, b) => b.recommendationScore - a.recommendationScore);

        setFilteredSlots(filtered);
    };

    const handleSlotSelect = (slot: TimeSlot) => {
        setSelectedSlot(slot.id);
        onSlotSelect?.(slot);
    };

    const getScoreColor = (score: number) => {
        if (score >= 0.9) return 'text-green-600 bg-green-100';
        if (score >= 0.8) return 'text-blue-600 bg-blue-100';
        if (score >= 0.7) return 'text-yellow-600 bg-yellow-100';
        return 'text-gray-600 bg-gray-100';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 0.9) return 'Perfect Match';
        if (score >= 0.8) return 'Great Match';
        if (score >= 0.7) return 'Good Match';
        return 'Available';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="border rounded-xl p-4">
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Brain className="h-6 w-6 text-blue-600" />
                            Smart Scheduling
                        </h2>
                        <p className="text-gray-600">AI-powered time slot recommendations</p>
                    </div>
                    <Button id="ai-smart-scheduling-filters-btn"
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                    </Button>
                </div>

                {/* Filters */}
                {showFilters && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-lg">Preferences</CardTitle>
                            <CardDescription>Help us find the perfect time slots for you</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Child's Age</label>
                                    <Input
                                        type="number"
                                        placeholder="Enter age"
                                        value={filters.childAge || ''}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev,
                                            childAge: e.target.value ? parseInt(e.target.value) : undefined
                                        }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Experience Level</label>
                                    <select id="ai-smart-scheduling-experience-select"
                                        value={filters.experienceLevel || ''}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev,
                                            experienceLevel: e.target.value || undefined
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select level</option>
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Location</label>
                                    <select id="ai-smart-scheduling-location-select"
                                        value={filters.location || ''}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev,
                                            location: e.target.value || undefined
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Any location</option>
                                        <option value="cyberport">Cyberport</option>
                                        <option value="wan-chai">Wan Chai</option>
                                        <option value="tsim-sha-tsui">Tsim Sha Tsui</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Available Slots */}
            <div className="space-y-4">
                {filteredSlots.length === 0 ? (
                    <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Available Slots</h3>
                        <p className="text-gray-600">
                            Try adjusting your filters or check back later for new availability.
                        </p>
                    </div>
                ) : (
                    filteredSlots.map((slot) => (
                        <Card
                            key={slot.id}
                            id={`ai-smart-scheduling-slot-${slot.id}-card`}
                            className={`cursor-pointer transition-all duration-300 ${selectedSlot === slot.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'hover:border-blue-300 hover:shadow-md'
                                }`}
                            onClick={() => handleSlotSelect(slot)}
                        >
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {slot.programName}
                                            </h3>
                                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(slot.recommendationScore)}`}>
                                                <div className="flex items-center gap-1">
                                                    <Zap className="h-3 w-3" />
                                                    <span>{getScoreLabel(slot.recommendationScore)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>{formatDate(slot.date)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                <span>{slot.time} ({slot.duration}min)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                <span>{slot.locationName}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                <span>{slot.spotsAvailable}/{slot.totalSpots} spots</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-blue-600">
                                            HK${slot.pricing}
                                        </div>
                                        <div className="text-sm text-gray-500">per session</div>
                                    </div>
                                </div>

                                {/* Coach Info */}
                                <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Users className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">Coach {slot.coachName}</div>
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Star className="h-3 w-3 text-yellow-500" />
                                                <span>{slot.coachRating.toFixed(1)} rating</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600 capitalize">
                                        {slot.difficulty} level
                                    </div>
                                </div>

                                {/* AI Reasoning */}
                                <div className="mb-4">
                                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                        <Brain className="h-4 w-4 text-blue-600" />
                                        Why this slot is recommended:
                                    </h4>
                                    <ul className="space-y-1">
                                        {slot.reasons.map((reason, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span>{reason}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Availability Status */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {slot.spotsAvailable > 3 ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                                        )}
                                        <span className="text-sm text-gray-600">
                                            {slot.spotsAvailable > 3
                                                ? 'Good availability'
                                                : `Only ${slot.spotsAvailable} spots left`
                                            }
                                        </span>
                                    </div>

                                    <Button id={`ai-smart-scheduling-select-${slot.id}-btn`}
                                        className={selectedSlot === slot.id ? 'bg-blue-600' : ''}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSlotSelect(slot);
                                        }}
                                    >
                                        {selectedSlot === slot.id ? 'Selected' : 'Select Slot'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* AI Insights */}
            <Card className="mt-6">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-gray-900 mb-1">
                                Smart Scheduling Insights
                            </h4>
                            <p className="text-sm text-gray-600">
                                Our AI analyzes factors like coach expertise, class size, location convenience,
                                and historical success rates to recommend the best time slots for your child's
                                learning journey.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Default slots when AI schedule optimization API is unavailable
const getDefaultSlots = (filters: SchedulingFilters): TimeSlot[] => {
    const baseDate = new Date();
    return [
        {
            id: 'slot_1',
            date: new Date(baseDate.getTime() + 86400000).toISOString().split('T')[0],
            time: '10:00 AM',
            duration: 60,
            coachId: 'coach_1',
            coachName: 'Sarah Chen',
            programId: 'prog_1',
            programName: 'Beginner Gymnastics',
            locationId: filters.location || 'cyberport',
            locationName: 'Cyberport',
            spotsAvailable: 5,
            totalSpots: 8,
            recommendationScore: 0.95,
            pricing: 350,
            coachRating: 4.8,
            difficulty: 'beginner',
            reasons: [
                'Perfect match for beginner level',
                'Highly rated coach with 5+ years experience',
                'Optimal class size for individual attention',
                'Morning slot ideal for young children'
            ]
        },
        {
            id: 'slot_2',
            date: new Date(baseDate.getTime() + 86400000).toISOString().split('T')[0],
            time: '2:00 PM',
            duration: 75,
            coachId: 'coach_2',
            coachName: 'Mike Wong',
            programId: 'prog_2',
            programName: 'Intermediate Gymnastics',
            locationId: 'wan-chai',
            locationName: 'Wan Chai',
            spotsAvailable: 3,
            totalSpots: 6,
            recommendationScore: 0.88,
            pricing: 400,
            coachRating: 4.6,
            difficulty: 'intermediate',
            reasons: [
                'Great for skill development progression',
                'Experienced coach specializing in technique',
                'Small class size ensures quality instruction',
                'Convenient central location'
            ]
        },
        {
            id: 'slot_3',
            date: new Date(baseDate.getTime() + 2 * 86400000).toISOString().split('T')[0],
            time: '4:00 PM',
            duration: 60,
            coachId: 'coach_3',
            coachName: 'Lisa Zhang',
            programId: 'prog_3',
            programName: 'Advanced Gymnastics',
            locationId: filters.location || 'cyberport',
            locationName: 'Cyberport',
            spotsAvailable: 2,
            totalSpots: 6,
            recommendationScore: 0.82,
            pricing: 450,
            coachRating: 4.9,
            difficulty: 'advanced',
            reasons: [
                'Top-rated coach for advanced skills',
                'Modern facility with full equipment',
                'After-school timing convenient for older kids',
                'Focus on competitive preparation'
            ]
        },
    ];
};

export default SmartScheduling;
