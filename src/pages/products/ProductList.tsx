import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { DataTable, Column } from '../../components/common/DataTable';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { productService } from '../../services/productService';

// Define minimal local types for Product and ProductFilters
interface Product {
  id: string;
  name: string;
  status: string;
  [key: string]: any;
}
interface ProductFilters {
  [key: string]: any;
}

const statusColors = {
  active: 'bg-status-green/10 text-status-green',
  draft: 'bg-status-yellow/10 text-status-yellow',
  archived: 'bg-status-red/10 text-status-red',
};

const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: '',
    status: '',
    minPrice: 0,
    maxPrice: 0,
    inStock: undefined
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [filters, currentPage]);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await productService.getProducts();
      setProducts(result);
      setTotalPages(1);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: name === 'minPrice' || name === 'maxPrice' ? Number(value) : value
    }));
    setCurrentPage(1);
  };

  const handleBulkAction = async (action: string) => {
  // Bulk actions removed. Only single product delete/update allowed in minimal dashboard.
  };

  const handleQuickEdit = async (id: string, field: string, value: string) => {
    try {
      await productService.updateProduct(id, { [field]: value });
      fetchProducts();
    } catch (err) {
      setError('Failed to update product');
    }
    setEditingCell(null);
  };

  const columns: Column<Product>[] = [
    {
      key: 'select',
      header: 'Select',
      sortable: false,
      render: (product: Product) => (
        <input
          type="checkbox"
          checked={selectedProducts.includes(product.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedProducts([...selectedProducts, product.id]);
            } else {
              setSelectedProducts(selectedProducts.filter((id) => id !== product.id));
            }
          }}
        />
      )
    },
    {
      key: 'name',
      header: 'Product Name',
      sortable: true,
      render: (product: Product) => (
        <div className="flex items-center space-x-3">
          <img
            src={product.images[0] || '/placeholder.png'}
            alt={product.name}
            className="w-10 h-10 rounded object-cover"
          />
          <span>{product.name}</span>
        </div>
      )
    },
    {
      key: 'sku',
      header: 'SKU',
      sortable: true,
      render: (product: Product) => product.sku
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (product: Product) => product.category
    },
    {
      key: 'regularPrice',
      header: 'Price',
      sortable: true,
      render: (product: Product) => (
        <div>
          {editingCell?.id === product.id && editingCell?.field === 'price' ? (
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleQuickEdit(product.id, 'regularPrice', editValue)}
              autoFocus
            />
          ) : (
            <span onClick={() => { setEditingCell({ id: product.id, field: 'price' }); setEditValue(product.regularPrice.toFixed(2)); }}>
              ${product.regularPrice.toFixed(2)}
            </span>
          )}
          {product.salePrice && (
            <span className="ml-2 text-status-red">
              ${product.salePrice.toFixed(2)}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'stock',
      header: 'Stock',
      sortable: true,
      render: (product: Product) => (
        <span
          className={
            product.stock <= product.lowStockThreshold
              ? 'text-status-red'
              : ''
          }
        >
          {product.stock}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (product: Product) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[product.status as keyof typeof statusColors]
          }`}
        >
          {editingCell?.id === product.id && editingCell?.field === 'status' ? (
            <select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleQuickEdit(product.id, 'status', editValue)}
              autoFocus
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          ) : (
            <span onClick={() => { setEditingCell({ id: product.id, field: 'status' }); setEditValue(product.status); }}>
              {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
            </span>
          )}
        </span>
      )
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-serif text-black">Products</h1>
          <button
            onClick={() => navigate('/products/new')}
            className="brand-button flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Filters */}
        <div className="brand-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-900 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={handleFilterChange}
                name="search"
                className="brand-input pl-10 w-full"
              />
            </div>
            <select
              value={filters.category}
              onChange={handleFilterChange}
              name="category"
              className="brand-input"
            >
              <option value="">All Categories</option>
              <option value="T-Shirts">T-Shirts</option>
              <option value="Hoodies">Hoodies</option>
              <option value="Accessories">Accessories</option>
            </select>
            <select
              value={filters.status}
              onChange={handleFilterChange}
              name="status"
              className="brand-input"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {error && <div className="text-red-600">{error}</div>}

        <div className="vintage-card">
          <DataTable<Product>
            columns={columns}
            data={products}
            keyExtractor={(item) => item.id}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ProductList; 