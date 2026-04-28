import { apiClient } from '@/services/api/client'

// =============================================
// TYPES
// =============================================
export interface HeroSlide {
    id: string
    title: string
    subtitle?: string
    image: string
    fallbackGradient?: string
    ctaText?: string
    ctaLink?: string
    order: number
}

export interface SiteStat {
    id: string
    label: string
    value: number
    suffix: string
    icon: string
    color: string
}

export interface ServiceCardData {
    id: string
    title: string
    description: string
    image: string
    emoji: string
    features: string[]
    href: string
    color: string
    gradient: string
    order: number
}

export interface TestimonialData {
    id: string
    name: string
    role: string
    rating: number
    text: string
    image: string
    fallbackGradient: string
    program: string
}

export interface ClientPartnerData {
    id: string
    name: string
    logo: string
    fallbackText: string
    color: string
}

export interface AboutContentData {
    id?: string
    mission: string
    vision: string
    values: Array<{ title: string; description: string; icon: string }>
    stats: Array<{ label: string; value: string; icon: string }>
    images: string[]
    history: string
    features: Array<{ title: string; description: string; icon: string }>
}

export interface AIFeatureData {
    id: string
    title: string
    description: string
    icon: string
    color: string
    bgColor: string
}

export interface AssessmentData {
    id: string
    title: string
    description: string
    image: string
    time: string
    duration: string
    days: string
    ageGroup: string
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
    price: string
    isFree: boolean
    availableSlots: number
    totalSlots: number
    category: string
    location: string
}

export interface ClassSessionData {
    id: string
    title: string
    description: string
    image: string
    time: string
    duration: string
    days: string
    ageGroup: string
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
    price: string
    isFree: boolean
    availableSlots: number
    totalSlots: number
    category: string
    location: string
}

export interface PartyPackageData {
    id: string
    name: string
    duration: string
    maxKids: number
    coaches: number
    partyRoomTime: string
    features: string[]
    notIncluded: string[]
    price: string
    image: string
    popular?: boolean
}

export interface ProgramLevelData {
    id: string
    name: string
    description: string
    image: string
    ageGroup: string
    duration: string
    classSize: string
    price: string
    objectives: string[]
    schedule: Array<{ location: string; days: string; time: string }>
    color: string
    icon: string
}

export interface CampProgramData {
    id: string
    title: string
    description: string
    image: string
    dates: string
    price: string
    ageGroup: string
    activities: string[]
    features: string[]
    location: string
}

export interface LocationDetailData {
    id: string
    name: string
    slug: string
    address: string
    phone: string
    email: string
    hours: Array<{ day: string; time: string }>
    facilities: Array<{ name: string; description: string; features: string[] }>
    schedule: Array<{
        day: string
        slots: Array<{
            time: string
            program: string
            ageGroup: string
            level: string
            spots: string
        }>
    }>
    team: Array<{
        name: string
        role: string
        specialization: string
        experience: string
        image: string
    }>
    images: string[]
    mapUrl: string
}

export interface BlogPostData {
    id: string
    title: string
    slug: string
    excerpt: string
    content: string
    author: string
    authorImage: string
    date: string
    category: string
    tags: string[]
    image: string
    readTime: string
    isFeatured: boolean
    isPublished: boolean
}

export interface JobPositionData {
    id: string
    title: string
    location: string
    type: string
    description: string
    requirements: string[]
    responsibilities: string[]
    benefits: string[]
    salary: string
    image: string
}

export interface ContactInfoData {
    id?: string
    phone: string
    email: string
    address: string
    hours: string
    whatsapp: string
    socialLinks: Array<{ platform: string; url: string; icon: string }>
    mapUrl: string
}

export interface FAQItemData {
    id: string
    question: string
    answer: string
    category: string
}

// =============================================
// Header Navigation
// =============================================
export interface NavMenuItemData {
    id?: string
    label: string
    href: string
    parentLabel: string
    order: number
    isActive: boolean
    icon?: string
}

export interface NavMenuTreeItem {
    label: string
    href: string
    order: number
    dropdown?: Array<{ label: string; href: string }>
}

// =============================================
// Page Content (per-slug singleton)
// =============================================
export interface PageContentHero {
    title: string
    subtitle: string
    backgroundImage: string
    fallbackGradient: string
    ctaText: string
    ctaLink: string
    height: 'small' | 'medium' | 'large' | 'xlarge'
}

export interface PageContentSection {
    key: string
    title: string
    subtitle: string
    body: string
    image: string
    items: any[]
    order: number
    isActive: boolean
}

export interface PageContentData {
    id?: string
    slug: string
    name: string
    hero: PageContentHero
    sections: PageContentSection[]
    seo: {
        metaTitle: string
        metaDescription: string
        keywords: string[]
    }
    isActive: boolean
}

// =============================================
// Team Member
// =============================================
export interface TeamMemberData {
    id: string
    name: string
    role: string
    bio: string
    image: string
    fallbackGradient: string
    specialization: string
    experience: string
    qualifications: string[]
    socialLinks: Array<{ platform: string; url: string }>
    location: string
    order: number
    isActive: boolean
}

export interface LandingPageData {
    heroSlides: HeroSlide[]
    stats: SiteStat[]
    services: ServiceCardData[]
    testimonials: TestimonialData[]
    partners: ClientPartnerData[]
    about: AboutContentData | null
    aiFeatures: AIFeatureData[]
    navMenu: NavMenuTreeItem[]
}

// =============================================
// PUBLIC CMS SERVICE (for frontend website)
// =============================================
class CMSPublicService {
    private baseUrl = '/cms'

    async getLandingPageData(): Promise<LandingPageData> {
        const response = await apiClient.get<any>(`${this.baseUrl}/landing-page`)
        return response.data
    }

    async getHeroSlides(): Promise<HeroSlide[]> {
        const response = await apiClient.get<any>(`${this.baseUrl}/hero-slides`)
        return response.data || []
    }

    async getSiteStats(): Promise<SiteStat[]> {
        const response = await apiClient.get<any>(`${this.baseUrl}/stats`)
        return response.data || []
    }

    async getServices(): Promise<ServiceCardData[]> {
        const response = await apiClient.get<any>(`${this.baseUrl}/services`)
        return response.data || []
    }

    async getTestimonials(): Promise<TestimonialData[]> {
        const response = await apiClient.get<any>(`${this.baseUrl}/testimonials`)
        return response.data || []
    }

    async getPartners(): Promise<ClientPartnerData[]> {
        const response = await apiClient.get<any>(`${this.baseUrl}/partners`)
        return response.data || []
    }

    async getAbout(): Promise<AboutContentData | null> {
        const response = await apiClient.get<any>(`${this.baseUrl}/about`)
        return response.data
    }

    async getAIFeatures(): Promise<AIFeatureData[]> {
        const response = await apiClient.get<any>(`${this.baseUrl}/ai-features`)
        return response.data || []
    }

    async getAssessments(): Promise<AssessmentData[]> {
        const response = await apiClient.get<any>(`${this.baseUrl}/assessments`)
        return response.data || []
    }

    async getClassSessions(params?: { category?: string; location?: string }): Promise<ClassSessionData[]> {
        const response = await apiClient.get<any>(`${this.baseUrl}/classes`, { params })
        return response.data || []
    }

    async getPartyPackages(): Promise<PartyPackageData[]> {
        const response = await apiClient.get<any>(`${this.baseUrl}/party-packages`)
        return response.data || []
    }

    async getProgramLevels(): Promise<ProgramLevelData[]> {
        const response = await apiClient.get<any>(`${this.baseUrl}/programs`)
        return response.data || []
    }

    async getCampPrograms(): Promise<CampProgramData[]> {
        const response = await apiClient.get<any>(`${this.baseUrl}/camps`)
        return response.data || []
    }

    async getLocations(): Promise<LocationDetailData[]> {
        const response = await apiClient.get<any>(`${this.baseUrl}/locations`)
        return response.data || []
    }

    async getLocationBySlug(slug: string): Promise<LocationDetailData | null> {
        const response = await apiClient.get<any>(`${this.baseUrl}/locations/${slug}`)
        return response.data
    }

    async getBlogPosts(category?: string): Promise<BlogPostData[]> {
        const response = await apiClient.get<any>(`${this.baseUrl}/blog`, { params: { category } })
        return response.data || []
    }

    async getBlogBySlug(slug: string): Promise<BlogPostData | null> {
        const response = await apiClient.get<any>(`${this.baseUrl}/blog/${slug}`)
        return response.data
    }

    async getFeaturedBlogPosts(): Promise<BlogPostData[]> {
        const response = await apiClient.get<any>(`${this.baseUrl}/blog/featured`)
        return response.data || []
    }

    async getJobPositions(): Promise<JobPositionData[]> {
        const response = await apiClient.get<any>(`${this.baseUrl}/careers`)
        return response.data || []
    }

    async getContactInfo(): Promise<ContactInfoData | null> {
        const response = await apiClient.get<any>(`${this.baseUrl}/contact-info`)
        return response.data
    }

    async getFAQs(category?: string): Promise<FAQItemData[]> {
        const response = await apiClient.get<any>(`${this.baseUrl}/faqs`, { params: { category } })
        return response.data || []
    }

    async getNavMenu(): Promise<NavMenuTreeItem[]> {
        const response = await apiClient.get<any>(`${this.baseUrl}/nav-menu`)
        return response.data || []
    }

    async getPageContent(slug: string): Promise<PageContentData | null> {
        try {
            const response = await apiClient.get<any>(`${this.baseUrl}/page/${slug}`)
            return response.data
        } catch {
            return null
        }
    }

    async getTeamMembers(): Promise<TeamMemberData[]> {
        const response = await apiClient.get<any>(`${this.baseUrl}/team`)
        return response.data || []
    }
}

// =============================================
// ADMIN CMS SERVICE (for admin dashboard)
// =============================================
class CMSAdminServiceClass {
    private baseUrl = '/admin/cms'

    private async _getAll(endpoint: string, params?: any) {
        const response = await apiClient.get<any>(`${this.baseUrl}/${endpoint}`, { params })
        // response = {success, data, message} from apiClient
        // Return full response so CMSCrudTable can access response.data
        return response
    }

    private async _getById(endpoint: string, id: string) {
        const response = await apiClient.get<any>(`${this.baseUrl}/${endpoint}/${id}`)
        return response.data
    }

    private async _create(endpoint: string, data: any) {
        const response = await apiClient.post<any>(`${this.baseUrl}/${endpoint}`, data)
        return response.data
    }

    private async _update(endpoint: string, id: string, data: any) {
        const response = await apiClient.patch<any>(`${this.baseUrl}/${endpoint}/${id}`, data)
        return response.data
    }

    private async _delete(endpoint: string, id: string) {
        const response = await apiClient.delete<any>(`${this.baseUrl}/${endpoint}/${id}`)
        return response.data
    }

    heroSlides = {
        getAll: (params?: any) => this._getAll('hero-slides', params),
        getById: (id: string) => this._getById('hero-slides', id),
        create: (data: any) => this._create('hero-slides', data),
        update: (id: string, data: any) => this._update('hero-slides', id, data),
        delete: (id: string) => this._delete('hero-slides', id),
    }

    siteStats = {
        getAll: (params?: any) => this._getAll('stats', params),
        getById: (id: string) => this._getById('stats', id),
        create: (data: any) => this._create('stats', data),
        update: (id: string, data: any) => this._update('stats', id, data),
        delete: (id: string) => this._delete('stats', id),
    }

    serviceCards = {
        getAll: (params?: any) => this._getAll('services', params),
        getById: (id: string) => this._getById('services', id),
        create: (data: any) => this._create('services', data),
        update: (id: string, data: any) => this._update('services', id, data),
        delete: (id: string) => this._delete('services', id),
    }

    testimonials = {
        getAll: (params?: any) => this._getAll('testimonials', params),
        getById: (id: string) => this._getById('testimonials', id),
        create: (data: any) => this._create('testimonials', data),
        update: (id: string, data: any) => this._update('testimonials', id, data),
        delete: (id: string) => this._delete('testimonials', id),
    }

    partners = {
        getAll: (params?: any) => this._getAll('partners', params),
        getById: (id: string) => this._getById('partners', id),
        create: (data: any) => this._create('partners', data),
        update: (id: string, data: any) => this._update('partners', id, data),
        delete: (id: string) => this._delete('partners', id),
    }

    aiFeatures = {
        getAll: (params?: any) => this._getAll('ai-features', params),
        getById: (id: string) => this._getById('ai-features', id),
        create: (data: any) => this._create('ai-features', data),
        update: (id: string, data: any) => this._update('ai-features', id, data),
        delete: (id: string) => this._delete('ai-features', id),
    }

    assessments = {
        getAll: (params?: any) => this._getAll('assessments', params),
        getById: (id: string) => this._getById('assessments', id),
        create: (data: any) => this._create('assessments', data),
        update: (id: string, data: any) => this._update('assessments', id, data),
        delete: (id: string) => this._delete('assessments', id),
    }

    classSessions = {
        getAll: (params?: any) => this._getAll('classes', params),
        getById: (id: string) => this._getById('classes', id),
        create: (data: any) => this._create('classes', data),
        update: (id: string, data: any) => this._update('classes', id, data),
        delete: (id: string) => this._delete('classes', id),
    }

    partyPackages = {
        getAll: (params?: any) => this._getAll('party-packages', params),
        getById: (id: string) => this._getById('party-packages', id),
        create: (data: any) => this._create('party-packages', data),
        update: (id: string, data: any) => this._update('party-packages', id, data),
        delete: (id: string) => this._delete('party-packages', id),
    }

    programLevels = {
        getAll: (params?: any) => this._getAll('programs', params),
        getById: (id: string) => this._getById('programs', id),
        create: (data: any) => this._create('programs', data),
        update: (id: string, data: any) => this._update('programs', id, data),
        delete: (id: string) => this._delete('programs', id),
    }

    campPrograms = {
        getAll: (params?: any) => this._getAll('camps', params),
        getById: (id: string) => this._getById('camps', id),
        create: (data: any) => this._create('camps', data),
        update: (id: string, data: any) => this._update('camps', id, data),
        delete: (id: string) => this._delete('camps', id),
    }

    locationDetails = {
        getAll: (params?: any) => this._getAll('locations', params),
        getById: (id: string) => this._getById('locations', id),
        create: (data: any) => this._create('locations', data),
        update: (id: string, data: any) => this._update('locations', id, data),
        delete: (id: string) => this._delete('locations', id),
    }

    blogPosts = {
        getAll: (params?: any) => this._getAll('blog', params),
        getById: (id: string) => this._getById('blog', id),
        create: (data: any) => this._create('blog', data),
        update: (id: string, data: any) => this._update('blog', id, data),
        delete: (id: string) => this._delete('blog', id),
    }

    jobPositions = {
        getAll: (params?: any) => this._getAll('careers', params),
        getById: (id: string) => this._getById('careers', id),
        create: (data: any) => this._create('careers', data),
        update: (id: string, data: any) => this._update('careers', id, data),
        delete: (id: string) => this._delete('careers', id),
    }

    faqItems = {
        getAll: (params?: any) => this._getAll('faqs', params),
        getById: (id: string) => this._getById('faqs', id),
        create: (data: any) => this._create('faqs', data),
        update: (id: string, data: any) => this._update('faqs', id, data),
        delete: (id: string) => this._delete('faqs', id),
    }

    navMenuItems = {
        getAll: (params?: any) => this._getAll('nav-menu', params),
        getById: (id: string) => this._getById('nav-menu', id),
        create: (data: any) => this._create('nav-menu', data),
        update: (id: string, data: any) => this._update('nav-menu', id, data),
        delete: (id: string) => this._delete('nav-menu', id),
    }

    teamMembers = {
        getAll: (params?: any) => this._getAll('team', params),
        getById: (id: string) => this._getById('team', id),
        create: (data: any) => this._create('team', data),
        update: (id: string, data: any) => this._update('team', id, data),
        delete: (id: string) => this._delete('team', id),
    }

    pageContents = {
        list: async () => {
            const response = await apiClient.get<any>(`${this.baseUrl}/pages`)
            return response.data || []
        },
        get: async (slug: string) => {
            const response = await apiClient.get<any>(`${this.baseUrl}/page/${slug}`)
            return response.data
        },
        upsert: async (slug: string, data: any) => {
            const response = await apiClient.put<any>(`${this.baseUrl}/page/${slug}`, data)
            return response.data
        },
    }

    about = {
        get: async () => {
            const response = await apiClient.get<any>(`${this.baseUrl}/about`)
            return response.data
        },
        upsert: async (data: any) => {
            const response = await apiClient.put<any>(`${this.baseUrl}/about`, data)
            return response.data
        },
    }

    contactInfo = {
        get: async () => {
            const response = await apiClient.get<any>(`${this.baseUrl}/contact-info`)
            return response.data
        },
        upsert: async (data: any) => {
            const response = await apiClient.put<any>(`${this.baseUrl}/contact-info`, data)
            return response.data
        },
    }

    // Seed default data (only fills empty collections)
    async seedDefaultData(): Promise<{ seeded: string[]; skipped: string[] }> {
        const response = await apiClient.post<any>(`${this.baseUrl}/seed`)
        return response.data
    }

    // Reset all data and re-seed with defaults
    async resetAndSeedData(): Promise<{ cleared: string[]; seeded: string[]; skipped: string[] }> {
        const response = await apiClient.post<any>(`${this.baseUrl}/reset-and-seed`)
        return response.data
    }

    async reseedPagesAndLocations(): Promise<{ pageContents: string[]; locations: string[] }> {
        const response = await apiClient.post<any>(`${this.baseUrl}/reseed-pages-and-locations`)
        return response.data
    }
}

export const CMSService = new CMSPublicService()
export const CMSAdminService = new CMSAdminServiceClass()
export default CMSService
