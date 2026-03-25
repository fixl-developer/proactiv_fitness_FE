'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LeadGenerationService, { Lead } from '@/services/modules/lead-generation.service'
import { motion } from 'framer-motion'
import { Users, Plus, Mail, Phone, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function LeadsPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [leads, setLeads] = useState<Lead[]>([])
    const [total, setTotal] = useState(0)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadLeads()
    }, [isAuthenticated, router])

    const loadLeads = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await LeadGenerationService.getLeads()
            setLeads(response.leads)
            setTotal(response.total)
        } catch (err) {
            console.error('Error loading leads:', err)
            setError('Failed to load leads')
        } finally {
            setLoading(false)
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading leads...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Leads</h1>
                        <p className="text-gray-600">Manage and track leads</p>
                    </div>
                    <Button id="marketing-leads-btn" className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Lead
                    </Button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <div className="space-y-4">
                    {leads.map((lead, idx) => (
                        <motion.div
                            key={lead.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <Users className="w-10 h-10 text-blue-600" />
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold">{lead.name}</h3>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="w-4 h-4" />
                                                        {lead.email}
                                                    </span>
                                                    {lead.phone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="w-4 h-4" />
                                                            {lead.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Score</p>
                                                <p className="text-2xl font-bold text-blue-600">{lead.score}</p>
                                            </div>
                                            <Badge className={`${lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                                                    lead.status === 'qualified' ? 'bg-blue-100 text-blue-800' :
                                                        lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }`}>
                                                {lead.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {leads.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No leads yet</p>
                    </div>
                )}
            </div>
        </div>
    )
}
