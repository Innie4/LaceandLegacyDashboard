import React, { useState, useEffect, useMemo } from 'react';
import { UserPlusIcon, ShieldCheckIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { settingsService } from '../../services/settingsService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import { toast } from 'react-hot-toast';
import { useDebounce } from '../../hooks/useDebounce';
import { format } from 'date-fns';

const ITEMS_PER_PAGE = 10;

interface UserResponse {
  users: AdminUser[];
  total: number;
}

interface SelectEvent {
  target: {
    value: string;
  };
}

// Minimal local type definitions for mock frontend
interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'manager' | 'staff';
  status: 'active' | 'inactive';
  lastLogin?: string;
  twoFactorEnabled?: boolean;
}

interface ActivityLog {
  id: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 300);

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, filters.role, filters.status, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getAdminUsers();
      setUsers(data);
      setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE));
      setTotalUsers(data.length);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string | SelectEvent) => {
    const actualValue = typeof value === 'string' ? value : value.target.value;
    setFilters(prev => ({ ...prev, [field]: actualValue }));
    setCurrentPage(1);
  };

  const handleUserSave = async (userData: Partial<AdminUser>) => {
    setIsSubmitting(true);
    if (selectedUser) {
      // No backend, just show success
      toast.success('User updated successfully (mock)');
    } else {
      await settingsService.createAdminUser(userData);
      toast.success('User created successfully (mock)');
    }
    setShowUserModal(false);
    fetchUsers();
    setIsSubmitting(false);
  };

  const handleUserDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      setIsSubmitting(true);
      await settingsService.deleteAdminUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle2FA = async (userId: string, enabled: boolean) => {
    setIsSubmitting(true);
    // No backend, just show success
    toast.success(`2FA ${enabled ? 'enabled' : 'disabled'} successfully (mock)`);
    fetchUsers();
    setIsSubmitting(false);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md ${
            currentPage === i
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex justify-between flex-1 sm:hidden">
          <Button
            variant="secondary"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * ITEMS_PER_PAGE, totalUsers)}
              </span>{' '}
              of <span className="font-medium">{totalUsers}</span> results
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </Button>
            {pages}
            <Button
              variant="secondary"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRightIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !users.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <Button
            variant="secondary"
            onClick={() => setShowActivityModal(true)}
            className="w-full sm:w-auto"
          >
            <ClockIcon className="w-5 h-5 mr-2" />
            View Activity Logs
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setSelectedUser(null);
              setShowUserModal(true);
            }}
            className="w-full sm:w-auto"
          >
            <UserPlusIcon className="w-5 h-5 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Search"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search by name or email"
          />
          <Select
            label="Role"
            value={filters.role}
            onChange={(value: string | SelectEvent) => handleFilterChange('role', value)}
            options={[
              { value: '', label: 'All Roles' },
              { value: 'super_admin', label: 'Super Admin' },
              { value: 'manager', label: 'Manager' },
              { value: 'staff', label: 'Staff' }
            ]}
          />
          <Select
            label="Status"
            value={filters.status}
            onChange={(value: string | SelectEvent) => handleFilterChange('status', value)}
            options={[
              { value: '', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                2FA
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.role === 'super_admin'
                      ? 'bg-purple-100 text-purple-800'
                      : user.role === 'manager'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.lastLogin ? format(new Date(user.lastLogin), 'MMM d, yyyy HH:mm') : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggle2FA(user.id, !user.twoFactorEnabled)}
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.twoFactorEnabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowUserModal(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleUserDelete(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {renderPagination()}
      </div>

      {/* User Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title={selectedUser ? 'Edit User' : 'Add User'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleUserSave({
              name: formData.get('name') as string,
              email: formData.get('email') as string,
              role: formData.get('role') as 'super_admin' | 'manager' | 'staff',
              status: formData.get('status') as 'active' | 'inactive'
            });
          }}
          className="space-y-4"
        >
          <Input
            label="Name"
            name="name"
            defaultValue={selectedUser?.name}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            defaultValue={selectedUser?.email}
            required
          />
          <Select
            label="Role"
            name="role"
            defaultValue={selectedUser?.role}
            onChange={(value: string | SelectEvent) => {
              const actualValue = typeof value === 'string' ? value : value.target.value;
              const form = document.querySelector('form');
              if (form) {
                const roleInput = form.querySelector('input[name="role"]');
                if (roleInput) {
                  (roleInput as HTMLInputElement).value = actualValue;
                }
              }
            }}
            options={[
              { value: 'super_admin', label: 'Super Admin' },
              { value: 'manager', label: 'Manager' },
              { value: 'staff', label: 'Staff' }
            ]}
            required
          />
          <Select
            label="Status"
            name="status"
            defaultValue={selectedUser?.status}
            onChange={(value: string | SelectEvent) => {
              const actualValue = typeof value === 'string' ? value : value.target.value;
              const form = document.querySelector('form');
              if (form) {
                const statusInput = form.querySelector('input[name="status"]');
                if (statusInput) {
                  (statusInput as HTMLInputElement).value = actualValue;
                }
              }
            }}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
            required
          />
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowUserModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Activity Logs Modal */}
      <Modal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        title="Activity Logs"
      >
        <div className="space-y-4">
          {activityLogs.map((log) => (
            <div key={log.id} className="border-b border-gray-200 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{log.userName}</p>
                  <p className="text-sm text-gray-500">
                    {log.action} {log.entity} {log.entityId}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}
                </p>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  IP: {log.ipAddress}
                </p>
                <p className="text-sm text-gray-600">
                  User Agent: {log.userAgent}
                </p>
                {Object.entries(log.details).map(([key, value]) => (
                  <p key={key} className="text-sm text-gray-600">
                    {key}: {JSON.stringify(value)}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement; 