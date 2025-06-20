import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { orderService } from '../../services/orderService';
import { format } from 'date-fns';
import {
  ArrowLeftIcon,
  TruckIcon,
  CreditCardIcon,
  UserIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

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

// Define a minimal local Order type
interface Order {
  id: string;
  status: string;
  paymentStatus: string;
  items: any[];
  [key: string]: any;
}

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await orderService.getOrder(id);
      setOrder(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch order details. Please try again later.');
      console.error('Error fetching order:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    if (!order || !id) return;
    try {
      setIsUpdating(true);
      const updatedOrder = await orderService.updateOrderStatus(id, newStatus);
      setOrder(updatedOrder);
    } catch (err) {
      setError('Failed to update order status. Please try again later.');
      console.error('Error updating order status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentStatusUpdate = async (newStatus: Order['paymentStatus']) => {
    if (!order || !id) return;
    try {
      setIsUpdating(true);
      const updatedOrder = await orderService.updatePaymentStatus(id, newStatus);
      setOrder(updatedOrder);
    } catch (err) {
      setError('Failed to update payment status. Please try again later.');
      console.error('Error updating payment status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-darkest"></div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="vintage-card bg-status-red/10 border border-status-red text-status-red p-4">
          Order not found
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/orders')}
              className="vintage-button-icon"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-serif text-brown-darkest">
              Order #{order.orderNumber}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={order.status}
              onChange={(e) => handleStatusUpdate(e.target.value as Order['status'])}
              disabled={isUpdating}
              className="vintage-select"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={order.paymentStatus}
              onChange={(e) =>
                handlePaymentStatusUpdate(e.target.value as Order['paymentStatus'])
              }
              disabled={isUpdating}
              className="vintage-select"
            >
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="vintage-card">
              <h2 className="text-lg font-serif text-brown-darkest mb-4">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item: Order) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-4 border-b border-brown-light/20 last:border-0"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-brown-light/10 rounded"></div>
                      <div>
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-brown-light">
                          Quantity: {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${item.total.toFixed(2)}
                      </div>
                      <div className="text-sm text-brown-light">
                        ${item.price.toFixed(2)} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-brown-light/20">
                <div className="flex justify-between text-sm mb-2">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Shipping</span>
                  <span>${order.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium mt-4 pt-4 border-t border-brown-light/20">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="vintage-card">
              <div className="flex items-center space-x-2 mb-4">
                <UserIcon className="w-5 h-5 text-brown-light" />
                <h2 className="text-lg font-serif text-brown-darkest">
                  Customer
                </h2>
              </div>
              <div className="space-y-2">
                <div className="font-medium">{order.customerName}</div>
                <div className="text-brown-light">{order.customerEmail}</div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="vintage-card">
              <div className="flex items-center space-x-2 mb-4">
                <MapPinIcon className="w-5 h-5 text-brown-light" />
                <h2 className="text-lg font-serif text-brown-darkest">
                  Shipping Address
                </h2>
              </div>
              <div className="space-y-1">
                <div>{order.shippingAddress.street}</div>
                <div>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zipCode}
                </div>
                <div>{order.shippingAddress.country}</div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="vintage-card">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCardIcon className="w-5 h-5 text-brown-light" />
                <h2 className="text-lg font-serif text-brown-darkest">
                  Payment
                </h2>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-brown-light">Method</span>
                  <span>{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brown-light">Status</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      paymentStatusColors[order.paymentStatus as keyof typeof paymentStatusColors]
                    }`}
                  >
                    {order.paymentStatus.charAt(0).toUpperCase() +
                      order.paymentStatus.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="vintage-card">
              <div className="flex items-center space-x-2 mb-4">
                <TruckIcon className="w-5 h-5 text-brown-light" />
                <h2 className="text-lg font-serif text-brown-darkest">
                  Order Info
                </h2>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-brown-light">Order Date</span>
                  <span>
                    {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brown-light">Last Updated</span>
                  <span>
                    {format(new Date(order.updatedAt), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}; 