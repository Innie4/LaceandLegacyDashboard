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
  price: number;
  quantity: number;
  image: string;
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
      key: 'image',
      header: 'Image',
      sortable: false,
      render: (product: Product) => (
        <img src={product.image || '/placeholder.png'} alt={product.name} className="w-10 h-10 rounded object-cover" />
      )
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (product: Product) => <span>{product.name}</span>
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      render: (product: Product) => <span>${product.price.toFixed(2)}</span>
    },
    {
      key: 'quantity',
      header: 'Quantity',
      sortable: true,
      render: (product: Product) => <span>{product.quantity}</span>
    },
    {
      key: 'availability',
      header: 'Availability',
      sortable: false,
      render: (product: Product) => (
        <span className={product.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
          {product.quantity > 0 ? 'Available' : 'Out of Stock'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (product: Product) => (
        <div className="flex space-x-2">
          <button
            className="text-blue-600 hover:underline"
            onClick={() => navigate(`/products/${product.id}`)}
          >Edit</button>
          <button
            className="text-red-600 hover:underline"
            onClick={() => handleDelete(product.id)}
          >Delete</button>
        </div>
      )
    }
  ];

  // ...existing code...
  // Add handleDelete function for delete logic
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setIsLoading(true);
    setError(null);
    try {
      await productService.deleteProduct(id);
      fetchProducts();
    } catch (err) {
      setError('Failed to delete product');
    } finally {
      setIsLoading(false);
    }
  };

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