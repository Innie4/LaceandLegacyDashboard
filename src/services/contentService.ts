import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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
  // Blog Posts
  getBlogPosts: async (filters?: ContentFilters) => {
    const response = await axios.get(`${API_URL}/content/blog`, { params: filters });
    return response.data;
  },

  getBlogPost: async (id: string) => {
    const response = await axios.get(`${API_URL}/content/blog/${id}`);
    return response.data;
  },

  createBlogPost: async (post: Partial<BlogPost>) => {
    const response = await axios.post(`${API_URL}/content/blog`, post);
    return response.data;
  },

  updateBlogPost: async (id: string, post: Partial<BlogPost>) => {
    const response = await axios.put(`${API_URL}/content/blog/${id}`, post);
    return response.data;
  },

  deleteBlogPost: async (id: string) => {
    const response = await axios.delete(`${API_URL}/content/blog/${id}`);
    return response.data;
  },

  // Pages
  getPages: async (filters?: ContentFilters) => {
    const response = await axios.get(`${API_URL}/content/pages`, { params: filters });
    return response.data;
  },

  getPage: async (id: string) => {
    const response = await axios.get(`${API_URL}/content/pages/${id}`);
    return response.data;
  },

  createPage: async (page: Partial<Page>) => {
    const response = await axios.post(`${API_URL}/content/pages`, page);
    return response.data;
  },

  updatePage: async (id: string, page: Partial<Page>) => {
    const response = await axios.put(`${API_URL}/content/pages/${id}`, page);
    return response.data;
  },

  deletePage: async (id: string) => {
    const response = await axios.delete(`${API_URL}/content/pages/${id}`);
    return response.data;
  },

  // Categories
  getCategories: async () => {
    const response = await axios.get(`${API_URL}/content/categories`);
    return response.data;
  },

  createCategory: async (category: Partial<Category>) => {
    const response = await axios.post(`${API_URL}/content/categories`, category);
    return response.data;
  },

  updateCategory: async (id: string, category: Partial<Category>) => {
    const response = await axios.put(`${API_URL}/content/categories/${id}`, category);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await axios.delete(`${API_URL}/content/categories/${id}`);
    return response.data;
  },

  // Tags
  getTags: async () => {
    const response = await axios.get(`${API_URL}/content/tags`);
    return response.data;
  },

  createTag: async (tag: Partial<Tag>) => {
    const response = await axios.post(`${API_URL}/content/tags`, tag);
    return response.data;
  },

  updateTag: async (id: string, tag: Partial<Tag>) => {
    const response = await axios.put(`${API_URL}/content/tags/${id}`, tag);
    return response.data;
  },

  deleteTag: async (id: string) => {
    const response = await axios.delete(`${API_URL}/content/tags/${id}`);
    return response.data;
  },

  // Media
  uploadMedia: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_URL}/content/media`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // SEO
  generateSEOSlug: async (title: string) => {
    const response = await axios.post(`${API_URL}/content/seo/slug`, { title });
    return response.data;
  },

  analyzeSEO: async (content: string) => {
    const response = await axios.post(`${API_URL}/content/seo/analyze`, { content });
    return response.data;
  },
};

export default contentService; 