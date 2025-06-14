import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import analyticsService, {
  ProductPerformance,
  AnalyticsFilters,
} from '../../services/analyticsService';
import Layout from '../../components/common/Layout';

const ProductPerformancePage: React.FC = () => {
  const [dateRange, setDateRange] = useState<AnalyticsFilters>({
    startDate: format(startOfDay(subDays(new Date(), 30)), 'yyyy-MM-dd'),
    endDate: format(endOfDay(new Date()), 'yyyy-MM-dd'),
  });
  const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState<any[]>([]);
  const [inventoryTurnover, setInventoryTurnover] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProductPerformance;
    direction: 'asc' | 'desc';
  }>({ key: 'revenue', direction: 'desc' });

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [products, categories, turnover] = await Promise.all([
        analyticsService.getProductPerformance(dateRange),
        analyticsService.getCategoryPerformance(dateRange),
        analyticsService.getInventoryTurnover(dateRange),
      ]);
      setProductPerformance(products);
      setCategoryPerformance(categories);
      setInventoryTurnover(turnover);
    } catch (err) {
      setError('Failed to fetch product performance data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (range: { startDate: string; endDate: string }) => {
    setDateRange(range);
  };

  const handleSort = (key: keyof ProductPerformance) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedProducts = [...productPerformance].sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    }
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
  });

  const renderDateRangeSelector = () => (
    <div className="flex space-x-4 mb-6">
      <button
        onClick={() =>
          handleDateRangeChange({
            startDate: format(startOfDay(new Date()), 'yyyy-MM-dd'),
            endDate: format(endOfDay(new Date()), 'yyyy-MM-dd'),
          })
        }
        className="px-4 py-2 bg-vintage-600 text-white rounded hover:bg-vintage-700"
      >
        Today
      </button>
      <button
        onClick={() =>
          handleDateRangeChange({
            startDate: format(startOfDay(subDays(new Date(), 7)), 'yyyy-MM-dd'),
            endDate: format(endOfDay(new Date()), 'yyyy-MM-dd'),
          })
        }
        className="px-4 py-2 bg-vintage-600 text-white rounded hover:bg-vintage-700"
      >
        Last 7 Days
      </button>
      <button
        onClick={() =>
          handleDateRangeChange({
            startDate: format(startOfDay(subDays(new Date(), 30)), 'yyyy-MM-dd'),
            endDate: format(endOfDay(new Date()), 'yyyy-MM-dd'),
          })
        }
        className="px-4 py-2 bg-vintage-600 text-white rounded hover:bg-vintage-700"
      >
        Last 30 Days
      </button>
      <div className="flex items-center space-x-2">
        <input
          type="date"
          value={dateRange.startDate}
          onChange={(e) =>
            handleDateRangeChange({ ...dateRange, startDate: e.target.value })
          }
          className="border-gray-300 rounded-md shadow-sm focus:ring-vintage-500 focus:border-vintage-500"
        />
        <span>to</span>
        <input
          type="date"
          value={dateRange.endDate}
          onChange={(e) =>
            handleDateRangeChange({ ...dateRange, endDate: e.target.value })
          }
          className="border-gray-300 rounded-md shadow-sm focus:ring-vintage-500 focus:border-vintage-500"
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vintage-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-red-600 text-center">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Product Performance</h1>
        {renderDateRangeSelector()}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Category Performance</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                  <Bar dataKey="profit" fill="#82ca9d" name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Inventory Turnover</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={inventoryTurnover}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="turnover"
                    stroke="#8884d8"
                    name="Turnover Rate"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Product Performance</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      Product Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('revenue')}
                    >
                      Revenue
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('unitsSold')}
                    >
                      Units Sold
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('profit')}
                    >
                      Profit
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('profitMargin')}
                    >
                      Profit Margin
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${product.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.unitsSold.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${product.profit.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(product.profitMargin * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductPerformancePage; 