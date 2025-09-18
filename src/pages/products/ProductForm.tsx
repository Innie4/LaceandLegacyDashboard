import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Layout } from '../../components/layout/Layout';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface ProductFormData {
  name: string;
  price: number;
  description: string;
  image: string;
}

const defaultValues: ProductFormData = {
  name: '',
  price: 0,
  description: '',
  image: '',
};

const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors }, reset } = useForm<ProductFormData>({ defaultValues });
  const [initialLoaded, setInitialLoaded] = useState(false);
  React.useEffect(() => {
    if (id && !initialLoaded) {
      setLoading(true);
      fetch(`https://likwapu-ecommerce-backend.fly.dev/api/products/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => {
          reset({ name: data.name, price: data.price, description: data.description, image: data.image });
        })
        .catch(() => setError('Failed to load product'))
        .finally(() => { setLoading(false); setInitialLoaded(true); });
    }
  }, [id, initialLoaded, reset]);

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const method = id ? 'PUT' : 'POST';
      const url = id
        ? `https://likwapu-ecommerce-backend.fly.dev/api/products/${id}`
        : `https://likwapu-ecommerce-backend.fly.dev/api/products`;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('API error');
      navigate('/products');
    } catch (error) {
      setError('Error saving product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Information' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'images', label: 'Images' },
    { id: 'attributes', label: 'Attributes' },
    { id: 'seo', label: 'SEO' },
    { id: 'shipping', label: 'Shipping' },
  ];

  return (
    <Layout>
      <div className="space-y-6 max-w-xl mx-auto">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/products')} className="text-brown-dark hover:text-brown-darkest">
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-serif text-brown-darkest">{id ? 'Edit Product' : 'Add New Product'}</h1>
        </div>
        {error && <div className="text-status-red">{error}</div>}
        {loading && <div>Loading...</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-brown-darkest mb-1">Product Name</label>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Product name is required' }}
              render={({ field }) => (
                <input {...field} type="text" className="vintage-input w-full" placeholder="Enter product name" />
              )}
            />
            {errors.name && <p className="mt-1 text-sm text-status-red">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-darkest mb-1">Price</label>
            <Controller
              name="price"
              control={control}
              rules={{ required: 'Price is required', min: 0 }}
              render={({ field }) => (
                <input {...field} type="number" step="0.01" className="vintage-input w-full" placeholder="0.00" />
              )}
            />
            {errors.price && <p className="mt-1 text-sm text-status-red">{errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-darkest mb-1">Description</label>
            <Controller
              name="description"
              control={control}
              rules={{ required: 'Description is required' }}
              render={({ field }) => (
                <textarea {...field} rows={4} className="vintage-input w-full" placeholder="Enter product description" />
              )}
            />
            {errors.description && <p className="mt-1 text-sm text-status-red">{errors.description.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-darkest mb-1">Image URL</label>
            <Controller
              name="image"
              control={control}
              rules={{ required: 'Image URL is required' }}
              render={({ field }) => (
                <input {...field} type="text" className="vintage-input w-full" placeholder="Paste image URL" />
              )}
            />
            {errors.image && <p className="mt-1 text-sm text-status-red">{errors.image.message}</p>}
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => navigate('/products')} className="vintage-button bg-cream-light text-brown-darkest hover:bg-cream-medium">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="vintage-button">{isSubmitting ? 'Saving...' : 'Save Product'}</button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ProductForm; 