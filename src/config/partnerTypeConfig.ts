// Partner Type Configuration
// Maps partner types to their specific terminology, icons, and UI labels
// This ensures the Partner Admin dashboard adapts dynamically based on partner type

export type PartnerTypeKey = 'school' | 'gym' | 'corporate' | 'sports_academy' | 'ngo' | 'municipal' | 'sports_club' | 'other'

export interface PartnerTypeConfig {
    label: string
    description: string
    memberLabel: string
    memberLabelSingular: string
    memberLabelLower: string
    parentLabel: string
    programLabel: string
    programLabelSingular: string
    enrolledLabel: string
    attendanceLabel: string
    iconName: string
    color: string
    bgColor: string
    dashboardTitle: string
    welcomeMessage: string
}

export const PARTNER_TYPE_OPTIONS: { value: PartnerTypeKey; label: string; description: string; icon: string }[] = [
    { value: 'school', label: 'School', description: 'Educational institution partner', icon: 'GraduationCap' },
    { value: 'gym', label: 'Gym / Fitness Center', description: 'Gym or fitness facility partner', icon: 'Dumbbell' },
    { value: 'corporate', label: 'Corporate', description: 'Corporate wellness partner', icon: 'Building2' },
    { value: 'sports_academy', label: 'Sports Academy', description: 'Sports training academy partner', icon: 'Trophy' },
    { value: 'ngo', label: 'NGO / Non-Profit', description: 'Non-profit organization partner', icon: 'Heart' },
    { value: 'municipal', label: 'Municipal / Government', description: 'Government body or municipality partner', icon: 'Landmark' },
    { value: 'sports_club', label: 'Sports Club', description: 'Sports club or association partner', icon: 'Medal' },
    { value: 'other', label: 'Other', description: 'Other type of partner', icon: 'Briefcase' },
]

export const PARTNER_TYPE_CONFIG: Record<PartnerTypeKey, PartnerTypeConfig> = {
    school: {
        label: 'School',
        description: 'Educational institution partner',
        memberLabel: 'Students',
        memberLabelSingular: 'Student',
        memberLabelLower: 'students',
        parentLabel: 'Parent / Guardian',
        programLabel: 'Programs',
        programLabelSingular: 'Program',
        enrolledLabel: 'Enrolled',
        attendanceLabel: 'Attendance',
        iconName: 'GraduationCap',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        dashboardTitle: 'School Partner Dashboard',
        welcomeMessage: 'Manage your school programs and students',
    },
    gym: {
        label: 'Gym / Fitness Center',
        description: 'Gym or fitness facility partner',
        memberLabel: 'Members',
        memberLabelSingular: 'Member',
        memberLabelLower: 'members',
        parentLabel: 'Emergency Contact',
        programLabel: 'Membership Plans',
        programLabelSingular: 'Plan',
        enrolledLabel: 'Active',
        attendanceLabel: 'Check-ins',
        iconName: 'Dumbbell',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        dashboardTitle: 'Gym Partner Dashboard',
        welcomeMessage: 'Manage your gym memberships and members',
    },
    corporate: {
        label: 'Corporate',
        description: 'Corporate wellness partner',
        memberLabel: 'Employees',
        memberLabelSingular: 'Employee',
        memberLabelLower: 'employees',
        parentLabel: 'HR Contact',
        programLabel: 'Wellness Programs',
        programLabelSingular: 'Program',
        enrolledLabel: 'Enrolled',
        attendanceLabel: 'Participation',
        iconName: 'Building2',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        dashboardTitle: 'Corporate Partner Dashboard',
        welcomeMessage: 'Manage your corporate wellness programs and employees',
    },
    sports_academy: {
        label: 'Sports Academy',
        description: 'Sports training academy partner',
        memberLabel: 'Athletes',
        memberLabelSingular: 'Athlete',
        memberLabelLower: 'athletes',
        parentLabel: 'Parent / Guardian',
        programLabel: 'Training Programs',
        programLabelSingular: 'Program',
        enrolledLabel: 'Enrolled',
        attendanceLabel: 'Training Sessions',
        iconName: 'Trophy',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        dashboardTitle: 'Academy Partner Dashboard',
        welcomeMessage: 'Manage your training programs and athletes',
    },
    ngo: {
        label: 'NGO / Non-Profit',
        description: 'Non-profit organization partner',
        memberLabel: 'Participants',
        memberLabelSingular: 'Participant',
        memberLabelLower: 'participants',
        parentLabel: 'Coordinator',
        programLabel: 'Initiatives',
        programLabelSingular: 'Initiative',
        enrolledLabel: 'Enrolled',
        attendanceLabel: 'Participation',
        iconName: 'Heart',
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
        dashboardTitle: 'NGO Partner Dashboard',
        welcomeMessage: 'Manage your initiatives and participants',
    },
    municipal: {
        label: 'Municipal / Government',
        description: 'Government body or municipality partner',
        memberLabel: 'Citizens',
        memberLabelSingular: 'Citizen',
        memberLabelLower: 'citizens',
        parentLabel: 'Official Contact',
        programLabel: 'Public Programs',
        programLabelSingular: 'Program',
        enrolledLabel: 'Registered',
        attendanceLabel: 'Attendance',
        iconName: 'Landmark',
        color: 'text-teal-600',
        bgColor: 'bg-teal-50',
        dashboardTitle: 'Municipal Partner Dashboard',
        welcomeMessage: 'Manage your public fitness programs and registrations',
    },
    sports_club: {
        label: 'Sports Club',
        description: 'Sports club or association partner',
        memberLabel: 'Members',
        memberLabelSingular: 'Member',
        memberLabelLower: 'members',
        parentLabel: 'Guardian / Contact',
        programLabel: 'Club Programs',
        programLabelSingular: 'Program',
        enrolledLabel: 'Enrolled',
        attendanceLabel: 'Attendance',
        iconName: 'Medal',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        dashboardTitle: 'Sports Club Partner Dashboard',
        welcomeMessage: 'Manage your club programs and members',
    },
    other: {
        label: 'Partner',
        description: 'General partner',
        memberLabel: 'Members',
        memberLabelSingular: 'Member',
        memberLabelLower: 'members',
        parentLabel: 'Contact Person',
        programLabel: 'Programs',
        programLabelSingular: 'Program',
        enrolledLabel: 'Enrolled',
        attendanceLabel: 'Attendance',
        iconName: 'Briefcase',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        dashboardTitle: 'Partner Dashboard',
        welcomeMessage: 'Manage your programs and members',
    },
}

export function getPartnerConfig(partnerType?: string | null): PartnerTypeConfig {
    if (!partnerType) return PARTNER_TYPE_CONFIG.other
    const key = partnerType as PartnerTypeKey
    return PARTNER_TYPE_CONFIG[key] || PARTNER_TYPE_CONFIG.other
}
