'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    MapPin, Clock, Phone, Mail,
    ArrowRight, Star, Users, Calendar,
    Navigation, Car, Train, Bus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { responsiveClasses } from '@/lib/responsiveClasses'

const LocationsHomePage = () => {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 1000)
    }, [])

    // Gym Locations
    const gymLocations = [
        {
            name: 'ProGym Cyberport',
            address: 'Shop 315, Level 3, Cyberport 1, 100 Cyberport Road, Hong Kong',
            phone: '+852 2234 5678',
            email: 'cyberport@progym.hk',
            hours: 'Mon-Fri: 9:00-20:00, Sat-Sun: 8:00-18:00',
            href: '/locations/cyberport',
            rating: 4.9,
            students: 180,
            classes: 24,
            featured: true,
            transport: ['Car', 'Bus', 'Taxi']
        },
        {
            name: 'ProGym Wan Chai',
            address: '15/F, Tower 1, Admiralty Centre, 18 Harcourt Road, Admiralty, Hong Kong',
            phone: '+852 2345 6789',
            email: 'wanchai@progym.hk',
            hours: 'Mon-Fri: 9:00-20:00, Sat-Sun: 8:00-18:00',
            href: '/locations/wan-chai',
            rating: 4.8,
            students: 150,
            classes: 20,
            featured: false,
            transport: ['MTR', 'Bus', 'Tram']
        }
    ]

    // Location Features
    const locationFeatures = [
        {
            icon: Star,
            title: 'Premium Facilities',
            description: 'State-of-the-art gymnastics equipment and safety features'
        },
        {
            icon: Users,
            title: 'Expert Coaches',
            description: 'Certified instructors with international experience'
        },
        {
            icon: Calendar,
            title: 'Flexible Schedule',
            description: 'Classes available 7 days a week with various time slots'
        },
        {
            icon: Navigation,
            title: 'Convenient Access',
            description: 'Easy to reach by public transport and car'
        }
    ]

    const getTransportIcon = (transport: string) => {
        switch (transport.toLowerCase()) {
            case 'car': return Car
            case 'mtr': case 'train': return Train
            case 'bus': case 'tram': return Bus
            default: return Navigation
        }
    }

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4 sm:space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {[1, 2].map((i) => (
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
                        Our Locations
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Find the ProGym location nearest to you. All our facilities feature
                        world-class equipment and expert coaching staff.
                    </p>
                </motion.div>
            </div>

            {/* Gym Locations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {gymLocations.map((location, index) => (
                    <motion.div
                        key={location.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                    >
                        <Card
                            className={`hover:shadow-lg transition-all cursor-pointer group h-full ${location.featured ? 'ring-2 ring-blue-200' : ''
                                }`}
                            onClick={() => window.location.href = location.href}
                        >
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <MapPin className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                                                {location.name}
                                            </CardTitle>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                <span className="text-sm font-medium">{location.rating}</span>
                                                {location.featured && (
                                                    <Badge className="bg-blue-100 text-blue-800 ml-2">
                                                        Featured
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-600">{location.address}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <p className="text-sm text-gray-600">{location.phone}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <p className="text-sm text-gray-600">{location.email}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <p className="text-sm text-gray-600">{location.hours}</p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="text-lg font-bold text-blue-600">{location.students}</div>
                                        <div className="text-xs text-gray-600">Students</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="text-lg font-bold text-green-600">{location.classes}</div>
                                        <div className="text-xs text-gray-600">Classes/Week</div>
                                    </div>
                                </div>

                                {/* Transport Options */}
                                <div className="mb-4">
                                    <p className="text-xs font-medium text-gray-700 mb-2">Transport Options:</p>
                                    <div className="flex items-center gap-2">
                                        {location.transport.map((transport, idx) => {
                                            const TransportIcon = getTransportIcon(transport)
                                            return (
                                                <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded text-xs text-blue-700">
                                                    <TransportIcon className="w-3 h-3" />
                                                    <span>{transport}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button
                                        className="flex-1 group-hover:bg-blue-600"
                                        variant={location.featured ? "default" : "outline"}
                                    >
                                        View Details <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Navigation className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Location Features */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">All Locations Feature</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {locationFeatures.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + 0.1 * index }}
                                className="text-center"
                            >
                                <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-3">
                                    <feature.icon className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-600">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
                <CardContent className="text-center p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Ready to Start Your Gymnastics Journey?
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                        Book a free assessment at your preferred location to get started.
                        Our expert coaches will help determine the best program for your needs.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" onClick={() => window.location.href = '/book-assessment'}>
                            Book Free Assessment
                        </Button>
                        <Button variant="outline" size="lg" onClick={() => window.location.href = '/contact'}>
                            Contact Us
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default LocationsHomePage