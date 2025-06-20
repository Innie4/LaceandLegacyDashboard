// Mock inventoryService for frontend-only use
const inventoryService = {
  getStockAlerts: async () => [],
  adjustStock: async (adjustment: any) => Promise.resolve(),
  getStockMovements: async () => [],
  exportStock: async () => Promise.resolve(),
  importStock: async () => Promise.resolve(),
};
export default inventoryService; 