export type CampCategory = 'gymnastics' | 'multi-activity' | 'shenzhen-competitive'

export interface CampOffering {
    id: number
    category: CampCategory
    name: string
    dates: string
    duration: string
    time: string
    location: string
    price: string
    level: string
    spotsLeft: number
    highlights: string[]
}

export const GYMNASTICS_CAMPS: CampOffering[] = [
    {
        id: 1,
        category: 'gymnastics',
        name: 'Christmas Holiday Camp',
        dates: 'Dec 18-22, 2024',
        duration: '5 days',
        time: '9:00 AM - 3:00 PM',
        location: 'Both Locations',
        price: 'HK$2,500',
        level: 'All Levels',
        spotsLeft: 8,
        highlights: ['Christmas themed activities', 'Special performances', 'Holiday crafts'],
    },
    {
        id: 2,
        category: 'gymnastics',
        name: 'New Year Skills Camp',
        dates: 'Jan 2-5, 2025',
        duration: '4 days',
        time: '10:00 AM - 4:00 PM',
        location: 'Cyberport',
        price: 'HK$2,200',
        level: 'Intermediate/Advanced',
        spotsLeft: 5,
        highlights: ['Skill assessments', 'Goal setting', 'Progress tracking'],
    },
    {
        id: 3,
        category: 'gymnastics',
        name: 'Chinese New Year Camp',
        dates: 'Feb 10-14, 2025',
        duration: '5 days',
        time: '9:00 AM - 3:00 PM',
        location: 'Wan Chai',
        price: 'HK$2,600',
        level: 'All Levels',
        spotsLeft: 12,
        highlights: ['Cultural activities', 'Lion dance workshop', 'Traditional games'],
    },
    {
        id: 4,
        category: 'gymnastics',
        name: 'Easter Skills Intensive',
        dates: 'Apr 14-18, 2025',
        duration: '5 days',
        time: '9:00 AM - 4:00 PM',
        location: 'Both Locations',
        price: 'HK$2,800',
        level: 'Advanced',
        spotsLeft: 6,
        highlights: ['Competition prep', 'Advanced skills', 'Mental training'],
    },
]

export const MULTI_ACTIVITY_CAMPS: CampOffering[] = [
    {
        id: 1,
        category: 'multi-activity',
        name: 'Winter Multi-Activity Camp',
        dates: 'Dec 18-22, 2024',
        duration: '5 days',
        time: '9:00 AM - 4:00 PM',
        location: 'Both Locations',
        price: 'HK$2,800',
        level: '5-12 years',
        spotsLeft: 10,
        highlights: ['Winter sports', 'Holiday crafts', 'Special performances'],
    },
    {
        id: 2,
        category: 'multi-activity',
        name: 'Adventure Explorer Camp',
        dates: 'Jan 8-12, 2025',
        duration: '5 days',
        time: '9:00 AM - 4:00 PM',
        location: 'Cyberport',
        price: 'HK$2,900',
        level: '6-14 years',
        spotsLeft: 8,
        highlights: ['Outdoor adventures', 'Team building', 'Leadership skills'],
    },
    {
        id: 3,
        category: 'multi-activity',
        name: 'Creative Arts Camp',
        dates: 'Feb 17-21, 2025',
        duration: '5 days',
        time: '10:00 AM - 3:00 PM',
        location: 'Wan Chai',
        price: 'HK$2,600',
        level: '4-10 years',
        spotsLeft: 12,
        highlights: ['Art exhibitions', 'Creative projects', 'Performance showcase'],
    },
    {
        id: 4,
        category: 'multi-activity',
        name: 'Sports & Science Camp',
        dates: 'Apr 21-25, 2025',
        duration: '5 days',
        time: '9:00 AM - 4:00 PM',
        location: 'Both Locations',
        price: 'HK$3,000',
        level: '7-15 years',
        spotsLeft: 6,
        highlights: ['Sports science', 'Experiments', 'Technology integration'],
    },
]

export const SHENZHEN_CAMPS: CampOffering[] = [
    {
        id: 1,
        category: 'shenzhen-competitive',
        name: 'Winter Intensive Training',
        dates: 'Dec 26-30, 2024',
        duration: '5 days',
        time: '9:00 AM - 5:00 PM',
        location: 'Shenzhen Training Center',
        price: 'HK$4,500',
        level: 'Competitive Level 6+',
        spotsLeft: 4,
        highlights: ['Individual coaching', 'Video analysis', 'Competition simulation'],
    },
    {
        id: 2,
        category: 'shenzhen-competitive',
        name: 'Spring Competition Prep',
        dates: 'Mar 24-28, 2025',
        duration: '5 days',
        time: '8:00 AM - 6:00 PM',
        location: 'Shenzhen Training Center',
        price: 'HK$5,200',
        level: 'Competitive Level 7+',
        spotsLeft: 3,
        highlights: ['Mock competitions', 'Mental training', 'Routine perfection'],
    },
    {
        id: 3,
        category: 'shenzhen-competitive',
        name: 'Summer Elite Camp',
        dates: 'Jul 14-25, 2025',
        duration: '12 days',
        time: '8:00 AM - 6:00 PM',
        location: 'Shenzhen Training Center',
        price: 'HK$12,000',
        level: 'Elite Level 8+',
        spotsLeft: 2,
        highlights: ['Elite coaching', 'International standards', 'Scholarship opportunities'],
    },
]

const ALL_CAMPS: CampOffering[] = [
    ...GYMNASTICS_CAMPS,
    ...MULTI_ACTIVITY_CAMPS,
    ...SHENZHEN_CAMPS,
]

export const findCamp = (
    category: CampCategory | string | null | undefined,
    id: number | string | null | undefined,
): CampOffering | undefined => {
    if (!id) return undefined
    const numId = typeof id === 'string' ? Number(id) : id
    if (Number.isNaN(numId)) return undefined
    if (category) {
        return ALL_CAMPS.find((c) => c.category === category && c.id === numId)
    }
    return ALL_CAMPS.find((c) => c.id === numId)
}

export const CATEGORY_LABEL: Record<CampCategory, string> = {
    gymnastics: 'Gymnastics Holiday Camp',
    'multi-activity': 'Multi-Activity Holiday Camp',
    'shenzhen-competitive': 'Shenzhen Competitive Training',
}
