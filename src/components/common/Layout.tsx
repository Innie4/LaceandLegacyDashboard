import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const navigation = [
    { name: 'Dashboard', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Orders', path: '/orders' },
    { name: 'Customers', path: '/customers' },
    { name: 'Inventory', path: '/inventory' },
    { name: 'Analytics', path: '/analytics/sales' },
    { name: 'Content', path: '/content/blog' },
    { name: 'Marketing', path: '/marketing/promotions' },
    { name: 'Settings', path: '/settings/store' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout; 