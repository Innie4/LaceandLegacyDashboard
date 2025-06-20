import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import {Layout} from '../../components/layout/Layout';
import { DataTable, Column } from '../../components/common/DataTable';
import inventoryService from '../../services/inventoryService';
import { formatCurrency } from '../../utils/formatters';

// Define local types for StockAlert and StockMovement
interface StockAlert {
  id: string;
  product: string;
  productName: string;
  productId: string;
  currentStock: number;
  lowStockThreshold: number;
  reorderPoint: number;
  suggestedOrderQuantity: number;
  lastRestockDate: string;
  level: number;
}
interface StockMovement {
  id: string;
  product: string;
  productName: string;
  productId: string;
  quantity: number;
  date: string;
  type: string;
  createdAt: string;
  reason: string;
  reference: string;
  notes: string;
}

const StockOverview: React.FC = () => {
  const navigate = useNavigate();
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState('7d');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedDateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [alerts, movements] = await Promise.all([
        inventoryService.getStockAlerts(),
        inventoryService.getStockMovements(),
      ]);
      setStockAlerts(alerts);
      setStockMovements(movements);
      setError(null);
    } catch (err) {
      setError('Failed to fetch inventory data');
      console.error('Error fetching inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = (range: string): string => {
    const now = new Date();
    switch (range) {
      case '7d':
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case '30d':
        return new Date(now.setDate(now.getDate() - 30)).toISOString();
      case '90d':
        return new Date(now.setDate(now.getDate() - 90)).toISOString();
      default:
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
    }
  };

  const handleExport = async () => {
    try {
      const blob = new Blob(['Mock stock data'], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-export-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting inventory:', err);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    try {
      await inventoryService.importStock();
      setShowImportModal(false);
      setImportFile(null);
      fetchData();
      setError(null);
    } catch (err) {
      setError('Failed to import inventory data');
      console.error('Error importing inventory:', err);
    }
  };

  const stockAlertColumns: Column<StockAlert>[] = [
    {
      key: 'productName',
      header: 'Product',
      sortable: true,
      render: (item: StockAlert) => item.productName
    },
    {
      key: 'currentStock',
      header: 'Current Stock',
      sortable: true,
      render: (item: StockAlert) => (
        <span className="font-medium">{item.currentStock}</span>
      )
    },
    {
      key: 'lowStockThreshold',
      header: 'Low Stock Threshold',
      sortable: true,
      render: (item: StockAlert) => item.lowStockThreshold
    },
    {
      key: 'reorderPoint',
      header: 'Reorder Point',
      sortable: true,
      render: (item: StockAlert) => item.reorderPoint
    },
    {
      key: 'suggestedOrderQuantity',
      header: 'Suggested Order',
      sortable: true,
      render: (item: StockAlert) => item.suggestedOrderQuantity
    },
    {
      key: 'lastRestockDate',
      header: 'Last Restock',
      sortable: true,
      render: (item: StockAlert) => (
        <span>{item.lastRestockDate ? new Date(item.lastRestockDate).toLocaleDateString() : 'Never'}</span>
      )
    },
    {
      key: 'productId',
      header: 'Actions',
      sortable: false,
      render: (item: StockAlert) => (
        <button
          onClick={() => navigate(`/products/${item.productId}/edit`)}
          className="text-vintage-600 hover:text-vintage-700"
        >
          View Product
        </button>
      )
    }
  ];

  const stockMovementColumns: Column<StockMovement>[] = [
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      render: (item: StockMovement) => (
        <span>{new Date(item.createdAt).toLocaleString()}</span>
      )
    },
    {
      key: 'productName',
      header: 'Product',
      sortable: true,
      render: (item: StockMovement) => item.productName
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (item: StockMovement) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.type === 'in'
              ? 'bg-green-100 text-green-800'
              : item.type === 'out'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </span>
      )
    },
    {
      key: 'quantity',
      header: 'Quantity',
      sortable: true,
      render: (item: StockMovement) => (
        <span
          className={`font-medium ${
            item.type === 'in' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {item.type === 'in' ? '+' : '-'}
          {Math.abs(item.quantity)}
        </span>
      )
    },
    {
      key: 'reason',
      header: 'Reason',
      sortable: true,
      render: (item: StockMovement) => item.reason
    },
    {
      key: 'reference',
      header: 'Reference',
      sortable: true,
      render: (item: StockMovement) => item.reference
    },
    {
      key: 'notes',
      header: 'Notes',
      sortable: true,
      render: (item: StockMovement) => item.notes
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black">Inventory Overview</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-100"
            >
              <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
              Import
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-100"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Export
            </button>
            <button
              onClick={() => navigate('/inventory/adjust')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Adjust Stock
            </button>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="flex justify-end">
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Low Stock Alerts</h2>
            <DataTable<StockAlert>
              columns={stockAlertColumns}
              data={stockAlerts}
              keyExtractor={(item) => item.productId}
              isLoading={loading}
            />
          </div>
        </div>

        {/* Stock Movements */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Stock Movements</h2>
            <DataTable<StockMovement>
              columns={stockMovementColumns}
              data={stockMovements}
              keyExtractor={(item) => item.id}
              isLoading={loading}
            />
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Import Inventory
            </h3>
            <div className="mb-4">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-vintage-50 file:text-vintage-700 hover:file:bg-vintage-100"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importFile}
                className="px-4 py-2 text-sm font-medium text-white bg-vintage-600 border border-transparent rounded-md hover:bg-vintage-700 disabled:opacity-50"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default StockOverview; 