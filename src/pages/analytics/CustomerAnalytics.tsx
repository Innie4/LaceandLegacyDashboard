import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import analyticsService from '../../services/analyticsService';
import Layout from '../../components/common/Layout';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface CustomerMetrics {
  newCustomers: number;
  returningCustomers: number;
  totalCustomers: number;
  averageLifetimeValue: number;
  retentionRate: number;
  acquisitionCost: number;
}

interface GeographicData {
  region: string;
  customers: number;
  revenue: number;
}

interface RetentionData {
  cohort: string;
  retention: number[];
}

// Define minimal local types if needed
type AnalyticsFilters = { startDate: string; endDate: string };

const CustomerAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<AnalyticsFilters>({
    startDate: format(startOfDay(subDays(new Date(), 30)), 'yyyy-MM-dd'),
    endDate: format(endOfDay(new Date()), 'yyyy-MM-dd'),
  });
  const [metrics, setMetrics] = useState<CustomerMetrics | null>(null);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [retentionData, setRetentionData] = useState<RetentionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use mock data for both
      setMetrics({
        newCustomers: 20,
        returningCustomers: 80,
        totalCustomers: 100,
        averageLifetimeValue: 250,
        retentionRate: 75,
        acquisitionCost: 30,
      });
      setGeographicData([
        { region: 'USA', customers: 60, revenue: 15000 },
        { region: 'Canada', customers: 40, revenue: 10000 },
      ]);
      setRetentionData([{ cohort: 'All', retention: [0.8, 0.2] }]); // mock data
    } catch (err) {
      setError('Failed to fetch customer analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (range: { startDate: string; endDate: string }) => {
    setDateRange(range);
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
        <h1 className="text-2xl font-bold mb-6">Customer Analytics</h1>
        {renderDateRangeSelector()}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="brand-card">
            <h3 className="text-sm font-medium text-black">Total Customers</h3>
            <p className="text-2xl font-bold">
              {metrics?.totalCustomers.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-gray-500">
              {metrics?.newCustomers.toLocaleString() || '0'} new this period
            </p>
          </div>
          <div className="brand-card">
            <h3 className="text-sm font-medium text-black">Average Lifetime Value</h3>
            <p className="text-2xl font-bold">
              ${metrics?.averageLifetimeValue.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-gray-500">Per customer</p>
          </div>
          <div className="brand-card">
            <h3 className="text-sm font-medium text-black">Retention Rate</h3>
            <p className="text-2xl font-bold">
              {(metrics?.retentionRate || 0).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500">30-day retention</p>
          </div>
          <div className="brand-card">
            <h3 className="text-sm font-medium text-black">Customer Acquisition Cost</h3>
            <p className="text-2xl font-bold">
              ${metrics?.acquisitionCost.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-gray-500">Per new customer</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">New vs Returning Customers</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: 'New',
                        value: metrics?.newCustomers || 0,
                      },
                      {
                        name: 'Returning',
                        value: metrics?.returningCustomers || 0,
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    <Cell fill="#0088FE" />
                    <Cell fill="#00C49F" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Geographic Distribution</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={geographicData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="customers" fill="#8884d8" name="Customers" />
                  <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Retention by Cohort</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={retentionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cohort" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {retentionData[0]?.retention.map((_, index) => (
                    <Line
                      key={index}
                      type="monotone"
                      dataKey={`retention[${index}]`}
                      stroke={COLORS[index % COLORS.length]}
                      name={`Month ${index + 1}`}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Customer Segments</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">High Value</span>
                <span className="text-sm text-gray-500">
                  {Math.round((metrics?.totalCustomers || 0) * 0.2)} customers
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-vintage-600 h-2 rounded-full"
                  style={{ width: '20%' }}
                ></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Mid Value</span>
                <span className="text-sm text-gray-500">
                  {Math.round((metrics?.totalCustomers || 0) * 0.5)} customers
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-vintage-600 h-2 rounded-full"
                  style={{ width: '50%' }}
                ></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Low Value</span>
                <span className="text-sm text-gray-500">
                  {Math.round((metrics?.totalCustomers || 0) * 0.3)} customers
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-vintage-600 h-2 rounded-full"
                  style={{ width: '30%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerAnalytics; 