// Mock productService for frontend-only use
// Helper to normalize product payload to backend-expected string fields
const normalizeProductPayload = (product: any) => {
  const payload: any = {
    name: '',
    description: '',
    quantity: '',
    price: '',
    image: '',
  };

  // Prefer canonical keys; fallback to alt names if provided
  if (product && product.name != null) payload.name = String(product.name);
  else if (product && product.productName != null) payload.name = String(product.productName);

  if (product && product.description != null) payload.description = String(product.description);

  if (product && product.quantity != null) payload.quantity = String(product.quantity);

  if (product && product.price != null) payload.price = String(product.price);

  if (product && product.image != null) payload.image = String(product.image);
  else if (product && product.imageUrl != null) payload.image = String(product.imageUrl);

  return payload;
};

export const productService = {
  BASE_URL: 'https://likwapu-ecommerce-backend.fly.dev',

  getToken: () => {
    return localStorage.getItem('token');
  },

  getProducts: async () => {
    try {
      const res = await fetch(`${productService.BASE_URL}/api/products`, {
        headers: {
          'Authorization': `Bearer ${productService.getToken()}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      return await res.json();
    } catch (err) {
      throw err;
    }
  },

  getProduct: async (id: string) => {
    try {
      const res = await fetch(`${productService.BASE_URL}/api/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${productService.getToken()}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch product');
      return await res.json();
    } catch (err) {
      throw err;
    }
  },

  createProduct: async (product: any) => {
    try {
      const res = await fetch(`${productService.BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${productService.getToken()}`,
        },
        body: JSON.stringify(normalizeProductPayload(product)),
      });
      if (!res.ok) throw new Error('Failed to create product');
      return await res.json();
    } catch (err) {
      throw err;
    }
  },

  updateProduct: async (id: string, product: any) => {
    try {
      const res = await fetch(`${productService.BASE_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${productService.getToken()}`,
        },
        body: JSON.stringify(normalizeProductPayload(product)),
      });
      if (!res.ok) throw new Error('Failed to update product');
      return await res.json();
    } catch (err) {
      throw err;
    }
  },

  deleteProduct: async (id: string) => {
    try {
      const res = await fetch(`${productService.BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${productService.getToken()}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete product');
      return await res.json();
    } catch (err) {
      throw err;
    }
  },
};

export default productService;