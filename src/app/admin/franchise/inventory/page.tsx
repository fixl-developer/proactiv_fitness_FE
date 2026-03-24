'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    Package, Plus, Edit2, Trash2, Eye, AlertTriangle, CheckCircle,
    TrendingDown, Zap, Search, Filter, Download, X, ChevronLeft, ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FranchiseOwnerService } from '@/services/franchiseOwnerService'

interface InventoryItem {
    id: string
    name: string
    category: string
    quantity: number
    minStock: number
    maxStock: number
    unitCost: number
    totalValue: number
    status: string
    lastRestocked?: string
    supplier?: string
}

interface FormData {
    name: string
    category: string
    quantity: number | string
    minStock: number | string
    maxStock: number | string
    unitCost: number | string
    supplier: string
}

const emptyForm: FormData = {
    name: '',
    category: '',
    quantity: '',
    minStock: '',
    maxStock: '',
    unitCost: '',
    supplier: '',
}

export default function InventoryManagementPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCategory, setFilterCategory] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [inventory, setInventory] = useState<InventoryItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const pageSize = 10

    // Modal states
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | null>(null)
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
    const [formData, setFormData] = useState<FormData>(emptyForm)
    const [isSaving, setIsSaving] = useState(false)
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchInventory = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const categoryParam = filterCategory === 'all' ? undefined : filterCategory
            const statusParam = filterStatus === 'all' ? undefined : filterStatus
            const searchParam = searchTerm.trim() || undefined
            const res = await FranchiseOwnerService.getInventory(page, pageSize, searchParam, categoryParam, statusParam)
            setInventory(res.data || [])
            setTotalPages(res.totalPages || 1)
            setTotal(res.total || 0)
        } catch (err: any) {
            setError(err.message || 'Failed to fetch inventory')
            setInventory([])
        } finally {
            setIsLoading(false)
        }
    }, [page, pageSize, searchTerm, filterCategory, filterStatus])

    useEffect(() => {
        fetchInventory()
    }, [fetchInventory])

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1)
    }, [searchTerm, filterCategory, filterStatus])

    // Computed values
    const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.totalValue || item.quantity * item.unitCost || 0), 0)
    const lowStockItems = inventory.filter(i => i.quantity <= i.minStock)
    const criticalItems = inventory.filter(i => i.status === 'CRITICAL')

    // Modal handlers
    const openAddModal = () => {
        setFormData(emptyForm)
        setSelectedItem(null)
        setModalMode('add')
    }

    const openViewModal = (item: InventoryItem) => {
        setSelectedItem(item)
        setModalMode('view')
    }

    const openEditModal = (item: InventoryItem) => {
        setSelectedItem(item)
        setFormData({
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            minStock: item.minStock,
            maxStock: item.maxStock,
            unitCost: item.unitCost,
            supplier: item.supplier || '',
        })
        setModalMode('edit')
    }

    const closeModal = () => {
        setModalMode(null)
        setSelectedItem(null)
        setFormData(emptyForm)
    }

    const handleFormChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSave = async () => {
        try {
            setIsSaving(true)
            const payload = {
                name: formData.name,
                category: formData.category,
                quantity: Number(formData.quantity),
                minStock: Number(formData.minStock),
                maxStock: Number(formData.maxStock),
                unitCost: Number(formData.unitCost),
                supplier: formData.supplier,
            }

            if (modalMode === 'add') {
                await FranchiseOwnerService.createInventoryItem(payload)
            } else if (modalMode === 'edit' && selectedItem) {
                await FranchiseOwnerService.updateInventoryItem(selectedItem.id, payload)
            }

            closeModal()
            fetchInventory()
        } catch (err: any) {
            setError(err.message || 'Failed to save item')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            setIsDeleting(true)
            await FranchiseOwnerService.deleteInventoryItem(id)
            setDeleteConfirmId(null)
            fetchInventory()
        } catch (err: any) {
            setError(err.message || 'Failed to delete item')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleExport = () => {
        if (inventory.length === 0) return
        const headers = ['Name', 'Category', 'Quantity', 'Min Stock', 'Max Stock', 'Unit Cost', 'Total Value', 'Status', 'Supplier', 'Last Restocked']
        const rows = inventory.map(item => [
            `"${item.name}"`,
            `"${item.category}"`,
            item.quantity,
            item.minStock,
            item.maxStock,
            item.unitCost,
            item.totalValue || item.quantity * item.unitCost,
            `"${item.status}"`,
            `"${item.supplier || ''}"`,
            `"${item.lastRestocked || ''}"`,
        ].join(','))
        const csv = [headers.join(','), ...rows].join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'OPTIMAL': return 'default'
            case 'LOW': return 'secondary'
            case 'CRITICAL': return 'destructive'
            default: return 'outline'
        }
    }

    const categories = ['all', ...new Set(inventory.map(i => i.category).filter(Boolean))]

    if (isLoading && inventory.length === 0) {
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
                    <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                    <p className="text-gray-600 mt-1">Track equipment and supplies</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Item
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        Export
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    {
                        title: 'Total Items',
                        value: total.toString(),
                        icon: Package,
                        gradient: 'from-blue-50 to-blue-100',
                        iconGradient: 'from-blue-500 to-blue-600',
                    },
                    {
                        title: 'Inventory Value',
                        value: `$${totalInventoryValue >= 1000 ? (totalInventoryValue / 1000).toFixed(1) + 'K' : totalInventoryValue.toFixed(0)}`,
                        icon: Zap,
                        gradient: 'from-green-50 to-green-100',
                        iconGradient: 'from-green-500 to-green-600',
                    },
                    {
                        title: 'Low Stock',
                        value: lowStockItems.length.toString(),
                        icon: TrendingDown,
                        gradient: 'from-orange-50 to-orange-100',
                        iconGradient: 'from-orange-500 to-orange-600',
                    },
                    {
                        title: 'Critical',
                        value: criticalItems.length.toString(),
                        icon: AlertTriangle,
                        gradient: 'from-red-50 to-pink-100',
                        iconGradient: 'from-red-500 to-pink-600',
                    },
                ].map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className={`bg-gradient-to-br ${metric.gradient} border-0`}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">{metric.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                                    </div>
                                    <div className={`bg-gradient-to-br ${metric.iconGradient} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Search & Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search inventory..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            data-testid="select-admin-franchise-inventory-1"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'All Categories' : cat}
                                </option>
                            ))}
                        </select>
                        <select
                            data-testid="select-admin-franchise-inventory-2"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="optimal">Optimal</option>
                            <option value="low">Low Stock</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Error display */}
            {error && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-yellow-800">Warning: {error}</p>
                            <button onClick={() => setError(null)} className="text-yellow-600 hover:text-yellow-800">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Inventory Table */}
            <Card>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : inventory.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No inventory items found</p>
                            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Item Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Unit Cost</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Value</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventory.map((item, idx) => (
                                        <motion.tr
                                            key={item.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="py-3 px-4">
                                                <p className="font-medium text-gray-900">{item.name}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline">{item.category}</Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">{item.quantity}</span>
                                                    <span className="text-xs text-gray-600">
                                                        ({item.minStock}-{item.maxStock})
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="text-gray-600">${item.unitCost}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="font-medium text-gray-900">
                                                    ${item.totalValue || item.quantity * item.unitCost}
                                                </p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant={getStatusBadgeVariant(item.status) as any}>
                                                    {item.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openViewModal(item)}
                                                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                                                        title="View details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
                                                        title="Edit item"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirmId(item.id)}
                                                        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                                        title="Delete item"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                Page {page} of {totalPages} ({total} total items)
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum: number
                                    if (totalPages <= 5) {
                                        pageNum = i + 1
                                    } else if (page <= 3) {
                                        pageNum = i + 1
                                    } else if (page >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i
                                    } else {
                                        pageNum = page - 2 + i
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                                page === pageNum
                                                    ? 'bg-blue-600 text-white'
                                                    : 'border border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    )
                                })}
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Low Stock Alert Banner */}
            {lowStockItems.length > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-orange-900">Low Stock Alert</p>
                                <p className="text-xs text-orange-700 mt-1">
                                    {lowStockItems.length} item(s) are below minimum stock level: {lowStockItems.map(i => i.name).join(', ')}. Please reorder soon.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDeleteConfirmId(null)}>
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-red-100 p-2 rounded-lg">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Delete Item</h3>
                        </div>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this inventory item? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirmId)}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add / Edit / View Modal */}
            {modalMode && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeModal}>
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {modalMode === 'add' && 'Add New Item'}
                                {modalMode === 'edit' && 'Edit Item'}
                                {modalMode === 'view' && 'Item Details'}
                            </h3>
                            <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {modalMode === 'view' && selectedItem ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-medium text-gray-900">{selectedItem.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Category</p>
                                        <p className="font-medium text-gray-900">{selectedItem.category}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Quantity</p>
                                        <p className="font-medium text-gray-900">{selectedItem.quantity}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <Badge variant={getStatusBadgeVariant(selectedItem.status) as any}>
                                            {selectedItem.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Min Stock</p>
                                        <p className="font-medium text-gray-900">{selectedItem.minStock}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Max Stock</p>
                                        <p className="font-medium text-gray-900">{selectedItem.maxStock}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Unit Cost</p>
                                        <p className="font-medium text-gray-900">${selectedItem.unitCost}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Value</p>
                                        <p className="font-medium text-gray-900">
                                            ${selectedItem.totalValue || selectedItem.quantity * selectedItem.unitCost}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Supplier</p>
                                        <p className="font-medium text-gray-900">{selectedItem.supplier || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Last Restocked</p>
                                        <p className="font-medium text-gray-900">{selectedItem.lastRestocked || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4 border-t">
                                    <button
                                        onClick={closeModal}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => handleFormChange('name', e.target.value)}
                                        placeholder="Item name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <Input
                                        value={formData.category}
                                        onChange={e => handleFormChange('category', e.target.value)}
                                        placeholder="e.g. Equipment, Supplies, Safety, Apparel"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                        <Input
                                            type="number"
                                            value={formData.quantity}
                                            onChange={e => handleFormChange('quantity', e.target.value)}
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost ($)</label>
                                        <Input
                                            type="number"
                                            value={formData.unitCost}
                                            onChange={e => handleFormChange('unitCost', e.target.value)}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock</label>
                                        <Input
                                            type="number"
                                            value={formData.minStock}
                                            onChange={e => handleFormChange('minStock', e.target.value)}
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Stock</label>
                                        <Input
                                            type="number"
                                            value={formData.maxStock}
                                            onChange={e => handleFormChange('maxStock', e.target.value)}
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                                    <Input
                                        value={formData.supplier}
                                        onChange={e => handleFormChange('supplier', e.target.value)}
                                        placeholder="Supplier name"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button
                                        onClick={closeModal}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving || !formData.name || !formData.category}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving...' : modalMode === 'add' ? 'Add Item' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
