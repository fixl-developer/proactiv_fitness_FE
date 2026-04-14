import { apiClient } from '@/services/api/client';

export interface MealPlan {
    studentId: string;
    tenantId: string;
    planName: string;
    duration: number;
    goals: string[];
    dietaryRestrictions: string[];
    dailyCalories: number;
    macros: {
        protein: number;
        carbs: number;
        fats: number;
    };
    meals?: Array<{
        dayOfWeek: number;
        mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
        name: string;
        description: string;
        calories: number;
        macros: { protein: number; carbs: number; fats: number };
        ingredients: Array<{ name: string; quantity: string; unit: string }>;
        instructions: string[];
        prepTime: number;
        imageUrl?: string;
    }>;
    groceryList?: Array<{
        item: string;
        quantity: string;
        unit: string;
        category: string;
    }>;
    status?: 'active' | 'completed' | 'paused';
}

export interface NutritionLog {
    studentId: string;
    tenantId: string;
    date: Date;
    meals: Array<{
        mealType: string;
        foodItems: Array<{
            name: string;
            quantity: number;
            unit: string;
            calories: number;
            macros: { protein: number; carbs: number; fats: number };
        }>;
        totalCalories: number;
    }>;
    waterIntake?: number;
    notes?: string;
}

class NutritionService {
    async generateMealPlan(data: Omit<MealPlan, 'meals' | 'groceryList' | 'status'>) {
        const response = await apiClient.post(`/nutrition/meal-plans`, data);
        return response;
    }

    async getMealPlan(planId: string) {
        const response = await apiClient.get(`/nutrition/meal-plans/${planId}`);
        return response;
    }

    async listMealPlans(studentId: string, tenantId: string) {
        const response = await apiClient.get(`/nutrition/meal-plans`, {
            params: { studentId, tenantId },
        });
        return response;
    }

    async updateMealPlanStatus(planId: string, status: 'active' | 'completed' | 'paused') {
        const response = await apiClient.put(`/nutrition/meal-plans/${planId}/status`, { status });
        return response;
    }

    async logMeal(data: NutritionLog) {
        const response = await apiClient.post(`/nutrition/logs`, data);
        return response;
    }

    async getNutritionLog(studentId: string, date: string) {
        const response = await apiClient.get(`/nutrition/logs`, {
            params: { studentId, date },
        });
        return response;
    }

    async getNutritionHistory(studentId: string, startDate: string, endDate: string) {
        const response = await apiClient.get(`/nutrition/history`, {
            params: { studentId, startDate, endDate },
        });
        return response;
    }

    async updateWaterIntake(logId: string, waterIntake: number) {
        const response = await apiClient.put(`/nutrition/logs/${logId}/water`, { waterIntake });
        return response;
    }

    async getGroceryList(planId: string) {
        const response = await apiClient.get(`/nutrition/meal-plans/${planId}/grocery-list`);
        return response;
    }
}

export default new NutritionService();
