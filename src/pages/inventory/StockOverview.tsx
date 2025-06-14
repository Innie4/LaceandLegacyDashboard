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
import Layout from '../../components/common/Layout';
import { DataTable } from '../../components/common/DataTable';
import { inventoryService, StockAlert, StockMovement } from '../../services/inventoryService';
import { formatCurrency } from '../../utils/formatters';

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
        inventoryService.getStockMovements({
          startDate: getStartDate(selectedDateRange),
        }),
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
      const blob = await inventoryService.exportStock();
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
      const result = await inventoryService.importStock(importFile);
      if (result.success) {
        setShowImportModal(false);
        setImportFile(null);
        fetchData();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to import inventory data');
      console.error('Error importing inventory:', err);
    }
  };

  const stockAlertColumns = [
    {
      header: 'Product',
      accessor: 'productName',
    },
    {
      header: 'Current Stock',
      accessor: 'currentStock',
      cell: (value: number) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      header: 'Low Stock Threshold',
      accessor: 'lowStockThreshold',
    },
    {
      header: 'Reorder Point',
      accessor: 'reorderPoint',
    },
    {
      header: 'Suggested Order',
      accessor: 'suggestedOrderQuantity',
    },
    {
      header: 'Last Restock',
      accessor: 'lastRestockDate',
      cell: (value: string) => (
        <span>{value ? new Date(value).toLocaleDateString() : 'Never'}</span>
      ),
    },
    {
      header: 'Actions',
      cell: (row: StockAlert) => (
        <button
          onClick={() => navigate(`/products/${row.productId}/edit`)}
          className="text-vintage-600 hover:text-vintage-700"
        >
          View Product
        </button>
      ),
    },
  ];

  const stockMovementColumns = [
    {
      header: 'Date',
      accessor: 'createdAt',
      cell: (value: string) => (
        <span>{new Date(value).toLocaleString()}</span>
      ),
    },
    {
      header: 'Product',
      accessor: 'productName',
    },
    {
      header: 'Type',
      accessor: 'type',
      cell: (value: string) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value === 'in'
              ? 'bg-green-100 text-green-800'
              : value === 'out'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      cell: (value: number, row: StockMovement) => (
        <span
          className={`font-medium ${
            row.type === 'in' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {row.type === 'in' ? '+' : '-'}
          {Math.abs(value)}
        </span>
      ),
    },
    {
      header: 'Reason',
      accessor: 'reason',
    },
    {
      header: 'Reference',
      accessor: 'reference',
    },
    {
      header: 'Notes',
      accessor: 'notes',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Inventory Overview</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
              Import
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Export
            </button>
            <button
              onClick={() => navigate('/inventory/adjust')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-vintage-600 hover:bg-vintage-700"
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
            className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-vintage-500 focus:border-vintage-500 sm:text-sm rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Low Stock Alerts
              </h3>
            </div>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : error ? (
              <div className="text-center py-4 text-red-600">{error}</div>
            ) : stockAlerts.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No low stock alerts
              </div>
            ) : (
              <DataTable
                columns={stockAlertColumns}
                data={stockAlerts}
                keyField="productId"
              />
            )}
          </div>
        </div>

        {/* Stock Movement History */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center">
              <ArrowPathIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Stock Movement History
              </h3>
            </div>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : error ? (
              <div className="text-center py-4 text-red-600">{error}</div>
            ) : stockMovements.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No stock movements
              </div>
            ) : (
              <DataTable
                columns={stockMovementColumns}
                data={stockMovements}
                keyField="id"
              />
            )}
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