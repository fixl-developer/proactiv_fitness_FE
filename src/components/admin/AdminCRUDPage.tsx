'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SlideInDrawer } from '@/components/ui/SlideInDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export interface AdminCRUDColumn {
    key: string;
    label: string;
    render?: (value: any, item: any) => React.ReactNode;
    sortable?: boolean;
    width?: string;
}

export interface AdminCRUDPageProps {
    title: string;
    description: string;
    columns: AdminCRUDColumn[];
    service: {
        getAll: (params?: any) => Promise<any>;
        getById?: (id: string) => Promise<any>;
        create: (data: any) => Promise<any>;
        update: (id: string, data: any) => Promise<any>;
        delete: (id: string) => Promise<any>;
    };
    renderForm: (props: {
        data: Record<string, any>;
        onChange: (field: string, value: any) => void;
        errors: Record<string, string>;
        isSubmitting: boolean;
    }) => React.ReactNode;
    onFormSubmit?: (data: Record<string, any>, isEdit: boolean) => Promise<any>;
    pageSize?: number;
}

export const AdminCRUDPage: React.FC<AdminCRUDPageProps> = ({
    title,
    description,
    columns,
    service,
    renderForm,
    onFormSubmit,
    pageSize = 20,
}) => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete confirmation
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Load data
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const result = await service.getAll({
                page,
                limit: pageSize,
                search: search || undefined,
            });

            const payload = result?.data || result;

            if (Array.isArray(payload)) {
                setItems(payload);
                setTotalPages(1);
                setTotalItems(payload.length);
            } else if (payload?.data && Array.isArray(payload.data)) {
                setItems(payload.data);
                setTotalPages(payload.pagination?.totalPages || 1);
                setTotalItems(payload.pagination?.total || payload.data.length);
            } else {
                setItems([]);
                setTotalPages(1);
                setTotalItems(0);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('Failed to load data');
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [page, search, pageSize, service]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Handle search
    const handleSearch = useCallback((value: string) => {
        setSearch(value);
        setPage(1);
    }, []);

    // Open create form
    const openCreateForm = useCallback(() => {
        setEditingItem(null);
        setFormData({});
        setFormErrors({});
        setShowForm(true);
    }, []);

    // Open edit form
    const openEditForm = useCallback((item: any) => {
        setEditingItem(item);
        setFormData({ ...item });
        setFormErrors({});
        setShowForm(true);
    }, []);

    // Close form
    const closeForm = useCallback(() => {
        setShowForm(false);
        setEditingItem(null);
        setFormData({});
        setFormErrors({});
    }, []);

    // Handle form field change
    const handleFormChange = useCallback((field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        // Clear error for this field
        if (formErrors[field]) {
            setFormErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    }, [formErrors]);

    // Handle form submit
    const handleFormSubmit = useCallback(async () => {
        try {
            setIsSubmitting(true);
            setFormErrors({});

            let result;
            if (editingItem) {
                result = await service.update(editingItem.id || editingItem._id, formData);
                toast.success('Item updated successfully');
            } else {
                result = await service.create(formData);
                toast.success('Item created successfully');
            }

            // Call custom submit handler if provided
            if (onFormSubmit) {
                await onFormSubmit(formData, !!editingItem);
            }

            closeForm();
            loadData();
        } catch (error: any) {
            console.error('Form submission error:', error);

            // Handle server validation errors
            if (error?.response?.data?.errors) {
                const errors: Record<string, string> = {};
                const serverErrors = error.response.data.errors;

                if (Array.isArray(serverErrors)) {
                    serverErrors.forEach((err: any) => {
                        const field = err.path || err.param || err.field;
                        const message = err.msg || err.message;
                        if (field && message) {
                            errors[field] = message;
                        }
                    });
                } else if (typeof serverErrors === 'object') {
                    Object.entries(serverErrors).forEach(([field, message]) => {
                        errors[field] = String(message);
                    });
                }

                if (Object.keys(errors).length > 0) {
                    setFormErrors(errors);
                    toast.error('Please fix the highlighted fields');
                    return;
                }
            }

            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to save item';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }, [editingItem, formData, service, onFormSubmit, closeForm, loadData]);

    // Handle delete
    const handleDelete = useCallback(async (id: string) => {
        try {
            setIsDeleting(true);
            await service.delete(id);
            setDeleteConfirm(null);
            toast.success('Item deleted successfully');
            loadData();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete item');
        } finally {
            setIsDeleting(false);
        }
    }, [service, loadData]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    <p className="text-gray-500 text-sm mt-1">{description}</p>
                </div>
                <Button
                    onClick={openCreateForm}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
                >
                    <Plus className="w-5 h-5" />
                    Add New
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                        <p className="text-gray-500">Loading...</p>
                    </div>
                ) : items.length === 0 ? (
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
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">
                                        #
                                    </th>
                                    {columns.map((col) => (
                                        <th
                                            key={col.key}
                                            className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                            style={{ width: col.width }}
                                        >
                                            {col.label}
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.map((item, idx) => (
                                    <motion.tr
                                        key={item.id || item._id || idx}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-400">
                                            {(page - 1) * pageSize + idx + 1}
                                        </td>
                                        {columns.map((col) => (
                                            <td
                                                key={col.key}
                                                className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate"
                                            >
                                                {col.render
                                                    ? col.render(item[col.key], item)
                                                    : String(item[col.key] || '—')}
                                            </td>
                                        ))}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditForm(item)}
                                                    className="h-8 w-8"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                {deleteConfirm === (item.id || item._id) ? (
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() =>
                                                                handleDelete(item.id || item._id)
                                                            }
                                                            disabled={isDeleting}
                                                        >
                                                            Confirm
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setDeleteConfirm(null)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            setDeleteConfirm(item.id || item._id)
                                                        }
                                                        className="h-8 w-8 text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Form Drawer */}
            <SlideInDrawer
                isOpen={showForm}
                onClose={closeForm}
                title={editingItem ? 'Edit Item' : 'Create New Item'}
                size="lg"
            >
                <div className="space-y-4">
                    {renderForm({
                        data: formData,
                        onChange: handleFormChange,
                        errors: formErrors,
                        isSubmitting,
                    })}

                    <div className="flex gap-2 pt-4 border-t">
                        <Button
                            onClick={handleFormSubmit}
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save'
                            )}
                        </Button>
                        <Button
                            onClick={closeForm}
                            variant="outline"
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </SlideInDrawer>
        </div>
    );
};

export default AdminCRUDPage;
