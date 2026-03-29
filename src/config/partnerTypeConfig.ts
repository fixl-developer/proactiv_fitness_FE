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
