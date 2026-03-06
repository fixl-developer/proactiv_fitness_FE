import axios from 'axios';
import type {
    Franchise,
    FranchiseMetrics,
    RoyaltyPayment,
    Partner,
    PartnerReport,
    BulkImport,
    MultiBrandWallet,
    CrossBrandTransaction,
    WalletBreakage,
} from '@/types/enterprise';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Franchise Management
export const getFranchises = async (): Promise<Franchise[]> => {
    const response = await axios.get(`${API_URL}/franchise`);
    return response.data;
};

export const getFranchise = async (franchiseId: string): Promise<Franchise> => {
    const response = await axios.get(`${API_URL}/franchise/${franchiseId}`);
    return response.data;
};

export const createFranchise = async (data: Omit<Franchise, 'id'>): Promise<Franchise> => {
    const response = await axios.post(`${API_URL}/franchise`, data);
    return response.data;
};

export const updateFranchise = async (
    franchiseId: string,
    data: Partial<Franchise>
): Promise<Franchise> => {
    const response = await axios.put(`${API_URL}/franchise/${franchiseId}`, data);
    return response.data;
};

export const getFranchiseMetrics = async (
    franchiseId: string
): Promise<FranchiseMetrics> => {
    const response = await axios.get(`${API_URL}/franchise/${franchiseId}/metrics`);
    return response.data;
};

export const getRoyaltyPayments = async (
    franchiseId: string
): Promise<RoyaltyPayment[]> => {
    const response = await axios.get(`${API_URL}/franchise/${franchiseId}/royalty`);
    return response.data;
};

// Partner Portal
export const getPartners = async (): Promise<Partner[]> => {
    const response = await axios.get(`${API_URL}/partners`);
    return response.data;
};

export const getPartner = async (partnerId: string): Promise<Partner> => {
    const response = await axios.get(`${API_URL}/partners/${partnerId}`);
    return response.data;
};

export const createPartner = async (data: Omit<Partner, 'id'>): Promise<Partner> => {
    const response = await axios.post(`${API_URL}/partners`, data);
    return response.data;
};

export const getPartnerReport = async (
    partnerId: string,
    period: string
): Promise<PartnerReport> => {
    const response = await axios.get(`${API_URL}/partners/${partnerId}/report`, {
        params: { period },
    });
    return response.data;
};

export const bulkImportStudents = async (
    partnerId: string,
    file: File
): Promise<BulkImport> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(
        `${API_URL}/partners/${partnerId}/bulk-import`,
        formData,
        {
            headers: { 'Content-Type': 'multipart/form-data' },
        }
    );
    return response.data;
};

export const getBulkImportStatus = async (importId: string): Promise<BulkImport> => {
    const response = await axios.get(`${API_URL}/partners/bulk-import/${importId}`);
    return response.data;
};

// Multi-Brand Wallet
export const getMultiBrandWallet = async (userId: string): Promise<MultiBrandWallet> => {
    const response = await axios.get(`${API_URL}/wallet/multi-brand/${userId}`);
    return response.data;
};

export const getCrossBrandTransactions = async (
    walletId: string
): Promise<CrossBrandTransaction[]> => {
    const response = await axios.get(`${API_URL}/wallet/${walletId}/cross-brand`);
    return response.data;
};

export const transferCrossBrand = async (
    walletId: string,
    data: {
        fromBrand: string;
        toBrand: string;
        amount: number;
        bucketType: string;
    }
): Promise<CrossBrandTransaction> => {
    const response = await axios.post(`${API_URL}/wallet/${walletId}/transfer`, data);
    return response.data;
};

export const getWalletBreakage = async (
    brandId: string,
    period: string
): Promise<WalletBreakage> => {
    const response = await axios.get(`${API_URL}/wallet/breakage/${brandId}`, {
        params: { period },
    });
    return response.data;
};
