import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import analyticsService, {
  SalesData,
  CategoryRevenue,
  CustomerSegment,
  AnalyticsFilters,
} from '../../services/analyticsService';
import Layout from '../../components/common/Layout';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const SalesReports: React.FC = () => {
  const [dateRange, setDateRange] = useState<AnalyticsFilters>({
    startDate: format(startOfDay(subDays(new Date(), 30)), 'yyyy-MM-dd'),
    endDate: format(endOfDay(new Date()), 'yyyy-MM-dd'),
  });
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [categoryRevenue, setCategoryRevenue] = useState<CategoryRevenue[]>([]);
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sales, categories, segments] = await Promise.all([
        analyticsService.getSalesReport(dateRange),
        analyticsService.getRevenueByCategory(dateRange),
        analyticsService.getRevenueByCustomerSegment(dateRange),
      ]);
      setSalesData(sales);
      setCategoryRevenue(categories);
      setCustomerSegments(segments);
    } catch (err) {
      setError('Failed to fetch sales data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (range: { startDate: string; endDate: string }) => {
    setDateRange(range);
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      const blob = await analyticsService.exportSalesReport(dateRange, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-report-${format}-${format(new Date(), 'yyyy-MM-dd')}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to export report');
    }
  };

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

  const renderExportButtons = () => (
    <div className="flex space-x-4 mb-6">
      <button
        onClick={() => handleExport('pdf')}
        className="px-4 py-2 bg-vintage-600 text-white rounded hover:bg-vintage-700"
      >
        Export PDF
      </button>
      <button
        onClick={() => handleExport('csv')}
        className="px-4 py-2 bg-vintage-600 text-white rounded hover:bg-vintage-700"
      >
        Export CSV
      </button>
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
        <h1 className="text-2xl font-bold mb-6">Sales Reports</h1>
        {renderDateRangeSelector()}
        {renderExportButtons()}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    name="Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#82ca9d"
                    name="Orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Revenue by Category</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryRevenue}
                    dataKey="revenue"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {categoryRevenue.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Customer Segments</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerSegments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                  <Bar
                    dataKey="averageOrderValue"
                    fill="#82ca9d"
                    name="Average Order Value"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Key Metrics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-vintage-50 rounded-lg">
                <h3 className="text-sm font-medium text-vintage-600">
                  Total Revenue
                </h3>
                <p className="text-2xl font-bold">
                  $
                  {salesData
                    .reduce((sum, data) => sum + data.revenue, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-vintage-50 rounded-lg">
                <h3 className="text-sm font-medium text-vintage-600">
                  Total Orders
                </h3>
                <p className="text-2xl font-bold">
                  {salesData
                    .reduce((sum, data) => sum + data.orders, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-vintage-50 rounded-lg">
                <h3 className="text-sm font-medium text-vintage-600">
                  Average Order Value
                </h3>
                <p className="text-2xl font-bold">
                  $
                  {(
                    salesData.reduce((sum, data) => sum + data.revenue, 0) /
                    salesData.reduce((sum, data) => sum + data.orders, 0)
                  ).toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-vintage-50 rounded-lg">
                <h3 className="text-sm font-medium text-vintage-600">
                  Top Category
                </h3>
                <p className="text-2xl font-bold">
                  {categoryRevenue[0]?.category || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SalesReports; 