'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    User, Mail, Phone, MapPin, Award, Star,
    Edit, Save, Camera, Shield, Clock, Users, BookOpen
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

const CoachProfilePage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [editMode, setEditMode] = useState(false)
    const [profileData, setProfileData] = useState({
        name: 'Sarah Chen',
        email: 'sarah.chen@progym.hk',
        phone: '+852 9876 5432',
        location: 'ProGym Cyberport',
        employeeId: 'PG-C-001',
        joinDate: '2023-03-15',
        specialization: 'Gymnastics & Tumbling',
        bio: 'Passionate gymnastics coach with over 5 years of experience working with children aged 3-16. Specialized in building confidence and developing fundamental movement skills in a fun, safe environment.',
        emergencyContact: {
            name: 'Michael Chen',
            relationship: 'Spouse',
            phone: '+852 9876 5433'
        }
    })

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 800)
    }, [])

    const certifications = [
        {
            name: 'Level 2 Gymnastics Coaching',
            issuer: 'Hong Kong Gymnastics Association',
            issueDate: '2023-01-15',
            expiryDate: '2026-01-15',
            status: 'active'
        },
        {
            name: 'First Aid & CPR Certification',
            issuer: 'Hong Kong Red Cross',
            issueDate: '2023-06-20',
            expiryDate: '2025-06-20',
            status: 'active'
        },
        {
            name: 'Child Safety & Protection',
            issuer: 'Child Protection Services',
            issueDate: '2023-02-10',
            expiryDate: '2025-02-10',
            status: 'active'
        },
        {
            name: 'Youth Sports Psychology',
            issuer: 'Sports Psychology Institute',
            issueDate: '2022-11-30',
            expiryDate: '2025-11-30',
            status: 'active'
        }
    ]

    const achievements = [
        {
            title: 'Coach of the Month',
            description: 'Outstanding performance in December 2023',
            date: '2023-12-01',
            icon: Award
        },
        {
            title: '100% Parent Satisfaction',
            description: 'Achieved perfect satisfaction rating for Q4 2023',
            date: '2023-12-31',
            icon: Star
        },
        {
            title: 'Safety Excellence Award',
            description: 'Zero incidents for 12 consecutive months',
            date: '2023-11-15',
            icon: Shield
        },
        {
            title: 'Student Progress Champion',
            description: 'Highest skill progression rates in the center',
            date: '2023-10-20',
            icon: BookOpen
        }
    ]

    const performanceStats = {
        totalStudents: 89,
        averageRating: 4.8,
        totalClasses: 156,
        attendanceRate: 87.5,
        retentionRate: 92,
        skillProgressions: 234
    }

    const weeklySchedule = [
        { day: 'Monday', hours: '10:00 AM - 4:00 PM', classes: 3 },
        { day: 'Tuesday', hours: '11:00 AM - 5:00 PM', classes: 2 },
        { day: 'Wednesday', hours: '10:00 AM - 4:00 PM', classes: 2 },
        { day: 'Thursday', hours: '11:00 AM - 6:00 PM', classes: 3 },
        { day: 'Friday', hours: '10:00 AM - 4:00 PM', classes: 2 },
        { day: 'Saturday', hours: '9:00 AM - 1:00 PM', classes: 2 },
        { day: 'Sunday', hours: 'Off', classes: 0 }
    ]

    const handleSave = () => {
        setEditMode(false)
        // Here you would typically save to backend
        console.log('Saving profile data:', profileData)
    }

    const getCertificationStatus = (status: string) => {
        const colors = {
            active: 'text-green-600 bg-green-50 border-green-200',
            expiring: 'text-orange-600 bg-orange-50 border-orange-200',
            expired: 'text-red-600 bg-red-50 border-red-200'
        }
        return colors[status as keyof typeof colors] || colors.active
    }

    if (isLoading) {
        return (
            <DashboardLayout userRole="coach" userName="Sarah Chen">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="h-96 bg-gray-200 rounded-lg"></div>
                        <div className="h-96 bg-gray-200 rounded-lg"></div>
                        <div className="h-96 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout userRole="coach" userName="Sarah Chen">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                        <p className="text-gray-600">Manage your personal information and credentials</p>
                    </div>
                    <Button
                        variant={editMode ? "default" : "outline"}
                        onClick={editMode ? handleSave : () => setEditMode(true)}
                    >
                        {editMode ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                        {editMode ? 'Save Changes' : 'Edit Profile'}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                                            SC
                                        </div>
                                        {editMode && (
                                            <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0">
                                                <Camera className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        {editMode ? (
                                            <Input
                                                value={profileData.name}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({ ...profileData, name: e.target.value })}
                                                className="text-xl font-bold"
                                            />
                                        ) : (
                                            <h2 className="text-xl font-bold text-gray-900">{profileData.name}</h2>
                                        )}
                                        <p className="text-gray-600">{profileData.specialization}</p>
                                        <Badge className="mt-1 bg-green-100 text-green-700">
                                            Active Coach
                                        </Badge>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Email</label>
                                            {editMode ? (
                                                <Input
                                                    value={profileData.email}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({ ...profileData, email: e.target.value })}
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Mail className="w-4 h-4 text-gray-500" />
                                                    <span className="text-gray-900">{profileData.email}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Phone</label>
                                            {editMode ? (
                                                <Input
                                                    value={profileData.phone}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({ ...profileData, phone: e.target.value })}
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Phone className="w-4 h-4 text-gray-500" />
                                                    <span className="text-gray-900">{profileData.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Location</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <MapPin className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-900">{profileData.location}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Employee ID</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <User className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-900">{profileData.employeeId}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Bio</label>
                                    {editMode ? (
                                        <Textarea
                                            value={profileData.bio}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProfileData({ ...profileData, bio: e.target.value })}
                                            rows={3}
                                            className="mt-1"
                                        />
                                    ) : (
                                        <p className="text-gray-900 mt-1">{profileData.bio}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Emergency Contact */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Emergency Contact</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Name</label>
                                        {editMode ? (
                                            <Input
                                                value={profileData.emergencyContact.name}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({
                                                    ...profileData,
                                                    emergencyContact: { ...profileData.emergencyContact, name: e.target.value }
                                                })}
                                            />
                                        ) : (
                                            <p className="text-gray-900 mt-1">{profileData.emergencyContact.name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Relationship</label>
                                        {editMode ? (
                                            <Input
                                                value={profileData.emergencyContact.relationship}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({
                                                    ...profileData,
                                                    emergencyContact: { ...profileData.emergencyContact, relationship: e.target.value }
                                                })}
                                            />
                                        ) : (
                                            <p className="text-gray-900 mt-1">{profileData.emergencyContact.relationship}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Phone</label>
                                        {editMode ? (
                                            <Input
                                                value={profileData.emergencyContact.phone}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({
                                                    ...profileData,
                                                    emergencyContact: { ...profileData.emergencyContact, phone: e.target.value }
                                                })}
                                            />
                                        ) : (
                                            <p className="text-gray-900 mt-1">{profileData.emergencyContact.phone}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Certifications */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Certifications & Qualifications</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {certifications.map((cert, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                                                    <p className="text-sm text-gray-600">{cert.issuer}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Issued: {cert.issueDate} • Expires: {cert.expiryDate}
                                                    </p>
                                                </div>
                                                <Badge className={getCertificationStatus(cert.status)}>
                                                    {cert.status}
                                                </Badge>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Performance Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Total Students', value: performanceStats.totalStudents, icon: Users },
                                        { label: 'Average Rating', value: `${performanceStats.averageRating}/5`, icon: Star },
                                        { label: 'Total Classes', value: performanceStats.totalClasses, icon: BookOpen },
                                        { label: 'Attendance Rate', value: `${performanceStats.attendanceRate}%`, icon: Clock }
                                    ].map((stat, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <stat.icon className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm text-gray-600">{stat.label}</span>
                                            </div>
                                            <span className="font-semibold text-gray-900">{stat.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Weekly Schedule */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Weekly Schedule</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {weeklySchedule.map((day, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-gray-900">{day.day}</span>
                                            <div className="text-right">
                                                <p className="text-gray-600">{day.hours}</p>
                                                {day.classes > 0 && (
                                                    <p className="text-xs text-gray-500">{day.classes} classes</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Achievements */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Achievements</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {achievements.slice(0, 3).map((achievement, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-start gap-3"
                                        >
                                            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                                <achievement.icon className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-semibold text-gray-900">{achievement.title}</h4>
                                                <p className="text-xs text-gray-600">{achievement.description}</p>
                                                <p className="text-xs text-gray-500">{achievement.date}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default CoachProfilePage