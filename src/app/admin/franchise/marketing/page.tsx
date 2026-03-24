'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    Megaphone, Plus, Edit2, Trash2, Eye, TrendingUp,
    Target, Search, BarChart3, CheckCircle, X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { FranchiseOwnerService } from '@/services/franchiseOwnerService'

type CampaignType = 'SEASONAL' | 'REFERRAL' | 'B2B' | 'SOCIAL'
type CampaignStatus = 'ACTIVE' | 'SCHEDULED' | 'COMPLETED'

interface Campaign {
    id: string
    name: string
    type: CampaignType
    status: CampaignStatus
    startDate: string
    endDate: string
    discount: number
    budget: number
    spent: number
    reach: number
    conversions: number
    roi: number
}

interface CampaignFormData {
    name: string
    type: CampaignType
    status: 'ACTIVE' | 'SCHEDULED'
    startDate: string
    endDate: string
    discount: number
    budget: number
}

const emptyCampaignForm: CampaignFormData = {
    name: '',
    type: 'SEASONAL',
    status: 'ACTIVE',
    startDate: '',
    endDate: '',
    discount: 0,
    budget: 0,
}

type ModalMode = 'create' | 'edit' | 'view' | null

export default function MarketingPromotionsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Modal state
    const [modalMode, setModalMode] = useState<ModalMode>(null)
    const [formData, setFormData] = useState<CampaignFormData>(emptyCampaignForm)
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchCampaigns = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const statusParam = filterStatus === 'all' ? undefined : filterStatus.toUpperCase()
            const response = await FranchiseOwnerService.getCampaigns(1, 50, statusParam)
            let items: Campaign[] = response.data || response || []
            if (searchTerm) {
                items = items.filter((c: Campaign) =>
                    c.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
            }
            setCampaigns(items)
        } catch (err: any) {
            setError(err.message || 'Failed to fetch campaigns')
        } finally {
            setIsLoading(false)
        }
    }, [searchTerm, filterStatus])

    useEffect(() => {
        fetchCampaigns()
    }, [fetchCampaigns])

    // Derived stats
    const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length
    const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0)
    const totalSpent = campaigns.reduce((sum, c) => sum + (c.spent || 0), 0)
    const totalConversions = campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0)
    const budgetSpentPct = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(0) : '0'

    // Chart data
    const performanceData = campaigns.map(c => ({
        name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
        reach: c.reach || 0,
        conversions: c.conversions || 0,
    }))

    // Modal handlers
    const openCreateModal = () => {
        setFormData(emptyCampaignForm)
        setSelectedCampaign(null)
        setModalMode('create')
    }

    const openViewModal = (campaign: Campaign) => {
        setSelectedCampaign(campaign)
        setModalMode('view')
    }

    const openEditModal = (campaign: Campaign) => {
        setSelectedCampaign(campaign)
        setFormData({
            name: campaign.name,
            type: campaign.type,
            status: campaign.status === 'COMPLETED' ? 'ACTIVE' : campaign.status,
            startDate: campaign.startDate,
            endDate: campaign.endDate,
            discount: campaign.discount,
            budget: campaign.budget,
        })
        setModalMode('edit')
    }

    const closeModal = () => {
        setModalMode(null)
        setSelectedCampaign(null)
        setFormData(emptyCampaignForm)
    }

    const handleFormChange = (field: keyof CampaignFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSave = async () => {
        try {
            setIsSaving(true)
            setError(null)
            if (modalMode === 'create') {
                await FranchiseOwnerService.createCampaign(formData)
            } else if (modalMode === 'edit' && selectedCampaign) {
                await FranchiseOwnerService.updateCampaign(selectedCampaign.id, formData)
            }
            closeModal()
            await fetchCampaigns()
        } catch (err: any) {
            setError(err.message || 'Failed to save campaign')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            setIsDeleting(true)
            setError(null)
            await FranchiseOwnerService.deleteCampaign(id)
            setDeleteConfirmId(null)
            await fetchCampaigns()
        } catch (err: any) {
            setError(err.message || 'Failed to delete campaign')
        } finally {
            setIsDeleting(false)
        }
    }

    // Summary card definitions
    const summaryCards = [
        {
            title: 'Active Campaigns',
            value: activeCampaigns.toString(),
            icon: Megaphone,
            gradientCard: 'bg-gradient-to-br from-blue-50 to-blue-100',
            gradientIcon: 'bg-gradient-to-br from-blue-500 to-blue-600',
        },
        {
            title: 'Total Budget',
            value: `$${(totalBudget / 1000).toFixed(1)}K`,
            icon: Target,
            gradientCard: 'bg-gradient-to-br from-green-50 to-green-100',
            gradientIcon: 'bg-gradient-to-br from-green-500 to-green-600',
        },
        {
            title: 'Total Conversions',
            value: totalConversions.toString(),
            icon: CheckCircle,
            gradientCard: 'bg-gradient-to-br from-purple-50 to-purple-100',
            gradientIcon: 'bg-gradient-to-br from-purple-500 to-purple-600',
        },
        {
            title: 'Budget Spent',
            value: `${budgetSpentPct}%`,
            icon: TrendingUp,
            gradientCard: 'bg-gradient-to-br from-orange-50 to-orange-100',
            gradientIcon: 'bg-gradient-to-br from-orange-500 to-orange-600',
        },
    ]

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Marketing & Promotions</h1>
                    <p className="text-gray-600 mt-1">Manage campaigns and promotions</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Campaign
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {summaryCards.map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className={`${metric.gradientCard} border-0`}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">{metric.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                                    </div>
                                    <div className={`${metric.gradientIcon} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Campaign Performance Chart */}
            {performanceData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            Campaign Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="reach" fill="#3b82f6" name="Reach" />
                                <Bar dataKey="conversions" fill="#10b981" name="Conversions" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Search & Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search campaigns..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            data-testid="select-admin-franchise-marketing-1"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Error display */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-4">
                        <p className="text-sm text-red-800">Error: {error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Empty state */}
            {campaigns.length === 0 && !error && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-lg">No campaigns found</p>
                        <p className="text-gray-400 text-sm mt-1">Create your first campaign to get started</p>
                    </CardContent>
                </Card>
            )}

            {/* Campaigns List */}
            <div className="space-y-4">
                {campaigns.map((campaign, idx) => (
                    <motion.div
                        key={campaign.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                                            <Badge variant={campaign.status === 'ACTIVE' ? 'default' : campaign.status === 'SCHEDULED' ? 'secondary' : 'outline'}>
                                                {campaign.status}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-gray-600">Type</p>
                                                <p className="text-sm font-medium text-gray-900">{campaign.type}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Discount</p>
                                                <p className="text-sm font-medium text-gray-900">{campaign.discount}%</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Reach</p>
                                                <p className="text-sm font-medium text-gray-900">{campaign.reach}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Conversions</p>
                                                <p className="text-sm font-medium text-gray-900">{campaign.conversions}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">ROI</p>
                                                <p className="text-sm font-medium text-green-600">{campaign.roi}%</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-gray-600">Budget</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-600"
                                                            style={{ width: `${campaign.budget > 0 ? (campaign.spent / campaign.budget) * 100 : 0}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-700">
                                                        ${campaign.spent}/${campaign.budget}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Duration</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {campaign.startDate} to {campaign.endDate}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openViewModal(campaign)}
                                            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                                            title="View"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => openEditModal(campaign)}
                                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirmId(campaign.id)}
                                            className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Campaign</h3>
                        <p className="text-gray-600 text-sm mb-6">
                            Are you sure you want to delete this campaign? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                disabled={isDeleting}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirmId)}
                                disabled={isDeleting}
                                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create / Edit / View Modal */}
            {modalMode && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {modalMode === 'create' && 'New Campaign'}
                                {modalMode === 'edit' && 'Edit Campaign'}
                                {modalMode === 'view' && 'Campaign Details'}
                            </h2>
                            <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {modalMode === 'view' && selectedCampaign ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
                                            <p className="text-sm font-medium text-gray-900 mt-1">{selectedCampaign.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Type</p>
                                            <p className="text-sm font-medium text-gray-900 mt-1">{selectedCampaign.type}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                                            <Badge variant={selectedCampaign.status === 'ACTIVE' ? 'default' : selectedCampaign.status === 'SCHEDULED' ? 'secondary' : 'outline'} className="mt-1">
                                                {selectedCampaign.status}
                                            </Badge>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Discount</p>
                                            <p className="text-sm font-medium text-gray-900 mt-1">{selectedCampaign.discount}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Start Date</p>
                                            <p className="text-sm font-medium text-gray-900 mt-1">{selectedCampaign.startDate}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">End Date</p>
                                            <p className="text-sm font-medium text-gray-900 mt-1">{selectedCampaign.endDate}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Budget</p>
                                            <p className="text-sm font-medium text-gray-900 mt-1">${selectedCampaign.budget}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Spent</p>
                                            <p className="text-sm font-medium text-gray-900 mt-1">${selectedCampaign.spent}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Reach</p>
                                            <p className="text-sm font-medium text-gray-900 mt-1">{selectedCampaign.reach}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Conversions</p>
                                            <p className="text-sm font-medium text-gray-900 mt-1">{selectedCampaign.conversions}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">ROI</p>
                                            <p className="text-sm font-medium text-green-600 mt-1">{selectedCampaign.roi}%</p>
                                        </div>
                                    </div>
                                    {/* Budget progress */}
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Budget Usage</p>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-600"
                                                style={{ width: `${selectedCampaign.budget > 0 ? (selectedCampaign.spent / selectedCampaign.budget) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            ${selectedCampaign.spent} of ${selectedCampaign.budget} ({selectedCampaign.budget > 0 ? ((selectedCampaign.spent / selectedCampaign.budget) * 100).toFixed(0) : 0}%)
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => handleFormChange('name', e.target.value)}
                                            placeholder="Enter campaign name"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => handleFormChange('type', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="SEASONAL">Seasonal</option>
                                                <option value="REFERRAL">Referral</option>
                                                <option value="B2B">B2B</option>
                                                <option value="SOCIAL">Social</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => handleFormChange('status', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="ACTIVE">Active</option>
                                                <option value="SCHEDULED">Scheduled</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                            <Input
                                                type="date"
                                                value={formData.startDate}
                                                onChange={(e) => handleFormChange('startDate', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                            <Input
                                                type="date"
                                                value={formData.endDate}
                                                onChange={(e) => handleFormChange('endDate', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={formData.discount}
                                                onChange={(e) => handleFormChange('discount', Number(e.target.value))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={formData.budget}
                                                onChange={(e) => handleFormChange('budget', Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                {modalMode === 'view' ? 'Close' : 'Cancel'}
                            </button>
                            {modalMode !== 'view' && (
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !formData.name}
                                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : modalMode === 'create' ? 'Create Campaign' : 'Update Campaign'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
