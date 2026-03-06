// Enterprise Features types

// Franchise Management
export interface Franchise {
    id: string;
    name: string;
    code: string;
    owner: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;

    // Business Details
    businessLicense: string;
    taxId: string;
    contractStartDate: string;
    contractEndDate: string;

    // Financial
    royaltyRate: number;
    revenueShareRate: number;
    monthlyFee: number;

    // Status
    status: 'active' | 'inactive' | 'suspended' | 'pending';

    // Branding
    logo?: string;
    primaryColor: string;
    secondaryColor: string;

    createdAt: string;
    updatedAt: string;
}

export interface FranchiseMetrics {
    franchiseId: string;
    franchiseName: string;

    // Revenue
    totalRevenue: number;
    royaltyPaid: number;
    revenueShare: number;

    // Operations
    totalStudents: number;
    totalClasses: number;
    totalStaff: number;

    // Performance
    attendanceRate: number;
    satisfactionScore: number;
    retentionRate: number;
}

export interface RoyaltyPayment {
    id: string;
    franchiseId: string;
    franchiseName: string;
    period: string;
    revenue: number;
    royaltyRate: number;
    royaltyAmount: number;
    status: 'pending' | 'paid' | 'overdue';
    dueDate: string;
    paidDate?: string;
}

// Partner Portal
export interface Partner {
    id: string;
    name: string;
    type: 'school' | 'government' | 'corporate' | 'ngo';
    contactPerson: string;
    email: string;
    phone: string;

    // Contract
    contractNumber: string;
    startDate: string;
    endDate: string;

    // Revenue Share
    revenueShareRate: number;

    status: 'active' | 'inactive' | 'pending';
    createdAt: string;
}

export interface PartnerReport {
    partnerId: string;
    partnerName: string;
    period: string;

    // Students
    totalStudents: number;
    newEnrollments: number;
    activeStudents: number;

    // Revenue
    totalRevenue: number;
    partnerShare: number;

    // Attendance
    totalClasses: number;
    attendanceRate: number;
}

export interface BulkImport {
    id: string;
    partnerId: string;
    fileName: string;
    totalRecords: number;
    successCount: number;
    failureCount: number;
    status: 'processing' | 'completed' | 'failed';
    errors: string[];
    uploadedAt: string;
    completedAt?: string;
}

// Multi-Brand Wallet
export interface MultiBrandWallet {
    id: string;
    userId: string;
    userName: string;

    // Balances by brand
    brands: BrandBalance[];

    // Total
    totalBalance: number;

    // Cross-brand spending enabled
    crossBrandEnabled: boolean;

    createdAt: string;
    updatedAt: string;
}

export interface BrandBalance {
    brandId: string;
    brandName: string;
    cashBalance: number;
    promoBalance: number;
    loyaltyBalance: number;
    subsidyBalance: number;
    totalBalance: number;
}

export interface CrossBrandTransaction {
    id: string;
    walletId: string;
    fromBrand: string;
    toBrand: string;
    amount: number;
    bucketType: string;
    description: string;
    createdAt: string;
}

export interface WalletBreakage {
    brandId: string;
    brandName: string;
    period: string;

    // Expiry
    expiredCredits: number;
    expiredAmount: number;

    // Unused
    unusedCredits: number;
    unusedAmount: number;

    // Breakage
    breakageRate: number;
    breakageRevenue: number;
}
