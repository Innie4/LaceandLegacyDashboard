// Mock marketingService for frontend-only use
export interface Promotion {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  status: 'active' | 'inactive' | 'expired';
  restrictions: {
    categories?: string[];
    products?: string[];
    customerGroups?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

const marketingService = {
  getPromotions: async () => Promise.resolve([]),
  createPromotion: async (promo: Partial<Promotion>) => Promise.resolve({ ...promo, id: '1' }),
  updatePromotion: async (id: string, promo: Partial<Promotion>) => Promise.resolve({ ...promo, id }),
  deletePromotion: async (id: string) => Promise.resolve(),
  generatePromoCode: async () => Promise.resolve('PROMO2024'),
  getPromotionStats: async (id: string) => Promise.resolve({
    totalUsage: 0,
    totalDiscount: 0,
    averageOrderValue: 0,
    conversionRate: 0,
  }),
};

export default marketingService; 