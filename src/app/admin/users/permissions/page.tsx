'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Shield, Edit, Save, RotateCcw, Download, Search,
    ChevronDown, ChevronRight, Check, X as XIcon,
    Info, AlertTriangle, Lock, Unlock
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

// ---------------------------------------------------------------------------
// Constants (shared with roles page)
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

const ROLE_DISPLAY: Record<string, { short: string; color: string }> = {
    ADMIN: { short: 'Admin', color: 'bg-red-100 text-red-800' },
    REGIONAL_ADMIN: { short: 'Regional', color: 'bg-orange-100 text-orange-800' },
    FRANCHISE_OWNER: { short: 'Franchise', color: 'bg-purple-100 text-purple-800' },
    LOCATION_MANAGER: { short: 'Loc Mgr', color: 'bg-blue-100 text-blue-800' },
    COACH: { short: 'Coach', color: 'bg-green-100 text-green-800' },
    SUPPORT_STAFF: { short: 'Support', color: 'bg-yellow-100 text-yellow-800' },
    PARTNER_ADMIN: { short: 'Partner', color: 'bg-pink-100 text-pink-800' },
    PARENT: { short: 'Parent', color: 'bg-indigo-100 text-indigo-800' },
    USER: { short: 'User', color: 'bg-gray-100 text-gray-800' },
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

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

function buildDefaultRoles(): RoleConfig[] {
    return SYSTEM_ROLES.map((name, idx) => ({
        id: `system-${idx + 1}`,
        name,
        displayName: ROLE_DISPLAY[name]?.short || name,
        description: '',
        permissions: DEFAULT_PERMISSIONS[name],
        status: 'active' as const,
        isCustom: false,
    }))
}

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

function saveRolesToStorage(roles: RoleConfig[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ roles, updatedAt: new Date().toISOString() }))
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PermissionsMatrixPage() {
    const [roles, setRoles] = useState<RoleConfig[]>([])
    const [editMode, setEditMode] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(PERMISSION_CATEGORIES.map(c => c.name)))
    const [originalSnapshot, setOriginalSnapshot] = useState<string>('') // JSON snapshot for change detection
    const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
    const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false)
    const [bulkAction, setBulkAction] = useState<{ role: string; grant: boolean } | null>(null)

    // ------ Init ------
    useEffect(() => {
        const loaded = loadRolesFromStorage()
        setRoles(loaded)
        setOriginalSnapshot(JSON.stringify(loaded.map(r => ({ name: r.name, permissions: [...r.permissions].sort() }))))
    }, [])

    // ------ Derived ------
    const currentSnapshot = useMemo(() =>
        JSON.stringify(roles.map(r => ({ name: r.name, permissions: [...r.permissions].sort() }))),
        [roles]
    )

    const hasChanges = editMode && currentSnapshot !== originalSnapshot

    const changeCount = useMemo(() => {
        if (!hasChanges) return 0
        try {
            const orig: { name: string; permissions: string[] }[] = JSON.parse(originalSnapshot)
            let count = 0
            for (const role of roles) {
                const origRole = orig.find(o => o.name === role.name)
                if (!origRole) continue
                const origSet = new Set(origRole.permissions)
                const curSet = new Set(role.permissions)
                for (const p of ALL_PERMISSION_KEYS) {
                    if (origSet.has(p) !== curSet.has(p)) count++
                }
            }
            return count
        } catch { return 0 }
    }, [hasChanges, roles, originalSnapshot])

    const filteredCategories = useMemo(() => {
        if (!searchTerm.trim()) return PERMISSION_CATEGORIES
        const term = searchTerm.toLowerCase()
        return PERMISSION_CATEGORIES
            .map(cat => ({
                ...cat,
                permissions: cat.permissions.filter(p =>
                    p.label.toLowerCase().includes(term) ||
                    p.key.toLowerCase().includes(term) ||
                    p.description.toLowerCase().includes(term) ||
                    cat.name.toLowerCase().includes(term)
                )
            }))
            .filter(cat => cat.permissions.length > 0)
    }, [searchTerm])

    // ------ Actions ------
    const persistRoles = useCallback((updated: RoleConfig[]) => {
        setRoles(updated)
        saveRolesToStorage(updated)
    }, [])

    const togglePermission = (roleName: string, permKey: string) => {
        if (!editMode) return
        setRoles(prev => prev.map(r => {
            if (r.name !== roleName) return r
            const has = r.permissions.includes(permKey)
            return { ...r, permissions: has ? r.permissions.filter(p => p !== permKey) : [...r.permissions, permKey] }
        }))
    }

    const handleSave = () => {
        persistRoles(roles)
        setOriginalSnapshot(JSON.stringify(roles.map(r => ({ name: r.name, permissions: [...r.permissions].sort() }))))
        toast.success(`Saved ${changeCount} permission change${changeCount !== 1 ? 's' : ''} successfully`)
        setEditMode(false)
    }

    const handleCancelEdit = () => {
        if (hasChanges) {
            // revert
            const loaded = loadRolesFromStorage()
            setRoles(loaded)
        }
        setEditMode(false)
    }

    const handleResetToDefaults = () => {
        const defaults = buildDefaultRoles()
        // Preserve any custom roles
        const customRoles = roles.filter(r => r.isCustom)
        const allRoles = [...defaults, ...customRoles]
        persistRoles(allRoles)
        setOriginalSnapshot(JSON.stringify(allRoles.map(r => ({ name: r.name, permissions: [...r.permissions].sort() }))))
        toast.success('Permissions reset to defaults')
        setResetConfirmOpen(false)
    }

    const handleBulkAction = () => {
        if (!bulkAction) return
        const { role, grant } = bulkAction
        setRoles(prev => prev.map(r => {
            if (r.name !== role) return r
            return { ...r, permissions: grant ? [...ALL_PERMISSION_KEYS] : [] }
        }))
        toast.info(`${grant ? 'Granted' : 'Revoked'} all permissions for ${ROLE_DISPLAY[role]?.short || role}`)
        setBulkConfirmOpen(false)
        setBulkAction(null)
    }

    const openBulkConfirm = (roleName: string, grant: boolean) => {
        setBulkAction({ role: roleName, grant })
        setBulkConfirmOpen(true)
    }

    const toggleCategory = (catName: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev)
            next.has(catName) ? next.delete(catName) : next.add(catName)
            return next
        })
    }

    const expandAll = () => setExpandedCategories(new Set(PERMISSION_CATEGORIES.map(c => c.name)))
    const collapseAll = () => setExpandedCategories(new Set())

    // ------ CSV Export ------
    const exportCSV = () => {
        const header = ['Category', 'Permission', ...roles.map(r => r.displayName || r.name)]
        const rows: string[][] = []
        for (const cat of PERMISSION_CATEGORIES) {
            for (const perm of cat.permissions) {
                const row = [cat.name, perm.key]
                for (const role of roles) {
                    row.push(role.permissions.includes(perm.key) ? 'YES' : 'NO')
                }
                rows.push(row)
            }
        }
        const csv = [header, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `permissions_matrix_${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Permission matrix exported as CSV')
    }

    // ------ Render helpers ------
    const getRoleDisplay = (name: string) => ROLE_DISPLAY[name] || { short: name.slice(0, 8), color: 'bg-teal-100 text-teal-800' }

    const roleHasPerm = (roleName: string, permKey: string): boolean => {
        const role = roles.find(r => r.name === roleName)
        return role ? role.permissions.includes(permKey) : false
    }

    // ------ Render ------
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Permissions Matrix</h1>
                    <p className="text-gray-600 mt-1">View and manage permissions across all roles</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={exportCSV}>
                        <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                    <Button variant="outline" onClick={() => setResetConfirmOpen(true)}>
                        <RotateCcw className="w-4 h-4 mr-2" /> Reset to Defaults
                    </Button>
                    {!editMode ? (
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                            setEditMode(true)
                            setOriginalSnapshot(JSON.stringify(roles.map(r => ({ name: r.name, permissions: [...r.permissions].sort() }))))
                        }}>
                            <Unlock className="w-4 h-4 mr-2" /> Edit Mode
                        </Button>
                    ) : (
                        <Button variant="outline" onClick={handleCancelEdit}>
                            <Lock className="w-4 h-4 mr-2" /> Exit Edit Mode
                        </Button>
                    )}
                </div>
            </div>

            {/* Info banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                    <p className="text-sm text-blue-800 font-medium">Permission changes take effect on next user login</p>
                    <p className="text-xs text-blue-600 mt-1">
                        Modifications are stored locally. The backend uses enum-based roles; these permission configurations layer on top of the role system.
                    </p>
                </div>
            </div>

            {/* Save bar (sticky when changes exist) */}
            {editMode && (
                <div className={`sticky top-0 z-40 rounded-lg p-4 flex items-center justify-between transition-colors ${hasChanges ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                        {editMode && <Badge className="bg-blue-100 text-blue-800">Edit Mode Active</Badge>}
                        {hasChanges && (
                            <span className="text-sm font-medium text-amber-700">
                                <AlertTriangle className="w-4 h-4 inline mr-1" />
                                {changeCount} unsaved change{changeCount !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    {hasChanges && (
                        <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" /> Save Changes
                        </Button>
                    )}
                </div>
            )}

            {/* Search + expand/collapse */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search permissions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <Button variant="outline" size="sm" onClick={expandAll}>Expand All</Button>
                        <Button variant="outline" size="sm" onClick={collapseAll}>Collapse All</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Matrix Table */}
            <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    {/* Sticky header row */}
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="sticky left-0 z-20 bg-gray-50 text-left px-4 py-3 font-semibold text-gray-700 min-w-[220px]">
                                Permission
                            </th>
                            {roles.map(role => {
                                const display = getRoleDisplay(role.name)
                                const grantedCount = role.permissions.length
                                return (
                                    <th key={role.name} className="px-2 py-3 text-center min-w-[90px]">
                                        <div className="flex flex-col items-center gap-1">
                                            <Badge className={`${display.color} text-xs whitespace-nowrap`}>
                                                {display.short}
                                            </Badge>
                                            <span className="text-xs text-gray-500">{grantedCount}/{ALL_PERMISSION_KEYS.length}</span>
                                            {editMode && (
                                                <div className="flex gap-1 mt-1">
                                                    <button
                                                        className="text-[10px] text-green-700 hover:underline"
                                                        onClick={() => openBulkConfirm(role.name, true)}
                                                        title="Grant all permissions"
                                                    >
                                                        Grant All
                                                    </button>
                                                    <span className="text-gray-300">|</span>
                                                    <button
                                                        className="text-[10px] text-red-700 hover:underline"
                                                        onClick={() => openBulkConfirm(role.name, false)}
                                                        title="Revoke all permissions"
                                                    >
                                                        Revoke All
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>

                    <tbody>
                        {filteredCategories.map(cat => {
                            const isExpanded = expandedCategories.has(cat.name)
                            // Category summary: count per role
                            const catKeys = cat.permissions.map(p => p.key)

                            return (
                                <AnimatePresence key={cat.name}>
                                    {/* Category row */}
                                    <tr
                                        className="border-b bg-gray-50/70 cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => toggleCategory(cat.name)}
                                    >
                                        <td className="sticky left-0 z-10 bg-gray-50/70 px-4 py-3 font-semibold text-gray-800">
                                            <div className="flex items-center gap-2">
                                                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                {cat.name}
                                                <span className="text-xs text-gray-500 font-normal">({catKeys.length})</span>
                                            </div>
                                        </td>
                                        {roles.map(role => {
                                            const granted = catKeys.filter(k => role.permissions.includes(k)).length
                                            const total = catKeys.length
                                            const pct = Math.round((granted / total) * 100)
                                            return (
                                                <td key={role.name} className="px-2 py-3 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className={`text-xs font-medium ${pct === 100 ? 'text-green-700' : pct === 0 ? 'text-red-500' : 'text-amber-600'}`}>
                                                            {granted}/{total}
                                                        </span>
                                                        <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-green-500' : pct === 0 ? 'bg-gray-200' : 'bg-amber-400'}`}
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                            )
                                        })}
                                    </tr>

                                    {/* Individual permission rows */}
                                    {isExpanded && cat.permissions.map(perm => (
                                        <motion.tr
                                            key={perm.key}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="border-b hover:bg-gray-50/50"
                                        >
                                            <td className="sticky left-0 z-10 bg-white px-4 py-2.5 pl-10">
                                                <div>
                                                    <span className="text-sm text-gray-800">{perm.label}</span>
                                                    <span className="text-xs text-gray-400 ml-2 font-mono">{perm.key}</span>
                                                </div>
                                            </td>
                                            {roles.map(role => {
                                                const has = roleHasPerm(role.name, perm.key)
                                                return (
                                                    <td key={role.name} className="px-2 py-2.5 text-center">
                                                        {editMode ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => togglePermission(role.name, perm.key)}
                                                                className={`w-7 h-7 rounded-md flex items-center justify-center transition-all mx-auto ${
                                                                    has
                                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                                                                        : 'bg-red-50 text-red-400 hover:bg-red-100 border border-red-200'
                                                                }`}
                                                            >
                                                                {has ? <Check className="w-4 h-4" /> : <XIcon className="w-3.5 h-3.5" />}
                                                            </button>
                                                        ) : (
                                                            <div className={`w-7 h-7 rounded-md flex items-center justify-center mx-auto ${
                                                                has
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-red-50 text-red-300'
                                                            }`}>
                                                                {has ? <Check className="w-4 h-4" /> : <XIcon className="w-3.5 h-3.5" />}
                                                            </div>
                                                        )}
                                                    </td>
                                                )
                                            })}
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )
                        })}
                    </tbody>
                </table>

                {filteredCategories.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No permissions match your search.
                    </div>
                )}
            </div>

            {/* Summary footer */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                        {roles.map(role => {
                            const display = getRoleDisplay(role.name)
                            const pct = Math.round((role.permissions.length / ALL_PERMISSION_KEYS.length) * 100)
                            return (
                                <div key={role.name} className="text-center">
                                    <Badge className={`${display.color} text-xs mb-2`}>{display.short}</Badge>
                                    <div className="text-lg font-bold text-gray-900">{pct}%</div>
                                    <div className="text-xs text-gray-500">{role.permissions.length} of {ALL_PERMISSION_KEYS.length}</div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* ==================== Reset Confirmation ==================== */}
            <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reset to Defaults</DialogTitle>
                        <DialogDescription>
                            This will reset all system role permissions to their default values. Custom roles will be preserved but their permissions will not change. Are you sure?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setResetConfirmOpen(false)}>Cancel</Button>
                        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleResetToDefaults}>
                            <RotateCcw className="w-4 h-4 mr-1" /> Reset
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ==================== Bulk Action Confirmation ==================== */}
            <Dialog open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{bulkAction?.grant ? 'Grant' : 'Revoke'} All Permissions</DialogTitle>
                        <DialogDescription>
                            This will {bulkAction?.grant ? 'grant' : 'revoke'} all {ALL_PERMISSION_KEYS.length} permissions for the {ROLE_DISPLAY[bulkAction?.role || '']?.short || bulkAction?.role} role. Continue?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setBulkConfirmOpen(false); setBulkAction(null) }}>Cancel</Button>
                        <Button
                            className={bulkAction?.grant ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
                            onClick={handleBulkAction}
                        >
                            {bulkAction?.grant ? 'Grant All' : 'Revoke All'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
