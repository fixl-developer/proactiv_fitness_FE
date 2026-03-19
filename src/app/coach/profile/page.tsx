'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    User, Mail, Phone, MapPin, Award, BookOpen, Target,
    Edit2, Save, AlertCircle, CheckCircle, Star, Users
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { responsiveClasses } from '@/lib/responsiveClasses'
import { useAuth } from '@/contexts/AuthContext'

const CoachProfilePage = () => {
    const { isAuthenticated, user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [profile, setProfile] = useState({
        name: 'Coach Sarah Johnson',
        email: 'sarah.johnson@proactiv.com',
        phone: '+91-9876543210',
        location: 'Mumbai, India',
        bio: 'Certified gymnastics coach with 10+ years of experience. Specializing in beginner and intermediate level training.',
        specializations: ['Gymnastics', 'Tumbling', 'Flexibility Training'],
        certifications: ['Level 3 Gymnastics Coach', 'First Aid Certified', 'Sports Nutrition'],
        experience: '10+ years',
        rating: 4.8,
        totalStudents: 45,
        totalClasses: 48
    })

    const [editedProfile, setEditedProfile] = useState(profile)

    useEffect(() => {
        if (!isAuthenticated && !localStorage.getItem('token')) return

        loadProfile()
    }, [isAuthenticated])

    const loadProfile = async () => {
        try {
            setIsLoading(false)
        } catch (error) {
            console.error('Error loading profile:', error)
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setIsSaving(true)
            await new Promise(resolve => setTimeout(resolve, 1000))
            setProfile(editedProfile)
            setIsEditing(false)
            setIsSaving(false)
        } catch (error) {
            console.error('Error saving profile:', error)
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-96 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        )
    }

    return (
        <div className={responsiveClasses.pageContainer}>
            {/* Header */}
            <div className={responsiveClasses.headerContainer}>
                <div>
                    <h1 className={responsiveClasses.headerTitle}>Coach Profile</h1>
                    <p className={responsiveClasses.headerSubtitle}>
                        Manage your coaching profile and credentials
                    </p>
                </div>
                <Button
                    onClick={() => {
                        if (isEditing) {
                            handleSave()
                        } else {
                            setIsEditing(true)
                            setEditedProfile(profile)
                        }
                    }}
                    disabled={isSaving}
                    className="w-full sm:w-auto"
                >
                    {isEditing ? (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </>
                    ) : (
                        <>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Profile
                        </>
                    )}
                </Button>
            </div>

            {/* Profile Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Profile */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                {isEditing ? (
                                    <Input
                                        value={editedProfile.name}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-gray-900 font-medium">{profile.name}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                {isEditing ? (
                                    <Input
                                        type="email"
                                        value={editedProfile.email}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-gray-900 font-medium">{profile.email}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                {isEditing ? (
                                    <Input
                                        value={editedProfile.phone}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-gray-900 font-medium">{profile.phone}</p>
                                )}
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location
                                </label>
                                {isEditing ? (
                                    <Input
                                        value={editedProfile.location}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-gray-900 font-medium">{profile.location}</p>
                                )}
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Professional Bio
                                </label>
                                {isEditing ? (
                                    <Textarea
                                        value={editedProfile.bio}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                                        className="min-h-24"
                                    />
                                ) : (
                                    <p className="text-gray-700">{profile.bio}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Stats Sidebar */}
                <div className="space-y-6">
                    {/* Rating */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="flex justify-center gap-1 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${i < Math.floor(profile.rating)
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{profile.rating}</p>
                                <p className="text-sm text-gray-600">Coach Rating</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats */}
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-600" />
                                    <span className="text-sm text-gray-600">Total Students</span>
                                </div>
                                <span className="font-bold text-gray-900">{profile.totalStudents}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-purple-600" />
                                    <span className="text-sm text-gray-600">Total Classes</span>
                                </div>
                                <span className="font-bold text-gray-900">{profile.totalClasses}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-green-600" />
                                    <span className="text-sm text-gray-600">Experience</span>
                                </div>
                                <span className="font-bold text-gray-900">{profile.experience}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Specializations & Certifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Specializations */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-600" />
                            Specializations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {profile.specializations.map((spec, index) => (
                                <Badge key={index} className="bg-blue-100 text-blue-800">
                                    {spec}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Certifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-green-600" />
                            Certifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {profile.certifications.map((cert, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-2 p-2 bg-green-50 rounded-lg"
                                >
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-gray-700">{cert}</span>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Goals & Objectives */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-600" />
                        Professional Goals
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[
                            'Improve student skill development by 15% this quarter',
                            'Achieve 95% student satisfaction rating',
                            'Complete advanced coaching certification',
                            'Mentor 2 junior coaches'
                        ].map((goal, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg"
                            >
                                <div className="w-5 h-5 rounded-full border-2 border-purple-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{goal}</span>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default CoachProfilePage
