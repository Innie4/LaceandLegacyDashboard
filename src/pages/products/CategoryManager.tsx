import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import Layout from '../../components/common/Layout';

interface Category {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  children?: Category[];
  image?: string;
  seo?: {
    title: string;
    description: string;
    keywords: string;
  };
}

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    parentId: '',
    image: '',
    seo: {
      title: '',
      description: '',
      keywords: '',
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getCategories();
      setCategories(data);
    } catch (err) {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = (id: string) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      description: category.description,
      parentId: category.parentId || '',
      image: category.image || '',
      seo: category.seo || { title: '', description: '', keywords: '' },
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await productService.deleteCategory(id);
        fetchCategories();
      } catch (err) {
        setError('Failed to delete category');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await productService.updateCategory(editingCategory.id, form);
      } else {
        await productService.createCategory(form);
      }
      setEditingCategory(null);
      setForm({
        name: '',
        description: '',
        parentId: '',
        image: '',
        seo: { title: '', description: '', keywords: '' },
      });
      fetchCategories();
    } catch (err) {
      setError('Failed to save category');
    }
  };

  const renderCategoryTree = (categories: Category[], level = 0) => {
    return categories.map((category) => (
      <div key={category.id} style={{ marginLeft: `${level * 20}px` }}>
        <div className="flex items-center space-x-2 py-2">
          <button
            onClick={() => handleExpand(category.id)}
            className="text-vintage-600 hover:text-vintage-700"
          >
            {expandedCategories.includes(category.id) ? '▼' : '▶'}
          </button>
          <span>{category.name}</span>
          <button
            onClick={() => handleEdit(category)}
            className="text-vintage-600 hover:text-vintage-700"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(category.id)}
            className="text-red-600 hover:text-red-700"
          >
            Delete
          </button>
        </div>
        {expandedCategories.includes(category.id) && category.children && (
          <div>{renderCategoryTree(category.children, level + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Category Management</h1>
        <form onSubmit={handleSubmit} className="mb-8 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-vintage-500 focus:border-vintage-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-vintage-500 focus:border-vintage-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Parent Category</label>
            <select
              value={form.parentId}
              onChange={(e) => setForm({ ...form, parentId: e.target.value })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-vintage-500 focus:border-vintage-500"
            >
              <option value="">None</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="text"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-vintage-500 focus:border-vintage-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">SEO Title</label>
            <input
              type="text"
              value={form.seo.title}
              onChange={(e) => setForm({ ...form, seo: { ...form.seo, title: e.target.value } })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-vintage-500 focus:border-vintage-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">SEO Description</label>
            <textarea
              value={form.seo.description}
              onChange={(e) => setForm({ ...form, seo: { ...form.seo, description: e.target.value } })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-vintage-500 focus:border-vintage-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">SEO Keywords</label>
            <input
              type="text"
              value={form.seo.keywords}
              onChange={(e) => setForm({ ...form, seo: { ...form.seo, keywords: e.target.value } })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-vintage-500 focus:border-vintage-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-vintage-600 text-white rounded hover:bg-vintage-700"
          >
            {editingCategory ? 'Update Category' : 'Add Category'}
          </button>
        </form>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div>{renderCategoryTree(categories)}</div>
        )}
      </div>
    </Layout>
  );
};

export default CategoryManager; 