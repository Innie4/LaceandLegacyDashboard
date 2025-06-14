import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface Order {
  id: string;
  date: string;
  total: number;
  status: string;
  items: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string;
  orders: Order[];
}

const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        // TODO: Replace with actual API call
        const mockCustomer: Customer = {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          totalOrders: 5,
          totalSpent: 499.95,
          averageOrderValue: 99.99,
          lastOrderDate: '2024-03-15T10:00:00Z',
          orders: [
            {
              id: '1',
              date: '2024-03-15T10:00:00Z',
              total: 149.97,
              status: 'Completed',
              items: 3
            },
            {
              id: '2',
              date: '2024-03-01T14:30:00Z',
              total: 99.99,
              status: 'Completed',
              items: 2
            }
          ]
        };
        setCustomer(mockCustomer);
      } catch (err) {
        setError('Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">{error || 'Customer not found'}</p>
        <Button
          variant="primary"
          onClick={() => navigate('/customers')}
        >
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Customer Details
          </h1>
          <p className="text-gray-600">
            Customer since {formatDate(customer.lastOrderDate)}
          </p>
        </div>
        <div className="flex space-x-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/customers')}
          >
            Back to Customers
          </Button>
          <Button
            variant="primary"
            onClick={() => {/* TODO: Implement edit customer */}}
          >
            Edit Customer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Order History
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {customer.orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(order.date)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {order.items}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Customer Information
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                  <div className="mt-1">
                    <p className="text-sm text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                    <p className="text-sm text-gray-500">{customer.phone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Address</h3>
                  <div className="mt-1">
                    <p className="text-sm text-gray-900">{customer.address.street}</p>
                    <p className="text-sm text-gray-900">
                      {customer.address.city}, {customer.address.state} {customer.address.zipCode}
                    </p>
                    <p className="text-sm text-gray-900">{customer.address.country}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Order Statistics</h3>
                  <div className="mt-1 space-y-2">
                    <p className="text-sm text-gray-900">
                      Total Orders: {customer.totalOrders}
                    </p>
                    <p className="text-sm text-gray-900">
                      Total Spent: {formatCurrency(customer.totalSpent)}
                    </p>
                    <p className="text-sm text-gray-900">
                      Average Order Value: {formatCurrency(customer.averageOrderValue)}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Order</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(customer.lastOrderDate)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails; 