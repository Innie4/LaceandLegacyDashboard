// Mock settingsService for frontend-only use
export const settingsService = {
  getStoreSettings: async () => Promise.resolve({
    name: '',
    description: '',
    contact: { email: '', phone: '', address: '' },
    businessHours: {
      monday: { open: '', close: '', closed: false },
      tuesday: { open: '', close: '', closed: false },
      wednesday: { open: '', close: '', closed: false },
      thursday: { open: '', close: '', closed: false },
      friday: { open: '', close: '', closed: false },
      saturday: { open: '', close: '', closed: false },
      sunday: { open: '', close: '', closed: false },
    },
    timezone: 'UTC',
    currency: { code: 'USD', symbol: '$', position: 'before' as 'before', decimalPlaces: 2 },
    tax: { enabled: false, rate: 0, displayInclusive: false },
    shipping: { zones: [], methods: [] },
    payment: { gateways: [], defaultGateway: '' },
  }),
  getAdminUsers: async () => Promise.resolve([]),
  createAdminUser: async (user: any) => Promise.resolve({ ...user, id: '1' }),
  deleteAdminUser: async (id: string) => Promise.resolve(),
  enableTwoFactor: async (id: string) => Promise.resolve(),
  disableTwoFactor: async (id: string) => Promise.resolve(),
  getPermissions: async () => Promise.resolve([]),
}; 