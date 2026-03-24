'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Calendar, MapPin, Clock, Users,
    Star, Trophy, PartyPopper, Target,
    ArrowRight, Ticket, Gift, Award
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { responsiveClasses } from '@/lib/responsiveClasses'

const EventsHomePage = () => {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 1000)
    }, [])

    // Upcoming Events
    const upcomingEvents = [
        {
            id: 1,
            title: 'Spring Gymnastics Competition',
            description: 'Annual competition showcasing student progress and skills',
            date: '2024-03-15',
            time: '10:00 AM - 4:00 PM',
            location: 'ProGym Cyberport',
            category: 'Competition',
            participants: 45,
            ageGroup: '6-16 years',
            featured: true,
            status: 'Open Registration'
        },
        {
            id: 2,
            title: 'Parent & Child Workshop',
            description: 'Fun gymnastics activities for parents and children together',
            date: '2024-03-22',
            time: '2:00 PM - 4:00 PM',
            location: 'ProGym Wan Chai',
            category: 'Workshop',
            participants: 20,
            ageGroup: '3-8 years',
            featured: false,
            status: 'Few Spots Left'
        },
        {
            id: 3,
            title: 'Summer Camp Showcase',
            description: 'End-of-camp performance showcasing new skills learned',
            date: '2024-04-05',
            time: '6:00 PM - 8:00 PM',
            location: 'Both Locations',
            category: 'Showcase',
            participants: 80,
            ageGroup: 'All ages',
            featured: false,
            status: 'Free Event'
        }
    ]

    // Event Categories
    const eventCategories = [
        {
            icon: Trophy,
            title: 'Competitions',
            description: 'Showcase skills in friendly competitions',
            color: 'bg-yellow-500'
        },
        {
            icon: PartyPopper,
            title: 'Celebrations',
            description: 'Special events and milestone celebrations',
            color: 'bg-pink-500'
        },
        {
            icon: Target,
            title: 'Workshops',
            description: 'Skill-building workshops and masterclasses',
            color: 'bg-blue-500'
        },
        {
            icon: Star,
            title: 'Showcases',
            description: 'Performance opportunities for students',
            color: 'bg-purple-500'
        }
    ]

    const getCategoryColor = (category: string) => {
        const colors = {
            'Competition': 'bg-yellow-100 text-yellow-800',
            'Workshop': 'bg-blue-100 text-blue-800',
            'Showcase': 'bg-purple-100 text-purple-800',
            'Celebration': 'bg-pink-100 text-pink-800'
        }
        return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    }

    const getStatusColor = (status: string) => {
        const colors = {
            'Open Registration': 'bg-green-100 text-green-800',
            'Few Spots Left': 'bg-orange-100 text-orange-800',
            'Full': 'bg-red-100 text-red-800',
            'Free Event': 'bg-blue-100 text-blue-800'
        }
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    }

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4 sm:space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={responsiveClasses.pageContainer}>
            {/* Header */}
            <div className="text-center mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Events & Competitions
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Join our exciting gymnastics events, competitions, and special celebrations.
                        Perfect opportunities to showcase skills and celebrate achievements.
                    </p>
                </motion.div>
            </div>

            {/* Upcoming Events */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {upcomingEvents.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <Card
                                id={`event-card-${event.id}`}
                                className={`hover:shadow-lg transition-all cursor-pointer group h-full ${event.featured ? 'ring-2 ring-yellow-200' : ''
                                    }`}
                                onClick={() => window.location.href = `/event/${event.id}`}
                            >
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <Badge className={getCategoryColor(event.category)}>
                                            {event.category}
                                        </Badge>
                                        <Badge className={getStatusColor(event.status)}>
                                            {event.status}
                                        </Badge>
                                    </div>

                                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                                        {event.title}
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        {event.description}
                                    </p>
                                </CardHeader>

                                <CardContent>
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">
                                                {new Date(event.date).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">{event.time}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">{event.location}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">
                                                {event.participants} participants • {event.ageGroup}
                                            </span>
                                        </div>
                                    </div>

                                    <Button id="event-btn"
                                        className="w-full group-hover:bg-blue-600"
                                        variant={event.featured ? "default" : "outline"}
                                    >
                                        {event.status === 'Free Event' ? 'Learn More' : 'Register Now'}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Event Categories */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">Event Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {eventCategories.map((category, index) => (
                            <motion.div
                                key={category.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + 0.1 * index }}
                                className="text-center"
                            >
                                <div className={`p-3 ${category.color} text-white rounded-lg w-fit mx-auto mb-3`}>
                                    <category.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">{category.title}</h3>
                                <p className="text-sm text-gray-600">{category.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Event Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-yellow-50 to-orange-50">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Award className="w-6 h-6 text-yellow-600" />
                            <CardTitle>Skill Development</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 mb-4">
                            Events provide excellent opportunities for students to apply their skills
                            in new environments and gain valuable performance experience.
                        </p>
                        <Button id="event-btn-2" variant="outline">
                            <Ticket className="w-4 h-4 mr-2" />
                            View All Events
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Gift className="w-6 h-6 text-blue-600" />
                            <CardTitle>Community Building</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 mb-4">
                            Connect with other families, celebrate achievements together,
                            and build lasting friendships within our gymnastics community.
                        </p>
                        <Button id="event-btn-3" variant="outline">
                            <Users className="w-4 h-4 mr-2" />
                            Join Community
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default EventsHomePage
