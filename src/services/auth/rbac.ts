export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    HQ_ADMIN = 'HQ_ADMIN',
    REGIONAL_ADMIN = 'REGIONAL_ADMIN',
    LOCATION_ADMIN = 'LOCATION_ADMIN',
    FRANCHISE_MANAGER = 'FRANCHISE_MANAGER',
    FRANCHISE_OWNER = 'FRANCHISE_OWNER',
    LOCATION_MANAGER = 'LOCATION_MANAGER',
    COACH = 'COACH',
    MANAGER = 'MANAGER',
    SUPPORT_STAFF = 'SUPPORT_STAFF',
    PARTNER_ADMIN = 'PARTNER_ADMIN',
    PARENT = 'PARENT',
    USER = 'USER'
}

export interface RoleConfig {
    dashboard: string
    modules: string[]
    permissions: string[]
}

export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
    [UserRole.SUPER_ADMIN]: {
        dashboard: '/superadmin/dashboard',
        modules: ['all'],
        permissions: ['all']
    },
    [UserRole.ADMIN]: {
        dashboard: '/admin/dashboard',
        modules: [
            'staff',
            'booking',
            'scheduling',
            'payments',
            'billing',
            'financial-ledger',
            'reporting',
            'advanced-analytics',
            'facility-management',
            'attendance',
            'programs',
            'workforce-management'
        ],
        permissions: [
            'view_dashboard',
            'manage_staff',
            'manage_bookings',
            'manage_payments',
            'view_reports',
            'manage_facilities'
        ]
    },
    [UserRole.HQ_ADMIN]: {
        dashboard: '/admin/hq/dashboard',
        modules: [
            'franchise-management',
            'reporting',
            'advanced-analytics',
            'financial-ledger',
            'staff'
        ],
        permissions: [
            'view_dashboard',
            'manage_franchises',
            'view_reports',
            'view_analytics'
        ]
    },
    [UserRole.REGIONAL_ADMIN]: {
        dashboard: '/admin/regional/dashboard',
        modules: [
            'franchise',
            'reporting',
            'capacity-optimizer',
            'advanced-analytics'
        ],
        permissions: [
            'view_dashboard',
            'manage_regions',
            'view_reports',
            'view_analytics'
        ]
    },
    [UserRole.LOCATION_ADMIN]: {
        dashboard: '/admin/location/dashboard',
        modules: [
            'facility-management',
            'attendance',
            'scheduling',
            'staff',
            'reporting'
        ],
        permissions: [
            'view_dashboard',
            'manage_location',
            'manage_attendance',
            'manage_schedule'
        ]
    },
    [UserRole.FRANCHISE_OWNER]: {
        dashboard: '/admin/franchise/dashboard',
        modules: ['franchise', 'programs', 'reporting', 'staff', 'booking'],
        permissions: ['view_dashboard', 'manage_franchise', 'manage_programs', 'view_reports']
    },
    [UserRole.LOCATION_MANAGER]: {
        dashboard: '/manager/dashboard',
        modules: ['staff', 'scheduling', 'reporting', 'attendance'],
        permissions: ['view_dashboard', 'manage_staff', 'view_schedule', 'view_reports']
    },
    [UserRole.FRANCHISE_MANAGER]: {
        dashboard: '/admin/franchise/dashboard',
        modules: [
            'franchise',
            'programs',
            'reporting',
            'staff',
            'booking'
        ],
        permissions: [
            'view_dashboard',
            'manage_franchise',
            'manage_programs',
            'view_reports'
        ]
    },
    [UserRole.COACH]: {
        dashboard: '/coach/dashboard',
        modules: [
            'scheduling',
            'attendance',
            'programs',
            'reporting'
        ],
        permissions: [
            'view_dashboard',
            'manage_schedule',
            'manage_attendance',
            'view_students'
        ]
    },
    [UserRole.MANAGER]: {
        dashboard: '/manager/dashboard',
        modules: [
            'staff',
            'scheduling',
            'reporting',
            'attendance'
        ],
        permissions: [
            'view_dashboard',
            'manage_staff',
            'view_schedule',
            'view_reports'
        ]
    },
    [UserRole.SUPPORT_STAFF]: {
        dashboard: '/staff/dashboard',
        modules: [
            'support',
            'notifications',
            'reporting',
            'advanced-analytics'
        ],
        permissions: [
            'view_dashboard',
            'manage_tickets',
            'view_analytics'
        ]
    },
    [UserRole.PARTNER_ADMIN]: {
        dashboard: '/partner/dashboard',
        modules: [
            'partner-portal',
            'reporting',
            'advanced-analytics',
            'integrations',
            'financial-ledger'
        ],
        permissions: [
            'view_dashboard',
            'view_analytics',
            'view_financial',
            'manage_integrations'
        ]
    },
    [UserRole.PARENT]: {
        dashboard: '/parent/dashboard',
        modules: [
            'booking',
            'scheduling',
            'payments',
            'parent-engagement',
            'parent-roi',
            'waitlist',
            'family-scheduler'
        ],
        permissions: [
            'view_dashboard',
            'browse_classes',
            'manage_bookings',
            'view_payments'
        ]
    },
    [UserRole.USER]: {
        dashboard: '/user/dashboard',
        modules: [
            'booking',
            'scheduling',
            'payments',
            'user-profile',
            'user-progress',
            'user-classes',
            'user-achievements',
            'gamification',
            'notifications'
        ],
        permissions: [
            'view_dashboard',
            'browse_classes',
            'manage_bookings',
            'view_payments',
            'view_progress',
            'view_achievements'
        ]
    }
}

class RBACManager {
    private currentRole: UserRole | null = null

    setRole(role: string): void {
        const roleKey = Object.keys(UserRole).find(
            key => UserRole[key as keyof typeof UserRole] === role
        )
        if (roleKey) {
            this.currentRole = UserRole[roleKey as keyof typeof UserRole]
        }
    }

    getRole(): UserRole | null {
        return this.currentRole
    }

    getDashboard(): string {
        if (!this.currentRole) return '/login'
        return ROLE_CONFIG[this.currentRole].dashboard
    }

    hasModule(module: string): boolean {
        if (!this.currentRole) return false
        if (this.currentRole === UserRole.SUPER_ADMIN) return true

        const modules = ROLE_CONFIG[this.currentRole].modules
        return modules.includes(module)
    }

    hasPermission(permission: string): boolean {
        if (!this.currentRole) return false
        if (this.currentRole === UserRole.SUPER_ADMIN) return true

        const permissions = ROLE_CONFIG[this.currentRole].permissions
        return permissions.includes(permission)
    }

    hasAnyPermission(permissions: string[]): boolean {
        return permissions.some(permission => this.hasPermission(permission))
    }

    hasAllPermissions(permissions: string[]): boolean {
        return permissions.every(permission => this.hasPermission(permission))
    }

    canAccessPage(pagePath: string): boolean {
        if (!this.currentRole) return false
        if (this.currentRole === UserRole.SUPER_ADMIN) return true

        // Check if page path matches role's dashboard
        const dashboard = ROLE_CONFIG[this.currentRole].dashboard
        return pagePath.startsWith(dashboard.split('/').slice(0, -1).join('/'))
    }

    getAccessibleModules(): string[] {
        if (!this.currentRole) return []
        if (this.currentRole === UserRole.SUPER_ADMIN) return ['all']

        return ROLE_CONFIG[this.currentRole].modules
    }

    getAccessiblePermissions(): string[] {
        if (!this.currentRole) return []
        if (this.currentRole === UserRole.SUPER_ADMIN) return ['all']

        return ROLE_CONFIG[this.currentRole].permissions
    }

    isSuperAdmin(): boolean {
        return this.currentRole === UserRole.SUPER_ADMIN
    }

    isAdmin(): boolean {
        return [
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
            UserRole.HQ_ADMIN,
            UserRole.REGIONAL_ADMIN,
            UserRole.LOCATION_ADMIN,
            UserRole.FRANCHISE_OWNER,
            UserRole.FRANCHISE_MANAGER
        ].includes(this.currentRole!)
    }

    isCoach(): boolean {
        return this.currentRole === UserRole.COACH
    }

    isParent(): boolean {
        return this.currentRole === UserRole.PARENT
    }

    isUser(): boolean {
        return this.currentRole === UserRole.USER
    }

    isSupportStaff(): boolean {
        return this.currentRole === UserRole.SUPPORT_STAFF
    }

    isPartner(): boolean {
        return this.currentRole === UserRole.PARTNER_ADMIN
    }
}

export const rbacManager = new RBACManager()
export default RBACManager
