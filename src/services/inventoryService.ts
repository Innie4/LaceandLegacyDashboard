import axios from 'axios';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  type: 'in' | 'out' | 'adjustment';
  reason: string;
  reference?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  products: string[];
  status: 'active' | 'inactive';
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  status: 'draft' | 'ordered' | 'received' | 'cancelled';
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  total: number;
  expectedDeliveryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  lowStockThreshold: number;
  reorderPoint: number;
  suggestedOrderQuantity: number;
  lastRestockDate?: string;
}

export interface InventoryFilters {
  search?: string;
  category?: string;
  supplier?: string;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  minStock?: number;
  maxStock?: number;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const inventoryService = {
  // Stock Management
  async getStockAlerts(): Promise<StockAlert[]> {
    const response = await axios.get(`${API_URL}/inventory/alerts`);
    return response.data;
  },

  async getStockMovements(filters?: {
    productId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<StockMovement[]> {
    const response = await axios.get(`${API_URL}/inventory/movements`, {
      params: filters,
    });
    return response.data;
  },

  async adjustStock(
    productId: string,
    adjustment: {
      quantity: number;
      type: 'in' | 'out' | 'adjustment';
      reason: string;
      notes?: string;
    }
  ): Promise<StockMovement> {
    const response = await axios.post(
      `${API_URL}/inventory/products/${productId}/adjust`,
      adjustment
    );
    return response.data;
  },

  async bulkAdjustStock(
    adjustments: {
      productId: string;
      quantity: number;
      type: 'in' | 'out' | 'adjustment';
      reason: string;
      notes?: string;
    }[]
  ): Promise<StockMovement[]> {
    const response = await axios.post(`${API_URL}/inventory/bulk-adjust`, {
      adjustments,
    });
    return response.data;
  },

  // Supplier Management
  async getSuppliers(): Promise<Supplier[]> {
    const response = await axios.get(`${API_URL}/inventory/suppliers`);
    return response.data;
  },

  async getSupplier(id: string): Promise<Supplier> {
    const response = await axios.get(`${API_URL}/inventory/suppliers/${id}`);
    return response.data;
  },

  async createSupplier(supplier: Omit<Supplier, 'id'>): Promise<Supplier> {
    const response = await axios.post(`${API_URL}/inventory/suppliers`, supplier);
    return response.data;
  },

  async updateSupplier(
    id: string,
    supplier: Partial<Supplier>
  ): Promise<Supplier> {
    const response = await axios.patch(
      `${API_URL}/inventory/suppliers/${id}`,
      supplier
    );
    return response.data;
  },

  async deleteSupplier(id: string): Promise<void> {
    await axios.delete(`${API_URL}/inventory/suppliers/${id}`);
  },

  // Purchase Order Management
  async getPurchaseOrders(filters?: {
    supplierId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PurchaseOrder[]> {
    const response = await axios.get(`${API_URL}/inventory/purchase-orders`, {
      params: filters,
    });
    return response.data;
  },

  async getPurchaseOrder(id: string): Promise<PurchaseOrder> {
    const response = await axios.get(
      `${API_URL}/inventory/purchase-orders/${id}`
    );
    return response.data;
  },

  async createPurchaseOrder(
    order: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PurchaseOrder> {
    const response = await axios.post(
      `${API_URL}/inventory/purchase-orders`,
      order
    );
    return response.data;
  },

  async updatePurchaseOrder(
    id: string,
    order: Partial<PurchaseOrder>
  ): Promise<PurchaseOrder> {
    const response = await axios.patch(
      `${API_URL}/inventory/purchase-orders/${id}`,
      order
    );
    return response.data;
  },

  async deletePurchaseOrder(id: string): Promise<void> {
    await axios.delete(`${API_URL}/inventory/purchase-orders/${id}`);
  },

  // Import/Export
  async importStock(file: File): Promise<{
    success: boolean;
    message: string;
    errors?: any[];
  }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(
      `${API_URL}/inventory/import`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async exportStock(filters?: InventoryFilters): Promise<Blob> {
    const response = await axios.get(`${API_URL}/inventory/export`, {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
}; 