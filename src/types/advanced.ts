// Advanced Features types

// Dynamic Pricing
export interface PricingRule {
    id: string;
    name: string;
    description: string;
    type: 'demand' | 'seasonal' | 'early_bird' | 'time_based' | 'capacity';
    basePrice: number;
    adjustmentType: 'percentage' | 'fixed';
    adjustmentValue: number;
    conditions: PricingCondition[];
    isActive: boolean;
    priority: number;
}

export interface PricingCondition {
    field: string;
    operator: 'equals' | 'greater_than' | 'less_than' | 'between';
    value: any;
}

export interface PriceCalculation {
    basePrice: number;
    appliedRules: {
        ruleId: string;
        ruleName: string;
        adjustment: number;
    }[];
    finalPrice: number;
    savings: number;
}

// Forecast Simulator
export interface ForecastScenario {
    id: string;
    name: string;
    description: string;
    parameters: {
        enrollmentGrowth: number;
        attendanceRate: number;
        pricingStrategy: string;
        marketingBudget: number;
        seasonalFactors: boolean;
    };
    results: ForecastResults;
    createdAt: string;
}

export interface ForecastResults {
    projectedRevenue: number;
    projectedEnrollments: number;
    projectedCapacity: number;
    profitMargin: number;
    breakEvenPoint: string;
    monthlyProjections: MonthlyProjection[];
}

export interface MonthlyProjection {
    month: string;
    revenue: number;
    enrollments: number;
    capacity: number;
    expenses: number;
}

// Family Scheduling
export interface FamilySchedule {
    familyId: string;
    children: ChildSchedule[];
    conflicts: ScheduleConflict[];
    optimizationScore: number;
    carpoolOpportunities: CarpoolOpportunity[];
}

export interface ChildSchedule {
    childId: string;
    childName: string;
    classes: ScheduledClass[];
}

export interface ScheduledClass {
    id: string;
    name: string;
    day: string;
    startTime: string;
    endTime: string;
    location: string;
}

export interface ScheduleConflict {
    type: 'time_overlap' | 'location_distance' | 'back_to_back';
    severity: 'high' | 'medium' | 'low';
    description: string;
    affectedClasses: string[];
}

export interface CarpoolOpportunity {
    children: string[];
    location: string;
    time: string;
    potentialSavings: number;
}

// Parent ROI
export interface ParentROI {
    childId: string;
    childName: string;

    // Financial
    totalInvestment: number;
    averageCostPerClass: number;

    // Attendance
    classesAttended: number;
    attendanceConsistency: number;

    // Development
    skillsImproved: number;
    milestonesAchieved: number;

    // Engagement
    participationScore: number;
    behaviorScore: number;

    // Overall ROI
    overallScore: number;
    valueRating: 'excellent' | 'good' | 'fair' | 'needs_improvement';
}

export interface ROIMetric {
    name: string;
    value: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    comparison: string;
}
