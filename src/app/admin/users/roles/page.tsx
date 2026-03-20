'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Shield, Users, Edit, Trash2, Plus, Search,
    CheckCircle, Settings, Eye, ChevronDown, ChevronRight,
    Copy, Power, X as XIcon
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'

const PermissionsMatrix = dynamic(() => import('../permissions/page'), {
    loading: () => <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
})

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'proactiv_role_permissions'

const SYSTEM_ROLES = [
    'ADMIN', 'REGIONAL_ADMIN', 'FRANCHISE_OWNER', 'LOCATION_MANAGER',
    'COACH', 'PARENT', 'USER', 'PARTNER_ADMIN', 'SUPPORT_STAFF'
] as const

type SystemRole = typeof SYSTEM_ROLES[number]

interface RoleConfig {
    id: string
    name: string
    displayName: string
    description: string
    permissions: string[]
    status: 'active' | 'inactive'
    isCustom: boolean
    baseRole?: string
}

interface PermissionDef {
    key: string
    label: string
    description: string
}

interface PermissionCategory {
    name: string
    permissions: PermissionDef[]
}

const ROLE_META: Record<SystemRole, { displayName: string; description: string; color: string; barColor: string }> = {
    ADMIN: { displayName: 'Super Admin', description: 'Full system access with all permissions', color: 'bg-gray-100 text-gray-800 border-gray-300', barColor: 'bg-gray-500' },
    REGIONAL_ADMIN: { displayName: 'Regional Admin', description: 'Manage multiple franchises in a region', color: 'bg-gray-100 text-gray-800 border-gray-300', barColor: 'bg-gray-500' },
    FRANCHISE_OWNER: { displayName: 'Franchise Owner', description: 'Manage franchise operations and staff', color: 'bg-gray-100 text-gray-800 border-gray-300', barColor: 'bg-gray-500' },
    LOCATION_MANAGER: { displayName: 'Location Manager', description: 'Manage single location operations', color: 'bg-gray-100 text-gray-800 border-gray-300', barColor: 'bg-gray-500' },
    COACH: { displayName: 'Coach', description: 'Manage classes and student attendance', color: 'bg-gray-100 text-gray-800 border-gray-300', barColor: 'bg-gray-500' },
    SUPPORT_STAFF: { displayName: 'Support Staff', description: 'Handle customer support and inquiries', color: 'bg-gray-100 text-gray-800 border-gray-300', barColor: 'bg-gray-500' },
    PARTNER_ADMIN: { displayName: 'Partner Admin', description: 'Manage partner integrations and reports', color: 'bg-gray-100 text-gray-800 border-gray-300', barColor: 'bg-gray-500' },
    PARENT: { displayName: 'Parent', description: 'Book classes and manage children', color: 'bg-gray-100 text-gray-800 border-gray-300', barColor: 'bg-gray-500' },
    USER: { displayName: 'General User', description: 'Browse and book classes', color: 'bg-gray-100 text-gray-800 border-gray-300', barColor: 'bg-gray-500' },
}

const PERMISSION_CATEGORIES: PermissionCategory[] = [
    {
        name: 'Users',
        permissions: [
            { key: 'users:read', label: 'Read Users', description: 'View user profiles and lists' },
            { key: 'users:create', label: 'Create Users', description: 'Create new user accounts' },
            { key: 'users:update', label: 'Update Users', description: 'Edit user profile information' },
            { key: 'users:delete', label: 'Delete Users', description: 'Remove user accounts' },
            { key: 'users:status', label: 'Manage Status', description: 'Activate or deactivate users' },
        ]
    },
    {
        name: 'Programs',
        permissions: [
            { key: 'programs:read', label: 'Read Programs', description: 'View program details' },
            { key: 'programs:create', label: 'Create Programs', description: 'Create new programs' },
            { key: 'programs:update', label: 'Update Programs', description: 'Edit program details' },
            { key: 'programs:delete', label: 'Delete Programs', description: 'Remove programs' },
        ]
    },
    {
        name: 'Scheduling',
        permissions: [
            { key: 'scheduling:read', label: 'Read Schedules', description: 'View schedules and timetables' },
            { key: 'scheduling:create', label: 'Create Schedules', description: 'Create new schedule entries' },
            { key: 'scheduling:update', label: 'Update Schedules', description: 'Modify schedule entries' },
            { key: 'scheduling:publish', label: 'Publish Schedules', description: 'Publish schedules for users' },
        ]
    },
    {
        name: 'Bookings',
        permissions: [
            { key: 'bookings:read', label: 'Read Bookings', description: 'View booking records' },
            { key: 'bookings:create', label: 'Create Bookings', description: 'Make new bookings' },
            { key: 'bookings:cancel', label: 'Cancel Bookings', description: 'Cancel existing bookings' },
            { key: 'bookings:refund', label: 'Refund Bookings', description: 'Process booking refunds' },
        ]
    },
    {
        name: 'Payments',
        permissions: [
            { key: 'payments:read', label: 'Read Payments', description: 'View payment records' },
            { key: 'payments:create', label: 'Create Payments', description: 'Process new payments' },
            { key: 'payments:refund', label: 'Refund Payments', description: 'Issue payment refunds' },
            { key: 'payments:export', label: 'Export Payments', description: 'Export payment data' },
        ]
    },
    {
        name: 'Staff',
        permissions: [
            { key: 'staff:read', label: 'Read Staff', description: 'View staff information' },
            { key: 'staff:create', label: 'Create Staff', description: 'Add new staff members' },
            { key: 'staff:update', label: 'Update Staff', description: 'Edit staff details' },
            { key: 'staff:delete', label: 'Delete Staff', description: 'Remove staff members' },
        ]
    },
    {
        name: 'Attendance',
        permissions: [
            { key: 'attendance:read', label: 'Read Attendance', description: 'View attendance records' },
            { key: 'attendance:write', label: 'Write Attendance', description: 'Mark and update attendance' },
            { key: 'attendance:export', label: 'Export Attendance', description: 'Export attendance data' },
        ]
    },
    {
        name: 'Reports',
        permissions: [
            { key: 'reports:read', label: 'Read Reports', description: 'View system reports' },
            { key: 'reports:export', label: 'Export Reports', description: 'Export report data' },
            { key: 'reports:analytics', label: 'Analytics', description: 'Access analytics dashboards' },
        ]
    },
    {
        name: 'Communications',
        permissions: [
            { key: 'notifications:send', label: 'Send Notifications', description: 'Send notifications to users' },
            { key: 'notifications:read', label: 'Read Notifications', description: 'View notification history' },
            { key: 'templates:manage', label: 'Manage Templates', description: 'Create and edit message templates' },
            { key: 'crm:read', label: 'CRM Read', description: 'View CRM data' },
            { key: 'crm:write', label: 'CRM Write', description: 'Update CRM records' },
        ]
    },
    {
        name: 'System',
        permissions: [
            { key: 'system:security', label: 'Security Settings', description: 'Manage security configuration' },
            { key: 'system:api', label: 'API Management', description: 'Manage API keys and access' },
            { key: 'system:database', label: 'Database', description: 'Access database management tools' },
            { key: 'system:features', label: 'Feature Flags', description: 'Toggle system features' },
            { key: 'system:integrations', label: 'Integrations', description: 'Manage third-party integrations' },
            { key: 'system:logs', label: 'System Logs', description: 'View system activity logs' },
        ]
    },
    {
        name: 'Support',
        permissions: [
            { key: 'tickets:read', label: 'Read Tickets', description: 'View support tickets' },
            { key: 'tickets:write', label: 'Write Tickets', description: 'Create and respond to tickets' },
            { key: 'tickets:assign', label: 'Assign Tickets', description: 'Assign tickets to staff' },
            { key: 'knowledge:manage', label: 'Knowledge Base', description: 'Manage knowledge base articles' },
        ]
    },
    {
        name: 'BCMS',
        permissions: [
            { key: 'bcms:countries', label: 'Countries', description: 'Manage country configurations' },
            { key: 'bcms:regions', label: 'Regions', description: 'Manage regional settings' },
            { key: 'bcms:locations', label: 'Locations', description: 'Manage location data' },
            { key: 'bcms:rooms', label: 'Rooms', description: 'Manage room configurations' },
            { key: 'bcms:terms', label: 'Terms', description: 'Manage term periods' },
            { key: 'bcms:payments', label: 'BCMS Payments', description: 'Manage BCMS payment settings' },
        ]
    },
    {
        name: 'Rules',
        permissions: [
            { key: 'rules:read', label: 'Read Rules', description: 'View business rules' },
            { key: 'rules:create', label: 'Create Rules', description: 'Create new rules' },
            { key: 'rules:update', label: 'Update Rules', description: 'Modify existing rules' },
            { key: 'rules:delete', label: 'Delete Rules', description: 'Remove rules' },
            { key: 'rules:evaluate', label: 'Evaluate Rules', description: 'Run rule evaluation' },
        ]
    },
    {
        name: 'Finance',
        permissions: [
            { key: 'finance:payments', label: 'Finance Payments', description: 'Manage financial payments' },
            { key: 'finance:revenue', label: 'Revenue', description: 'View revenue data' },
            { key: 'finance:ledger', label: 'Ledger', description: 'Access financial ledger' },
            { key: 'finance:export', label: 'Export Finance', description: 'Export financial data' },
        ]
    },
    {
        name: 'Audit',
        permissions: [
            { key: 'audit:read', label: 'Read Audit', description: 'View audit logs' },
            { key: 'audit:export', label: 'Export Audit', description: 'Export audit data' },
        ]
    },
]

const ALL_PERMISSION_KEYS = PERMISSION_CATEGORIES.flatMap(c => c.permissions.map(p => p.key))

const DEFAULT_PERMISSIONS: Record<SystemRole, string[]> = {
    ADMIN: [...ALL_PERMISSION_KEYS],
    REGIONAL_ADMIN: ALL_PERMISSION_KEYS.filter(p => !p.startsWith('system:') && p !== 'audit:export'),
    FRANCHISE_OWNER: [
        'users:read', 'users:create',
        'programs:read', 'programs:create', 'programs:update', 'programs:delete',
        'scheduling:read', 'scheduling:create', 'scheduling:update', 'scheduling:publish',
        'bookings:read', 'bookings:create', 'bookings:cancel', 'bookings:refund',
        'payments:read', 'payments:create',
        'staff:read', 'staff:create', 'staff:update', 'staff:delete',
        'attendance:read', 'attendance:write', 'attendance:export',
        'reports:read', 'reports:export', 'reports:analytics',
        'bcms:locations', 'bcms:rooms',
    ],
    LOCATION_MANAGER: [
        'users:read',
        'programs:read',
        'scheduling:read', 'scheduling:create', 'scheduling:update',
        'bookings:read', 'bookings:create', 'bookings:cancel', 'bookings:refund',
        'payments:read',
        'staff:read', 'staff:create', 'staff:update',
        'attendance:read', 'attendance:write', 'attendance:export',
        'reports:read',
    ],
    COACH: [
        'scheduling:read',
        'attendance:read', 'attendance:write',
        'programs:read',
    ],
    SUPPORT_STAFF: [
        'tickets:read', 'tickets:write', 'tickets:assign',
        'knowledge:manage',
        'users:read',
        'bookings:read',
        'notifications:read',
    ],
    PARTNER_ADMIN: [
        'reports:read',
        'programs:read',
        'bookings:read',
    ],
    PARENT: [
        'bookings:read', 'bookings:create', 'bookings:cancel',
        'payments:read',
    ],
    USER: [
        'bookings:read', 'bookings:create',
        'payments:read',
    ],
}

const DEFAULT_USER_COUNTS: Record<SystemRole, number> = {
    ADMIN: 3, REGIONAL_ADMIN: 8, FRANCHISE_OWNER: 15, LOCATION_MANAGER: 25,
    COACH: 45, SUPPORT_STAFF: 12, PARTNER_ADMIN: 5, PARENT: 234, USER: 567,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadRolesFromStorage(): RoleConfig[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed.roles && Array.isArray(parsed.roles)) return parsed.roles as RoleConfig[]
        }
    } catch { /* ignore */ }
    return buildDefaultRoles()
}

function buildDefaultRoles(): RoleConfig[] {
    return SYSTEM_ROLES.map((name, idx) => ({
        id: `system-${idx + 1}`,
        name,
        displayName: ROLE_META[name].displayName,
        description: ROLE_META[name].description,
        permissions: DEFAULT_PERMISSIONS[name],
        status: 'active' as const,
        isCustom: false,
    }))
}

function saveRolesToStorage(roles: RoleConfig[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ roles, updatedAt: new Date().toISOString() }))
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RolesManagementPage() {
    const [activeTab, setActiveTab] = useState<'roles' | 'matrix'>('roles')
    const [roles, setRoles] = useState<RoleConfig[]>([])
    const [userCounts, setUserCounts] = useState<Record<string, number>>({ ...DEFAULT_USER_COUNTS })
    const [searchTerm, setSearchTerm] = useState('')
    const [totalApiUsers, setTotalApiUsers] = useState<number | null>(null)

    // Modal state
    const [modalOpen, setModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view')
    const [modalRole, setModalRole] = useState<RoleConfig | null>(null)
    const [modalPermissions, setModalPermissions] = useState<string[]>([])
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

    // Create-specific state
    const [newRoleName, setNewRoleName] = useState('')
    const [newRoleDisplayName, setNewRoleDisplayName] = useState('')
    const [newRoleDescription, setNewRoleDescription] = useState('')
    const [newRoleBaseRole, setNewRoleBaseRole] = useState('')

    // Delete confirmation
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [roleToDelete, setRoleToDelete] = useState<RoleConfig | null>(null)

    // ------ Init ------
    useEffect(() => {
        const loaded = loadRolesFromStorage()
        setRoles(loaded)
        fetchUserCounts()
    }, [])

    const fetchUserCounts = useCallback(async () => {
        try {
            const data = await apiClient.get<any>('/users')
            const users = Array.isArray(data) ? data : data?.data ?? data?.users ?? []
            if (Array.isArray(users)) {
                setTotalApiUsers(users.length)
                const counts: Record<string, number> = {}
                for (const u of users) {
                    const role = u.role || u.userRole || ''
                    counts[role] = (counts[role] || 0) + 1
                }
                setUserCounts(prev => ({ ...prev, ...counts }))
            }
        } catch {
            // fallback to defaults — already set
        }
    }, [])

    // ------ Derived ------
    const filteredRoles = useMemo(() =>
        roles.filter(r =>
            r.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.description.toLowerCase().includes(searchTerm.toLowerCase())
        ), [roles, searchTerm])

    const activeCount = roles.filter(r => r.status === 'active').length
    const customCount = roles.filter(r => r.isCustom).length
    const totalUsers = totalApiUsers ?? Object.values(userCounts).reduce((a, b) => a + b, 0)

    // ------ Persistence helper ------
    const persistRoles = useCallback((updated: RoleConfig[]) => {
        setRoles(updated)
        saveRolesToStorage(updated)
    }, [])

    // ------ Modal helpers ------
    const openViewModal = (role: RoleConfig) => {
        setModalMode('view')
        setModalRole(role)
        setModalPermissions([...role.permissions])
        setExpandedCategories(new Set())
        setModalOpen(true)
    }

    const openEditModal = (role: RoleConfig) => {
        setModalMode('edit')
        setModalRole(role)
        setModalPermissions([...role.permissions])
        setExpandedCategories(new Set())
        setModalOpen(true)
    }

    const openCreateModal = () => {
        setModalMode('create')
        setModalRole(null)
        setModalPermissions([])
        setNewRoleName('')
        setNewRoleDisplayName('')
        setNewRoleDescription('')
        setNewRoleBaseRole('')
        setExpandedCategories(new Set())
        setModalOpen(true)
    }

    const handleBaseRoleChange = (baseRole: string) => {
        setNewRoleBaseRole(baseRole)
        if (baseRole) {
            const source = roles.find(r => r.name === baseRole)
            if (source) setModalPermissions([...source.permissions])
        } else {
            setModalPermissions([])
        }
    }

    const togglePermission = (key: string) => {
        setModalPermissions(prev =>
            prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
        )
    }

    const toggleCategory = (catName: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev)
            next.has(catName) ? next.delete(catName) : next.add(catName)
            return next
        })
    }

    const toggleCategoryAll = (cat: PermissionCategory, grant: boolean) => {
        const keys = cat.permissions.map(p => p.key)
        setModalPermissions(prev => {
            const without = prev.filter(p => !keys.includes(p))
            return grant ? [...without, ...keys] : without
        })
    }

    // ------ Save / Create ------
    const handleSaveEdit = () => {
        if (!modalRole) return
        const updated = roles.map(r =>
            r.id === modalRole.id ? { ...r, permissions: modalPermissions } : r
        )
        persistRoles(updated)
        toast.success(`Permissions updated for ${modalRole.displayName}`)
        setModalOpen(false)
    }

    const handleCreate = () => {
        const trimmedName = newRoleName.trim().toUpperCase().replace(/\s+/g, '_')
        if (!trimmedName) { toast.error('Role name is required'); return }
        if (!newRoleDisplayName.trim()) { toast.error('Display name is required'); return }
        if (roles.some(r => r.name === trimmedName)) { toast.error('A role with this name already exists'); return }

        const newRole: RoleConfig = {
            id: `custom-${Date.now()}`,
            name: trimmedName,
            displayName: newRoleDisplayName.trim(),
            description: newRoleDescription.trim() || 'Custom role',
            permissions: modalPermissions,
            status: 'active',
            isCustom: true,
            baseRole: newRoleBaseRole || undefined,
        }
        persistRoles([...roles, newRole])
        toast.success(`Custom role "${newRole.displayName}" created`)
        setModalOpen(false)
    }

    // ------ Toggle active/inactive ------
    const toggleRoleStatus = (role: RoleConfig) => {
        const newStatus = role.status === 'active' ? 'inactive' : 'active'
        const updated = roles.map(r => r.id === role.id ? { ...r, status: newStatus as 'active' | 'inactive' } : r)
        persistRoles(updated)
        toast.success(`${role.displayName} is now ${newStatus}`)
    }

    // ------ Delete ------
    const confirmDelete = (role: RoleConfig) => {
        setRoleToDelete(role)
        setDeleteConfirmOpen(true)
    }

    const handleDelete = () => {
        if (!roleToDelete) return
        const updated = roles.filter(r => r.id !== roleToDelete.id)
        persistRoles(updated)
        toast.success(`Role "${roleToDelete.displayName}" deleted`)
        setDeleteConfirmOpen(false)
        setRoleToDelete(null)
    }

    // ------ Helpers for display ------
    const getRoleMeta = (role: RoleConfig) => {
        if (ROLE_META[role.name as SystemRole]) return ROLE_META[role.name as SystemRole]
        return { displayName: role.displayName, description: role.description, color: 'bg-teal-100 text-teal-800 border-teal-200', barColor: 'bg-teal-500' }
    }

    const getUserCount = (role: RoleConfig) => userCounts[role.name] ?? 0

    // ------ Render ------
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
                    <p className="text-gray-600 mt-1">Manage user roles and permissions across the system</p>
                </div>
                {activeTab === 'roles' && (
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={openCreateModal}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Custom Role
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('roles')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'roles' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    <Shield className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                    Roles
                </button>
                <button
                    onClick={() => setActiveTab('matrix')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'matrix' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    <Settings className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                    Permissions Matrix
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'matrix' ? (
                <PermissionsMatrix />
            ) : (
            <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { title: 'Total Roles', value: roles.length, icon: Shield, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
                    { title: 'Total Users', value: totalUsers, icon: Users, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100' },
                    { title: 'Active Roles', value: activeCount, icon: CheckCircle, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' },
                    { title: 'Permission Categories', value: PERMISSION_CATEGORIES.length, icon: Settings, gradient: 'from-orange-500 to-orange-600', bgGradient: 'from-orange-50 to-orange-100' },
                ].map((stat, idx) => (
                    <div key={idx} className={`rounded-lg border-0 bg-gradient-to-br ${stat.bgGradient} p-4 hover:shadow-lg transition-all`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className={`bg-gradient-to-br ${stat.gradient} p-2.5 rounded-lg shadow-md`}>
                                <stat.icon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search roles by name or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredRoles.map((role, index) => {
                        const meta = getRoleMeta(role)
                        const count = getUserCount(role)
                        const permCount = role.permissions.length
                        return (
                            <motion.div
                                key={role.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.03 }}
                            >
                                <Card className={`hover:shadow-lg transition-shadow overflow-hidden ${role.status === 'inactive' ? 'opacity-60' : ''}`}>
                                    <div>
                                        <div className="flex-1">
                                            <CardHeader className="pb-2">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <Badge className={meta.color}>{role.displayName}</Badge>
                                                            {role.isCustom && <Badge variant="outline" className="text-xs">Custom</Badge>}
                                                            {role.status === 'inactive' && <Badge variant="outline" className="text-xs text-red-600 border-red-300">Inactive</Badge>}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1 font-mono">{role.name}</p>
                                                        <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600">Users</span>
                                                        <span className="font-semibold">{count}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600">Permissions</span>
                                                        <span className="font-semibold">{permCount} / {ALL_PERMISSION_KEYS.length}</span>
                                                    </div>
                                                    {/* Permission progress bar */}
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                        <div
                                                            className={`h-1.5 rounded-full ${meta.barColor}`}
                                                            style={{ width: `${Math.round((permCount / ALL_PERMISSION_KEYS.length) * 100)}%` }}
                                                        />
                                                    </div>

                                                    {/* Action buttons */}
                                                    <div className="flex items-center gap-1 pt-2 border-t">
                                                        <Button variant="ghost" size="sm" onClick={() => openViewModal(role)} title="View permissions">
                                                            <Eye className="w-4 h-4 mr-1" /> View
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => openEditModal(role)} title="Edit permissions">
                                                            <Edit className="w-4 h-4 mr-1" /> Edit
                                                        </Button>
                                                        <div className="ml-auto flex items-center gap-1">
                                                            <Switch
                                                                checked={role.status === 'active'}
                                                                onCheckedChange={() => toggleRoleStatus(role)}
                                                            />
                                                            {role.isCustom && (
                                                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => confirmDelete(role)} title="Delete role">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            {filteredRoles.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No roles match your search.
                </div>
            )}
            </>
            )}

            {/* ==================== Permission Modal ==================== */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {modalMode === 'create' ? 'Create Custom Role' : modalMode === 'edit' ? `Edit Permissions — ${modalRole?.displayName}` : `Permissions — ${modalRole?.displayName}`}
                        </DialogTitle>
                        <DialogDescription>
                            {modalMode === 'view' && 'Read-only view of the permission matrix for this role.'}
                            {modalMode === 'edit' && 'Toggle permissions and click Save when done.'}
                            {modalMode === 'create' && 'Define the new role and assign permissions.'}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Create-specific fields */}
                    {modalMode === 'create' && (
                        <div className="space-y-4 border-b pb-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role Name (identifier)</label>
                                    <input
                                        type="text"
                                        value={newRoleName}
                                        onChange={(e) => setNewRoleName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                                        placeholder="CUSTOM_ROLE"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                                    <input
                                        type="text"
                                        value={newRoleDisplayName}
                                        onChange={(e) => setNewRoleDisplayName(e.target.value)}
                                        placeholder="Custom Role"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={newRoleDescription}
                                    onChange={(e) => setNewRoleDescription(e.target.value)}
                                    placeholder="Describe this role..."
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Clone Permissions From (optional)</label>
                                <select
                                    value={newRoleBaseRole}
                                    onChange={(e) => handleBaseRoleChange(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option value="">Start with no permissions</option>
                                    {roles.map(r => (
                                        <option key={r.id} value={r.name}>{r.displayName} ({r.permissions.length} perms)</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Permission Matrix */}
                    <div className="space-y-1">
                        {PERMISSION_CATEGORIES.map(cat => {
                            const isExpanded = expandedCategories.has(cat.name)
                            const grantedInCat = cat.permissions.filter(p => modalPermissions.includes(p.key)).length
                            const totalInCat = cat.permissions.length
                            const allGranted = grantedInCat === totalInCat

                            return (
                                <div key={cat.name} className="border rounded-lg overflow-hidden">
                                    {/* Category header */}
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left cursor-pointer"
                                        onClick={() => toggleCategory(cat.name)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCategory(cat.name) } }}
                                    >
                                        <div className="flex items-center gap-2">
                                            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                                            <span className="font-medium text-sm">{cat.name}</span>
                                            <span className="text-xs text-gray-500">({grantedInCat}/{totalInCat})</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Category-level progress dots */}
                                            <div className="flex gap-0.5">
                                                {cat.permissions.map(p => (
                                                    <div
                                                        key={p.key}
                                                        className={`w-2 h-2 rounded-full ${modalPermissions.includes(p.key) ? 'bg-green-500' : 'bg-gray-300'}`}
                                                    />
                                                ))}
                                            </div>
                                            {(modalMode === 'edit' || modalMode === 'create') && (
                                                <span
                                                    role="button"
                                                    tabIndex={0}
                                                    className="inline-flex items-center justify-center whitespace-nowrap font-medium text-xs h-6 px-2 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
                                                    onClick={(e) => { e.stopPropagation(); toggleCategoryAll(cat, !allGranted) }}
                                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); toggleCategoryAll(cat, !allGranted) } }}
                                                >
                                                    {allGranted ? 'Revoke All' : 'Grant All'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Expanded permissions */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {cat.permissions.map(perm => {
                                                        const checked = modalPermissions.includes(perm.key)
                                                        const editable = modalMode === 'edit' || modalMode === 'create'
                                                        return (
                                                            <label
                                                                key={perm.key}
                                                                className={`flex items-start gap-3 p-2 rounded-lg border transition-colors ${editable ? 'cursor-pointer hover:bg-gray-50' : ''} ${checked ? 'border-green-200 bg-green-50/50' : 'border-gray-200'}`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={checked}
                                                                    onChange={() => editable && togglePermission(perm.key)}
                                                                    disabled={!editable}
                                                                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                />
                                                                <div className="min-w-0">
                                                                    <div className="text-sm font-medium text-gray-900">{perm.label}</div>
                                                                    <div className="text-xs text-gray-500">{perm.description}</div>
                                                                    <div className="text-xs text-gray-400 font-mono mt-0.5">{perm.key}</div>
                                                                </div>
                                                            </label>
                                                        )
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )
                        })}
                    </div>

                    <DialogFooter>
                        {modalMode === 'view' && (
                            <Button variant="outline" onClick={() => setModalOpen(false)}>Close</Button>
                        )}
                        {modalMode === 'edit' && (
                            <>
                                <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveEdit}>
                                    Save Permissions
                                </Button>
                            </>
                        )}
                        {modalMode === 'create' && (
                            <>
                                <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreate}>
                                    <Plus className="w-4 h-4 mr-1" /> Create Role
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ==================== Delete Confirmation ==================== */}
            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Role</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the custom role &quot;{roleToDelete?.displayName}&quot;? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
