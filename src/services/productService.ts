import axios from 'axios';

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  brand: string;
  category: string;
  regularPrice: number;
  salePrice?: number;
  costPrice: number;
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  images: string[];
  attributes: {
    size?: string[];
    color?: string[];
    material?: string;
    vintageYear?: number;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
  shipping: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    shippingClass: string;
  };
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const productService = {
  // Get all products with optional filters
  getProducts: async (filters?: ProductFilters) => {
    const response = await axios.get(`${API_URL}/products`, { params: filters });
    return response.data;
  },

  // Get a single product by ID
  getProduct: async (id: string) => {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return response.data;
  },

  // Create a new product
  createProduct: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await axios.post(`${API_URL}/products`, product);
    return response.data;
  },

  // Update an existing product
  updateProduct: async (id: string, product: Partial<Product>) => {
    const response = await axios.put(`${API_URL}/products/${id}`, product);
    return response.data;
  },

  // Delete a product
  deleteProduct: async (id: string) => {
    await axios.delete(`${API_URL}/products/${id}`);
  },

  // Bulk update products
  bulkUpdateProducts: async (ids: string[], updates: Partial<Product>) => {
    const response = await axios.put(`${API_URL}/products/bulk`, {
      ids,
      updates,
    });
    return response.data;
  },

  // Bulk delete products
  bulkDeleteProducts: async (ids: string[]) => {
    await axios.delete(`${API_URL}/products/bulk`, { data: { ids } });
  },

  // Upload product images
  uploadImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    const response = await axios.post(`${API_URL}/products/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get product categories
  getCategories: async () => {
    const response = await axios.get(`${API_URL}/products/categories`);
    return response.data;
  },

  // Create a new category
  createCategory: async (name: string, parentId?: string) => {
    const response = await axios.post(`${API_URL}/products/categories`, {
      name,
      parentId,
    });
    return response.data;
  },

  // Update a category
  updateCategory: async (id: string, name: string) => {
    const response = await axios.put(`${API_URL}/products/categories/${id}`, {
      name,
    });
    return response.data;
  },

  // Delete a category
  deleteCategory: async (id: string) => {
    await axios.delete(`${API_URL}/products/categories/${id}`);
  },
}; 