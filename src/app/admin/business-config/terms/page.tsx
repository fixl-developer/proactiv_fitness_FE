'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Calendar, Plus, Edit, Trash2, Search, Sun, Umbrella, Loader2, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { validateName, validateRequired, filterNameInput, FORMAT_HINTS } from '@/utils/validation'
import { FormFieldHint } from '@/components/ui/FormFieldHint'

interface Term {
  id: string
  name: string
  startDate: string
  endDate: string
  createdAt?: string
}

interface Holiday {
  id: string
  name: string
  date: string
  type: string
  createdAt?: string
}

function getTermStatus(startDate: string, endDate: string): 'active' | 'upcoming' | 'past' {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (now >= start && now <= end) return 'active'
  if (now < start) return 'upcoming'
  return 'past'
}

function getWeeksBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffMs = end.getTime() - start.getTime()
  return Math.round(diffMs / (7 * 24 * 60 * 60 * 1000))
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function TermsHolidaysPage() {
  const [terms, setTerms] = useState<Term[]>([])
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Term form
  const [showTermForm, setShowTermForm] = useState(false)
  const [editingTerm, setEditingTerm] = useState<Term | null>(null)
  const [termForm, setTermForm] = useState({ name: '', startDate: '', endDate: '' })
  const [savingTerm, setSavingTerm] = useState(false)

  // Validation errors
  const [termErrors, setTermErrors] = useState<Record<string, string>>({})
  const [holidayErrors, setHolidayErrors] = useState<Record<string, string>>({})

  // Holiday form
  const [showHolidayForm, setShowHolidayForm] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null)
  const [holidayForm, setHolidayForm] = useState({ name: '', date: '', type: 'Public Holiday' })
  const [savingHoliday, setSavingHoliday] = useState(false)

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'term' | 'holiday'; id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [termsData, holidaysData] = await Promise.all([
        apiClient.get<any>('/terms'),
        apiClient.get<any>('/holiday-calendars'),
      ])
      setTerms(Array.isArray(termsData) ? termsData : termsData?.data || [])
      setHolidays(Array.isArray(holidaysData) ? holidaysData : holidaysData?.data || [])
    } catch (error: any) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load terms and holidays')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Term CRUD
  const openTermForm = (term?: Term) => {
    if (term) {
      setEditingTerm(term)
      setTermForm({
        name: term.name,
        startDate: term.startDate?.split('T')[0] || '',
        endDate: term.endDate?.split('T')[0] || '',
      })
    } else {
      setEditingTerm(null)
      setTermForm({ name: '', startDate: '', endDate: '' })
    }
    setTermErrors({})
    setShowTermForm(true)
  }

  const validateTermForm = (): boolean => {
    const errs: Record<string, string> = {}
    const nameErr = validateName(termForm.name, 'Term name')
    if (nameErr) errs.name = nameErr
    const startErr = validateRequired(termForm.startDate, 'Start date')
    if (startErr) errs.startDate = startErr
    const endErr = validateRequired(termForm.endDate, 'End date')
    if (endErr) errs.endDate = endErr
    if (termForm.startDate && termForm.endDate && new Date(termForm.startDate) >= new Date(termForm.endDate)) {
      errs.endDate = 'End date must be after start date'
    }
    setTermErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleTermSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateTermForm()) return
    setSavingTerm(true)
    try {
      if (editingTerm) {
        await apiClient.put(`/terms/${editingTerm.id}`, termForm)
        toast.success('Term updated successfully')
      } else {
        await apiClient.post('/terms', termForm)
        toast.success('Term created successfully')
      }
      setShowTermForm(false)
      setEditingTerm(null)
      loadData()
    } catch (error: any) {
      toast.error(editingTerm ? 'Failed to update term' : 'Failed to create term')
    } finally {
      setSavingTerm(false)
    }
  }

  // Holiday CRUD
  const openHolidayForm = (holiday?: Holiday) => {
    if (holiday) {
      setEditingHoliday(holiday)
      setHolidayForm({
        name: holiday.name,
        date: holiday.date?.split('T')[0] || '',
        type: holiday.type,
      })
    } else {
      setEditingHoliday(null)
      setHolidayForm({ name: '', date: '', type: 'Public Holiday' })
    }
    setHolidayErrors({})
    setShowHolidayForm(true)
  }

  const validateHolidayForm = (): boolean => {
    const errs: Record<string, string> = {}
    const nameErr = validateName(holidayForm.name, 'Holiday name')
    if (nameErr) errs.name = nameErr
    const dateErr = validateRequired(holidayForm.date, 'Date')
    if (dateErr) errs.date = dateErr
    setHolidayErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleHolidaySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateHolidayForm()) return
    setSavingHoliday(true)
    try {
      if (editingHoliday) {
        await apiClient.put(`/holiday-calendars/${editingHoliday.id}`, holidayForm)
        toast.success('Holiday updated successfully')
      } else {
        await apiClient.post('/holiday-calendars', holidayForm)
        toast.success('Holiday created successfully')
      }
      setShowHolidayForm(false)
      setEditingHoliday(null)
      loadData()
    } catch (error: any) {
      toast.error(editingHoliday ? 'Failed to update holiday' : 'Failed to create holiday')
    } finally {
      setSavingHoliday(false)
    }
  }

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      if (deleteTarget.type === 'term') {
        await apiClient.delete(`/terms/${deleteTarget.id}`)
        toast.success('Term deleted successfully')
      } else {
        await apiClient.delete(`/holiday-calendars/${deleteTarget.id}`)
        toast.success('Holiday deleted successfully')
      }
      setDeleteTarget(null)
      loadData()
    } catch (error: any) {
      toast.error(`Failed to delete ${deleteTarget.type}`)
    } finally {
      setDeleting(false)
    }
  }

  const activeTerms = terms.filter((t) => getTermStatus(t.startDate, t.endDate) === 'active')
  const upcomingTerms = terms.filter((t) => getTermStatus(t.startDate, t.endDate) === 'upcoming')
  const upcomingHolidays = holidays.filter((h) => new Date(h.date) >= new Date())

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'upcoming':
        return 'bg-blue-100 text-blue-800'
      case 'past':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Terms & Holidays</h1>
          <p className="text-gray-600 mt-2">Manage academic terms and holiday schedules</p>
        </div>
        <div className="flex gap-2">
          <Button id="btn-open-holiday-form-admin-business-config-terms" variant="outline" onClick={() => openHolidayForm()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Holiday
          </Button>
          <Button id="btn-open-term-form-admin-business-config-terms" onClick={() => openTermForm()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Term
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Terms', value: activeTerms.length.toString(), icon: Calendar, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
          { label: 'Upcoming Terms', value: upcomingTerms.length.toString(), icon: Sun, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100' },
          { label: 'Total Holidays', value: holidays.length.toString(), icon: Umbrella, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' },
          { label: 'Upcoming Holidays', value: upcomingHolidays.length.toString(), icon: Clock, gradient: 'from-orange-500 to-orange-600', bgGradient: 'from-orange-50 to-orange-100' },
        ].map((stat, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <div className={`rounded-lg border-0 bg-gradient-to-br ${stat.bgGradient} p-4 hover:shadow-lg transition-all`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`bg-gradient-to-br ${stat.gradient} p-2.5 rounded-lg shadow-md`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs text-gray-600 font-medium mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-500">Loading terms and holidays...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Terms Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Academic Terms
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {terms.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No terms found</p>
                  <Button id="admin-business-config-terms-add-term-empty-btn" className="mt-3" size="sm" onClick={() => openTermForm()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Term
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {terms.map((term, idx) => {
                    const status = getTermStatus(term.startDate, term.endDate)
                    const weeks = getWeeksBetween(term.startDate, term.endDate)
                    return (
                      <motion.div
                        key={term.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {weeks}w
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{term.name}</h4>
                            <p className="text-sm text-gray-600">
                              {formatDate(term.startDate)} to {formatDate(term.endDate)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={statusBadgeClass(status)}>{status}</Badge>
                          <Button id={`admin-business-config-terms-edit-term-${term.id}-btn`} variant="ghost" size="sm" onClick={() => openTermForm(term)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button id={`admin-business-config-terms-delete-term-${term.id}-btn`}
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => setDeleteTarget({ type: 'term', id: term.id, name: term.name })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Holidays Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Umbrella className="w-5 h-5 text-purple-600" />
                Holidays & Breaks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {holidays.length === 0 ? (
                <div className="text-center py-8">
                  <Umbrella className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No holidays found</p>
                  <Button id="admin-business-config-terms-add-holiday-empty-btn" className="mt-3" size="sm" onClick={() => openHolidayForm()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Holiday
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {holidays.map((holiday, idx) => {
                    const isPast = new Date(holiday.date) < new Date()
                    return (
                      <motion.div
                        key={holiday.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-4 rounded-lg hover:shadow-md transition-all ${
                          isPast
                            ? 'bg-gradient-to-r from-gray-50 to-gray-100 opacity-75'
                            : 'bg-gradient-to-r from-purple-50 to-pink-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{holiday.name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{holiday.type}</Badge>
                            {isPast && (
                              <Badge className="bg-gray-100 text-gray-600">Past</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{formatDate(holiday.date)}</p>
                        <div className="flex gap-2 mt-3">
                          <Button id={`admin-business-config-terms-edit-holiday-${holiday.id}-btn`} variant="outline" size="sm" className="flex-1" onClick={() => openHolidayForm(holiday)}>
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button id={`admin-business-config-terms-delete-holiday-${holiday.id}-btn`}
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            onClick={() => setDeleteTarget({ type: 'holiday', id: holiday.id, name: holiday.name })}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Term Form Dialog */}
      <Dialog open={showTermForm} onOpenChange={setShowTermForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTerm ? 'Edit Term' : 'Add Term'}</DialogTitle>
            <DialogDescription>
              {editingTerm ? 'Update the term details below.' : 'Fill in the details to create a new term.'}
            </DialogDescription>
          </DialogHeader>
          <form id="admin-business-config-terms-term-form" onSubmit={handleTermSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Term Name</label>
              <input id="admin-business-config-terms-term-name-input"
                type="text"
                value={termForm.name}
                onKeyDown={filterNameInput}
                onChange={(e) => {
                  setTermForm({ ...termForm, name: e.target.value })
                  const err = validateName(e.target.value, 'Term name')
                  setTermErrors((prev) => ({ ...prev, name: err || '' }))
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none ${termErrors.name ? 'border-red-500' : ''}`}
                placeholder="e.g. Spring Term 2025"
                required
              />
              <FormFieldHint hint={FORMAT_HINTS.name} error={termErrors.name} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input id="admin-business-config-terms-start-date-input"
                type="date"
                value={termForm.startDate}
                onChange={(e) => {
                  setTermForm({ ...termForm, startDate: e.target.value })
                  const err = validateRequired(e.target.value, 'Start date')
                  setTermErrors((prev) => ({ ...prev, startDate: err || '' }))
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none ${termErrors.startDate ? 'border-red-500' : ''}`}
                required
              />
              <FormFieldHint error={termErrors.startDate} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input id="admin-business-config-terms-end-date-input"
                type="date"
                value={termForm.endDate}
                onChange={(e) => {
                  setTermForm({ ...termForm, endDate: e.target.value })
                  const err = validateRequired(e.target.value, 'End date')
                  setTermErrors((prev) => ({ ...prev, endDate: err || '' }))
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none ${termErrors.endDate ? 'border-red-500' : ''}`}
                required
              />
              <FormFieldHint error={termErrors.endDate} />
            </div>
            <DialogFooter>
              <Button id="btn-set-show-term-form-admin-business-config-terms" type="button" variant="outline" onClick={() => setShowTermForm(false)}>
                Cancel
              </Button>
              <Button id="admin-business-config-terms-btn-3" type="submit" disabled={savingTerm}>
                {savingTerm && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingTerm ? 'Update Term' : 'Create Term'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Holiday Form Dialog */}
      <Dialog open={showHolidayForm} onOpenChange={setShowHolidayForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingHoliday ? 'Edit Holiday' : 'Add Holiday'}</DialogTitle>
            <DialogDescription>
              {editingHoliday ? 'Update the holiday details below.' : 'Fill in the details to create a new holiday.'}
            </DialogDescription>
          </DialogHeader>
          <form id="admin-business-config-terms-holiday-form" onSubmit={handleHolidaySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Holiday Name</label>
              <input id="admin-business-config-terms-holiday-name-input"
                type="text"
                value={holidayForm.name}
                onKeyDown={filterNameInput}
                onChange={(e) => {
                  setHolidayForm({ ...holidayForm, name: e.target.value })
                  const err = validateName(e.target.value, 'Holiday name')
                  setHolidayErrors((prev) => ({ ...prev, name: err || '' }))
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none ${holidayErrors.name ? 'border-red-500' : ''}`}
                placeholder="e.g. Chinese New Year"
                required
              />
              <FormFieldHint hint={FORMAT_HINTS.name} error={holidayErrors.name} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input id="admin-business-config-terms-holiday-date-input"
                type="date"
                value={holidayForm.date}
                onChange={(e) => {
                  setHolidayForm({ ...holidayForm, date: e.target.value })
                  const err = validateRequired(e.target.value, 'Date')
                  setHolidayErrors((prev) => ({ ...prev, date: err || '' }))
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none ${holidayErrors.date ? 'border-red-500' : ''}`}
                required
              />
              <FormFieldHint error={holidayErrors.date} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select id="select-admin-business-config-terms-16"
                value={holidayForm.type}
                onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="Public Holiday">Public Holiday</option>
                <option value="School Holiday">School Holiday</option>
                <option value="Company Holiday">Company Holiday</option>
                <option value="Observance">Observance</option>
              </select>
            </div>
            <DialogFooter>
              <Button id="btn-set-show-holiday-form-admin-business-config-terms" type="button" variant="outline" onClick={() => setShowHolidayForm(false)}>
                Cancel
              </Button>
              <Button id="admin-business-config-terms-btn-4" type="submit" disabled={savingHoliday}>
                {savingHoliday && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingHoliday ? 'Update Holiday' : 'Create Holiday'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button id="btn-set-delete-target-admin-business-config-terms" variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button id="btn-delete-admin-business-config-terms" variant="destructive" onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white">
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
