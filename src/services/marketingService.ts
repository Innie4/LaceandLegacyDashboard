import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  template: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent';
  scheduleDate?: string;
  segment: {
    type: 'all' | 'filtered';
    filters?: Record<string, any>;
  };
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  abTest?: {
    variantA: {
      subject: string;
      content: string;
    };
    variantB: {
      subject: string;
      content: string;
    };
    winner?: 'A' | 'B';
  };
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  filters: Record<string, any>;
  customerCount: number;
  createdAt: string;
  updatedAt: string;
}

const marketingService = {
  // Promotion Management
  async getPromotions(): Promise<Promotion[]> {
    const response = await axios.get(`${API_URL}/promotions`);
    return response.data;
  },

  async createPromotion(promotion: Partial<Promotion>): Promise<Promotion> {
    const response = await axios.post(`${API_URL}/promotions`, promotion);
    return response.data;
  },

  async updatePromotion(id: string, promotion: Partial<Promotion>): Promise<Promotion> {
    const response = await axios.put(`${API_URL}/promotions/${id}`, promotion);
    return response.data;
  },

  async deletePromotion(id: string): Promise<void> {
    await axios.delete(`${API_URL}/promotions/${id}`);
  },

  async generatePromoCode(): Promise<string> {
    const response = await axios.post(`${API_URL}/promotions/generate-code`);
    return response.data.code;
  },

  // Email Campaign Management
  async getCampaigns(): Promise<EmailCampaign[]> {
    const response = await axios.get(`${API_URL}/email-campaigns`);
    return response.data;
  },

  async createCampaign(campaign: Partial<EmailCampaign>): Promise<EmailCampaign> {
    const response = await axios.post(`${API_URL}/email-campaigns`, campaign);
    return response.data;
  },

  async updateCampaign(id: string, campaign: Partial<EmailCampaign>): Promise<EmailCampaign> {
    const response = await axios.put(`${API_URL}/email-campaigns/${id}`, campaign);
    return response.data;
  },

  async deleteCampaign(id: string): Promise<void> {
    await axios.delete(`${API_URL}/email-campaigns/${id}`);
  },

  async sendCampaign(id: string): Promise<void> {
    await axios.post(`${API_URL}/email-campaigns/${id}/send`);
  },

  // Email Templates
  async getTemplates(): Promise<EmailTemplate[]> {
    const response = await axios.get(`${API_URL}/email-templates`);
    return response.data;
  },

  async createTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const response = await axios.post(`${API_URL}/email-templates`, template);
    return response.data;
  },

  async updateTemplate(id: string, template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const response = await axios.put(`${API_URL}/email-templates/${id}`, template);
    return response.data;
  },

  async deleteTemplate(id: string): Promise<void> {
    await axios.delete(`${API_URL}/email-templates/${id}`);
  },

  // Customer Segments
  async getSegments(): Promise<CustomerSegment[]> {
    const response = await axios.get(`${API_URL}/customer-segments`);
    return response.data;
  },

  async createSegment(segment: Partial<CustomerSegment>): Promise<CustomerSegment> {
    const response = await axios.post(`${API_URL}/customer-segments`, segment);
    return response.data;
  },

  async updateSegment(id: string, segment: Partial<CustomerSegment>): Promise<CustomerSegment> {
    const response = await axios.put(`${API_URL}/customer-segments/${id}`, segment);
    return response.data;
  },

  async deleteSegment(id: string): Promise<void> {
    await axios.delete(`${API_URL}/customer-segments/${id}`);
  },

  // Analytics
  async getPromotionStats(id: string): Promise<{
    totalUsage: number;
    totalDiscount: number;
    averageOrderValue: number;
    conversionRate: number;
  }> {
    const response = await axios.get(`${API_URL}/promotions/${id}/stats`);
    return response.data;
  },

  async getCampaignStats(id: string): Promise<{
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  }> {
    const response = await axios.get(`${API_URL}/email-campaigns/${id}/stats`);
    return response.data;
  }
};

export default marketingService; 