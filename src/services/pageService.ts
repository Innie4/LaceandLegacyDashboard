import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: any; // JSON structure for page content
  status: 'draft' | 'published' | 'scheduled';
  template: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  revisions: PageRevision[];
}

export interface PageRevision {
  id: string;
  pageId: string;
  content: any;
  version: number;
  createdAt: string;
  createdBy: string;
}

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  structure: any; // JSON structure for template
  createdAt: string;
  updatedAt: string;
}

export interface PageFilters {
  search?: string;
  status?: string;
  template?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const pageService = {
  // Page CRUD operations
  async getPages(filters?: PageFilters): Promise<Page[]> {
    const response = await axios.get(`${API_URL}/pages`, { params: filters });
    return response.data;
  },

  async getPage(id: string): Promise<Page> {
    const response = await axios.get(`${API_URL}/pages/${id}`);
    return response.data;
  },

  async createPage(page: Partial<Page>): Promise<Page> {
    const response = await axios.post(`${API_URL}/pages`, page);
    return response.data;
  },

  async updatePage(id: string, page: Partial<Page>): Promise<Page> {
    const response = await axios.put(`${API_URL}/pages/${id}`, page);
    return response.data;
  },

  async deletePage(id: string): Promise<void> {
    await axios.delete(`${API_URL}/pages/${id}`);
  },

  // Template management
  async getTemplates(): Promise<PageTemplate[]> {
    const response = await axios.get(`${API_URL}/page-templates`);
    return response.data;
  },

  async createTemplate(template: Partial<PageTemplate>): Promise<PageTemplate> {
    const response = await axios.post(`${API_URL}/page-templates`, template);
    return response.data;
  },

  async updateTemplate(id: string, template: Partial<PageTemplate>): Promise<PageTemplate> {
    const response = await axios.put(`${API_URL}/page-templates/${id}`, template);
    return response.data;
  },

  async deleteTemplate(id: string): Promise<void> {
    await axios.delete(`${API_URL}/page-templates/${id}`);
  },

  // Version control
  async getRevisions(pageId: string): Promise<PageRevision[]> {
    const response = await axios.get(`${API_URL}/pages/${pageId}/revisions`);
    return response.data;
  },

  async restoreRevision(pageId: string, revisionId: string): Promise<Page> {
    const response = await axios.post(`${API_URL}/pages/${pageId}/restore/${revisionId}`);
    return response.data;
  },

  // SEO and slug management
  async generateSlug(title: string): Promise<string> {
    const response = await axios.post(`${API_URL}/pages/generate-slug`, { title });
    return response.data.slug;
  },

  async analyzeSEO(content: string): Promise<{
    wordCount: number;
    keywordDensity: Record<string, number>;
    readabilityScore: number;
    suggestions: string[];
  }> {
    const response = await axios.post(`${API_URL}/pages/analyze-seo`, { content });
    return response.data;
  },

  // Preview
  async getPreview(id: string): Promise<Page> {
    const response = await axios.get(`${API_URL}/pages/${id}/preview`);
    return response.data;
  },

  // Publish management
  async publishPage(id: string, publishDate?: string): Promise<Page> {
    const response = await axios.post(`${API_URL}/pages/${id}/publish`, { publishDate });
    return response.data;
  },

  async unpublishPage(id: string): Promise<Page> {
    const response = await axios.post(`${API_URL}/pages/${id}/unpublish`);
    return response.data;
  }
};

export default pageService; 