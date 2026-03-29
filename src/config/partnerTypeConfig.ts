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
    },
}

export function getPartnerConfig(type: PartnerTypeKey): PartnerTypeConfig {
    return partnerTypeConfigs[type] || partnerTypeConfigs.other
}
