// Mock pageService for frontend-only use
export interface Page {
  id: string;
  title: string;
  slug: string;
  content: any;
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
  revisions: any[];
}

const pageService = {
  getPages: async () => Promise.resolve([]),
  createPage: async (page: Partial<Page>) => Promise.resolve({ ...page, id: '1' }),
  // Add other mock methods as needed
};

export default pageService; 