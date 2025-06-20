// Mock contentService for frontend-only use
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: string;
  author: {
    id: string;
    name: string;
  };
  categories: Category[];
  tags: Tag[];
  featuredImage?: string;
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogImage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: string;
  template: string;
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogImage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface ContentFilters {
  status?: 'draft' | 'published' | 'scheduled';
  category?: string;
  tag?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

const contentService = {
  getBlogPosts: async () => Promise.resolve([]),
  createBlogPost: async (post: Partial<BlogPost>) => Promise.resolve({ ...post, id: '1' }),
  // Add other mock methods as needed
};

export default contentService; 