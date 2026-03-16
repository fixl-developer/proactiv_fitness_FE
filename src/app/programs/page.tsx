'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Trophy, Users, Calendar, Star,
    ArrowRight, Clock, Target, Award,
    PartyPopper, Snowflake, GraduationCap, Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { responsiveClasses } from '@/lib/responsiveClasses'

const ProgramsHomePage = () => {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 1000)
    }, [])

    // Program Categories
    const programCategories = [
        {
            title: 'Birthday Parties',
            description: 'Unforgettable gymnastics birthday celebrations',
            icon: PartyPopper,
            href: '/programs/birthday-parties',
            color: 'bg-pink-500',
            ages: '3-12 years',
            duration: '2 hours',
            featured: true
        },
        {
            title: 'Holiday Camps',
            description: 'Fun-filled holiday programs and activities',
            icon: Snowflake,
            href: '/programs/holiday-camps',
            color: 'bg-blue-500',
            ages: '4-16 years',
            duration: '1-2 weeks',
            featured: false
        },
        {
            title: 'Multi-Activity Camps',
            description: 'Diverse sports and activity programs',
            icon: Activity,
            href: '/programs/multi-activity-camps',
            color: 'bg-green-500',
            ages: '5-14 years',
            duration: '1 week',
            featured: false
        },
        {
            title: 'School Gymnastics',
            description: 'Professional gymnastics programs for schools',
            icon: GraduationCap,
            href: '/programs/school-gymnastics',
            color: 'bg-purple-500',
            ages: 'All ages',
            duration: 'Term-based',
            featured: false
        }
    ]

    // Program Features
    const programFeatures = [
        {
            icon: Trophy,
            title: 'Expert Instruction',
            description: 'Certified coaches with years of experience'
        },
        {
            icon: Users,
            title: 'Small Groups',
            description: 'Personalized attention with optimal class sizes'
        },
        {
            icon: Target,
            title: 'Skill Development',
            description: 'Progressive curriculum for all skill levels'
        },
        {
            icon: Star,
            title: 'Safe Environment',
            description: 'State-of-the-art equipment and safety protocols'
        }
    ]

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4 sm:space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[1, 2, 3, 4].map((i) => (
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
                        Our Programs
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Discover our comprehensive range of gymnastics programs designed to inspire,
                        challenge, and develop young athletes at every level.
                    </p>
                </motion.div>
            </div>

            {/* Program Categories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {programCategories.map((program, index) => (
                    <motion.div
                        key={program.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                    >
                        <Card
                            className={`hover:shadow-lg transition-all cursor-pointer group h-full ${program.featured ? 'ring-2 ring-pink-200' : ''
                                }`}
                            onClick={() => window.location.href = program.href}
                        >
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-3 rounded-lg ${program.color} text-white group-hover:scale-110 transition-transform`}>
                                        <program.icon className="w-6 h-6" />
                                    </div>
                                    {program.featured && (
                                        <Badge className="bg-pink-100 text-pink-800">
                                            Popular
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                                    {program.title}
                                </CardTitle>
                                <p className="text-sm text-gray-600">
                                    {program.description}
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{program.ages}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{program.duration}</span>
                                    </div>
                                </div>
                                <Button
                                    className="w-full group-hover:bg-blue-600"
                                    variant={program.featured ? "default" : "outline"}
                                >
                                    Learn More <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Program Features */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">Why Choose Our Programs?</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {programFeatures.map((feature, index) => (
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

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Calendar className="w-6 h-6 text-blue-500" />
                            <CardTitle>Regular Classes</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 mb-4">
                            Explore our regular gymnastics classes for ongoing skill development
                            and fitness improvement.
                        </p>
                        <Button variant="outline" onClick={() => window.location.href = '/book-now'}>
                            View Class Schedule
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-teal-50">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Award className="w-6 h-6 text-green-500" />
                            <CardTitle>Assessment Program</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 mb-4">
                            Book a free assessment to determine the best program
                            for your child's skill level and goals.
                        </p>
                        <Button variant="outline" onClick={() => window.location.href = '/book-assessment'}>
                            Book Assessment
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ProgramsHomePage