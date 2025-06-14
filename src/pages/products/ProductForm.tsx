import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Layout } from '../../components/layout/Layout';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface ProductFormData {
  name: string;
  sku: string;
  description: string;
  brand: string;
  category: string;
  regularPrice: number;
  salePrice?: number;
  costPrice: number;
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  images: string[];
  attributes: {
    size?: string[];
    color?: string[];
    material?: string;
    vintageYear?: number;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
  shipping: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    shippingClass: string;
  };
}

const defaultValues: ProductFormData = {
  name: '',
  sku: '',
  description: '',
  brand: '',
  category: '',
  regularPrice: 0,
  salePrice: 0,
  costPrice: 0,
  stock: 0,
  lowStockThreshold: 5,
  trackInventory: true,
  images: [],
  attributes: {
    size: [],
    color: [],
    material: '',
    vintageYear: new Date().getFullYear(),
  },
  seo: {
    metaTitle: '',
    metaDescription: '',
    keywords: '',
  },
  shipping: {
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
    },
    shippingClass: 'standard',
  },
};

const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues,
  });

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to save product
      console.log('Form data:', data);
      navigate('/products');
    } catch (error) {
      console.error('Error saving product:', error);
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
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/products')}
            className="text-brown-dark hover:text-brown-darkest"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-serif text-brown-darkest">
            {id ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Tabs */}
          <div className="border-b border-brown-lightest/20">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-brown-medium text-brown-darkest'
                      : 'border-transparent text-brown-dark hover:text-brown-darkest hover:border-brown-light'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Basic Information */}
          {activeTab === 'basic' && (
            <div className="vintage-card space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-brown-darkest mb-1">
                    Product Name
                  </label>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Product name is required' }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className="vintage-input w-full"
                        placeholder="Enter product name"
                      />
                    )}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-status-red">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-darkest mb-1">
                    SKU
                  </label>
                  <Controller
                    name="sku"
                    control={control}
                    rules={{ required: 'SKU is required' }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className="vintage-input w-full"
                        placeholder="Enter SKU"
                      />
                    )}
                  />
                  {errors.sku && (
                    <p className="mt-1 text-sm text-status-red">
                      {errors.sku.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-brown-darkest mb-1">
                    Description
                  </label>
                  <Controller
                    name="description"
                    control={control}
                    rules={{ required: 'Description is required' }}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={4}
                        className="vintage-input w-full"
                        placeholder="Enter product description"
                      />
                    )}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-status-red">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-darkest mb-1">
                    Brand
                  </label>
                  <Controller
                    name="brand"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className="vintage-input w-full"
                        placeholder="Enter brand name"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-darkest mb-1">
                    Category
                  </label>
                  <Controller
                    name="category"
                    control={control}
                    rules={{ required: 'Category is required' }}
                    render={({ field }) => (
                      <select {...field} className="vintage-select w-full">
                        <option value="">Select a category</option>
                        <option value="T-Shirts">T-Shirts</option>
                        <option value="Hoodies">Hoodies</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    )}
                  />
                  {errors.category && (
                    <p className="mt-1 text-sm text-status-red">
                      {errors.category.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pricing */}
          {activeTab === 'pricing' && (
            <div className="vintage-card space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-brown-darkest mb-1">
                    Regular Price
                  </label>
                  <Controller
                    name="regularPrice"
                    control={control}
                    rules={{ required: 'Regular price is required' }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        step="0.01"
                        className="vintage-input w-full"
                        placeholder="0.00"
                      />
                    )}
                  />
                  {errors.regularPrice && (
                    <p className="mt-1 text-sm text-status-red">
                      {errors.regularPrice.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-darkest mb-1">
                    Sale Price
                  </label>
                  <Controller
                    name="salePrice"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        step="0.01"
                        className="vintage-input w-full"
                        placeholder="0.00"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-darkest mb-1">
                    Cost Price
                  </label>
                  <Controller
                    name="costPrice"
                    control={control}
                    rules={{ required: 'Cost price is required' }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        step="0.01"
                        className="vintage-input w-full"
                        placeholder="0.00"
                      />
                    )}
                  />
                  {errors.costPrice && (
                    <p className="mt-1 text-sm text-status-red">
                      {errors.costPrice.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="vintage-button bg-cream-light text-brown-darkest hover:bg-cream-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="vintage-button"
            >
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ProductForm; 