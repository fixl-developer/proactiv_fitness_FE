import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.post(`${API_URL}/nutrition/meal-plans`, data);
        return response.data;
    }

    async getMealPlan(planId: string) {
        const response = await axios.get(`${API_URL}/nutrition/meal-plans/${planId}`);
        return response.data;
    }

    async listMealPlans(studentId: string, tenantId: string) {
        const response = await axios.get(`${API_URL}/nutrition/meal-plans`, {
            params: { studentId, tenantId },
        });
        return response.data;
    }

    async updateMealPlanStatus(planId: string, status: 'active' | 'completed' | 'paused') {
        const response = await axios.put(`${API_URL}/nutrition/meal-plans/${planId}/status`, { status });
        return response.data;
    }

    async logMeal(data: NutritionLog) {
        const response = await axios.post(`${API_URL}/nutrition/logs`, data);
        return response.data;
    }

    async getNutritionLog(studentId: string, date: string) {
        const response = await axios.get(`${API_URL}/nutrition/logs`, {
            params: { studentId, date },
        });
        return response.data;
    }

    async getNutritionHistory(studentId: string, startDate: string, endDate: string) {
        const response = await axios.get(`${API_URL}/nutrition/history`, {
            params: { studentId, startDate, endDate },
        });
        return response.data;
    }

    async updateWaterIntake(logId: string, waterIntake: number) {
        const response = await axios.put(`${API_URL}/nutrition/logs/${logId}/water`, { waterIntake });
        return response.data;
    }

    async getGroceryList(planId: string) {
        const response = await axios.get(`${API_URL}/nutrition/meal-plans/${planId}/grocery-list`);
        return response.data;
    }
}

export default new NutritionService();
