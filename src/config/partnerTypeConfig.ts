export interface PartnerTypeOption {
    value: string
    label: string
    description: string
}

export const PARTNER_TYPE_OPTIONS: PartnerTypeOption[] = [
    {
        value: 'school',
        label: 'School',
        description: 'Educational institution offering gymnastics programs',
    },
    {
        value: 'gym',
        label: 'Gym / Studio',
        description: 'Fitness facility or gymnastics studio',
    },
    {
        value: 'club',
        label: 'Sports Club',
        description: 'Sports or recreational club',
    },
    {
        value: 'franchise',
        label: 'Franchise',
        description: 'Franchise partner operating under ProActiv brand',
    },
]

// =============================================
// Partner Type Configuration (used by PartnerContext)
// =============================================
export type PartnerTypeKey = 'school' | 'gym' | 'club' | 'franchise' | 'other'

export interface PartnerTypeConfig {
    key: PartnerTypeKey
    label: string
    description: string
    dashboardTitle: string
    terminologyStudent: string
    terminologyStudentPlural: string
    terminologyClass: string
    terminologyClassPlural: string
    primaryColor: string
    icon: string
    // Derived labels used across partner dashboard pages
    memberLabel: string
    memberLabelSingular: string
    memberLabelLower: string
    enrolledLabel: string
    programLabel: string
    programLabelSingular: string
}

const partnerTypeConfigs: Record<PartnerTypeKey, PartnerTypeConfig> = {
    school: {
        key: 'school',
        label: 'School',
        description: 'Educational institution',
        dashboardTitle: 'School Dashboard',
        terminologyStudent: 'Student',
        terminologyStudentPlural: 'Students',
        terminologyClass: 'Class',
        terminologyClassPlural: 'Classes',
        primaryColor: 'blue',
        icon: 'GraduationCap',
        memberLabel: 'Students',
        memberLabelSingular: 'Student',
        memberLabelLower: 'students',
        enrolledLabel: 'enrolled',
        programLabel: 'Programs',
        programLabelSingular: 'Program',
    },
    gym: {
        key: 'gym',
        label: 'Gym / Studio',
        description: 'Fitness facility or gymnastics studio',
        dashboardTitle: 'Gym Dashboard',
        terminologyStudent: 'Member',
        terminologyStudentPlural: 'Members',
        terminologyClass: 'Session',
        terminologyClassPlural: 'Sessions',
        primaryColor: 'green',
        icon: 'Dumbbell',
        memberLabel: 'Members',
        memberLabelSingular: 'Member',
        memberLabelLower: 'members',
        enrolledLabel: 'enrolled',
        programLabel: 'Sessions',
        programLabelSingular: 'Session',
    },
    club: {
        key: 'club',
        label: 'Sports Club',
        description: 'Sports or recreational club',
        dashboardTitle: 'Club Dashboard',
        terminologyStudent: 'Athlete',
        terminologyStudentPlural: 'Athletes',
        terminologyClass: 'Training',
        terminologyClassPlural: 'Trainings',
        primaryColor: 'purple',
        icon: 'Trophy',
        memberLabel: 'Athletes',
        memberLabelSingular: 'Athlete',
        memberLabelLower: 'athletes',
        enrolledLabel: 'enrolled',
        programLabel: 'Trainings',
        programLabelSingular: 'Training',
    },
    franchise: {
        key: 'franchise',
        label: 'Franchise',
        description: 'Franchise partner operating under ProActiv brand',
        dashboardTitle: 'Franchise Dashboard',
        terminologyStudent: 'Student',
        terminologyStudentPlural: 'Students',
        terminologyClass: 'Class',
        terminologyClassPlural: 'Classes',
        primaryColor: 'orange',
        icon: 'Building2',
        memberLabel: 'Students',
        memberLabelSingular: 'Student',
        memberLabelLower: 'students',
        enrolledLabel: 'enrolled',
        programLabel: 'Programs',
        programLabelSingular: 'Program',
    },
    other: {
        key: 'other',
        label: 'Partner',
        description: 'General partner',
        dashboardTitle: 'Partner Dashboard',
        terminologyStudent: 'Participant',
        terminologyStudentPlural: 'Participants',
        terminologyClass: 'Program',
        terminologyClassPlural: 'Programs',
        primaryColor: 'gray',
        icon: 'Users',
        memberLabel: 'Participants',
        memberLabelSingular: 'Participant',
        memberLabelLower: 'participants',
        enrolledLabel: 'enrolled',
        programLabel: 'Programs',
        programLabelSingular: 'Program',
    },
}

export function getPartnerConfig(type: PartnerTypeKey): PartnerTypeConfig {
    return partnerTypeConfigs[type] || partnerTypeConfigs.other
}
