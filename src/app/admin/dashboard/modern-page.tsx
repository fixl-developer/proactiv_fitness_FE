"use client"

import { DashboardHeader } from "@/components/layouts/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, Building2, TrendingUp, Calendar, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect } from "react"

export default function ModernAdminDashboard() {
    const router = useRouter()
    const { user, isLoading } = useAuth()

    useEffect(() => {
        if (!isLoading && (!user || !['SUPER_ADMIN', 'ADMIN'].includes(user.role))) {
            router.push('/auth/login')
        }
    }, [user, isLoading, router])

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    const stats = [
        {
            title: "Total Revenue",
            value: "HK$124,500",
            change: "+12.5%",
            icon: DollarSign,
            trend: "up",
        },
        {
            title: "Active Locations",
            value: "2",
            change: "Cyberport & Wan Chai",
            icon: Building2,
            trend: "up",
        },
        {
            title: "Total Students",
            value: "847",
            change: "+184 this month",
            icon: Users,
            trend: "up",
        },
        {
            title: "Conversion Rate",
            value: "73.2%",
            change: "+5.1%",
            icon: TrendingUp,
            trend: "up",
        },
        {
            title: "Active Classes",
            value: "428",
            change: "+23 this week",
            icon: Calendar,
            trend: "up",
        },
        {
            title: "Coach Utilization",
            value: "87%",
            change: "+3%",
            icon: Activity,
            trend: "up",
        },
    ]

    return (
        <div className="flex flex-col min-h-screen">
            <DashboardHeader title="Admin Dashboard" />
            <main className="flex-1 p-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {stats.map((stat, i) => (
                        <Card
                            key={i}
                            className="border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
                            onClick={() => {
                                if (stat.title.includes("Revenue")) router.push("/admin/payments")
                                else if (stat.title.includes("Locations")) router.push("/admin/outlets")
                                else if (stat.title.includes("Students")) router.push("/admin/analytics")
                                else router.push("/admin/analytics")
                            }}
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                                <stat.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    <span className={stat.trend === "up" ? "text-primary" : "text-destructive"}>{stat.change}</span> from
                                    last period
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Latest updates across all locations</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { outlet: "Cyberport", action: "New enrollment", time: "5 min ago" },
                                { outlet: "Wan Chai", action: "Class completed", time: "12 min ago" },
                                { outlet: "Cyberport", action: "Payment received", time: "23 min ago" },
                                { outlet: "Wan Chai", action: "Coach checked in", time: "1 hour ago" },
                            ].map((activity, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                                    <div>
                                        <p className="text-sm font-medium">{activity.outlet}</p>
                                        <p className="text-xs text-muted-foreground">{activity.action}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle>Location Performance</CardTitle>
                            <CardDescription>Top performing locations this month</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { name: "Cyberport", revenue: "HK$72,450", growth: "+18%" },
                                { name: "Wan Chai", revenue: "HK$52,050", growth: "+15%" },
                            ].map((outlet, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                                    <div>
                                        <p className="text-sm font-medium">{outlet.name}</p>
                                        <p className="text-xs text-muted-foreground">{outlet.revenue}</p>
                                    </div>
                                    <span className="text-sm text-primary font-medium">{outlet.growth}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
