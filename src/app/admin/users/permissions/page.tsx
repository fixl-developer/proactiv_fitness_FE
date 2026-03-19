'use client'

import { useState, useEffect } from 'react'
import UserManagementService from '@/services/modules/user-management.service'

interface Permission {
    id: string
    name: string
    description: string
    category: string
}

interface Role {
    id: string
    name: string
    description: string
    permissions: string[]
}

export default function PermissionsPage() {
    const [roles, setRoles] = useState<Role[]>([])
    const [permissions, setPermissions] = useState<Permission[]>([])
    const [selectedRole, setSelectedRole] = useState<string>('')
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        if (selectedRole) {
            const role = roles.find(r => r.id === selectedRole)
            setSelectedPermissions(role?.permissions || [])
        }
    }, [selectedRole, roles])

    const loadData = async () => {
        try {
            setLoading(true)
            const [rolesData, permsData] = await Promise.all([
                UserManagementService.getAllRoles(),
                UserManagementService.getAllPermissions()
            ])
            setRoles(rolesData)
            setPermissions(permsData)
        } catch (error) {
            console.error('Failed to load data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePermissionToggle = (permissionId: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(p => p !== permissionId)
                : [...prev, permissionId]
        )
    }

    const handleSave = async () => {
        if (!selectedRole) return

        try {
            await UserManagementService.updateRolePermissions(selectedRole, selectedPermissions)
            alert('Permissions updated successfully')
            loadData()
        } catch (error) {
            console.error('Failed to update permissions:', error)
            alert('Failed to update permissions')
        }
    }

    const groupedPermissions = permissions.reduce((acc, perm) => {
        if (!acc[perm.category]) acc[perm.category] = []
        acc[perm.category].push(perm)
        return acc
    }, {} as Record<string, Permission[]>)

    if (loading) {
        return <div className="p-6 text-center">Loading...</div>
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Role Permissions</h1>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Role
                </label>
                <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                >
                    <option value="">Choose a role...</option>
                    {roles.map(role => (
                        <option key={role.id} value={role.id}>
                            {role.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedRole && (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Permissions</h2>
                        <button
                            onClick={handleSave}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Save Changes
                        </button>
                    </div>

                    <div className="space-y-6">
                        {Object.entries(groupedPermissions).map(([category, perms]) => (
                            <div key={category} className="border-b pb-4">
                                <h3 className="text-lg font-medium mb-3 capitalize">{category}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {perms.map(perm => (
                                        <label key={perm.id} className="flex items-start space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedPermissions.includes(perm.id)}
                                                onChange={() => handlePermissionToggle(perm.id)}
                                                className="mt-1"
                                            />
                                            <div>
                                                <div className="font-medium">{perm.name}</div>
                                                <div className="text-sm text-gray-500">{perm.description}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
