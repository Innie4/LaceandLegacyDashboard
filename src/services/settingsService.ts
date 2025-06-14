import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface StoreSettings {
  id: string;
  name: string;
  description: string;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  businessHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  timezone: string;
  currency: {
    code: string;
    symbol: string;
    position: 'before' | 'after';
    decimalPlaces: number;
  };
  tax: {
    enabled: boolean;
    rate: number;
    displayInclusive: boolean;
  };
  shipping: {
    zones: ShippingZone[];
    methods: ShippingMethod[];
  };
  payment: {
    gateways: PaymentGateway[];
    defaultGateway: string;
  };
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  states?: string[];
  postalCodes?: string[];
  methods: string[];
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  minOrderAmount?: number;
  maxOrderAmount?: number;
  estimatedDays: string;
  enabled: boolean;
}

export interface PaymentGateway {
  id: string;
  name: string;
  type: 'stripe' | 'paypal' | 'custom';
  enabled: boolean;
  credentials: Record<string, string>;
  testMode: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'manager' | 'staff';
  status: 'active' | 'inactive';
  lastLogin?: string;
  twoFactorEnabled: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

const settingsService = {
  // Store Settings
  async getStoreSettings(): Promise<StoreSettings> {
    const response = await axios.get(`${API_URL}/settings/store`);
    return response.data;
  },

  async updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    const response = await axios.put(`${API_URL}/settings/store`, settings);
    return response.data;
  },

  // Shipping Zones
  async getShippingZones(): Promise<ShippingZone[]> {
    const response = await axios.get(`${API_URL}/settings/shipping/zones`);
    return response.data;
  },

  async createShippingZone(zone: Partial<ShippingZone>): Promise<ShippingZone> {
    const response = await axios.post(`${API_URL}/settings/shipping/zones`, zone);
    return response.data;
  },

  async updateShippingZone(id: string, zone: Partial<ShippingZone>): Promise<ShippingZone> {
    const response = await axios.put(`${API_URL}/settings/shipping/zones/${id}`, zone);
    return response.data;
  },

  async deleteShippingZone(id: string): Promise<void> {
    await axios.delete(`${API_URL}/settings/shipping/zones/${id}`);
  },

  // Shipping Methods
  async getShippingMethods(): Promise<ShippingMethod[]> {
    const response = await axios.get(`${API_URL}/settings/shipping/methods`);
    return response.data;
  },

  async createShippingMethod(method: Partial<ShippingMethod>): Promise<ShippingMethod> {
    const response = await axios.post(`${API_URL}/settings/shipping/methods`, method);
    return response.data;
  },

  async updateShippingMethod(id: string, method: Partial<ShippingMethod>): Promise<ShippingMethod> {
    const response = await axios.put(`${API_URL}/settings/shipping/methods/${id}`, method);
    return response.data;
  },

  async deleteShippingMethod(id: string): Promise<void> {
    await axios.delete(`${API_URL}/settings/shipping/methods/${id}`);
  },

  // Payment Gateways
  async getPaymentGateways(): Promise<PaymentGateway[]> {
    const response = await axios.get(`${API_URL}/settings/payment/gateways`);
    return response.data;
  },

  async updatePaymentGateway(id: string, gateway: Partial<PaymentGateway>): Promise<PaymentGateway> {
    const response = await axios.put(`${API_URL}/settings/payment/gateways/${id}`, gateway);
    return response.data;
  },

  // Admin Users
  async getAdminUsers(): Promise<AdminUser[]> {
    const response = await axios.get(`${API_URL}/settings/users`);
    return response.data;
  },

  async createAdminUser(user: Partial<AdminUser>): Promise<AdminUser> {
    const response = await axios.post(`${API_URL}/settings/users`, user);
    return response.data;
  },

  async updateAdminUser(id: string, user: Partial<AdminUser>): Promise<AdminUser> {
    const response = await axios.put(`${API_URL}/settings/users/${id}`, user);
    return response.data;
  },

  async deleteAdminUser(id: string): Promise<void> {
    await axios.delete(`${API_URL}/settings/users/${id}`);
  },

  async enableTwoFactor(id: string): Promise<void> {
    await axios.post(`${API_URL}/settings/users/${id}/2fa/enable`);
  },

  async disableTwoFactor(id: string): Promise<void> {
    await axios.post(`${API_URL}/settings/users/${id}/2fa/disable`);
  },

  // Activity Logs
  async getActivityLogs(filters?: {
    userId?: string;
    action?: string;
    entity?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ActivityLog[]> {
    const response = await axios.get(`${API_URL}/settings/activity-logs`, { params: filters });
    return response.data;
  },

  // Permissions
  async getPermissions(): Promise<string[]> {
    const response = await axios.get(`${API_URL}/settings/permissions`);
    return response.data;
  },

  async getRolePermissions(role: string): Promise<string[]> {
    const response = await axios.get(`${API_URL}/settings/roles/${role}/permissions`);
    return response.data;
  },

  async updateRolePermissions(role: string, permissions: string[]): Promise<void> {
    await axios.put(`${API_URL}/settings/roles/${role}/permissions`, { permissions });
  }
};

export default settingsService; 