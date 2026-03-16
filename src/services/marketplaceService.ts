import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.post(`${API_URL}/marketplace/products`, data);
        return response.data;
    }

    async getProduct(productId: string) {
        const response = await axios.get(`${API_URL}/marketplace/products/${productId}`);
        return response.data;
    }

    async listProducts(filters: {
        tenantId: string;
        category?: string;
        status?: string;
        minPrice?: number;
        maxPrice?: number;
    }) {
        const response = await axios.get(`${API_URL}/marketplace/products`, {
            params: filters,
        });
        return response.data;
    }

    async updateProduct(productId: string, updates: Partial<Product>) {
        const response = await axios.put(`${API_URL}/marketplace/products/${productId}`, updates);
        return response.data;
    }

    async updateInventory(productId: string, quantity: number) {
        const response = await axios.put(`${API_URL}/marketplace/products/${productId}/inventory`, {
            quantity,
        });
        return response.data;
    }

    async addReview(productId: string, userId: string, rating: number, comment: string) {
        const response = await axios.post(`${API_URL}/marketplace/products/${productId}/reviews`, {
            userId,
            rating,
            comment,
        });
        return response.data;
    }

    async createOrder(data: Order) {
        const response = await axios.post(`${API_URL}/marketplace/orders`, data);
        return response.data;
    }

    async getOrder(orderId: string) {
        const response = await axios.get(`${API_URL}/marketplace/orders/${orderId}`);
        return response.data;
    }

    async listOrders(customerId: string, tenantId: string) {
        const response = await axios.get(`${API_URL}/marketplace/orders`, {
            params: { customerId, tenantId },
        });
        return response.data;
    }

    async updateOrderStatus(orderId: string, status: string, trackingNumber?: string) {
        const response = await axios.put(`${API_URL}/marketplace/orders/${orderId}/status`, {
            status,
            trackingNumber,
        });
        return response.data;
    }
}

export default new MarketplaceService();
