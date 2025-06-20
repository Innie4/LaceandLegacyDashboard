import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { DataTable } from '../../components/common/DataTable';
import { MagnifyingGlassIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { orderService } from '../../services/orderService';
import { format } from 'date-fns';

// Define minimal local types for Order and OrderFilters
interface Order {
  id: string;
  status: string;
  paymentStatus: string;
  [key: string]: any;
}
interface OrderFilters {
  [key: string]: any;
}

const statusColors = {
  pending: 'bg-status-yellow/10 text-status-yellow',
  processing: 'bg-status-blue/10 text-status-blue',
  shipped: 'bg-status-purple/10 text-status-purple',
  delivered: 'bg-status-green/10 text-status-green',
  cancelled: 'bg-status-red/10 text-status-red',
};

const paymentStatusColors = {
  pending: 'bg-status-yellow/10 text-status-yellow',
  paid: 'bg-status-green/10 text-status-green',
  failed: 'bg-status-red/10 text-status-red',
  refunded: 'bg-status-gray/10 text-status-gray',
};

const OrderList: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderFilters>({
    search: '',
    status: '',
    paymentStatus: '',
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await orderService.getOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch orders. Please try again later.');
      console.error('Error fetching orders:', err);
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

  const handlePaymentStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, paymentStatus: value }));
  };

  const handleExport = async () => {
    try {
      const blob = await orderService.exportOrders();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting orders:', err);
      setError('Failed to export orders. Please try again later.');
    }
  };

  const columns = [
    {
      key: 'orderNumber',
      header: 'Order #',
      sortable: true,
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
      render: (order: Order) => (
        <div>
          <div className="font-medium">{order.customerName}</div>
          <div className="text-sm text-brown-light">{order.customerEmail}</div>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      sortable: true,
      render: (order: Order) => (
        <div>
          <div className="font-medium">${order.total.toFixed(2)}</div>
          <div className="text-sm text-brown-light">
            {order.items.length} items
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (order: Order) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[order.status as keyof typeof statusColors]
          }`}
        >
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      sortable: true,
      render: (order: Order) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            paymentStatusColors[order.paymentStatus as keyof typeof paymentStatusColors]
          }`}
        >
          {order.paymentStatus.charAt(0).toUpperCase() +
            order.paymentStatus.slice(1)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      render: (order: Order) => (
        <div>
          <div className="font-medium">
            {format(new Date(order.createdAt), 'MMM d, yyyy')}
          </div>
          <div className="text-sm text-brown-light">
            {format(new Date(order.createdAt), 'h:mm a')}
          </div>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-serif text-black">Orders</h1>
          <button
            onClick={handleExport}
            className="brand-button flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>Export</span>
          </button>
        </div>

        {/* Filters */}
        <div className="brand-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-900 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="brand-input pl-10 w-full"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="brand-input"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filters.paymentStatus}
              onChange={(e) => handlePaymentStatusChange(e.target.value)}
              className="brand-input"
            >
              <option value="">All Payment Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="vintage-card bg-status-red/10 border border-status-red text-status-red p-4">
            {error}
          </div>
        )}

        {/* Orders Table */}
        <DataTable
          columns={columns}
          data={orders}
          keyExtractor={(order) => order.id}
          onRowClick={(order) => navigate(`/orders/${order.id}`)}
          isLoading={isLoading}
          emptyMessage="No orders found"
        />
      </div>
    </Layout>
  );
};

export default OrderList; 