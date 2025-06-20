import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import contentService, { ContentFilters, BlogPost, Category, Tag } from '../../services/contentService';
import Layout from '../../components/common/Layout';

const BlogManagement: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ContentFilters>({});
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Partial<BlogPost>>({
    title: '',
    content: '',
    excerpt: '',
    status: 'draft',
    categories: [],
    tags: [],
    featuredImage: '',
    seo: {
      title: '',
      description: '',
      keywords: '',
      ogImage: ''
    }
  });

  useEffect(() => {
    fetchPosts();
  }, [filters]);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      setPosts([]);
    } catch (err) {
      setError('Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ContentFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setForm({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      status: post.status,
      publishedAt: post.publishedAt || '',
      categories: post.categories,
      tags: post.tags,
      featuredImage: post.featuredImage || '',
      seo: {
        ...post.seo,
        ogImage: post.seo.ogImage || ''
      },
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setPosts(prev => prev.filter(post => post.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPost) {
      setPosts(prev => prev.map(post => post.id === selectedPost.id ? { ...selectedPost, ...form } as BlogPost : post));
    } else {
      setPosts(prev => [
        ...prev,
        { ...form, id: Math.random().toString(), author: { id: '1', name: 'Admin' }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: form.status || 'draft', categories: form.categories || [], tags: form.tags || [], seo: form.seo || { title: '', description: '', keywords: '', ogImage: '' } } as BlogPost
      ]);
    }
    setIsEditing(false);
    setSelectedPost(null);
    setForm({
      title: '',
      content: '',
      excerpt: '',
      status: 'draft',
      categories: [],
      tags: [],
      featuredImage: '',
      seo: {
        title: '',
        description: '',
        keywords: '',
        ogImage: ''
      }
    });
  };

  const handleImageUpload = async (file: File) => {
    setForm((prev) => ({ ...prev, featuredImage: URL.createObjectURL(file) }));
  };

  const handleSEOAnalysis = async () => {
    if (!form.content) return;
    console.log('SEO analysis: OK');
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm(prev => ({
      ...prev,
      status: e.target.value as 'draft' | 'published' | 'scheduled'
    }));
  };

  const handleCategoryChange = (categoryIds: string[]) => {
    const categories = categoryIds.map(id => ({
      id,
      name: '', // This will be populated when the post is loaded
      slug: '' // This will be populated when the post is loaded
    })) as Category[];
    setForm(prev => ({ ...prev, categories }));
  };

  const handleTagChange = (tagIds: string[]) => {
    const tags = tagIds.map(id => ({
      id,
      name: '', // This will be populated when the post is loaded
      slug: '' // This will be populated when the post is loaded
    })) as Tag[];
    setForm(prev => ({ ...prev, tags }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Blog Management</h1>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700"
          >
            New Post
          </button>
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        {isEditing ? (
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <ReactQuill
                  value={form.content}
                  onChange={(content) => setForm({ ...form, content })}
                  className="h-64 mb-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={handleStatusChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              {form.status === 'scheduled' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Publish Date</label>
                  <input
                    type="datetime-local"
                    value={form.publishedAt}
                    onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Featured Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  className="block w-full"
                />
                {form.featuredImage && (
                  <img
                    src={form.featuredImage}
                    alt="Featured"
                    className="mt-2 h-32 object-cover rounded"
                  />
                )}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">SEO Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">SEO Title</label>
                    <input
                      type="text"
                      value={form.seo?.title || ''}
                      onChange={(e) =>
                        setForm({ ...form, seo: { ...form.seo!, title: e.target.value } })
                      }
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Meta Description</label>
                    <textarea
                      value={form.seo?.description || ''}
                      onChange={(e) =>
                        setForm({ ...form, seo: { ...form.seo!, description: e.target.value } })
                      }
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Keywords</label>
                    <input
                      type="text"
                      value={form.seo?.keywords || ''}
                      onChange={(e) =>
                        setForm({ ...form, seo: { ...form.seo!, keywords: e.target.value } })
                      }
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSEOAnalysis}
                    className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700"
                  >
                    Analyze SEO
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedPost(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700"
                >
                  {selectedPost ? 'Update Post' : 'Create Post'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="mb-6 flex space-x-4">
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
              <input
                type="text"
                placeholder="Search posts..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Published
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post) => (
                    <tr key={post.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{post.title}</div>
                        <div className="text-sm text-gray-500">{post.excerpt}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            post.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : post.status === 'scheduled'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.author.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.publishedAt
                          ? format(new Date(post.publishedAt), 'MMM d, yyyy')
                          : 'Not published'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(post)}
                          className="text-brand-600 hover:text-brand-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default BlogManagement; 