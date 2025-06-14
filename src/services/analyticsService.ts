import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
  percentage: number;
}

export interface ProductPerformance {
  id: string;
  name: string;
  revenue: number;
  unitsSold: number;
  profit: number;
  profitMargin: number;
}

export interface CustomerSegment {
  segment: string;
  revenue: number;
  customers: number;
  averageOrderValue: number;
}

export interface AnalyticsFilters extends DateRange {
  category?: string;
  product?: string;
  customerSegment?: string;
}

const analyticsService = {
  // Sales Analytics
  getSalesReport: async (filters: AnalyticsFilters) => {
    const response = await axios.get(`${API_URL}/analytics/sales`, { params: filters });
    return response.data;
  },

  getRevenueByCategory: async (filters: AnalyticsFilters) => {
    const response = await axios.get(`${API_URL}/analytics/sales/categories`, { params: filters });
    return response.data;
  },

  getRevenueByProduct: async (filters: AnalyticsFilters) => {
    const response = await axios.get(`${API_URL}/analytics/sales/products`, { params: filters });
    return response.data;
  },

  getRevenueByCustomerSegment: async (filters: AnalyticsFilters) => {
    const response = await axios.get(`${API_URL}/analytics/sales/customer-segments`, { params: filters });
    return response.data;
  },

  // Product Analytics
  getProductPerformance: async (filters: AnalyticsFilters) => {
    const response = await axios.get(`${API_URL}/analytics/products/performance`, { params: filters });
    return response.data;
  },

  getCategoryPerformance: async (filters: AnalyticsFilters) => {
    const response = await axios.get(`${API_URL}/analytics/products/categories`, { params: filters });
    return response.data;
  },

  getInventoryTurnover: async (filters: AnalyticsFilters) => {
    const response = await axios.get(`${API_URL}/analytics/products/inventory-turnover`, { params: filters });
    return response.data;
  },

  // Customer Analytics
  getCustomerAnalytics: async (filters: AnalyticsFilters) => {
    const response = await axios.get(`${API_URL}/analytics/customers`, { params: filters });
    return response.data;
  },

  getCustomerRetention: async (filters: AnalyticsFilters) => {
    const response = await axios.get(`${API_URL}/analytics/customers/retention`, { params: filters });
    return response.data;
  },

  getCustomerAcquisition: async (filters: AnalyticsFilters) => {
    const response = await axios.get(`${API_URL}/analytics/customers/acquisition`, { params: filters });
    return response.data;
  },

  // Export Reports
  exportSalesReport: async (filters: AnalyticsFilters, format: 'pdf' | 'csv') => {
    const response = await axios.get(`${API_URL}/analytics/sales/export`, {
      params: { ...filters, format },
      responseType: 'blob',
    });
    return response.data;
  },

  exportProductReport: async (filters: AnalyticsFilters, format: 'pdf' | 'csv') => {
    const response = await axios.get(`${API_URL}/analytics/products/export`, {
      params: { ...filters, format },
      responseType: 'blob',
    });
    return response.data;
  },

  exportCustomerReport: async (filters: AnalyticsFilters, format: 'pdf' | 'csv') => {
    const response = await axios.get(`${API_URL}/analytics/customers/export`, {
      params: { ...filters, format },
      responseType: 'blob',
    });
    return response.data;
  },
};

export default analyticsService; 