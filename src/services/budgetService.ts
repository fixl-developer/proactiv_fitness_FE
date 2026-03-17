import { apiClient } from '../lib/api'

export interface BudgetItem {
    id: string
    name: string
    allocated: number
    spent: number
    percentage: number
    category: string
    period: string
    locationId?: string
}

export interface LocationBudget {
    id: string
    location: string
    budget: number
    spent: number
    remaining: number
    locationId: string
}

export interface BudgetSummary {
    totalAllocated: number
    totalSpent: number
    totalRemaining: number
    spendingPercentage: number
    period: string
}

export interface BudgetAlert {
    id: string
    category: string
    message: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    percentage: number
}

class BudgetService {
    async getBudgetSummary(period: string, regionId?: string): Promise<BudgetSummary> {
        try {
            const response = await apiClient.get('/budget/summary', {
                params: { period, regionId }
            })
            return response.data.data || response.data
        } catch (error) {
            console.error('Error fetching budget summary:', error)
            // Return mock data for development
            return {
                totalAllocated: 305000,
                totalSpent: 267000,
                totalRemaining: 38000,
                spendingPercentage: 87,
                period
            }
        }
    }

    async getBudgetItems(period: string, regionId?: string): Promise<BudgetItem[]> {
        try {
            const response = await apiClient.get('/budget/items', {
                params: { period, regionId }
            })
            return response.data.data || response.data
        } catch (error) {
            console.error('Error fetching budget items:', error)
            // Return mock data for development
            return [
                { id: '1', name: 'Staff Salaries', allocated: 150000, spent: 145000, percentage: 96.7, category: 'Personnel', period },
                { id: '2', name: 'Equipment & Maintenance', allocated: 50000, spent: 38000, percentage: 76, category: 'Operations', period },
                { id: '3', name: 'Facility Operations', allocated: 40000, spent: 35000, percentage: 87.5, category: 'Operations', period },
                { id: '4', name: 'Marketing & Promotions', allocated: 30000, spent: 22000, percentage: 73.3, category: 'Marketing', period },
                { id: '5', name: 'Training & Development', allocated: 20000, spent: 15000, percentage: 75, category: 'Personnel', period },
                { id: '6', name: 'Technology & Software', allocated: 15000, spent: 12000, percentage: 80, category: 'Technology', period },
            ]
        }
    }

    async getLocationBudgets(period: string, regionId?: string): Promise<LocationBudget[]> {
        try {
            const response = await apiClient.get('/budget/locations', {
                params: { period, regionId }
            })
            return response.data.data || response.data
        } catch (error) {
            console.error('Error fetching location budgets:', error)
            // Return mock data for development
            return [
                { id: '1', location: 'Boston Downtown', budget: 80000, spent: 75000, remaining: 5000, locationId: 'loc1' },
                { id: '2', location: 'Boston Suburbs', budget: 70000, spent: 65000, remaining: 5000, locationId: 'loc2' },
                { id: '3', location: 'Providence', budget: 50000, spent: 48000, remaining: 2000, locationId: 'loc3' },
                { id: '4', location: 'Hartford', budget: 55000, spent: 52000, remaining: 3000, locationId: 'loc4' },
            ]
        }
    }

    async getBudgetAlerts(period: string, regionId?: string): Promise<BudgetAlert[]> {
        try {
            const response = await apiClient.get('/budget/alerts', {
                params: { period, regionId }
            })
            return response.data.data || response.data
        } catch (error) {
            console.error('Error fetching budget alerts:', error)
            // Return mock data for development
            return [
                { id: '1', category: 'Staff Salaries', message: '96.7% spent - approaching limit', severity: 'critical', percentage: 96.7 },
                { id: '2', category: 'Facility Operations', message: '87.5% spent - monitor closely', severity: 'high', percentage: 87.5 },
                { id: '3', category: 'Technology & Software', message: '80% spent - within normal range', severity: 'medium', percentage: 80 },
            ]
        }
    }

    async createBudgetItem(budgetItem: Partial<BudgetItem>): Promise<BudgetItem> {
        try {
            const response = await apiClient.post('/budget/items', budgetItem)
            return response.data.data || response.data
        } catch (error) {
            console.error('Error creating budget item:', error)
            throw error
        }
    }

    async updateBudgetItem(itemId: string, updates: Partial<BudgetItem>): Promise<BudgetItem> {
        try {
            const response = await apiClient.put(`/budget/items/${itemId}`, updates)
            return response.data.data || response.data
        } catch (error) {
            console.error('Error updating budget item:', error)
            throw error
        }
    }

    async deleteBudgetItem(itemId: string): Promise<void> {
        try {
            await apiClient.delete(`/budget/items/${itemId}`)
        } catch (error) {
            console.error('Error deleting budget item:', error)
            throw error
        }
    }

    async exportBudgetReport(period: string, regionId?: string, format: 'pdf' | 'excel' = 'pdf'): Promise<Blob> {
        try {
            const response = await apiClient.get('/budget/export', {
                params: { period, regionId, format },
                responseType: 'blob'
            })
            return response.data
        } catch (error) {
            console.error('Error exporting budget report:', error)
            throw error
        }
    }

    async approveBudget(budgetId: string, approvalData: { approved: boolean; comments?: string }): Promise<void> {
        try {
            await apiClient.post(`/budget/${budgetId}/approve`, approvalData)
        } catch (error) {
            console.error('Error approving budget:', error)
            throw error
        }
    }

    async getBudgetHistory(itemId: string): Promise<any[]> {
        try {
            const response = await apiClient.get(`/budget/items/${itemId}/history`)
            return response.data.data || response.data
        } catch (error) {
            console.error('Error fetching budget history:', error)
            return []
        }
    }
}

export const budgetService = new BudgetService()