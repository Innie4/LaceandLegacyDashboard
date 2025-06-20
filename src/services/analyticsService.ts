// Mock analyticsService for frontend-only use
export interface DateRange {
  startDate: string;
  endDate: string;
}

const analyticsService = {
  getAnalytics: async (range: DateRange) => {
    // Return mock analytics data
    return Promise.resolve({
      sales: 1000,
      customers: 100,
      orders: 50,
    });
  },
};

export default analyticsService; 