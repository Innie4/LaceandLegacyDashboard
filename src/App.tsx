import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/common/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// Product Management
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';

// Order Management
import OrderList from './pages/orders/OrderList';
import OrderDetails from './pages/orders/OrderDetails';

// Customer Management
import CustomerList from './pages/customers/CustomerList';
import CustomerDetails from './pages/customers/CustomerDetails';

// Inventory Management
import StockOverview from './pages/inventory/StockOverview';
import StockAdjustmentForm from './pages/inventory/StockAdjustmentForm';

// Analytics & Reports
import SalesReports from './pages/analytics/SalesReports';
import ProductPerformancePage from './pages/analytics/ProductPerformancePage';
import CustomerAnalytics from './pages/analytics/CustomerAnalytics';

// Content Management
import BlogManagement from './pages/content/BlogManagement';
import PageManagement from './pages/content/PageManagement';

// Marketing Tools
import Promotions from './pages/marketing/Promotions';
import EmailCampaigns from './pages/marketing/EmailCampaigns';

// Settings & Configuration
import StoreSettings from './pages/settings/StoreSettings';
import UserManagement from './pages/settings/UserManagement';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ProductList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/new"
            element={
              <ProtectedRoute>
                <ProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id"
            element={
              <ProtectedRoute>
                <ProductForm />
              </ProtectedRoute>
            }
          />

          {/* Order Management Routes */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />

          {/* Customer Management Routes */}
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <CustomerList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id"
            element={
              <ProtectedRoute>
                <CustomerDetails />
              </ProtectedRoute>
            }
          />

          {/* Inventory Management Routes */}
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <StockOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/adjust"
            element={
              <ProtectedRoute>
                <StockAdjustmentForm />
              </ProtectedRoute>
            }
          />

          {/* Analytics & Reports Routes */}
          <Route
            path="/analytics/sales"
            element={
              <ProtectedRoute>
                <SalesReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics/products"
            element={
              <ProtectedRoute>
                <ProductPerformancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics/customers"
            element={
              <ProtectedRoute>
                <CustomerAnalytics />
              </ProtectedRoute>
            }
          />

          {/* Content Management Routes */}
          <Route
            path="/content/blog"
            element={
              <ProtectedRoute>
                <BlogManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/content/pages"
            element={
              <ProtectedRoute>
                <PageManagement />
              </ProtectedRoute>
            }
          />

          {/* Marketing Tools Routes */}
          <Route
            path="/marketing/promotions"
            element={
              <ProtectedRoute>
                <Promotions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketing/email"
            element={
              <ProtectedRoute>
                <EmailCampaigns />
              </ProtectedRoute>
            }
          />

          {/* Settings & Configuration Routes */}
          <Route
            path="/settings/store"
            element={
              <ProtectedRoute>
                <StoreSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/users"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App; 