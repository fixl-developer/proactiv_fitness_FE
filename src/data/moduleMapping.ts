export interface PageMapping {
    path: string
    pageName: string
    integratedAt?: string
    status: 'pending' | 'in-progress' | 'completed' | 'failed'
    services: string[]
}

export interface ModuleMapping {
    moduleId: string
    moduleName: string
    category: string
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
    phase: number
    pages: PageMapping[]
    metadata: {
        description: string
        apiEndpoint?: string
    }
}

export const MODULE_MAPPINGS: ModuleMapping[] = [
    // Phase 1: Core Modules
    {
        moduleId: 'iam',
        moduleName: 'Identity & Access Management',
        category: 'Core',
        priority: 'HIGH',
        phase: 1,
        pages: [
            {
                path: '/auth/login',
                pageName: 'Staff Login',
                status: 'completed',
                integratedAt: '2026-03-15',
                services: ['AuthService.login', 'AuthService.validateToken']
            },
            {
                path: '/(auth)/login',
                pageName: 'Parent Login',
                status: 'completed',
                integratedAt: '2026-03-15',
                services: ['AuthService.login', 'AuthService.validateToken']
            },
            {
                path: '/(auth)/register',
                pageName: 'Parent Registration',
                status: 'completed',
                integratedAt: '2026-03-15',
                services: ['AuthService.register']
            },
            {
                path: '/(auth)/forgot-password',
                pageName: 'Forgot Password',
                status: 'completed',
                integratedAt: '2026-03-15',
                services: ['AuthService.forgotPassword']
            },
            {
                path: '/(auth)/verify-email',
                pageName: 'Email Verification',
                status: 'completed',
                integratedAt: '2026-03-15',
                services: ['AuthService.verifyEmail']
            }
        ],
        metadata: {
            description: 'User authentication and authorization',
            apiEndpoint: '/auth'
        }
    },
    {
        moduleId: 'audit-vault',
        moduleName: 'Audit Logging',
        category: 'Core',
        priority: 'HIGH',
        phase: 1,
        pages: [
            {
                path: '/auth/login',
                pageName: 'Staff Login',
                status: 'completed',
                integratedAt: '2026-03-15',
                services: ['AuditLogger.logLogin']
            },
            {
                path: '/(auth)/login',
                pageName: 'Parent Login',
                status: 'completed',
                integratedAt: '2026-03-15',
                services: ['AuditLogger.logLogin']
            },
            {
                path: '/(auth)/register',
                pageName: 'Parent Registration',
                status: 'completed',
                integratedAt: '2026-03-15',
                services: ['AuditLogger.logRegistration']
            }
        ],
        metadata: {
            description: 'Audit logging and compliance tracking',
            apiEndpoint: '/audit'
        }
    },

    // Phase 2: Admin & Management Modules
    {
        moduleId: 'staff',
        moduleName: 'Staff Management',
        category: 'Admin & Management',
        priority: 'HIGH',
        phase: 2,
        pages: [
            {
                path: '/admin/users',
                pageName: 'Admin Users',
                status: 'in-progress',
                services: ['StaffService.getStaff', 'StaffService.createStaff']
            },
            {
                path: '/admin/staff',
                pageName: 'Admin Staff',
                status: 'in-progress',
                services: ['StaffService.getStaff', 'StaffService.updateStaff']
            }
        ],
        metadata: {
            description: 'Staff member management',
            apiEndpoint: '/staff'
        }
    },
    {
        moduleId: 'booking',
        moduleName: 'Booking System',
        category: 'Admin & Management',
        priority: 'HIGH',
        phase: 2,
        pages: [
            {
                path: '/admin/bookings',
                pageName: 'Admin Bookings',
                status: 'in-progress',
                services: ['BookingService.getBookings', 'BookingService.updateBooking']
            },
            {
                path: '/parent/bookings',
                pageName: 'Parent Bookings',
                status: 'in-progress',
                integratedAt: '2026-03-16',
                services: ['BookingService.getBookings', 'BookingService.createBooking']
            },
            {
                path: '/parent/browse-classes',
                pageName: 'Browse Classes',
                status: 'in-progress',
                integratedAt: '2026-03-16',
                services: ['BookingService.searchAvailableSessions']
            }
        ],
        metadata: {
            description: 'Class booking management',
            apiEndpoint: '/bookings'
        }
    },
    {
        moduleId: 'scheduling',
        moduleName: 'Class Scheduling',
        category: 'Admin & Management',
        priority: 'HIGH',
        phase: 2,
        pages: [
            {
                path: '/admin/bookings',
                pageName: 'Admin Bookings',
                status: 'in-progress',
                services: ['SchedulingService.getSchedules']
            },
            {
                path: '/admin/location',
                pageName: 'Admin Location',
                status: 'in-progress',
                services: ['SchedulingService.getSchedules']
            },
            {
                path: '/parent/browse-classes',
                pageName: 'Browse Classes',
                status: 'in-progress',
                integratedAt: '2026-03-16',
                services: ['SchedulingService.getSchedules']
            }
        ],
        metadata: {
            description: 'Class schedule management',
            apiEndpoint: '/scheduling'
        }
    },
    {
        moduleId: 'payments',
        moduleName: 'Payment Processing',
        category: 'Admin & Management',
        priority: 'HIGH',
        phase: 2,
        pages: [
            {
                path: '/admin/payments',
                pageName: 'Admin Payments',
                status: 'in-progress',
                services: ['PaymentService.getPayments', 'PaymentService.processPayment']
            },
            {
                path: '/parent/payments',
                pageName: 'Parent Payments',
                status: 'in-progress',
                integratedAt: '2026-03-16',
                services: ['PaymentService.getPayments', 'PaymentService.processPayment']
            }
        ],
        metadata: {
            description: 'Payment processing and management',
            apiEndpoint: '/payments'
        }
    },
    {
        moduleId: 'billing',
        moduleName: 'Billing System',
        category: 'Admin & Management',
        priority: 'HIGH',
        phase: 2,
        pages: [
            {
                path: '/admin/payments',
                pageName: 'Admin Payments',
                status: 'in-progress',
                services: ['BillingService.getBillings']
            }
        ],
        metadata: {
            description: 'Billing and invoicing',
            apiEndpoint: '/billing'
        }
    },
    {
        moduleId: 'financial-ledger',
        moduleName: 'Financial Tracking',
        category: 'Admin & Management',
        priority: 'HIGH',
        phase: 2,
        pages: [
            {
                path: '/admin/payments',
                pageName: 'Admin Payments',
                status: 'in-progress',
                services: ['FinancialLedgerService.getLedger']
            }
        ],
        metadata: {
            description: 'Financial ledger and tracking',
            apiEndpoint: '/financial-ledger'
        }
    },
    {
        moduleId: 'reporting',
        moduleName: 'Reporting System',
        category: 'Admin & Management',
        priority: 'HIGH',
        phase: 2,
        pages: [
            {
                path: '/admin/dashboard',
                pageName: 'Admin Dashboard',
                status: 'in-progress',
                services: ['ReportingService.getReports']
            }
        ],
        metadata: {
            description: 'Reporting and analytics',
            apiEndpoint: '/reporting'
        }
    },
    {
        moduleId: 'advanced-analytics',
        moduleName: 'Advanced Analytics',
        category: 'Admin & Management',
        priority: 'HIGH',
        phase: 2,
        pages: [
            {
                path: '/admin/dashboard',
                pageName: 'Admin Dashboard',
                status: 'in-progress',
                services: ['AnalyticsService.getAnalytics']
            }
        ],
        metadata: {
            description: 'Advanced analytics and insights',
            apiEndpoint: '/analytics'
        }
    },

    // Phase 3: Coach Modules
    {
        moduleId: 'attendance',
        moduleName: 'Attendance Tracking',
        category: 'Coach',
        priority: 'HIGH',
        phase: 3,
        pages: [
            {
                path: '/coach/dashboard',
                pageName: 'Coach Dashboard',
                status: 'in-progress',
                services: ['AttendanceService.getAttendance']
            }
        ],
        metadata: {
            description: 'Student attendance tracking',
            apiEndpoint: '/attendance'
        }
    },
    {
        moduleId: 'programs',
        moduleName: 'Program Management',
        category: 'Coach',
        priority: 'HIGH',
        phase: 3,
        pages: [
            {
                path: '/coach/students',
                pageName: 'Coach Students',
                status: 'in-progress',
                services: ['ProgramService.getPrograms']
            }
        ],
        metadata: {
            description: 'Program and curriculum management',
            apiEndpoint: '/programs'
        }
    },

    // Phase 4: Parent Modules
    {
        moduleId: 'parent-engagement',
        moduleName: 'Parent Engagement',
        category: 'Parent & Student',
        priority: 'HIGH',
        phase: 4,
        pages: [
            {
                path: '/parent/dashboard',
                pageName: 'Parent Dashboard',
                status: 'in-progress',
                integratedAt: '2026-03-16',
                services: ['ParentEngagementService.getEngagement']
            }
        ],
        metadata: {
            description: 'Parent engagement and communication',
            apiEndpoint: '/parent-engagement'
        }
    },
    {
        moduleId: 'parent-roi',
        moduleName: 'Parent ROI Tracking',
        category: 'Parent & Student',
        priority: 'HIGH',
        phase: 4,
        pages: [
            {
                path: '/parent/dashboard',
                pageName: 'Parent Dashboard',
                status: 'in-progress',
                integratedAt: '2026-03-16',
                services: ['ParentROIService.getROI']
            }
        ],
        metadata: {
            description: 'Parent ROI and progress tracking',
            apiEndpoint: '/parent-roi'
        }
    },
    {
        moduleId: 'waitlist',
        moduleName: 'Waitlist Management',
        category: 'Parent & Student',
        priority: 'HIGH',
        phase: 4,
        pages: [
            {
                path: '/parent/waitlist',
                pageName: 'Parent Waitlist',
                status: 'in-progress',
                integratedAt: '2026-03-16',
                services: ['WaitlistService.getWaitlist']
            }
        ],
        metadata: {
            description: 'Class waitlist management',
            apiEndpoint: '/waitlist'
        }
    },
    {
        moduleId: 'family-scheduler',
        moduleName: 'Family Scheduling',
        category: 'Parent & Student',
        priority: 'HIGH',
        phase: 4,
        pages: [
            {
                path: '/parent/children',
                pageName: 'Parent Children',
                status: 'in-progress',
                integratedAt: '2026-03-16',
                services: ['FamilySchedulerService.getSchedule']
            }
        ],
        metadata: {
            description: 'Family schedule management',
            apiEndpoint: '/family-scheduler'
        }
    },

    // Phase 5: Support Modules
    {
        moduleId: 'support',
        moduleName: 'Support Ticket System',
        category: 'Support',
        priority: 'MEDIUM',
        phase: 5,
        pages: [
            {
                path: '/staff/dashboard',
                pageName: 'Support Dashboard',
                status: 'pending',
                services: ['SupportService.getTickets']
            }
        ],
        metadata: {
            description: 'Support ticket management',
            apiEndpoint: '/support'
        }
    },
    {
        moduleId: 'notifications',
        moduleName: 'Notification System',
        category: 'Support',
        priority: 'MEDIUM',
        phase: 5,
        pages: [
            {
                path: '/staff/dashboard',
                pageName: 'Support Dashboard',
                status: 'pending',
                services: ['NotificationService.getNotifications']
            }
        ],
        metadata: {
            description: 'Notification management',
            apiEndpoint: '/notifications'
        }
    },

    // Phase 6: Partner Modules
    {
        moduleId: 'partner-portal',
        moduleName: 'Partner Portal',
        category: 'Partner & Integration',
        priority: 'MEDIUM',
        phase: 6,
        pages: [
            {
                path: '/partner/dashboard',
                pageName: 'Partner Dashboard',
                status: 'pending',
                services: ['PartnerPortalService.getPartnerData']
            }
        ],
        metadata: {
            description: 'Partner portal and management',
            apiEndpoint: '/partner-portal'
        }
    },
    {
        moduleId: 'integrations',
        moduleName: 'Third-Party Integrations',
        category: 'Partner & Integration',
        priority: 'MEDIUM',
        phase: 6,
        pages: [
            {
                path: '/partner/integrations',
                pageName: 'Partner Integrations',
                status: 'pending',
                services: ['IntegrationService.getIntegrations']
            }
        ],
        metadata: {
            description: 'Third-party integrations',
            apiEndpoint: '/integrations'
        }
    }
]

export function getModuleMapping(moduleId: string): ModuleMapping | undefined {
    return MODULE_MAPPINGS.find(m => m.moduleId === moduleId)
}

export function getModulesByPhase(phase: number): ModuleMapping[] {
    return MODULE_MAPPINGS.filter(m => m.phase === phase)
}

export function getModulesByCategory(category: string): ModuleMapping[] {
    return MODULE_MAPPINGS.filter(m => m.category === category)
}

export function getAllModules(): ModuleMapping[] {
    return MODULE_MAPPINGS
}

export function getIntegrationStatus(): Record<string, { completed: number; total: number; percentage: number }> {
    const status: Record<string, { completed: number; total: number; percentage: number }> = {}

    for (const module of MODULE_MAPPINGS) {
        const completed = module.pages.filter(p => p.status === 'completed').length
        const total = module.pages.length
        status[module.moduleId] = {
            completed,
            total,
            percentage: total > 0 ? (completed / total) * 100 : 0
        }
    }

    return status
}
