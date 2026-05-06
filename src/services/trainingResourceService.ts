import { apiClient } from '@/services/api/client'

export type ResourceType = 'document' | 'video' | 'article' | 'course' | 'link' | 'pdf'
export type ResourceCategory =
    | 'customer-service'
    | 'product-knowledge'
    | 'tools-systems'
    | 'soft-skills'
    | 'compliance'
    | 'onboarding'
    | 'other'

export interface TrainingResource {
    _id: string
    id?: string
    title: string
    description: string
    url: string
    type: ResourceType
    category: ResourceCategory
    tags: string[]
    estimatedMinutes: number
    featured: boolean
    isActive: boolean
    addedByName?: string
    viewCount: number
    lastOpenedAt?: string
    createdAt: string
    updatedAt: string
}

export interface ListResponse {
    resources: TrainingResource[]
    total: number
    page: number
    limit: number
    pages: number
}

export interface UserStats {
    totalResources: number
    viewedResources: number
    totalMinutes: number
    totalHours: number
    currentStreak: number
    recentViews: {
        openedAt: string
        resource: {
            id: string
            title: string
            category: string
            type: string
            estimatedMinutes: number
        } | null
    }[]
}

export interface ListFilters {
    search?: string
    category?: ResourceCategory | ''
    type?: ResourceType | ''
    featured?: boolean
    page?: number
    limit?: number
}

export interface SaveResourceInput {
    title: string
    description: string
    url: string
    type?: ResourceType
    category?: ResourceCategory
    tags?: string[]
    estimatedMinutes?: number
    featured?: boolean
}

const unwrap = <T>(res: any): T => (res?.data ?? res) as T

class TrainingResourceService {
    async list(filters: ListFilters = {}): Promise<ListResponse> {
        const params = new URLSearchParams()
        if (filters.search) params.append('search', filters.search)
        if (filters.category) params.append('category', filters.category)
        if (filters.type) params.append('type', filters.type)
        if (typeof filters.featured === 'boolean') params.append('featured', String(filters.featured))
        params.append('page', String(filters.page ?? 1))
        params.append('limit', String(filters.limit ?? 50))

        const res = await apiClient.get<any>(`/training-resources?${params.toString()}`)
        return unwrap<ListResponse>(res)
    }

    async getOne(id: string): Promise<TrainingResource> {
        const res = await apiClient.get<any>(`/training-resources/${id}`)
        return unwrap<TrainingResource>(res)
    }

    async create(input: SaveResourceInput): Promise<TrainingResource> {
        const res = await apiClient.post<any>('/training-resources', input)
        return unwrap<TrainingResource>(res)
    }

    async update(id: string, input: Partial<SaveResourceInput>): Promise<TrainingResource> {
        const res = await apiClient.put<any>(`/training-resources/${id}`, input)
        return unwrap<TrainingResource>(res)
    }

    async remove(id: string): Promise<{ id: string; deleted: boolean }> {
        const res = await apiClient.delete<any>(`/training-resources/${id}`)
        return unwrap<{ id: string; deleted: boolean }>(res)
    }

    async recordView(id: string): Promise<{ resourceId: string; openedAt: string; viewCount: number }> {
        const res = await apiClient.post<any>(`/training-resources/${id}/view`, {})
        return unwrap<{ resourceId: string; openedAt: string; viewCount: number }>(res)
    }

    async myStats(): Promise<UserStats> {
        const res = await apiClient.get<any>('/training-resources/me/stats')
        return unwrap<UserStats>(res)
    }
}

export const trainingResourceService = new TrainingResourceService()
