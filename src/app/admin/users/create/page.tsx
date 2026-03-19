'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Mail, Phone, Shield, Building2, MapPin, Save, X, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

export default function CreateUserPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'USER',
    location: '',
    franchise: '',
    status: 'ACTIVE'
  })

  const roles = [
    { value: 'ADMIN', label: 'Admin', color: 'bg-red-100 text-red-800' },
    { value: 'REGIONAL_ADMIN', label: 'Regional Admin', color: 'bg-purple-100 text-purple-800' },
    { value: 'FRANCHISE_OWNER', label: 'Franchise Owner', color: 'bg-blue-100 text-blue-800' },
    { value: 'LOCATION_MANAGER', label: 'Location Manager', color: 'bg-green-100 text-green-800' },
    { value: 'COACH', label: 'Coach', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'SUPPORT_STAFF', label: 'Support Staff', color: 'bg-orange-100 text-orange-800' },
    { value: 'PARTNER_ADMIN', label: 'Partner Admin', color: 'bg-pink-100 text-pink-800' },
    { value: 'PARENT', label: 'Parent', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'USER', label: 'User', color: 'bg-gray-100 text-gray-800' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    router.push('/admin/users')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
          <p className="text-gray-600 mt-2">Add a new user to the system</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      {/* Info Alert */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg"
      >
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="font-semibold text-blue-900">Important Information</h4>
          <p className="text-sm text-blue-700 mt-1">
            A temporary password will be generated and sent to the user's email address.
            They will be required to change it on first login.
          </p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <CardTitle>Personal Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Enter last name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="+852 1234 5678"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role & Permissions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <CardTitle>Role & Permissions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Select Role <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: role.value })}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${formData.role === role.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <Badge className={role.color}>{role.label}</Badge>
                      <p className="text-xs text-gray-600 mt-2">
                        {role.value === 'ADMIN' && 'Full system access'}
                        {role.value === 'REGIONAL_ADMIN' && 'Regional management'}
                        {role.value === 'FRANCHISE_OWNER' && 'Franchise operations'}
                        {role.value === 'LOCATION_MANAGER' && 'Location management'}
                        {role.value === 'COACH' && 'Class instruction'}
                        {role.value === 'SUPPORT_STAFF' && 'Customer support'}
                        {role.value === 'PARTNER_ADMIN' && 'Partner portal'}
                        {role.value === 'PARENT' && 'Parent dashboard'}
                        {role.value === 'USER' && 'Student access'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignment */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-green-600" />
              <CardTitle>Assignment</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Franchise
                </label>
                <select
                  value={formData.franchise}
                  onChange={(e) => setFormData({ ...formData, franchise: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="">Select Franchise</option>
                  <option value="franchise-1">Cyberport Franchise</option>
                  <option value="franchise-2">Wan Chai Franchise</option>
                  <option value="franchise-3">Causeway Bay Franchise</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="">Select Location</option>
                  <option value="location-1">Cyberport Studio A</option>
                  <option value="location-2">Wan Chai Studio B</option>
                  <option value="location-3">Causeway Bay Studio C</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[150px]"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create User
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
