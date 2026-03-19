'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserPlus, Mail, Phone, Lock, Eye, EyeOff, ChevronDown,
  CheckCircle2, AlertCircle, Loader2, ArrowLeft, Shield, MapPin
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const ROLES = [
  { value: 'HQ_ADMIN', label: 'HQ Admin', color: 'bg-red-100 text-red-800' },
  { value: 'REGIONAL_ADMIN', label: 'Regional Admin', color: 'bg-orange-100 text-orange-800' },
  { value: 'FRANCHISE_OWNER', label: 'Franchise Owner', color: 'bg-amber-100 text-amber-800' },
  { value: 'LOCATION_MANAGER', label: 'Location Manager', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'COACH', label: 'Coach', color: 'bg-green-100 text-green-800' },
  { value: 'PARENT', label: 'Parent', color: 'bg-blue-100 text-blue-800' },
  { value: 'USER', label: 'User', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'PARTNER_ADMIN', label: 'Partner Admin', color: 'bg-purple-100 text-purple-800' },
  { value: 'SUPPORT_STAFF', label: 'Support Staff', color: 'bg-pink-100 text-pink-800' },
]

const LOCATIONS = [
  { value: 'cyberport', label: 'ProGym Cyberport' },
  { value: 'wanchai', label: 'ProGym Wan Chai' },
  { value: 'central', label: 'ProGym Central' },
  { value: 'tst', label: 'ProGym Tsim Sha Tsui' },
]

interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  role: string
  status: boolean
  location: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  phone?: string
  role?: string
  location?: string
}

export default function CreateUserPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: '',
    status: true,
    location: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    if (formData.phone && !/^\+?[\d\s-()]{7,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    if (!formData.role) newErrors.role = 'Please select a role'
    if (!formData.location) newErrors.location = 'Please assign a location'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const success = Math.random() > 0.2
    if (success) {
      setToast({ type: 'success', message: `User ${formData.firstName} ${formData.lastName} created successfully!` })
      setFormData({ firstName: '', lastName: '', email: '', password: '', phone: '', role: '', status: true, location: '' })
      setErrors({})
    } else {
      setToast({ type: 'error', message: 'Failed to create user. Email may already be in use.' })
    }
    setIsSubmitting(false)
    setTimeout(() => setToast(null), 4000)
  }

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const selectedRole = ROLES.find((r) => r.value === formData.role)
  const selectedLocation = LOCATIONS.find((l) => l.value === formData.location)

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New User</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add a new user to the system</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="user@proactivfitness.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                {formData.password && (
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full ${
                          formData.password.length >= level * 3
                            ? level <= 1 ? 'bg-red-400' : level <= 2 ? 'bg-orange-400' : level <= 3 ? 'bg-yellow-400' : 'bg-green-400'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+852 1234 5678"
                  />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Role & Access */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" /> Role & Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role *</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setRoleDropdownOpen(!roleDropdownOpen); setLocationDropdownOpen(false) }}
                    className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                      errors.role ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {selectedRole ? (
                      <Badge className={selectedRole.color}>{selectedRole.label}</Badge>
                    ) : (
                      <span className="text-gray-400">Select a role</span>
                    )}
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {roleDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      >
                        {ROLES.map((role) => (
                          <button
                            key={role.value}
                            type="button"
                            onClick={() => { updateField('role', role.value); setRoleDropdownOpen(false) }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                          >
                            <Badge className={role.color}>{role.label}</Badge>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location Assignment *</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setLocationDropdownOpen(!locationDropdownOpen); setRoleDropdownOpen(false) }}
                    className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {selectedLocation ? (
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-500" /> {selectedLocation.label}
                      </span>
                    ) : (
                      <span className="text-gray-400">Select a location</span>
                    )}
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${locationDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {locationDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
                      >
                        {LOCATIONS.map((loc) => (
                          <button
                            key={loc.value}
                            type="button"
                            onClick={() => { updateField('location', loc.value); setLocationDropdownOpen(false) }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                          >
                            <MapPin className="h-4 w-4 text-gray-400" /> {loc.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Status</p>
                  <p className="text-xs text-gray-500">User can log in when active</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('status', !formData.status)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.status ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <motion.div
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
                    animate={{ left: formData.status ? '26px' : '2px' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
                <Badge className={formData.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {formData.status ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" /> Create User
                </span>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
