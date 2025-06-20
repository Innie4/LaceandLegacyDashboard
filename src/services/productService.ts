// Mock productService for frontend-only use
export const productService = {
  getProducts: async () => Promise.resolve([]),
  getProduct: async (id: string) => Promise.resolve({ id }),
  createProduct: async (product: any) => Promise.resolve({ ...product, id: '1' }),
  updateProduct: async (id: string, product: any) => Promise.resolve({ ...product, id }),
  deleteProduct: async (id: string) => Promise.resolve(),
  bulkUpdateProducts: async (ids: string[], updates: any) => Promise.resolve([]),
  bulkDeleteProducts: async (ids: string[]) => Promise.resolve(),
  uploadImages: async (files: File[]) => Promise.resolve([]),
  getCategories: async () => Promise.resolve([]),
  deleteCategory: async (id: string) => Promise.resolve(),
  updateCategory: async (id: string, data: any) => Promise.resolve(),
  createCategory: async (data: any) => Promise.resolve(),
};

export default productService; 