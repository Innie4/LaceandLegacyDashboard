import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { DataTable } from '../../components/common/DataTable';
import { MagnifyingGlassIcon, ArrowDownTrayIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { customerService, Customer, CustomerFilters } from '../../services/customerService';
import { format } from 'date-fns';

const statusColors = {
  active: 'bg-status-green/10 text-status-green',
  inactive: 'bg-status-gray/10 text-status-gray',
  blocked: 'bg-status-red/10 text-status-red',
};

const segmentColors = {
  new: 'bg-status-blue/10 text-status-blue',
  regular: 'bg-status-green/10 text-status-green',
  vip: 'bg-status-purple/10 text-status-purple',
};

const CustomerList: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CustomerFilters>({
    search: '',
    status: '',
    segment: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, [filters]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await customerService.getCustomers(filters);
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch customers. Please try again later.');
      console.error('Error fetching customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value }));
  };

  const handleSegmentChange = (value: string) => {
    setFilters((prev) => ({ ...prev, segment: value }));
  };

  const handleExport = async () => {
    try {
      const blob = await customerService.exportCustomers(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting customers:', err);
      setError('Failed to export customers. Please try again later.');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Customer',
      sortable: true,
      render: (customer: Customer) => (
        <div>
          <div className="font-medium">
            {customer.firstName} {customer.lastName}
          </div>
          <div className="text-sm text-brown-light">{customer.email}</div>
        </div>
      ),
    },
    {
      key: 'segment',
      header: 'Segment',
      sortable: true,
      render: (customer: Customer) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            segmentColors[customer.segment]
          }`}
        >
          {customer.segment.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'orders',
      header: 'Orders',
      sortable: true,
      render: (customer: Customer) => (
        <div>
          <div className="font-medium">{customer.totalOrders}</div>
          <div className="text-sm text-brown-light">
            ${customer.averageOrderValue.toFixed(2)} avg
          </div>
        </div>
      ),
    },
    {
      key: 'totalSpent',
      header: 'Total Spent',
      sortable: true,
      render: (customer: Customer) => (
        <div className="font-medium">${customer.totalSpent.toFixed(2)}</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (customer: Customer) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[customer.status]
          }`}
        >
          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
        </span>
      ),
    },
    {
      key: 'registrationDate',
      header: 'Registered',
      sortable: true,
      render: (customer: Customer) => (
        <div>
          <div className="font-medium">
            {format(new Date(customer.registrationDate), 'MMM d, yyyy')}
          </div>
          <div className="text-sm text-brown-light">
            {customer.lastOrderDate
              ? `Last order: ${format(
                  new Date(customer.lastOrderDate),
                  'MMM d, yyyy'
                )}`
              : 'No orders yet'}
          </div>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-serif text-brown-darkest">Customers</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleExport}
              className="vintage-button flex items-center space-x-2"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Export</span>
            </button>
            <button
              onClick={() => navigate('/customers/new')}
              className="vintage-button flex items-center space-x-2"
            >
              <UserPlusIcon className="w-5 h-5" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="vintage-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-brown-light absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search customers..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="vintage-input pl-10 w-full"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="vintage-select"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
            <select
              value={filters.segment}
              onChange={(e) => handleSegmentChange(e.target.value)}
              className="vintage-select"
            >
              <option value="">All Segments</option>
              <option value="new">New</option>
              <option value="regular">Regular</option>
              <option value="vip">VIP</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="vintage-card bg-status-red/10 border border-status-red text-status-red p-4">
            {error}
          </div>
        )}

        {/* Customers Table */}
        <DataTable
          columns={columns}
          data={customers}
          keyExtractor={(customer) => customer.id}
          onRowClick={(customer) => navigate(`/customers/${customer.id}`)}
          isLoading={isLoading}
          emptyMessage="No customers found"
        />
      </div>
    </Layout>
  );
};

export default CustomerList; 