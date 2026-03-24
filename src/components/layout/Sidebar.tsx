'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    Calendar,
    BookOpen,
    CreditCard,
    Settings,
    BarChart3,
    UserCog,
    ClipboardCheck,
    Award,
    Building2,
} from 'lucide-react';

interface SidebarProps {
    role?: string;
}

export function Sidebar({ role = 'location_manager' }: SidebarProps) {
    const pathname = usePathname();

    // Different menu items based on role
    const menuItems = getMenuItemsByRole(role);

    return (
        <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-white">
            <nav className="space-y-1 p-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link id={`sidebar-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}

function getMenuItemsByRole(role: string) {
    const commonItems = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ];

    const roleSpecificItems: Record<string, any[]> = {
        admin: [
            ...commonItems,
            { href: '/dashboard/regions', label: 'Regions', icon: Building2 },
            { href: '/dashboard/franchises', label: 'Franchises', icon: Building2 },
            { href: '/dashboard/locations', label: 'Locations', icon: Building2 },
            { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
            { href: '/dashboard/users', label: 'Users', icon: Users },
            { href: '/dashboard/settings', label: 'Settings', icon: Settings },
        ],
        location_manager: [
            ...commonItems,
            { href: '/dashboard/students', label: 'Students', icon: Users },
            { href: '/dashboard/classes', label: 'Classes', icon: BookOpen },
            { href: '/dashboard/schedule', label: 'Schedule', icon: Calendar },
            { href: '/dashboard/attendance', label: 'Attendance', icon: ClipboardCheck },
            { href: '/dashboard/staff', label: 'Staff', icon: UserCog },
            { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
            { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
        ],
        coach: [
            ...commonItems,
            { href: '/dashboard/my-classes', label: 'My Classes', icon: BookOpen },
            { href: '/dashboard/attendance', label: 'Attendance', icon: ClipboardCheck },
            { href: '/dashboard/students', label: 'Students', icon: Users },
            { href: '/dashboard/schedule', label: 'My Schedule', icon: Calendar },
        ],
        parent: [
            ...commonItems,
            { href: '/dashboard/children', label: 'My Children', icon: Users },
            { href: '/dashboard/bookings', label: 'Bookings', icon: Calendar },
            { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
            { href: '/dashboard/progress', label: 'Progress', icon: Award },
        ],
    };

    return roleSpecificItems[role] || commonItems;
}
