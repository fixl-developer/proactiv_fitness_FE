import {
    Crown,
    Building2,
    Globe,
    MapPin,
    Users,
    Award,
    Headphones,
    Briefcase,
    LucideIcon
} from 'lucide-react'

export interface DemoAccount {
    email: string
    password: string
    label: string
    icon: LucideIcon
    color: string
    description: string
    dashboard: string
    role: string
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
    {
        email: 'admin@proactiv.com',
        password: 'Admin@123456',
        label: 'Admin',
        icon: Crown,
        color: 'from-blue-600 to-indigo-600',
        description: 'Business owner - Full access',
        dashboard: '/admin/dashboard',
        role: 'ADMIN'
    },
    {
        email: 'regional@proactiv.com',
        password: 'Regional@123456',
        label: 'Regional Admin',
        icon: Globe,
        color: 'from-cyan-500 to-blue-500',
        description: 'Regional oversight',
        dashboard: '/admin/regional/dashboard',
        role: 'REGIONAL_ADMIN'
    },
    {
        email: 'franchise@proactiv.com',
        password: 'Franchise@123456',
        label: 'Franchise Owner',
        icon: MapPin,
        color: 'from-red-500 to-pink-500',
        description: 'Franchise management',
        dashboard: '/admin/franchise/dashboard',
        role: 'FRANCHISE_OWNER'
    },
    {
        email: 'manager@proactiv.com',
        password: 'Manager@123456',
        label: 'Location Manager',
        icon: Users,
        color: 'from-blue-500 to-indigo-500',
        description: 'Location operations',
        dashboard: '/admin/location/dashboard',
        role: 'LOCATION_MANAGER'
    },
    {
        email: 'coach@proactiv.com',
        password: 'Coach@123456',
        label: 'Coach',
        icon: Award,
        color: 'from-green-500 to-emerald-500',
        description: 'Training & classes',
        dashboard: '/coach/dashboard',
        role: 'COACH'
    },
    {
        email: 'partner@proactiv.com',
        password: 'Partner@123456',
        label: 'Partner Admin',
        icon: Briefcase,
        color: 'from-pink-500 to-rose-500',
        description: 'Partner management',
        dashboard: '/partner/dashboard',
        role: 'PARTNER_ADMIN'
    },
    {
        email: 'support@proactiv.com',
        password: 'Support@123456',
        label: 'Support Staff',
        icon: Headphones,
        color: 'from-purple-500 to-violet-500',
        description: 'Customer support',
        dashboard: '/staff/dashboard',
        role: 'SUPPORT_STAFF'
    }
]

export function getDemoAccount(email: string): DemoAccount | undefined {
    return DEMO_ACCOUNTS.find(account => account.email === email)
}

export function getDemoAccountsByRole(role: string): DemoAccount[] {
    return DEMO_ACCOUNTS.filter(account => account.role === role)
}

export function getAllDemoAccounts(): DemoAccount[] {
    return DEMO_ACCOUNTS
}

export function getDemoAccountCount(): number {
    return DEMO_ACCOUNTS.length
}
