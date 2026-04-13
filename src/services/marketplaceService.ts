import { apiClient } from '@/services/api/client';

export interface Product {
    productId?: string;
    tenantId: string;
    name: string;
    description: string;
    category: 'equipment' | 'merchandise' | 'nutrition' | 'apparel' | 'accessories';
    price: number;
    currency: string;
    images: string[];
    inventory: {
        quantity: number;
        lowStockThreshold: number;
        inStock: boolean;
    };
    specifications?: Record<string, any>;
    averageRating?: number;
    totalReviews?: number;
    status?: 'active' | 'out-of-stock' | 'discontinued';
}

export interface Order {
    orderId?: string;
    tenantId: string;
    customerId: string;
    items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        price: number;
        subtotal: number;
    }>;
    totalAmount: number;
    currency: string;
    shippingAddress: {
        name: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        phone: string;
    };
    paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
    fulfillmentStatus?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

class MarketplaceService {
    async createProduct(data: Product) {
        const response = await apiClient.post(`/marketplace/products`, data);
        return response;
    }

    async getProduct(productId: string) {
        const response = await apiClient.get(`/marketplace/products/${productId}`);
        return response;
    }

    async listProducts(filters: {
        tenantId: string;
        category?: string;
        status?: string;
        minPrice?: number;
        maxPrice?: number;
    }) {
        const response = await apiClient.get(`/marketplace/products`, {
            params: filters,
        });
        return response;
    }

    async updateProduct(productId: string, updates: Partial<Product>) {
        const response = await apiClient.put(`/marketplace/products/${productId}`, updates);
        return response;
    }

    async updateInventory(productId: string, quantity: number) {
        const response = await apiClient.put(`/marketplace/products/${productId}/inventory`, {
            quantity,
        });
        return response;
    }

    async addReview(productId: string, userId: string, rating: number, comment: string) {
        const response = await apiClient.post(`/marketplace/products/${productId}/reviews`, {
            userId,
            rating,
            comment,
        });
        return response;
    }

    async createOrder(data: Order) {
        const response = await apiClient.post(`/marketplace/orders`, data);
        return response;
    }

    async getOrder(orderId: string) {
        const response = await apiClient.get(`/marketplace/orders/${orderId}`);
        return response;
    }

    async listOrders(customerId: string, tenantId: string) {
        const response = await apiClient.get(`/marketplace/orders`, {
            params: { customerId, tenantId },
        });
        return response;
    }

    async updateOrderStatus(orderId: string, status: string, trackingNumber?: string) {
        const response = await apiClient.put(`/marketplace/orders/${orderId}/status`, {
            status,
            trackingNumber,
        });
        return response;
    }
}

export default new MarketplaceService();
