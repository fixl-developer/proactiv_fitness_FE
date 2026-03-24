"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    Activity,
    BarChart3,
    Calendar,
    Home,
    LogOut,
    Settings,
    Users,
    Building2,
    GraduationCap,
    CreditCard,
    FileText,
    MessageSquare,
    Bell,
    BookOpen,
    UserCheck,
    MapPin,
    Target,
    Zap,
    Shield,
    TrendingUp,
    Clock,
    Award,
    Wrench,
    DollarSign,
    AlertTriangle,
    Database,
    Wifi,
    CheckCircle,
    Star,
    User,
    Plus
} from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"

interface NavItem {
    title: string
    href: string
    icon: any
}

interface AppSidebarProps {
    role: "ADMIN" | "OUTLET_MANAGER" | "COACH" | "PARENT"
}

const navItems: Record<string, NavItem[]> = {
    ADMIN: [
        { title: "Dashboard", href: "/admin/dashboard", icon: Home },
        { title: "Real-time Analytics", href: "/admin/analytics", icon: BarChart3 },
        { title: "Outlet Management", href: "/admin/outlets", icon: Building2 },
        { title: "Member Management", href: "/admin/members", icon: Users },
        { title: "Staff Management", href: "/admin/staff", icon: UserCheck },
        { title: "Program Management", href: "/admin/programs", icon: GraduationCap },
        { title: "Schedule Manager", href: "/admin/schedule", icon: Calendar },
        { title: "Financial Reports", href: "/admin/finance", icon: DollarSign },
        { title: "Payment Gateway", href: "/admin/payments", icon: CreditCard },
        { title: "Equipment & Maintenance", href: "/admin/equipment", icon: Wrench },
        { title: "Performance Tracking", href: "/admin/performance", icon: Target },
        { title: "Automation & AI", href: "/admin/automation", icon: Zap },
        { title: "Communication Hub", href: "/admin/communications", icon: MessageSquare },
        { title: "Alert Management", href: "/admin/alerts", icon: AlertTriangle },
        { title: "System Health", href: "/admin/system", icon: Database },
        { title: "Reports & Insights", href: "/admin/reports", icon: FileText },
        { title: "Settings", href: "/admin/settings", icon: Settings },
    ],
    OUTLET_MANAGER: [
        { title: "Dashboard", href: "/manager/dashboard", icon: Home },
        { title: "Real-time Analytics", href: "/manager/analytics", icon: BarChart3 },
        { title: "Schedule Manager", href: "/manager/schedule", icon: Calendar },
        { title: "Class Management", href: "/manager/classes", icon: Activity },
        { title: "Member Management", href: "/manager/members", icon: Users },
        { title: "Staff Management", href: "/manager/staff", icon: UserCheck },
        { title: "Attendance Tracking", href: "/manager/attendance", icon: CheckCircle },
        { title: "Financial Reports", href: "/manager/finance", icon: DollarSign },
        { title: "Payment Processing", href: "/manager/payments", icon: CreditCard },
        { title: "Equipment & Maintenance", href: "/manager/equipment", icon: Settings },
        { title: "Performance Metrics", href: "/manager/performance", icon: TrendingUp },
        { title: "Communication Hub", href: "/manager/communications", icon: MessageSquare },
        { title: "Alert Management", href: "/manager/alerts", icon: AlertTriangle },
        { title: "Reports & Insights", href: "/manager/reports", icon: FileText },
        { title: "Settings", href: "/manager/settings", icon: Settings },
    ],
    COACH: [
        { title: "Dashboard", href: "/coach/dashboard", icon: Home },
        { title: "My Classes", href: "/coach/my-classes", icon: Calendar },
        { title: "My Students", href: "/coach/students", icon: Users },
        { title: "Schedule", href: "/coach/schedule", icon: Clock },
        { title: "Attendance", href: "/coach/attendance", icon: CheckCircle },
        { title: "Student Feedback", href: "/coach/feedback", icon: Star },
        { title: "Performance Tracking", href: "/coach/performance", icon: TrendingUp },
        { title: "Class Reports", href: "/coach/reports", icon: FileText },
        { title: "Messages", href: "/coach/messages", icon: MessageSquare },
        { title: "Leave Request", href: "/coach/leave", icon: AlertTriangle },
        { title: "My Profile", href: "/coach/profile", icon: User },
        { title: "Settings", href: "/coach/settings", icon: Settings },
    ],
    PARENT: [
        { title: "Dashboard", href: "/parent/dashboard", icon: Home },
        { title: "My Children", href: "/parent/children", icon: Users },
        { title: "My Bookings", href: "/parent/bookings", icon: Calendar },
        { title: "Book New Class", href: "/parent/book-class", icon: Plus },
        { title: "Payments & Invoices", href: "/parent/payments", icon: CreditCard },
        { title: "Progress Reports", href: "/parent/reports", icon: BarChart3 },
        { title: "Coach Feedback", href: "/parent/feedback", icon: MessageSquare },
        { title: "Attendance History", href: "/parent/attendance", icon: CheckCircle },
        { title: "My Account", href: "/parent/account", icon: User },
        { title: "Support & Help", href: "/parent/support", icon: Bell },
        { title: "Settings", href: "/parent/settings", icon: Settings },
    ],
}

export function AppSidebar({ role }: AppSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const { user, logout } = useAuth()
    const items = navItems[role] || []

    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    return (
        <Sidebar>
            <SidebarHeader className="border-b border-sidebar-border p-4">
                <Link id="app-sidebar-link-home" href="/" className="flex items-center gap-2">
                    <Activity className="h-6 w-6 text-primary" />
                    <span className="font-semibold text-lg">ProActive Sports</span>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                                        <Link id="layouts-app-sidebar-nav" href={item.href}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t border-sidebar-border p-4">
                <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {user?.name?.[0] || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                            {user?.name || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{role.replace("_", " ")}</p>
                    </div>
                </div>
                <Button id="btn-logout-components-layouts-app-sidebar" variant="outline" size="sm" className="w-full justify-start bg-transparent" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                </Button>
            </SidebarFooter>
        </Sidebar>
    )
}
