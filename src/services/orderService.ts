import axios from 'axios';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilters {
  search?: string;
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  minTotal?: number;
  maxTotal?: number;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const orderService = {
  async getOrders(filters?: OrderFilters): Promise<Order[]> {
    const response = await axios.get(`${API_URL}/orders`, { params: filters });
    return response.data;
  },

  async getOrder(id: string): Promise<Order> {
    const response = await axios.get(`${API_URL}/orders/${id}`);
    return response.data;
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    const response = await axios.patch(`${API_URL}/orders/${id}/status`, { status });
    return response.data;
  },

  async updatePaymentStatus(id: string, status: Order['paymentStatus']): Promise<Order> {
    const response = await axios.patch(`${API_URL}/orders/${id}/payment`, { status });
    return response.data;
  },

  async createOrder(order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const response = await axios.post(`${API_URL}/orders`, order);
    return response.data;
  },

  async deleteOrder(id: string): Promise<void> {
    await axios.delete(`${API_URL}/orders/${id}`);
  },

  async getOrderStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    totalRevenue: number;
  }> {
    const response = await axios.get(`${API_URL}/orders/stats`);
    return response.data;
  },

  async exportOrders(filters?: OrderFilters): Promise<Blob> {
    const response = await axios.get(`${API_URL}/orders/export`, {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
}; 