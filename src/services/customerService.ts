import axios from 'axios';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'blocked';
  segment: 'new' | 'regular' | 'vip';
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  registrationDate: string;
  addresses: Address[];
  notes: CustomerNote[];
  tags: string[];
}

export interface Address {
  id: string;
  type: 'shipping' | 'billing';
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
}

export interface CustomerNote {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface CustomerFilters {
  search?: string;
  status?: string;
  segment?: string;
  minOrders?: number;
  maxOrders?: number;
  minSpent?: number;
  maxSpent?: number;
  startDate?: string;
  endDate?: string;
  tags?: string[];
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const customerService = {
  async getCustomers(filters?: CustomerFilters): Promise<Customer[]> {
    const response = await axios.get(`${API_URL}/customers`, { params: filters });
    return response.data;
  },

  async getCustomer(id: string): Promise<Customer> {
    const response = await axios.get(`${API_URL}/customers/${id}`);
    return response.data;
  },

  async createCustomer(customer: Omit<Customer, 'id' | 'registrationDate'>): Promise<Customer> {
    const response = await axios.post(`${API_URL}/customers`, customer);
    return response.data;
  },

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
    const response = await axios.patch(`${API_URL}/customers/${id}`, customer);
    return response.data;
  },

  async deleteCustomer(id: string): Promise<void> {
    await axios.delete(`${API_URL}/customers/${id}`);
  },

  async addCustomerNote(id: string, note: Omit<CustomerNote, 'id' | 'createdAt'>): Promise<CustomerNote> {
    const response = await axios.post(`${API_URL}/customers/${id}/notes`, note);
    return response.data;
  },

  async updateCustomerNote(id: string, noteId: string, content: string): Promise<CustomerNote> {
    const response = await axios.patch(`${API_URL}/customers/${id}/notes/${noteId}`, { content });
    return response.data;
  },

  async deleteCustomerNote(id: string, noteId: string): Promise<void> {
    await axios.delete(`${API_URL}/customers/${id}/notes/${noteId}`);
  },

  async addCustomerAddress(id: string, address: Omit<Address, 'id'>): Promise<Address> {
    const response = await axios.post(`${API_URL}/customers/${id}/addresses`, address);
    return response.data;
  },

  async updateCustomerAddress(id: string, addressId: string, address: Partial<Address>): Promise<Address> {
    const response = await axios.patch(`${API_URL}/customers/${id}/addresses/${addressId}`, address);
    return response.data;
  },

  async deleteCustomerAddress(id: string, addressId: string): Promise<void> {
    await axios.delete(`${API_URL}/customers/${id}/addresses/${addressId}`);
  },

  async addCustomerTag(id: string, tag: string): Promise<string[]> {
    const response = await axios.post(`${API_URL}/customers/${id}/tags`, { tag });
    return response.data;
  },

  async removeCustomerTag(id: string, tag: string): Promise<string[]> {
    const response = await axios.delete(`${API_URL}/customers/${id}/tags/${tag}`);
    return response.data;
  },

  async getCustomerStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    blocked: number;
    new: number;
    regular: number;
    vip: number;
    averageOrderValue: number;
    totalRevenue: number;
  }> {
    const response = await axios.get(`${API_URL}/customers/stats`);
    return response.data;
  },

  async exportCustomers(filters?: CustomerFilters): Promise<Blob> {
    const response = await axios.get(`${API_URL}/customers/export`, {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
}; 