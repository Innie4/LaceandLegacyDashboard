import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArchiveBoxIcon,
  ChartBarIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import LogoutDialog from '../LogoutDialog';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Products',
    path: '/products',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  }, []);

  useEffect(() => {
    if (!isSidebarOpen || window.innerWidth >= 1024) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [isSidebarOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-cream-lightest">
      {/* Minimal Header */}
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4">
        <Link to="/products" className="flex items-center space-x-2">
          <img src="/logo.jpg" alt="Lace & Legacy Logo" className="h-8 w-8 object-contain mr-2" />
          <h1 className="text-xl font-serif text-black">Lace & Legacy</h1>
        </Link>
        <button
          onClick={() => setShowLogoutDialog(true)}
          className="flex items-center space-x-3 px-4 py-2 rounded-md transition-colors duration-200 text-black hover:bg-gray-100 hover:text-black"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </header>
      {/* Main content */}
      <main className="p-4">
        {children}
      </main>
      <LogoutDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={() => {
          setShowLogoutDialog(false);
          handleLogout();
        }}
      />
    </div>
  );
}; 