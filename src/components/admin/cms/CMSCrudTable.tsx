'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight, Eye, EyeOff, GripVertical, Save } from 'lucide-react'
import ImageUploader from './ImageUploader'

interface FieldConfig {
    name: string
    label: string
    type: 'text' | 'textarea' | 'number' | 'select' | 'boolean' | 'array' | 'image' | 'richtext'
    required?: boolean
    options?: { label: string; value: string }[]
    placeholder?: string
    width?: string
    showInTable?: boolean
}

interface CMSCrudTableProps {
    title: string
    description: string
    fields: FieldConfig[]
    service: {
        getAll: (params?: any) => Promise<any>
        getById: (id: string) => Promise<any>
        create: (data: any) => Promise<any>
        update: (id: string, data: any) => Promise<any>
        delete: (id: string) => Promise<any>
    }
    tableColumns?: string[]
}

export default function CMSCrudTable({ title, description, fields, service, tableColumns }: CMSCrudTableProps) {
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingItem, setEditingItem] = useState<any>(null)
    const [formData, setFormData] = useState<any>({})
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [saving, setSaving] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            const result = await service.getAll({ page, limit: 20, search })
            if (result?.data) {
                setItems(Array.isArray(result.data) ? result.data : result.data.data || [])
                if (result.data.pagination) {
                    setTotalPages(result.data.pagination.totalPages || 1)
                }
            }
        } catch (error) {
            console.error('Failed to load:', error)
        } finally {
            setLoading(false)
        }
    }, [page, search])

    useEffect(() => {
        loadData()
    }, [loadData])

    const openCreate = () => {
        setEditingItem(null)
        const defaults: any = {}
        fields.forEach(f => {
            if (f.type === 'boolean') defaults[f.name] = true
            else if (f.type === 'number') defaults[f.name] = 0
            else if (f.type === 'array') defaults[f.name] = []
            else defaults[f.name] = ''
        })
        setFormData(defaults)
        setShowModal(true)
    }

    const openEdit = async (item: any) => {
        setEditingItem(item)
        setFormData({ ...item })
        setShowModal(true)
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            if (editingItem) {
                await service.update(editingItem.id || editingItem._id, formData)
            } else {
                await service.create(formData)
            }
            setShowModal(false)
            loadData()
        } catch (error) {
            console.error('Save failed:', error)
            alert('Failed to save. Please check all required fields.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await service.delete(id)
            setDeleteConfirm(null)
            loadData()
        } catch (error) {
            console.error('Delete failed:', error)
        }
    }

    const handleFieldChange = (name: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [name]: value }))
    }

    const handleArrayChange = (name: string, index: number, value: string) => {
        const arr = [...(formData[name] || [])]
        arr[index] = value
        handleFieldChange(name, arr)
    }

    const addArrayItem = (name: string) => {
        handleFieldChange(name, [...(formData[name] || []), ''])
    }

    const removeArrayItem = (name: string, index: number) => {
        const arr = [...(formData[name] || [])]
        arr.splice(index, 1)
        handleFieldChange(name, arr)
    }

    const visibleColumns = tableColumns || fields.filter(f => f.showInTable !== false).slice(0, 5).map(f => f.name)

    const filteredItems = items.filter(item => {
        if (!search) return true
        return Object.values(item).some(val =>
            String(val).toLowerCase().includes(search.toLowerCase())
        )
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    <p className="text-gray-500 text-sm mt-1">{description}</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow"
                >
                    <Plus className="w-5 h-5" />
                    Add New
                </motion.button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-gray-500">Loading...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-4xl mb-4">📭</div>
                        <p className="text-gray-500 font-medium">No items found</p>
                        <p className="text-gray-400 text-sm mt-1">Click "Add New" to create one</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
                                    {visibleColumns.map(col => (
                                        <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            {fields.find(f => f.name === col)?.label || col}
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredItems.map((item, idx) => (
                                    <motion.tr
                                        key={item.id || item._id || idx}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-400">{(page - 1) * 20 + idx + 1}</td>
                                        {visibleColumns.map(col => (
                                            <td key={col} className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate">
                                                {col === 'image' || col === 'logo' ? (
                                                    item[col] ? (
                                                        <img src={item[col]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">N/A</div>
                                                    )
                                                ) : Array.isArray(item[col]) ? (
                                                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{item[col].length} items</span>
                                                ) : typeof item[col] === 'boolean' ? (
                                                    item[col] ? <span className="text-green-600 text-xs font-medium">Yes</span> : <span className="text-red-600 text-xs font-medium">No</span>
                                                ) : (
                                                    String(item[col] || '—').slice(0, 60)
                                                )}
                                            </td>
                                        ))}
                                        <td className="px-4 py-3">
                                            {item.isActive !== undefined && (
                                                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${item.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                    {item.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                                    {item.isActive ? 'Active' : 'Hidden'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(item)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                {deleteConfirm === (item.id || item._id) ? (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleDelete(item.id || item._id)}
                                                            className="px-2 py-1 bg-red-600 text-white text-xs rounded font-medium"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(null)}
                                                            className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded font-medium"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirm(item.id || item._id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
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
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                        <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-white transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-white transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mb-10"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900">
                                    {editingItem ? 'Edit Item' : 'Create New Item'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto space-y-4">
                                {fields.map(field => (
                                    <div key={field.name}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            {field.label}
                                            {field.required && <span className="text-red-500 ml-1">*</span>}
                                        </label>

                                        {field.type === 'image' ? (
                                            <ImageUploader
                                                value={formData[field.name] || ''}
                                                onChange={(url) => handleFieldChange(field.name, url)}
                                                folder={title.toLowerCase().replace(/\s+/g, '-')}
                                                label=""
                                            />
                                        ) : field.type === 'text' ? (
                                            <input
                                                type="text"
                                                value={formData[field.name] || ''}
                                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                                            />
                                        ) : field.type === 'textarea' || field.type === 'richtext' ? (
                                            <textarea
                                                value={formData[field.name] || ''}
                                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                                rows={field.type === 'richtext' ? 8 : 3}
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-y"
                                            />
                                        ) : field.type === 'number' ? (
                                            <input
                                                type="number"
                                                value={formData[field.name] ?? ''}
                                                onChange={(e) => handleFieldChange(field.name, Number(e.target.value))}
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                                            />
                                        ) : field.type === 'select' ? (
                                            <select
                                                value={formData[field.name] || ''}
                                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                                            >
                                                <option value="">Select {field.label}</option>
                                                {field.options?.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        ) : field.type === 'boolean' ? (
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData[field.name] ?? false}
                                                        onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-11 h-6 rounded-full transition-colors ${formData[field.name] ? 'bg-blue-600' : 'bg-gray-200'}`}>
                                                        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform mt-0.5 ${formData[field.name] ? 'translate-x-5.5 ml-[22px]' : 'translate-x-0.5 ml-0.5'}`} />
                                                    </div>
                                                </div>
                                                <span className="text-sm text-gray-600">{formData[field.name] ? 'Enabled' : 'Disabled'}</span>
                                            </label>
                                        ) : field.type === 'array' ? (
                                            <div className="space-y-2">
                                                {(formData[field.name] || []).map((item: string, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <GripVertical className="w-4 h-4 text-gray-300" />
                                                        <input
                                                            type="text"
                                                            value={item}
                                                            onChange={(e) => handleArrayChange(field.name, idx, e.target.value)}
                                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                                                            placeholder={`Item ${idx + 1}`}
                                                        />
                                                        <button
                                                            onClick={() => removeArrayItem(field.name, idx)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => addArrayItem(field.name)}
                                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    <Plus className="w-4 h-4" /> Add Item
                                                </button>
                                            </div>
                                        ) : null}

                                        {/* ImageUploader already includes preview */}
                                    </div>
                                ))}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? 'Saving...' : editingItem ? 'Update' : 'Create'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
