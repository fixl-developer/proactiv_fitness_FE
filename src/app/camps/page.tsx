'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Calendar, Users, MapPin, Clock,
    Star, ArrowRight, Trophy, Activity,
    Sun, Snowflake, Target, Award
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { responsiveClasses } from '@/lib/responsiveClasses'

const CampsHomePage = () => {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 1000)
    }, [])

    // Camp Programs
    const campPrograms = [
        {
            title: 'Gymnastics Camps',
            description: 'Intensive gymnastics training camps for all skill levels',
            icon: Trophy,
            href: '/camps/gymnastics',
            color: 'bg-blue-500',
            duration: '1-2 weeks',
            ages: '4-16 years',
            featured: true
        },
        {
            title: 'Multi-Activity Camps',
            description: 'Fun-filled camps with various sports and activities',
            icon: Activity,
            href: '/camps/multi-activity',
            color: 'bg-green-500',
            duration: '1 week',
            ages: '5-12 years',
            featured: false
        },
        {
            title: 'Shenzhen Competitive',
            description: 'Elite competitive training in Shenzhen facility',
            icon: Award,
            href: '/camps/shenzhen-competitive',
            color: 'bg-purple-500',
            duration: '2-4 weeks',
            ages: '8-18 years',
            featured: false
        }
    ]

    // Camp Features
    const campFeatures = [
        {
            icon: Users,
            title: 'Expert Coaches',
            description: 'Certified gymnastics instructors with international experience'
        },
        {
            icon: Target,
            title: 'Skill Development',
            description: 'Progressive training programs tailored to each skill level'
        },
        {
            icon: MapPin,
            title: 'Premium Facilities',
            description: 'State-of-the-art gymnastics equipment and safe environments'
        },
        {
            icon: Star,
            title: 'Fun & Learning',
            description: 'Perfect balance of skill development and enjoyable activities'
        }
    ]

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4 sm:space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
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
                        Gymnastics Camps
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Join our exciting gymnastics camps designed to develop skills, build confidence,
                        and create lasting memories in a fun and safe environment.
                    </p>
                </motion.div>
            </div>

            {/* Camp Programs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                {campPrograms.map((camp, index) => (
                    <motion.div
                        key={camp.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                    >
                        <Card
                            className={`hover:shadow-lg transition-all cursor-pointer group h-full ${camp.featured ? 'ring-2 ring-blue-200' : ''
                                }`}
                            onClick={() => window.location.href = camp.href}
                        >
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-3 rounded-lg ${camp.color} text-white group-hover:scale-110 transition-transform`}>
                                        <camp.icon className="w-6 h-6" />
                                    </div>
                                    {camp.featured && (
                                        <Badge className="bg-yellow-100 text-yellow-800">
                                            Popular
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                                    {camp.title}
                                </CardTitle>
                                <p className="text-gray-600">
                                    {camp.description}
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{camp.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{camp.ages}</span>
                                    </div>
                                </div>
                                <Button
                                    className="w-full group-hover:bg-blue-600"
                                    variant={camp.featured ? "default" : "outline"}
                                >
                                    Learn More <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Camp Features */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">Why Choose Our Camps?</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {campFeatures.map((feature, index) => (
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

            {/* Seasonal Camps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-yellow-50 to-orange-50">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Sun className="w-6 h-6 text-orange-500" />
                            <CardTitle>Summer Camps</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 mb-4">
                            Join our exciting summer gymnastics camps with outdoor activities,
                            swimming, and intensive skill development programs.
                        </p>
                        <Button variant="outline" onClick={() => window.location.href = '/holiday-camps'}>
                            View Summer Programs
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Snowflake className="w-6 h-6 text-blue-500" />
                            <CardTitle>Holiday Camps</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 mb-4">
                            Special holiday programs during school breaks with themed activities,
                            competitions, and skill assessments.
                        </p>
                        <Button variant="outline" onClick={() => window.location.href = '/holiday-camps'}>
                            View Holiday Programs
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default CampsHomePage